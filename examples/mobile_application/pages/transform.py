"""Gestures: move, rotate and zoom — one native capability per page."""
from mobile_application.page import DevicePage


class Page(DevicePage):
    title = 'Gestures: move, rotate and zoom'
    example = DevicePage.transform
