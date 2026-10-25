"""Face ID / Touch ID — one native capability per page."""
from mobile_application.page import DevicePage


class Page(DevicePage):
    title = 'Face ID / Touch ID'
    example = DevicePage.biometrics
