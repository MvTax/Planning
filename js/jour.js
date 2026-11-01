/* JOUR : page d'accueil, détail d'une tâche, ajout de tâche, planning de travail / agenda. Propriétaire : « Agent Jour ». */
/* ---------- JOUR ---------- */
function greeting(){const h=new Date().getHours();return h<5?'Bonne nuit':h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir'}
const KIND=t=>({travail:'work',sport:'sport',cardio:'sport',repas:'meal',courses:'meal',batch:'meal',agenda:'free',rdv:'free',etude:'perso',maison:'perso',perso:'perso'}[t]||'perso');
function renderJour(){
  const t=today();if(!V.date)V.date=t;const ds=V.date,T=dayTasks(t),p=S.profile;
  const w=weekOf(t);
  /* à faire tout de suite (en cours ou à valider) */
  let hero='',cur=null;
  if(started()){
    cur=T.find(x=>!x.info&&!x.meal&&['run','due'].includes(status(x)));
    if(cur){const s2=status(cur);const e=at(t,cur.start+cur.dur);
      const when=s2==='run'?`Commencé à ${hm(cur.start)} · reste ${durTxt(Math.max(1,Math.round((e-Date.now())/6e4)))}`:`${hm(cur.start)} → ${hm(cur.start+cur.dur)} · à valider`;
      hero=`<section class="hero col ag-hero" style="--hc:#3F3C9C;--hc2:#7A3D8E"><div class="row between"><span class="lbl">${s2==='run'?'En cours · pas encore pointé':'À valider'}</span><span class="pts">${M$(cur.pts)}</span></div>
        <div class="row" style="gap:12px;align-items:flex-end"><span class="big">${hm(cur.start)}</span><div style="min-width:0"><h2>${esc(cur.title)}</h2><p class="meta">${when}</p></div></div><div class="ag-vb">${valBtns(cur,true)}</div></section>`;
    }
  }
  V.statsHTML=statsHTML(ds);
  const wkLabel=w?`Semaine ${w} · ${PHASES[phaseOf(w)].n}`:`${PHASES[0].n} · programme le ${fmtShort(parseYmd(S.programStart||t))}`;
  if(document.getElementById('agPage'))agRefresh();   // planning détaillé ouvert dessous : on le garde à jour
  return`<header class="top"><div class="stack" style="gap:4px;min-width:0"><span class="lbl">${fmtDate(new Date())}</span><h1>${greeting()}${p.name?', '+esc(p.name):''}</h1><span class="muted" style="font-size:13px">${wkLabel}</span></div>
    <button class="avatar" data-act="settings" aria-label="Réglages">${p.name?esc(p.name[0].toUpperCase()):ic('gear')}</button></header>
  ${(()=>{let nx=null,nd=t;const base=started()?t:START_DAY;for(let k=0;k<7&&!nx;k++){nd=addDs(base,k);nx=dayTasks(nd).find(x=>!x.info&&(!cur||x.key!==cur.key)&&['run','due','soon','up'].includes(status(x)))}
    const s3=nx?status(nx):'';
    return`<div class="stats" style="grid-template-columns:1fr 1.35fr"><div class="stat k-money" data-act="tab" data-v="cagnotte"><span class="lbl">${ic('cagnotte')} Cagnotte</span><b>${eur(periodEur())}</b><span class="muted num" style="font-size:12px">${M$(dayPts(t))} aujourd’hui</span></div>
    ${nx?`<button class="stat k-${KIND(nx.type)}" ${agAct(nx)} style="text-align:left;${s3==='run'||s3==='due'?'outline:2px solid var(--warn);outline-offset:-2px':''}"><span class="lbl">${ic(nx.type)} Prochaine tâche</span><b style="font-family:var(--f-ui);font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(nx.title)}</b><span class="row" style="gap:6px;justify-content:space-between"><span class="muted num" style="font-size:12px">${nd===t?'':fmtShort(parseYmd(nd))+' · '}${hm(nx.start)}</span><span class="pill p-${s3}" style="padding:3px 8px;font-size:11px">${agLbl(nx,s3)}</span></span></button>`:
      `<div class="stat k-free"><span class="lbl">${ic('check')} Prochaine tâche</span><b style="font-family:var(--f-ui);font-size:15px">Rien de prévu</b></div>`}</div>`})()}
  ${!started()?`<section class="card tint k-work" style="gap:6px"><span class="lbl">Tout est prêt</span><h2>Ton programme commence le dimanche 1er novembre</h2><p class="muted" style="font-size:13.5px">Cagnotte, pointages, repas et sport sont remis à zéro. Rendez-vous demain matin.</p></section>`:''}
  ${hasUpdate()?`<button class="banner info" data-act="forceUpdate" style="width:100%;text-align:left">${ic('arrow')}<span class="grow">Nouvelle version disponible${REMOTE_V.notes?' : '+esc(REMOTE_V.notes):''}. Touche pour mettre à jour.</span></button>`:''}
  ${hero}
  ${daySummary(t,T)}
  ${started()?(p.omad?dayRow():mealCard()):''}`;
}
/* « Ma journée en chiffres » (fenêtre du sablier) */
function statsHTML(ds){
  const isToday=ds===today(),st=dayStats(ds),mon=mondayOf(ds);
  const wk=Array.from({length:7},(_,i)=>dayStats(addDs(mon,i)));const wWork=wk.reduce((a,x)=>a+x.work,0),wFree=wk.reduce((a,x)=>a+x.free,0);
  const n0=nowMin(),wl=isToday?workBlocks(ds).blocks.reduce((a,b)=>a+Math.max(0,b.e-Math.max(b.s,n0)),0):0,tb=isToday?Math.max(0,st.bed-n0):0;
  const seg=(v,k)=>v>0?`<i class="k-${k}" style="width:${st.awake?v/st.awake*100:0}%"></i>`:'';
  return`<span class="lbl">${isToday?'Aujourd’hui':fmtShort(parseYmd(ds))} · éveillé de ${hm(st.wake)} à ${hm(st.bed)}</span><h2>Ma journée en chiffres</h2><p class="muted" style="font-size:13.5px">Le temps de ta journée, calculé à partir de ton planning de travail, de tes trajets et de ton heure de coucher.</p>
   <div class="card">
    ${isToday?`<span class="lbl">Il reste aujourd’hui</span><div class="tiles"><div class="tile tint k-work"><span class="lbl">Travail</span><b>${wl?durTxt(wl):'fini'}</b></div><div class="tile tint k-pts"><span class="lbl">Avant dodo</span><b>${durTxt(tb)}</b></div><div class="tile tint k-free"><span class="lbl">Libre</span><b>${durTxt(Math.max(0,tb-wl))}</b></div></div>`:''}
    <span class="lbl" style="${isToday?'padding-top:4px':''}">Répartition de la journée · ${durTxt(st.awake)} éveillé</span>
    <div class="segbar">${seg(st.work,'work')}${seg(st.trips,'trip')}${seg(st.free,'free')}</div>
    <div class="legend"><span class="k-work"><i></i>Travail <b class="num" style="color:var(--ink)">${st.work?durTxt(st.work):'0'}</b></span><span class="k-trip"><i></i>Trajets <b class="num" style="color:var(--ink)">${st.trips?durTxt(st.trips):'0'}</b></span><span class="k-free"><i></i>Libre <b class="num" style="color:var(--ink)">${durTxt(st.free)}</b></span></div>
    <p class="muted" style="font-size:12.5px;border-top:1px solid var(--line);padding-top:10px">Cette semaine : ${durTxt(wWork)} de travail · ${durTxt(Math.round(wFree/7))} de temps libre par jour en moyenne.</p></div>`;
}
const agLbl=(x,s2)=>{const pu=S.punches[x.key]||{};return x.info?(STAMP[s2][1]||durTxt(x.dur)):x.meal?MEAL_LBL[s2]:s2==='done'?(pu.how&&pu.how!=='ok'?HOW[pu.how]:'Validé'):STAMP[s2][1]};
const agPast=(x,s2)=>s2==='done'||s2==='miss'||s2==='idone';
/* carte « Ma journée » : mini frise + prochaines tâches ; touche = planning détaillé plein écran */
function daySummary(t,T){
  const st=dayStats(t),n=nowMin();
  const lo=Math.min(st.wake,...T.map(x=>x.start)),hi=Math.max(st.bed,...T.map(x=>x.start+x.dur)),pc=m=>clamp((m-lo)/(hi-lo)*100,0,100);
  const segs=T.map(x=>{const a=pc(x.start),b=pc(x.start+Math.max(x.dur,10));return`<i class="k-${KIND(x.type)}${agPast(x,status(x))?' past':''}${x.info?' info':''}" style="left:${a.toFixed(2)}%;width:${Math.max(b-a,1.5).toFixed(2)}%"></i>`}).join('');
  let ticks='';for(let m=Math.ceil(lo/360)*360;m<hi;m+=360)if(pc(m)>=26&&pc(m)<=78)ticks+=`<span class="num" style="left:${pc(m).toFixed(2)}%">${hm(m)}</span>`;
  const rem=T.filter(x=>!agPast(x,status(x)));const meal=rem.find(x=>x.meal);
  let pick=rem.slice(0,4);if(meal&&!pick.includes(meal))pick=[...rem.filter(x=>!x.meal).slice(0,3),meal];
  const more=rem.length-pick.length;
  const rows=pick.map(x=>{const s2=status(x);const hot=s2==='run'||s2==='due';
    return`<div class="ags-r${hot?' hot':''}"><span class="num ags-h">${hm(x.start)}</span><i class="ags-dot k-${KIND(x.type)}"></i><span class="ags-n">${esc(x.meal?'Repas OMAD':x.title)}${x.meal?`<small class="num">${hm(x.start)} → ${hm(x.start+x.dur)}</small>`:''}</span><span class="pill p-${s2}">${agLbl(x,s2)}</span></div>`}).join('');
  return`<div class="card ags" role="button" tabindex="0" data-act="agFull" data-pop aria-label="Ouvrir le planning détaillé">
   <div class="row between"><span class="lbl">Ma journée</span><span class="ags-go">Planning détaillé ${ic('arrow')}</span></div>
   <div class="ags-bar"><div class="ags-track">${segs}${n>=lo&&n<=hi?`<b class="ags-now" style="left:${pc(n).toFixed(2)}%"></b>`:''}</div>
    <div class="ags-ax"><span class="num">${ic('reveil')}${hm(st.wake)}</span>${ticks}<span class="num">${hm(st.bed)}${ic('coucher')}</span></div></div>
   <div class="ags-list">${rows||`<p class="muted" style="font-size:14px">${T.length?'Tout est fait pour aujourd’hui.':'Jour off : pas de travail ni de séance prévus.'}</p>`}${more>0?`<span class="muted ags-more">+ ${more} autre${more>1?'s':''}</span>`:''}</div></div>`;
}
/* ---------- planning détaillé (page plein écran) ---------- */
const AG_PX=72/60;           // hauteur d'une minute (1 h = 72 px)
const AG_MIN=36;             // hauteur minimale d'un bloc, pour bien le toucher
let AGS={ds:null};           // jour affiché (pour le défilement automatique)
/* le bloc du repas OMAD d'aujourd'hui ouvre la fenêtre du repas ; les autres, le détail de la tâche */
const agAct=x=>`data-act="${x.meal&&x.ds===today()?'agMeal':'task'}" data-k="${x.key}" data-pop`;
function agRange(T,st){let lo=Math.min(st.wake,...T.map(x=>x.start)),hi=Math.max(st.bed,...T.map(x=>x.start+Math.max(x.dur,15)));
  return{lo:Math.floor(lo/60)*60,hi:Math.ceil(hi/60)*60}}
/* colonnes quand des blocs se chevauchent : chaque groupe se partage la largeur */
function agLayout(T){const L=T.map(x=>({x,s:x.start,e:x.start+Math.max(x.dur*AG_PX,AG_MIN)/AG_PX,col:0,n:1})).sort((a,b)=>a.s-b.s||b.e-a.e);
  let grp=[],end=-1e9;const flush=()=>{const cols=[];for(const b of grp){let c=cols.findIndex(e=>e<=b.s);if(c<0){c=cols.length;cols.push(0)}cols[c]=b.e;b.col=c}grp.forEach(b=>b.n=cols.length);grp=[]};
  for(const b of L){if(b.s>=end)flush();grp.push(b);end=Math.max(end,b.e)}flush();return L}
function agendaView(ds,T,st){
  const{lo,hi}=agRange(T,st),y=m=>((m-lo)*AG_PX).toFixed(1),isToday=ds===today(),n=nowMin();
  let hours='';for(let m=lo;m<=hi;m+=30)hours+=m%60?`<div class="ag-h half" style="top:${y(m)}px"></div>`:`<div class="ag-h" style="top:${y(m)}px"><span class="num">${hm(m)}</span></div>`;
  const mark=(m,l,cls)=>`<div class="ag-mark ${cls}" style="top:${y(m)}px"><span>${l} · ${hm(m)}</span></div>`;
  const blocks=agLayout(T).map(({x,col,n:nc})=>{const s2=status(x),k=KIND(x.type);
    const lbl=agLbl(x,s2),h=Math.max(x.dur*AG_PX,AG_MIN),small=h<48;
    const when=x.meal?`Fenêtre ${hm(x.start)} → ${hm(x.start+x.dur)}`:`${hm(x.start)}${x.dur?' → '+hm(x.start+x.dur):''}`;
    const cls=[x.info?'info':'',agPast(x,s2)?'past':'',isToday&&(s2==='run'||s2==='due')?'hot':'',small?'small':'',nc>1?'narrow':'',x.meal?'meal':''].join(' ');
    return`<button class="ag-b k-${k} ${cls}" ${agAct(x)} data-start="${x.start}" style="top:${y(x.start)}px;height:${h.toFixed(1)}px;--col:${col};--n:${nc}" aria-label="${esc(x.title)}, ${when}">
      <span class="ag-i">${ic(x.type)}</span><span class="ag-t"><b>${x.meal?'Repas OMAD':esc(x.title)}</b><span class="num">${when}${x.loc&&!small?' · '+esc(x.loc):''}</span></span>${lbl&&!small&&nc<3?`<span class="pill p-${s2}">${lbl}</span>`:''}</button>`}).join('');
  const now=isToday&&n>=lo&&n<=hi?`<div class="ag-now" style="top:${y(n)}px"><span class="num">${hm(n)}</span></div>`:'';
  const past=isToday&&n>lo?`<div class="ag-pastz" style="height:${y(Math.min(n,hi))}px"></div>`:'';
  return`<div class="ag"><div class="ag-grid" data-lo="${lo}" data-hi="${hi}" style="height:${((hi-lo)*AG_PX).toFixed(0)}px">${past}${hours}
    ${mark(st.wake,'Réveil','wake')}${mark(st.bed,'Au lit','bed')}
    <div class="ag-col">${blocks}</div>${now}
    ${T.length?'':`<div class="ag-empty">Jour off : pas de travail ni de séance prévus.</div>`}</div></div>`;
}
function agPageHTML(){
  const t=today(),ds=V.date||t,isToday=ds===t,T=dayTasks(ds),st=dayStats(ds),mon=mondayOf(ds);
  const strip=Array.from({length:7},(_,i)=>{const d=addDs(mon,i);const dot=d<=t?(S.perfect[d]?'full':dayPts(d)>0?'part':''):'';
    return`<button class="wd ${d===ds?'on':''}${d===t?' ag-today':''}" data-act="date" data-v="${d}">${DAYS[i]}<b>${parseYmd(d).getDate()}</b><i class="dot ${dot}"></i></button>`}).join('');
  return`<div class="ag-page" id="agPage">
   <div class="stack ag-head"><span class="lbl">Planning · ${esc(fmtDate(parseYmd(ds)))}</span><h2>${isToday?'Aujourd’hui':esc(fmtDate(parseYmd(ds)).replace(/^./,c=>c.toUpperCase()))}</h2>
    <span class="muted num" style="font-size:13px">${st.work?durTxt(st.work)+' de travail · ':''}${durTxt(st.free)} de libre · au lit à ${hm(st.bed)}</span></div>
   <div class="row ag-tools"><button class="chip sm" data-act="plWkDay" data-v="-7" aria-label="Semaine précédente">←</button><button class="chip sm" data-act="plWkDay" data-v="7" aria-label="Semaine suivante">→</button>
    <span style="flex:1"></span>${isToday?'':`<button class="chip sm" data-act="date" data-v="${t}">Aujourd’hui</button>`}
    <button class="iconbtn" data-act="dayStats" data-pop aria-label="Ma journée en chiffres">${ic('hourglass')}</button><button class="iconbtn" data-act="workday" data-v="${ds}" data-pop aria-label="Planning de travail de la semaine">${ic('agenda')}</button></div>
   <div class="week">${strip}</div>
   ${agendaView(ds,T,st)}
   <p class="muted ag-hint">Touche une tâche pour la voir. Pour en créer une : touche deux fois une heure libre et, sans lever le doigt, glisse vers le bas.</p>
  </div>`;
}
function agFull(){openSheet(agPageHTML()+`<div class="ag-fabw"><button class="ag-fab" data-act="create" data-pop aria-label="Créer une tâche (voix)">${ic('plus')}</button></div>`,'plan',{full:true});agAutoScroll()}
function agRefresh(){const pg=document.getElementById('agPage');if(!pg||AGT.drag)return;pg.outerHTML=agPageHTML();if(AGS.ds!==V.date)agAutoScroll()}
/* défilement automatique : un peu avant maintenant (aujourd'hui), sinon un peu avant la première tâche */
function agAutoScroll(){const ds=V.date;AGS.ds=ds;setTimeout(()=>{const g=document.querySelector('#agPage .ag-grid'),sh=g&&g.closest('.sheet');if(!sh)return;
  let y=0,e=g;while(e&&e!==sh){y+=e.offsetTop;e=e.offsetParent}
  const T=dayTasks(ds),m=ds===today()?nowMin()-60:(T.length?T[0].start:dayStats(ds).wake)-30;
  sh.scrollTop=Math.max(0,y+(m-(+g.dataset.lo))*AG_PX-12)},0)}
/* ---------- créer en traçant un créneau : double-toucher une heure libre puis glisser vers le bas ---------- */
let AGT={t:0,x:0,y:0,drag:null};
const q15=m=>Math.round(m/15)*15;
const agVib=()=>{try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}};
function agMinAt(g,cy){return +g.dataset.lo+(cy-g.getBoundingClientRect().top)/AG_PX}
function agGhost(){const d=AGT.drag;if(!d)return;let gh=d.g.querySelector('.ag-ghost');
  if(!gh){gh=document.createElement('div');gh.className='ag-ghost';gh.setAttribute('data-pop','');(d.g.querySelector('.ag-col')||d.g).appendChild(gh)}
  const lo=+d.g.dataset.lo;gh.style.top=((d.s-lo)*AG_PX).toFixed(1)+'px';gh.style.height=((d.e-d.s)*AG_PX).toFixed(1)+'px';
  gh.innerHTML=`<b class="num">${hm(d.s)} → ${hm(d.e)}</b><span>${durTxt(d.e-d.s)}</span>`}
document.addEventListener('touchstart',e=>{
  const g=e.target&&e.target.closest&&e.target.closest('#agPage .ag-grid');
  if(!g||e.touches.length!==1||e.target.closest('.ag-b')){AGT.t=0;return}
  const p=e.touches[0],now=Date.now();
  if(now-AGT.t<400&&Math.abs(p.clientY-AGT.y)<36&&Math.abs(p.clientX-AGT.x)<36){
    e.preventDefault();AGT.t=0;const hi=+g.dataset.hi,s=clamp(q15(agMinAt(g,p.clientY)),+g.dataset.lo,hi-15);
    AGT.drag={g,s,e:Math.min(s+60,hi),y0:p.clientY,moved:false};agGhost();agVib();
  }else{AGT.t=now;AGT.x=p.clientX;AGT.y=p.clientY}
},{passive:false});
document.addEventListener('touchmove',e=>{const d=AGT.drag;if(!d)return;e.preventDefault();const p=e.touches[0];
  if(!d.moved&&Math.abs(p.clientY-d.y0)<8)return;d.moved=true;
  const m=clamp(q15(agMinAt(d.g,p.clientY)),d.s+15,+d.g.dataset.hi);if(m!==d.e){d.e=m;agGhost();agVib()}
},{passive:false});
const agEnd=e=>{const d=AGT.drag;if(!d)return;AGT.drag=null;const gh=d.g.querySelector('.ag-ghost');
  if(e.type==='touchcancel'){if(gh)gh.remove();return}
  e.preventDefault();if(gh)TAP={el:gh,t:Date.now()};createAt(V.date,d.s,d.e);if(gh)gh.remove()};
document.addEventListener('touchend',agEnd,{passive:false});document.addEventListener('touchcancel',agEnd,{passive:false});
setInterval(()=>{if(sheetName==='plan')agRefresh()},60000);   // ligne « maintenant » à jour
Object.assign(ACT,{
  agFull:()=>{V.date=today();AGS.ds=null;agFull()},
  agMeal:()=>openMeal(),
  plWkDay:(el,v)=>{V.date=addDs(V.date||today(),+v);render()}
});
function dayStatsSheet(){render();openSheet(`<div class="grab"></div>${V.statsHTML||''}<button class="btn ghost" data-act="workday" data-v="${V.date}">Voir le planning de la semaine</button>`,'stats')}

/* ---------- détail tâche ---------- */
function taskSheet(key){
  const ds=key.split(':')[0];const t=dayTasks(ds).find(x=>x.key===key);if(!t)return closeSheet();
  if(t.info){openSheet(`<div class="grab"></div><span class="lbl">${TYPE[t.type]?TYPE[t.type][0]:''} · ${fmtShort(parseYmd(ds))}</span><h2>${esc(t.title)}</h2><p class="muted num">${hm(t.start)} → ${hm(t.start+t.dur)} · ${durTxt(t.dur)}</p><p class="muted" style="font-size:13px">Pour les statistiques uniquement, pas de pointage.</p><button class="btn ghost" data-act="close">Fermer</button>`);return}
  const st=status(t),pu=S.punches[t.key]||{},isToday=ds===today();
  const earned=S.ledger.filter(e=>e.key===t.key);
  let actions='';
  const canVal=ds>=addDs(today(),-3)&&ds<=today()&&st!=='up';
  if(canVal&&(st==='run'||st==='due'))actions=valBtns(t,false);
  else if(canVal&&(st==='done'||st==='miss'))actions=`<details><summary class="muted" style="font-size:13.5px;padding:6px 0">Corriger la validation</summary>${valBtns(t,false)}</details>`;
  else if(st==='soon'||st==='up')actions=`<div class="banner info">${ic('bell')}<span class="grow">Validation possible à partir de ${hm(t.start-30)}.</span></div>`;
  let link='';
  if(t.type==='sport')link=`<button class="btn ghost" data-act="gosport" data-v="${ds}">Ouvrir la séance ${ic('arrow')}</button>`;
  if(t.type==='repas'&&t.slot){const m=mealsFor(ds).find(x=>x.slot===t.slot);if(m)link=`<button class="btn ghost" data-act="recipe" data-ds="${ds}" data-slot="${t.slot}">${esc(m.r.n)} ${ic('arrow')}</button>`}
  if(t.type==='courses')link=`<button class="btn ghost" data-act="goshop">Ouvrir la liste de courses ${ic('arrow')}</button>`;
  if(t.type==='reveil'||t.type==='coucher')link=`<button class="btn ghost" data-act="tab" data-v="sommeil">Calculer mes cycles ${ic('arrow')}</button>`;
  if(t.type==='pesee')link=`<button class="btn ghost" data-act="weigh">Noter mon poids ${ic('arrow')}</button>`;
  const recs=pu.how?`<div class="row between"><span>${pu.how==='miss'?'Marqué pas fait':'Validé'} à ${clock(pu.at||pu.in)}</span><span class="stamp ${pu.how==='miss'?'st-miss':'st-done'}">${HOW[pu.how]}${pu.mode==='ia'?' · salle vérifiée':''}</span></div>`:S.missed[key]?`<div class="row between"><span>Non validé à temps</span><span class="stamp st-miss">pas fait</span></div>`:'';
  openSheet(`<div class="grab"></div>
   <div class="stack" style="gap:6px"><span class="lbl">${TYPE[t.type]?TYPE[t.type][0]:''} · ${fmtShort(parseYmd(ds))}</span><h2>${esc(t.title)}</h2>
   <p class="muted num">${hm(t.start)}${t.dur?' → '+hm(t.start+t.dur)+' · '+durTxt(t.dur):''} · ${M$(t.pts,false)} à gagner</p></div>
   ${t.type==='travail'?`<p class="muted" style="font-size:13px">${t.src==='agenda'?'Depuis ton agenda':t.src==='manuel'?'Modifié à la main':t.src==='estime'?'Estimé : planning pas encore publié':'Horaires habituels'}${t.loc?' · '+esc(t.loc):''}</p>`:t.box?`<div class="banner info"><span class="grow" style="font-weight:500">Ce repas tombe pendant ton service : prépare-le en boîte la veille ou au batch cooking.</span></div>`:t.moved?`<p class="muted" style="font-size:13px">Placé automatiquement dans un créneau libre autour de ton travail.</p>`:''}
   ${recs?`<div class="flat stack" style="gap:8px">${recs}</div>`:''}
   ${earned.length?`<div class="flat">${earned.map(e=>`<div class="ledger"><span>${esc(e.label)}</span><span class="num" style="color:${e.pts<0?'var(--bad)':'var(--money)'}">${M$(e.pts)}</span></div>`).join('')}</div>`:''}
   ${actions}${link}
   ${!pu.how&&st!=='miss'?`<div class="field"><span class="lbl">Ajuster</span><div class="chips"><button class="chip sm" data-act="shift" data-k="${key}" data-v="-15">−15 min</button><button class="chip sm" data-act="shift" data-k="${key}" data-v="15">+15 min</button><button class="chip sm" data-act="shift" data-k="${key}" data-v="60">+1 h</button><button class="chip sm" data-act="skip" data-k="${key}">Retirer ce jour</button>${t.custom?`<button class="chip sm" data-act="delcustom" data-v="${t.id}">Supprimer la tâche</button>`:''}</div></div>`:''}`);
}


/* ---------- ajout de tâche ---------- */
let NT=null;
const CUSTOM_TYPES=['sport','cardio','repas','travail','etude','maison','courses','rdv','perso'];
function addTaskSheet(){
  if(!NT){const m=Math.ceil((nowMin()+15)/15)*15;NT={type:'sport',title:'',day:V.date,start:Math.min(m,1425),dur:30,pts:50,repeat:'once'}}
  const days=Array.from({length:7},(_,i)=>addDs(today(),i));
  openSheet(`<div class="grab"></div><h2>Nouvelle tâche</h2>
  <div class="field"><span class="lbl">Type</span><div class="chips">${CUSTOM_TYPES.map(k=>`<button class="chip ${NT.type===k?'on':''}" data-act="ntType" data-v="${k}">${TYPE[k][0]}</button>`).join('')}</div></div>
  <div class="field"><span class="lbl">Jour</span><div class="scroller">${days.map((d,i)=>`<button class="chip ${NT.day===d?'on':''}" data-act="pick" data-o="NT" data-k="day" data-v="${d}">${i===0?'Aujourd’hui':i===1?'Demain':fmtShort(parseYmd(d))}</button>`).join('')}</div></div>
  <div class="field"><span class="lbl">Heure</span>${stepper('NT','start',15,0,1425,'time','big')}<div class="chips">${[-60,60].map(v=>`<button class="chip sm" data-act="st" data-o="NT" data-k="start" data-d="${v}" data-min="0" data-max="1425">${v>0?'+':'−'}1 h</button>`).join('')}</div></div>
  <div class="field"><span class="lbl">Durée</span><div class="chips">${[15,30,45,60,90,120].map(v=>`<button class="chip ${NT.dur===v?'on':''}" data-act="pick" data-o="NT" data-k="dur" data-v="${v}" data-n="1">${durTxt(v)}</button>`).join('')}</div></div>
  <div class="field"><span class="lbl">Répéter</span><div class="chips">${[['once','Une fois'],['daily','Chaque jour'],['weekdays','Lun-ven'],['weekly','Chaque semaine']].map(([k,l])=>`<button class="chip ${NT.repeat===k?'on':''}" data-act="pick" data-o="NT" data-k="repeat" data-v="${k}">${l}</button>`).join('')}</div></div>
  <div class="field"><span class="lbl">Ce que ça rapporte</span><div class="chips">${[10,20,30,50,80].map(v=>`<button class="chip ${NT.pts===v?'on':''}" data-act="pick" data-o="NT" data-k="pts" data-v="${v}" data-n="1">${M$(v,false)}</button>`).join('')}</div></div>
  <div class="field"><span class="lbl">Nom (facultatif)</span><input id="ntTitle" value="${esc(NT.title)}" placeholder="${esc(TYPE[NT.type][0])}" style="border:1.5px solid var(--line);background:var(--surface);border-radius:14px;padding:13px 14px;font-size:16px"></div>
  <button class="btn" data-act="ntSave">Ajouter à ${NT.day===today()?'aujourd’hui':fmtShort(parseYmd(NT.day))} · ${hm(NT.start)}</button>`,'add');
}
function stepper(o,k,step,min,max,fmt,cls=''){
  const v=CTX[o][k];const txt=fmt==='time'?hm(v):fmt==='kg'?nf(v,1)+'<small>kg</small>':fmt==='cm'?v+'<small>cm</small>':fmt==='eur'?v+'<small>€</small>':v;
  return`<div class="stepper ${cls}"><button data-act="st" data-o="${o}" data-k="${k}" data-d="${-step}" data-min="${min}" data-max="${max}" aria-label="Moins">−</button><span class="v">${txt}</span><button data-act="st" data-o="${o}" data-k="${k}" data-d="${step}" data-min="${min}" data-max="${max}" aria-label="Plus">+</button></div>`;
}

/* ---------- planning de travail ---------- */
let WO=null,PLW=null;
const capW=s=>s.toLowerCase().replace(/(^|[\s-])\S/g,c=>c.toUpperCase());
function shiftTxt(bl){return bl.length?bl.map(b=>hm(b.s)+'–'+hm(b.e)).join(' · '):'Repos'}
function planSheet(ds){
  PLW=mondayOf(ds||PLW||V.date);const A=S.agenda;
  const rows=Array.from({length:7},(_,i)=>{const d=addDs(PLW,i),W=workBlocks(d);const tot=W.blocks.reduce((a,b)=>a+b.e-b.s,0);
    const tag=W.src==='agenda'?'<span class="stamp st-done">Agenda</span>':W.src==='manuel'?'<span class="stamp st-run">Modifié</span>':W.src==='estime'?'<span class="stamp st-up">Estimé</span>':'<span class="stamp st-up">Habituel</span>';
    return`<button class="tc ${d===today()?'now':''}" data-act="woDay" data-v="${d}"><span class="t">${DAYS[i]}<small>${parseYmd(d).getDate()}/${parseYmd(d).getMonth()+1}</small></span><span class="ti"><b>${shiftTxt(W.blocks)}</b><span>${W.blocks.length?durTxt(tot)+(W.blocks[0].loc?' · '+esc(W.blocks[0].loc):''):'Jour off'}</span></span>${tag}</button>`}).join('');
  const wkH=Array.from({length:7},(_,i)=>workBlocks(addDs(PLW,i)).blocks.reduce((a,b)=>a+b.e-b.s,0)).reduce((a,b)=>a+b,0);
  openSheet(`<div class="grab"></div><div class="row between"><div class="stack" style="gap:2px"><span class="lbl">Semaine du ${fmtShort(parseYmd(PLW))}</span><h2>Planning de travail</h2></div><span class="num muted">${durTxt(wkH)}</span></div>
  <div class="row" style="gap:8px"><button class="chip sm" data-act="plWk" data-v="-7">← Semaine</button><button class="chip sm" data-act="plWk" data-v="7">Semaine →</button></div>
  <div class="tl">${rows}</div>
  <section class="flat stack" style="gap:8px">${A?`<p style="font-size:13.5px">Synchronisé avec l’agenda <b>${esc(A.calName||A.source)}</b>, mis à jour le ${fmtShort(new Date(A.updatedAt))} à ${clock(A.updatedAt)}. Planning connu jusqu’au <b>${fmtShort(parseYmd(A.to))}</b> ; au-delà, je reprends la semaine précédente comme estimation.</p>`:`<p style="font-size:13.5px">Pas encore d’agenda synchronisé : ce sont tes horaires habituels.</p>`}
  <button class="btn sm" style="width:100%" data-act="agSync">${ic('agenda')} Mettre à jour depuis l’agenda</button></section>
  <p class="muted" style="font-size:12.5px">Touche un jour pour le corriger (heures sup, échange, repos). Ta journée se réorganise toute seule : sport, repas et courses se placent autour du travail et de ${S.profile.commute||0} min de trajet.</p>`,'semaine');
}
function dayEditSheet(ds){
  if(!WO||WO.ds!==ds){const W=workBlocks(ds),b=W.blocks;WO={ds,mode:b.length===0?'off':b.length===1?'one':'two',s0:b[0]?b[0].s:600,e0:b[0]?b[0].e:840,s1:b[1]?b[1].s:(b[0]?b[0].e+30:885),e1:b[1]?b[1].e:1260,src:W.src}}
  const blk=(i,l)=>`<span class="lbl">${l}</span><div class="row" style="gap:8px"><div style="flex:1;min-width:0">${stepper('WO','s'+i,15,0,1425,'time')}</div><div style="flex:1;min-width:0">${stepper('WO','e'+i,15,15,1500,'time')}</div></div>`;
  openSheet(`<div class="grab"></div><span class="lbl">${fmtDate(parseYmd(ds))}</span><h2>Mon travail ce jour-là</h2>
  <div class="seg">${[['off','Repos'],['one','1 service'],['two','Coupure']].map(([k,l])=>`<button class="${WO.mode===k?'on':''}" data-act="pick" data-o="WO" data-k="mode" data-v="${k}">${l}</button>`).join('')}</div>
  ${WO.mode!=='off'?`<div class="field">${blk(0,WO.mode==='two'?'Service 1 · début / fin':'Début / fin')}</div>`:''}
  ${WO.mode==='two'?`<div class="field">${blk(1,'Service 2 · début / fin')}</div>`:''}
  <button class="btn" data-act="woSave">Enregistrer</button>
  ${S.workOv[ds]?`<button class="btn ghost" data-act="woReset">Revenir au planning ${S.agenda&&S.agenda.from<=ds&&ds<=S.agenda.to?'de l’agenda':'habituel'}</button>`:''}
  <button class="btn ghost" data-act="woBack">← Toute la semaine</button>`,'work');
}
function parseEv(e){const a=e.start_time,b=e.end_time;const d=a.slice(0,10),db=b.slice(0,10);const s=+a.slice(11,13)*60+ +a.slice(14,16);let en=+b.slice(11,13)*60+ +b.slice(14,16);
  en+=Math.round((parseYmd(db)-parseYmd(d))/864e5)*1440;const t=capW((e.title||'').split(' - ')[0].trim()||'Travail');const loc=capW((e.location||'').replace(/\s*-\s*\.?\s*$/,'').trim());return{d,s,e:Math.max(en,s+15),t,loc}}
async function syncAgenda(){
  if(!MCP){loadAgendaFile(true);return}
  toast('Lecture de ton agenda…');
  try{const H='host:claude-device';
    const cr=(await MCP.callTool(H,'calendar_search_v0',{})).payload||{};const cals=cr.calendars||[];
    const want=(S.agendaCal||'').toUpperCase();if(!want){agendaHelp('nocal',[]);return}const cal=cals.find(c=>(c.name||'').toUpperCase().includes(want));
    if(!cal){agendaHelp('nocal',cals.map(c=>c.name));return}
    const from=ymd(addDays(new Date(),-7)),end=addDays(new Date(),90);
    const r=(await MCP.callTool(H,'event_search_v0',{calendar_id:cal.id,start_time:parseYmd(from).toISOString(),end_time:end.toISOString(),limit:200,include_all_day:false})).payload||{};
    const evs=[];for(const c of r.calendar_events||[])evs.push(...(c.events||[]));
    const shifts=evs.filter(e=>!e.all_day&&e.start_time&&e.end_time).map(parseEv);
    const last=shifts.reduce((m,x)=>x.d>m?x.d:m,today());const to=addDs(mondayOf(last),6);
    S.agenda={source:capW(cal.name.split(' - ')[0]),calName:cal.name,from,to,shifts,updatedAt:Date.now()};
    for(const k in S.workOv)if(k>=from&&k<=to&&S.workOv[k].auto)delete S.workOv[k];
    save();if(DB&&UID){try{await DB.doc(`data/users/${UID}/agenda`).set(JSON.parse(JSON.stringify(S.agenda)))}catch(e){}}
    render();if(sheetName==='semaine')planSheet();toast(`${shifts.length} services importés jusqu’au ${fmtShort(parseYmd(to))}`);
  }catch(e){agendaHelp(e&&e.code==='server_not_connected'?'app':'err',null,e&&e.message)}
}
function agendaHelp(kind,names,msg){
  const A=S.agenda;
  openSheet(`<div class="grab"></div><h2>Mettre à jour le planning</h2>
  ${kind==='nocal'?`<p>Je n’ai pas trouvé ton agenda de travail${S.agendaCal?' « '+esc(S.agendaCal)+' »':''}. Agendas trouvés : ${(names||[]).map(esc).join(', ')}.</p>`:
   kind==='err'?`<p>La lecture de l’agenda a échoué${msg?' ('+esc(msg)+')':''}. Réessaie dans un instant.</p>`:
   kind==='nokey'?`<p>Il manque la clé qui déchiffre ton planning. Ouvre une fois l’app avec le lien complet que Claude t’a donné (celui qui finit par <b>#k=…</b>), puis refais ton signet.</p>`:
   `<p>Safari n’a pas accès au calendrier de l’iPhone. Ton planning arrive par un fichier chiffré sur GitHub que Claude met à jour.</p>`}
  <ol class="steps"><li>Dans l’app Claude, écris : <b>« Mets à jour mon planning Cadence »</b>. Je relis ton agenda ${esc(A?A.calName:'de travail')} et je publie les nouveaux horaires (1 à 2 min).</li><li>Reviens ici et touche « Mettre à jour depuis l’agenda ».</li><li>En attendant, corrige un jour à la main depuis Planning, ou importe un fichier .ics dans Réglages.</li></ol>
  ${A?`<p class="muted" style="font-size:13px">Dernière mise à jour : ${fmtShort(new Date(A.updatedAt))} à ${clock(A.updatedAt)}, planning connu jusqu’au ${fmtShort(parseYmd(A.to))}.</p>`:''}
  <button class="btn ghost" data-act="woBack">← Planning de la semaine</button>`,'agHelp');
}
