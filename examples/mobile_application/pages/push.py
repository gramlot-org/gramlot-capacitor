"""Server push — one native capability per page."""
from mobile_application.page import DevicePage


class Page(DevicePage):
    title = 'Server push'
    example = DevicePage.push
