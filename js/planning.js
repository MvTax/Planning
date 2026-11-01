/* Moteur de la journée : semaines du programme, planning de travail, tâches du jour, statuts, validations, cagnotte (points internes), rendu, fenêtres (sheets). Propriétaire : « Général ». */
/* ============ programme & journée ============ */
function weekOf(ds){if(!S.programStart)return 0;const diff=Math.round((parseYmd(ds)-parseYmd(S.programStart))/864e5);if(diff<0)return 0;const w=Math.floor(diff/7)+1;return((w-1)%12)+1}
function cycleOf(ds){if(!S.programStart)return 1;const diff=Math.round((parseYmd(ds)-parseYmd(S.programStart))/864e5);return diff<0?1:Math.floor(Math.floor(diff/7)/12)+1}

const TYPE={reveil:['Réveil',30],coucher:['Au lit',20],pesee:['Pesée',10],repas:['Repas',10],travail:['Travail',10],sport:['Sport',50],cardio:['Marche active',25],courses:['Courses',20],batch:['Batch cooking',30],etude:['Étude',20],maison:['Maison',15],rdv:['Rendez-vous',10],perso:['Perso',15],agenda:['Agenda',10]};
const SINGLE=['reveil','coucher','pesee'];
/* planning de travail : agenda > modif manuelle > horaires habituels */
/* journée coupée = un seul service : début du premier, fin du dernier (titre et lieu du premier) */
const oneBlock=b=>b.length<2?b:[{...b[0],e:Math.max(...b.map(x=>x.e))}];
function workBlocks(ds){
  const o=S.workOv[ds];
  if(o)return{src:'manuel',blocks:o.on?oneBlock((o.blocks||[{s:o.start,e:o.end}]).map(b=>({s:b.s,e:b.e})).sort((a,b)=>a.s-b.s)):[]};
  const A=S.agenda;
  if(A&&A.from<=ds&&ds<=A.to)return{src:'agenda',blocks:oneBlock(A.shifts.filter(x=>x.d===ds).map(x=>({s:x.s,e:x.e,t:x.t,loc:x.loc})).sort((a,b)=>a.s-b.s))};
  if(A&&ds>A.to)for(let k=1;k<=4;k++){const r=addDs(ds,-7*k);if(r>=A.from&&r<=A.to)return{src:'estime',blocks:oneBlock(A.shifts.filter(x=>x.d===r).map(x=>({s:x.s,e:x.e,t:x.t,loc:x.loc})).sort((a,b)=>a.s-b.s))}}
  const p=S.profile;return{src:'habituel',blocks:oneBlock(p.workDays.includes(dow(parseYmd(ds)))?[{s:p.workStart,e:p.workEnd}]:[])};
}
const sleepNeed=()=>(S.profile.cycles||5)*90+15;
function wakeFor(ds){const p=S.profile,b=workBlocks(ds).blocks;const ov=S.wakeOv[ds];if(ov!=null&&ov>=240&&ov<=780&&(!b.length||ov<=b[0].s-15))return ov;let w=p.wake;if(b.length)w=Math.min(w,b[0].s-(p.commute||0)-75);return Math.max(300,w)}
function busySpans(blocks,cm){const sp=[];for(const b of blocks){const s=b.s-cm,e=b.e+cm,l=sp[sp.length-1];if(l&&s<=l.e){l.e=Math.max(l.e,e);l.parts.push(b)}else sp.push({s,e,parts:[b]})}return sp}
function planner(lo,hi,spans){const taken=spans.map(b=>[b.s,b.e]);
  const free=(t,d)=>t>=lo&&t+d<=hi&&taken.every(([a,b])=>t+d<=a||t>=b);
  return{take(t,d){taken.push([t,t+Math.max(d,10)])},
    find(pref,d,range){pref=Math.round(pref/5)*5;for(let k=0;k<=range;k+=15)for(const t of k?[pref+k,pref-k]:[pref])if(free(t,Math.max(d,10)))return t;return null}}}
function dayTasks(ds){
  const p=S.profile,d=parseYmd(ds),wd=dow(d);const T=[];const cm=p.commute||0;
  const wake=wakeFor(ds),bed=S.bedOv[ds]??(wakeFor(addDs(ds,1))+1440-sleepNeed());
  const W=workBlocks(ds),spans=busySpans(W.blocks,cm);
  const pl=planner(wake+20,bed-40,spans);
  W.blocks.forEach((b,i)=>T.push({id:'travail'+i,type:'travail',title:b.t?'Travail · '+b.t:'Travail',start:b.s,dur:Math.max(15,b.e-b.s),pts:10,loc:b.loc||'',src:W.src}));
  const sess=sessionFor(ds);
  if(sess){let t=null;for(const pf of [p.sessionTime,wake+120,wake+180]){t=pl.find(pf,p.sessionMin+15,60);if(t!=null)break}if(t==null)t=pl.find(p.sessionTime,p.sessionMin+15,720);
    if(t!=null){pl.take(t,p.sessionMin+15);T.push({id:'sport',type:'sport',title:sess.name,start:t,dur:p.sessionMin,pts:sess.key==='CARDIO'?35:50,moved:t!==p.sessionTime})}}
  if(p.omad){const wl=p.omadWin||60;let t=pl.find(p.omadTime,wl,480);if(t==null)t=p.omadTime;pl.take(t,wl);T.push({id:'omad',type:'repas',title:'Repas unique (OMAD)',start:t,dur:wl,pts:OMAD_PTS,meal:1,moved:t!==p.omadTime})}
  S.ics.forEach((e,i)=>{if(e.d===ds)T.push({id:'ics'+i,type:'agenda',title:e.t,start:e.s,dur:Math.max(15,e.e-e.s),pts:0,info:1})});
  for(const c of S.custom){let ok=false;
    if(c.repeat==='once')ok=c.date===ds;else if(c.repeat==='daily')ok=ds>=c.date;else if(c.repeat==='weekdays')ok=ds>=c.date&&wd<5;else if(c.repeat==='weekly')ok=ds>=c.date&&dow(parseYmd(c.date))===wd;
    if(ok)T.push({id:c.id,type:c.type,title:c.title,start:c.start,dur:c.dur,pts:c.pts,custom:1})}
  return T.filter(t=>!S.skips[ds+':'+t.id]).map(t=>{const k=ds+':'+t.id;const sh=S.shifts[k]||0;return Object.assign(t,{key:k,ds,start:t.start+sh})}).sort((a,b)=>a.start-b.start);
}
function dayStats(ds){
  const p=S.profile,cm=p.commute||0;const wake=wakeFor(ds),bed=S.bedOv[ds]??(wakeFor(addDs(ds,1))+1440-sleepNeed());
  const bl=workBlocks(ds).blocks;const work=bl.reduce((a,b)=>a+b.e-b.s,0);const trips=bl.length?busySpans(bl,cm).length*2*cm:0;
  let b=bed;const bad=b<wake+360||b>wake+1320;if(bad)b=wakeFor(addDs(ds,1))+1440-sleepNeed();
  const awake=Math.max(0,b-wake);return{wake,bed:b,work,trips,awake,free:Math.max(0,awake-work-trips),n:bl.length,fixed:bad};
}

function status(t){
  const pu=S.punches[t.key]||{};const now=Date.now(),s=at(t.ds,t.start),e=at(t.ds,t.start+t.dur);
  if(t.info)return now<s?'iup':now<e?'irun':'idone';
  if(t.meal){if(((S.meals||{})[t.ds]||[]).length)return'done';if(t.ds<today())return'miss';return now<s-30*6e4?'up':now<s?'soon':now<e?'run':'due'}
  if(pu.how==='miss'||S.missed[t.key])return'miss';
  if(pu.in)return'done';
  if(now<s-30*6e4)return'up';
  if(t.type==='travail')return now<s?'soon':now<e?'run':'due';
  return now<s?'soon':'due';
}
const STAMP={iup:['st-up',''],irun:['st-run','En cours'],idone:['st-up','Fini'],done:['st-done','Validé'],run:['st-due','En cours'],due:['st-due','À valider'],soon:['st-up','Bientôt'],up:['st-up','À venir'],miss:['st-miss','Pas fait']};
const MEAL_LBL={done:'Mangé',run:'Fenêtre ouverte',due:'À manger',miss:'Pas mangé',soon:'Bientôt',up:'À venir'};
const HOW={ok:'à l’heure',late:'en retard',forgot:'oubli de pointage',miss:'pas fait'};
const howPts=(t,h)=>h==='ok'?t.pts:h==='miss'?-t.pts:Math.round(t.pts/2);
/* boutons de validation selon le moment */
function valBtns(t,hero){
  if(!started())return`<p class="${hero?'meta':'muted'}" style="font-size:13px">Les pointages commencent le dimanche 1er novembre.</p>`;
  if(t.meal)return t.ds===today()?`<button class="btn ${hero?'go':'btn-meal'}" data-act="meal">${ic('cam')} Photographier mon plat</button>`:'';
  const now=Date.now(),s=at(t.ds,t.start),late=now>s+15*6e4,past=t.ds<today(),photo=t.type==='sport';
  const B=(how,lbl,cls)=>`<button class="btn ${cls}" data-act="val" data-k="${t.key}" data-v="${how}">${lbl} <span class="num" style="opacity:.8;font-weight:500">${M$(howPts(t,how))}</span></button>`;
  const P=hero?'go':'';const G=hero?'':'ghost';let h='';
  if(photo){h+=past?'':B(late?'late':'ok',`${ic('cam')} ${late?'Je suis à la salle (en retard)':'Je suis à la salle'}`,P)}
  else if(past)h+=B('forgot',`${ic('check')} C’était fait, j’ai oublié de pointer`,P);
  else if(!late)h+=B('ok',`${ic('check')} ${t.type==='travail'?'Je suis au travail':'Fait'}`,P);
  else h+=B('forgot',`${ic('check')} J’ai oublié de pointer`,P)+B('late',`Arrivé en retard`,G);
  h+=`<button class="btn danger" data-act="val" data-k="${t.key}" data-v="miss">Pas fait <span class="num" style="opacity:.8;font-weight:500">${M$(-t.pts)}</span></button>`;
  return`<div class="stack" style="gap:8px">${h}</div>`;
}
function validate(key,how,mode){
  const ds=key.split(':')[0];const t=dayTasks(ds).find(x=>x.key===key);if(!t)return;
  S.ledger=S.ledger.filter(e=>e.key!==key);delete S.missed[key];
  const now=Date.now();S.punches[key]={in:how==='miss'?0:(how==='forgot'?at(ds,t.start):now),how,at:now,mode:mode||'tap'};
  const g=howPts(t,how);addPts(g,(how==='miss'?'Pas fait · ':how==='ok'?'':HOW[how].charAt(0).toUpperCase()+HOW[how].slice(1)+' · ')+t.title,key);
  checkPerfect(ds);save();stopRing();return g;
}

/* ============ points ============ */
const M$=(p,sign=true)=>(sign?(p>0?'+':p<0?'−':''):'')+eur(Math.abs(p)*S.profile.rate);
function addPts(pts,label,key){S.ledger.push({t:Date.now(),pts,label,key:key||''})}
const periodPts=()=>S.ledger.filter(l=>l.t>=S.periodStart).reduce((a,l)=>a+l.pts,0);
const dayPts=ds=>S.ledger.filter(l=>ymd(new Date(l.t))===ds).reduce((a,l)=>a+l.pts,0);
const periodEur=()=>Math.max(0,periodPts())*S.profile.rate;
const totalSaved=()=>S.payouts.reduce((a,p)=>a+p.eur,0);
const totalSpent=()=>S.spent.reduce((a,p)=>a+p.eur,0);
function streak(){let n=0;let d=new Date();const t=today();
  for(let i=0;i<120;i++){const ds=ymd(addDays(d,-i));const pu=S.punches[ds+':reveil'];if(pu&&pu.inF>=1)n++;else if(ds===t)continue;else break}return n}
function timeFactor(t,ts){const L=(ts-at(t.ds,t.start))/6e4;
  if(t.type==='reveil')return L<=5?1:L<=15?.5:.2;
  if(t.type==='coucher'){const a=Math.abs(L);return L<=15?1:a<=45?.6:.3}
  return L<=10?1:L<=30?.6:.3}
const MEAL_PTS=15,OMAD_PTS=40;
const mealsN=()=>S.profile.omad?1:S.profile.meals;
function omadInfo(ds){const t=dayTasks(ds).find(x=>x.meal);if(!t)return null;const ms=(S.meals||{})[ds]||[];return{t,start:t.start,end:t.start+t.dur,done:ms.length>0,first:ms[0]}}
function checkPerfect(ds){
  if(S.perfect[ds])return;const T=dayTasks(ds).filter(t=>!t.info);
  const okT=T.filter(t=>!t.meal).every(t=>{const pu=S.punches[t.key];return pu&&pu.in&&pu.how!=='miss'});
  if(okT&&((S.meals||{})[ds]||[]).length>=mealsN()){S.perfect[ds]=1;addPts(30,'Journée parfaite')}
}
const START_DAY='2026-11-01';
const started=()=>today()>=START_DAY;
function startFresh(){resetCounters();const t0=at(START_DAY,0);S.since=t0;S.periodStart=t0;S.programStart=START_DAY;S.wakeOv={};S.bedOv={};S.shifts={};S.skips={};S.shopChecked={};S.reset5=1;try{localStorage.removeItem('cadence.log');LOGS=[]}catch(e){}}
function resetCounters(){Object.assign(S,{ledger:[],punches:{},missed:{},perfect:{},streakBonus:{},payouts:[],spent:[],setsDone:{},shifts:{},skips:{},lifts:{},nights:[],nightLive:null,meals:{},
  periodStart:Date.now(),since:Date.now(),weights:[{d:today(),kg:curWeight()}],reset4:1})}
function sweepMissed(){
  if(!S.onboarded)return false;let ch=false;const t=today();
  for(let i=1;i<=3;i++){const ds=addDs(t,-i);for(const task of dayTasks(ds)){
    if(task.info||task.meal||at(ds,task.start)<S.since)continue;
    if(S.missed[task.key]||(S.punches[task.key]||{}).how)continue;
    S.missed[task.key]=1;ch=true;if(S.settings.malus)addPts(-task.pts,'Non validé · '+task.title,task.key);
  }}
  return ch;
}

/* ============ rendu principal ============ */
function render(){
  applyTheme();
  if(!S.onboarded||V.reob){$('#tabs').innerHTML='';if($('#fab'))$('#fab').hidden=true;$('#main').innerHTML=renderOnboarding();return}
  $('#tabs').innerHTML=`<nav>${[['jour','Planning','agenda'],['sommeil','Sommeil','sommeil'],['sport','Sport','sport'],['repas','Repas','repasT'],['cagnotte','Cagnotte','cagnotte']].map(([k,l,i])=>`<button data-act="tab" data-v="${k}" class="${V.tab===k?'on':''}" aria-label="${l}">${ic(i)}<span>${l}</span></button>`).join('')}</nav>`;
  const f={jour:renderJour,sommeil:renderSommeil,sport:renderSport,repas:renderRepas,cagnotte:renderCagnotte}[V.tab]||renderJour;
  $('#main').innerHTML=f();
  const fab=$('#fab');if(fab){fab.hidden=V.tab!=='jour';if(!fab.firstChild)fab.innerHTML=ic('plus')}
}


/* ============ feuilles ============ */
let sheetName=null;
/* fenêtre déjà ouverte : on remplace seulement son contenu (pas de nouvelle animation = pas de clignotement) */
/* openSheet(html, nom, {full:true}) : page plein écran (tout l'écran défile, pas de zone qui défile dans la page) */
function openSheet(html,name,o){o=o||{};const same=sheetName===(name||'x');sheetName=name||'x';const r=$('#sheetRoot');const was=r.querySelector('.scrim:not(.out) .sheet');
  const inner=`<button class="sheet-x" data-act="close" aria-label="Fermer">${ic('x')}</button>${html}`;
  if(was){const sc=was.scrollTop;was.innerHTML=inner;was.parentNode.classList.toggle('full',!!o.full);was.scrollTop=same?sc:0;return}
  const src=TAP&&Date.now()-TAP.t<700&&TAP.el.isConnected&&TAP.el.closest('[data-pop]');
  r.innerHTML=`<div class="scrim${src?' pop':''}${o.full?' full':''}" data-act="scrim"><div class="sheet" role="dialog" aria-modal="true">${inner}</div></div>`;
  if(src)popFrom(r.querySelector('.sheet'),src.getBoundingClientRect())}
/* petite fenêtre qui s'ouvre depuis l'élément touché (ajoute data-pop sur l'élément) */
let TAP=null;
function popFrom(sh,a){const b=sh.getBoundingClientRect();if(!a.width||!b.width)return;
  sh.style.transition='none';sh.style.transformOrigin='0 0';sh.style.opacity='.35';
  sh.style.transform=`translate(${(a.left-b.left).toFixed(1)}px,${(a.top-b.top).toFixed(1)}px) scale(${(a.width/b.width).toFixed(3)},${(a.height/b.height).toFixed(3)})`;
  void sh.offsetWidth;sh.style.transition='transform .36s cubic-bezier(.3,1.12,.4,1),opacity .18s ease-out';sh.style.transform='';sh.style.opacity='';
  setTimeout(()=>{sh.style.transition='';sh.style.transformOrigin=''},400)}
function closeSheet(){if(sheetName==='diag'&&DIAG&&!DIAG.done)return;stopVoice();const sc=$('#sheetRoot .scrim:not(.out)');if(sc){sc.classList.add('out');sc.removeAttribute('data-act');setTimeout(()=>sc.remove(),220)}sheetName=null;MEAL=null;pending=null;NT=null;WO=null;PLW=null;RW=null;WG=null;rstConfirm=false;SETAI=false;crStop();CR=null}
function toast(m){const d=document.createElement('div');d.className='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
const CTX={get PF(){return S.profile},get NS(){return NS},get OB(){return OB},get NT(){return NT},get WO(){return WO},get SL(){return SL},get RW(){return RW},get WG(){return WG}};
function rerenderCtx(o){if(o==='PF'){save();render();if(sheetName==='settings')settingsSheet()}else if(o==='NS')nightSheet();else if(o==='OB')render();else if(o==='NT')addTaskSheet();else if(o==='WO')dayEditSheet(WO.ds);else if(o==='SL')render();else if(o==='RW')rewardSheet();else if(o==='WG')drawWeigh()}

/* ============ créer une tâche à la voix (bouton + du planning) ============
   La voix d'abord (dictée de Safari), l'écrit en second. L'IA remplit la tâche et pose une question s'il manque l'heure ou l'activité.
   Sans IA : petite analyse locale (jours, heures, durées, répétition, mots-clés). */
let CR=null,CRREC=null;
const CR_TYPES=['sport','cardio','repas','travail','etude','maison','courses','rdv','perso'];
const CR_KW=[['cardio',/marche|course à pied|footing|jogging|vélo|velo|cardio|natation|piscine/],['sport',/salle|muscu|séance|seance|sport|gym/],['courses',/courses|supermarch|lidl|carrefour|acheter/],
  ['repas',/repas|manger|dîner|diner|déjeuner|dejeuner|cuisine/],['etude',/étud|etud|révis|revis|lire|lecture|cours|devoir/],['maison',/ménage|menage|linge|vaisselle|ranger|lessive|aspirateur|maison/],
  ['rdv',/rendez|rdv|médecin|medecin|dentiste|docteur|coiffeur|banque/],['travail',/travail|boulot|réunion|reunion/]];
function crStop(){if(CRREC){const r=CRREC;CRREC=null;r.ab=true;try{r.abort()}catch(e){try{r.stop()}catch(e2){}}}if(CR)CR.listening=false}
function crLocal(txt){const t=' '+txt.toLowerCase().replace(/’/g,"'")+' ',now=nowMin();let date=today(),start=null,dur=null,repeat='once';
  if(/après-demain|apres-demain|après demain|apres demain/.test(t))date=addDs(today(),2);else if(/demain/.test(t))date=addDs(today(),1);
  else{const J=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];J.forEach((j,i)=>{if(t.includes(' '+j)){let k=(i-new Date().getDay()+7)%7;if(k===0)k=7;date=addDs(today(),k)}})}
  let m=t.match(/(\d{1,2})\s*(?:h|heures?|:)\s*(\d{2})?/);if(m&&+m[1]<24)start=+m[1]*60+(+m[2]||0);
  else if(/midi/.test(t))start=720;else if(/minuit/.test(t))start=0;
  if(start!=null&&/ (de l'après-midi|du soir|ce soir)/.test(t)&&start<720)start+=720;
  m=t.match(/pendant\s+(\d+)\s*(min|minutes|h|heures?)(?:\s*(\d{2}))?/)||t.match(/(\d+)\s*(min|minutes)\b/);if(m)dur=/h/.test(m[2])?+m[1]*60+(+m[3]||0):+m[1];
  else if(/une heure|1 heure/.test(t))dur=60;else if(/une demi-heure|demi heure/.test(t))dur=30;
  if(/tous les jours|chaque jour|quotidien/.test(t))repeat='daily';else if(/en semaine|du lundi au vendredi/.test(t))repeat='weekdays';else if(/chaque semaine|toutes les semaines|tous les (lundis|mardis|mercredis|jeudis|vendredis|samedis|dimanches)/.test(t))repeat='weekly';
  let type='perso';for(const[k,re]of CR_KW)if(re.test(t)){type=k;break}
  let title=txt.replace(/^\s*(ajoute[rsz]?|crée[rsz]?|cree[rsz]?|mets?|mettre|rajoute[rsz]?|programme[rsz]?|planifie[rsz]?|note[rsz]?)\s+(moi\s+)?/i,'').replace(/^(une?|la|le|les)\s+(tâche|tache|rappel|séance|seance)?\s*(de|d'|du|pour)?\s*/i,'')
    .replace(/\s*(aujourd'hui|après-demain|apres-demain|demain|ce soir|tous les jours|chaque jour|chaque semaine|en semaine)\b.*$/i,'').replace(/\s*(à|a|vers|pendant|de|le|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\s+\d.*$/i,'').replace(/\s*\d{1,2}\s*(h|:).*$/i,'').trim();
  if(!title||title.length<2)title='';
  return{title:title?title[0].toUpperCase()+title.slice(1):'',type,date,start:start==null?'':hm(start),dur,repeat,q:start==null?(title?`À quelle heure pour « ${title} » ?`:'Quelle tâche, et à quelle heure ?'):!title?'Qu’est-ce que tu veux faire à cette heure-là ?':''}}
function crClean(o,said,pre){const v={};const ty=String(o.type||'').toLowerCase();v.type=CR_TYPES.includes(ty)?ty:'perso';
  v.title=String(o.title||'').trim().slice(0,60);v.date=/^\d{4}-\d{2}-\d{2}$/.test(o.date||'')&&o.date>=addDs(today(),-1)&&o.date<=addDs(today(),370)?o.date:today();
  const m=String(o.start||'').match(/^(\d{1,2})[:h](\d{2})/);v.start=m&&+m[1]<24&&+m[2]<60?+m[1]*60+ +m[2]:null;
  v.dur=Math.round(clamp(+o.dur||({sport:60,cardio:45,repas:45,travail:240,etude:60,maison:30,courses:45,rdv:60,perso:30}[v.type]),5,720)/5)*5;
  v.repeat=['once','daily','weekdays','weekly'].includes(o.repeat)?o.repeat:'once';v.q=String(o.q||'').trim().slice(0,140);
  if(v.start!=null&&v.title)v.q='';else if(!v.q)v.q=v.title?`À quelle heure pour « ${v.title} » ?`:'Qu’est-ce que tu veux faire, et à quelle heure ?';
  if(pre){v.date=pre.date;v.start=pre.start;v.dur=pre.dur;v.q=v.title?'':String(o.q||'').trim().slice(0,140)||'Qu’est-ce que tu fais sur ce créneau ?'}
  if(said.filter(x=>x.q).length>=2&&v.q){if(!v.title)v.title=said[0].a.slice(0,40);if(v.start==null)v.start=Math.min(1425,Math.ceil((nowMin()+15)/15)*15);v.q=''}
  return v}
async function crThink(){const M=CR;if(!M)return;M.step='think';M.err='';createSheet();let o=null;
  if(aiReady())try{o=await aiTask(M.said,M.pre)}catch(e){M.aiErr=e.message;logE('ai','assistant : '+e.message)}
  if(CR!==M)return;if(!o)o=crLocal(M.said.map(x=>x.a).join(' '));const v=crClean(o,M.said,M.pre);
  if(v.q){M.step='ask';M.q=v.q;M.text='';createSheet();return}
  const id='c'+Date.now().toString(36);const pts=(TYPE[v.type]||[0,15])[1];
  S.custom.push({id,type:v.type,title:v.title||TYPE[v.type][0],start:v.start,dur:v.dur,pts,repeat:v.repeat,date:v.date,by:'voix'});save();render();
  M.step='done';M.made=id;createSheet();toast('Tâche ajoutée')}
function crListen(){const M=CR;if(!M)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){M.mode='text';M.err='La dictée n’est pas disponible ici : écris, ou touche le micro du clavier.';createSheet();setTimeout(()=>$('#crIn')?.focus(),80);return}
  crStop();const rec=new SR();CRREC=rec;rec.lang='fr-FR';rec.interimResults=true;rec.continuous=false;let fin='';
  rec.onresult=e=>{let tmp='';for(let i=e.resultIndex;i<e.results.length;i++){const x=e.results[i];if(x.isFinal)fin=(fin+' '+x[0].transcript).trim();else tmp+=x[0].transcript}
    M.text=(fin+' '+tmp).trim();const el=$('#crSay');if(el)el.textContent=M.text||'…'};
  rec.onerror=e=>{if(CRREC!==rec)return;M.err=e.error==='not-allowed'||e.error==='service-not-allowed'?'Micro refusé : autorise le micro pour ce site, ou écris ta tâche.':e.error==='no-speech'?'Je n’ai rien entendu. Touche le micro et parle.':'Dictée interrompue. Réessaie ou écris.'};
  rec.onend=()=>{if(CRREC===rec)CRREC=null;if(rec.ab||CR!==M)return;M.listening=false;const t=(fin||M.text||'').trim();if(t){crAnswer(t)}else createSheet()};
  try{rec.start();M.listening=true;M.err='';M.text=''}catch(e){M.listening=false;M.err='Impossible de démarrer la dictée. Écris ta tâche.';M.mode='text'}createSheet()}
function crAnswer(t){const M=CR;if(!M||!t)return;crStop();M.said.push({q:M.step==='ask'?M.q:'',a:t});M.text='';crThink()}
function createSheet(){const M=CR;if(!M)return;
  if(M.step==='done'){const c=S.custom.find(x=>x.id===M.made);if(!c){CR=null;return closeSheet()}const k=KIND(c.type);
    const rep={once:'',daily:' · chaque jour',weekdays:' · du lundi au vendredi',weekly:' · chaque semaine'}[c.repeat]||'';
    return openSheet(`<span class="lbl">C’est noté</span><h2>Tâche ajoutée</h2>
    <div class="cr-card k-${k}"><span class="badge k-${k}">${ic(c.type)}</span><div style="min-width:0"><b>${esc(c.title)}</b><span class="num">${c.date===today()?'Aujourd’hui':c.date===addDs(today(),1)?'Demain':fmtShort(parseYmd(c.date))} · ${hm(c.start)} → ${hm(c.start+c.dur)}${rep}</span><span class="cr-gain">${M$(c.pts,false)} à gagner</span></div></div>
    <div class="row" style="gap:8px"><button class="btn ghost" style="flex:1" data-act="crUndo">Annuler</button><button class="btn ghost" style="flex:1" data-act="crEdit">${ic('pen')} Modifier</button></div>
    <button class="btn" data-act="crMore">${ic('mic')} Ajouter une autre tâche</button><button class="btn ghost" data-act="close">Terminé</button>`,'create')}
  const ask=M.step==='ask',think=M.step==='think';
  openSheet(`<span class="lbl">${ask?'Il me manque un détail':'Nouvelle tâche'}</span><h2>${ask?esc(M.q):'Dis-moi ce que tu veux ajouter'}</h2>
  ${M.said.length?`<div class="cr-said">${M.said.map(x=>`<span>« ${esc(x.a)} »</span>`).join('')}</div>`:''}
  ${think?`<div class="cr-think"><span class="spin"></span>Je prépare ta tâche…</div>`:M.mode==='text'?`
   <textarea id="crIn" class="ans" rows="2" placeholder="${ask?'Ta réponse':'Ex. : séance de sport demain à 18 h'}">${esc(M.text||'')}</textarea>
   <button class="btn" data-act="crSend">Envoyer</button><button class="btn ghost" data-act="crVoice">${ic('mic')} Parler plutôt</button>`:`
   <p class="cr-say ${M.listening?'on':''}" id="crSay">${M.listening?esc(M.text||'Je t’écoute…'):esc(M.text||(ask?'Touche le micro pour répondre':'Ex. : « Ajoute courses demain à 18 h pendant 45 min »'))}</p>
   <button class="mic ${M.listening?'on':''}" data-act="crMic">${ic('mic')} ${M.listening?'J’écoute… touche pour valider':ask?'Répondre à la voix':'Parler'}</button>
   <button class="btn ghost" data-act="crWrite">${ic('pen')} Écrire plutôt</button>`}
  ${M.err?`<p class="muted" style="font-size:13px;color:var(--bad)">${esc(M.err)}</p>`:''}`,'create')}
/* createAt(jour, début, fin) : créneau choisi dans le planning (minutes) → on demande seulement ce qu'il faut faire, à la voix */
function createAt(ds,s,e){s=clamp(Math.round(s/5)*5,0,1435);e=clamp(Math.round(e/5)*5,s+5,1440);
  CR={step:'ask',said:[],mode:'voice',text:'',pre:{date:ds,start:s,dur:e-s},q:`Qu’est-ce que tu fais de ${hm(s)} à ${hm(e)} ?`};crListen()}
Object.assign(ACT,{
  create:()=>{CR={step:'listen',said:[],mode:'voice',text:''};crListen()},
  crMic:()=>{if(!CR)return;if(CR.listening){const r=CRREC;if(r)try{r.stop()}catch(e){}return}crListen()},
  crWrite:()=>{if(!CR)return;crStop();CR.mode='text';CR.err='';createSheet();setTimeout(()=>$('#crIn')?.focus(),80)},
  crVoice:()=>{if(!CR)return;CR.text=($('#crIn')||{}).value||'';CR.mode='voice';crListen()},
  crSend:()=>{if(!CR)return;const t=(($('#crIn')||{}).value||'').trim();if(!t){toast('Écris ta tâche');return}crAnswer(t)},
  crUndo:()=>{if(!CR)return;S.custom=S.custom.filter(c=>c.id!==CR.made);save();render();closeSheet();toast('Tâche annulée')},
  crEdit:()=>{if(!CR)return;const c=S.custom.find(x=>x.id===CR.made);if(!c)return;S.custom=S.custom.filter(x=>x.id!==c.id);save();render();
    NT={type:c.type,title:c.title,day:c.date,start:c.start,dur:c.dur,pts:c.pts,repeat:c.repeat};CR=null;addTaskSheet()},
  crMore:()=>{CR={step:'listen',said:[],mode:CR&&CR.mode||'voice',text:''};if(CR.mode==='text')createSheet();else crListen()}
});
