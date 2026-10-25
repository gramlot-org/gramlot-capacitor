import Capacitor
import Foundation
import WebKit

@objc(GramlotSQLitePlugin)
public final class GramlotSQLitePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GramlotSQLitePlugin"
    public let jsName = "GramlotSQLite"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "query", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "execute", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "close", returnType: CAPPluginReturnPromise)
    ]
    private let queue = DispatchQueue(label: "dev.gramlot.sqlite")
    private var connections: [String: NativeDatabase] = [:]
    private var navigation: NSKeyValueObservation?
    override public func load() {
        DispatchQueue.main.async { [weak self] in
            self?.navigation = self?.webView?.observe(\.isLoading, options: [.new]) { [weak self] view, _ in
                if view.isLoading { self?.queue.async { [weak self] in self?.connections.removeAll() } }
            }
        }
    }
    @objc func open(_ call: CAPPluginCall) {
        guard let name = call.getString("name"), name.range(of: "^[A-Za-z][A-Za-z0-9_]{0,63}$", options: .regularExpression) != nil else { call.reject("Invalid database name"); return }
        queue.async {
            do {
                let root = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true).appendingPathComponent("GramlotDatabases", isDirectory: true)
                try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
                let database = try NativeDatabase(file: root.appendingPathComponent(name + ".sqlite"))
                let id = UUID().uuidString
                self.connections[id] = database
                call.resolve(["connection": id])
            } catch { call.reject(error.localizedDescription, "FAILED") }
        }
    }
    private func run(_ call: CAPPluginCall, returnsRows: Bool) {
        guard let id = call.getString("connection"), let sql = call.getString("sql"), let params = call.options["params"] else { call.reject("Invalid database operation"); return }
        queue.async {
            guard let database = self.connections[id] else { call.reject("Database connection is closed"); return }
            do {
                let rows = try database.run(sql, params: params)
                if returnsRows { call.resolve(["rows": rows]) } else { call.resolve() }
            } catch { call.reject(error.localizedDescription, "FAILED") }
        }
    }
    @objc func query(_ call: CAPPluginCall) { run(call, returnsRows: true) }
    @objc func execute(_ call: CAPPluginCall) { run(call, returnsRows: false) }
    @objc func close(_ call: CAPPluginCall) {
        guard let id = call.getString("connection") else { call.reject("Invalid connection"); return }
        queue.async { self.connections.removeValue(forKey: id)?.close(); call.resolve() }
    }
}
