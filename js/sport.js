/* SPORT : exercices, programme 12 semaines, choix des jours de salle, photo de la salle, onglet Sport. Propriétaire : « Agent Sport ». */
/* ============ données : exercices ============ */
const EX={
 squat_g:{n:'Squat gobelet',h:'Squat gobelet (haltère ou sac lesté)',m:'Cuisses, fessiers',c:'Talons au sol, buste droit, descends entre les genoux en 3 s.',inj:{genoux:'Descends seulement jusqu’à une chaise (box squat), sans douleur.'},kg:12},
 presse:{n:'Presse à cuisses',h:'Squat sur chaise (box squat)',m:'Cuisses, fessiers',c:'Pieds largeur bassin, bas du dos collé au dossier, ne verrouille pas les genoux.',inj:{genoux:'Amplitude réduite, pieds plus hauts sur la plateforme.'},kg:60},
 db_bench:{n:'Développé couché haltères',h:'Pompes inclinées (mains sur une table)',m:'Pectoraux, triceps',c:'Omoplates serrées, coudes à 45°, descente en 2-3 s.',inj:{epaules:'Prise neutre (paumes face à face), amplitude sans douleur.'},kg:14},
 incl_db:{n:'Développé incliné haltères',h:'Pompes inclinées pieds surélevés',m:'Haut des pectoraux, épaules',c:'Banc à 30°, pousse vers le plafond, pas de rebond.',inj:{epaules:'Banc à 15-20°, prise neutre.'},kg:12},
 lat_pull:{n:'Tirage vertical',h:'Tirage élastique au-dessus de la tête',m:'Dos, biceps',c:'Tire les coudes vers les hanches, poitrine sortie.',kg:35},
 row_chest:{n:'Rowing poitrine appuyée',h:'Rowing haltère un bras sur chaise',m:'Haut du dos',c:'Pause 1 s en haut, omoplates serrées.',kg:12},
 row_1arm:{n:'Rowing un bras haltère',h:'Rowing sac à dos chargé',m:'Dos, biceps',c:'Dos plat, tire le coude vers la poche arrière.',kg:16},
 hip_thrust:{n:'Hip thrust',h:'Pont fessier au sol',m:'Fessiers, ischios',c:'Menton rentré, serre les fessiers 1 s en haut.',kg:40},
 rdl:{n:'Soulevé de terre roumain haltères',h:'Soulevé roumain avec sac à dos',m:'Ischios, fessiers, dos',c:'Dos plat, hanches vers l’arrière, charges près des jambes.',inj:{dos:'Charge légère, arrête-toi à mi-tibia, dos neutre absolu.'},kg:16},
 ohp:{n:'Développé militaire assis haltères',h:'Développé épaules élastique ou bouteilles',m:'Épaules, triceps',c:'Abdos gainés, ne cambre pas.',inj:{epaules:'Remplace par élévations frontales légères si douleur.'},kg:10},
 stepup:{n:'Step-up bas',h:'Step-up sur une marche',m:'Cuisses, fessiers, équilibre',c:'Pousse avec le talon de la jambe du haut, descends lentement.',inj:{genoux:'Marche basse (15-20 cm), mouvement lent.'},kg:6},
 leg_curl:{n:'Leg curl assis',h:'Leg curl glissé (serviette au sol)',m:'Ischios',c:'Contrôle le retour en 3 s.',kg:25},
 leg_ext:{n:'Leg extension',h:'Chaise contre le mur (isométrique)',m:'Quadriceps',c:'Pause 1 s en haut.',inj:{genoux:'Charge légère, amplitude partielle.'},kg:20},
 calf:{n:'Mollets debout',h:'Mollets sur une marche',m:'Mollets',c:'Étire bien en bas, pause en haut.',kg:0},
 face_pull:{n:'Face pull poulie',h:'Face pull élastique',m:'Arrière d’épaule, posture',c:'Tire vers le front, coudes hauts.',kg:15},
 curl:{n:'Curl haltères',h:'Curl haltères ou bouteilles',m:'Biceps',c:'Coudes fixes, pas d’élan.',kg:8},
 triceps:{n:'Extension triceps poulie',h:'Dips sur chaise, genoux pliés',m:'Triceps',c:'Coudes collés au corps.',kg:15},
 lat_raise:{n:'Élévations latérales',h:'Élévations latérales (bouteilles)',m:'Épaules',c:'Monte jusqu’à l’horizontale, léger.',kg:5},
 plank:{n:'Planche',h:'Planche (sur les genoux si besoin)',m:'Gainage',c:'Serre fessiers et abdos, respire.',time:true},
 deadbug:{n:'Dead bug',h:'Dead bug',m:'Gainage profond',c:'Bas du dos plaqué au sol en permanence.',time:true},
 pallof:{n:'Pallof press',h:'Pallof press élastique',m:'Gainage anti-rotation',c:'Bras tendus 2 s, ne tourne pas.',time:false,kg:10},
 farmer:{n:'Marche du fermier',h:'Marche du fermier (sacs de courses)',m:'Grip, gainage, cardio',c:'Épaules basses, petits pas rapides.',time:true,kg:20},
 bike:{n:'Vélo ou marche inclinée',h:'Marche rapide dehors',m:'Cardio zone 2',c:'Tu peux parler mais pas chanter : c’est la bonne intensité.',cardio:true}
};
const TPL={
 FB_A:{name:'Full body A',items:[['squat_g','main'],['db_bench','main'],['lat_pull','acc'],['hip_thrust','acc'],['plank','core'],['farmer','core'],['bike','fin']]},
 FB_B:{name:'Full body B',items:[['rdl','main'],['ohp','main'],['row_chest','acc'],['stepup','acc'],['pallof','core'],['bike','fin']]},
 FB_C:{name:'Full body C',items:[['presse','main'],['incl_db','main'],['row_1arm','acc'],['leg_curl','acc'],['face_pull','acc'],['deadbug','core'],['bike','fin']]},
 UA:{name:'Haut du corps A',items:[['db_bench','main'],['row_chest','main'],['ohp','acc'],['lat_pull','acc'],['curl','acc'],['triceps','acc'],['bike','fin']]},
 LA:{name:'Bas du corps A',items:[['squat_g','main'],['rdl','main'],['leg_curl','acc'],['calf','acc'],['plank','core'],['bike','fin']]},
 UB:{name:'Haut du corps B',items:[['incl_db','main'],['lat_pull','main'],['row_1arm','acc'],['lat_raise','acc'],['face_pull','acc'],['bike','fin']]},
 LB:{name:'Bas du corps B',items:[['presse','main'],['hip_thrust','main'],['stepup','acc'],['leg_ext','acc'],['deadbug','core'],['bike','fin']]},
 CARDIO:{name:'Cardio long + mobilité',items:[['bike','long'],['deadbug','core'],['plank','core']]}
};
const PHASES={
 0:{n:'Mise en route',d:'Avant la semaine 1 : marche quotidienne, routine de sommeil, premières courses. On installe les habitudes.'},
 1:{n:'Fondations',d:'Semaines 1 à 4. Full body 3×/semaine, charges confortables (RPE 6-7 : il te reste 3-4 répétitions en réserve). Objectif : technique, régularité, articulations qui s’habituent.'},
 2:{n:'Construction',d:'Semaines 5 à 8. Plus de volume, 8-12 répétitions, RPE 7-8. Tu ajoutes de la charge dès que tu fais le haut de la fourchette sur toutes les séries.'},
 3:{n:'Intensification',d:'Semaines 9 à 12. Exercices principaux en 6-10 répétitions, RPE 8, intervalles légers en cardio. Semaine 12 : bilan, tu notes tes charges et tes mensurations.'}
};
const phaseOf=w=>w<1?0:w<=4?1:w<=8?2:3;
const isDeload=w=>w===4||w===8;
function presc(kind,w,ex){
  if(ex&&ex.cardio){const m=kind==='long'?(w<5?35:w<9?45:50):(w<5?10:w<9?12:15);return{sets:1,txt:kind==='long'?`${m} min en zone 2`:(w>=9&&kind!=='long'?`${m} min : 6 × (1 min vite / 1 min lent)`:`${m} min en zone 2`),rest:0}}
  const ph=phaseOf(w),dl=isDeload(w);
  if(kind==='core'){const s=dl?2:ph===1?(w===1?2:3):3;const t=ph===1?'20-30 s':ph===2?'30-40 s':'40-45 s';return{sets:s,txt:ex&&ex.time?`${s} × ${t}`:`${s} × 10-12 / côté`,rest:45}}
  if(dl)return kind==='main'?{sets:2,txt:'2 × 10 · RPE 6',rest:90}:{sets:2,txt:'2 × 12 · RPE 6',rest:60};
  if(ph===1)return kind==='main'?{sets:w===1?2:3,txt:`${w===1?2:3} × 10-12 · RPE 6-7`,rest:90}:{sets:2,txt:'2 × 12-15 · RPE 7',rest:60};
  if(ph===2)return kind==='main'?{sets:3,txt:'3 × 8-12 · RPE 7-8',rest:120}:{sets:3,txt:'3 × 10-15 · RPE 7-8',rest:75};
  if(w===12)return kind==='main'?{sets:3,txt:'3 × 6-8 · RPE 8 · bilan',rest:150}:{sets:2,txt:'2 × 10-12 · RPE 8',rest:75};
  return kind==='main'?{sets:4,txt:'4 × 6-10 · RPE 8',rest:150}:{sets:3,txt:'3 × 10-12 · RPE 8',rest:75};
}


/* jours de salle : repos et services de l'après-midi en priorité, éviter les débuts à midi */
const SD_MEMO={};
function dayScore(d){const b=workBlocks(d).blocks;if(!b.length)return 3;const st=b[0].s;return st>=840?2:st>=780?1:0}
function sportDays(ds){
  if(!S.programStart)return[];const diff=Math.floor((parseYmd(ds)-parseYmd(S.programStart))/864e5);if(diff<0)return[];
  const b0=addDs(S.programStart,Math.floor(diff/7)*7);const D=Array.from({length:7},(_,i)=>addDs(b0,i));
  const sc=D.map(dayScore);const n=Math.min(6,Math.max(1,(S.profile.days||[]).length||3));const key=b0+n+sc.join('');if(SD_MEMO[key])return SD_MEMO[key];
  let best=null,bv=-1e9;const rec=(start,pick)=>{if(pick.length===n){let v=0;for(const i of pick)v+=sc[i]===0?-30:sc[i]*10;
      for(let k=1;k<pick.length;k++)if(pick[k]-pick[k-1]===1)v-=6;const gaps=pick.slice(1).map((x,k)=>x-pick[k]);v-=gaps.length?(Math.max(...gaps)-Math.min(...gaps)):0;
      if(v>bv){bv=v;best=pick.slice()}return}
    for(let i=start;i<7;i++){pick.push(i);rec(i+1,pick);pick.pop()}};
  rec(0,[]);return SD_MEMO[key]=(best||[]).map(i=>D[i]);
}
function sessionFor(ds){
  const w=weekOf(ds);if(w<1)return null;
  const days=sportDays(ds);const i=days.indexOf(ds);if(i<0)return null;
  const n=days.length,ph=phaseOf(w);let list;
  if(ph===1)list=n<=3?(w%2?['FB_A','FB_B','FB_A']:['FB_B','FB_A','FB_B']):(w%2?['FB_A','FB_B','FB_A','CARDIO','CARDIO']:['FB_B','FB_A','FB_B','CARDIO','CARDIO']);
  else if(n<=2)list=['FB_A','FB_B'];else if(n===3)list=['FB_A','FB_B','FB_C'];else list=['UA','LA','UB','LB','CARDIO','CARDIO'];
  const key=list[i]||'CARDIO';return{key,name:TPL[key].name,w,ph,items:TPL[key].items};
}

/* ---------- pointage salle : photo de la salle vérifiée par l'IA ---------- */
let pending=null;
function punchSheet(key,how){
  const ds=key.split(':')[0];const t=dayTasks(ds).find(x=>x.key===key);if(!t)return;
  pending={key,how,t,state:'idle'};warmAI();drawPunch();try{$('#cam').click()}catch(e){}
}
function drawPunch(img,msg,kind){
  const t=pending.t;
  const camInner=img?`<img src="${img}" alt="Photo de la salle" style="width:100%;max-height:260px;object-fit:cover;border-radius:16px">`:`<div class="cam" style="border-radius:20px;width:100%;height:160px">${ic('sport')}</div>`;
  const stamp=kind==='ok'?`<span class="bigstamp" style="color:var(--money);bottom:12px">VALIDÉ ${clock(Date.now())}</span>`:kind==='ko'?`<span class="bigstamp" style="color:var(--bad);bottom:12px">REFUSÉ</span>`:'';
  const body=pending.state==='busy'?`<div class="row" style="justify-content:center"><span class="spin"></span><span class="muted">Vérification de la salle… <span class="num" id="aiT">0,0 s</span></span></div>`:
    kind==='ok'?`<p style="text-align:center">${esc(msg||'')}</p><button class="btn" data-act="gosport" data-v="${t.ds}">Ouvrir ma séance ${ic('arrow')}</button><button class="btn ghost" data-act="close">Fermer</button>`:
    `${msg?`<div class="banner ${kind==='ko'?'bad':'info'}"><span class="grow">${esc(msg)}</span></div>`:''}<label for="cam" class="btn">${ic('cam')} ${kind==='ko'?'Reprendre la photo':'Photographier la salle'}</label>
     <p class="muted" style="font-size:12.5px;text-align:center">Prends la salle : machines, haltères, bancs. La photo n’est pas conservée.</p>`;
  openSheet(`<div class="grab"></div><div class="stack" style="gap:4px"><span class="lbl">${esc(t.title)} · prévu ${hm(t.start)}${pending.how==='late'?' · en retard':''}</span><h2>Je suis à la salle</h2></div>
    <div style="position:relative">${camInner}${stamp}</div>${body}`,'punch');
}
function loadImg(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file);const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=u})}
async function handlePhoto(file){
  if(!pending||!file)return;const P0=pending;
  if(Date.now()-(file.lastModified||Date.now())>3*6e4){drawPunch(null,'Cette photo ne vient pas d’être prise. Utilise l’appareil photo, pas la galerie.','ko');return}
  let im;try{im=await loadImg(file)}catch(e){drawPunch(null,'Impossible de lire la photo. Réessaie.','ko');return}
  const sc=Math.min(1,512/Math.max(im.width,im.height));const cv=document.createElement('canvas');cv.width=Math.round(im.width*sc);cv.height=Math.round(im.height*sc);
  const cx=cv.getContext('2d');cx.drawImage(im,0,0,cv.width,cv.height);const url=cv.toDataURL('image/jpeg',.75);
  pending.state='busy';drawPunch(url);const t0=performance.now();const tk=setInterval(()=>{const el=$('#aiT');if(el)el.textContent=nf((performance.now()-t0)/1000,1)+' s'},100);
  let ok=true,msg='',mode='local';
  if(S.settings.ai!==false&&aiReady()){
    try{const r=await aiRaw(cv,`Photo prise à l’instant pour prouver que la personne est à la salle de sport. Est-ce l’intérieur d’une salle de sport ou de musculation (machines, haltères, barres, bancs, racks, tapis, vestiaire de salle) ? Réponds non pour une photo d’écran, un logement sans matériel, la rue, un selfie sans salle visible. JSON uniquement : {"ok":true,"msg":"phrase courte, tutoiement"}`,120);
      mode='ia';ok=r.ok===true||r.ok==='true';msg=r.msg||(ok?'Salle reconnue. Bonne séance !':'Je ne reconnais pas une salle de sport.');
      if(!ok)msg=(r.msg||'Je ne reconnais pas une salle de sport.')+' Prends les machines ou les haltères dans le cadre.';
    }catch(e){if(e&&e.bg){clearInterval(tk);if(pending===P0){pending.state='idle';drawPunch(url,'Vérification interrompue (app en arrière-plan). Reprends la photo.','ko')}return}mode='local';logE('salle','IA indisponible : '+(e&&e.message))}
  }
  clearInterval(tk);
  if(mode==='local'){try{const d=cx.getImageData(0,0,cv.width,cv.height).data;let s=0,s2=0,n=0;for(let i=0;i<d.length;i+=16){const l=.299*d[i]+.587*d[i+1]+.114*d[i+2];s+=l;s2+=l*l;n++}
    const mean=s/n,vr=s2/n-mean*mean;ok=mean>35&&vr>180;msg=ok?'Photo validée (vérification simple, IA indisponible).':'Photo trop sombre ou floue. Reprends-la.'}catch(e){ok=true}}
  if(pending!==P0)return;pending.state='idle';
  if(!ok){drawPunch(url,msg,'ko');return}
  const g=validate(P0.key,P0.how,mode);render();drawPunch(url,`${msg} ${M$(g)} dans la cagnotte.`,'ok');
}
function valAct(key,how){
  const ds=key.split(':')[0];const t=dayTasks(ds).find(x=>x.key===key);if(!t)return;
  if(t.type==='sport'&&how!=='miss'){punchSheet(key,how);return}
  const g=validate(key,how,'tap');closeSheet();render();
  toast(how==='miss'?`Pas fait · ${M$(g)}`:`${t.title} · ${HOW[how]} · ${M$(g)}`);
}


/* ---------- SPORT ---------- */
function renderSport(){
  const sub=V.sportSub;
  const head=`<header class="top"><div class="stack" style="gap:4px"><span class="lbl">Programme 12 semaines · recomposition</span><h1>Sport</h1></div></header>
  <div class="seg">${[['seance','Séance'],['prog','Programme'],['corps','Corps']].map(([k,l])=>`<button class="${sub===k?'on':''}" data-act="sportSub" data-v="${k}">${l}</button>`).join('')}</div>`;
  return head+(sub==='prog'?renderProg():sub==='corps'?renderCorps():renderSeance());
}
function nextSessionDate(from){for(let i=0;i<14;i++){const d=addDs(from,i);if(sessionFor(d))return d}return null}
function renderSeance(){
  const t=today();let ds=V.sportDate||t;let sess=sessionFor(ds);
  if(!sess){const nd=nextSessionDate(ds);
    const w=weekOf(t);const steps=w<1?6000:Math.min(10000,6000+w*350);
    const walk=dayTasks(ds).find(x=>x.type==='cardio');
    return`<section class="card"><span class="lbl">${ds===t?'Aujourd’hui':fmtDate(parseYmd(ds))}</span><h2>${walk?'Jour cardio léger':'Jour de repos actif'}</h2>
      <p>${walk?`${durTxt(walk.dur)} de marche rapide à ${hm(walk.start)}, en respirant par le nez si possible.`:'Récupération : marche tranquille, étirements doux, bien dormir.'}</p>
      <div class="kv"><div><span class="lbl">Objectif pas</span><b>${nf(steps)}</b></div><div><span class="lbl">Prochaine séance</span><b style="font-size:16px;font-family:var(--f-ui);font-weight:600">${nd?fmtShort(parseYmd(nd)):'—'}</b></div></div>
      ${walk&&ds===t?`<button class="btn" data-act="task" data-k="${walk.key}">${ic('check')} Pointer la marche</button>`:''}
      ${nd?`<button class="btn ghost" data-act="sportDate" data-v="${nd}">Voir la séance du ${fmtShort(parseYmd(nd))} ${ic('arrow')}</button>`:''}</section>${programIntro()}`;
  }
  const p=S.profile,home=p.place!=='salle';const task=dayTasks(ds).find(x=>x.id==='sport');const pu=task?S.punches[task.key]||{}:{};
  const exHtml=sess.items.map(([id,kind],i)=>{const ex=EX[id];const pr=presc(kind,sess.w,ex);const k=`${ds}:${i}`;const done=S.setsDone[k]||[];
    const inj=(p.injuries||[]).map(j=>ex.inj&&ex.inj[j]).filter(Boolean);
    const last=S.lifts[id]??(home&&!ex.kg?0:ex.kg);
    const lastFull=S.lifts[id+'_ok'];
    const name=home?ex.h:ex.n;
    const kgUI=(ex.cardio||ex.time||ex.kg==null||(home&&p.place==='maison0'))?'':`<div class="row between"><span class="muted" style="font-size:13px">Charge${lastFull?' · <b style="color:var(--money)">+2,5 kg la prochaine fois</b>':''}</span><div class="row" style="gap:6px"><button class="set" data-act="kg" data-v="${id}" data-d="-2.5" aria-label="Moins 2,5 kg">−</button><span class="num" style="min-width:64px;text-align:center;font-size:17px">${nf(last,1)} kg</span><button class="set" data-act="kg" data-v="${id}" data-d="2.5" aria-label="Plus 2,5 kg">+</button></div></div>`;
    return`<div class="ex"><div class="row between" style="align-items:flex-start"><div class="stack" style="gap:2px;min-width:0"><h3>${esc(name)}</h3><span class="muted" style="font-size:13px">${ex.m}</span></div>
      <a class="link" style="font-size:13px;white-space:nowrap" href="https://www.youtube.com/results?search_query=${encodeURIComponent(name+' technique')}" target="_blank" rel="noopener">${ic('play')} Technique</a></div>
      <span class="presc">${pr.txt}${pr.rest?` · repos ${pr.rest} s`:''}</span><p style="font-size:14px">${ex.c}</p>${inj.map(x=>`<div class="note">${x}</div>`).join('')}${kgUI}
      <div class="sets">${Array.from({length:pr.sets},(_,j)=>`<button class="set ${done[j]?'on':''}" data-act="set" data-k="${k}" data-j="${j}" data-n="${pr.sets}" data-ex="${id}" aria-label="Série ${j+1}">${done[j]?'✓':j+1}</button>`).join('')}</div></div>`}).join('');
  const isT=ds===t;
  const totalSets=sess.items.reduce((a,[id,kind],i)=>a+presc(kind,sess.w,EX[id]).sets,0);
  const doneSets=sess.items.reduce((a,_,i)=>a+(S.setsDone[`${ds}:${i}`]||[]).filter(Boolean).length,0);
  return`<section class="card"><div class="row between"><span class="lbl">${isT?'Aujourd’hui':fmtDate(parseYmd(ds))} · S${sess.w}${isDeload(sess.w)?' · semaine allégée':''}</span><span class="stamp st-run">${PHASES[sess.ph].n}</span></div>
    <h2>${sess.name}</h2><p class="muted num">${task?hm(task.start)+' · ':''}${durTxt(p.sessionMin)} · ${doneSets}/${totalSets} séries</p><div class="bar m"><i style="width:${totalSets?doneSets/totalSets*100:0}%"></i></div>
    ${isT&&task?(pu.how&&pu.how!=='miss'?`<div class="banner info">${ic('check')}<span class="grow">Séance validée à ${clock(pu.at||pu.in)} (${HOW[pu.how]}).</span></div>`:status(task)==='due'?valBtns(task,false):''):''}
    ${!isT?`<button class="btn ghost" data-act="sportDate" data-v="${t}">Revenir à aujourd’hui</button>`:''}</section>
  <section class="card"><span class="lbl">Échauffement · 6 min</span><p>3 min de vélo ou marche rapide, puis 10 rotations d’épaules, 10 squats à vide jusqu’à une chaise, 10 ponts fessiers. Première série de chaque exercice principal à mi-charge.</p></section>
  <section class="card" style="gap:0">${exHtml}</section>
  <section class="flat"><p style="font-size:13.5px"><b>RPE</b> = effort ressenti sur 10. RPE 7 : tu pourrais encore faire 3 répétitions propres. Quand tu fais le haut de la fourchette sur toutes les séries, ajoute 2,5 kg la séance suivante.</p></section>`;
}
function programIntro(){const p=S.profile;return`<section class="flat stack" style="gap:6px"><b>Pourquoi ce programme</b><p style="font-size:14px">Musculation 3×/semaine en full body puis en split, progression de charge, cardio doux qui ménage les genoux, et ${nf(Math.min(10000,6000+weekOf(today())*350))} pas par jour. Avec un déficit calorique modéré et beaucoup de protéines, c’est la combinaison la plus fiable pour perdre du gras tout en gagnant du muscle quand on débute.</p></section>`}
function renderProg(){
  const t=today(),cw=weekOf(t);const sel=V.progWeek??Math.max(1,cw);const mon=S.programStart?addDs(S.programStart,(sel-1)*7):mondayOf(t);
  const weeks=Array.from({length:12},(_,i)=>i+1).map(w=>`<button class="wk ${w===sel?'on':''} ${w===cw?'cur':''}" data-act="progWeek" data-v="${w}">S<b>${w}</b>${isDeload(w)?'léger':phaseOf(w)===1?'base':phaseOf(w)===2?'volume':'intens.'}</button>`).join('');
  const days=Array.from({length:7},(_,i)=>{const d=addDs(mon,i);const s=sessionFor(d);const tk=dayTasks(d).find(x=>x.type==='cardio');const pu=s?S.punches[d+':sport']:tk?S.punches[tk.key]:null;
    return`<button class="tc" data-act="${s?'sportDate':'noop'}" data-v="${d}"><span class="t">${DAYS[i]}<small>${parseYmd(d).getDate()}/${parseYmd(d).getMonth()+1}</small></span><span class="ti"><b>${s?s.name:tk?'Marche active '+durTxt(tk.dur):'Repos'}</b><span>${s?s.items.filter(x=>x[1]!=='fin').map(x=>esc((S.profile.place==='salle'?EX[x[0]].n:EX[x[0]].h).split(' (')[0])).slice(0,3).join(' · '):tk?'Zone 2, tu peux parler':'Récupération, étirements'}</span></span>${pu&&pu.out?'<span class="stamp st-done">Fait</span>':s?ic('arrow'):''}</button>`}).join('');
  const ph=phaseOf(sel);
  return`<div class="scroller">${weeks}</div>
  <section class="card"><div class="row between"><span class="lbl">Semaine ${sel} · ${fmtShort(parseYmd(mon))}</span>${sel===cw?'<span class="stamp st-run">En cours</span>':''}</div><h2>${PHASES[ph].n}${isDeload(sel)?' · semaine allégée':''}</h2><p style="font-size:14px">${isDeload(sel)?'Volume réduit de moitié pour laisser le corps assimiler. Tu sors de chaque séance en forme.':PHASES[ph].d}</p>
   <div class="kv"><div><span class="lbl">Pas / jour</span><b>${nf(Math.min(10000,6000+sel*350))}</b></div><div><span class="lbl">Séances muscu</span><b>${Array.from({length:7},(_,i)=>sessionFor(addDs(mon,i))).filter(s=>s&&s.key!=='CARDIO').length}</b></div></div></section>
  <section class="tl">${days}</section>
  ${!S.programStart||cw<1?`<p class="muted" style="font-size:13px">Le programme démarre le ${fmtDate(parseYmd(S.programStart||t))}. D’ici là : marche quotidienne et routine de sommeil.</p>`:''}`;
}
function renderCorps(){
  const tg=targets(),p=S.profile,w=tg.w,start=S.weights.length?S.weights[0].kg:p.weight;const lost=start-w;const toGo=Math.max(0,w-p.goal);
  const pct=start>p.goal?clamp((start-w)/(start-p.goal),0,1):0;
  const eta=addDays(new Date(),tg.weeks*7);
  return`<section class="card"><div class="row between"><span class="lbl">Poids actuel</span><button class="chip sm on" data-act="weigh">${ic('plus')} Pesée</button></div>
   <div class="row" style="align-items:baseline;gap:8px"><span class="num" style="font-size:44px;letter-spacing:-.04em">${nf(w,1)}</span><span class="muted">kg · objectif ${nf(p.goal,0)} kg</span></div>
   <div class="bar m"><i style="width:${pct*100}%"></i></div>
   <div class="kv"><div><span class="lbl">Perdu</span><b style="color:var(--money)">${lost>0?'−':''}${nf(Math.abs(lost),1)} kg</b></div><div><span class="lbl">Reste</span><b>${nf(toGo,1)} kg</b></div><div><span class="lbl">IMC</span><b>${nf(tg.bmi,1)}</b></div><div><span class="lbl">Objectif vers</span><b style="font-size:15px;font-family:var(--f-ui);font-weight:600">${tg.weeks?MONTHS[eta.getMonth()]+' '+eta.getFullYear():'atteint'}</b></div></div></section>
  <section class="card"><h3>Évolution</h3>${S.weights.length>1?weightChart():`<div class="empty">Pèse-toi chaque lundi au réveil, après les toilettes. La courbe apparaîtra dès la 2e pesée.</div>`}</section>
  <section class="flat"><p style="font-size:13.5px">Rythme visé : ${nf(tg.lossWk,2)} kg par semaine (${nf(tg.lossWk/w*100,1)} % du poids). Le poids bouge de ±1 kg d’un jour à l’autre (eau, sel) : regarde la tendance sur 3 semaines, pas une pesée isolée. Si ton tour de taille baisse mais pas le poids, tu prends du muscle.</p></section>`;
}
function weightChart(){
  const pts=S.weights.slice(-20);const W=320,H=160,pl=34,pb=22,pt=10;
  const ks=pts.map(x=>x.kg);let lo=Math.floor(Math.min(...ks,S.profile.goal)-1),hi=Math.ceil(Math.max(...ks)+1);
  const t0=parseYmd(pts[0].d).getTime(),t1=Math.max(t0+864e5,parseYmd(pts[pts.length-1].d).getTime());
  const x=d=>pl+(parseYmd(d).getTime()-t0)/(t1-t0)*(W-pl-10),y=k=>pt+(hi-k)/(hi-lo)*(H-pt-pb);
  let g='';const step=Math.max(1,Math.ceil((hi-lo)/4));for(let v=lo;v<=hi;v+=step)g+=`<line x1="${pl}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${pl-5}" y="${y(v)+3}" text-anchor="end">${v}</text>`;
  if(S.profile.goal>=lo)g+=`<line x1="${pl}" x2="${W}" y1="${y(S.profile.goal)}" y2="${y(S.profile.goal)}" stroke="var(--money)" stroke-dasharray="4 4"/>`;
  const line=pts.map((p,i)=>`${i?'L':'M'}${x(p.d).toFixed(1)},${y(p.kg).toFixed(1)}`).join('');
  const area=line+`L${x(pts[pts.length-1].d).toFixed(1)},${H-pb}L${x(pts[0].d).toFixed(1)},${H-pb}Z`;
  g+=`<path d="${area}" fill="var(--accent-soft)"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2.2"/>`;
  const l=pts[pts.length-1];g+=`<circle cx="${x(l.d)}" cy="${y(l.kg)}" r="4.5" fill="var(--accent)"/>`;
  g+=`<text x="${pl}" y="${H-5}">${fmtShort(parseYmd(pts[0].d))}</text><text x="${W}" y="${H-5}" text-anchor="end">${fmtShort(parseYmd(l.d))}</text>`;
  return`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe de poids">${g}</svg>`;
}
let WG=null;
function weighSheet(){WG={kg:curWeight()};drawWeigh()}
function drawWeigh(){openSheet(`<div class="grab"></div><h2>Pesée</h2><p class="muted">Le matin, à jeun, après les toilettes.</p>${stepper('WG','kg',.1,40,250,'kg','big')}<div class="chips">${[-1,-.5,.5,1].map(v=>`<button class="chip sm" data-act="st" data-o="WG" data-k="kg" data-d="${v}" data-min="40" data-max="250">${v>0?'+':'−'}${nf(Math.abs(v),1)}</button>`).join('')}</div><button class="btn" data-act="weighSave">Enregistrer ${nf(WG.kg,1)} kg</button>`,'weigh')}
