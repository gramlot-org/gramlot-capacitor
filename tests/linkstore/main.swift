import Foundation
let suite = "gramlot.test.links.\(UUID().uuidString)"
let defaults = UserDefaults(suiteName: suite)!
defer { defaults.removePersistentDomain(forName: suite) }
let store = LinkStore(defaults: defaults)
let now = Date(timeIntervalSince1970: 1000)
let url = URL(string: LinkStore.allowedURL)!
assert(store.takePending(now: now) == nil)
for text in ["http://gallery-py.gramlot.dev/pages/01-inputs/04-colorpicker", LinkStore.allowedURL + "?x=1", LinkStore.allowedURL + "#x", "https://other.invalid/"] {
    assert(!store.enqueue(URL(string: text)!, now: now))
}
assert(store.enqueue(url, now: now))
let first = store.takePending(now: now)!
assert(first["url"] == LinkStore.allowedURL)
assert(store.takePending(now: now) == nil)
store.enqueue(url, now: now)
assert(store.takePending(now: now.addingTimeInterval(301)) == nil)
store.enqueue(url, now: now)
assert(store.takePending(now: now.addingTimeInterval(-1)) == nil)
store.enqueue(url, now: now)
let restored = LinkStore(defaults: defaults)
assert(restored.takePending(now: now)?["url"] == LinkStore.allowedURL)
print("Native link queue checks passed")
