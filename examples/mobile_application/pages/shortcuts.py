"""Shortcuts — one native capability per page."""
from mobile_application.page import DevicePage


class Page(DevicePage):
    title = 'Shortcuts'
    example = DevicePage.shortcuts
