/* ===================== AMS SIZING BY PROJECT SIZE ===================== */
function sizeAms(sizeCode, opts={}){
  const agents=Number(opts.agents)|| (Number(S.lic.agentsFull)+Number(S.lic.agentsDigital)+Number(S.lic.agentsVoice)) || 100;
  const langs=Number(opts.langs)||1, ai=opts.ai||'gen', regulated=!!opts.regulated, wfm=!!opts.wfm;
  const base={S:{sdm:.1,func:.5,dev:.3}, M:{sdm:.2,func:1,dev:.5}, L:{sdm:.3,func:2,dev:1}, XL:{sdm:.5,func:4,dev:2}}[sizeCode]||{sdm:.2,func:1,dev:.5};
  const func=round(Math.max(base.func, agents/150 + Math.max(0,langs-1)*.1),1);
  const dev=round(Math.max(base.dev, agents/300 + (ai==='adv'?.5:ai==='gen'?.25:0)),1);
  const rows=[ {name:'Service delivery manager', grade:'D', fte:base.sdm}, {name:'CC functional support (L2)', grade:'C', fte:func}, {name:'Copilot Studio & integration support (L3)', grade:'B', fte:dev} ];
  if(ai==='adv' || sizeCode==='L' || sizeCode==='XL') rows.push({name:'AI agent operations (tuning, knowledge upkeep)', grade:'C', fte: sizeCode==='XL'?1:.5});
  if(regulated) rows.push({name:'Security & compliance (audits, retention, access reviews)', grade:'D', fte:.2});
  if(wfm) rows.push({name:'WFM / QM support', grade:'B', fte:.3});
  return mapRoles(rows);
}
// hook AMS into preset application
const _applyPreset=applyPreset;
applyPreset=function(code){ _applyPreset(code); S.run.ams=sizeAms(code); };
// scope wizard: size AMS from the same answers and extend hypercare where warranted
const _scopeApply=WIZ.scope.apply;
WIZ.scope.apply=function(a){ _scopeApply(a); const p=WIZ.scope.plan(a); const I=S.impl;
  S.run.ams=sizeAms(p.size,{agents:Number(a.agents), langs:Number(a.langs), ai:a.bots, regulated:Number(a.regulated)===1, wfm:Number(a.wfm)===1});
  const extra=(Number(a.regulated)?1:0)+(a.bots==='adv'?1:0); if(extra){ const list=I.model==='single'?I.single:I.waveTpl; const ph=list.find(x=>/hypercare/i.test(x.name)); if(ph) ph.weeks+=extra; }
};

/* ===================== PDF EXPORT ===================== */
$('#btnPdf').addEventListener('click', exportPdf);
function exportPdf(){
  if(!window.jspdf){ toast('PDF library not loaded.'); return; }
  const R=calcAll(); const { jsPDF } = window.jspdf; const doc=new jsPDF({unit:'mm', format:'a4', orientation:'portrait', compress:true});
  const W=210, H=297, ML=14, MR=14, CW=W-ML-MR;
  // brand palette (from brands/<id>.json)
  const BP=BRAND.pdf; const NAVY=BP.band, BLUE=BP.accent, [S1,S2,S3,S4]=BP.series, TEAL=S2, GREEN=S3, AMBER=S4, GREY=[95,107,133], LINE=[217,223,234], LIGHT=[241,244,249], TERRA=BP.marker; const LA=BP.logoAspect||0.3267; const lite=BRAND.mode==='lite';
  try{ doc.addFileToVFS('Ubuntu-R.ttf', BRAND.fontR); doc.addFont('Ubuntu-R.ttf','Ubuntu','normal'); doc.addFileToVFS('Ubuntu-B.ttf', BRAND.fontB); doc.addFont('Ubuntu-B.ttf','Ubuntu','bold'); }catch(e){}
  const FONT = doc.getFontList().Ubuntu ? 'Ubuntu' : 'helvetica';
  const client=S.meta.client||'Dynamics 365 Contact Center estimate'; const cur=S.meta.currency;
  const money=v=>fmt(v); const money2=v=>fmt(v,2);
  let y=0;
  const setF=(size,style='normal',color=[27,36,55])=>{ doc.setFont(FONT,style); doc.setFontSize(size); doc.setTextColor(...color); };
  const ensure=(need)=>{ if(y+need>H-18){ doc.addPage(); y=20; } };
  const h1=(t)=>{ ensure(16); setF(15,'bold',NAVY); doc.text(t, ML, y+6); doc.setDrawColor(...BLUE); doc.setLineWidth(.8); doc.line(ML,y+9,ML+18,y+9); y+=16; };
  const h2=(t)=>{ ensure(10); setF(10,'bold',GREY); doc.text(t.toUpperCase(), ML, y+4); y+=8; };
  const para=(t, size=9)=>{ setF(size,'normal',[27,36,55]); const lines=doc.splitTextToSize(t, CW); ensure(lines.length*size*.45+2); doc.text(lines, ML, y+3); y+=lines.length*size*.45+3; };
  const table=(head, body, opts={})=>{ doc.autoTable({ startY:y, margin:{left:ML,right:MR}, head:[head], body, theme:'plain', styles:{font:FONT,fontSize:8,cellPadding:1.6,textColor:[27,36,55],lineColor:LINE,lineWidth:{bottom:.15}}, headStyles:{fontStyle:'bold',textColor:GREY,fontSize:7,cellPadding:1.6,lineWidth:{bottom:.4},lineColor:[27,36,55]}, columnStyles:opts.cols||{}, didParseCell:d=>{ if(opts.totalRows && d.section==='body' && opts.totalRows.includes(d.row.index)){ d.cell.styles.fontStyle='bold'; d.cell.styles.lineWidth={top:.4}; d.cell.styles.lineColor=[27,36,55]; } if(opts.subRows && d.section==='body' && opts.subRows.includes(d.row.index)) d.cell.styles.textColor=GREY; }, ...(opts.extra||{}) }); y=doc.lastAutoTable.finalY+6; };
  const R_=v=>({halign:'right'});

  /* ---- Cover band ---- */
  setF(20,'bold'); const titleLines=doc.splitTextToSize(client, CW-46); setF(8,'normal'); const pbN=doc.splitTextToSize(BP.preparedBy, CW-40).length; const bandH=64+(titleLines.length-1)*9+(pbN-1)*4;
  doc.setFillColor(...NAVY); doc.rect(0,0,W,bandH,'F'); doc.setFillColor(...BLUE); doc.rect(0,bandH,W,1.2,'F');
  try{ doc.addImage(BP.logoLight,'PNG', ML, 10, 42, 42*LA, 'logoWhite', 'FAST'); }catch(e){}
  setF(8,'normal',[255,255,255]); doc.setTextColor(200,210,225); doc.text(BP.kicker, W-MR, 17, {align:'right'});
  setF(15,'normal'); doc.setTextColor(255,255,255); doc.text(BP.promise, W-MR, 30, {align:'right'});
  setF(20,'bold'); doc.setTextColor(255,255,255); doc.text(titleLines, ML, 36);
  const metaY=36+(titleLines.length-1)*9+12;
  setF(9,'normal'); doc.setTextColor(200,210,225);
  const metaLine=[ S.meta.preparedBy?'Prepared by '+S.meta.preparedBy:null, 'Version '+S.meta.version, 'Currency '+cur, 'Exported '+fmtDate(new Date().toISOString().slice(0,10)), 'Horizon '+S.meta.termYears+' years' ].filter(Boolean).join('   ·   ');
  doc.text(metaLine, ML, metaY); doc.setFontSize(8); const pbLines=doc.splitTextToSize(BP.preparedBy, CW-40); doc.text(pbLines, ML, metaY+6);
  y=bandH+8;
  /* ---- KPI boxes ---- */
  const t=R.tco; const kp= lite ? [['Licences / year',money(R.lic.annual),S2],['Consumption / year',money(R.cons.monthly*12),S3],['Lic + cons, '+S.meta.termYears+' yr',money(t.lic+t.cons),NAVY],['Implementation (illustr.)',money(t.impl),S1],['AMS & run (illustr.)',money(t.ams),S4]]
    : [['Total cost (TCO)',money(t.total),NAVY],['Implementation',money(t.impl),S1],['Licences',money(t.lic),S2],['Consumption & support',money(t.cons),S3],['AMS & other run',money(t.ams),S4]];
  const bw=(CW-4*3)/5; kp.forEach((k,i)=>{ const x=ML+i*(bw+3); doc.setFillColor(...LIGHT); doc.roundedRect(x,y,bw,20,1.5,1.5,'F'); doc.setFillColor(...k[2]); doc.rect(x,y,1.5,20,'F'); setF(6.5,'normal',GREY); doc.text(k[0].toUpperCase(), x+4, y+6); setF(i===0?11:10,'bold',NAVY); doc.text(k[1], x+4, y+15); });
  y+=28;
  /* ---- Key figures + year table side by side ---- */
  h1('Summary');
  const runRate=R.lic.annual + R.cons.monthly*12 + R.ams.annual + R.ams.otherMonthly*12 + R.lic.annual*S.run.supportPct/100;
  table(['Year','Implementation','Licences','Consumption & support','AMS & other run','Total'],
    [...R.years.map(yv=>['Year '+yv.year, money(yv.impl), money(yv.lic), money(yv.cons), money(yv.ams), money(yv.total)]), ['Total', money(t.impl), money(t.lic), money(t.cons), money(t.ams), money(t.total)]],
    {cols:{1:R_(),2:R_(),3:R_(),4:R_(),5:R_()}, totalRows:[R.years.length]});
  table(['Key figure','Value','Key figure','Value'], [
    ['Licensed users', fmtN(R.lic.totalUsers), 'Project duration', fmtN(daysBetween(S.meta.startDate,R.plan.end)/7,0)+' weeks'],
    ['Blended licence per user / month', money2(R.lic.totalUsers?R.lic.monthly/R.lic.totalUsers:0), 'First go-live', fmtDate(R.plan.golives[0].date)],
    ['Implementation days', fmtN(R.impl.totalDays,0), 'Last hypercare exit', fmtDate(R.plan.hypercareEnd)],
    ['Implementation per licensed user', money(R.lic.totalUsers?R.impl.total/R.lic.totalUsers:0), 'Rollout model', S.impl.model==='waves'?S.impl.waves.length+' waves':'single go-live'],
    ['Steady-state run rate / year', money(runRate), 'Size preset', S.impl.preset==='custom'?'Custom':(PRESETS[S.impl.preset]||{}).label||'-'] ], {cols:{1:R_(),3:R_()}});
  /* ---- Monthly chart ---- */
  h2('Cost per month over the horizon');
  ensure(56); const cx=ML+18, cy=y, cw=CW-18, ch=42; const months=R.months; const max=Math.max(1,...months.map(m=>m.total)); const bwid=cw/months.length;
  doc.setDrawColor(...LINE); doc.setLineWidth(.2); [0,.5,1].forEach(f=>{ const yy=cy+ch-f*ch; doc.line(cx,yy,cx+cw,yy); setF(6,'normal',GREY); doc.text(money(f*max), cx-1, yy+1.5, {align:'right'}); });
  months.forEach((m,i)=>{ let yy=cy+ch; const x=cx+i*bwid; [[S1,m.impl],[S2,m.lic],[S3,m.cons],[S4,m.ams]].forEach(([c,v])=>{ const hh=v/max*ch; if(hh<=0) return; yy-=hh; doc.setFillColor(...c); doc.rect(x+bwid*.1, yy, bwid*.8, hh, 'F'); }); if(i%12===0){ setF(6,'normal',GREY); doc.text('Y'+(i/12+1), x, cy+ch+3.5); } });
  y=cy+ch+8; setF(6.5,'normal',GREY); let lx=ML; [['Implementation',S1],['Licences',S2],['Consumption & support',S3],['AMS & other run',S4]].forEach(([n,c])=>{ doc.setFillColor(...c); doc.rect(lx,y-2.2,2.5,2.5,'F'); doc.text(n, lx+3.5, y); lx+=doc.getTextWidth(n)+10; }); y+=8;
  if(S.meta.notes){ h2('Notes'); para(S.meta.notes); }

  /* ---- Licensing ---- */
  doc.addPage(); y=20; h1('Licensing & consumption');
  para(`${S.lic.crm==='third'?'Third-party CRM with Dynamics 365 Contact Center standalone SKUs.':'Dynamics 365 Customer Service as CRM.'} Strategy: ${ {auto:'cheapest per user type', premium:'CS Premium', attach:'CS Enterprise + Contact Center add-on'}[S.lic.strategy] }. Prices are Microsoft list, converted at ${fx()} ${cur} per USD.`);
  h2('Licences (100% ramp)');
  table(['SKU','Users','Unit / month','Monthly','Annual'], [...R.lic.rows.map(r=>[r.name+(r.note?' ('+r.note+')':''), fmtN(r.qty), money2(r.unit), money(r.monthly), money(r.monthly*12)]), ['Total licences', fmtN(R.lic.totalUsers), '', money(R.lic.monthly), money(R.lic.annual)]], {cols:{1:R_(),2:R_(),3:R_(),4:R_()}, totalRows:[R.lic.rows.length]});
  h2('Copilot credits');
  table(['Source','Credits / month'], [['Copilot Studio agents (self-service, agent-facing, autonomous)', fmtN(R.cons.copilot.csNeed)], ...R.cons.d365.rows.map(r=>[r.name+' — '+r.detail, fmtN(r.credits)]), ['Included with CS Premium ('+fmtN(R.lic.premiumUsers)+' users × '+fmtN(S.lic.copilot.includedPerPremium)+')', '−'+fmtN(R.cons.copilot.incl)], ['Overage → '+R.cons.copilot.note+' → '+money(R.cons.copilot.cost)+' / month', fmtN(R.cons.copilot.over)]], {cols:{1:R_()}, totalRows:[R.cons.d365.rows.length+2]});
  h2('Consumption & other run items (per month at 100% ramp)');
  const consRows=R.cons.rows.filter(r=>!r.name.startsWith('Copilot credits')).map(r=>[r.name, r.detail, money(r.monthly), money(r.monthly*12)]);
  table(['Item','Basis','Monthly','Annual'], [['Copilot credits (overage, all agents)', R.cons.copilot.note, money(R.cons.copilot.cost), money(R.cons.copilot.cost*12)], ...consRows, ['Total consumption', '', money(R.cons.monthly), money(R.cons.monthly*12)]], {cols:{2:R_(),3:R_()}, totalRows:[consRows.length+1]});

  /* ---- Implementation ---- */
  doc.addPage(); y=20; h1('Implementation'+(lite?' (illustrative)':''));
  if(lite){ ensure(18); doc.setFillColor(...LIGHT); doc.roundedRect(ML,y,CW,14,1.5,1.5,'F'); doc.setFillColor(...BLUE); doc.rect(ML,y,1.5,14,'F'); setF(8,'bold',NAVY); doc.text('Illustrative model with placeholder day rates.', ML+5, y+5.5); setF(8,'normal',[27,36,55]); doc.text('For a real implementation and run estimate contact '+BRAND.contact.name+' at Capgemini: '+BRAND.contact.email, ML+5, y+10.5); y+=20; }
  const P=S.impl.preset==='custom'?null:PRESETS[S.impl.preset];
  para(`${P?'Sized as '+P.label+' ('+P.meta+'). ':''}${S.impl.model==='waves'?'Wave-based rollout: foundation phases once, then '+S.impl.waves.length+' waves, '+S.impl.stagger+' weeks apart.':'Single go-live with sequential phases.'} Effort = phase weeks × 5 × FTE × grade day rate. Contingency ${S.impl.contingencyPct}%, expenses ${S.impl.expensesPct}%.`);
  h2('Cost build-up');
  table(['Item','Amount'], [['Roles ('+fmtN(R.impl.totalDays-R.impl.integ.days,0)+' days)', money(R.impl.roleServices)], ['Integrations ('+fmtN(R.impl.integ.days,0)+' days)', money(R.impl.integ.cost)], ['Expenses & travel', money(R.impl.expenses)], ['Contingency', money(R.impl.contingency)], ['One-off items', money(R.impl.oneOff)], ['Total implementation', money(R.impl.total)]], {cols:{1:R_()}, totalRows:[5]});
  h2('Roles & grades');
  table(['Role','Grade','Day rate','Days','Cost'], [...R.impl.byRole.map(r=>[r.name, r.grade, money(r.rate), fmtN(r.days,0), money(r.cost)]), ...R.impl.integ.byRole.map(r=>[r.name+' (integrations)', r.grade, money(gradeRate(r.grade)), fmtN(r.days,0), money(r.cost)])], {cols:{2:R_(),3:R_(),4:R_()}});
  h2('Integrations');
  table(['Integration','Complexity','Qty','Days'], R.impl.integ.rows.length? R.impl.integ.rows.map(r=>[r.name, {S:'Simple',M:'Medium',C:'Complex'}[r.complexity], fmtN(r.qty), fmtN(r.days)]) : [['None','','','']], {cols:{2:R_(),3:R_()}});
  h2('Cost by phase');
  table(['Phase','Wave','Start','End','Weeks','Services'], R.plan.phases.map(ph=>[ph.name, ph.waveName||'', fmtDate(ph.start), fmtDate(ph.end), ph.weeks, money(R.impl.byPhase[ph.key+(ph.wave??'')]||0)]), {cols:{4:R_(),5:R_()}});

  /* ---- Plan ---- */
  doc.addPage(); y=20; h1('Plan & milestones');
  const start=S.meta.startDate, end=R.plan.end, tot=Math.max(1,daysBetween(start,end)); const gx=ML+62, gw=CW-62; const px=d=>gx+Math.max(0,Math.min(1,daysBetween(start,d)/tot))*gw;
  ensure(12); setF(6.5,'normal',GREY); { let dd=new Date(start+'T00:00:00'); dd.setDate(1); dd.setMonth(dd.getMonth()+1); doc.setDrawColor(...LINE); doc.setLineWidth(.2); const rowsN=R.plan.phases.length+1; const nM=Math.ceil(monthsBetween(start,end)); const step=Math.max(1,Math.ceil(nM/9)); let i=0; while(dd<new Date(end+'T00:00:00')){ const iso=dd.toISOString().slice(0,10); const x=px(iso); if(i%step===0){ doc.text(dd.toLocaleDateString('en-GB',{month:'short',year:'2-digit'}), x+.5, y+3); doc.line(x,y+4,x,y+5+rowsN*5.2); } dd.setMonth(dd.getMonth()+1); i++; } }
  y+=6;
  R.plan.phases.forEach(ph=>{ ensure(6); setF(7,'normal',[27,36,55]); const lbl=(ph.waveName&&ph.key==='w0'?ph.waveName+': ':'')+ph.name; doc.text(doc.splitTextToSize(lbl,60)[0], ML+(ph.wave!==undefined?3:0), y+3.2); const c=ph.kind==='hyper'?S4:ph.wave!==undefined?S2:S1; doc.setFillColor(...c); doc.roundedRect(px(ph.start), y, Math.max(.8,px(ph.end)-px(ph.start)), 3.6, .6, .6, 'F'); y+=5.2; });
  const ms=milestones(R); ensure(6); setF(7,'bold',[27,36,55]); doc.text('Milestones', ML, y+3.2); ms.filter(m=>m.kind==='golive'||m.kind==='custom').forEach(m=>{ const x=px(m.date); doc.setFillColor(...TERRA); doc.triangle(x-1.6,y,x+1.6,y,x,y+3.4,'F'); }); y+=8;
  setF(6.5,'normal',GREY); lx=ML; [['Foundation / main phase',S1],['Wave phase',S2],['Go-live & hypercare',S4],['Go-live / custom milestone',TERRA]].forEach(([n,c])=>{ doc.setFillColor(...c); doc.rect(lx,y-2.2,2.5,2.5,'F'); doc.text(n, lx+3.5, y); lx+=doc.getTextWidth(n)+10; }); y+=8;
  h2('Milestones'); table(['Milestone','Date','Type'], ms.map(m=>[m.name, fmtDate(m.date), m.kind]), {});
  h2('Licence ramp'); table(['Event','Date','Cumulative licence share'], [...R.plan.golives.map((g,i)=>[g.name, fmtDate(g.date), fmtN(Math.min(100,R.plan.golives.slice(0,i+1).reduce((s,x)=>s+x.share,0)*100),0)+'%']), ['AMS / support starts', fmtDate(S.run.amsStart==='golive'?R.plan.golives[0].date:R.plan.hypercareEnd), '']], {cols:{2:R_()}});

  /* ---- Runtime ---- */
  doc.addPage(); y=20; h1('Runtime & support');
  para(`Licences ${ {golive:'ramp per go-live', build:'start at build start', project:'start at project start'}[S.run.licenseStart] }. AMS ${S.run.amsStart==='golive'?'starts at first go-live':'starts after hypercare'}. ${S.run.daysPerFteYear} billable days per FTE per year.`);
  h2(PARTNER+' AMS / run roles'); table(['Role','Grade','FTE','Day rate','Annual'], [...R.ams.rows.map(r=>[r.name, r.grade, fmtN(r.fte,1), money(r.rate), money(r.annual)]), ['AMS per year','', fmtN(R.ams.rows.reduce((s,r)=>s+r.fte,0),1), '', money(R.ams.annual)]], {cols:{2:R_(),3:R_(),4:R_()}, totalRows:[R.ams.rows.length]});
  h2('Steady-state run rate'); const sup=R.lic.annual*S.run.supportPct/100;
  table(['Item','Monthly','Annual'], [['Licences', money(R.lic.monthly), money(R.lic.annual)], ['Consumption (credits, telephony, Dataverse, other SKUs)', money(R.cons.monthly), money(R.cons.monthly*12)], ['Support uplift ('+S.run.supportPct+'%)', money(sup/12), money(sup)], [PARTNER+' AMS', money(R.ams.monthly), money(R.ams.annual)], ['Other run costs (Azure etc.)', money(R.ams.otherMonthly), money(R.ams.otherMonthly*12)], ['Total run rate', money(R.lic.monthly+R.cons.monthly+sup/12+R.ams.monthly+R.ams.otherMonthly), money(runRate)]], {cols:{1:R_(),2:R_()}, totalRows:[5]});
  if(S.run.otherMonthly.length){ h2('Other monthly run costs'); table(['Item','Per month'], S.run.otherMonthly.map(o=>[o.name, money(Number(o.amount)||0)]), {cols:{1:R_()}}); }

  /* ---- Assumptions ---- */
  doc.addPage(); y=20; h1('Assumptions & inputs');
  h2('Basis'); para(S.meta.priceBasis);
  h2('Unit prices ('+cur+' per user / month)'); table(['SKU','Price','SKU','Price'], [['CS Premium', money2(S.lic.p.premium), 'Contact Center digital + voice', money2(S.lic.p.ccFull)], ['CS Enterprise', money2(S.lic.p.cse), 'Contact Center digital', money2(S.lic.p.ccDigital)], ['Team Member', money2(S.lic.p.teamMember), 'Contact Center voice', money2(S.lic.p.ccVoice)], ['Copilot credit pack ('+fmtN(S.lic.copilot.packCredits)+')', money2(S.lic.copilot.packPrice), 'PAYG per credit', fmt(S.lic.copilot.paygPerCredit,4)]], {cols:{1:R_(),3:R_()}});
  h2('Grades & day rates'); table(['Grade','Label','Day rate'], S.impl.grades.map(g=>[g.code, g.label, money(g.rate)]), {cols:{2:R_()}});
  const wz=[]; Object.keys(S.wiz).forEach(id=>{ const Wd=WIZ[id]; if(!Wd) return; if(Wd.catalog||Wd.skuCatalog){ Object.entries(S.wiz[id].sel||{}).forEach(([n,v])=>{ if(v.on) wz.push([Wd.title, n, v.cx?({S:'Simple',M:'Medium',C:'Complex'}[v.cx]):('qty '+v.qty)]); }); return; } if(!Wd.q) return; Wd.q.forEach(q=>{ if(!q.k) return; const v=S.wiz[id][q.k]; wz.push([Wd.title, q.l, String(q.t==='sel'?((q.o.find(o=>o[0]==v)||[])[1]||v):v)]); }); });
  if(wz.length){ h2('Wizard answers'); table(['Wizard','Question','Answer'], wz, {cols:{0:{cellWidth:36},2:{cellWidth:40}}}); }

  /* ---- Sign-off ---- */
  ensure(30); y+=6; doc.setFillColor(...NAVY); doc.roundedRect(ML, y, CW, 22, 1.5, 1.5, 'F'); try{ doc.addImage(BP.logoLight,'PNG', ML+6, y+11-15*LA, 30, 30*LA, 'logoWhite', 'FAST'); }catch(e){}
  setF(BP.signoff.sub?12:14,'normal'); doc.setTextColor(255,255,255); doc.text(BP.signoff.text, W-MR-6, y+(BP.signoff.sub?10:13.5), {align:'right'});
  if(BP.signoff.sub){ setF(8,'normal'); doc.setTextColor(210,215,235); doc.text(BP.signoff.sub, W-MR-6, y+16, {align:'right'}); } y+=28;
  /* ---- Footer on every page ---- */
  const n=doc.getNumberOfPages(); for(let i=1;i<=n;i++){ doc.setPage(i); setF(6.5,'normal',GREY); doc.setDrawColor(...LINE); doc.line(ML,H-12,W-MR,H-12); doc.text(client+'  ·  D365 Contact Center estimate '+S.meta.version+'  ·  '+BP.footer, ML, H-8); try{ doc.addImage(BP.logoDark,'PNG', W-MR-22, H-11.4-(22*LA-7.2)/2, 22, 22*LA, 'logoDark', 'FAST'); }catch(e){} doc.text('Page '+i+' of '+n, W-MR-25, H-8, {align:'right'}); }
  doc.save(fname('pdf'));
}
