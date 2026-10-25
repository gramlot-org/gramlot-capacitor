import Foundation

@main
struct ShortcutStoreChecks {
    static func main() {
        let suite = "gramlot.shortcut.tests.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suite)!
        defer { defaults.removePersistentDomain(forName: suite) }
        let now = Date(timeIntervalSince1970: 1000)
        let store = ShortcutStore(defaults: defaults)
        precondition(store.takePending(now: now) == nil)
        store.enqueueGallery(now: now)
        let restored = ShortcutStore(defaults: UserDefaults(suiteName: suite)!)
        let first = restored.takePending(now: now)!
        precondition(first["destination"] == "gallery" && UUID(uuidString: first["id"]!) != nil)
        precondition(store.takePending(now: now) == nil)
        store.enqueueGallery(now: now)
        store.enqueueGallery(now: now.addingTimeInterval(1))
        precondition(store.takePending(now: now.addingTimeInterval(2))!["id"] != first["id"])
        precondition(store.takePending(now: now.addingTimeInterval(2)) == nil)
        store.enqueueGallery(now: now)
        precondition(store.takePending(now: now.addingTimeInterval(301)) == nil)
        store.enqueueGallery(now: now)
        precondition(store.takePending(now: now.addingTimeInterval(-1)) == nil)
        defaults.set(["id": "bad", "destination": "javascript:bad", "createdAt": 1000.0], forKey: "gramlot.pendingShortcut")
        precondition(store.takePending(now: now) == nil)
        print("Shortcut store: persistence, single consumption, replacement, expiry and invalid destination checks passed.")
    }
}
