/* Cœur : utilitaires, icônes, état (S), chiffrement des fichiers, synchronisation. Propriétaire : conversation « Général ». */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseYmd=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const addDs=(ds,n)=>ymd(addDays(parseYmd(ds),n));
const dow=d=>(d.getDay()+6)%7;
const hm=m=>{m=((Math.round(m)%1440)+1440)%1440;return pad(Math.floor(m/60))+':'+pad(m%60)};
const at=(ds,min)=>{const d=parseYmd(ds);d.setMinutes(min);return d.getTime()};
const nowMin=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const clock=ts=>{const d=new Date(ts);return pad(d.getHours())+':'+pad(d.getMinutes())};
const today=()=>ymd(new Date());
const DAYS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const DAYS_L=['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
const MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const fmtDate=d=>`${DAYS_L[dow(d)]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
const MON_S=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const fmtShort=d=>`${DAYS[dow(d)].toLowerCase()}. ${d.getDate()} ${MON_S[d.getMonth()]}`;
const eur=n=>(Math.round(n*100)/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
const nf=(n,d=0)=>Number(n).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mondayOf=ds=>{const d=parseYmd(ds);return ymd(addDays(d,-dow(d)))};
const durTxt=m=>{m=Math.round(m);return m>=60?`${Math.floor(m/60)} h${m%60?' '+pad(m%60):''}`:`${m} min`};

/* ============ icônes ============ */
const P={
 reveil:'<circle cx="12" cy="13" r="7"/><path d="M12 10v3l2 2M5 4 3 6M19 4l2 2"/>',
 coucher:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
 sport:'<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
 cardio:'<circle cx="13" cy="4.5" r="1.8"/><path d="m7 21 3-6 3 2v4M10 15l1-5 4 3 3-1M8 10l3-1"/>',
 repas:'<path d="M5 3v8a2 2 0 0 0 2 2v8M9 3v8M7 3v8M17 21V3c-2.5 1.5-3 5-3 9h3"/>',
 travail:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
 courses:'<path d="M3 4h2l2.5 11h11L21 8H7"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17.5" cy="19.5" r="1.4"/>',
 batch:'<path d="M4 11h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-3ZM2 11h20M9 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>',
 pesee:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 10a4 4 0 0 1 6 0M12 10l1.5-1.5"/>',
 etude:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5ZM4 19a2 2 0 0 1 2-2h13"/>',
 maison:'<path d="m3 11 9-7 9 7M5 10v10h14V10"/>',
 rdv:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 perso:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 agenda:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h3"/>',
 jour:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
 sommeil:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
 repasT:'<path d="M5 3v8a2 2 0 0 0 2 2v8M9 3v8M7 3v8M17 21V3c-2.5 1.5-3 5-3 9h3"/>',
 cagnotte:'<path d="M19 9a7 6 0 1 0-1.5 5.5L19 18h-3l-1-1.6A8 8 0 0 1 12 17H9l-1 2H5l.5-3A6 6 0 0 1 4 11M16 8h.01"/>',
 cam:'<path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"/><circle cx="12" cy="13" r="4"/>',
 check:'<path d="m5 12 5 5 9-10"/>', star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>', hourglass:'<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>', mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', pen:'<path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4"/>', plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="M6 6l12 12M18 6 6 18"/>',
 bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2ZM10 21h4"/>', gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
 disk:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>', play:'<path d="M7 4v16l13-8Z"/>', map:'<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>'
};
/* registre des boutons : chaque fichier y ajoute ses actions avec Object.assign(ACT,{…}) (lu par app.js) */
const ACT={};
const ic=(n,cls='')=>`<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]||P.perso}</svg>`;

/* ============ état ============ */
const LS='cadence.v1';
function defaultState(){return{
  v:1,updatedAt:0,onboarded:false,since:0,
  profile:{name:'',sex:'h',birth:'1996-01-01',height:175,weight:80,waist:0,goal:90,pace:'standard',activity:'bureau',
    workDays:[0,1,2,3,4],workStart:540,workEnd:1050,wake:480,cycles:5,exp:'debutant',place:'salle',days:[0,2,4],sessionTime:1110,sessionMin:60,
    injuries:[],diet:[],meals:4,omad:false,omadTime:1260,omadWin:120,commute:30,budget:80,store:'lidl',shopDay:6,rate:0.02,payout:'hebdo',firstReward:'vetements',firstPrice:60},
  programStart:null,custom:[],punches:{},ledger:[],payouts:[],spent:[],periodStart:0,rewards:[],weights:[],
  shifts:{},skips:{},missed:{},perfect:{},streakBonus:{},wakeOv:{},bedOv:{},workOv:{},lifts:{},setsDone:{},shopChecked:{},ics:[],agenda:null,agendaCal:'',meals:{},nights:[],nightLive:null,foodLists:null,foodLog:{},
  settings:{theme:'auto',sound:true,selfieOut:false,ai:true,malus:true}
}}
let S=defaultState();
try{const raw=localStorage.getItem(LS);if(raw){const o=JSON.parse(raw);S=Object.assign(defaultState(),o);S.profile=Object.assign(defaultState().profile,o.profile||{});S.settings=Object.assign(defaultState().settings,o.settings||{})}}catch(e){}
let V={tab:'jour',date:today(),sportSub:'seance',foodSub:'menu',progWeek:null,shopNext:null,obStep:0};
try{const v=JSON.parse(localStorage.getItem(LS+'.view')||'null');if(v)Object.assign(V,v,{date:today(),obStep:V.obStep})}catch(e){}

/* clé de déchiffrement (dans le lien #k=…) */
try{const m=location.hash.match(/k=([A-Za-z0-9_-]{20,})/);if(m)localStorage.setItem('cadence.key',m[1])}catch(e){}
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
const b64=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};
async function decFile(name){let key=null;try{key=localStorage.getItem('cadence.key')}catch(e){}if(!key)throw{code:'nokey'};
  const r=await fetch(name+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw{code:'nofile'};const j=await r.json();
  const k=await crypto.subtle.importKey('raw',b64(key),'AES-GCM',false,['decrypt']);
  const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(j.iv)},k,b64(j.ct));return JSON.parse(new TextDecoder().decode(pt))}
async function loadAgendaFile(manual){
  try{const a=await decFile('agenda.enc.json');
    if(!S.agenda||(a.updatedAt||0)>(S.agenda.updatedAt||0)){S.agenda=a;save();render();if(sheetName==='plan')planSheet();if(manual)toast(`Planning mis à jour jusqu’au ${fmtShort(parseYmd(a.to))}`)}
    else if(manual)toast('Planning déjà à jour');return true}
  catch(e){if(manual)agendaHelp(e&&e.code==='nokey'?'nokey':'err');return false}}
async function loadSeed(){if(S.onboarded)return;try{const r=await decFile('state.enc.json');if(r&&r.onboarded&&!S.onboarded){S=Object.assign(defaultState(),r);if(!S.reset4)resetCounters();if(!S.omadInit){S.profile.omad=true;S.omadInit=1}if(!S.sleep2){S.profile.wake=480;S.profile.cycles=4;S.sleep2=1}if(!S.reset5)startFresh();if(!S.omadEve){S.profile.omadTime=1260;S.profile.omadWin=120;S.omadEve=1}S.profile=Object.assign(defaultState().profile,r.profile||{});S.settings=Object.assign(defaultState().settings,r.settings||{});save();render();toast('Ton profil a été récupéré')}}catch(e){}}
/* détection de visage sur l'appareil (MediaPipe) */
let FL=null,FLload=null;const MPV='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
function faceModel(){if(FL)return Promise.resolve(FL);if(!FLload)FLload=(async()=>{const v=await import(MPV+'/vision_bundle.mjs');const fs=await v.FilesetResolver.forVisionTasks(MPV+'/wasm');
  FL=await v.FaceLandmarker.createFromOptions(fs,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',delegate:'CPU'},runningMode:'IMAGE',outputFaceBlendshapes:true,numFaces:1});return FL})().catch(e=>{FLload=null;throw e});return FLload}
/* sync claude.ai (db privé par utilisateur) */
let MCP=null,DB=null,UID=null,writing=false,dirty=false,saveT=null,SAMPLE=null,SAMPLE_IMG=false;
function save(){
  S.updatedAt=Date.now();prune();
  try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}
  clearTimeout(saveT);saveT=setTimeout(flush,1200);
}
async function flush(){
  if(!DB||!UID)return; if(writing){dirty=true;return}
  writing=true;
  try{await DB.doc(`data/users/${UID}/state`).set(JSON.parse(JSON.stringify(S)))}catch(e){}
  writing=false; if(dirty){dirty=false;flush()}
}
function saveView(){try{localStorage.setItem(LS+'.view',JSON.stringify({tab:V.tab,sportSub:V.sportSub,foodSub:V.foodSub}))}catch(e){}}
function prune(){
  const cut=Date.now()-75*864e5;
  for(const k in S.punches){const d=k.split(':')[0];if(parseYmd(d).getTime()<cut)delete S.punches[k]}
  for(const k in S.setsDone){if(parseYmd(k.split(':')[0]).getTime()<cut)delete S.setsDone[k]}
  for(const o of [S.shifts,S.skips,S.missed,S.wakeOv,S.bedOv,S.workOv]){for(const k in o){if(parseYmd(k.split(':')[0]).getTime()<cut)delete o[k]}}
  if(S.ledger.length>500)S.ledger=S.ledger.slice(-500);
  S.meals=S.meals||{};for(const k in S.meals)if(parseYmd(k).getTime()<cut)delete S.meals[k];
}
async function connect(){
  if(!window.claude||!window.claude.use)return;
  try{
    const [user,db,sample,mcp]=await Promise.all([claude.use('user'),claude.use('db'),claude.use('sample'),claude.use('mcp')]);MCP=mcp;
    if(sample){SAMPLE=sample;try{const l=await sample.limits();SAMPLE_IMG=!!(l&&l.images)}catch(e){}}
    if(user&&db){
      UID=await user.id();
      if(UID){DB=db;
        try{const snap=await db.doc(`data/users/${UID}/state`).get();
          if(snap.exists){const r=snap.data();if((r.updatedAt||0)>(S.updatedAt||0)){S=Object.assign(defaultState(),JSON.parse(JSON.stringify(r)));S.profile=Object.assign(defaultState().profile,r.profile||{});S.settings=Object.assign(defaultState().settings,r.settings||{});try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}applyTheme();render()}
            else if((S.updatedAt||0)>(r.updatedAt||0))flush();}
          else if(S.onboarded)flush();
        }catch(e){}
        try{const a=await db.doc(`data/users/${UID}/agenda`).get();if(a.exists){const r=a.data();if(!S.agenda||(r.updatedAt||0)>(S.agenda.updatedAt||0)){S.agenda=JSON.parse(JSON.stringify(r));save();render()}}}catch(e){}
      }
    }
  }catch(e){}
}

let themeByApp=false;
function applyTheme(){const t=S.settings.theme,r=document.documentElement;if(t==='auto'){if(themeByApp){delete r.dataset.theme;themeByApp=false}}else{r.dataset.theme=t;themeByApp=true}}
