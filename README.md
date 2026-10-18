# Dynamics 365 Contact Center – Cost, Licensing & Plan Estimator

Single-file HTML tool (no server, works offline) that estimates implementation, licensing and runtime costs for a Dynamics 365 Contact Center programme, with phasing, milestones, roles & grades, and Excel / PDF export.

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

## Pricing basis (v0.8.0, October 2026)

Defaults follow the Microsoft price list and the Dynamics 365 Licensing Guide of October 2026 (USD, annual commitment). All values are editable in the tool.

| Item | Default |
|---|---|
| CS Premium (incl. 1,000 Copilot credits/user for Dynamics 365 agents & tools only) | $195 |
| CS Enterprise / Team Member | $105 / $8 |
| Contact Center add-on for CS Enterprise: digital + voice / digital / voice | $90 / $75 / $75 |
| Contact Center standalone (third-party CRM): digital + voice / digital / voice | $110 / $95 / $95 |
| Teams Phone Standard per voice rep | $10 |
| Teams Phone Resource Account per service number | free |
| Teams pay-as-you-go Calling Plan per resource account (Zone 1 / Zone 2) | $3 / $4 |
| Copilot credits: pack 25,000 / PAYG / pre-purchase | $200 / $0.01 / 5–20% off PAYG |
| Copilot Studio voice per minute: classic / GenAI / premium GenAI | 10 / 35 / 75 credits |
| Dataverse tenant default DB / file / log | 30 / 40 / 2 GB |
| Dataverse accrual per full user: DB / file (35 GB file for CC Voice, CC, CS Premium) | 250 MB / 2 GB |

Telephony rules:

* Azure Communication Services voice (Direct Offer and Direct Routing) is no longer an option. Microsoft retires it on 30 Sep 2028, and tenants without an ACS resource can't get ACS numbers since 30 Sep 2026. All voice is modelled on Teams Phone extensibility.
* Every voice rep needs Teams Phone (Standard add-on or Microsoft 365 E5) plus a Teams licence. Every service number needs a Teams Phone Resource Account with PSTN connectivity: the Teams pay-as-you-go Calling Plan, Operator Connect or Direct Routing.
* Per-user Calling Plans can't be pooled for the contact center. Calling Plan numbers on resource accounts need the pay-as-you-go Calling Plan, and outbound minutes are metered for the whole organisation through Communications Credits or telco overage. Inbound to geographic numbers is included; toll-free inbound is metered.
* Per-minute PSTN rates are indicative; use the Teams rate card or the carrier contract for the country.

Saved estimates from v0.7 load with ACS or per-user Calling Plan telephony switched to the Teams pay-as-you-go Calling Plan, and Teams Phone at $8 updated to $10.

## Third-party

* SheetJS Community Edition 0.18.5 – Apache-2.0
* jsPDF 2.5.1 – MIT
* jspdf-autotable 3.8.2 – MIT
* Ubuntu / Ubuntu Mono – Ubuntu Font Licence 1.0

## Disclaimer

Indicative estimates. Microsoft list prices are editable defaults; Day rates in the source are placeholders and must be replaced with the applicable rate card before sharing with a client.
