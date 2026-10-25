import Capacitor
import WebKit

@objc(GramlotShortcutsPlugin)
public final class GramlotShortcutsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GramlotShortcutsPlugin"
    public let jsName = "GramlotShortcuts"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "takePending", returnType: CAPPluginReturnPromise)
    ]
    private var observer: NSObjectProtocol?

    override public func load() {
        observer = NotificationCenter.default.addObserver(
            forName: ShortcutStore.changed, object: nil, queue: .main
        ) { [weak self] _ in
            self?.notifyListeners("requestAvailable", data: [:])
        }
    }

    @objc func takePending(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self,
                  let bridge = self.bridge,
                  self.webView?.url == bridge.config.appStartServerURL else {
                call.reject("Shortcut delivery is restricted to the configured entry page")
                return
            }
            if let request = ShortcutStore.shared.takePending() {
                call.resolve(["request": request])
            } else {
                call.resolve(["request": NSNull()])
            }
        }
    }

    deinit {
        if let observer = observer { NotificationCenter.default.removeObserver(observer) }
    }
}

@objc(GramlotLinksPlugin)
public final class GramlotLinksPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GramlotLinksPlugin"
    public let jsName = "GramlotLinks"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "takePending", returnType: CAPPluginReturnPromise)
    ]
    private var observer: NSObjectProtocol?

    override public func load() {
        observer = NotificationCenter.default.addObserver(
            forName: LinkStore.changed, object: nil, queue: .main
        ) { [weak self] _ in
            self?.notifyListeners("requestAvailable", data: [:])
        }
    }

    @objc func takePending(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self,
                  let bridge = self.bridge,
                  self.webView?.url == bridge.config.appStartServerURL else {
                call.reject("Link delivery is restricted to the configured entry page")
                return
            }
            if let request = LinkStore.shared.takePending() {
                call.resolve(["request": request])
            } else {
                call.resolve(["request": NSNull()])
            }
        }
    }

    deinit {
        if let observer = observer { NotificationCenter.default.removeObserver(observer) }
    }
}

final class DeviceBridgeViewController: CAPBridgeViewController {
    private let motionPlugin = GramlotMotionPlugin()
    private var shortcutObserver: NSObjectProtocol?
    private var linkObserver: NSObjectProtocol?

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(motionPlugin)
        bridge?.registerPluginInstance(GramlotSQLitePlugin())
        bridge?.registerPluginInstance(GramlotLinksPlugin())
        linkObserver = NotificationCenter.default.addObserver(
            forName: LinkStore.changed, object: nil, queue: .main
        ) { [weak self] _ in
            guard let self = self, let entry = self.bridge?.config.appStartServerURL else { return }
            if self.webView?.url != entry { self.webView?.load(URLRequest(url: entry)) }
        }
        if #available(iOS 26.0, *) {
            bridge?.registerPluginInstance(GramlotShortcutsPlugin())
            shortcutObserver = NotificationCenter.default.addObserver(
                forName: ShortcutStore.changed, object: nil, queue: .main
            ) { [weak self] _ in
                guard let self = self, let entry = self.bridge?.config.appStartServerURL else { return }
                // Bootstrap the Data consumer; the native layer never opens the gallery.
                if let current = self.webView?.url, current != entry {
                    self.webView?.load(URLRequest(url: entry))
                }
            }
        }
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        motionPlugin.refreshOrientation()
    }

    override func viewWillTransition(to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        super.viewWillTransition(to: size, with: coordinator)
        coordinator.animate(alongsideTransition: nil) { [weak self] _ in self?.motionPlugin.refreshOrientation() }
    }

    deinit {
        if let linkObserver = linkObserver { NotificationCenter.default.removeObserver(linkObserver) }
        if let shortcutObserver = shortcutObserver { NotificationCenter.default.removeObserver(shortcutObserver) }
    }
}
