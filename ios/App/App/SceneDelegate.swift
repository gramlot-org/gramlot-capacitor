import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        for activity in connectionOptions.userActivities {
            if activity.activityType == NSUserActivityTypeBrowsingWeb, let url = activity.webpageURL {
                LinkStore.shared.enqueue(url)
            }
        }
        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = DeviceBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
           let url = userActivity.webpageURL, LinkStore.shared.enqueue(url) { return }
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
