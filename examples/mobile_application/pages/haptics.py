"""Haptic feedback — one native capability per page."""
from mobile_application.page import DevicePage


class Page(DevicePage):
    title = 'Haptic feedback'
    example = DevicePage.haptics
