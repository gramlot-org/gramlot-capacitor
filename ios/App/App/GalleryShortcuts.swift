import AppIntents

@available(iOS 26.0, *)
struct OpenGalleryIntent: AppIntent {
    static var title: LocalizedStringResource = "Open gallery"
    static var description = IntentDescription("Open the gallery through Gramlot Data.")
    static var supportedModes: IntentModes { .foreground }

    @MainActor
    func perform() async throws -> some IntentResult {
        ShortcutStore.shared.enqueueGallery()
        return .result()
    }
}

@available(iOS 26.0, *)
struct GramlotAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: OpenGalleryIntent(), phrases: [
            "Open gallery in \(.applicationName)",
            "Show the gallery in \(.applicationName)"
        ], shortTitle: "Open gallery", systemImageName: "square.grid.2x2")
    }
}
