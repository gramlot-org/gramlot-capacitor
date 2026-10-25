"""Python-authored embedded Source for the installed app entry; no server Page."""
from gramlot.page import GramlotBuilder


def source(*, include_device_probe=True):
    builder = GramlotBuilder("main")
    root = builder.root
    main = root.main(class_="app-entry")
    main.h1("Gramlot")
    main.p("Mobile application")
    main.p("Example links are received in Gramlot Data and opened by the controller.")
    main.p("^gramlot.device.links.request.url")
    main.p("^view.linkError", role="status")
    main.button("Open gallery", action="openGallery")
    if include_device_probe:
        main.button("Device examples on Mac", action="openDeviceProbe")
    main.dataController(func="openLink", request="^gramlot.device.links.request")
    main.dataController(func="openShortcut", request="^gramlot.device.shortcuts.request")
    return builder.to_tytx()
