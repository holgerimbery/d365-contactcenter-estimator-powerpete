# Dynamics 365 Contact Center – Cost, Licensing & Plan Estimator

Single-file HTML tool (no server, works offline) that estimates implementation, licensing and runtime costs for a Dynamics 365 Contact Center programme, with phasing, milestones, Capgemini roles & grades, and Excel / PDF export.

Owner: Peter Ruiter, Capgemini Netherlands.

## Build

```bash
npm install          # only jsdom, for the smoke test
npm run build        # -> dist/D365-Contact-Center-Estimator-Capgemini.html
                     #    dist/D365-Contact-Center-Calculator-PowerPete.html
npm run build -- powerpete   # one brand only
npm test             # jsdom smoke tests of both built files
```

| Source | Becomes |
|---|---|
| `src/js/*.js` (sorted by filename) | one `<script>` bundle |
| `src/vendor/*.js` | inlined SheetJS, jsPDF, jspdf-autotable |
| `src/assets/fonts/*.ttf` | base64 `@font-face` (Ubuntu, Ubuntu Mono) and jsPDF fonts |
| `src/assets/logo/*` | header SVG, favicon, PDF logos (`BRAND` object) |

Placeholders in `template.html`: `__TITLE__`, `__FAVICON__`, `__BRAND_TOKENS__`, `__BRAND_HEADER_LOGO__`, `__BRAND_PROMISE__`, `__BRAND_FOOTER__`, `__FONT_*__`, `__FONTMONO_*__`, `__VERSION__`.

## Source layout

```
src/
  template.html              markup + CSS (brand tokens at the top of <style>)
  js/10-state-calc.js        default state, helpers, licensing / consumption / plan / cost calculations
  js/20-render.js            tab renderers, side panel, charts
  js/30-presets-wizards.js   S/M/L/XL presets, integration & SKU catalogues, estimator wizards, toast
  js/40-ams-pdf.js           AMS sizing tied to project size, PDF export
  js/50-controller-export.js render loop, event binding, JSON save/load, Excel export
  vendor/                    third-party libraries (pinned versions, see below)
  assets/fonts               Ubuntu & Ubuntu Mono, Latin subsets (Ubuntu Font Licence 1.0)
  assets/logo                Capgemini logo set (internal use only); assets/logo/powerpete/ generated wordmark
brands/                      brand configs (capgemini.json, powerpete.json)
tools/build.js               build script
test/smoke.test.js           jsdom smoke test
dist/                        build output, one file per brand
```

## Editing

* Prices, defaults and presets: `10-state-calc.js` (`DEFAULT_STATE`) and `30-presets-wizards.js` (`PRESETS`, `INTEGRATION_CATALOG`, `SKU_CATALOG`, `WIZ`).
* Brand colours, logos, copy: `brands/<id>.json` (UI tokens and PDF palette both live there).
* Bump `version` in `package.json`; it is written into the built file.

## Third-party

* SheetJS Community Edition 0.18.5 – Apache-2.0
* jsPDF 2.5.1 – MIT
* jspdf-autotable 3.8.2 – MIT
* Ubuntu / Ubuntu Mono – Ubuntu Font Licence 1.0

## Disclaimer

Indicative estimates. Microsoft list prices are editable defaults; Day rates in the source are placeholders and must be replaced with the applicable rate card before sharing with a client.
