"""QR codes and barcodes — one native capability per page."""
from mobile_application.page import DevicePage


class Page(DevicePage):
    title = 'QR codes and barcodes'
    example = DevicePage.barcode
