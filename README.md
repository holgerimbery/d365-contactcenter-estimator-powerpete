# Dynamics 365 Contact Center – Cost, Licensing & Plan Estimator

Single-file HTML tool (no server, works offline) that estimates implementation, licensing and runtime costs for a Dynamics 365 Contact Center programme, with phasing, milestones, roles & grades, and Excel / PDF export.

Owner: Peter Ruiter, Capgemini Netherlands.

## Build

```bash
npm install          # only jsdom, for the smoke test
npm run build        # -> dist/D365-Contact-Center-Estimator-Capgemini.html
                     #    dist/D365-Contact-Center-Calculator-PowerPete.html
npm run build -- powerpete   # one brand only
npm test             # pricing validation + jsdom smoke tests of both built files
npm run release      # build both brands, then run all checks
```

| Source | Becomes |
|---|---|
| `config/pricing.json` | validated, embedded `PRICING` object shared by both brands |
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
config/pricing.json          shared USD prices, credit rates, allowances, FX and Azure assumptions
tools/build.js               build script
tools/pricing.js             pricing configuration validation
test/pricing.test.js         pricing validation tests
test/smoke.test.js           jsdom smoke test
dist/                        build output, one file per brand
```

## Editing

* Prices and pricing parameters: `config/pricing.json` (see below).
* Operational defaults and presets: `10-state-calc.js` (`DEFAULT_STATE`) and `30-presets-wizards.js` (`PRESETS`, `INTEGRATION_CATALOG`, `skuCatalog`, `WIZ`).
* Partner role day rates: `brands/powerpete.json` (`grades[].rate`); Capgemini fallback grades remain in `10-state-calc.js` (`brandGrades`).
* Brand colours, logos, copy: `brands/<id>.json` (UI tokens and PDF palette both live there).
* Bump `version` in `package.json`; it is written into the built file.

## Updating prices

Edit `config/pricing.json`, then run `npm run release` to rebuild and check both branded HTML files. Distribute the updated files in `dist/`. No server or runtime configuration download is needed; the calculators still work offline.

### Maintainer workflow

1. Edit the relevant values in `config/pricing.json`. For example, `lic.p.premium` is the CS Premium monthly price, `lic.copilot.packPrice` is the monthly credit-pack price, and `parameters.skuPrices.powerBiPro` is the Power BI Pro monthly per-user price.
2. Update `meta.priceList` and `meta.priceBasis` if the price-list date or assumptions change. Bump `version` in `package.json` for the release.
3. Run `npm run release` from the repository root. This validates the configuration, embeds it in both branded calculators, and exercises their calculations, wizards, saved estimates and exports.
4. Publish the rebuilt HTML file for each audience. Do not edit prices directly in `dist/`: the next build overwrites those changes.

For example, changing CS Premium from USD 195 to USD 200 means changing `"premium": 195` to `"premium": 200` inside `lic.p`. To change the Power BI Pro default, edit `parameters.skuPrices.powerBiPro`; that setting supplies both the initial SKU row and the add-on wizard.

```bash
npm run release
# Rebuilt files:
# dist/D365-Contact-Center-Estimator-Capgemini.html
# dist/D365-Contact-Center-Calculator-PowerPete.html
```

### Configuration reference

| Configuration section | Controls |
|---|---|
| `meta` | Price-list label, price-basis description and default FX (display units per USD) |
| `lic.p` | Monthly per-user Microsoft licence prices |
| `lic.copilot` | Included credits/minutes, voice credit rates, credit pack size/price, PAYG and discount |
| `lic.tel` | Teams Phone, PSTN per-number/per-minute rates and SBC monthly cost |
| `lic.dv` | Dataverse capacity allowances and monthly prices per GB |
| `parameters.copilotText` | Credits per text answer, action and Graph grounding |
| `parameters.d365ai` | Credit rates used by the prebuilt Dynamics 365 AI agent formulas |
| `parameters.skuPrices` | Add-on SKU catalogue unit prices (USD, with billing periods defined in `skuCatalog`) |
| `parameters.azure` | Indicative Azure runtime, non-production factor, storage, monitoring, networking and Fabric costs |
| `otherRunMonthly` | Initial Azure/platform monthly run-cost row |

All monetary amounts are USD. Keep the existing keys; the build rejects missing or unknown settings, negative/non-numeric values, zero FX or credit-pack size, USD FX other than 1, and discounts above 100%. Update both `meta.priceList` and `meta.priceBasis` when changing the pricing vintage. Quantities, workloads, project effort, operational assumptions and partner day rates are not changed by this configuration.

### Saved estimates and offline behaviour

Each new/reset estimate copies the embedded defaults, including a `parameters` snapshot for catalogue prices, wizard assumptions and AI credit rates. Save JSON to retain that estimate's prices and parameters; loading it into a later build keeps the saved values. Older JSON estimates without the new fields receive embedded defaults for those missing fields; the existing v0.7 telephony migration still applies. Reset intentionally starts again with the current build's defaults.

Values exposed as inputs remain editable for an individual estimate without changing the shared configuration. Additional credit-rate and wizard parameters are maintained in the JSON configuration and saved in the estimate; they do not all have dedicated UI inputs. Partner role rates stay in their existing brand/fallback definitions and are not read from `config/pricing.json`.

Updating the JSON does not update HTML files already downloaded by users: they must receive a rebuilt file. The configuration is public data embedded in the HTML, so do not put secrets in it.

## Pricing basis (v0.8.1, October 2026)

Defaults follow the Microsoft price list and the Dynamics 365 Licensing Guide of October 2026 (USD, annual commitment). `config/pricing.json` is the source of truth; the table below is a reference snapshot and should be reviewed when updating the configuration. Many values are also editable for an individual estimate in the tool.

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
