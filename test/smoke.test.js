/* Loads the built file in jsdom and exercises presets, wizards, Excel and PDF export. Run: npm test */
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'); const path = require('path');
const file = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '..', 'dist', 'D365-Contact-Center-Estimator-Capgemini.html');
if (!fs.existsSync(file)) { console.error('dist file missing – run npm run build first'); process.exit(1); }
const vc = new VirtualConsole(); vc.sendTo(console, { omitJSDOMErrors: true }); // jsPDF probes canvas at load; harmless in jsdom
const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
const w = dom.window, d = w.document; let failed = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) failed++; };
w.addEventListener('error', e => ok(false, 'runtime error: ' + e.message));
setTimeout(() => {
  const q = s => d.querySelector(s);
  ok(w._R && w._R.tco.total > 0, 'initial calculation');
  ok(!!q('header .logo svg'), 'logo rendered');
  q('nav.tabs button[data-tab=impl]').click();
  for (const p of ['S', 'M', 'L', 'XL']) { q(`[data-preset=${p}]`).click(); ok(w.eval('S.impl.preset') === p && w._R.impl.total > 0, 'preset ' + p); }
  for (const id of ['users', 'copilot', 'd365ai', 'tel', 'dv', 'ams', 'azure', 'scope', 'skus', 'integ']) {
    try { w.openWizard(id); const n = q('#overlay').innerHTML.length; w.applyWizard(); ok(n > 500 && w._R.tco.total > 0, 'wizard ' + id); }
    catch (e) { ok(false, 'wizard ' + id + ': ' + e.message); }
  }
  for (const t of ['setup', 'lic', 'impl', 'plan', 'run', 'summary']) { q(`nav.tabs button[data-tab=${t}]`).click(); ok(q('#content').innerHTML.length > 1000, 'tab ' + t); }
  w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.HTMLAnchorElement.prototype.click = function () {};
  try { w.exportXlsx(); ok(true, 'excel export'); } catch (e) { ok(false, 'excel export: ' + e.message); }
  w.jspdf.jsPDF.API.save = function () { ok(this.getNumberOfPages() > 5, 'pdf export (' + this.getNumberOfPages() + ' pages)'); };
  try { w.exportPdf(); } catch (e) { ok(false, 'pdf export: ' + e.message); }
  const js = w.eval('JSON.stringify(S)'); w.eval('S=deepMerge(DEFAULT_STATE(),' + js + '); render();'); ok(w._R.tco.total > 0, 'save/load round-trip');
  console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed'); process.exit(failed ? 1 : 0);
}, 800);
