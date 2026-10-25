"""App lifecycle — one native capability per page."""
from mobile_application.page import DevicePage


class Page(DevicePage):
    title = 'App lifecycle'
    example = DevicePage.lifecycle
