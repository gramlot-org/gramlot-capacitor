"""Local notifications — one native capability per page."""
from mobile_application.page import DevicePage


class Page(DevicePage):
    title = 'Local notifications'
    example = DevicePage.notifications
