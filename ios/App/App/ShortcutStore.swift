import Foundation

/// One pending delivery, owned by the native app until the page consumes it.
final class ShortcutStore {
    static let shared = ShortcutStore(defaults: .standard)
    static let changed = Notification.Name("gramlotShortcutQueued")
    private let defaults: UserDefaults
    private let key = "gramlot.pendingShortcut"

    init(defaults: UserDefaults) { self.defaults = defaults }

    func enqueueGallery(now: Date = Date()) {
        defaults.set(["id": UUID().uuidString, "destination": "gallery",
                      "createdAt": now.timeIntervalSince1970], forKey: key)
        NotificationCenter.default.post(name: Self.changed, object: self)
    }

    func takePending(now: Date = Date()) -> [String: String]? {
        guard let stored = defaults.dictionary(forKey: key) else { return nil }
        defaults.removeObject(forKey: key)
        guard let id = stored["id"] as? String,
              stored["destination"] as? String == "gallery",
              let createdAt = stored["createdAt"] as? Double,
              now.timeIntervalSince1970 >= createdAt,
              now.timeIntervalSince1970 - createdAt <= 300 else { return nil }
        return ["id": id, "destination": "gallery"]
    }
}
