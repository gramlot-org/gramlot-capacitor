"""Entry catalogue for the separate Mobile application probes."""
from gramlot import Page as BasePage
from mobile_application.page import EXAMPLES


class Page(BasePage):
    title = "Mobile application"
    css = ("/themes/gramlot-base/theme.css", "/themes/gramlot-compact/theme.css", "/themes/mela/theme.css")

    def main(self, root):
        page = root.main(class_="device-page")
        page.p("GRAMLOT / MOBILE APPLICATION", class_="eyebrow")
        page.h1("Mobile application")
        page.p("One page per example. Open them in Gramlot PoC to use the device; native plugins are unavailable in a browser.")
        for name, title in EXAMPLES:
            card = page.section(class_="device-card")
            card.h2(title)
            card.a("Open example", href=f"./{name}")
        page.nav().a("Official gallery", href="https://gallery-py.gramlot.dev/")
