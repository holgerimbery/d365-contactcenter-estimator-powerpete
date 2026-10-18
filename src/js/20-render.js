/* ===================== RENDER HELPERS ===================== */
let activeTab='setup';
function inp(path, type='num', opts={}){
  const v=get(path); const cls=(opts.ph?'ph ':'')+(type==='money'?'money':'');
  const attrs=`data-bind="${path}" data-type="${type}" class="${cls}" ${opts.step?`step="${opts.step}"`:''} ${opts.min!==undefined?`min="${opts.min}"`:''} ${opts.title?`title="${esc(opts.title)}"`:''}`;
  if(type==='money') return `<input type="number" step="any" ${attrs} value="${round(toDisp(Number(v)||0), opts.dec??2)}">`;
  if(type==='num') return `<input type="number" step="${opts.step||'any'}" ${attrs} value="${v??''}">`;
  if(type==='date') return `<input type="date" ${attrs} value="${esc(v)}">`;
  if(type==='text') return `<input type="text" ${attrs} value="${esc(v)}" ${opts.placeholder?`placeholder="${esc(opts.placeholder)}"`:''}>`;
  if(type==='select') return `<select ${attrs}>${opts.options.map(o=>`<option value="${esc(o[0])}" ${o[0]==v?'selected':''}>${esc(o[1])}</option>`).join('')}</select>`;
  if(type==='textarea') return `<textarea ${attrs} rows="3">${esc(v)}</textarea>`;
}
function round(v,d){ return Math.round(v*Math.pow(10,d))/Math.pow(10,d); }
function field(label, html, hint=''){ return `<div class="field"><label>${label}</label>${html}${hint?`<div class="hint">${hint}</div>`:''}</div>`; }
function delBtn(list, idx){ return `<button class="btn sm danger" data-action="del" data-list="${list}" data-idx="${idx}" title="Remove">✕</button>`; }
function addBtn(list, tpl, label){ return `<button class="btn sm" data-action="add" data-list="${list}" data-tpl="${tpl}">+ ${label}</button>`; }
const TPL = {
  other:()=>({name:'', qty:1, unit:0, per:'user-month'}),
  phase:()=>({name:'New phase', weeks:4}),
  wave:()=>({name:'Wave '+(S.impl.waves.length+1), agents:20}),
  grade:()=>({code:'', label:'', rate:0}),
  role:()=>({name:'New role', grade:'C', a:{}}),
  oneOff:()=>({name:'', amount:0}),
  ms:()=>({name:'Milestone', date:S.meta.startDate}),
  ams:()=>({name:'Support role', grade:'C', fte:.5}),
  otherMonthly:()=>({name:'', amount:0}),
  integ:()=>({name:'', complexity:'M', qty:1})
};
const CCY = () => SYM[S.meta.currency];

const LITE = () => BRAND.mode==='lite';
function contactBanner(what){ const c=BRAND.contact; return `<div class="contact-banner"><div><b>${what}</b><br><span class="small">Day rates are market averages and the model is generic. For a real Capgemini estimate, talk to ${esc(c.name)}, ${esc(c.role)}.</span></div><div class="grow"></div><div><a href="mailto:${esc(c.email)}?subject=D365%20Contact%20Center%20estimate">✉ ${esc(c.email)}</a> &nbsp; <a href="${esc(c.teams)}" target="_blank" rel="noopener">💬 Chat on Teams</a></div></div>`; }
/* ===================== TAB: SETUP ===================== */
function renderSetup(R){
  return `
  <div class="card"><h2>Engagement</h2>
    <div class="grid3">
      ${field('Client / opportunity', inp('meta.client','text'))}
      ${field('Prepared by', inp('meta.preparedBy','text'))}
      ${field('Estimate version', inp('meta.version','text'))}
      ${field('Project start date', inp('meta.startDate','date'))}
      ${field('Contract / TCO horizon (years)', inp('meta.termYears','num',{step:1,min:1}), 'Licence and runtime costs are modelled per month from project start over this horizon')}
      ${field('Display currency', inp('meta.currency','select',{options:[['EUR','EUR €'],['USD','USD $'],['GBP','GBP £']]}))}
    </div>
  </div>
  <div class="card"><h2>Currency conversion</h2>
    <p class="small muted">All prices and rates are stored in USD (Microsoft list-price basis) and converted for display and export. Edit the FX rates to match your deal or the local Microsoft price list.</p>
    <div class="grid3">
      ${field('1 USD = EUR', inp('meta.fx.EUR','num',{step:.01}))}
      ${field('1 USD = GBP', inp('meta.fx.GBP','num',{step:.01}))}
      ${field('1 USD = USD', '<input value="1" disabled>')}
    </div>
  </div>
  <div class="card"><h2>Assumptions & notes</h2>
    ${field('Price basis', inp('meta.priceBasis','text'))}
    <div style="height:8px"></div>
    ${field('Notes for the client / reviewer', inp('meta.notes','textarea'))}
  </div>
  <div class="card"><h2>Suggested order</h2>
    <table>
      <tr><td>1</td><td>Fill in client, start date and horizon above.</td></tr>
      <tr><td>2</td><td>Licensing tab: run the <b>users</b>, <b>Copilot credits</b>, <b>D365 AI agents</b>, <b>telephony</b> and <b>Dataverse</b> wizards; pick add-on SKUs.</td></tr>
      <tr><td>3</td><td>Implementation tab: run <b>Size from scope questions</b> or pick a preset; replace placeholder day rates; check roles and integrations.</td></tr>
      <tr><td>4</td><td>Plan tab: sanity-check dates and milestones.</td></tr>
      <tr><td>5</td><td>Runtime tab: run the <b>AMS</b> and <b>Azure</b> wizards.</td></tr>
      <tr><td>6</td><td>Summary tab, then <b>Export to Excel</b>. Save JSON to keep the scenario.</td></tr>
    </table>
  </div>
  <div class="card"><h2>How this estimator works</h2>
    <table>
      <tr><td><span class="pill impl">Implementation</span></td><td>${PARTNER} roles × grade day rate × FTE allocation per phase, plus expenses, contingency and one-offs. Spread across the plan by phase dates.</td></tr>
      <tr><td><span class="pill lic">Licensing</span></td><td>Per-user Microsoft licences. Auto-picks CS Premium vs CS Enterprise + Contact Center add-on per user type. Ramps up per go-live wave.</td></tr>
      <tr><td><span class="pill run">Consumption</span></td><td>Teams Phone extensibility (Teams Phone per voice rep, PSTN per service number and minutes), Copilot credits beyond included entitlement, Dataverse capacity overage, other SKUs, optional support uplift.</td></tr>
      <tr><td><span class="pill ams">AMS / support</span></td><td>${PARTNER} run roles (FTE × grade rate) starting after hypercare or at first go-live, plus other monthly run costs.</td></tr>
    </table>
  </div>`;
}

/* ===================== TAB: LICENSING ===================== */
function renderLic(R){
  const L=S.lic, lic=R.lic, c=L.copilot, t=L.tel, d=L.dv;
  const third=L.crm==='third';
  return `
  <div class="card">${wizBtn('users')}<h2>Platform & users</h2>
    <div class="grid3">
      ${field('CRM system', inp('lic.crm','select',{options:[['d365','Dynamics 365 Customer Service (native)'],['third','Third-party CRM (Salesforce, ServiceNow, …)']]}), 'Third-party CRM: Contact Center standalone SKUs, no CS Enterprise/Premium')}
      ${field('Licensing strategy', inp('lic.strategy','select',{options:[['auto','Auto: cheapest per user type'],['premium','Force CS Premium'],['attach','Force CS Enterprise + CC add-on']]}), third?'Not applicable for third-party CRM':'')}
      ${field('Users already holding CS Enterprise', inp('lic.existingCSE','num',{step:1,min:0}), 'These agents only need the Contact Center add-on')}
    </div>
    <div style="height:10px"></div>
    <div class="grid3">
      ${field('Agents: digital + voice (omnichannel)', inp('lic.agentsFull','num',{step:1,min:0}))}
      ${field('Agents: digital only', inp('lic.agentsDigital','num',{step:1,min:0}))}
      ${field('Agents: voice only', inp('lic.agentsVoice','num',{step:1,min:0}))}
      ${field('Supervisors / team leads', inp('lic.supervisors','num',{step:1,min:0}), 'Licensed like omnichannel agents')}
      ${field('Back-office / case workers (no live channels)', inp('lic.backoffice','num',{step:1,min:0}), third?'Not licensed via D365 in this scenario':'CS Enterprise')}
      ${field('Team Members (read / light)', inp('lic.teamMembers','num',{step:1,min:0}))}
    </div>
  </div>
  <div class="card"><h2>Licence prices (per user / month, ${CCY()})</h2>
    <div class="grid3">
      ${field('CS Premium (CSE + CC digital + voice, incl. 1,000 Copilot credits/user for D365 agents)', inp('lic.p.premium','money'))}
      ${field('CS Enterprise', inp('lic.p.cse','money'))}
      ${field('Team Member', inp('lic.p.teamMember','money'))}
      ${field('CC add-on for CSE: digital + voice', inp('lic.p.ccAddFull','money'), 'Only for users who hold CS Enterprise')}
      ${field('CC add-on for CSE: digital', inp('lic.p.ccAddDigital','money'))}
      ${field('CC add-on for CSE: voice', inp('lic.p.ccAddVoice','money'))}
      ${field('Contact Center standalone: digital + voice', inp('lic.p.ccFull','money'), 'Third-party CRM')}
      ${field('Contact Center standalone: digital', inp('lic.p.ccDigital','money'))}
      ${field('Contact Center standalone: voice', inp('lic.p.ccVoice','money'))}
    </div>
    <p class="small muted" style="margin-top:8px">October 2026 list prices. CC Voice and the full CC licence include 2,000 Intelligent Voicebot minutes, 6,000 call intelligence minutes and 35 GB Dataverse file per user/month (pooled per tenant). Teams Phone is not included; see Telephony.</p>
  </div>
  <div class="card"><h2>Licence result (100% ramp)</h2>
    <div class="tbl-wrap"><table>
      <tr><th>SKU</th><th class="r">Users</th><th class="r">Unit / month</th><th class="r">Monthly</th><th class="r">Annual</th></tr>
      ${lic.rows.map(r=>`<tr><td>${esc(r.name)}${r.note?` <span class="tag">${esc(r.note)}</span>`:''}</td><td class="num">${fmtN(r.qty)}</td><td class="num">${fmt(r.unit,2)}</td><td class="num">${fmt(r.monthly)}</td><td class="num">${fmt(r.monthly*12)}</td></tr>`).join('')}
      <tr class="total"><td>Total licences</td><td class="num">${fmtN(lic.totalUsers)}</td><td></td><td class="num">${fmt(lic.monthly)}</td><td class="num">${fmt(lic.annual)}</td></tr>
    </table></div>
    <p class="small muted" style="margin-top:8px">${lic.premiumUsers} CS Premium users → ${fmtN(lic.premiumUsers*c.includedPerPremium)} included Copilot credits per month (Dynamics 365 agents & tools only). ${fmtN(lic.voiceUsers)} voice-licensed users → ${fmtN(lic.voiceUsers*c.voicebotPerUser)} Intelligent Voicebot minutes per month.</p>
  </div>
  <div class="card">${wizBtn('copilot')}<h2>Copilot Studio credits</h2>
    <div class="grid3">
      ${field('Digital self-service sessions / month (chat, messaging bots)', inp('lic.copilot.sessions','num',{step:100}))}
      ${field('Average credits per session', inp('lic.copilot.creditsPerSession','num',{step:1}), 'Classic answer 1, generative answer 2, agent action 5, tenant graph grounding 10; blend for your flows')}
      ${field('Extra credits / month (custom agent-assist, autonomous agents)', inp('lic.copilot.extraCredits','num',{step:1000}))}
      ${field('Voice bot minutes / month (Copilot Studio IVR)', inp('lic.copilot.voiceMin','num',{step:1000}), 'Billed per minute; actions and answers inside the call are included')}
      ${field('Voice bot tier', inp('lic.copilot.voiceTier','select',{options:[['classic','Classic voice (classic orchestration)'],['genai','GenAI voice (generative orchestration)']]}), 'Premium GenAI voice: Customer Assist Agent below')}
      ${field('Credits per voice minute: classic / GenAI', `<div style="display:flex;gap:6px">${inp('lic.copilot.classicVoiceRate','num',{step:1})}${inp('lic.copilot.genaiVoiceRate','num',{step:1})}</div>`, 'Classic minutes are covered by the included voicebot minutes first')}
      ${field('Included voicebot minutes per voice user', inp('lic.copilot.voicebotPerUser','num',{step:100}))}
      ${field('Included credits per Premium user', inp('lic.copilot.includedPerPremium','num',{step:100}), 'Offsets Dynamics 365 AI agents only')}
      ${field('Purchase model for overage', inp('lic.copilot.model','select',{options:[['auto','Cheapest option'],['packs','Credit packs'],['payg','Pay-as-you-go'],['prepaid','Pre-purchase plan (annual commit)']]}))}
      ${field('Pack: credits / price per month', `<div style="display:flex;gap:6px">${inp('lic.copilot.packCredits','num',{step:1000})}${inp('lic.copilot.packPrice','money')}</div>`)}
      ${field('PAYG price per credit', inp('lic.copilot.paygPerCredit','money',{dec:4}))}
      ${field('Pre-purchase discount on PAYG (%)', inp('lic.copilot.prepaidDiscount','num',{step:1}), '5% (entry tier) to 20% (largest tier)')}
    </div>
    <p class="small" style="margin-top:8px">Copilot Studio ${fmtN(R.cons.copilot.csNeed)}${R.cons.copilot.voiceMin?` (voice bot ${fmtN(R.cons.copilot.voiceCredits)})`:''} + D365 agents ${fmtN(R.cons.copilot.d365Need)} − Premium allowance used ${fmtN(R.cons.copilot.inclUsed)} = overage ${fmtN(R.cons.copilot.over)} → <b>${fmt(R.cons.copilot.cost)}/month</b> (${esc(R.cons.copilot.note)})</p>
  </div>
  <div class="card">${wizBtn('d365ai','Configure agents')}<h2>Dynamics 365 AI agents (Copilot credits)</h2>
    <p class="small muted">Prebuilt agents in Customer Service and Contact Center draw from the same Copilot credit pool. Formulas follow Microsoft's agent usage estimator. Copilot features included in the licence (case & conversation summaries, email drafting, real-time assist) cost no credits.</p>
    <div class="tbl-wrap"><table><tr><th>Agent</th><th>Breakdown</th><th class="r">Credits / month</th><th class="r">≈ cost / month</th></tr>
      ${R.cons.d365.rows.length? R.cons.d365.rows.map(r=>`<tr><td>${esc(r.name)}</td><td class="small muted">${esc(r.detail)}</td><td class="num">${fmtN(r.credits)}</td><td class="num">${fmt(r.credits*(R.cons.copilot.unit||L.copilot.paygPerCredit))}</td></tr>`).join('') : `<tr><td colspan="4" class="muted">No agents enabled. Use “Configure agents” to switch on Customer Intent, Case Management, Knowledge Management, Quality Assurance or Customer Assist agents.</td></tr>`}
      <tr class="total"><td colspan="2">Dynamics 365 AI agents</td><td class="num">${fmtN(R.cons.d365.total)}</td><td class="num">${fmt(R.cons.d365.total*(R.cons.copilot.unit||L.copilot.paygPerCredit))}</td></tr>
    </table></div>
    <p class="small muted" style="margin-top:6px">Credit pool: Copilot Studio ${fmtN(R.cons.copilot.csNeed)} + D365 agents ${fmtN(R.cons.copilot.d365Need)} = ${fmtN(R.cons.copilot.need)} needed · ${fmtN(R.cons.copilot.inclUsed)} of ${fmtN(R.cons.copilot.incl)} Premium credits used by D365 agents · overage ${fmtN(R.cons.copilot.over)} → <b>${fmt(R.cons.copilot.cost)}/month</b>.${R.cons.d365.oneoff?` One-off bulk knowledge harvesting ≈ ${fmtN(R.cons.d365.oneoff)} credits, booked as an implementation one-off.`:''}</p>
  </div>
  <div class="card">${wizBtn('tel')}<h2>Telephony (Teams Phone extensibility)</h2>
    <div class="note info">Azure Communication Services voice is retired for Dynamics 365 Contact Center: no new ACS numbers since 30 Sep 2026, end of service 30 Sep 2028. Voice runs on Teams Phone extensibility. Each voice rep needs Teams Phone; each service number needs a free Teams Phone Resource Account with PSTN on it. Per-user Calling Plans can't be pooled for the contact center: Calling Plan numbers need the pay-as-you-go Calling Plan on the resource account, with all outbound minutes metered for the whole organisation.</div>
    <div class="grid3">
      ${field('PSTN connectivity', inp('lic.tel.mode','select',{options:[['teams-payg','Microsoft Teams pay-as-you-go Calling Plan'],['teams-oc','Operator Connect (carrier-managed)'],['teams-dr','Direct Routing (own SBC + carrier)']]}))}
      ${field('Inbound minutes / month', inp('lic.tel.inboundMin','num',{step:1000}))}
      ${field('Outbound minutes / month', inp('lic.tel.outboundMin','num',{step:1000}))}
      ${field('Service phone numbers (resource accounts)', inp('lic.tel.numbers','num',{step:1}))}
      ${field('Teams Phone Standard per rep', inp('lic.tel.teamsPhone','money'))}
      ${field('Voice reps needing Teams Phone (0 = auto)', inp('lic.tel.teamsUsers','num',{step:1}), `Auto: ${fmtN(R.lic.liveVoiceUsers)} voice agents & supervisors`)}
      ${field('Reps already licensed for Teams Phone (Microsoft 365 E5)', inp('lic.tel.e5Users','num',{step:1}), 'Reps also need a Teams licence (M365 / O365 suite or Teams Enterprise)')}
      ${t.mode==='teams-payg'
        ? field('Pay-as-you-go Calling Plan per resource account', inp('lic.tel.paygRA','money'), 'Zone 1 (US, UK, CA) $3 · Zone 2 (most of Europe) $4')
          + field('Inbound on toll-free numbers (%)', inp('lic.tel.tollFreePct','num',{step:5}), 'Inbound to geographic numbers is included')
          + field('Toll-free inbound per minute', inp('lic.tel.tfIn','money',{dec:4}))
          + field('Outbound to mobile (%)', inp('lic.tel.outMobilePct','num',{step:5}))
          + field('Outbound per minute: landline / mobile', `<div style="display:flex;gap:6px">${inp('lic.tel.outLandline','money',{dec:4})}${inp('lic.tel.outMobile','money',{dec:4})}</div>`, 'Indicative; check the Teams rate card for your country')
        : field('Carrier fee per service number / month', inp('lic.tel.ocNumber','money'))
          + field('Carrier inbound / outbound per minute', `<div style="display:flex;gap:6px">${inp('lic.tel.ocIn','money',{dec:4})}${inp('lic.tel.ocOut','money',{dec:4})}</div>`, t.mode==='teams-oc'?'Confirm the carrier supports on-behalf-of outbound calls for Teams Phone extensibility':'Your existing carrier contract')
          + (t.mode==='teams-dr' ? field('SBC / SBC-as-a-service per month', inp('lic.tel.sbcMonthly','money')) : '')
      }
    </div>
    <p class="small" style="margin-top:8px">Telephony: <b>${fmt(R.cons.telephony)}/month</b> (${fmtN(R.cons.teamsPhoneUsers)} Teams Phone licences). Call recording and transcription are part of the Contact Center voice licence; storage lands in Dataverse file capacity.</p>
  </div>
  <div class="card">${wizBtn('dv')}<h2>Dataverse capacity</h2>
    <div class="grid3">
      ${field('Expected database (GB)', inp('lic.dv.dbGB','num'))}
      ${field('Expected file (GB) — recordings, transcripts, attachments', inp('lic.dv.fileGB','num'))}
      ${field('Expected log (GB)', inp('lic.dv.logGB','num'))}
      ${field('Included DB: tenant + per user (GB)', `<div style="display:flex;gap:6px">${inp('lic.dv.inclDb','num')}${inp('lic.dv.inclDbPerUser','num',{step:.05})}</div>`)}
      ${field('Included file: tenant + per user · per voice user (GB)', `<div style="display:flex;gap:6px">${inp('lic.dv.inclFile','num')}${inp('lic.dv.inclFilePerUser','num',{step:.5})}${inp('lic.dv.inclFileVoice','num',{step:1})}</div>`, 'Voice users: CC Voice, full CC and CS Premium (35 GB for call recording)')}
      ${field('Included log (GB)', inp('lic.dv.inclLog','num'))}
      ${field('Price per GB / month: DB · file · log', `<div style="display:flex;gap:6px">${inp('lic.dv.pDb','money')}${inp('lic.dv.pFile','money')}${inp('lic.dv.pLog','money')}</div>`)}
    </div>
    <p class="small" style="margin-top:8px">Dataverse overage: <b>${fmt(R.cons.dataverse)}/month</b>.</p>
  </div>
  <div class="card">${wizBtn('skus','Pick from catalogue')}<h2>Other Microsoft SKUs</h2>
    <div class="tbl-wrap"><table>
      <tr><th>Item</th><th>Qty</th><th>Unit price (${CCY()})</th><th>Per</th><th></th></tr>
      ${L.other.map((o,i)=>`<tr><td>${inp(`lic.other.${i}.name`,'text',{placeholder:'e.g. Power BI Pro, Fabric F2, Power Automate premium'})}</td><td class="w-s">${inp(`lic.other.${i}.qty`,'num')}</td><td class="w-m">${inp(`lic.other.${i}.unit`,'money')}</td><td class="w-m">${inp(`lic.other.${i}.per`,'select',{options:[['user-month','user / month'],['month','month'],['year','year']]})}</td><td>${delBtn('lic.other',i)}</td></tr>`).join('')}
    </table></div>
    <div class="actions">${addBtn('lic.other','other','Add SKU')}</div>
  </div>`;
}

/* ===================== TAB: IMPLEMENTATION ===================== */
function phaseCols(){
  const I=S.impl;
  if(I.model==='single') return I.single.map((p,i)=>({key:'s'+i, label:p.name, weeks:p.weeks}));
  return [...I.foundation.map((p,i)=>({key:'f'+i, label:p.name, weeks:p.weeks, grp:'Foundation'})), ...I.waveTpl.map((p,i)=>({key:'w'+i, label:p.name, weeks:p.weeks, grp:'Per wave'}))];
}
function renderImpl(R){
  const I=S.impl, cols=phaseCols(), impl=R.impl;
  const banner = LITE()? contactBanner('Implementation, phasing and roles are illustrative in this free calculator.') : '';
  const phaseTable=(list, title)=>`<h3>${title}</h3><table><tr><th>Phase</th><th style="width:90px">Weeks</th><th></th></tr>
    ${get(list).map((p,i)=>`<tr><td>${inp(`${list}.${i}.name`,'text')}</td><td>${inp(`${list}.${i}.weeks`,'num',{step:1,min:0})}</td><td>${delBtn(list,i)}</td></tr>`).join('')}</table>
    <div class="actions">${addBtn(list,'phase','Add phase')}</div>`;
  return banner+`
  <div class="card">${wizBtn('scope','Size from scope questions')}<h2>Project size preset</h2>
    <p class="small muted">Pick the closest fit to prefill phases, roles, integrations, contingency and milestones. Then adjust below. Current: <b>${I.preset==='custom'?'custom (edited)':PRESETS[I.preset]?PRESETS[I.preset].label:'custom'}</b>.</p>
    <div class="presets">${Object.entries(PRESETS).map(([k,p])=>`<button class="preset ${I.preset===k?'active':''}" data-preset="${k}"><span class="t">${p.label}</span><span class="m">${p.meta}</span><span class="s">${p.desc}</span></button>`).join('')}</div>
  </div>
  <div class="card"><h2>Delivery model & phasing</h2>
    <div class="grid3">
      ${field('Rollout model', inp('impl.model','select',{options:[['single','Single go-live (standard phases)'],['waves','Wave-based rollout (countries / business units)']]}))}
      ${I.model==='waves'?field('Weeks between wave starts', inp('impl.stagger','num',{step:1,min:0}), 'Waves overlap when this is shorter than a wave'):''}
      ${field('Expenses & travel (% of services)', inp('impl.expensesPct','num',{step:.5}))}
      ${field('Contingency (% of services + expenses)', inp('impl.contingencyPct','num',{step:1}))}
    </div>
    <div style="height:12px"></div>
    ${I.model==='single' ? phaseTable('impl.single','Phases (sequential from project start)') : `<div class="grid2">
        <div>${phaseTable('impl.foundation','Foundation phases (once, sequential)')}</div>
        <div>${phaseTable('impl.waveTpl','Phase template per wave (repeated per wave)')}</div></div>
      <div style="height:12px"></div>
      <h3>Waves</h3><table><tr><th>Wave</th><th style="width:110px">Agents live</th><th></th></tr>
      ${I.waves.map((w,i)=>`<tr><td>${inp(`impl.waves.${i}.name`,'text')}</td><td>${inp(`impl.waves.${i}.agents`,'num',{step:1,min:0})}</td><td>${delBtn('impl.waves',i)}</td></tr>`).join('')}</table>
      <div class="actions">${addBtn('impl.waves','wave','Add wave')}</div>
      <p class="small muted" style="margin-top:6px">Agents per wave drive the licence ramp (share of total wave agents goes live at each wave go-live).</p>`}
  </div>
  <div class="card"><h2>${LITE()?'Grades & day rates':'Capgemini grades & day rates'} (${CCY()})</h2>
    <div class="note${LITE()?' info':''}">${LITE()? esc(BRAND.gradesNote||'Indicative market day rates; adjust to your market.') : 'Rates in yellow are placeholders. Replace them with the applicable Capgemini rate card for the client / country before you share anything.'}</div>
    <div class="tbl-wrap"><table><tr><th>Grade</th><th>Label</th><th>Day rate</th><th></th></tr>
      ${I.grades.map((g,i)=>`<tr><td class="w-s">${inp(`impl.grades.${i}.code`,'text')}</td><td>${inp(`impl.grades.${i}.label`,'text')}</td><td class="w-m">${inp(`impl.grades.${i}.rate`,'money',{ph:!LITE(),dec:0})}</td><td>${delBtn('impl.grades',i)}</td></tr>`).join('')}
    </table></div>
    <div class="actions">${addBtn('impl.grades','grade','Add grade')}</div>
  </div>
  <div class="card"><h2>Roles & allocation (FTE per phase)</h2>
    <p class="small muted">Effort = phase weeks × 5 days × FTE. ${I.model==='waves'?'“Per wave” columns apply to every wave.':''}</p>
    <div class="tbl-wrap"><table>
      <tr><th>Role</th><th>Grade</th>${cols.map(c=>`<th class="r" title="${esc(c.label)}">${c.grp?`<span class="muted">${c.grp}</span><br>`:''}${esc(c.label)}<br><span class="muted">${c.weeks} wk</span></th>`).join('')}<th class="r">Days</th><th class="r">Cost</th><th></th></tr>
      ${I.roles.map((r,i)=>{ const br=impl.byRole[i]; return `<tr><td>${inp(`impl.roles.${i}.name`,'text')}</td><td class="w-s">${inp(`impl.roles.${i}.grade`,'select',{options:I.grades.map(g=>[g.code,g.code])})}</td>
        ${cols.map(c=>`<td class="w-s">${inp(`impl.roles.${i}.a.${c.key}`,'num',{step:.1,min:0})}</td>`).join('')}
        <td class="num">${fmtN(br.days,0)}</td><td class="num">${fmt(br.cost)}</td><td>${delBtn('impl.roles',i)}</td></tr>`; }).join('')}
      <tr class="total"><td colspan="${2+cols.length}">Roles subtotal (integrations below)</td><td class="num">${fmtN(impl.totalDays-impl.integ.days,0)}</td><td class="num">${fmt(impl.roleServices)}</td><td></td></tr>
    </table></div>
    <div class="actions">${addBtn('impl.roles','role','Add role')}</div>
  </div>
  <div class="card">${wizBtn('integ','Pick from catalogue')}<h2>Integrations</h2>
    <p class="small muted">Effort per integration = days for its complexity × quantity, split across the roles below and spread over build/test phases in the plan.</p>
    <div class="tbl-wrap"><table><tr><th>Integration</th><th style="width:130px">Complexity</th><th style="width:70px">Qty</th><th class="r">Days</th><th></th></tr>
      ${I.integrations.map((it,i)=>`<tr><td>${inp(`impl.integrations.${i}.name`,'text')}</td><td>${inp(`impl.integrations.${i}.complexity`,'select',{options:[['S','Simple'],['M','Medium'],['C','Complex']]})}</td><td>${inp(`impl.integrations.${i}.qty`,'num',{step:1,min:1})}</td><td class="num">${fmtN(impl.integ.rows[i].days)}</td><td>${delBtn('impl.integrations',i)}</td></tr>`).join('')}
      <tr class="total"><td colspan="3">Integration effort (${I.integrations.length} items)</td><td class="num">${fmtN(impl.integ.days)}</td><td></td></tr>
    </table></div>
    <div class="actions">${addBtn('impl.integrations','integ','Add integration')}</div>
    <div style="height:12px"></div>
    <div class="grid2">
      <div><h3>Days per complexity</h3><table><tr><td>Simple</td><td class="w-s">${inp('impl.intDays.S','num',{step:1})}</td><td>Medium</td><td class="w-s">${inp('impl.intDays.M','num',{step:1})}</td><td>Complex</td><td class="w-s">${inp('impl.intDays.C','num',{step:1})}</td></tr></table></div>
      <div><h3>Effort split by role</h3><table><tr><th>Role</th><th>Grade</th><th>Share</th><th class="r">Days</th><th class="r">Cost</th></tr>
        ${I.intRoles.map((r,i)=>`<tr><td>${inp(`impl.intRoles.${i}.name`,'text')}</td><td class="w-s">${inp(`impl.intRoles.${i}.grade`,'select',{options:I.grades.map(g=>[g.code,g.code])})}</td><td class="w-s">${inp(`impl.intRoles.${i}.share`,'num',{step:.05})}</td><td class="num">${fmtN(impl.integ.byRole[i].days,0)}</td><td class="num">${fmt(impl.integ.byRole[i].cost)}</td></tr>`).join('')}
        <tr class="total"><td colspan="3">Integrations ${Math.abs(I.intRoles.reduce((s,r)=>s+Number(r.share),0)-1)>.001?'<span class="tag warn">shares ≠ 100%</span>':''}</td><td class="num">${fmtN(impl.integ.days,0)}</td><td class="num">${fmt(impl.integ.cost)}</td></tr>
      </table></div>
    </div>
  </div>
  <div class="card"><h2>One-off items (${CCY()})</h2>
    <table><tr><th>Item</th><th style="width:160px">Amount</th><th></th></tr>
      ${I.oneOff.map((o,i)=>`<tr><td>${inp(`impl.oneOff.${i}.name`,'text',{placeholder:'e.g. third-party WFM connector, data migration tooling, travel'})}</td><td>${inp(`impl.oneOff.${i}.amount`,'money',{dec:0})}</td><td>${delBtn('impl.oneOff',i)}</td></tr>`).join('')}
    </table><div class="actions">${addBtn('impl.oneOff','oneOff','Add item')}</div>
  </div>
  <div class="card"><h2>Implementation cost summary</h2>
    <table>
      <tr><td>Roles (${fmtN(impl.totalDays-impl.integ.days,0)} days)</td><td class="num">${fmt(impl.roleServices)}</td></tr>
      <tr><td>Integrations (${fmtN(impl.integ.days,0)} days)</td><td class="num">${fmt(impl.integ.cost)}</td></tr>
      <tr><td>Services subtotal</td><td class="num">${fmt(impl.services)}</td></tr>
      <tr><td>Expenses & travel (${I.expensesPct}%)</td><td class="num">${fmt(impl.expenses)}</td></tr>
      <tr><td>Contingency (${I.contingencyPct}%)</td><td class="num">${fmt(impl.contingency)}</td></tr>
      <tr><td>One-off items${impl.aiOneOff?` (incl. AI bulk knowledge harvesting ${fmt(impl.aiOneOff)})`:''}</td><td class="num">${fmt(impl.oneOff)}</td></tr>
      <tr class="total"><td>Total implementation</td><td class="num">${fmt(impl.total)}</td></tr>
    </table>
    <div style="height:14px"></div>
    <h3>Cost by phase</h3>
    <div class="tbl-wrap"><table><tr><th>Phase</th><th>Start</th><th>End</th><th class="r">Weeks</th><th class="r">Services</th></tr>
      ${R.plan.phases.map(ph=>`<tr><td>${ph.waveName?`<span class="muted">${esc(ph.waveName)} · </span>`:''}${esc(ph.name)}</td><td>${fmtDate(ph.start)}</td><td>${fmtDate(ph.end)}</td><td class="num">${ph.weeks}</td><td class="num">${fmt(impl.byPhase[ph.key+(ph.wave??'')]||0)}</td></tr>`).join('')}
    </table></div>
  </div>`;
}

/* ===================== TAB: PLAN ===================== */
function milestones(R){
  const P=R.plan, ms=[]; ms.push({name:'Project kick-off', date:S.meta.startDate, kind:'auto'});
  P.phases.forEach(ph=>{ if(ph.kind==='hyper'){ ms.push({name:(ph.waveName?ph.waveName+': ':'')+'Go-live', date:ph.start, kind:'golive'}); ms.push({name:(ph.waveName?ph.waveName+': ':'')+'Hypercare exit', date:ph.end, kind:'auto'}); }
    else ms.push({name:(ph.waveName?ph.waveName+': ':'')+ph.name+' complete', date:ph.end, kind:'auto'}); });
  S.impl.milestonesCustom.forEach(m=>ms.push({name:m.name, date:m.date, kind:'custom'}));
  ms.sort((a,b)=>a.date<b.date?-1:1); return ms;
}
function renderPlan(R){
  const P=R.plan, start=S.meta.startDate, end=P.end; const totalDays=Math.max(1,daysBetween(start,end)); const ms=milestones(R);
  const pct=d=>Math.max(0,Math.min(100,daysBetween(start,d)/totalDays*100));
  // month ticks
  let ticks=''; { let d=new Date(start+'T00:00:00'); d.setDate(1); d.setMonth(d.getMonth()+1); while(d<new Date(end+'T00:00:00')){ const iso=d.toISOString().slice(0,10); ticks+=`<span style="left:${pct(iso)}%">${d.toLocaleDateString('en-GB',{month:'short',year:'2-digit'})}</span>`; d.setMonth(d.getMonth()+1);} }
  const rows=P.phases.map(ph=>`<div class="row"><div class="lbl ${ph.wave!==undefined?'wave':''}" title="${esc(ph.name)}">${ph.waveName&&ph.key==='w0'?`<b>${esc(ph.waveName)}</b> · `:''}${esc(ph.name)}</div><div class="track"><div class="bar ${ph.kind==='hyper'?'hyper':ph.wave!==undefined?'wave':''}" style="left:${pct(ph.start)}%;width:${Math.max(.5,pct(ph.end)-pct(ph.start))}%" title="${fmtDate(ph.start)} – ${fmtDate(ph.end)}"></div></div></div>`).join('');
  const msRow=`<div class="row"><div class="lbl"><b>Milestones</b></div><div class="track" style="background:transparent">${ms.filter(m=>m.kind==='golive'||m.kind==='custom').map(m=>`<div class="ms" style="left:${pct(m.date)}%" title="${esc(m.name)} ${fmtDate(m.date)}"></div>`).join('')}</div></div>`;
  return (LITE()?contactBanner('Plan and milestones follow the illustrative implementation model.'):'')+`
  <div class="card"><h2>Timeline</h2>
    <p class="small muted">${fmtDate(start)} → ${fmtDate(end)} · ${fmtN(totalDays/7,0)} weeks · ${P.golives.length} go-live${P.golives.length>1?'s':''}. Change dates and durations on the Implementation tab.</p>
    <div class="gantt">
      <div class="row head"><div class="lbl">Phase</div><div class="months">${ticks}</div></div>
      ${rows}${msRow}
    </div>
    <div class="legend"><span><i style="background:var(--blue)"></i>Foundation / main phase</span><span><i style="background:var(--teal)"></i>Wave phase</span><span><i style="background:var(--ams)"></i>Go-live & hypercare</span><span><i style="background:var(--red);border-radius:0"></i>Go-live / custom milestone</span></div>
  </div>
  <div class="card"><h2>Milestones</h2>
    <div class="tbl-wrap"><table><tr><th>Milestone</th><th>Date</th><th>Type</th></tr>
      ${ms.map(m=>`<tr><td>${esc(m.name)}</td><td class="num">${fmtDate(m.date)}</td><td><span class="tag ${m.kind==='golive'?'ok':''}">${m.kind}</span></td></tr>`).join('')}
    </table></div>
    <div style="height:12px"></div>
    <h3>Custom milestones</h3>
    <table><tr><th>Name</th><th style="width:170px">Date</th><th></th></tr>
      ${S.impl.milestonesCustom.map((m,i)=>`<tr><td>${inp(`impl.milestonesCustom.${i}.name`,'text')}</td><td>${inp(`impl.milestonesCustom.${i}.date`,'date')}</td><td>${delBtn('impl.milestonesCustom',i)}</td></tr>`).join('')}
    </table><div class="actions">${addBtn('impl.milestonesCustom','ms','Add milestone')}</div>
  </div>
  <div class="card"><h2>Licence & support ramp</h2>
    <table><tr><th>Event</th><th>Date</th><th class="r">Licence share live</th></tr>
      ${P.golives.map((g,i)=>{ const cum=P.golives.slice(0,i+1).reduce((s,x)=>s+x.share,0); return `<tr><td>${esc(g.name)}</td><td class="num">${fmtDate(g.date)}</td><td class="num">${fmtN(Math.min(100,cum*100),0)}%</td></tr>`; }).join('')}
      <tr><td>AMS / support starts</td><td class="num">${fmtDate(S.run.amsStart==='golive'?P.golives[0].date:P.hypercareEnd)}</td><td></td></tr>
    </table>
    <p class="small muted" style="margin-top:6px">Licence start rule: <b>${{golive:'ramp per go-live',build:'from build start (dev/test users)',project:'from project start'}[S.run.licenseStart]}</b> — change on the Runtime tab.</p>
  </div>`;
}

/* ===================== TAB: RUNTIME ===================== */
function renderRun(R){
  const Rn=S.run, ams=R.ams, cons=R.cons, lic=R.lic;
  return (LITE()?contactBanner('AMS / run team sizing is illustrative; licences and consumption below are the real numbers.'):'')+`
  <div class="card"><h2>Run settings</h2>
    <div class="grid3">
      ${field('Licences start', inp('run.licenseStart','select',{options:[['golive','At go-live (ramp per wave)'],['build','From build start'],['project','From project start']]}))}
      ${field('AMS / support starts', inp('run.amsStart','select',{options:[['hypercare','After hypercare'],['golive','At first go-live']]}))}
      ${field('Billable days per FTE per year', inp('run.daysPerFteYear','num',{step:5}))}
      ${field('Support uplift (% of annual licence value)', inp('run.supportPct','num',{step:.5}), 'e.g. Microsoft Unified Support share allocated to this platform')}
    </div>
  </div>
  <div class="card">${wizBtn('ams')}<h2>${PARTNER} AMS / run roles</h2>
    <p class="small muted">The run team is resized whenever you apply a size preset or the scope wizard (scale, languages, AI level, regulated, WFM). Hypercare effort sits in the plan phases. Use the AMS wizard to size it on its own.</p>
    <div class="tbl-wrap"><table><tr><th>Role</th><th>Grade</th><th>FTE</th><th class="r">Day rate</th><th class="r">Annual</th><th></th></tr>
      ${Rn.ams.map((a,i)=>`<tr><td>${inp(`run.ams.${i}.name`,'text')}</td><td class="w-s">${inp(`run.ams.${i}.grade`,'select',{options:S.impl.grades.map(g=>[g.code,g.code])})}</td><td class="w-s">${inp(`run.ams.${i}.fte`,'num',{step:.1,min:0})}</td><td class="num">${fmt(ams.rows[i].rate)}</td><td class="num">${fmt(ams.rows[i].annual)}</td><td>${delBtn('run.ams',i)}</td></tr>`).join('')}
      <tr class="total"><td colspan="4">AMS per year</td><td class="num">${fmt(ams.annual)}</td><td></td></tr>
    </table></div>
    <div class="actions">${addBtn('run.ams','ams','Add role')}</div>
  </div>
  <div class="card">${wizBtn('azure','Estimate Azure footprint')}<h2>Other monthly run costs (${CCY()})</h2>
    <table><tr><th>Item</th><th style="width:160px">Per month</th><th></th></tr>
      ${Rn.otherMonthly.map((o,i)=>`<tr><td>${inp(`run.otherMonthly.${i}.name`,'text',{placeholder:'e.g. Azure resources, third-party WFM, monitoring'})}</td><td>${inp(`run.otherMonthly.${i}.amount`,'money',{dec:0})}</td><td>${delBtn('run.otherMonthly',i)}</td></tr>`).join('')}
    </table><div class="actions">${addBtn('run.otherMonthly','otherMonthly','Add item')}</div>
  </div>
  <div class="card"><h2>Steady-state run cost (per month at 100% ramp)</h2>
    <div class="tbl-wrap"><table><tr><th>Item</th><th>Basis</th><th class="r">Monthly</th><th class="r">Annual</th></tr>
      <tr><td><span class="pill lic">Licences</span></td><td>${fmtN(lic.totalUsers)} users</td><td class="num">${fmt(lic.monthly)}</td><td class="num">${fmt(lic.annual)}</td></tr>
      ${cons.rows.map(r=>`<tr class="sub"><td>${esc(r.name)}</td><td class="small">${esc(r.detail)}</td><td class="num">${fmt(r.monthly)}</td><td class="num">${fmt(r.monthly*12)}</td></tr>`).join('')}
      <tr><td>Support uplift</td><td>${Rn.supportPct}% of licences</td><td class="num">${fmt(lic.annual*Rn.supportPct/100/12)}</td><td class="num">${fmt(lic.annual*Rn.supportPct/100)}</td></tr>
      <tr><td><span class="pill ams">${PARTNER} AMS</span></td><td>${fmtN(ams.rows.reduce((s,r)=>s+r.fte,0),1)} FTE</td><td class="num">${fmt(ams.monthly)}</td><td class="num">${fmt(ams.annual)}</td></tr>
      <tr><td>Other run costs</td><td></td><td class="num">${fmt(ams.otherMonthly)}</td><td class="num">${fmt(ams.otherMonthly*12)}</td></tr>
      <tr class="total"><td colspan="2">Total run rate</td><td class="num">${fmt(lic.monthly+cons.monthly+lic.annual*Rn.supportPct/100/12+ams.monthly+ams.otherMonthly)}</td><td class="num">${fmt((lic.monthly+cons.monthly+ams.monthly+ams.otherMonthly)*12+lic.annual*Rn.supportPct/100)}</td></tr>
    </table></div>
  </div>`;
}

/* ===================== TAB: SUMMARY ===================== */
function svgChart(months, w=800, h=220){
  const max=Math.max(1,...months.map(m=>m.total)); const pad={l:60,r:10,t:10,b:28}; const bw=(w-pad.l-pad.r)/months.length; const sc=(h-pad.t-pad.b)/max;
  let bars=''; months.forEach((m,i)=>{ let y=h-pad.b; const x=pad.l+i*bw; [['impl',m.impl],['lic',m.lic],['run',m.cons],['ams',m.ams]].forEach(([k,v])=>{ const hh=v*sc; y-=hh; bars+=`<rect x="${x+1}" y="${y}" width="${Math.max(1,bw-2)}" height="${hh}" fill="var(--${k})"><title>M${i+1} ${k}: ${fmt(v)}</title></rect>`; });
    if(i%12===0) bars+=`<text x="${x}" y="${h-8}" font-size="10" fill="#5B677A">Y${i/12+1}</text>`; });
  const yt=[0,.5,1].map(f=>`<text x="${pad.l-6}" y="${h-pad.b-f*max*sc+3}" font-size="10" text-anchor="end" fill="#5B677A">${fmt(f*max)}</text><line x1="${pad.l}" x2="${w-pad.r}" y1="${h-pad.b-f*max*sc}" y2="${h-pad.b-f*max*sc}" stroke="#E7EAF0"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" font-family="var(--mono)">${yt}${bars}</svg>`;
}
function renderSummary(R){
  const t=R.tco, yrs=R.years, impl=R.impl, lic=R.lic;
  const share=v=>t.total?fmtN(v/t.total*100,0)+'%':'-';
  const liteTop = LITE()? `
  <div class="card"><h2>${esc(S.meta.client||'Estimate')} — licensing & consumption</h2>
    <div class="grid3">
      <div class="kpi big"><span class="l">Licences per year</span><span class="v">${fmt(lic.annual)}</span></div>
      <div class="kpi big"><span class="l">Consumption per year</span><span class="v">${fmt(R.cons.monthly*12)}</span></div>
      <div class="kpi big"><span class="l">${S.meta.termYears}-yr licences + consumption</span><span class="v">${fmt(t.lic+t.cons)}</span></div>
    </div>
    <div class="tbl-wrap" style="margin-top:10px"><table>
      <tr><th>Year</th><th class="r">Licences</th><th class="r">Consumption & support</th><th class="r">Total</th></tr>
      ${yrs.map(y=>`<tr><td>Year ${y.year}</td><td class="num">${fmt(y.lic)}</td><td class="num">${fmt(y.cons)}</td><td class="num">${fmt(y.lic+y.cons)}</td></tr>`).join('')}
      <tr class="total"><td>Total</td><td class="num">${fmt(t.lic)}</td><td class="num">${fmt(t.cons)}</td><td class="num">${fmt(t.lic+t.cons)}</td></tr>
    </table></div>
  </div>`+contactBanner('The full-cost view below includes an illustrative implementation and run model.') : '';
  return liteTop+`
  <div class="card"><h2>${esc(S.meta.client||'Estimate')} — ${S.meta.termYears}-year view</h2>
    <div class="grid3">
      <div class="kpi big"><span class="l">Total cost of ownership</span><span class="v">${fmt(t.total)}</span></div>
      <div class="kpi"><span class="l">Implementation</span><span class="v">${fmt(t.impl)}</span></div>
      <div class="kpi"><span class="l">Licences (${S.meta.termYears} yr)</span><span class="v">${fmt(t.lic)}</span></div>
      <div class="kpi"><span class="l">Consumption & support</span><span class="v">${fmt(t.cons)}</span></div>
      <div class="kpi"><span class="l">AMS & other run</span><span class="v">${fmt(t.ams)}</span></div>
      <div class="kpi"><span class="l">Steady-state run rate / year</span><span class="v">${fmt(lic.annual + R.cons.monthly*12 + R.ams.annual + R.ams.otherMonthly*12 + lic.annual*S.run.supportPct/100)}</span></div>
    </div>
  </div>
  <div class="card"><h2>Cost per month over the horizon</h2>
    ${svgChart(R.months)}
    <div class="legend"><span><i style="background:var(--impl)"></i>Implementation</span><span><i style="background:var(--lic)"></i>Licences</span><span><i style="background:var(--run)"></i>Consumption & support</span><span><i style="background:var(--ams)"></i>AMS & other run</span></div>
  </div>
  <div class="card"><h2>Cost by year</h2>
    <div class="tbl-wrap"><table><tr><th>Year</th><th class="r">Implementation</th><th class="r">Licences</th><th class="r">Consumption & support</th><th class="r">AMS & other run</th><th class="r">Total</th></tr>
      ${yrs.map(y=>`<tr><td>Year ${y.year}</td><td class="num">${fmt(y.impl)}</td><td class="num">${fmt(y.lic)}</td><td class="num">${fmt(y.cons)}</td><td class="num">${fmt(y.ams)}</td><td class="num">${fmt(y.total)}</td></tr>`).join('')}
      <tr class="total"><td>Total</td><td class="num">${fmt(t.impl)}</td><td class="num">${fmt(t.lic)}</td><td class="num">${fmt(t.cons)}</td><td class="num">${fmt(t.ams)}</td><td class="num">${fmt(t.total)}</td></tr>
      <tr class="sub"><td>Share</td><td class="num">${share(t.impl)}</td><td class="num">${share(t.lic)}</td><td class="num">${share(t.cons)}</td><td class="num">${share(t.ams)}</td><td class="num">100%</td></tr>
    </table></div>
  </div>
  <div class="card"><h2>Key figures</h2>
    <div class="grid2">
      <table>
        <tr><td>Licensed users</td><td class="num">${fmtN(lic.totalUsers)}</td></tr>
        <tr><td>Licence cost per user / month (blended)</td><td class="num">${fmt(lic.totalUsers?lic.monthly/lic.totalUsers:0,2)}</td></tr>
        <tr><td>Implementation days</td><td class="num">${fmtN(impl.totalDays,0)}</td></tr>
        <tr><td>Implementation cost per licensed user</td><td class="num">${fmt(lic.totalUsers?impl.total/lic.totalUsers:0)}</td></tr>
      </table>
      <table>
        <tr><td>Project duration</td><td class="num">${fmtN(daysBetween(S.meta.startDate,R.plan.end)/7,0)} weeks</td></tr>
        <tr><td>First go-live</td><td class="num">${fmtDate(R.plan.golives[0].date)}</td></tr>
        <tr><td>Last hypercare exit</td><td class="num">${fmtDate(R.plan.hypercareEnd)}</td></tr>
        <tr><td>Rollout model</td><td class="num">${S.impl.model==='waves'?S.impl.waves.length+' waves':'single go-live'}</td></tr>
      </table>
    </div>
    ${S.meta.notes?`<div class="note info" style="margin-top:12px">${esc(S.meta.notes)}</div>`:''}
  </div>`;
}

/* ===================== SIDE PANEL ===================== */
function renderSide(R){
  const t=R.tco;
  if(LITE()) return `<div class="card" style="margin:0">
    <h2>Licensing & consumption</h2>
    <div class="kpi big"><span class="l">Licences + consumption / year</span><span class="v">${fmt(R.lic.annual+R.cons.monthly*12)}</span></div>
    <div class="kpi"><span class="l"><span class="pill lic">Licences</span> / month</span><span class="v">${fmt(R.lic.monthly)}</span></div>
    <div class="kpi"><span class="l"><span class="pill run">Consumption</span> / month</span><span class="v">${fmt(R.cons.monthly)}</span></div>
    <div class="kpi"><span class="l">Blended per user / month</span><span class="v">${fmt(R.lic.totalUsers?R.lic.monthly/R.lic.totalUsers:0,2)}</span></div>
    <div class="kpi"><span class="l">${S.meta.termYears}-yr licences + consumption</span><span class="v">${fmt(t.lic+t.cons)}</span></div>
    <div style="margin-top:10px">${svgChart(R.months.map(m=>({...m,impl:0,ams:0,total:m.lic+m.cons})), 320, 110)}</div>
  </div>
  <div class="card" style="margin:0">
    <h2>Illustrative implementation & run</h2>
    <div class="kpi"><span class="l"><span class="pill impl">Implementation</span></span><span class="v small">${fmt(t.impl)}</span></div>
    <div class="kpi"><span class="l"><span class="pill ams">AMS & run</span></span><span class="v small">${fmt(t.ams)}</span></div>
    <div class="kpi"><span class="l">First go-live</span><span class="v small">${fmtDate(R.plan.golives[0].date)}</span></div>
    <p class="small muted" style="margin:8px 0 0">Placeholder rates. For a real estimate: <a href="mailto:${esc(BRAND.contact.email)}">${esc(BRAND.contact.email)}</a></p>
  </div>`;
  return `<div class="card" style="margin:0">
    <h2>Live estimate</h2>
    <div class="kpi big"><span class="l">TCO ${S.meta.termYears} yr</span><span class="v">${fmt(t.total)}</span></div>
    <div class="kpi"><span class="l"><span class="pill impl">Implementation</span></span><span class="v">${fmt(t.impl)}</span></div>
    <div class="kpi"><span class="l"><span class="pill lic">Licences</span></span><span class="v">${fmt(t.lic)}</span></div>
    <div class="kpi"><span class="l"><span class="pill run">Consumption</span></span><span class="v">${fmt(t.cons)}</span></div>
    <div class="kpi"><span class="l"><span class="pill ams">AMS & run</span></span><span class="v">${fmt(t.ams)}</span></div>
    <div style="margin-top:10px">${svgChart(R.months, 320, 110)}</div>
  </div>
  <div class="card" style="margin:0">
    <h2>Plan</h2>
    <div class="kpi"><span class="l">Start</span><span class="v small">${fmtDate(S.meta.startDate)}</span></div>
    ${R.plan.golives.map(g=>`<div class="kpi"><span class="l">${esc(g.name)}</span><span class="v small">${fmtDate(g.date)}</span></div>`).join('')}
    <div class="kpi"><span class="l">Project end</span><span class="v small">${fmtDate(R.plan.end)}</span></div>
    <div class="kpi"><span class="l">Effort</span><span class="v small">${fmtN(R.impl.totalDays,0)} days</span></div>
  </div>
  <div class="card" style="margin:0">
    <h2>Run rate</h2>
    <div class="kpi"><span class="l">Licences / month</span><span class="v small">${fmt(R.lic.monthly)}</span></div>
    <div class="kpi"><span class="l">Consumption / month</span><span class="v small">${fmt(R.cons.monthly)}</span></div>
    <div class="kpi"><span class="l">AMS & other / month</span><span class="v small">${fmt(R.ams.monthly+R.ams.otherMonthly)}</span></div>
  </div>`;
}
