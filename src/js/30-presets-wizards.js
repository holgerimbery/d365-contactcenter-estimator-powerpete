/* ===================== PRESETS ===================== */
const A=(s0,s1,s2,s3,s4,f0,f1,f2,f3,w0,w1,w2,w3)=>({s0,s1,s2,s3,s4,f0,f1,f2,f3,w0,w1,w2,w3});
const PRESETS = {
  S: { label:'Small', meta:'≤ 75 agents · 1 site · ~18 weeks',
       desc:'One country or site, voice plus one or two digital channels, mostly out-of-the-box routing, no or a simple IVR bot, up to three simple integrations. Single go-live.',
       model:'single', single:[{name:'Mobilise & discovery',weeks:2},{name:'Design',weeks:4},{name:'Build & configure',weeks:6},{name:'Test (SIT & UAT)',weeks:3},{name:'Deploy & hypercare',weeks:3}],
       contingencyPct:10, expensesPct:3,
       roles:[
        {name:'Project manager', grade:'D', a:A(.4,.4,.4,.4,.4, .4,.4,.4,.4, .3,.3,.3,.3)},
        {name:'CC solution architect', grade:'D', a:A(.5,.6,.3,.2,.2, .5,.6,.3,.2, .2,.2,.1,.2)},
        {name:'CC functional consultant (routing, channels, voice)', grade:'C', a:A(.5,1,1,1,1, .5,1,1,1, 1,1,1,1)},
        {name:'Copilot Studio / Power Platform developer', grade:'B', a:A(0,.3,.8,.4,.2, 0,.3,.8,.4, .2,.5,.3,.2)},
        {name:'Telephony / Teams voice engineer', grade:'C', a:A(.2,.2,.3,.2,.3, .2,.2,.3,.2, .2,.3,.2,.3)},
        {name:'Test & training consultant', grade:'B', a:A(0,.1,.2,.8,.4, 0,.1,.2,.8, 0,.2,.8,.4)}],
       integrations:[{name:'Identity & SSO (Entra ID)',complexity:'S',qty:1},{name:'Knowledge base (SharePoint / website)',complexity:'S',qty:1},{name:'Existing telephony numbers port / cut-over',complexity:'M',qty:1}],
       milestones:[{name:'Steering committee kick-off',w:1},{name:'Design sign-off',w:6},{name:'Cutover rehearsal',end:-4},{name:'Handover to support',end:0}] },
  M: { label:'Medium', meta:'75–250 agents · 1–2 countries · ~30 weeks',
       desc:'Omnichannel (voice, chat, email, messaging), Copilot Studio IVR and chat agent, supervisor experience, unified routing with skills, three to six integrations, moderate data migration. Single go-live, possibly with a pilot group.',
       model:'single', single:[{name:'Mobilise & discovery',weeks:3},{name:'Design',weeks:6},{name:'Build & configure',weeks:12},{name:'Test (SIT & UAT)',weeks:6},{name:'Deploy & hypercare',weeks:4}],
       contingencyPct:10, expensesPct:4,
       roles:DEFAULT_STATE().impl.roles,
       integrations:[{name:'Identity & SSO (Entra ID)',complexity:'S',qty:1},{name:'Knowledge base (SharePoint / website)',complexity:'M',qty:1},{name:'ERP order & invoice lookup',complexity:'M',qty:1},{name:'Customer master data sync',complexity:'M',qty:1},{name:'Legacy IVR / telephony cut-over',complexity:'C',qty:1},{name:'Survey / CSAT tool',complexity:'S',qty:1}],
       milestones:[{name:'Steering committee kick-off',w:1},{name:'Design authority sign-off',w:9},{name:'Pilot group live',end:-6},{name:'Cutover rehearsal',end:-5},{name:'Handover to AMS',end:0}] },
  L: { label:'Large', meta:'250–800 agents · multi-country · ~52 weeks',
       desc:'Global core template with three or more country waves, multi-language Copilot Studio agents, WFM and QM add-ons, six to twelve integrations, compliance per country (recording, GDPR). Foundation phase then wave rollout.',
       model:'waves', foundation:[{name:'Mobilise & discovery',weeks:3},{name:'Global design',weeks:8},{name:'Core build',weeks:12},{name:'Core test & pilot',weeks:6}],
       waveTpl:[{name:'Local design & fit-gap',weeks:3},{name:'Localise & build',weeks:5},{name:'Test & training',weeks:3},{name:'Go-live & hypercare',weeks:3}],
       waves:[{name:'Wave 1 – Pilot country',agents:100},{name:'Wave 2 – Region A',agents:200},{name:'Wave 3 – Region B',agents:200}], stagger:8,
       contingencyPct:12, expensesPct:5,
       roles:[
        {name:'Programme manager', grade:'E', a:A(1,1,1,1,1, .8,.8,.8,.8, .3,.3,.3,.3)},
        {name:'PMO / project coordinator', grade:'B', a:A(.5,.5,.5,.5,.5, .5,.5,.5,.5, .2,.2,.2,.2)},
        {name:'Lead CC solution architect', grade:'E', a:A(.8,1,.6,.4,.4, .8,1,.6,.4, .3,.2,.1,.2)},
        {name:'CC functional consultant (routing, channels)', grade:'C', a:A(.5,1,1,1,1, .5,1,1,1, 1,1,1,1)},
        {name:'CC functional consultant (voice, supervisor, WFM)', grade:'C', a:A(.5,1,1,1,1, .5,1,1,1, .5,.5,.5,.5)},
        {name:'Copilot Studio agent developer', grade:'C', a:A(0,.5,1,.5,.3, 0,.5,1,.5, .3,.5,.3,.2)},
        {name:'Copilot Studio agent developer (languages)', grade:'B', a:A(0,.3,1,.5,.3, 0,.3,1,.5, .3,.5,.3,.2)},
        {name:'Integration / Power Platform developer', grade:'B', a:A(0,.3,1,.5,.3, 0,.3,1,.5, 0,.5,.3,.2)},
        {name:'Data migration consultant', grade:'C', a:A(0,.3,.5,.5,.3, 0,.3,.5,.5, .2,.5,.3,.2)},
        {name:'Telephony / Teams voice engineer', grade:'C', a:A(.3,.5,.5,.3,.5, .3,.5,.5,.3, .3,.5,.3,.5)},
        {name:'Test lead', grade:'C', a:A(0,.2,.5,1,.3, 0,.2,.5,1, 0,.2,1,.2)},
        {name:'Test analyst', grade:'A', a:A(0,0,.5,1,.3, 0,0,.5,1, 0,.3,1,.3)},
        {name:'Change & training lead', grade:'C', a:A(.3,.5,.5,.5,.5, .3,.5,.5,.5, .3,.3,.8,.5)},
        {name:'Security & compliance consultant', grade:'D', a:A(.2,.4,.2,.2,.1, .2,.4,.2,.2, .1,.1,.1,0)}],
       integrations:[{name:'Identity & SSO (Entra ID)',complexity:'S',qty:1},{name:'Knowledge base (SharePoint / website)',complexity:'M',qty:1},{name:'ERP / order management',complexity:'C',qty:1},{name:'Customer master data (MDM)',complexity:'M',qty:1},{name:'Legacy contact center / IVR cut-over',complexity:'C',qty:1},{name:'WFM (Calabrio / Verint / NICE)',complexity:'M',qty:1},{name:'Data warehouse / Fabric reporting',complexity:'M',qty:1},{name:'Payment / PCI IVR',complexity:'C',qty:1},{name:'Survey / CSAT tool',complexity:'S',qty:1}],
       milestones:[{name:'Steering committee kick-off',w:1},{name:'Global design sign-off',w:11},{name:'Core template ready',w:23},{name:'Programme close & handover to AMS',end:0}] },
  XL:{ label:'Extra large', meta:'800+ agents · global programme · 18+ months',
       desc:'Global transformation: many countries and languages, five or more waves, complex telephony estate migration, WFM/QM/analytics, twelve or more integrations, dedicated PMO, security and compliance stream, formal change programme.',
       model:'waves', foundation:[{name:'Mobilise & discovery',weeks:4},{name:'Global design',weeks:10},{name:'Core build',weeks:16},{name:'Core test & pilot',weeks:8}],
       waveTpl:[{name:'Local design & fit-gap',weeks:4},{name:'Localise & build',weeks:6},{name:'Test & training',weeks:4},{name:'Go-live & hypercare',weeks:4}],
       waves:[{name:'Wave 1 – Pilot',agents:150},{name:'Wave 2 – Europe',agents:350},{name:'Wave 3 – Americas',agents:300},{name:'Wave 4 – APAC',agents:250},{name:'Wave 5 – Rest of world',agents:150}], stagger:10,
       contingencyPct:15, expensesPct:6,
       roles:[
        {name:'Programme director', grade:'F', a:A(.5,.5,.5,.5,.5, .5,.5,.5,.5, .2,.2,.2,.2)},
        {name:'Programme manager', grade:'E', a:A(1,1,1,1,1, 1,1,1,1, .3,.3,.3,.3)},
        {name:'PMO lead', grade:'D', a:A(1,1,1,1,1, 1,1,1,1, .3,.3,.3,.3)},
        {name:'Lead CC solution architect', grade:'F', a:A(1,1,.6,.4,.4, 1,1,.6,.4, .3,.2,.1,.2)},
        {name:'CC solution architect (voice & telephony)', grade:'E', a:A(.5,1,.8,.5,.5, .5,1,.8,.5, .3,.3,.2,.3)},
        {name:'CC solution architect (AI & Copilot Studio)', grade:'E', a:A(.5,1,.8,.5,.3, .5,1,.8,.5, .3,.3,.2,.2)},
        {name:'CC functional consultant (routing, channels)', grade:'C', a:A(.5,2,2,2,2, .5,2,2,2, 1,1,1,1)},
        {name:'CC functional consultant (supervisor, WFM, QM)', grade:'C', a:A(.5,1,1,1,1, .5,1,1,1, .5,.5,.5,.5)},
        {name:'Copilot Studio agent developer', grade:'C', a:A(0,1,2,1,.5, 0,1,2,1, .5,1,.5,.3)},
        {name:'Copilot Studio agent developer (languages)', grade:'B', a:A(0,.5,2,1,.5, 0,.5,2,1, .5,1,.5,.3)},
        {name:'Integration lead', grade:'D', a:A(0,.5,1,.5,.3, 0,.5,1,.5, .2,.5,.3,.2)},
        {name:'Integration / Power Platform developer', grade:'B', a:A(0,.5,3,1.5,.5, 0,.5,3,1.5, .3,1,.5,.3)},
        {name:'Data migration lead', grade:'C', a:A(0,.5,1,1,.5, 0,.5,1,1, .3,1,.5,.3)},
        {name:'Telephony / Teams voice engineer', grade:'C', a:A(.5,1,1,.5,1, .5,1,1,.5, .5,1,.5,1)},
        {name:'Test manager', grade:'D', a:A(0,.3,.5,1,.3, 0,.3,.5,1, 0,.2,1,.2)},
        {name:'Test analyst', grade:'A', a:A(0,0,1,3,.5, 0,0,1,3, 0,.5,2,.5)},
        {name:'Change & adoption lead', grade:'D', a:A(.5,.8,.8,.8,.8, .5,.8,.8,.8, .3,.3,.8,.5)},
        {name:'Training consultant', grade:'B', a:A(0,.3,.5,1,1, 0,.3,.5,1, .3,.5,1,.8)},
        {name:'Security & compliance lead', grade:'D', a:A(.3,.5,.3,.3,.2, .3,.5,.3,.3, .1,.1,.1,.1)}],
       integrations:[{name:'Identity & SSO (Entra ID)',complexity:'S',qty:1},{name:'Knowledge base (SharePoint / website)',complexity:'M',qty:1},{name:'ERP / order management (SAP)',complexity:'C',qty:1},{name:'Customer master data (MDM)',complexity:'C',qty:1},{name:'Legacy contact center / IVR cut-over',complexity:'C',qty:2},{name:'WFM (Calabrio / Verint / NICE)',complexity:'M',qty:1},{name:'Quality management / speech analytics',complexity:'M',qty:1},{name:'Data warehouse / Fabric reporting',complexity:'C',qty:1},{name:'Payment / PCI IVR',complexity:'C',qty:1},{name:'Field service / dispatch',complexity:'M',qty:1},{name:'Marketing / campaign platform',complexity:'M',qty:1},{name:'Survey / CSAT tool',complexity:'S',qty:1},{name:'Regional CRMs / country systems',complexity:'M',qty:3}],
       milestones:[{name:'Steering committee kick-off',w:1},{name:'Global design sign-off',w:14},{name:'Core template ready',w:30},{name:'Mid-programme review',w:52},{name:'Programme close & handover to AMS',end:0}] }
};
function applyPreset(code){
  const P=PRESETS[code]; if(!P) return; const I=S.impl;
  I.preset=code; I.model=P.model;
  if(P.single) I.single=clone(P.single);
  if(P.foundation){ I.foundation=clone(P.foundation); I.waveTpl=clone(P.waveTpl); I.waves=clone(P.waves); I.stagger=P.stagger; }
  I.roles=mapRoles(clone(P.roles)); I.integrations=clone(P.integrations); I.contingencyPct=P.contingencyPct; I.expensesPct=P.expensesPct;
  // milestones: resolve after plan is known
  const plan=calcPlan(); const start=S.meta.startDate;
  I.milestonesCustom=P.milestones.map(m=> ({name:m.name, date: m.end!==undefined ? addWeeks(plan.end, m.end) : addWeeks(start, m.w)}));
}

/* ===================== WIZARDS ===================== */
const INTEGRATION_CATALOG=[
  ['Identity & SSO (Entra ID)','S'],['Knowledge base (SharePoint / website)','M'],['Customer master data / MDM','M'],['ERP order & invoice lookup','M'],['ERP bidirectional (SAP / Oracle)','C'],
  ['Legacy contact center / IVR cut-over','C'],['WFM (Calabrio / Verint / NICE)','M'],['Quality management / speech analytics','M'],['Data warehouse / Fabric reporting','M'],
  ['Payment / PCI IVR','C'],['Survey / CSAT tool','S'],['Field service / dispatch','M'],['Marketing / campaign platform','M'],['E-commerce / order tracking','M'],['Chatbot / channel migration (existing bot)','M'],
  ['Outbound dialler / campaigns','M'],['Document management (attachments, letters)','S'],['Regional / country systems','M']
];
const YN=[['1','Yes'],['0','No']];
const SKU_CATALOG=[
  ['Power BI Pro (supervisors / analysts)', 14, 'user-month', ()=>Number(S.lic.supervisors)||10],
  ['Power BI Premium per user', 24, 'user-month', ()=>Number(S.lic.supervisors)||10],
  ['Power Automate Premium (per user, for makers / heavy flows)', 15, 'user-month', ()=>5],
  ['Power Automate Process (per flow, unattended / system flows)', 150, 'month', ()=>2],
  ['Power Apps Premium (extra apps for back-office users)', 20, 'user-month', ()=>Number(S.lic.backoffice)||10],
  ['Dynamics 365 Customer Voice extra responses (1,000 / month; 2,000 included with CS Enterprise)', 100, 'month', ()=>1],
  ['Unified Routing add-on (10,000 record routes / tenant / month)', 800, 'month', ()=>1],
  ['Microsoft Teams Enterprise (agents without a Microsoft 365 suite)', 5.25, 'user-month', ()=>0],
  ['Microsoft 365 Copilot (agent-facing, zero-rates internal agents)', 30, 'user-month', ()=>0],
  ['Dataverse database capacity add-on (per GB, beyond estimate)', 40, 'month', ()=>0],
  ['Managed Environments / Power Platform premium request capacity', 50, 'month', ()=>1]
];
const WIZ = {
  users:{ title:'Estimate users & licences', intro:'Answer in operational terms; the wizard turns this into licensed user counts.',
    q:[ {h:'Contact center size'},
        {k:'agents', l:'Agents (people who take live contacts, FTE seats)', t:'num', d:150},
        {k:'mix', l:'Channel mix', t:'sel', d:'blended', o:[['blended','Most agents handle voice and digital (blended)'],['split','Separate voice and digital teams'],['voice','Voice only'],['digital','Digital only']]},
        {k:'voiceShare', l:'If split: share of agents on voice (%)', t:'num', d:60},
        {k:'span', l:'Agents per supervisor / team lead', t:'num', d:12, hint:'Typical span of control 10–15'},
        {h:'Around the contact center'},
        {k:'boRatio', l:'Back-office / case workers per 10 agents', t:'num', d:2, hint:'People who work cases but take no live contacts'},
        {k:'readers', l:'Read-only / occasional users (managers, sales, field)', t:'num', d:20},
        {k:'existing', l:'Agents already licensed with CS Enterprise', t:'num', d:0} ],
    calc:a=>{ const ag=Number(a.agents)||0; let full=0,dig=0,voice=0;
      if(a.mix==='blended') full=ag; else if(a.mix==='voice') voice=ag; else if(a.mix==='digital') dig=ag; else { voice=Math.round(ag*Number(a.voiceShare)/100); dig=ag-voice; }
      const sup=Math.ceil(ag/Math.max(1,Number(a.span))); const bo=Math.round(ag/10*Number(a.boRatio));
      return [ ['lic.agentsFull',full,'Agents digital + voice'],['lic.agentsDigital',dig,'Agents digital only'],['lic.agentsVoice',voice,'Agents voice only'],['lic.supervisors',sup,'Supervisors'],['lic.backoffice',bo,'Back-office users'],['lic.teamMembers',Number(a.readers)||0,'Team Members'],['lic.existingCSE',Number(a.existing)||0,'Existing CSE users'] ]; } },
  copilot:{ title:'Estimate Copilot Studio credits', intro:'Describe the self-service and AI use. Text rates: classic answer 1, generative answer 2, agent action (trigger, lookup, flow, API) 5, Microsoft 365 tenant graph grounding 10. Voice bots bill per minute with answers and actions included: classic voice 10, GenAI voice 35 credits per minute. Classic voice minutes are first covered by the 2,000 Intelligent Voicebot minutes per Contact Center Voice user.',
    q:[ {h:'Voice self-service (IVR / voice agent)'},
        {k:'calls', l:'Inbound calls per month', t:'num', d:60000},
        {k:'ivrPct', l:'Calls that go through a Copilot Studio IVR (%)', t:'num', d:100, hint:'0 if you keep a classic DTMF IVR outside Copilot Studio'},
        {k:'ivrMin', l:'Minutes per call with the voice bot', t:'num', d:1.5},
        {k:'ivrTier', l:'Voice bot type', t:'sel', d:'classic', o:[['classic','Classic voice: topics & classic orchestration (10 credits/min)'],['genai','GenAI voice: generative orchestration (35 credits/min)']], hint:'Premium GenAI voice (75/min) is the Customer Assist Agent in the D365 AI agents wizard'},
        {h:'Digital self-service (chat / messaging bots)'},
        {k:'chats', l:'Chat & messaging sessions per month', t:'num', d:20000},
        {k:'botPct', l:'Sessions handled by a bot first (%)', t:'num', d:80},
        {k:'chatTurns', l:'Average bot turns per session', t:'num', d:6},
        {k:'chatGen', l:'Turns using generative answers (%)', t:'num', d:70},
        {k:'graphPct', l:'Generative turns grounded on Microsoft 365 tenant data (%)', t:'num', d:0, hint:'SharePoint / Graph grounding costs 10 credits per turn'},
        {k:'chatAct', l:'Actions per session', t:'num', d:1.5},
        {h:'Agent-facing and autonomous'},
        {k:'cseAgents', l:'Agents using a custom Copilot Studio agent-assist agent', t:'num', d:0, hint:'Built-in Copilot features in Customer Service and Contact Center are included in the licence; CS Premium credits don\'t cover custom agents'},
        {k:'perDay', l:'Copilot interactions per such agent per day', t:'num', d:10},
        {k:'auto', l:'Autonomous agent runs per month (email triage, case follow-up)', t:'num', d:0},
        {k:'autoCr', l:'Credits per autonomous run (trigger 5 + actions 5 each + answers)', t:'num', d:30} ],
    calc:a=>{ const n=k=>Number(a[k])||0;
      const ivrMin=n('calls')*n('ivrPct')/100*n('ivrMin');
      const chS=n('chats')*n('botPct')/100, genT=n('chatTurns')*n('chatGen')/100, chC=chS*(genT*2+(n('chatTurns')-genT)*1+genT*n('graphPct')/100*10+n('chatAct')*5);
      const per= chS? chC/chS : 0;
      const extra=n('cseAgents')*n('perDay')*22*2 + n('auto')*n('autoCr');
      const tier=a.ivrTier==='genai'?'genai':'classic';
      return [ ['lic.copilot.voiceMin',Math.round(ivrMin),'Voice bot minutes / month'],['lic.copilot.voiceTier',tier,'Voice bot tier',v=>v==='genai'?'GenAI voice':'Classic voice'],
               ['lic.copilot.sessions',Math.round(chS),'Digital self-service sessions / month'],['lic.copilot.creditsPerSession',round(per,1),'Credits per digital session'],['lic.copilot.extraCredits',Math.round(extra),'Extra credits / month'] ]; } },
  tel:{ title:'Estimate telephony volumes', intro:'Turns call volumes into minutes and service numbers. Voice runs on Teams Phone extensibility; Azure Communication Services voice is retired for new deployments.',
    q:[ {k:'calls', l:'Inbound calls per month', t:'num', d:60000},
        {k:'contain', l:'Calls fully handled in self-service (%)', t:'num', d:20},
        {k:'ivrMin', l:'Minutes in IVR / queue per call', t:'num', d:1.5},
        {k:'aht', l:'Average handling time with an agent (minutes)', t:'num', d:6},
        {k:'outCalls', l:'Outbound calls per month', t:'num', d:6000},
        {k:'outMin', l:'Average outbound call length (minutes)', t:'num', d:4},
        {k:'countries', l:'Countries / sites with their own numbers', t:'num', d:2},
        {k:'perCountry', l:'Service numbers per country (lines, brands, languages)', t:'num', d:4, hint:'Each service number needs its own Teams Phone Resource Account'},
        {k:'tollFree', l:'Inbound calls on toll-free (freephone) numbers (%)', t:'num', d:0},
        {k:'mobile', l:'Outbound calls to mobile numbers (%)', t:'num', d:50},
        {k:'mode', l:'PSTN connectivity for Teams Phone', t:'sel', d:'teams-payg', o:[['teams-payg','Microsoft Teams pay-as-you-go Calling Plan'],['teams-oc','Operator Connect (keep your carrier, carrier-managed)'],['teams-dr','Direct Routing (own SBC and carrier)']]} ],
    calc:a=>{ const n=k=>Number(a[k])||0; const agentCalls=n('calls')*(1-n('contain')/100);
      const inbound=n('calls')*n('ivrMin')+agentCalls*n('aht'); const outbound=n('outCalls')*n('outMin');
      const modes={'teams-payg':'Teams pay-as-you-go Calling Plan','teams-oc':'Operator Connect','teams-dr':'Direct Routing'}; const mode=modes[a.mode]?a.mode:'teams-payg';
      return [ ['lic.tel.inboundMin',Math.round(inbound),'Inbound minutes / month'],['lic.tel.outboundMin',Math.round(outbound),'Outbound minutes / month'],['lic.tel.numbers',Math.round(n('countries')*n('perCountry')),'Service numbers'],
               ['lic.tel.tollFreePct',n('tollFree'),'Toll-free inbound %'],['lic.tel.outMobilePct',n('mobile'),'Outbound to mobile %'],['lic.tel.mode',mode,'Connectivity',v=>modes[v]] ]; } },
  dv:{ title:'Estimate Dataverse capacity', intro:'Storage grows until retention kicks in; the wizard estimates steady state at full retention.',
    q:[ {h:'Voice recordings & transcripts (file capacity)'},
        {k:'agentMin', l:'Agent talk minutes per month', t:'num', d:300000, hint:'Roughly inbound agent minutes + outbound minutes'},
        {k:'recPct', l:'Calls recorded (%)', t:'num', d:100},
        {k:'mbMin', l:'MB per recorded minute', t:'num', d:0.5},
        {k:'recRet', l:'Recording retention (months)', t:'num', d:6},
        {h:'Cases, conversations & attachments'},
        {k:'cases', l:'Cases created per month', t:'num', d:40000},
        {k:'kbCase', l:'KB per case incl. activities & timeline (database)', t:'num', d:60},
        {k:'convs', l:'Conversations (all channels) per month', t:'num', d:80000},
        {k:'kbConv', l:'KB per conversation incl. transcript & sentiment (database)', t:'num', d:25},
        {k:'attach', l:'Attachment MB per case (file)', t:'num', d:0.3},
        {k:'dataRet', l:'Case & conversation retention (years)', t:'num', d:3},
        {k:'audit', l:'Audit log GB (steady state)', t:'num', d:5} ],
    calc:a=>{ const n=k=>Number(a[k])||0;
      const recGB=n('agentMin')*n('recPct')/100*n('mbMin')/1024*n('recRet'); const attGB=n('cases')*n('attach')/1024*n('dataRet')*12;
      const dbGB=(n('cases')*n('kbCase')+n('convs')*n('kbConv'))/1024/1024*n('dataRet')*12;
      return [ ['lic.dv.dbGB',round(dbGB,1),'Database GB'],['lic.dv.fileGB',round(recGB+attGB,1),'File GB'],['lic.dv.logGB',round(n('audit'),1),'Log GB'] ]; } },
  ams:{ title:'Estimate AMS / run team', intro:'Sizes the '+PARTNER+' run team from coverage, scale and change appetite.',
    q:[ {k:'agents', l:'Licensed agents at steady state', t:'num', d:150},
        {k:'coverage', l:'Support coverage', t:'sel', d:'8x5', o:[['8x5','Business hours, one region (8×5)'],['16x5','Extended hours / two regions (16×5)'],['24x7','Follow-the-sun (24×7)']]},
        {k:'change', l:'Change & enhancement appetite', t:'sel', d:'med', o:[['low','Keep the lights on'],['med','Regular small enhancements'],['high','Continuous improvement backlog, new agents & channels']]},
        {k:'langs', l:'Languages / countries supported', t:'num', d:1},
        {k:'ai', l:'Copilot Studio agents in production', t:'num', d:2, hint:'AI agents need tuning, monitoring and knowledge upkeep'} ],
    calc:a=>{ const n=k=>Number(a[k])||0; const cov={'8x5':1,'16x5':1.6,'24x7':2.5}[a.coverage]||1; const ch={low:.5,med:1,high:1.8}[a.change]||1;
      const func=Math.max(.5, round(n('agents')/150*cov + n('langs')*.1,1)); const dev=Math.max(.3, round(n('agents')/300*ch + n('ai')*.15,1)); const sdm=n('agents')>500? .5 : n('agents')>150? .3 : .2;
      return [ ['run.ams', mapRoles([{name:'Service delivery manager',grade:'D',fte:sdm},{name:'CC functional support (L2)',grade:'C',fte:func},{name:'Copilot Studio & integration support (L3)',grade:'B',fte:dev}]), 'AMS roles', v=>v.map(r=>r.name+' '+r.fte+' FTE').join(', ')] ]; } },
  d365ai:{ title:'Configure Dynamics 365 AI agents', intro:'Prebuilt agents in Customer Service and Contact Center consume Copilot credits from the same tenant pool as Copilot Studio (1,000 credits per CS Premium user included). Formulas match Microsoft\'s agent usage estimator. Answer in monthly volumes.',
    q:[ {h:'Customer Intent Agent — mines intents from history, suggests intents & next steps in real time'},
        {k:'cia_on', l:'Use the Customer Intent Agent?', t:'sel', d:'1', o:YN},
        {k:'cia_mining', l:'Historical cases/conversations mined per month (intent library upkeep)', t:'num', d:5000},
        {k:'cia_asstConv', l:'Agent-assisted conversations per month with real-time intent suggestions', t:'num', d:40000},
        {k:'cia_asstMsgs', l:'Average customer messages per assisted conversation', t:'num', d:8},
        {k:'cia_asstKA', l:'Messages that trigger a knowledge suggestion (%)', t:'num', d:40},
        {k:'cia_asstTools', l:'Tool calls per assisted conversation (look-ups)', t:'num', d:1},
        {k:'cia_selfConv', l:'Self-service conversations using intent-driven generative answers per month', t:'num', d:0, hint:'Leave 0 if self-service is already covered in the Copilot Studio wizard'},
        {k:'cia_selfMsgs', l:'Average messages per self-service conversation', t:'num', d:6},
        {k:'cia_selfKA', l:'Self-service messages answered from knowledge (%)', t:'num', d:50},
        {k:'cia_selfTools', l:'Tool calls per self-service message', t:'num', d:1},
        {h:'Case Management Agent — classifies email, creates & enriches cases, drafts resolutions, follows up and closes'},
        {k:'cma_on', l:'Use the Case Management Agent?', t:'sel', d:'0', o:YN},
        {k:'cma_emails', l:'New customer emails per month', t:'num', d:10000},
        {k:'cma_followUps', l:'Average follow-up emails per case', t:'num', d:1},
        {k:'cma_realtime', l:'Live conversations per month that also create/enrich cases', t:'num', d:0},
        {k:'cma_updates', l:'Average case updates by agents per conversation', t:'num', d:2},
        {k:'cma_autoPct', l:'Cases created automatically without agent review (%)', t:'num', d:50},
        {k:'cma_kaPct', l:'Resolutions that retrieve a knowledge article (%)', t:'num', d:60},
        {k:'cma_tools', l:'Tool calls per resolution email (order status, entitlement, …)', t:'num', d:1},
        {k:'cma_tmplPct', l:'Replies using a custom template (%)', t:'num', d:30},
        {k:'cma_waiting', l:'Follow-ups per case while waiting for customer confirmation', t:'num', d:1},
        {k:'cma_cls', l:'Capability: email classification', t:'sel', d:'1', o:YN},
        {k:'cma_enr', l:'Capability: case creation & enrichment', t:'sel', d:'1', o:YN},
        {k:'cma_res', l:'Capability: case resolution drafts', t:'sel', d:'1', o:YN},
        {k:'cma_fu', l:'Capability: follow-up & closure', t:'sel', d:'1', o:YN},
        {h:'Customer Knowledge Management Agent — harvests knowledge from cases & conversations, drafts articles'},
        {k:'kma_on', l:'Use the Knowledge Management Agent?', t:'sel', d:'0', o:YN},
        {k:'kma_bulk', l:'One-off: historical cases to harvest at go-live', t:'num', d:20000},
        {k:'kma_rtCases', l:'Closed cases scanned for knowledge gaps per month', t:'num', d:20000},
        {k:'kma_rtConv', l:'Closed conversations scanned per month', t:'num', d:40000},
        {k:'kma_unmPct', l:'Items with no matching article (%)', t:'num', d:20},
        {k:'kma_creation', l:'Copilot-assisted article drafts per month', t:'num', d:200},
        {k:'kma_revisions', l:'Average revisions per draft', t:'num', d:1},
        {h:'Quality Assurance Agent (Contact Center) — evaluates conversations against your rubric, coaches in real time'},
        {k:'qaa_on', l:'Use the Quality Assurance Agent?', t:'sel', d:'1', o:YN},
        {k:'qaa_closed', l:'Closed conversations evaluated per month', t:'num', d:20000},
        {k:'qaa_rtConv', l:'Conversations evaluated in real time per month', t:'num', d:0},
        {k:'qaa_rtInputs', l:'Average messages per real-time evaluated conversation', t:'num', d:8},
        {k:'qaa_coachConv', l:'Conversations with real-time coaching per month', t:'num', d:0},
        {k:'qaa_coachInputs', l:'Average coaching prompts per coached conversation', t:'num', d:4},
        {h:'Customer Assist Agent (Contact Center) — premium generative voice self-service, 75 credits per minute'},
        {k:'caa_on', l:'Use the premium GenAI voice agent?', t:'sel', d:'0', o:YN, hint:'If yes, set the IVR share to 0 in the Copilot Studio wizard to avoid double counting'},
        {k:'caa_conv', l:'Voice self-service conversations per month', t:'num', d:0},
        {k:'caa_durSec', l:'Average duration (seconds)', t:'num', d:120},
        {k:'caa_flows', l:'Agent flows per conversation', t:'num', d:1},
        {k:'caa_actions', l:'Actions per flow', t:'num', d:5},
        {k:'caa_standard', l:'Standard AI prompts per conversation', t:'num', d:1} ],
    calc:a=>{ const n=k=>Number(a[k])||0; const g=(p,keys)=>{ const o={}; keys.forEach(k=>o[k]=n(p+'_'+k)); return o; };
      const cia={on:n('cia_on'), ...g('cia',['mining','selfConv','selfMsgs','selfKA','selfTools','asstConv','asstMsgs','asstKA','asstTools'])};
      const cma={on:n('cma_on'), ...g('cma',['emails','followUps','realtime','updates','autoPct','kaPct','tools','tmplPct','waiting']), cap:{cls:n('cma_cls'),enr:n('cma_enr'),res:n('cma_res'),fu:n('cma_fu')}};
      const kma={on:n('kma_on'), ...g('kma',['bulk','rtCases','rtConv','unmPct','creation','revisions'])};
      const qaa={on:n('qaa_on'), ...g('qaa',['closed','rtConv','rtInputs','coachConv','coachInputs'])};
      const caa={on:n('caa_on'), ...g('caa',['conv','durSec','flows','actions','standard']), basic:0, premium:0};
      const prev=S.lic.d365ai; S.lic.d365ai={cia,cma,kma,qaa,caa}; const r=calcD365AI(); S.lic.d365ai=prev;
      return [ ['lic.d365ai',{cia,cma,kma,qaa,caa},'Enabled agents', v=>r.rows.length? r.rows.map(x=>x.name.split(' (')[0]+': '+fmtN(x.credits)).join(' · ') : 'none'], ['_total', r.total, 'Total credits / month', v=>fmtN(v)+(r.oneoff?' (+ '+fmtN(r.oneoff)+' one-off)':'')] ]; } },

  scope:{ title:'Size the project', intro:'Describe the scope in plain terms. The wizard recommends a size preset, applies it, then stretches phases and adds integrations and roles to match your answers. You can still edit everything afterwards.',
    q:[ {h:'Scale'},
        {k:'agents', l:'Agents (live-contact users) at full rollout', t:'num', d:150},
        {k:'countries', l:'Countries or business units to roll out', t:'num', d:1},
        {k:'langs', l:'Languages for agents & customers', t:'num', d:1},
        {k:'rollout', l:'Rollout preference', t:'sel', d:'auto', o:[['auto','Let the wizard decide'],['single','One go-live'],['waves','Wave per country / unit']]},
        {h:'Functional scope'},
        {k:'channels', l:'Channels', t:'sel', d:'both', o:[['voice','Voice only'],['digital','Digital only (chat, email, messaging, social)'],['both','Voice and digital']]},
        {k:'bots', l:'Self-service & AI', t:'sel', d:'gen', o:[['none','No bots, human agents only'],['dtmf','Classic IVR / simple FAQ bot'],['gen','Copilot Studio generative agents (voice and chat)'],['adv','Generative agents with actions, multiple languages, D365 AI agents']]},
        {k:'routing', l:'Routing complexity', t:'sel', d:'skills', o:[['simple','Queues by channel / line'],['skills','Skills, capacity profiles, priorities'],['complex','Many rule sets, entitlements, VIP, overflow between countries']]},
        {k:'wfm', l:'Workforce management / quality management in scope?', t:'sel', d:'0', o:YN},
        {k:'migration', l:'Data migration', t:'sel', d:'light', o:[['none','None, fresh start'],['light','Cases & contacts, one source'],['heavy','History, transcripts, knowledge from several sources']]},
        {k:'legacy', l:'Replace an existing contact center / IVR platform?', t:'sel', d:'1', o:YN},
        {k:'regulated', l:'Regulated sector (finance, public, health)?', t:'sel', d:'0', o:YN},
        {h:'Integrations needed'},
        {k:'i_erp', l:'ERP / order management', t:'sel', d:'1', o:YN},
        {k:'i_mdm', l:'Customer master data / MDM', t:'sel', d:'0', o:YN},
        {k:'i_kb', l:'Knowledge base (SharePoint, website, CMS)', t:'sel', d:'1', o:YN},
        {k:'i_dwh', l:'Data warehouse / Fabric reporting', t:'sel', d:'0', o:YN},
        {k:'i_pay', l:'Payments / PCI', t:'sel', d:'0', o:YN},
        {k:'i_other', l:'Other custom integrations (count)', t:'num', d:1} ],
    plan:a=>{ const n=k=>Number(a[k])||0; const ag=n('agents'), co=n('countries');
      let size = ag<=75&&co<=1 ? 'S' : ag<=250&&co<=2 ? 'M' : ag<=800 ? 'L' : 'XL';
      if(co>=3 && size==='M') size='L'; if(co>=6 && size==='L') size='XL';
      let model = a.rollout==='auto' ? (co>=3 || size==='L' || size==='XL' ? 'waves' : 'single') : a.rollout;
      if(model==='waves' && (size==='S'||size==='M')) size='L';
      if(model==='single' && (size==='L'||size==='XL')) model='single';
      const adj={design:0,build:0,test:0}; const notes=[];
      if(a.bots==='gen'){adj.build+=2; notes.push('+2 build weeks for generative agents');} if(a.bots==='adv'){adj.build+=4; adj.test+=1; notes.push('+4 build / +1 test weeks for advanced AI');}
      if(a.routing==='complex'){adj.design+=1; adj.build+=2; notes.push('+1 design / +2 build weeks for complex routing');}
      if(a.migration==='light'){adj.build+=1;} if(a.migration==='heavy'){adj.build+=3; adj.test+=1; notes.push('+3 build / +1 test weeks for heavy migration');}
      if(n('regulated')){adj.design+=1; adj.test+=2; notes.push('+1 design / +2 test weeks for regulated sector');}
      if(n('langs')>2){adj.build+=2; notes.push('+2 build weeks for '+n('langs')+' languages');}
      const integ=[]; if(n('legacy')) integ.push({name:'Legacy contact center / IVR cut-over',complexity:'C',qty:1});
      integ.push({name:'Identity & SSO (Entra ID)',complexity:'S',qty:1});
      if(n('i_kb')) integ.push({name:'Knowledge base (SharePoint / website)',complexity:'M',qty:1});
      if(n('i_erp')) integ.push({name:'ERP order & invoice lookup',complexity: n('regulated')||size==='XL'?'C':'M',qty:1});
      if(n('i_mdm')) integ.push({name:'Customer master data / MDM',complexity:'M',qty:1});
      if(n('i_dwh')) integ.push({name:'Data warehouse / Fabric reporting',complexity:'M',qty:1});
      if(n('i_pay')) integ.push({name:'Payment / PCI IVR',complexity:'C',qty:1});
      if(n('wfm')) integ.push({name:'WFM (Calabrio / Verint / NICE)',complexity:'M',qty:1});
      if(n('i_other')) integ.push({name:'Other custom integrations',complexity:'M',qty:n('i_other')});
      return {size, model, adj, notes, integ, waves: model==='waves'? Math.max(2,Math.min(8,co)) : 0}; },
    calc:a=>{ const p=WIZ.scope.plan(a); const totalW= (p.model==='single'? (PRESETS[p.size].single||DEFAULT_STATE().impl.single):PRESETS[p.size].foundation).reduce((s,x)=>s+x.weeks,0)+p.adj.design+p.adj.build+p.adj.test;
      return [ ['_size',p.size,'Recommended preset',v=>PRESETS[v].label+' ('+PRESETS[v].meta+')'], ['_model',p.model,'Rollout',v=>v==='waves'?p.waves+' waves':'single go-live'], ['_adj',p.notes,'Duration adjustments',v=>v.length?v.join('; '):'none'], ['_int',p.integ,'Integrations',v=>v.length+' items, '+v.reduce((s,i)=>s+i.qty*S.impl.intDays[i.complexity],0)+' days'] ]; },
    apply:a=>{ const p=WIZ.scope.plan(a); const snap=clone(S.impl); const snapR=clone(S.run.ams); applyPreset(p.size); const I=S.impl; I.model=p.model;
      const bump=(list, re, w)=>{ if(!w) return; const ph=list.find(x=>re.test(x.name)); if(ph) ph.weeks+=w; };
      if(p.model==='single'){ if(!PRESETS[p.size].single) I.single=clone(DEFAULT_STATE().impl.single); bump(I.single,/design/i,p.adj.design); bump(I.single,/build/i,p.adj.build); bump(I.single,/test/i,p.adj.test); }
      else { if(!PRESETS[p.size].foundation){ const L=PRESETS.L; I.foundation=clone(L.foundation); I.waveTpl=clone(L.waveTpl); I.stagger=L.stagger; } bump(I.foundation,/design/i,p.adj.design); bump(I.foundation,/build/i,p.adj.build); bump(I.foundation,/test/i,p.adj.test);
        const n=Number(a.agents)||0; I.waves=Array.from({length:p.waves},(_,i)=>({name:'Wave '+(i+1)+(i===0?' – Pilot':''), agents:Math.round(n/p.waves)})); }
      I.integrations=p.integ;
      if(Number(a.regulated) && !I.roles.some(r=>/security|compliance/i.test(r.name))) I.roles.push({name:'Security & compliance consultant', grade:mapGrade('D'), a:A(.2,.4,.2,.2,.1, .2,.4,.2,.2, .1,.1,.1,0)});
      if(Number(a.wfm) && !I.roles.some(r=>/wfm/i.test(r.name))) I.roles.push({name:'WFM / QM consultant', grade:mapGrade('C'), a:A(0,.3,.5,.3,.3, 0,.3,.5,.3, .2,.3,.2,.3)});
      if((Number(a.langs)||1)>2 && !I.roles.some(r=>/language/i.test(r.name))) I.roles.push({name:'Copilot Studio agent developer (languages)', grade:mapGrade('B'), a:A(0,.3,1,.5,.3, 0,.3,1,.5, .3,.5,.3,.2)});
      // re-place preset milestones on the adjusted plan
      const plan=calcPlan(); I.milestonesCustom=PRESETS[p.size].milestones.map(m=>({name:m.name, date:m.end!==undefined?addWeeks(plan.end,m.end):addWeeks(S.meta.startDate,m.w)}));
      I.preset='custom';
      toast('Sized as '+PRESETS[p.size].label+' with '+(p.model==='waves'?p.waves+' waves':'a single go-live')+'. Phases, roles, integrations, milestones and AMS team updated.', ()=>{ S.impl=snap; S.run.ams=snapR; render(); }); } },
  skus:{ title:'Add Microsoft add-on SKUs', intro:'Common add-ons around a Contact Center. Tick what applies; quantities default from your user counts. List prices in USD, editable afterwards.', skuCatalog:true },
  azure:{ title:'Estimate Azure & platform run costs', intro:'Rough monthly Azure footprint for the integration and telephony plumbing around Dynamics 365. Amounts are indicative list prices; replace with a real Azure calculator export when you have one.',
    q:[ {k:'envs', l:'Non-production environments with Azure resources (dev, test, UAT)', t:'num', d:2},
        {k:'integ', l:'Integration runtime (Functions, Logic Apps, Service Bus)', t:'sel', d:'med', o:[['low','Light: a few Logic Apps / consumption Functions'],['med','Medium: premium Functions, Service Bus, some Logic Apps'],['high','Heavy: App Service plan, APIM, Service Bus premium']]},
        {k:'apim', l:'API Management in front of integrations?', t:'sel', d:'0', o:YN},
        {k:'storeGB', l:'Archive storage for recordings / exports (GB)', t:'num', d:500},
        {k:'logsGB', l:'Monitoring ingest (Log Analytics / App Insights, GB per month)', t:'num', d:20},
        {k:'privnet', l:'Private networking (VNet integration, private endpoints)?', t:'sel', d:'0', o:YN},
        {k:'fabric', l:'Fabric capacity for reporting', t:'sel', d:'none', o:[['none','No / covered elsewhere'],['F2','F2 (~$263/mo)'],['F4','F4 (~$526/mo)'],['F8','F8 (~$1,051/mo)']]} ],
    calc:a=>{ const n=k=>Number(a[k])||0; const rt={low:60,med:350,high:1200}[a.integ]||350; const rows=[];
      rows.push({name:'Azure integration runtime (prod)', amount:rt}); rows.push({name:'Azure integration runtime (non-prod × '+n('envs')+')', amount:Math.round(rt*0.35*n('envs'))});
      if(n('apim')) rows.push({name:'API Management (Standard)', amount:700});
      rows.push({name:'Archive storage '+fmtN(n('storeGB'))+' GB (cool tier)', amount:Math.round(n('storeGB')*0.012)});
      rows.push({name:'Monitoring & logs '+fmtN(n('logsGB'))+' GB', amount:Math.round(n('logsGB')*2.5+30)});
      if(n('privnet')) rows.push({name:'Private endpoints & VNet', amount:60});
      const fc={F2:263,F4:526,F8:1051}[a.fabric]; if(fc) rows.push({name:'Fabric capacity '+a.fabric, amount:fc});
      return [ ['run.otherMonthly', rows, 'Monthly run rows', v=>v.map(r=>r.name+' '+fmt(r.amount)).join(' · ')], ['_tot', rows.reduce((s,r)=>s+r.amount,0), 'Total per month', v=>fmt(v)] ]; } },
  integ:{ title:'Pick integrations', intro:'Tick what the solution needs. Complexity drives effort: simple ≈ standard connector or lookup, medium ≈ custom API / Power Automate / custom connector, complex ≈ bidirectional, middleware, security or migration heavy.', catalog:true }
};
let wizOpen=null;
function openWizard(id){ wizOpen=id; if(!S.wiz[id]) S.wiz[id]={}; (WIZ[id].q||[]).forEach(q=>{ if(q.k && S.wiz[id][q.k]===undefined) S.wiz[id][q.k]=q.d; });
  if(id==='skus'){ const sel={}; SKU_CATALOG.forEach(([n,unit,per,qf])=>{ const cur=(S.lic.other||[]).find(o=>o.name===n); sel[n]={on:!!cur, qty:cur?cur.qty:qf()}; }); S.wiz.skus={sel}; }
  if(id==='integ'){ const sel={}; const names=new Set(INTEGRATION_CATALOG.map(c=>c[0])); (S.impl.integrations||[]).forEach(it=>{ if(names.has(it.name)) sel[it.name]={on:true,cx:it.complexity}; }); S.wiz.integ={sel}; }
  renderWizard(); }
function closeWizard(){ wizOpen=null; $('#overlay').classList.add('hidden'); $('#overlay').innerHTML=''; }
function renderWizard(){
  const W=WIZ[wizOpen], a=S.wiz[wizOpen]; let body='';
  if(W.skuCatalog){
    body=SKU_CATALOG.map(([name,unit,per,qf],i)=>{ const cur=(S.lic.other||[]).find(o=>o.name===name); const sel=a.sel[name]||{on:!!cur, qty:cur?cur.qty:qf()};
      return `<label class="chk"><input type="checkbox" data-wsku="${i}" ${sel.on?'checked':''}> <span style="flex:1">${esc(name)} <span class="muted small">${fmt(unit,2)} / ${per}</span></span><input type="number" data-wskuq="${i}" value="${sel.qty}" style="width:90px;text-align:right" title="Quantity"></label>`; }).join('');
    body+=`<div class="result">Ticked items replace matching rows in “Other Microsoft SKUs”; rows you added yourself stay.</div>`;
  } else if(W.catalog){
    body=INTEGRATION_CATALOG.map(([name,cx],i)=>{ const sel=a.sel[name];
      return `<label class="chk"><input type="checkbox" data-wcat="${i}" ${sel&&sel.on?'checked':''}> <span style="flex:1">${esc(name)}</span><select data-wcx="${i}">${['S','M','C'].map(c=>`<option value="${c}" ${(sel?sel.cx:cx)===c?'selected':''}>${{S:'Simple',M:'Medium',C:'Complex'}[c]}</option>`).join('')}</select></label>`; }).join('');
    body+=`<div class="result"><b>Effort per complexity</b> (days, editable on the Implementation tab): simple ${S.impl.intDays.S}, medium ${S.impl.intDays.M}, complex ${S.impl.intDays.C}. Unticked catalogue items are removed; your own custom rows stay.</div>`;
  } else {
    body=W.q.map(q=>{ if(q.h) return `<div class="qh">${esc(q.h)}</div>`;
      const ctl = q.t==='sel' ? `<select data-wq="${q.k}">${q.o.map(o=>`<option value="${o[0]}" ${a[q.k]==o[0]?'selected':''}>${esc(o[1])}</option>`).join('')}</select>` : `<input type="number" step="any" data-wq="${q.k}" value="${a[q.k]??''}">`;
      return `<div class="q"><div class="ql">${esc(q.l)}${q.hint?`<span class="hint">${esc(q.hint)}</span>`:''}</div>${ctl}</div>`; }).join('');
    const res=W.calc(a);
    body+=`<div class="result"><b>Result (applied to the raw inputs)</b><table>${res.map(r=>`<tr><td>${esc(r[2])}</td><td class="num" style="text-align:right">${r[3]?esc(r[3](r[1])):esc(String(r[1]))}</td></tr>`).join('')}</table></div>`;
  }
  $('#overlay').innerHTML=`<div class="modal" role="dialog" aria-modal="true"><header><div class="brand"><h1>${esc(W.title)}</h1><span>Estimator</span></div><div class="grow"></div><button class="btn ghost sm" data-wclose>✕</button></header>
    <div class="body"><p class="small muted">${esc(W.intro)}</p>${body}</div>
    <div class="foot"><span class="small muted">Answers are saved with the estimate.</span><div><button class="btn" data-wclose>Cancel</button> <button class="btn primary" data-wapply>Apply</button></div></div></div>`;
  $('#overlay').classList.remove('hidden');
}
function applyWizard(){
  const W=WIZ[wizOpen], a=S.wiz[wizOpen];
  if(W.apply){ W.apply(a); closeWizard(); render(); return; }
  if(W.skuCatalog){ const names=new Set(SKU_CATALOG.map(c=>c[0])); const keep=(S.lic.other||[]).filter(o=>!names.has(o.name));
    const picked=SKU_CATALOG.filter(([n])=>a.sel[n]&&a.sel[n].on).map(([n,unit,per])=>({name:n, qty:Number(a.sel[n].qty)||1, unit, per}));
    S.lic.other=[...picked,...keep]; closeWizard(); render(); return; }
  if(W.catalog){ const names=new Set(INTEGRATION_CATALOG.map(c=>c[0])); const keep=(S.impl.integrations||[]).filter(it=>!names.has(it.name));
    const picked=INTEGRATION_CATALOG.filter(([n])=>a.sel[n]&&a.sel[n].on).map(([n,cx])=>{ const ex=(S.impl.integrations||[]).find(it=>it.name===n); return {name:n, complexity:a.sel[n].cx||cx, qty:ex?ex.qty:1}; });
    S.impl.integrations=[...picked, ...keep]; }
  else W.calc(a).forEach(r=>{ if(!r[0].startsWith('_')) set(r[0], r[1]); });
  closeWizard(); render();
}
document.addEventListener('change', e=>{
  const el=e.target;
  if(el.dataset.wq!==undefined){ S.wiz[wizOpen][el.dataset.wq]= el.tagName==='SELECT'?el.value:Number(el.value); renderWizard(); }
  if(el.dataset.wsku!==undefined||el.dataset.wskuq!==undefined){ const i=Number(el.dataset.wsku??el.dataset.wskuq); const [name]=SKU_CATALOG[i]; const row=$('#overlay').querySelectorAll('.chk')[i]; S.wiz.skus.sel[name]={on:row.querySelector('input[type=checkbox]').checked, qty:Number(row.querySelector('input[type=number]').value)||1}; }
  if(el.dataset.wcat!==undefined||el.dataset.wcx!==undefined){ const i=Number(el.dataset.wcat??el.dataset.wcx); const [name,cx]=INTEGRATION_CATALOG[i]; const row=$('#overlay').querySelectorAll('.chk')[i]; S.wiz.integ.sel[name]={on:row.querySelector('input').checked, cx:row.querySelector('select').value}; }
});
document.addEventListener('click', e=>{
  const b=e.target.closest('[data-wiz],[data-wclose],[data-wapply],[data-preset]'); if(!b) return;
  if(b.dataset.wiz){ openWizard(b.dataset.wiz); return; }
  if(b.dataset.wclose!==undefined){ closeWizard(); return; }
  if(b.dataset.wapply!==undefined){ applyWizard(); return; }
  if(b.dataset.preset){ const snap=clone(S.impl); applyPreset(b.dataset.preset); render(); const snapR=clone(S.run.ams); toast('Applied the '+PRESETS[b.dataset.preset].label+' preset: phases, roles, integrations, contingency, milestones and AMS team replaced.', ()=>{ S.impl=snap; S.run.ams=snapR; render(); }); }
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && wizOpen) closeWizard(); });
function wizBtn(id, label='Estimate with wizard'){ return `<button class="btn sm wizbtn" data-wiz="${id}">✦ ${label}</button>`; }

/* ===================== TOAST ===================== */
let toastTimer=null;
function toast(msg, undo){ let t=$('#toast'); if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
  t.innerHTML=`<span>${esc(msg)}</span>${undo?' <button class="btn sm" id="toastUndo">Undo</button>':''} <button class="btn sm ghost" id="toastClose">✕</button>`; t.classList.add('show');
  if(undo) $('#toastUndo').onclick=()=>{ undo(); t.classList.remove('show'); };
  $('#toastClose').onclick=()=>t.classList.remove('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'), 8000); }
