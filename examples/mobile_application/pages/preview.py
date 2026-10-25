"""Source-owned narrow iframe for local appearance and bridge qualification."""
from gramlot import Page as BasePage

class Page(BasePage):
    title = "Mela · mobile preview"
    css = ("/themes/gramlot-base/theme.css", "/themes/gramlot-compact/theme.css", "/themes/mela/theme.css")

    def main(self, root):
        root.dataController(func="previewInit", _init=True)
        page=root.main(class_="stack", padding="24px", display="flex", flex_direction="column", align_items="center")
        page.h1("Mela · mobile preview")
        page.p("A Gramlot page in a 390 px iframe. Native plugins are available only in the app.", class_="muted")
        page.iframe(src="./appearance", title="Mobile appearance", width="390px", max_width="100%", height="844px", border="1px solid var(--gramlot-border)", border_radius="24px")
        page.a("Open full page", href="./appearance")
