import Foundation

final class LinkStore {
    static let shared = LinkStore(defaults: .standard)
    static let changed = Notification.Name("gramlotLinkQueued")
    static let allowedURL = "https://gallery-py.gramlot.dev/pages/01-inputs/04-colorpicker"
    private let defaults: UserDefaults
    private let key = "gramlot.pendingLink"

    init(defaults: UserDefaults) { self.defaults = defaults }

    @discardableResult
    func enqueue(_ url: URL, now: Date = Date()) -> Bool {
        guard url.absoluteString == Self.allowedURL else { return false }
        defaults.set(["id": UUID().uuidString, "url": url.absoluteString,
                      "createdAt": now.timeIntervalSince1970], forKey: key)
        NotificationCenter.default.post(name: Self.changed, object: self)
        return true
    }

    func takePending(now: Date = Date()) -> [String: String]? {
        guard let stored = defaults.dictionary(forKey: key) else { return nil }
        defaults.removeObject(forKey: key)
        guard let id = stored["id"] as? String,
              let url = stored["url"] as? String, url == Self.allowedURL,
              let createdAt = stored["createdAt"] as? Double,
              now.timeIntervalSince1970 >= createdAt,
              now.timeIntervalSince1970 - createdAt <= 300 else { return nil }
        return ["id": id, "url": url]
    }
}
