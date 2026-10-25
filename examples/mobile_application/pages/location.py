"""Geolocation — one native capability per page."""
from mobile_application.page import DevicePage


class Page(DevicePage):
    title = 'Geolocation'
    example = DevicePage.location
