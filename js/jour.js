/* JOUR : page d'accueil, détail d'une tâche, ajout de tâche, planning de travail / agenda. Propriétaire : « Agent Jour ». */
/* ---------- JOUR ---------- */
function greeting(){const h=new Date().getHours();return h<5?'Bonne nuit':h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir'}
function feteCard(){
  const fighter=(x,s)=>`<g transform="translate(${x} 0) scale(${s})" fill="#04140C"><circle cx="0" cy="-58" r="5.5"/><path d="M-6 -52h12l3 22-4 1-2 22h-4l-1-18-1 18h-4l-2-22-4-1z"/><path d="M5 -48l16-16 2 2-15 17z"/><path d="M-6 -60c3-6 9-6 12 0z"/></g>`;
  return`<section class="fete" aria-label="1er Novembre 1954">
  <svg viewBox="0 0 360 170" role="img" aria-label="Drapeau algérien au-dessus des montagnes des Aurès, avec des moudjahidine">
   <defs><linearGradient id="dzsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B2A1B"/><stop offset=".62" stop-color="#2A5A3A"/><stop offset="1" stop-color="#C9A86A"/></linearGradient>
    <mask id="dzcres"><rect width="60" height="40" fill="#fff"/><circle cx="33.5" cy="20" r="8.2" fill="#000"/></mask></defs>
   <rect width="360" height="170" fill="url(#dzsky)"/>
   <circle cx="282" cy="132" r="34" fill="#F4D58D" opacity=".55"/>
   <path d="M0 150 L40 112 L70 128 L110 88 L150 120 L190 96 L230 126 L270 102 L310 130 L360 108 V170 H0Z" fill="#163B27"/>
   <path d="M0 170 L0 156 L60 138 L120 150 L180 134 L250 148 L300 140 L360 152 V170Z" fill="#0A2216"/>
   <rect x="64" y="20" width="2.6" height="122" fill="#E9E4D8"/>
   <g transform="translate(66.6 22)"><path d="M0 0 C20 -4 40 4 60 0 V40 C40 44 20 36 0 40Z" fill="#fff"/><path d="M0 0 C10 -2 20 -1 30 1 V39 C20 37 10 38 0 40Z" fill="#006233"/>
    <g transform="translate(0 0)"><circle cx="30" cy="20" r="10" fill="#D21034" mask="url(#dzcres)"/><path d="M38.2 20 l-3.4 1.1 0 3.6 -2.1-2.9 -3.4 1.1 2.1-2.9 -2.1-2.9 3.4 1.1 2.1-2.9 0 3.6z" fill="#D21034"/></g></g>
   <g transform="translate(0 150)">${fighter(170,1)}${fighter(205,.95)}${fighter(238,1.05)}</g>
  </svg>
  <div class="txt"><span class="lbl" style="color:rgba(255,255,255,.8)">1er Novembre 1954 · Toussaint rouge</span><b>Déclenchement de la Révolution algérienne</b><span style="font-size:14px;opacity:.9">Gloire à nos martyrs. Tahya El Djazaïr.</span><span class="ar">المجد والخلود لشهدائنا الأبرار</span></div></section>`;
}
const KIND=t=>({travail:'work',sport:'sport',cardio:'sport',repas:'meal',courses:'meal',batch:'meal',agenda:'free',rdv:'free',etude:'perso',maison:'perso',perso:'perso'}[t]||'perso');
function renderJour(){
  V.date=today();const t=today(),ds=V.date,isToday=ds===t,T=dayTasks(ds),p=S.profile;
  const mon=mondayOf(ds);const w=weekOf(ds);
  const strip=Array.from({length:7},(_,i)=>{const d=addDs(mon,i);const dot=d<=t?(S.perfect[d]?'full':dayPts(d)>0?'part':''):'';
    return`<button class="wd ${d===ds?'on':''}" data-act="date" data-v="${d}">${DAYS[i]}<b>${parseYmd(d).getDate()}</b><i class="dot ${dot}"></i></button>`}).join('');
  let hero='';
  if(isToday&&started()){
    const cur=T.find(x=>!x.info&&['run','due'].includes(status(x)))||T.find(x=>!x.info&&status(x)==='soon');
    if(cur){const s2=status(cur);const s=at(ds,cur.start),e=at(ds,cur.start+cur.dur);const mins=Math.round((s-Date.now())/6e4);
      const when=cur.meal?(s2==='run'?`Fenêtre ${hm(cur.start)} → ${hm(cur.start+cur.dur)} · reste ${durTxt(Math.max(1,Math.round((e-Date.now())/6e4)))}`:s2==='due'?`Fenêtre ${hm(cur.start)} → ${hm(cur.start+cur.dur)} passée · mange maintenant`:`Fenêtre ${hm(cur.start)} → ${hm(cur.start+cur.dur)}`):s2==='run'?`Commencé à ${hm(cur.start)} · reste ${durTxt(Math.max(1,Math.round((e-Date.now())/6e4)))}`:mins>0?`Dans ${mins>=60?Math.floor(mins/60)+' h '+pad(mins%60):mins+' min'} · ${durTxt(cur.dur)}`:`Prévu à ${hm(cur.start)} · ${durTxt(-mins)} de retard`;
      const [hc,hc2]=cur.meal||s2==='run'||s2==='due'?['#3F3C9C','#7A3D8E']:cur.type==='sport'?['#5A3DB6','#8B4CB0']:['#3550B8','#3B2E86'];
      hero=`<section class="hero col" style="--hc:${hc};--hc2:${hc2}"><div class="row between"><span class="lbl">${cur.meal?(s2==='run'?'Fenêtre de repas ouverte':s2==='due'?'Tu n’as pas encore mangé':'Repas bientôt'):s2==='run'?'En cours · pas encore pointé':s2==='due'?'À valider':'Bientôt'}</span><span class="pts">${M$(cur.pts)}</span></div>
        <div class="row" style="gap:14px;align-items:flex-end"><span class="big">${hm(cur.start)}</span><div style="min-width:0"><h2>${esc(cur.title)}</h2><p class="meta">${when}</p></div></div>${s2==='soon'?'':valBtns(cur,true)}</section>`;
    }
  }
  const st=dayStats(ds);
  const wk=Array.from({length:7},(_,i)=>dayStats(addDs(mon,i)));const wWork=wk.reduce((a,x)=>a+x.work,0),wFree=wk.reduce((a,x)=>a+x.free,0);
  const bar=(v,tot,c)=>`<i style="width:${tot?v/tot*100:0}%;background:${c}"></i>`;
  const n0=nowMin(),wl=isToday?workBlocks(ds).blocks.reduce((a,b)=>a+Math.max(0,b.e-Math.max(b.s,n0)),0):0,tb=isToday?Math.max(0,st.bed-n0):0;
  const seg=(v,k)=>v>0?`<i class="k-${k}" style="width:${st.awake?v/st.awake*100:0}%"></i>`:'';
  V.statsHTML=`<span class="lbl">${isToday?'Aujourd’hui':fmtShort(parseYmd(ds))} · éveillé de ${hm(st.wake)} à ${hm(st.bed)}</span><h2>Ma journée en chiffres</h2><p class="muted" style="font-size:13.5px">Le temps de ta journée, calculé à partir de ton planning de travail, de tes trajets et de ton heure de coucher.</p>
   <div class="card">
    ${isToday?`<span class="lbl">Il reste aujourd’hui</span><div class="tiles"><div class="tile tint k-work"><span class="lbl">Travail</span><b>${wl?durTxt(wl):'fini'}</b></div><div class="tile tint k-pts"><span class="lbl">Avant dodo</span><b>${durTxt(tb)}</b></div><div class="tile tint k-free"><span class="lbl">Libre</span><b>${durTxt(Math.max(0,tb-wl))}</b></div></div>`:''}
    <span class="lbl" style="${isToday?'padding-top:4px':''}">Répartition de la journée · ${durTxt(st.awake)} éveillé</span>
    <div class="segbar">${seg(st.work,'work')}${seg(st.trips,'trip')}${seg(st.free,'free')}</div>
    <div class="legend"><span class="k-work"><i></i>Travail <b class="num" style="color:var(--ink)">${st.work?durTxt(st.work):'0'}</b></span><span class="k-trip"><i></i>Trajets <b class="num" style="color:var(--ink)">${st.trips?durTxt(st.trips):'0'}</b></span><span class="k-free"><i></i>Libre <b class="num" style="color:var(--ink)">${durTxt(st.free)}</b></span></div>
    <p class="muted" style="font-size:12.5px;border-top:1px solid var(--line);padding-top:10px">Cette semaine : ${durTxt(wWork)} de travail · ${durTxt(Math.round(wFree/7))} de temps libre par jour en moyenne.</p></div>`;
  const statsCard=`<button class="card row between" data-act="dayStats" style="width:100%;text-align:left;padding:14px 16px;gap:12px;flex-direction:row;align-items:center"><span class="badge sm k-free">${ic('hourglass')}</span><span style="flex:1;min-width:0"><b style="font-size:15px">${isToday?(wl?`Encore ${durTxt(wl)} de travail`:'Travail fini pour aujourd’hui'):`${durTxt(st.work)} de travail`}</b><br><span class="muted" style="font-size:13px">${isToday?`${durTxt(Math.max(0,tb-wl))} de temps libre avant de dormir`:`${durTxt(st.free)} de temps libre`}</span></span><span class="muted">${ic('arrow')}</span></button>`;
  const row=x=>{const s2=status(x);const pu=S.punches[x.key]||{};const[,l]=STAMP[s2];const k=KIND(x.type);
    const earned=x.info?0:S.ledger.filter(e=>e.key===x.key).reduce((a,e)=>a+e.pts,0);
    const lbl=x.info?(l||durTxt(x.dur)):x.meal?MEAL_LBL[s2]:s2==='done'?(pu.how==='ok'?'Validé':HOW[pu.how]||'Validé'):l;
    const rest=(s2==='run'||s2==='irun')&&isToday?` · reste ${durTxt(Math.max(1,Math.round((at(ds,x.start+x.dur)-Date.now())/6e4)))}`:'';
    const hot=isToday&&(s2==='due'||s2==='run');
    return`<button class="tc ${s2==='done'||s2==='miss'||s2==='idone'?'past':''}" data-act="task" data-k="${x.key}" style="${hot?'outline:2px solid var(--warn);outline-offset:-2px':''}">
      <span class="badge sm k-${k}">${ic(x.type)}</span>
      <span class="ti"><b>${esc(x.title)}</b><span class="num">${hm(x.start)}${x.dur?' → '+hm(x.start+x.dur):''}${rest}${x.loc?' · '+esc(x.loc):''}</span>
      ${x.info?'':`<span style="font-size:12px;font-weight:600;color:${earned<0?'var(--bad)':earned>0?'var(--money)':'var(--muted)'}">${earned?M$(earned):M$(x.pts,false)+' à gagner'}</span>`}</span>
      <span class="pill p-${s2}">${lbl}</span></button>`};
  const isPast=x=>{const s2=status(x);return x.info?s2==='idone':(s2==='done'||s2==='miss')};
  const rem=isToday?T.filter(x=>!isPast(x)):T,doneL=isToday?T.filter(isPast):[];
  const list=rem.map(row).join('')+(doneL.length?`<button class="link" data-act="showDone" style="align-self:flex-start;font-size:13.5px;padding:2px 4px">${V.showDone?'Masquer':'Voir'} les ${doneL.length} élément${doneL.length>1?'s':''} terminé${doneL.length>1?'s':''}</button>${V.showDone?doneL.map(row).join(''):''}`:'');
  const wkLabel=w?`Semaine ${w} · ${PHASES[phaseOf(w)].n}`:`${PHASES[0].n} · programme le ${fmtShort(parseYmd(S.programStart||t))}`;
  const mN=((S.meals||{})[t]||[]).length;
  return`<header class="top"><div class="stack" style="gap:4px;min-width:0"><span class="lbl">${fmtDate(new Date())}</span><h1>${greeting()}${p.name?', '+esc(p.name):''}</h1><span class="muted" style="font-size:13px">${wkLabel}</span></div>
    <button class="avatar" data-act="settings" aria-label="Réglages">${p.name?esc(p.name[0].toUpperCase()):ic('gear')}</button></header>
  ${(()=>{let nx=null,nd=t;const base=started()?t:START_DAY;for(let k=0;k<7&&!nx;k++){nd=addDs(base,k);nx=dayTasks(nd).find(x=>!x.info&&['run','due','soon','up'].includes(status(x)))}
    const s3=nx?status(nx):'';const l3=nx?(nx.meal?MEAL_LBL[s3]:STAMP[s3][1]):'';
    return`<div class="stats" style="grid-template-columns:1fr 1.35fr"><div class="stat k-money" data-act="tab" data-v="cagnotte"><span class="lbl">${ic('cagnotte')} Cagnotte</span><b>${eur(periodEur())}</b><span class="muted num" style="font-size:12px">${M$(dayPts(t))} aujourd’hui</span></div>
    ${nx?`<button class="stat k-${KIND(nx.type)}" data-act="task" data-k="${nx.key}" style="text-align:left;${s3==='run'||s3==='due'?'outline:2px solid var(--warn);outline-offset:-2px':''}"><span class="lbl">${ic(nx.type)} Prochaine tâche</span><b style="font-family:var(--f-ui);font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(nx.title)}</b><span class="row" style="gap:6px;justify-content:space-between"><span class="muted num" style="font-size:12px">${nd===t?'':fmtShort(parseYmd(nd))+' · '}${hm(nx.start)}</span><span class="pill p-${s3}" style="padding:3px 8px;font-size:11px">${l3}</span></span></button>`:
      `<div class="stat k-free"><span class="lbl">${ic('check')} Prochaine tâche</span><b style="font-family:var(--f-ui);font-size:15px">Rien de prévu</b></div>`}</div>`})()}
  ${isFete()?feteCard():''}
  ${!started()?`<section class="card tint k-work" style="gap:6px"><span class="lbl">Tout est prêt</span><h2>Ton programme commence le dimanche 1er novembre</h2><p class="muted" style="font-size:13.5px">Cagnotte, pointages, repas et sport sont remis à zéro. Rendez-vous demain matin.</p></section>`:''}
  ${hasUpdate()?`<button class="banner info" data-act="forceUpdate" style="width:100%;text-align:left">${ic('arrow')}<span class="grow">Nouvelle version disponible${REMOTE_V.notes?' : '+esc(REMOTE_V.notes):''}. Touche pour mettre à jour.</span></button>`:''}
  ${hero}
  ${isToday&&started()?mealCard():''}
  <section class="sec"><div class="sec-h"><h2>${isToday?'Ce qui reste':fmtDate(parseYmd(ds))}</h2><button class="iconbtn" data-act="workday" data-v="${ds}" aria-label="Planning de la semaine">${ic('agenda')}</button><button class="iconbtn" data-act="addtask" aria-label="Ajouter une tâche">${ic('plus')}</button></div>
  <div class="tl">${rem.length?'':`<div class="empty">${T.length?'Tout est fait pour aujourd’hui.':'Jour off : pas de travail ni de séance prévus.'}</div>`}${list}</div></section>
  ${statsCard}`;
}
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
  <p class="muted" style="font-size:12.5px">Touche un jour pour le corriger (heures sup, échange, repos). Ta journée se réorganise toute seule : sport, repas et courses se placent autour du travail et de ${S.profile.commute||0} min de trajet.</p>`,'plan');
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
    render();if(sheetName==='plan')planSheet();toast(`${shifts.length} services importés jusqu’au ${fmtShort(parseYmd(to))}`);
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
