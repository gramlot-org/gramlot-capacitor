"""Shared Python Source for the separate, Data-driven device examples."""
from gramlot import Page as BasePage, endpoint
from genro_bag import Bag
from gramlot.collections.inputs import mygramlot as inputs
from gramlot.collections.layout import mygramlot as layout
from mobile_application import CATALOG


EXAMPLES = tuple((entry['id'], entry['title']) for entry in CATALOG['entries'])


class DevicePage(BasePage):
    gramlots = [inputs, layout]
    css = ("/themes/gramlot-base/theme.css", "/themes/gramlot-compact/theme.css", "/themes/mela/theme.css", "/index.css")
    push_register = None

    def main(self, root):
        root.dataController(func="deviceAttach", _init=True, notificationId=1,
                            notificationTitle="Gramlot PoC", notificationBody="This notification comes from Data. Tap to return to the example.",
                            notificationDelay=5)
        root.dataController(func="deviceOpenShortcut", request="^gramlot.device.shortcuts.request")
        root.dataController(func="deviceLifecycleEvent", sequence="^gramlot.device.lifecycle.sequence",
                            event="=gramlot.device.lifecycle.event")
        page = root.main(class_="device-page")
        page.p("GRAMLOT / MOBILE APPLICATION", class_="eyebrow")
        page.h1(self.title)
        page.nav().a("All examples", href="./index")
        self.example(page)
        links = page.nav()
        links.a("All examples", href="./index")
        links.a("Official gallery", href="https://gallery-py.gramlot.dev/")

    def clipboard(self, page):
        clipboard = page.section(class_="device-card")
        clipboard.h2("Clipboard: copy and paste")
        clipboard.p("Edit the text and tap Copy. Paste it into another app, or copy from another app and tap Paste here.")
        clipboard.textBoxArea(value="^gramlot.device.clipboard?text", live=True, lbl="Text to copy", rows=3)
        clipboard.dataFormula("view.clipboard.pending", func="devicePending", status="^gramlot.device.clipboard?status")
        clipboard.button("Copy text", action="deviceCopyText", disabled="^view.clipboard.pending")
        clipboard.button("Paste text", action="devicePasteText", disabled="^view.clipboard.pending")
        self.state(clipboard, "clipboard")
        clipboard.p("Operation:")
        clipboard.span("^gramlot.device.clipboard?operation")
        clipboard.textBoxArea(value="^gramlot.device.clipboard.text", readonly=True, lbl="Result in Data", rows=3)
        clipboard.p("Paste reads the clipboard only when requested. iOS may ask for permission. This example accepts plain text; the content stays on the page and is not sent to the server.", class_="note")

    def transform(self, page):
        transform = page.section(class_="device-card")
        transform.dataFormula("view.camera.pending", func="devicePending", status="^gramlot.device.camera?status")
        transform.h2("Move, rotate and zoom")
        transform.p("Drag with one finger to move. Use two fingers to move, rotate and zoom together. The photo and rectangle share the same four Data values.")
        for name, value in (("x", 0), ("y", 0), ("rotate", 0), ("zoom", 1)):
            transform.dataSetter(f"view.transform.{name}", value)
            transform.numberTextBox(value=f"^view.transform.{name}", lbl=name, validate_notnull=True,
                                    connect_onchange="transformReleased")
        transform.dataSetter("view.transform.releases", 0)
        transform.dataController(func="transformReceived", subscribe_transformReleased=True)
        transform.dataFormula("view.transform.css", func="transformCss", x="^view.transform.x",
                              y="^view.transform.y", rotate="^view.transform.rotate", zoom="^view.transform.zoom")
        transform.horizontalSlider(value="^view.transform.zoom", min=0.5, max=3, step=0.01,
                                   live=True, lbl="Zoom", connect_onchange="transformReleased")
        transform.button("Take a test photo", action="deviceCapture", disabled="^view.camera.pending")
        transform.button("Choose from library", action="deviceChoosePhoto", disabled="^view.camera.pending")
        for kind, label in (("photo", "Photo"), ("rectangle", "Rectangle")):
            transform.p(label)
            pane = transform.transformPane(x="^view.transform.x", y="^view.transform.y",
                rotate="^view.transform.rotate", zoom="^view.transform.zoom", min=0.5, max=3, step=0.01,
                onEnd="transformReleased", class_="transform-demo", aria_label=f"Transform: {label}")
            if kind == "photo":
                pane.img(src="^gramlot.device.camera.url", alt="Photo to transform",
                         class_="transform-photo", transform="^view.transform.css", draggable="false")
            else:
                pane.div("Gramlot", class_="transform-rectangle", transform="^view.transform.css")
        transform.p("Take or choose a photo for the first panel. The rectangle is ready to use. Coordinates are in pixels and rotation is in degrees.", class_="note")
        transform.p("Last publish (x, y, rotate, zoom):")
        for name in ("x", "y", "rotate", "zoom"):
            transform.span(f"{name}: ")
            transform.span(f"^view.transform.last.{name}")
            transform.br()
        transform.p("Received publications:")
        transform.span("^view.transform.releases")
        transform.p("A publish is sent when you lift all fingers. An interrupted gesture retains the Data without publishing. You can edit the same values in the number fields.", class_="note")

    def audio(self, page):
        audio = page.section(class_="device-card")
        audio.h2("Audio recording")
        audio.p("Tap Record, say a short sentence, then Stop and use the player to listen. The file stays on the device unless you choose to share it.")
        audio.dataFormula("view.audio.busy", func="deviceAudioBusy", status="^gramlot.device.audio?status", shareStatus="^gramlot.device.audio?shareStatus")
        audio.dataFormula("view.audio.stopDisabled", func="deviceAudioCanStop", status="^gramlot.device.audio?status")
        audio.dataFormula("view.audio.cancelDisabled", func="deviceAudioCanCancel", status="^gramlot.device.audio?status", shareStatus="^gramlot.device.audio?shareStatus")
        audio.button("Record audio", action="deviceAudioStart", disabled="^view.audio.busy")
        audio.button("Stop recording", action="deviceAudioStop", disabled="^view.audio.stopDisabled")
        audio.button("Cancel audio", action="deviceAudioCancel", disabled="^view.audio.cancelDisabled")
        audio.dataFormula("view.audio.shareDisabled", func="deviceAudioShareDisabled", status="^gramlot.device.audio?status", shareStatus="^gramlot.device.audio?shareStatus")
        audio.button("Share audio", action="deviceAudioShare", disabled="^view.audio.shareDisabled")
        self.state(audio, "audio")
        audio.span("Microphone recording: ")
        audio.span("^gramlot.device.audio?recording")
        self.fields(audio, "audio", ("mimeType", "duration"))
        audio.p("Sharing status:")
        audio.span("^gramlot.device.audio?shareStatus")
        audio.dataFormula("view.audio.shareError", func="deviceError", error="^gramlot.device.audio?shareError")
        audio.p("^view.audio.shareError", class_="error")
        audio.p("Selected activity:")
        audio.span("^gramlot.device.audio?shareActivity")
        audio.p("Share opens the iOS share sheet: choose where to save or send the file. Success means the activity completed; it does not confirm delivery.", class_="note")
        audio.audio(src="^gramlot.device.audio.url", controls=True, preload="none", class_="device-audio")
        audio.p("Duration is in milliseconds. Cancel, a new recording or closing the page deletes the test file. Leaving the app cancels an active recording.", class_="note")

    def network(self, page):
        network = page.section(class_="device-card")
        network.h2("Network")
        network.p("Events update Data automatically. Connected indicates a network connection, not server reachability.")
        self.fields(network, "network", ("connected", "type"))
        self.state(network, "network")
        network.span("Listening: ")
        network.span("^gramlot.device.network?listening")

    def lifecycle(self, page):
        lifecycle = page.section(class_="device-card")
        lifecycle.h2("App lifecycle")
        lifecycle.p("Go to the Home Screen and return to the app: a dataController counts pauses and resumes. Active=false can also indicate an open iOS sheet.")
        self.fields(lifecycle, "lifecycle", ("active", "event", "sequence"))
        self.state(lifecycle, "lifecycle")
        lifecycle.span("Listening: ")
        lifecycle.span("^gramlot.device.lifecycle?listening")
        lifecycle.p("Pauses observed by the page:")
        lifecycle.span("^view.lifecycle.pauses")
        lifecycle.p("Resumes observed by the page:")
        lifecycle.span("^view.lifecycle.resumes")

    def haptics(self, page):
        haptics = page.section(class_="device-card")
        haptics.h2("Haptic feedback")
        haptics.dataFormula("view.haptics.pending", func="devicePending", status="^gramlot.device.haptics?status")
        for label, style in (("Light", "light"), ("Medium", "medium"), ("Heavy", "heavy")):
            haptics.button(label, action="deviceImpact", intensity=style, disabled="^view.haptics.pending")
        haptics.button("Vibrate for 600 ms", action="deviceVibrate", disabled="^view.haptics.pending")
        self.state(haptics, "haptics")
        self.fields(haptics, "haptics", ("style", "duration", "acknowledged"))
        haptics.p("Success confirms the native call. A device without haptic support may produce no physical feedback.", class_="note")

    def shortcuts(self, page):
        shortcuts = page.section(class_="device-card")
        shortcuts.h2("Shortcuts")
        shortcuts.p("Open Shortcuts → Gramlot PoC → Open gallery. The request goes through Data before navigation.")
        self.fields(shortcuts, "shortcuts.request", ("id", "destination"))
        shortcuts.span("^gramlot.device.shortcuts?listening")
        shortcuts.dataFormula("view.shortcuts.listenerError", func="deviceError", error="^gramlot.device.shortcuts?listenerError")
        shortcuts.p("^view.shortcuts.listenerError", class_="error")
        shortcuts.p("^view.shortcuts.error", class_="error")

    def app(self, page):
        app = page.section(class_="device-card")
        app.h2("App information")
        app.button("Refresh appinfo", action="deviceRefresh", name="appinfo")
        self.fields(app, "appinfo", ("id", "name", "version", "build"))
        self.state(app, "appinfo")

    def location(self, page):
        location = page.section(class_="device-card")
        location.h2("Location")
        location.checkbox(value="^gramlot.device.location?enabled", mode="switch", label="Enable continuous updates")
        listening = location.p(class_="listening")
        listening.span("Watching: ")
        listening.span("^gramlot.device.location?watching")
        location.button("Read location", action="deviceRefresh", name="location")
        location.button("Invalidate cache", action="deviceInvalidate", name="location")
        self.fields(location, "location", ("latitude", "longitude", "accuracy", "timestamp"))
        self.state(location, "location")
        page.p("Location stays on the device: this page does not send it to the server.", class_="note")

    def camera(self, page):
        camera = page.section(class_="device-card")
        camera.h2("Camera and photo library")
        camera.p("Take or choose a library photo: the preview uses the same Data and is not sent to the server. Cancelling keeps the last valid photo.")
        camera.dataFormula("view.camera.pending", func="devicePending", status="^gramlot.device.camera?status")
        camera.button("Take photo", action="deviceCapture", disabled="^view.camera.pending")
        camera.button("Choose from library", action="deviceChoosePhoto", disabled="^view.camera.pending")
        camera.img(src="^gramlot.device.camera.url", alt="Last photo preview", class_="device-photo")
        self.fields(camera, "camera", ("format",))
        self.state(camera, "camera")

    def barcode(self, page):
        barcode = page.section(class_="device-card")
        barcode.h2("QR codes and barcodes")
        barcode.p("Tap Scan and point at the test QR code on the Mac or a barcode. Text and format are written to Data.")
        barcode.dataFormula("view.barcode.pending", func="devicePending", status="^gramlot.device.barcode?status")
        barcode.button("Scan code", action="deviceScanBarcode", disabled="^view.barcode.pending")
        self.fields(barcode, "barcode", ("text", "format"))
        self.state(barcode, "barcode")
        barcode.img(src="./barcode-test.png", alt="Test QR: GRAMLOT-POC-QR-001", width=240, height=240)
        barcode.p("Test QR: GRAMLOT-POC-QR-001. Scanned content stays on the device.", class_="note")

    def biometrics(self, page):
        biometrics = page.section(class_="device-card")
        biometrics.h2("Face ID / Touch ID")
        biometrics.p("Local biometric verification: the result is written to Data without logging into the site.")
        biometrics.dataFormula("view.biometrics.pending", func="devicePending", status="^gramlot.device.biometrics?status")
        biometrics.button("Verify Face ID / Touch ID", action="deviceVerifyBiometrics", disabled="^view.biometrics.pending")
        self.fields(biometrics, "biometrics", ("verified",))
        self.state(biometrics, "biometrics")

    def notifications(self, page):
        notifications = page.section(class_="device-card")
        notifications.h2("Local notifications")
        notifications.p("Schedule a notification, then stay in the app or go to the Home Screen. Tap the banner to update the interaction Data.")
        notifications.textBox(value="^gramlot.device.notifications.request.title", lbl="Title")
        notifications.textBoxArea(value="^gramlot.device.notifications.request.body", lbl="Text")
        notifications.numberTextBox(value="^gramlot.device.notifications.request.delay", lbl="Delay in seconds")
        notifications.dataFormula("view.notifications.pending", func="devicePending", status="^gramlot.device.notifications?status")
        notifications.button("Schedule notification", action="deviceScheduleNotification", disabled="^view.notifications.pending")
        self.state(notifications, "notifications")
        notifications.p("Success means iOS accepted the schedule; it does not confirm display.", class_="note")
        notifications.p("Listening for events:")
        notifications.span("^gramlot.device.notifications?listening")
        notifications.dataFormula("view.notifications.listenerError", func="deviceError", error="^gramlot.device.notifications?listenerError")
        notifications.p("^view.notifications.listenerError", class_="error")
        notifications.h3("Scheduled")
        self.fields(notifications, "notifications.scheduled", ("id", "at"))
        notifications.h3("Received by the page")
        self.fields(notifications, "notifications.received", ("id", "title", "body"))
        notifications.h3("Last interaction")
        self.fields(notifications, "notifications.action", ("id", "actionId", "title", "body"))

    def push(self, page):
        push = page.section(class_="device-card")
        push.h2("Server push")
        push.p("Register this iPhone. The token goes to the server through dataRpc; the test push is sent from the Kajenn container.")
        push.dataFormula("view.push.pending", func="devicePending", status="^gramlot.device.push?status")
        push.button("Register for push", action="deviceRegisterPush", disabled="^view.push.pending")
        self.state(push, "push")
        push.p("Listening for events:")
        push.span("^gramlot.device.push?listening")
        push.dataFormula("view.push.listenerError", func="deviceError", error="^gramlot.device.push?listenerError")
        push.p("^view.push.listenerError", class_="error")
        push.dataRpc("pushRegister", result_path="view.push.serverRegistration",
                     token="^gramlot.device.push.registration.token", _if="token", _delay=200,
                     _onCalling="this.SET('view.push.serverStatus', 'pending'); this.SET('view.push.serverError', null); this.SET('view.push.serverRegistration', null)",
                     _onResult="this.SET('view.push.serverStatus', 'success')",
                     _onError="this.SET('view.push.serverStatus', 'error'); this.SET('view.push.serverError', error.message)")
        push.p("Server registration:")
        push.span("^view.push.serverStatus")
        push.p("^view.push.serverError", class_="error")
        push.h3("Push received by the page")
        self.fields(push, "push.received", ("title", "body", "messageId", "destination"))
        push.h3("Last push interaction")
        self.fields(push, "push.action", ("actionId", "messageId", "destination"))

    def fields(self, pane, name, fields):
        rows = pane.dl()
        for field in fields:
            rows.dt(field)
            rows.dd(f"^gramlot.device.{name}.{field}")

    def state(self, pane, name):
        state = pane.div(class_="device-state")
        state.strong("Status: ")
        state.span(f"^gramlot.device.{name}?status")
        state.dataFormula(f"view.{name}.error", func="deviceError", error=f"^gramlot.device.{name}?error")
        state.p(f"^view.{name}.error", class_="error")

    @endpoint
    def pushRegister(self, token):
        if self.push_register is None:
            raise RuntimeError("Push registration is not configured by this host")
        return Bag(self.push_register(token))
