# 115 · Mela — Apple-inspired mobile appearance

Document ID: **GCP-115**. Updated: **2026-10-25**.

<a id="gcp-115-005"></a>
## 005 · Scope

Owner requests a Gramlot theme as close as practical to native Apple UI, adapted to Gramlot. This work refines the existing **mela** theme rather than introducing another theme name. The source is the core's `themes/mela/theme.css`; the runtime build prepares the JS/Python resource copies. The independently hosted mobile module loads Base, Compact and Mela in that order.

The theme owns appearance; shared controls own interaction, focus, disabled state and Data bindings. MobileEnvironment owns the outer safe area, without repeating it inside an iframe. Device pages supply content layout only. No UIKit replacement, Dynamic Island extension, native preference storage or new dependency is added.

<a id="gcp-115-010"></a>
## 010 · Apple guidance mapped to Gramlot

| Guideline | Implementation |
| --- | --- |
| [Touch targets](https://developer.apple.com/design/tips/) | At least 44 CSS px in the mobile web viewport, with text-relative control heights; CSS pixels are not a claim of universal point equivalence. |
| [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) | System font stack; 17px mobile base, relative text sizes, WebKit `-apple-system-body` when supported. No bundled proprietary font. |
| [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) | Distinct primary, secondary and quiet actions; shared Shadow DOM command controls honor the same variants and a readable foreground token. Press/focus/disabled states remain in the component. |
| [Color](https://developer.apple.com/design/human-interface-guidelines/color) | Grouped neutral surfaces, semantic accent/status tokens, system-preference light/dark selection and existing explicit `data-theme` override. |
| [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) | Opaque content surfaces; restrained CSS translucency only for toolbar roles, disabled for reduced transparency or increased contrast when exposed by the browser. |
| [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | Contrast checks on both palettes, visible focus, contrast/forced-color treatments and existing reduced-motion support. |

These are web adaptations. CSS blur is not native Liquid Glass; CSS colors are not live UIColor semantic values. WebKit's system text style does not establish complete UIKit Dynamic Type support across all controls. Browser exposure of OS accessibility preferences and enlarged-text behavior need device qualification. Android visual qualification remains pending.

<a id="gcp-115-015"></a>
## 015 · Try locally

- `/device/appearance`: the real Python page, normal Gramlot inputs, slider, checkbox and buttons, bound to Data. Editing the name updates its greeting; Continue updates a status; Reset clears notes.
- `/device/preview`: a Python-authored parent with a Source-owned 390px iframe. Its ordinary Logic installs the approved same-origin device broker. This is a local qualification page, not another catalogue entry or a gallery implementation.
- `/device/catalog.json`: module catalogue, now including the appearance entry.

The host can choose another mount prefix without changing these pages. Preview/frame behavior does not simulate native hardware: on a desktop browser native device capabilities remain unavailable.

<a id="gcp-115-020"></a>
## 020 · Evidence and limits

The full core suite passes 3,944 checks; the 39 focused theme/command/viewport checks include palette contrast for text/actions (at least 4.5:1) and field boundaries (at least 3:1). The module passes three Python portability/backend checks, and the Capacitor suite passes 66 checks. The local Docker host serves the separated module and rebuilt resources. Browser binding/action verification passes in the real page. Physical iPhone appearance, enlarged text and iframe native media need owner verification; tests do not establish Apple certification or native UIKit rendering.
