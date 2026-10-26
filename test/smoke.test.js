/* Loads the built file in jsdom and exercises presets, wizards, Excel and PDF export. Run: npm test */
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'); const path = require('path');
const pricing = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'pricing.json'), 'utf8'));
const file = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '..', 'dist', 'D365-Contact-Center-Estimator-Capgemini.html');
if (!fs.existsSync(file)) { console.error('dist file missing – run npm run build first'); process.exit(1); }
const vc = new VirtualConsole(); vc.sendTo(console, { omitJSDOMErrors: true }); // jsPDF probes canvas at load; harmless in jsdom
const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
const w = dom.window, d = w.document; let failed = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) failed++; };
w.addEventListener('error', e => ok(false, 'runtime error: ' + e.message));
setTimeout(async () => {
  const q = s => d.querySelector(s);
  ok(w._R && w._R.tco.total > 0, 'initial calculation');
  ok(w.eval('JSON.stringify(PRICING)') === JSON.stringify(pricing), 'shared pricing configuration embedded in build');
  ok(w.eval('JSON.stringify(S.parameters)') === JSON.stringify(pricing.parameters), 'pricing parameters copied into estimate');
  ok(w.eval('S.parameters !== PRICING.parameters && S.meta.fx !== PRICING.meta.fx && S.lic.p !== PRICING.lic.p'), 'estimate prices do not share mutable build defaults');
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
  const p = pricing.lic.p;
  const priceFor = suffix => w._R.lic.rows.find(r => r.name.endsWith(suffix)).unit;
  ok(priceFor('agents & supervisors') === Math.min(p.premium, p.cse + p.ccAddFull) && priceFor('digital-only agents') === Math.min(p.premium, p.cse + p.ccAddDigital) && priceFor('voice-only agents') === Math.min(p.premium, p.cse + p.ccAddVoice), 'auto strategy uses cheapest configured licence prices');
  w.eval("S.lic.copilot.sessions=1000; S.lic.copilot.creditsPerSession=10; S.lic.copilot.extraCredits=0; S.lic.copilot.voiceMin=0; S.lic.d365ai.cia.on=0; S.lic.d365ai.qaa.on=0; render();");
  ok(w._R.cons.copilot.over === 10000 && w._R.cons.copilot.inclUsed === 0, 'Premium credits do not cover custom Copilot Studio agents');
  w.eval("S.lic.copilot.voiceMin=1e9; S.lic.copilot.voiceTier='classic'; render();"); ok(w._R.cons.copilot.voiceCredits === Math.max(0, 1e9 - w._R.cons.copilot.voiceIncl) * pricing.lic.copilot.classicVoiceRate, 'classic voice minutes beyond voicebot pool at configured credit rate');
  w.eval("S=DEFAULT_STATE(); render();");
  const js = w.eval('JSON.stringify(S)'); w.eval('S=deepMerge(DEFAULT_STATE(),' + js + '); render();'); ok(w._R.tco.total > 0, 'save/load round-trip');
  w.eval("S.parameters.d365ai={reasoning:2,knowledge:3,action:1,intentMining:1.5,basicPrompt:0.1,standardPrompt:1.5,premiumPrompt:10,premiumVoice:75,flowAction:0.13}; S.lic.d365ai.cma.on=1; S.lic.d365ai.kma.on=1; S.lic.d365ai.caa.on=1; S.lic.d365ai.caa.conv=100;");
  ok(w.eval('JSON.stringify(calcD365AI().rows.map(r=>r.credits))') === '[863000,420000,164800,40000,15215]' && w.eval('calcD365AI().oneoff') === 48800, 'all AI agent formulas retain original default results');
  w.eval('S.parameters.d365ai.premiumVoice=150;');
  ok(w.eval('calcD365AI().rows[4].credits') === 30215, 'premium voice calculation uses saved credit rate');
  w.eval('Object.keys(S.parameters.d365ai).forEach(k=>S.parameters.d365ai[k]=0);');
  ok(w.eval('calcD365AI().total === 0 && calcD365AI().oneoff === 0'), 'all AI agent credit rates are configurable, including zero');

  // Exercise the actual JSON Save/Load controls across a change in build defaults.
  w.eval("S=DEFAULT_STATE(); S.lic.p.premium=201; S.lic.copilot.paygPerCredit=0.0125; S.lic.tel.teamsPhone=8; S.lic.dv.pDb=42; S.parameters.skuPrices.powerBiPro=19; render();");
  const saved = w.eval('JSON.stringify(S)'), savedTco = w._R.tco.total;
  let savedBlob;
  w.URL.createObjectURL = blob => { savedBlob = blob; return 'blob:saved'; };
  q('#btnSave').click();
  const savedText = await new Promise((resolve, reject) => {
    const reader = new w.FileReader();
    reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error);
    reader.readAsText(savedBlob);
  });
  ok(JSON.stringify(JSON.parse(savedText)) === saved, 'JSON Save includes prices and parameter snapshot');
  const futurePricing = JSON.parse(JSON.stringify(pricing));
  function doubleNumbers(o) {
    for (const key of Object.keys(o)) {
      if (typeof o[key] === 'number') o[key] *= 2;
      else if (o[key] && typeof o[key] === 'object') doubleNumbers(o[key]);
    }
  }
  doubleNumbers(futurePricing); futurePricing.meta.fx.USD = 1;
  futurePricing.meta.priceList = 'Future price list';
  futurePricing.meta.priceBasis = 'Future pricing basis';
  w.eval(`Object.assign(PRICING, ${JSON.stringify(futurePricing)}); S=DEFAULT_STATE(); render();`);
  for (const group of ['p', 'copilot', 'tel', 'dv']) {
    ok(w.eval(`Object.entries(PRICING.lic.${group}).every(([k,v])=>S.lic.${group}[k]===v)`), 'new estimate uses updated ' + group + ' prices and allowances');
  }
  ok(w.eval('JSON.stringify(S.parameters)') === JSON.stringify(futurePricing.parameters) && w.eval('S.run.otherMonthly[0].amount') === futurePricing.otherRunMonthly, 'new estimate uses updated wizard parameters and run-cost default');
  ok(w.eval('S.lic.other[0].unit') === futurePricing.parameters.skuPrices.powerBiPro && w.eval('S.meta.fx.EUR') === futurePricing.meta.fx.EUR, 'new estimate uses updated default add-on price and FX');
  q('nav.tabs button[data-tab=lic]').click();
  ok(q('#content').textContent.includes('Future price list') && q('#content').textContent.includes(`Classic answer ${w.fmtN(futurePricing.parameters.copilotText.classicAnswer)}, generative answer ${w.fmtN(futurePricing.parameters.copilotText.generativeAnswer)}`), 'licensing guidance reflects configured metadata and credit rates');
  w.openWizard('copilot');
  ok(q('#overlay').textContent.includes(`classic voice ${w.fmtN(futurePricing.lic.copilot.classicVoiceRate)}, GenAI voice ${w.fmtN(futurePricing.lic.copilot.genaiVoiceRate)}`) && q('#overlay').textContent.includes(`Premium GenAI voice (${w.fmtN(futurePricing.parameters.d365ai.premiumVoice)}/min)`), 'voice wizard guidance reflects configured credit rates');
  w.closeWizard();
  const azure = futurePricing.parameters.azure;
  const azureAmounts = [azure.runtime.med, Math.round(azure.runtime.med * azure.nonProdFactor * 2), azure.apim, Math.round(500 * azure.storagePerGB), Math.round(20 * azure.logsPerGB + azure.monitoringBase), azure.privateNetworking, azure.fabric.F4];
  ok(w.eval("JSON.stringify(WIZ.azure.calc({envs:2,integ:'med',apim:1,storeGB:500,logsGB:20,privnet:1,fabric:'F4'})[0][1].map(r=>r.amount))") === JSON.stringify(azureAmounts), 'Azure wizard uses all configured cost assumptions');
  const text = futurePricing.parameters.copilotText;
  const expectedSessionCredits = Math.round((3 * text.generativeAnswer + 3 * text.classicAnswer + 1.5 * text.graphGrounding + 2 * text.agentAction) * 10) / 10;
  ok(w.eval("WIZ.copilot.calc({calls:0,chats:100,botPct:100,chatTurns:6,chatGen:50,graphPct:50,chatAct:2,cseAgents:0,auto:0}).find(r=>r[0]==='lic.copilot.creditsPerSession')[1]") === expectedSessionCredits, 'Copilot wizard uses all configured text credit rates');
  w.openWizard('skus'); w.applyWizard();
  ok(w.eval('S.lic.other[0].unit') === futurePricing.parameters.skuPrices.powerBiPro, 'SKU wizard applies updated catalogue price');

  async function loadEstimate(json) {
    Object.defineProperty(q('#fileLoad'), 'files', { configurable: true, value: [new w.File([json], 'estimate.json', { type: 'application/json' })] });
    q('#fileLoad').dispatchEvent(new w.Event('change'));
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  await loadEstimate(savedText);
  ok(w.eval('JSON.stringify(S)') === saved && w._R.tco.total === savedTco, 'JSON Load preserves original prices, metadata, parameters and totals under newer defaults');
  w.openWizard('skus'); w.applyWizard();
  ok(w.eval('S.lic.other[0].unit') === 19, 'loaded estimate SKU wizard uses saved catalogue snapshot');
  const old = JSON.parse(saved); delete old.parameters; delete old.meta.priceList; delete old.lic.copilot.callIntelligencePerUser;
  await loadEstimate(JSON.stringify(old));
  ok(w.eval('S.lic.p.premium') === 201 && w.eval('S.meta.priceBasis') === old.meta.priceBasis && w.eval('JSON.stringify(S.parameters)') === JSON.stringify(futurePricing.parameters), 'older estimates retain stored prices and receive defaults for missing parameters');
  ok(w.eval('S.lic.tel.teamsPhone') === 10, 'older estimates still receive the historical Teams Phone migration');
  q('#btnReset').click();
  ok(w.eval('S.lic.p.premium') === futurePricing.lic.p.premium && w.eval('S.parameters.skuPrices.powerBiPro') === futurePricing.parameters.skuPrices.powerBiPro, 'Reset starts with current embedded pricing');
  console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed'); process.exit(failed ? 1 : 0);
}, 800);
