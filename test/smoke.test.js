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
  // pricing & telephony rules (v0.8: ACS retired, Teams Phone extensibility only)
  q('nav.tabs button[data-tab=lic]').click();
  ok(!/value="acs"|value="teams-cp"/.test(q('#content').innerHTML), 'no ACS / per-user Calling Plan option');
  for (const m of ['teams-payg', 'teams-oc', 'teams-dr']) { w.eval(`S.lic.tel.mode='${m}'; render();`); ok(w._R.cons.telephony > 0 && /Teams Phone Standard/.test(q('#content').innerHTML), 'telephony ' + m); }
  w.eval("S.lic.tel.e5Users=5; S.lic.tel.teamsUsers=0; render();"); ok(w._R.cons.teamsPhoneUsers === w._R.lic.liveVoiceUsers - 5, 'E5 reps excluded from Teams Phone');
  const legacy = w.eval("(()=>{ const o=JSON.parse(JSON.stringify(S)); o.lic.tel.mode='acs'; o.lic.tel.teamsPhone=8; o.wiz.tel={mode:'teams-cp'}; return migrateState(deepMerge(DEFAULT_STATE(), o)); })()");
  ok(legacy.lic.tel.mode === 'teams-payg' && legacy.lic.tel.teamsPhone === 10 && legacy.wiz.tel.mode === 'teams-payg', 'legacy ACS estimate migrates to Teams PAYG');
  w.eval("S.lic.strategy='auto'; S.lic.agentsDigital=10; S.lic.agentsVoice=10; render();");
  const rows = w._R.lic.rows.map(r => r.name + '=' + r.unit).join('|');
  ok(/CS Premium — agents/.test(rows) && /Digital add-on — digital-only agents=180/.test(rows) && /Voice add-on — voice-only agents=180/.test(rows), 'auto strategy uses $75 CC add-ons for CSE');
  w.eval("S.lic.copilot.sessions=1000; S.lic.copilot.creditsPerSession=10; S.lic.copilot.extraCredits=0; S.lic.copilot.voiceMin=0; S.lic.d365ai.cia.on=0; S.lic.d365ai.qaa.on=0; render();");
  ok(w._R.cons.copilot.over === 10000 && w._R.cons.copilot.inclUsed === 0, 'Premium credits do not cover custom Copilot Studio agents');
  w.eval("S.lic.copilot.voiceMin=1e9; S.lic.copilot.voiceTier='classic'; render();"); ok(w._R.cons.copilot.voiceCredits === (1e9 - w._R.cons.copilot.voiceIncl) * 10, 'classic voice minutes beyond voicebot pool at 10 credits/min');
  w.eval("S=DEFAULT_STATE(); render();");
  const js = w.eval('JSON.stringify(S)'); w.eval('S=deepMerge(DEFAULT_STATE(),' + js + '); render();'); ok(w._R.tco.total > 0, 'save/load round-trip');
  console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed'); process.exit(failed ? 1 : 0);
}, 800);
