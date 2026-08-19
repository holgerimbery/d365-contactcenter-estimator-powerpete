/* ===================== BRAND-AWARE GRADES ===================== */
// Internal presets use codes A–F. A brand may supply its own grade set with a `maps` field to translate.
const PARTNER = (typeof BRAND!=='undefined' && BRAND.partner) || 'Capgemini';
function brandGrades(){ if(typeof BRAND!=='undefined' && BRAND.grades) return BRAND.grades.map(g=>({code:g.code,label:g.label,rate:g.rate}));
  return [ {code:'A', label:'Analyst / associate', rate:650}, {code:'B', label:'Consultant', rate:800}, {code:'C', label:'Senior consultant', rate:950}, {code:'D', label:'Managing consultant', rate:1100}, {code:'E', label:'Principal / senior manager', rate:1300}, {code:'F', label:'Director / VP', rate:1550} ]; }
function mapGrade(code){ if(typeof BRAND==='undefined' || !BRAND.grades) return code; const g=BRAND.grades.find(x=>x.maps===code); return g?g.code:code; }
const mapRoles = roles => roles.map(r=>({...r, grade:mapGrade(r.grade)}));
/* ===================== STATE ===================== */
const DEFAULT_STATE = () => ({
  meta: { client:'', preparedBy:'', version:'v0.1', currency:'EUR', fx:{USD:1, EUR:0.92, GBP:0.78},
          termYears:3, startDate: nextMonthISO(), notes:'', priceBasis:'Microsoft list prices (USD, annual commitment), converted with editable FX. Verify before quoting.' },
  lic: {
    crm:'d365',                // d365 | third
    agentsFull:120, agentsDigital:20, agentsVoice:0, supervisors:10, backoffice:30, teamMembers:20,
    existingCSE:0,             // users that already hold CS Enterprise (only CC add-on needed)
    strategy:'auto',           // auto | premium | attach
    p: { premium:195, cse:105, ccFull:110, ccDigital:95, ccVoice:95, teamMember:8, csAttach:20 },
    copilot: { model:'packs', sessions:20000, creditsPerSession:12, includedPerPremium:1000, packCredits:25000, packPrice:200, paygPerCredit:0.01, extraCredits:0 },
    tel: { mode:'acs', inboundMin:120000, outboundMin:30000, numbers:20,
           acsIn:0.013, acsOut:0.013, acsNumber:2,
           teamsPhone:8, callingPlan:12, ocPerUser:0, ocIn:0.01, ocOut:0.012, teamsUsers:0 },
    dv: { dbGB:60, fileGB:200, logGB:5, inclDb:10, inclDbPerUser:0.25, inclFile:20, inclFilePerUser:2, inclLog:2, pDb:40, pFile:2, pLog:10 },
    d365ai: {
      cia:{on:1, mining:5000, selfConv:0, selfMsgs:6, selfKA:50, selfTools:1, asstConv:40000, asstMsgs:8, asstKA:40, asstTools:1},
      cma:{on:0, emails:10000, followUps:1, realtime:0, updates:2, autoPct:50, kaPct:60, tools:1, tmplPct:30, waiting:1, cap:{cls:1,enr:1,res:1,fu:1}},
      kma:{on:0, bulk:20000, rtCases:20000, rtConv:40000, unmPct:20, creation:200, revisions:1},
      qaa:{on:1, closed:20000, rtConv:0, rtInputs:8, coachConv:0, coachInputs:4},
      caa:{on:0, conv:0, durSec:120, flows:1, actions:5, basic:0, standard:1, premium:0}
    },
    other: [ {name:'Power BI Pro (supervisors / analysts)', qty:10, unit:14, per:'user-month'} ]
  },
  impl: {
    model:'single',            // single | waves
    single: [ {name:'Mobilise & discovery', weeks:3}, {name:'Design', weeks:6}, {name:'Build & configure', weeks:12}, {name:'Test (SIT & UAT)', weeks:6}, {name:'Deploy & hypercare', weeks:4} ],
    foundation: [ {name:'Mobilise & discovery', weeks:3}, {name:'Global design', weeks:8}, {name:'Core build', weeks:12}, {name:'Core test & pilot', weeks:6} ],
    waveTpl: [ {name:'Local design & fit-gap', weeks:3}, {name:'Localise & build', weeks:5}, {name:'Test & training', weeks:3}, {name:'Go-live & hypercare', weeks:3} ],
    waves: [ {name:'Wave 1 – Netherlands', agents:60}, {name:'Wave 2 – Germany', agents:80}, {name:'Wave 3 – Rest of Europe', agents:40} ],
    stagger:8, hypercareIsLastPhase:true,
    grades: brandGrades(),
    roles: mapRoles([
      {name:'Engagement / project manager', grade:'D', a:{s0:.5,s1:.5,s2:.5,s3:.5,s4:.5, f0:.5,f1:.5,f2:.5,f3:.5, w0:.3,w1:.3,w2:.3,w3:.3}},
      {name:'CC solution architect', grade:'E', a:{s0:.6,s1:.8,s2:.4,s3:.3,s4:.3, f0:.6,f1:.8,f2:.4,f3:.3, w0:.3,w1:.2,w2:.1,w3:.2}},
      {name:'CC functional consultant (routing, channels, voice)', grade:'C', a:{s0:.5,s1:1,s2:1,s3:1,s4:1, f0:.5,f1:1,f2:1,f3:1, w0:1,w1:1,w2:1,w3:1}},
      {name:'Copilot Studio agent developer', grade:'C', a:{s0:0,s1:.5,s2:1,s3:.5,s4:.3, f0:0,f1:.5,f2:1,f3:.5, w0:.2,w1:.5,w2:.3,w3:.2}},
      {name:'Integration / Power Platform developer', grade:'B', a:{s0:0,s1:.3,s2:1,s3:.5,s4:.3, f0:0,f1:.3,f2:1,f3:.5, w0:0,w1:.5,w2:.3,w3:.2}},
      {name:'Telephony / Teams voice engineer', grade:'C', a:{s0:.2,s1:.3,s2:.5,s3:.3,s4:.3, f0:.2,f1:.3,f2:.5,f3:.3, w0:.2,w1:.3,w2:.2,w3:.3}},
      {name:'Test lead', grade:'B', a:{s0:0,s1:.2,s2:.3,s3:1,s4:.2, f0:0,f1:.2,f2:.3,f3:1, w0:0,w1:.2,w2:1,w3:.2}},
      {name:'Change & training lead', grade:'C', a:{s0:.2,s1:.3,s2:.3,s3:.5,s4:.5, f0:.2,f1:.3,f2:.3,f3:.5, w0:.2,w1:.2,w2:.5,w3:.5}}
    ]),
    preset:'M',
    integrations: [ {name:'CRM / customer master data (D365 CS native)', complexity:'S', qty:1}, {name:'Identity & SSO (Entra ID)', complexity:'S', qty:1}, {name:'Knowledge base (SharePoint / website)', complexity:'M', qty:1}, {name:'ERP order & invoice lookup', complexity:'M', qty:1}, {name:'Legacy IVR / telephony cut-over', complexity:'C', qty:1} ],
    intDays: {S:6, M:15, C:35},
    intRoles: mapRoles([ {name:'Integration developer', grade:'B', share:.55}, {name:'Solution architect', grade:'E', share:.15}, {name:'Functional consultant', grade:'C', share:.1}, {name:'Tester', grade:'B', share:.2} ]),
    contingencyPct:10, expensesPct:4,
    oneOff: [ {name:'Client-side testing & training effort (not billed)', amount:0} ],
    milestonesCustom: [ ]
  },
  wiz: {},
  run: {
    licenseStart:'golive',     // golive | build | project
    amsStart:'hypercare',      // hypercare | golive
    daysPerFteYear:210,
    ams: mapRoles([ {name:'Service delivery manager', grade:'D', fte:.2}, {name:'CC functional support', grade:'C', fte:1}, {name:'Copilot Studio / integration support', grade:'B', fte:.5} ]),
    supportPct:0,              // % of annual licence value (e.g. Microsoft Unified)
    otherMonthly: [ {name:'Azure (storage, Functions, monitoring)', amount:800} ]
  }
});

function nextMonthISO(){ const d=new Date(); d.setDate(1); d.setMonth(d.getMonth()+2); return d.toISOString().slice(0,10); }
let S = DEFAULT_STATE();

/* ===================== HELPERS ===================== */
const $ = s => document.querySelector(s);
const esc = s => String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SYM = {EUR:'€', USD:'$', GBP:'£'};
function fx(){ return S.meta.fx[S.meta.currency] || 1; }           // USD -> display
function toDisp(usd){ return usd*fx(); }
function toUSD(disp){ return disp/fx(); }
function fmt(usd, dec=0){ const v=toDisp(usd); return SYM[S.meta.currency]+' '+v.toLocaleString('en-GB',{minimumFractionDigits:dec,maximumFractionDigits:dec}); }
function fmtN(n, dec=0){ return Number(n||0).toLocaleString('en-GB',{minimumFractionDigits:dec,maximumFractionDigits:dec}); }
function get(path){ return path.split('.').reduce((o,k)=>o==null?undefined:o[k], S); }
function set(path,val){ const ks=path.split('.'); let o=S; for(let i=0;i<ks.length-1;i++){ o=o[ks[i]]; } o[ks[ks.length-1]]=val; }
function addDays(iso, days){ const d=new Date(iso+'T00:00:00'); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
function addWeeks(iso, w){ return addDays(iso, Math.round(w*7)); }
function fmtDate(iso){ if(!iso) return ''; const d=new Date(iso+'T00:00:00'); return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
function monthsBetween(a,b){ const da=new Date(a+'T00:00:00'), db=new Date(b+'T00:00:00'); return (db-da)/(1000*3600*24*30.4375); }
function gradeRate(code){ const g=S.impl.grades.find(g=>g.code===code); return g?Number(g.rate)||0:0; }
function clone(o){ return JSON.parse(JSON.stringify(o)); }

/* ===================== CALC: LICENSING (monthly, USD, at 100% ramp) ===================== */
function calcLicensing(){
  const L=S.lic, p=L.p, rows=[];
  const third = L.crm==='third';
  const strat = L.strategy;
  const attachFull = p.cse + p.ccFull, attachDig = p.cse + p.ccDigital, attachVoice = p.cse + p.ccVoice;
  const pick = (attachPrice, ccOnly, label) => {
    // returns [skuLabel, unitPrice] for a live-channel user in D365 CRM scenario
    if(third) return [label+' (standalone, 3rd-party CRM)', ccOnly];
    if(strat==='premium') return ['CS Premium', p.premium];
    if(strat==='attach') return ['CS Enterprise + '+label, attachPrice];
    return p.premium<=attachPrice ? ['CS Premium', p.premium] : ['CS Enterprise + '+label, attachPrice];
  };
  const liveFull = Number(L.agentsFull)+Number(L.supervisors);
  let existing = Math.min(Number(L.existingCSE)||0, liveFull);
  const push=(name,qty,unit,note='')=>{ if(qty>0) rows.push({name,qty,unit,monthly:qty*unit,note}); };
  // full agents + supervisors
  if(!third && existing>0){ push('Contact Center add-on for existing CS Enterprise users', existing, p.ccFull, 'CSE already owned, add-on only'); }
  const restFull = liveFull-existing;
  const [lblF, prF] = pick(attachFull, p.ccFull, 'Contact Center (digital + voice)');
  push(lblF+' — agents & supervisors', restFull, prF);
  const [lblD, prD] = pick(attachDig, p.ccDigital, 'Contact Center Digital');
  push(lblD+' — digital-only agents', Number(L.agentsDigital), prD);
  const [lblV, prV] = pick(attachVoice, p.ccVoice, 'Contact Center Voice');
  push(lblV+' — voice-only agents', Number(L.agentsVoice), prV);
  if(!third) push('CS Enterprise — back-office / case workers', Number(L.backoffice), p.cse);
  push('Team Member — read/light users', Number(L.teamMembers), p.teamMember);
  const premiumUsers = rows.filter(r=>r.name.startsWith('CS Premium')).reduce((s,r)=>s+r.qty,0);
  const totalUsers = rows.reduce((s,r)=>s+r.qty,0);
  const monthly = rows.reduce((s,r)=>s+r.monthly,0);
  return {rows, monthly, annual:monthly*12, premiumUsers, totalUsers, liveVoiceUsers: liveFull+Number(L.agentsVoice)};
}

/* ===================== CALC: D365 AI AGENTS (credits / month) ===================== */
function calcD365AI(){
  const A=S.lic.d365ai||{}, n=v=>Number(v)||0, rows=[]; let total=0, oneoff=0;
  const c=A.cia||{}; if(n(c.on)){ const mining=Math.round(n(c.mining)*1.5)*2;
    const self=Math.round(n(c.selfConv)*n(c.selfMsgs)*n(c.selfKA)/100*3 + n(c.selfConv)*n(c.selfMsgs)*n(c.selfTools))*2;
    const asst=Math.round(n(c.asstConv)*n(c.asstMsgs)*n(c.asstKA)/100*3 + n(c.asstConv)*n(c.asstTools))*2;
    rows.push({name:'Customer Intent Agent', detail:`intent mining ${fmtN(mining)} · self-service ${fmtN(self)} · assisted ${fmtN(asst)}`, credits:mining+self+asst}); }
  const m=A.cma||{}; if(n(m.on)){ const E=n(m.emails), F=n(m.followUps), RC=n(m.realtime), U=n(m.updates), auto=n(m.autoPct)/100, ka=n(m.kaPct)/100, T=n(m.tools), tp=n(m.tmplPct)/100, W=n(m.waiting); const cap=m.cap||{}; const H22=E*(1+F);
    const cls = cap.cls? E*2 : 0;
    const enr = cap.enr? ((E+RC)+(RC*U+E*F))*2 + (auto*(E+RC)+E*F)*1 : 0;
    const res = cap.res? ((H22*ka*3+H22*T)+(H22*tp*3+H22*(1-tp)*1))*2 + H22*1 : 0;
    const H42=(E+RC)*W*tp*3, H43=(E+RC)*W*(1-tp), H44=H43*8, H45=RC, H46=E+RC, H47=E*2;
    const fu = cap.fu? (H42+H45)*2+(H43+H46)*1+(H44+H47)*1.5 : 0;
    rows.push({name:'Case Management Agent', detail:`classification ${fmtN(cls)} · enrichment ${fmtN(enr)} · resolution ${fmtN(res)} · follow-up & closure ${fmtN(fu)}`, credits:Math.ceil(cls+enr+res+fu)}); }
  const k=A.kma||{}; if(n(k.on)){ const bulk=Math.ceil((n(k.bulk)+Math.ceil(n(k.bulk)/50)+n(k.unmPct)/100*n(k.bulk))*2); oneoff+=bulk;
    const rt=(n(k.rtConv)+n(k.unmPct)/100*n(k.rtConv)+n(k.unmPct)/100*n(k.rtCases))*2 + (n(k.rtCases)+n(k.rtConv))*1; const cr=n(k.creation)*(1+n(k.revisions))*2;
    rows.push({name:'Customer Knowledge Management Agent', detail:`real-time harvesting ${fmtN(rt)} · assisted creation ${fmtN(cr)} (+ one-off bulk harvesting ${fmtN(bulk)})`, credits:Math.ceil(rt+cr)}); }
  const q=A.qaa||{}; if(n(q.on)){ const cl=n(q.closed)*2, rt=Math.floor(n(q.rtInputs)/4)*n(q.rtConv)*2, co=n(q.coachConv)*n(q.coachInputs)*2;
    rows.push({name:'Quality Assurance Agent', detail:`closed evaluations ${fmtN(cl)} · real-time evaluations ${fmtN(rt)} · coaching ${fmtN(co)}`, credits:Math.ceil(cl+rt+co)}); }
  const a=A.caa||{}; if(n(a.on)){ const v=Math.ceil(n(a.conv)*n(a.durSec)*75/60), fl=Math.ceil(n(a.conv)*n(a.flows)*n(a.actions)*0.13), pr=Math.ceil(n(a.conv)*(n(a.basic)*0.1+n(a.standard)*1.5+n(a.premium)*10));
    rows.push({name:'Customer Assist Agent (premium GenAI voice)', detail:`voice ${fmtN(v)} (75 credits/min) · flows ${fmtN(fl)} · prompts ${fmtN(pr)}`, credits:v+fl+pr}); }
  rows.forEach(r=>total+=r.credits);
  return {rows, total, oneoff};
}

/* ===================== CALC: CONSUMPTION (monthly USD at 100%) ===================== */
function calcConsumption(lic){
  const L=S.lic, out={rows:[]};
  // Copilot credits
  const c=L.copilot;
  const d365=calcD365AI(); out.d365=d365;
  const csNeed = Number(c.sessions)*Number(c.creditsPerSession)+Number(c.extraCredits);
  const need = csNeed + d365.total;
  const incl = lic.premiumUsers*Number(c.includedPerPremium);
  const over = Math.max(0, need-incl);
  let copilotCost=0, copilotNote='';
  if(over>0){
    const packs = Math.ceil(over/Number(c.packCredits));
    const packCost = packs*Number(c.packPrice), payg = over*Number(c.paygPerCredit);
    if(c.model==='packs'){ copilotCost=packCost; copilotNote=packs+' pack(s) × '+fmtN(c.packCredits)+' credits'; }
    else if(c.model==='payg'){ copilotCost=payg; copilotNote='pay-as-you-go'; }
    else { copilotCost=Math.min(packCost,payg); copilotNote= packCost<=payg ? packs+' pack(s), cheaper than PAYG' : 'PAYG, cheaper than packs'; }
  } else copilotNote='covered by included credits';
  const unit = over>0 ? copilotCost/over : 0;
  out.copilot={need,csNeed,d365Need:d365.total,incl,over,cost:copilotCost,note:copilotNote,unit, oneoffCost: d365.oneoff*(unit||Number(c.paygPerCredit))};
  out.rows.push({name:'Copilot credits — Copilot Studio agents', detail:fmtN(csNeed)+' credits (self-service, agent-facing, autonomous)', monthly: need? copilotCost*csNeed/need : 0});
  out.rows.push({name:'Copilot credits — Dynamics 365 AI agents', detail:fmtN(d365.total)+' credits ('+(d365.rows.map(r=>r.name.split(' (')[0]).join(', ')||'none enabled')+')', monthly: need? copilotCost*d365.total/need : 0});
  out.rows.push({name:'Copilot credits — included allowance', detail:fmtN(incl)+' credits from CS Premium users; overage '+fmtN(over)+' → '+copilotNote, monthly:0});
  // Telephony
  const t=L.tel; let tel=0, telRows=[];
  if(t.mode==='acs'){
    telRows.push(['Azure Communication Services PSTN inbound', fmtN(t.inboundMin)+' min × '+fmt(t.acsIn,4), t.inboundMin*t.acsIn]);
    telRows.push(['ACS PSTN outbound', fmtN(t.outboundMin)+' min × '+fmt(t.acsOut,4), t.outboundMin*t.acsOut]);
    telRows.push(['Phone number rental', fmtN(t.numbers)+' × '+fmt(t.acsNumber,2), t.numbers*t.acsNumber]);
  } else {
    const users = Number(t.teamsUsers)||lic.liveVoiceUsers;
    telRows.push(['Teams Phone Standard (voice agents)', fmtN(users)+' × '+fmt(t.teamsPhone,2), users*t.teamsPhone]);
    if(t.mode==='teams-cp'){
      telRows.push(['Microsoft Calling Plan', fmtN(users)+' × '+fmt(t.callingPlan,2), users*t.callingPlan]);
    } else {
      telRows.push(['Operator Connect / Direct Routing carrier fee', fmtN(users)+' × '+fmt(t.ocPerUser,2), users*t.ocPerUser]);
      telRows.push(['Carrier inbound minutes', fmtN(t.inboundMin)+' min × '+fmt(t.ocIn,4), t.inboundMin*t.ocIn]);
      telRows.push(['Carrier outbound minutes', fmtN(t.outboundMin)+' min × '+fmt(t.ocOut,4), t.outboundMin*t.ocOut]);
    }
    telRows.push(['Teams Phone Resource Account (service numbers)', fmtN(t.numbers)+' × free', 0]);
  }
  telRows.forEach(r=>{ tel+=r[2]; out.rows.push({name:r[0], detail:r[1], monthly:r[2]}); });
  out.telephony=tel;
  // Dataverse
  const d=L.dv, u=lic.totalUsers;
  const inclDb=Number(d.inclDb)+Number(d.inclDbPerUser)*u, inclFile=Number(d.inclFile)+Number(d.inclFilePerUser)*u, inclLog=Number(d.inclLog);
  const dvRows=[
    ['Dataverse database overage', Math.max(0,d.dbGB-inclDb), d.pDb, inclDb],
    ['Dataverse file overage (recordings, attachments)', Math.max(0,d.fileGB-inclFile), d.pFile, inclFile],
    ['Dataverse log overage', Math.max(0,d.logGB-inclLog), d.pLog, inclLog]
  ];
  let dv=0; dvRows.forEach(r=>{ const m=r[1]*r[2]; dv+=m; out.rows.push({name:r[0], detail:fmtN(r[1],1)+' GB over included '+fmtN(r[3],1)+' GB × '+fmt(r[2],2), monthly:m}); });
  out.dataverse=dv;
  // Other Microsoft SKUs
  let oth=0; L.other.forEach(o=>{ let m=0; const q=Number(o.qty)||0, un=Number(o.unit)||0;
    if(o.per==='user-month'||o.per==='month') m=q*un; else if(o.per==='year') m=q*un/12; else if(o.per==='once') m=0;
    oth+=m; out.rows.push({name:o.name||'Other', detail:fmtN(q)+' × '+fmt(un,2)+' per '+o.per, monthly:m}); });
  out.other=oth;
  out.monthly = copilotCost+tel+dv+oth;
  return out;
}

/* ===================== CALC: PLAN ===================== */
function calcPlan(){
  const I=S.impl, start=S.meta.startDate; const phases=[]; let cur=start;
  const golives=[]; // {date, share}
  if(I.model==='single'){
    I.single.forEach((ph,i)=>{ const s=cur, e=addWeeks(cur, ph.weeks); phases.push({key:'s'+i, name:ph.name, start:s, end:e, weeks:Number(ph.weeks), kind: i===I.single.length-1?'hyper':'main'}); cur=e; });
    const last=phases[phases.length-1]; golives.push({date:last.start, share:1, name:'Go-live'});
    return {phases, golives, end:cur, hypercareEnd:cur, buildStart:(phases[2]||phases[0]).start};
  }
  I.foundation.forEach((ph,i)=>{ const s=cur, e=addWeeks(cur, ph.weeks); phases.push({key:'f'+i, name:ph.name, start:s, end:e, weeks:Number(ph.weeks), kind:'main'}); cur=e; });
  const fEnd=cur; let projEnd=fEnd; const totalAgents=I.waves.reduce((s,w)=>s+(Number(w.agents)||0),0)||1;
  I.waves.forEach((w,wi)=>{ let c=addWeeks(fEnd, wi*Number(I.stagger)); 
    I.waveTpl.forEach((tp,ti)=>{ const s=c, e=addWeeks(c, tp.weeks); phases.push({key:'w'+ti, wave:wi, waveName:w.name, name:tp.name, start:s, end:e, weeks:Number(tp.weeks), kind: ti===I.waveTpl.length-1?'hyper':'wave'}); c=e; });
    const lastPh = phases[phases.length-1];
    golives.push({date:lastPh.start, share:(Number(w.agents)||0)/totalAgents, name:w.name+' go-live'});
    if(c>projEnd) projEnd=c; });
  const buildStart=(phases[2]||phases[0]).start;
  return {phases, golives, end:projEnd, hypercareEnd:projEnd, buildStart};
}

/* ===================== CALC: IMPLEMENTATION COST ===================== */
function calcIntegrations(){
  const I=S.impl; let days=0; const rows=(I.integrations||[]).map(it=>{ const d=(Number(I.intDays[it.complexity])||0)*(Number(it.qty)||1); days+=d; return {name:it.name, complexity:it.complexity, qty:Number(it.qty)||1, days:d}; });
  let cost=0; const byRole=(I.intRoles||[]).map(r=>{ const d=days*Number(r.share); const c=d*gradeRate(r.grade); cost+=c; return {name:r.name, grade:r.grade, share:Number(r.share), days:d, cost:c}; });
  return {rows, days, cost, byRole};
}
function calcImpl(plan){
  const I=S.impl; const byRole=[]; const byPhase={}; let services=0;
  I.roles.forEach(r=>{ const rate=gradeRate(r.grade); let days=0, cost=0; const per={};
    plan.phases.forEach(ph=>{ const fte=Number((r.a||{})[ph.key])||0; const d=ph.weeks*5*fte; days+=d; cost+=d*rate; per[ph.key+(ph.wave??'')]=d*rate; byPhase[ph.key+(ph.wave??'')]=(byPhase[ph.key+(ph.wave??'')]||0)+d*rate; });
    byRole.push({name:r.name, grade:r.grade, rate, days, cost, per}); services+=cost; });
  const integ=calcIntegrations();
  // spread integration cost over build/test-like phases (fallback: all phases), weighted by weeks
  let tgt=plan.phases.filter(ph=>/build|test|localis|configur|develop/i.test(ph.name)); if(!tgt.length) tgt=plan.phases;
  const tw=tgt.reduce((s,ph)=>s+ph.weeks,0)||1; tgt.forEach(ph=>{ const k=ph.key+(ph.wave??''); byPhase[k]=(byPhase[k]||0)+integ.cost*ph.weeks/tw; });
  services+=integ.cost;
  const expenses=services*Number(I.expensesPct)/100, contingency=(services+expenses)*Number(I.contingencyPct)/100;
  const d365=calcD365AI(); const aiOneOff=d365.oneoff*Number(S.lic.copilot.paygPerCredit);
  const oneOff=I.oneOff.reduce((s,o)=>s+(Number(o.amount)||0),0)+aiOneOff;
  const total=services+expenses+contingency+oneOff;
  const totalDays=byRole.reduce((s,r)=>s+r.days,0)+integ.days;
  return {byRole, byPhase, services, roleServices:services-integ.cost, integ, expenses, contingency, oneOff, aiOneOff, total, totalDays};
}

/* ===================== CALC: RUNTIME / AMS ===================== */
function calcAms(){
  const R=S.run; let annual=0; const rows=R.ams.map(a=>{ const rate=gradeRate(a.grade); const c=Number(a.fte)*Number(R.daysPerFteYear)*rate; annual+=c; return {name:a.name, grade:a.grade, rate, fte:Number(a.fte), annual:c}; });
  const otherMonthly=R.otherMonthly.reduce((s,o)=>s+(Number(o.amount)||0),0);
  return {rows, annual, monthly:annual/12, otherMonthly};
}

/* ===================== CALC: MONTHLY MODEL & TCO ===================== */
function calcAll(){
  const lic=calcLicensing(), cons=calcConsumption(lic), plan=calcPlan(), impl=calcImpl(plan), ams=calcAms();
  const start=S.meta.startDate; const termMonths=Math.max(12, Number(S.meta.termYears)*12);
  const projMonths=Math.ceil(monthsBetween(start, plan.end)); const nMonths=Math.max(termMonths, projMonths);
  const months=[]; 
  const licStartDate = S.run.licenseStart==='project'?start : S.run.licenseStart==='build'?plan.buildStart : null; // null => ramp by go-lives
  const amsStartDate = S.run.amsStart==='golive' ? plan.golives[0].date : plan.hypercareEnd;
  const supportMonthly = lic.annual*Number(S.run.supportPct)/100/12;
  for(let m=0;m<nMonths;m++){
    const ms=addDays(start, Math.round(m*30.4375)), me=addDays(start, Math.round((m+1)*30.4375));
    // implementation: spread each phase cost evenly across its span
    let ic=0; plan.phases.forEach(ph=>{ const c=impl.byPhase[ph.key+(ph.wave??'')]||0; if(!c) return; const ov=overlapDays(ms,me,ph.start,ph.end); const span=daysBetween(ph.start,ph.end)||1; ic+=c*ov/span; });
    // add expenses/contingency/one-off proportionally to services
    const factor = impl.services? impl.total/impl.services : 0; ic*=factor;
    // licence ramp
    let share=0; if(licStartDate){ share = me>licStartDate ? 1 : 0; } else { plan.golives.forEach(g=>{ if(me>g.date) share+=g.share; }); }
    share=Math.min(1,share);
    const lc=lic.monthly*share, cc=cons.monthly*share, sc=supportMonthly*share;
    const ac= me>amsStartDate ? ams.monthly+ams.otherMonthly : 0;
    months.push({idx:m, start:ms, impl:ic, lic:lc, cons:cc+sc, ams:ac, total:ic+lc+cc+sc+ac});
  }
  const years=[]; for(let y=0;y<Math.ceil(nMonths/12);y++){ const sl=months.slice(y*12,(y+1)*12); years.push({year:y+1, impl:sum(sl,'impl'), lic:sum(sl,'lic'), cons:sum(sl,'cons'), ams:sum(sl,'ams'), total:sum(sl,'total')}); }
  const tco = {impl:sum(months,'impl'), lic:sum(months,'lic'), cons:sum(months,'cons'), ams:sum(months,'ams'), total:sum(months,'total')};
  return {lic, cons, plan, impl, ams, months, years, tco, nMonths};
}
function sum(arr,k){ return arr.reduce((s,x)=>s+(x[k]||0),0); }
function daysBetween(a,b){ return (new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/86400000; }
function overlapDays(a1,a2,b1,b2){ const s=a1>b1?a1:b1, e=a2<b2?a2:b2; return e>s? daysBetween(s,e):0; }
