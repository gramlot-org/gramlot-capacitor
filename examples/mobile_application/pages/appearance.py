"""Mela appearance probe using ordinary Source, bindings and semantic button roles."""
from mobile_application.page import DevicePage

class Page(DevicePage):
    title = "Appearance and controls"

    def example(self, page):
        page.p("Mela theme · follows the system light or dark appearance.", class_="note")
        card = page.section(class_="device-card")
        card.h2("Your profile")
        card.dataSetter("view.appearance.name", "Julia")
        card.dataSetter("view.appearance.volume", 65)
        card.textBox(value="^view.appearance.name", lbl="Name", live=True)
        card.textBox(value="^view.appearance.email", lbl="Email", placeholder="name@example.com")
        card.textBox(value="Trial version", lbl="Status", readonly=True)
        card.horizontalSlider(value="^view.appearance.volume", min=0, max=100, live=True, lbl="Volume")
        card.p("^view.appearance.name", mask="Hello {}", class_="muted")
        actions = card.div(class_="actions")
        actions.button("Continue", action="appearanceConfirm")
        actions.button("Secondary", class_="button--secondary")
        actions.button("Unavailable", disabled=True)
        card.p("^view.appearance.message", aria_live="polite")
        card = page.section(class_="device-card")
        card.h2("Preferences")
        card.checkBox(value="^view.appearance.enabled", lbl="Enable updates")
        card.textBoxArea(value="^view.appearance.notes", lbl="Notes", rows=3, placeholder="Write a note…")
        card.button("Reset text", class_="button--quiet", action="appearanceReset")
        card.p("Changes stay in the page Data Bags. This example demonstrates controls; it does not save native preferences.", class_="note")
