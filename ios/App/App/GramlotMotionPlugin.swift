import Capacitor
import CoreMotion
import UIKit

/// One native manager shared by page-owned streams, including trusted child frames.
@objc(GramlotMotionPlugin)
public final class GramlotMotionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GramlotMotionPlugin"
    public let jsName = "GramlotMotion"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startOrientation", returnType: CAPPluginReturnCallback),
        CAPPluginMethod(name: "startGyroscope", returnType: CAPPluginReturnCallback),
        CAPPluginMethod(name: "startAccelerometer", returnType: CAPPluginReturnCallback),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise)
    ]
    private final class Session {
        let kind: String
        let call: CAPPluginCall
        var failed = false
        var watching: Bool?
        init(_ kind: String, _ call: CAPPluginCall) { self.kind = kind; self.call = call }
    }
    private let motion = CMMotionManager()
    private var sessions: [String: Session] = [:]
    private var observers: [NSObjectProtocol] = []
    private var navigation: NSKeyValueObservation?
    private var foreground = false
    private var lastOrientation: UIInterfaceOrientation?

    override public func load() {
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.foreground = UIApplication.shared.applicationState == .active
            self.motion.gyroUpdateInterval = 0.1
            self.motion.accelerometerUpdateInterval = 0.1
            for (name, active) in [(UIApplication.willResignActiveNotification, false),
                                   (UIApplication.didBecomeActiveNotification, true)] {
                self.observers.append(NotificationCenter.default.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in
                    guard let self else { return }
                    self.foreground = active
                    self.reconcile()
                    if active { self.refreshOrientation() }
                })
            }
            self.navigation = self.webView?.observe(\.isLoading, options: [.new]) { [weak self] view, _ in
                if view.isLoading { self?.closeAll() }
            }
        }
    }

    @objc func startOrientation(_ call: CAPPluginCall) { start("orientation", call) }
    @objc func startGyroscope(_ call: CAPPluginCall) { start("gyroscope", call) }
    @objc func startAccelerometer(_ call: CAPPluginCall) { start("accelerometer", call) }

    private func start(_ kind: String, _ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            if (kind == "gyroscope" && !self.motion.isGyroAvailable) ||
               (kind == "accelerometer" && !self.motion.isAccelerometerAvailable) {
                call.reject("The device does not provide this sensor", "UNAVAILABLE")
                return
            }
            if kind == "orientation" && self.currentOrientation() == nil {
                call.reject("Screen orientation is unavailable", "UNAVAILABLE")
                return
            }
            call.keepAlive = true
            self.sessions[call.callbackId] = Session(kind, call)
            if kind == "orientation" {
                self.sendOrientation(call)
            } else {
                self.reconcile()
                if let session = self.sessions[call.callbackId] {
                    self.reportState(session, self.active(kind))
                }
            }
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self, let id = call.getString("id") else {
                call.reject("A stream id is required")
                return
            }
            if let session = self.sessions.removeValue(forKey: id) { self.release(session) }
            self.reconcile()
            call.resolve()
        }
    }

    private func active(_ kind: String) -> Bool {
        kind == "gyroscope" ? motion.isGyroActive : motion.isAccelerometerActive
    }

    private func reconcile() {
        for kind in ["gyroscope", "accelerometer"] {
            let wanted = foreground && sessions.values.contains { $0.kind == kind && !$0.failed }
            let wasActive = active(kind)
            if wanted && !wasActive {
                if kind == "gyroscope" {
                    motion.startGyroUpdates(to: .main) { [weak self] data, error in
                        guard let self else { return }
                        if let error { self.fail(kind, error); return }
                        if let data { self.sample(kind, data.rotationRate.x, data.rotationRate.y, data.rotationRate.z, data.timestamp) }
                    }
                } else {
                    motion.startAccelerometerUpdates(to: .main) { [weak self] data, error in
                        guard let self else { return }
                        if let error { self.fail(kind, error); return }
                        if let data { self.sample(kind, data.acceleration.x, data.acceleration.y, data.acceleration.z, data.timestamp) }
                    }
                }
            } else if !wanted && wasActive {
                if kind == "gyroscope" { motion.stopGyroUpdates() } else { motion.stopAccelerometerUpdates() }
            }
            if wasActive != active(kind) {
                for session in sessions.values where session.kind == kind && !session.failed {
                    reportState(session, active(kind))
                }
            }
        }
    }

    private func reportState(_ session: Session, _ watching: Bool) {
        guard session.watching != watching else { return }
        session.watching = watching
        session.call.resolve(["kind": "state", "watching": watching])
    }

    private func sample(_ kind: String, _ x: Double, _ y: Double, _ z: Double, _ time: TimeInterval) {
        guard foreground, active(kind) else { return }
        let timestamp = (Date().timeIntervalSince1970 - ProcessInfo.processInfo.systemUptime + time) * 1000
        for session in sessions.values where session.kind == kind && !session.failed {
            // Core Motion may still report inactive when start returns. Receiving a
            // sample confirms activation; deliver that state before the measurement.
            reportState(session, true)
            session.call.resolve(["kind": "sample", "x": x, "y": y, "z": z, "timestamp": timestamp])
        }
    }

    private func fail(_ kind: String, _ error: Error) {
        let native = error as NSError
        let code = native.domain == CMErrorDomain && native.code == Int(CMErrorMotionActivityNotAuthorized.rawValue)
            ? "PERMISSION_DENIED" : "FAILED"
        for session in sessions.values where session.kind == kind && !session.failed {
            session.failed = true
            session.call.resolve(["kind": "error", "error": ["code": code, "message": error.localizedDescription]])
        }
        reconcile()
    }

    private func currentOrientation() -> UIInterfaceOrientation? {
        guard let value = bridge?.viewController?.view.window?.windowScene?.interfaceOrientation,
              value != .unknown else { return nil }
        return value
    }

    private func sendOrientation(_ call: CAPPluginCall) {
        guard let orientation = currentOrientation() else { return }
        call.resolve(["type": orientation.isPortrait ? "portrait" : "landscape",
                      "direction": orientation == .portrait || orientation == .landscapeLeft ? "primary" : "secondary",
                      "timestamp": Date().timeIntervalSince1970 * 1000])
    }

    func refreshOrientation() {
        guard let orientation = currentOrientation(), orientation != lastOrientation else { return }
        lastOrientation = orientation
        for session in sessions.values where session.kind == "orientation" { sendOrientation(session.call) }
    }

    private func release(_ session: Session) {
        session.call.keepAlive = false
        bridge?.releaseCall(session.call)
    }

    private func closeAll() {
        motion.stopGyroUpdates()
        motion.stopAccelerometerUpdates()
        for session in sessions.values { release(session) }
        sessions.removeAll()
    }

    deinit {
        motion.stopGyroUpdates()
        motion.stopAccelerometerUpdates()
        for observer in observers { NotificationCenter.default.removeObserver(observer) }
    }
}
