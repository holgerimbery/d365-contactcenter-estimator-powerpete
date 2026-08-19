/* ===================== CONTROLLER ===================== */
function render(){
  const R=calcAll();
  const tabs={setup:renderSetup, lic:renderLic, impl:renderImpl, plan:renderPlan, run:renderRun, summary:renderSummary};
  $('#content').innerHTML=tabs[activeTab](R);
  $('#side').innerHTML=renderSide(R);
  $('#clientName').value=S.meta.client; $('#ccy').value=S.meta.currency;
  document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab===activeTab));
  document.title=(S.meta.client?S.meta.client+' — ':'')+'D365 Contact Center estimate';
  window._R=R;
}
document.addEventListener('change', e=>{
  const el=e.target; if(!el.dataset.bind) return;
  const type=el.dataset.type; let v=el.value;
  if(type==='num') v=v===''?0:Number(v);
  else if(type==='money') v=toUSD(Number(v)||0);
  set(el.dataset.bind, v);
  if(/^impl\.(single|foundation|waveTpl|waves|roles|stagger|contingencyPct|expensesPct)/.test(el.dataset.bind)) S.impl.preset='custom';
  if(el.dataset.bind==='meta.currency') { /* re-render converts everything */ }
  render();
});
document.addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.tab){ activeTab=b.dataset.tab; render(); return; }
  if(b.dataset.action==='add'){ get(b.dataset.list).push(TPL[b.dataset.tpl]()); if(/^impl\.(single|foundation|waveTpl|waves|roles)/.test(b.dataset.list)) S.impl.preset='custom'; render(); }
  if(b.dataset.action==='del'){ get(b.dataset.list).splice(Number(b.dataset.idx),1); if(/^impl\.(single|foundation|waveTpl|waves|roles)/.test(b.dataset.list)) S.impl.preset='custom'; render(); }
});
$('#btnReset').addEventListener('click', ()=>{ const snap=clone(S); S=DEFAULT_STATE(); render(); toast('All inputs reset to defaults.', ()=>{ S=snap; render(); }); });
$('#btnSave').addEventListener('click', ()=>{ const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}); dl(blob, fname('json')); });
$('#btnLoad').addEventListener('click', ()=>$('#fileLoad').click());
$('#fileLoad').addEventListener('change', e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const o=JSON.parse(r.result); S=deepMerge(DEFAULT_STATE(), o); render(); }catch(err){ toast('Could not read this file: '+err.message); } }; r.readAsText(f); e.target.value=''; });
function deepMerge(base, o){ if(Array.isArray(o)) return o; if(o&&typeof o==='object'){ const out={...base}; Object.keys(o).forEach(k=>{ out[k]= (base&&typeof base[k]==='object'&&!Array.isArray(base[k])) ? deepMerge(base[k], o[k]) : o[k]; }); return out; } return o; }
function fname(ext){ return ((S.meta.client||'D365-CC-estimate').replace(/[^a-z0-9]+/gi,'-'))+'-'+S.meta.version.replace(/[^a-z0-9.]+/gi,'')+'.'+ext; }
function dl(blob, name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},500); }

/* ===================== EXCEL EXPORT ===================== */
$('#btnExport').addEventListener('click', exportXlsx);
function exportXlsx(){
  if(typeof XLSX==='undefined'){ toast('Excel library not loaded.'); return; }
  const R=calcAll(); const cur=S.meta.currency; const M=v=>round(toDisp(v),2); const wb=XLSX.utils.book_new();
  const numFmt = '#,##0.00'; const dateFmt='dd-mmm-yyyy';
  const sheet=(name, aoa, opts={})=>{ const ws=XLSX.utils.aoa_to_sheet(aoa); ws['!cols']=(opts.cols||[]).map(w=>({wch:w}));
    // number formats
    const range=XLSX.utils.decode_range(ws['!ref']); for(let r=range.s.r;r<=range.e.r;r++) for(let c=range.s.c;c<=range.e.c;c++){ const cell=ws[XLSX.utils.encode_cell({r,c})]; if(!cell) continue; if(cell.t==='n' && !Number.isInteger(cell.v)) cell.z=numFmt; if(cell.v instanceof Date){ cell.t='d'; cell.z=dateFmt; } }
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0,31)); return ws; };
  const D=iso=>new Date(iso+'T00:00:00');
  const hdr=[[`Dynamics 365 Contact Center — cost & plan estimate`],[`Client`,S.meta.client],[`Prepared by`,S.meta.preparedBy],[`Version`,S.meta.version],[`Currency`,cur],[`Exported`,new Date()],[`Price basis`,S.meta.priceBasis],[]];

  // Summary
  const t=R.tco;
  sheet('Summary', [...hdr,
    ['Totals over '+S.meta.termYears+' years', cur], ['Implementation',M(t.impl)],['Licences',M(t.lic)],['Consumption & support',M(t.cons)],['AMS & other run',M(t.ams)],['Total cost of ownership',M(t.total)],[],
    ['Cost by year','Implementation','Licences','Consumption & support','AMS & other run','Total'],
    ...R.years.map(y=>['Year '+y.year, M(y.impl),M(y.lic),M(y.cons),M(y.ams),M(y.total)]),[],
    ['Key figures'],['Licensed users',R.lic.totalUsers],['Blended licence per user / month',M(R.lic.totalUsers?R.lic.monthly/R.lic.totalUsers:0)],['Implementation days',round(R.impl.totalDays,1)],['Project start',D(S.meta.startDate)],['First go-live',D(R.plan.golives[0].date)],['Project end',D(R.plan.end)],['Steady-state run rate per year',M(R.lic.annual+R.cons.monthly*12+R.ams.annual+R.ams.otherMonthly*12+R.lic.annual*S.run.supportPct/100)],[],
    ['Notes',S.meta.notes]
  ], {cols:[38,18,18,22,18,16]});

  // Licensing
  sheet('Licensing', [...hdr, ['Inputs'],['CRM',S.lic.crm==='third'?'Third-party CRM':'Dynamics 365 Customer Service'],['Strategy',S.lic.strategy],['Agents digital+voice',S.lic.agentsFull],['Agents digital only',S.lic.agentsDigital],['Agents voice only',S.lic.agentsVoice],['Supervisors',S.lic.supervisors],['Back-office',S.lic.backoffice],['Team Members',S.lic.teamMembers],['Existing CS Enterprise users',S.lic.existingCSE],[],
    ['Unit prices per user / month ('+cur+')'],['CS Premium',M(S.lic.p.premium)],['CS Enterprise',M(S.lic.p.cse)],['Contact Center digital + voice',M(S.lic.p.ccFull)],['Contact Center digital',M(S.lic.p.ccDigital)],['Contact Center voice',M(S.lic.p.ccVoice)],['Team Member',M(S.lic.p.teamMember)],[],
    ['SKU','Users','Unit / month','Monthly','Annual','Note'],
    ...R.lic.rows.map(r=>[r.name,r.qty,M(r.unit),M(r.monthly),M(r.monthly*12),r.note||'']),
    ['Total licences',R.lic.totalUsers,'',M(R.lic.monthly),M(R.lic.annual),''],[],
    ['Consumption (per month at 100% ramp)','Basis','Monthly','Annual'],
    ...R.cons.rows.map(r=>[r.name,r.detail,M(r.monthly),M(r.monthly*12)]),
    ['Total consumption','',M(R.cons.monthly),M(R.cons.monthly*12)],[],
    ['Dynamics 365 AI agents','Breakdown','Credits / month'], ...R.cons.d365.rows.map(r=>[r.name,r.detail,r.credits]), ['Total D365 agent credits','',R.cons.d365.total],
    ['Copilot Studio credits','',R.cons.copilot.csNeed],['Included credits (CS Premium)','',R.cons.copilot.incl],['Overage credits','',R.cons.copilot.over]
  ], {cols:[52,40,16,16,16,30]});

  // Implementation
  const cols=phaseCols();
  const rolesHdr=['Role','Grade','Day rate',...cols.map(c=>(c.grp?c.grp+': ':'')+c.label+' (FTE)'),'Days','Cost'];
  sheet('Implementation', [...hdr, ['Size preset', S.impl.preset==='custom'?'Custom':(PRESETS[S.impl.preset]||{}).label||S.impl.preset],['Rollout model',S.impl.model==='waves'?'Wave-based ('+S.impl.waves.length+' waves)':'Single go-live'],['Expenses %',S.impl.expensesPct],['Contingency %',S.impl.contingencyPct],[],
    ['Grades'],['Code','Label','Day rate ('+cur+')'],...S.impl.grades.map(g=>[g.code,g.label,M(g.rate)]),[],
    ['Roles & allocation'], rolesHdr,
    ...S.impl.roles.map((r,i)=>[r.name,r.grade,M(R.impl.byRole[i].rate),...cols.map(c=>Number((r.a||{})[c.key])||0),round(R.impl.byRole[i].days,1),M(R.impl.byRole[i].cost)]),
    ['Roles subtotal','','',...cols.map(()=>''),round(R.impl.totalDays-R.impl.integ.days,1),M(R.impl.roleServices)],[],
    ['Integrations','Complexity','Qty','Days'], ...R.impl.integ.rows.map(r=>[r.name,r.complexity,r.qty,r.days]),
    ['Integration effort split','Grade','Share','Days','Cost'], ...R.impl.integ.byRole.map(r=>[r.name,r.grade,r.share,round(r.days,1),M(r.cost)]), ['Integrations total','','',round(R.impl.integ.days,1),M(R.impl.integ.cost)],[],
    ['Cost build-up'],['Roles',M(R.impl.roleServices)],['Integrations',M(R.impl.integ.cost)],['Services subtotal',M(R.impl.services)],['Expenses & travel',M(R.impl.expenses)],['Contingency',M(R.impl.contingency)],['One-off items',M(R.impl.oneOff)],['Total implementation',M(R.impl.total)],[],
    ['One-off items'],...S.impl.oneOff.map(o=>[o.name,M(Number(o.amount)||0)]),[],
    ['Cost by phase','Wave','Start','End','Weeks','Services'],
    ...R.plan.phases.map(ph=>[ph.name, ph.waveName||'', D(ph.start), D(ph.end), ph.weeks, M(R.impl.byPhase[ph.key+(ph.wave??'')]||0)])
  ], {cols:[46,14,14,14,14,14,14,14,14,14,14,14]});

  // Plan
  const ms=milestones(R);
  sheet('Plan', [...hdr, ['Phase','Wave','Start','End','Weeks','Type'],
    ...R.plan.phases.map(ph=>[ph.name, ph.waveName||'', D(ph.start), D(ph.end), ph.weeks, ph.kind==='hyper'?'Go-live & hypercare':ph.wave!==undefined?'Wave':'Foundation']),[],
    ['Milestone','Date','Type'], ...ms.map(m=>[m.name, D(m.date), m.kind]),[],
    ['Licence ramp','Date','Cumulative share'], ...R.plan.golives.map((g,i)=>[g.name, D(g.date), Math.min(1,R.plan.golives.slice(0,i+1).reduce((s,x)=>s+x.share,0))])
  ], {cols:[40,24,16,16,10,20]});

  // Runtime
  sheet('Runtime', [...hdr, ['Licence start rule',S.run.licenseStart],['AMS start',S.run.amsStart],['Days per FTE per year',S.run.daysPerFteYear],['Support uplift %',S.run.supportPct],[],
    ['AMS roles','Grade','FTE','Day rate','Annual'], ...R.ams.rows.map(r=>[r.name,r.grade,r.fte,M(r.rate),M(r.annual)]), ['AMS total','','','',M(R.ams.annual)],[],
    ['Other monthly run costs','Per month'], ...S.run.otherMonthly.map(o=>[o.name,M(Number(o.amount)||0)]),[],
    ['Steady-state run rate','Monthly','Annual'],['Licences',M(R.lic.monthly),M(R.lic.annual)],...R.cons.rows.map(r=>[r.name,M(r.monthly),M(r.monthly*12)]),['Support uplift',M(R.lic.annual*S.run.supportPct/100/12),M(R.lic.annual*S.run.supportPct/100)],['AMS',M(R.ams.monthly),M(R.ams.annual)],['Other run',M(R.ams.otherMonthly),M(R.ams.otherMonthly*12)],
    ['Total',M(R.lic.monthly+R.cons.monthly+R.lic.annual*S.run.supportPct/100/12+R.ams.monthly+R.ams.otherMonthly),M((R.lic.monthly+R.cons.monthly+R.ams.monthly+R.ams.otherMonthly)*12+R.lic.annual*S.run.supportPct/100)]
  ], {cols:[46,14,14,14,14]});

  // Cash flow
  sheet('Cash flow', [...hdr, ['Month','Period start','Implementation','Licences','Consumption & support','AMS & other run','Total','Cumulative'],
    ...(()=>{ let cum=0; return R.months.map(m=>{ cum+=m.total; return [m.idx+1, D(m.start), M(m.impl),M(m.lic),M(m.cons),M(m.ams),M(m.total),M(cum)]; }); })()
  ], {cols:[8,14,16,16,20,16,16,16]});

  // Wizard answers
  const wz=[...hdr,['Wizard','Question','Answer']];
  Object.keys(S.wiz).forEach(id=>{ const W=WIZ[id]; if(!W) return; if(W.catalog){ Object.entries(S.wiz[id].sel||{}).forEach(([n,v])=>{ if(v.on) wz.push([W.title,n,{S:'Simple',M:'Medium',C:'Complex'}[v.cx]||v.cx]); }); return; }
    if(W.skuCatalog){ Object.entries(S.wiz[id].sel||{}).forEach(([n,v])=>{ if(v.on) wz.push([W.title,n,'qty '+v.qty]); }); return; }
    if(!W.q) return;
    W.q.forEach(q=>{ if(!q.k) return; const v=S.wiz[id][q.k]; const lbl=q.t==='sel'?((q.o.find(o=>o[0]==v)||[])[1]||v):v; wz.push([W.title,q.l,lbl]); }); });
  sheet('Wizard inputs', wz, {cols:[32,60,30]});
  XLSX.writeFile(wb, fname('xlsx'));
}

render();
