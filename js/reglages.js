/* RÉGLAGES : test complet de l'app, réglages, mise à jour, formulaire de départ. Propriétaire : « Général ». */
/* ---------- test complet de l'application ---------- */
let DIAG=null;
function diagSheet(){const D=DIAG;
  const lines=D.lines.map(l=>`<div class="ledger" style="font-size:13px"><span style="min-width:0">${esc(l.n)}${l.d?`<br><span class="muted" style="font-size:12px">${esc(l.d)}</span>`:''}</span><span class="stamp ${l.s==='OK'?'st-done':l.s==='KO'?'st-miss':l.s==='…'?'st-run':'st-due'}">${l.s==='…'?'en cours':l.s}</span></div>`).join('');
  openSheet(`<div class="grab"></div><span class="lbl">Diagnostic · ${D.done?'terminé en '+nf(D.ms/1000,1)+' s':'en cours…'}</span><h2>Test de l’application</h2>
   ${D.done?`<div class="kv" style="grid-template-columns:repeat(3,1fr)"><div><span class="lbl">OK</span><b style="color:var(--money)">${D.lines.filter(l=>l.s==='OK').length}</b></div><div><span class="lbl">À voir</span><b style="color:var(--warn)">${D.lines.filter(l=>l.s==='!!').length}</b></div><div><span class="lbl">Échecs</span><b style="color:var(--bad)">${D.lines.filter(l=>l.s==='KO').length}</b></div></div>
   <button class="btn" data-act="diagCopy">${ic('check')} Copier le rapport</button>`:`<div class="row" style="justify-content:center"><span class="spin"></span><span class="muted">${esc(D.cur||'')}</span></div><p class="muted" style="font-size:12.5px;text-align:center">Garde l’app ouverte jusqu’à la fin (environ 20 à 40 s).</p>`}
   <section class="card" style="gap:0;padding-block:8px">${lines}</section>
   ${D.done?`<textarea id="diagOut" class="ans" readonly style="min-height:160px;font-family:var(--f-num);font-size:11.5px">${esc(D.report)}</textarea><button class="btn" data-act="diagCopy">${ic('check')} Copier le rapport</button><button class="btn ghost" data-act="close">Fermer</button>`:''}`,'diag');
}
async function runDiag(){
  if(DIAG&&!DIAG.done)return;const D=DIAG={lines:[],done:false,t0:performance.now()};let hidden=false;
  const onVis=()=>{if(document.hidden)hidden=true};document.addEventListener('visibilitychange',onVis);
  const add=(n,st,d)=>{D.lines.push({n,s:st,d:d||''});if(sheetName==='diag')diagSheet()};
  const step=async(n,fn)=>{D.cur=n;const L={n,s:'…',d:''};D.lines.push(L);if(sheetName==='diag')diagSheet();const t=performance.now();
    try{const r=await Promise.race([fn(),new Promise((_,j)=>setTimeout(()=>j(new Error('délai dépassé (25 s)')),25000))]);L.s=r&&r.s||'OK';L.d=r&&r.d&&/ms$/.test(r.d)?r.d:(r&&r.d?r.d+' · ':'')+`${Math.round(performance.now()-t)} ms`}
    catch(e){L.s='KO';L.d=`${e&&e.name&&e.name!=='Error'?e.name+': ':''}${e&&e.message||e} · ${Math.round(performance.now()-t)} ms`}
    if(sheetName==='diag')diagSheet();return L};
  const timed=async(u,o,ms=20000)=>{const c=new AbortController();const to=setTimeout(()=>c.abort(),ms);const t=performance.now();try{const r=await fetch(u,Object.assign({signal:c.signal,cache:'no-store'},o||{}));let body='';try{body=await r.text()}catch(e){}return{r,body,ms:Math.round(performance.now()-t)}}finally{clearTimeout(to)}};
  diagSheet();
  // 1. environnement
  const ua=navigator.userAgent,ios=(ua.match(/OS (\d+)_(\d+)/)||[]).slice(1).join('.');
  add('Version de l’app','OK',`${APP_VERSION} · iOS ${ios||'?'} · ${window.navigator.standalone?'écran d’accueil':'Safari'} · ${innerWidth}×${innerHeight} · ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  add('Connexion','' + (navigator.onLine?'OK':'KO'),navigator.onLine?'en ligne':'hors ligne');
  let lsOK=false;try{localStorage.setItem('cadence.t','1');lsOK=localStorage.getItem('cadence.t')==='1';localStorage.removeItem('cadence.t')}catch(e){}
  const size=(()=>{try{return Math.round((localStorage.getItem(LS)||'').length/1024)}catch(e){return-1}})();
  add('Stockage local',lsOK?'OK':'KO',`données ${size} Ko${size>3000?' (gros, pense à exporter)':''}`);
  let hasK=false;try{hasK=!!localStorage.getItem('cadence.key')}catch(e){}
  add('Clé de déchiffrement (lien #k=)',hasK?'OK':'KO',hasK?'présente':'absente : rouvre le lien complet');
  // 2. fichiers GitHub
  await step('GitHub · version publiée',async()=>{const x=await timed('version.json?t='+Date.now());if(!x.r.ok)throw new Error('HTTP '+x.r.status);const v=JSON.parse(x.body).v;return{s:vNewer(v,APP_VERSION)?'!!':'OK',d:`en ligne ${v} · installée ${APP_VERSION}${vNewer(v,APP_VERSION)?' → force la mise à jour':''} · ${x.ms} ms`}});
  for(const f of ['agenda.enc.json','state.enc.json','secrets.enc.json'])await step('Fichier chiffré · '+f,async()=>{const o=await decFile(f);return{d:f==='agenda.enc.json'?`planning jusqu’au ${o.to}, ${o.shifts.length} services`:f==='secrets.enc.json'?`clé IA ${o.gkey?'présente':'absente'}`:`profil ${o.profile&&o.profile.name?'ok':'?'}`}});
  // 3. IA
  const pv=aiProv(),k=apiKey();
  add('Fournisseur IA',k?'OK':'KO',`${pv} · clé ${k?k.slice(0,4)+'… ('+k.length+' caractères)':'absente'}${SAMPLE&&SAMPLE_IMG?' · IA Claude de l’app disponible':''}`);
  const tiny={contents:[{role:'user',parts:[{text:'Réponds uniquement {"ok":1}'}]}]};
  let best=null;
  if(pv==='gemini'&&k){
    const G='https://generativelanguage.googleapis.com/v1beta/models';
    let flash=[];
    await step('Gemini · liste des modèles (clé dans l’en-tête)',async()=>{const x=await timed(G+'?pageSize=200',{headers:{'x-goog-api-key':k}});
      if(!x.r.ok)throw new Error('HTTP '+x.r.status+' '+x.body.slice(0,180));const ms=(JSON.parse(x.body).models||[]).map(m=>m.name.replace('models/','')).filter(n=>/flash/.test(n)&&!/(tts|image|audio|live|embed|native)/.test(n));
      flash=ms;return{d:`${ms.length} modèles Flash : ${ms.slice(-8).join(', ')} · ${x.ms} ms`}});
    if(D.lines[D.lines.length-1].s==='KO')await step('Gemini · liste des modèles (clé dans l’URL)',async()=>{const x=await timed(G+'?pageSize=50&key='+encodeURIComponent(k));if(!x.r.ok)throw new Error('HTTP '+x.r.status+' '+x.body.slice(0,180));return{s:'!!',d:'marche seulement avec la clé dans l’URL'}});
    const cands=[...new Set(['gemini-flash-lite-latest',...flash.filter(n=>/lite/.test(n)&&!/preview|exp/.test(n)).reverse(),'gemini-flash-latest'])].slice(0,4);
    const working=[];
    for(const m of cands){
      const L=await step(`Gemini · texte · ${m}`,async()=>{const body=JSON.parse(JSON.stringify(tiny));body.generationConfig={maxOutputTokens:30,temperature:0};
        const x=await timed(`${G}/${m}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':k},body:JSON.stringify(body)},8000);
        if(!x.r.ok)throw new Error('HTTP '+x.r.status+' '+x.body.replace(/\s+/g,' ').slice(0,160));return{s:x.ms>3000?'!!':'OK',d:`${x.ms} ms`}});
      if(L.s!=='KO'&&/lite/.test(m))working.push({m,ms:+(L.d.match(/(\d+) ms/)||[])[1]||9999});
    }
    // secours rangés du plus rapide au plus lent (mesuré), mémorisés pour les prochains repas
    working.sort((a,b)=>a.ms-b.ms);best=working[0]||null;const msOf=m=>{const w=working.find(x=>x.m===m);return w?` (${w.ms} ms)`:''};
    if(working.length){GEM_MODELS=[...new Set([...working.map(x=>x.m),...GEM_MODELS])].slice(0,3);try{localStorage.setItem('cadence.gmodels',JSON.stringify(GEM_MODELS))}catch(e){}}
    if(best){
      let data='';try{const cv=document.createElement('canvas');cv.width=640;cv.height=480;const x=cv.getContext('2d');x.fillStyle='#e8e2d6';x.fillRect(0,0,640,480);x.fillStyle='#fff';x.beginPath();x.arc(320,240,200,0,7);x.fill();x.fillStyle='#c8963c';x.fillRect(200,170,140,90);x.fillStyle='#3a8a3a';x.beginPath();x.arc(400,280,60,0,7);x.fill();x.fillStyle='#f0e0b0';x.beginPath();x.arc(300,320,55,0,7);x.fill();
      data=cv.toDataURL('image/jpeg',.72).split(',')[1]}catch(e){add('Génération de la photo test','KO',e.message)}
      if(data)for(let i=0;i<2;i++)await step(`Gemini · photo test ${i+1}/2 (${Math.round(data.length*.75/1024)} Ko) · ${best.m}`,async()=>{const gc={temperature:.2,maxOutputTokens:400,responseMimeType:'application/json'};
        const t=performance.now();const r=await timed(`${G}/${best.m}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':k},body:JSON.stringify({contents:[{role:'user',parts:[{inline_data:{mime_type:'image/jpeg',data}},{text:'Décris ce plat. JSON {"plat":"","kcal":0}'}]}],generationConfig:gc})});
        if(!r.r.ok)throw new Error('HTTP '+r.r.status+' '+r.body.slice(0,200));let txt='';try{txt=(JSON.parse(r.body).candidates[0].content.parts||[]).map(p=>p.text||'').join('')}catch(e){}
        return{s:r.ms>5000?'!!':'OK',d:`${r.ms} ms · réponse : ${txt.replace(/\s+/g,' ').slice(0,80)}`}});
      try{if(/lite/.test(best.m))localStorage.setItem('cadence.gmodel',best.m)}catch(e){}
      add('Modèle retenu pour tes repas','OK',`${GEM_MODELS[0]}${msOf(GEM_MODELS[0])} · secours : ${GEM_MODELS.slice(1,3).map(m=>m+msOf(m)).join(', ')}`);
    }else add('Modèle Gemini utilisable','KO','aucun modèle n’a répondu');
  }
  if(pv==='claude'&&k)await step('Claude · texte · '+aiModel(),async()=>{const x=await timed('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':k,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:aiModel(),max_tokens:20,messages:[{role:'user',content:'Réponds OK'}]})});if(!x.r.ok)throw new Error('HTTP '+x.r.status+' '+x.body.slice(0,200));return{s:x.ms>3000?'!!':'OK',d:x.ms+' ms'}});
  // 4. fonctions de l'iPhone
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  add('Dictée vocale',SR?'OK':'!!',SR?'disponible':'indisponible (le micro du clavier reste possible)');
  add('Appareil photo (prise de photo)','OK','champ photo natif');
  add('Micro (mode chevet)',navigator.mediaDevices&&navigator.mediaDevices.getUserMedia?'OK':'!!',navigator.mediaDevices?'disponible':'indisponible');
  add('Écran toujours allumé',navigator.wakeLock?'OK':'!!',navigator.wakeLock?'disponible':'indisponible');
  add('Son (alarmes)',(window.AudioContext||window.webkitAudioContext)?'OK':'KO','');
  add('Chiffrement',crypto&&crypto.subtle?'OK':'KO','');
  // 5. logique de l'app
  await step('Calculs de la journée',async()=>{const t=today(),T=dayTasks(t),st=dayStats(t),tg=targets();return{s:st.fixed?'!!':'OK',d:`${T.length} éléments · éveil ${hm(st.wake)} → ${hm(st.bed)}${S.wakeOv[t]!=null?' (réveil modifié)':''}${S.bedOv[t]!=null?' (coucher modifié '+hm(S.bedOv[t])+')':''}${st.fixed?' · coucher incohérent ignoré':''} · travail ${durTxt(st.work)} · trajets ${durTxt(st.trips)} · libre ${durTxt(st.free)} · cible ${tg.kcal} kcal / ${tg.prot} g prot.`}});
  await step('Planning de travail',async()=>{const W=workBlocks(today());const A=S.agenda;return{s:A&&A.to<today()?'!!':'OK',d:`source ${W.src}${A?' · agenda jusqu’au '+A.to:' · pas d’agenda'}`}});
  await step('Programme sport',async()=>{const w=weekOf(today());const nd=nextSessionDate(today());return{d:`semaine ${w} · prochaine séance ${nd||'?'}`}});
  add('Données',"OK",`${Object.values(S.meals||{}).reduce((a,x)=>a+x.length,0)} repas · ${S.ledger.length} lignes de cagnotte · ${(S.nights||[]).length} nuits · ${S.custom.length} tâches perso`);
  add('Arrière-plan pendant le test',hidden?'!!':'OK',hidden?'l’app est passée en arrière-plan : certains tests ont pu échouer':'non');
  document.removeEventListener('visibilitychange',onVis);
  D.ms=performance.now()-D.t0;D.done=true;
  const st=l=>l.s==='OK'?'[OK]':l.s==='KO'?'[ÉCHEC]':'[À VOIR]';
  D.report=[`RAPPORT CADENCE · ${fmtDate(new Date())} ${clock(Date.now())} · durée ${nf(D.ms/1000,1)} s`,`UA: ${ua}`,'',...D.lines.map(l=>`${st(l)} ${l.n}${l.d?' — '+l.d:''}`),'','JOURNAL (dernières entrées) :',...LOGS.slice(-25)].join('\n');
  logE('test',`diagnostic terminé : ${D.lines.filter(l=>l.s==='KO').length} échec(s)`);
  if(sheetName==='diag')diagSheet();
}


/* ---------- RÉGLAGES ---------- */
let rstConfirm=false;
/* ---------- mise à jour de l'app ---------- */
const APP_VERSION='2026-11-01.0355';let REMOTE_V=null,upChecking=false;
async function checkUpdate(){try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return null;REMOTE_V=await r.json();return REMOTE_V}catch(e){return null}}
const vNewer=(a,b)=>String(a).localeCompare(String(b),'en',{numeric:true})>0;
const hasUpdate=()=>!!(REMOTE_V&&REMOTE_V.v&&vNewer(REMOTE_V.v,APP_VERSION));
function forceUpdate(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}toast('Mise à jour…');setTimeout(()=>location.replace(location.pathname+'?v='+Date.now()+location.hash),300)}
/* Réglages en parties séparées : sec(icône, couleur, titre, contenu). La clé IA est repliée tant qu'elle marche. */
let SETAI=false;
function settingsSheet(checked){if(!checked&&!upChecking){upChecking=true;checkUpdate().then(()=>{upChecking=false;if(sheetName==='settings')settingsSheet(true)})}
  const s=S.settings,p=S.profile,k=apiKey(),note=t=>`<p class="muted set-note">${t}</p>`;
  const tog=(k,l,d)=>`<button class="ing" data-act="setTog" data-v="${k}" style="grid-template-columns:1fr auto"><span class="nm">${l}<small>${d}</small></span><span class="ck ${s[k]?'on':''}">${s[k]?ic('check'):''}</span></button>`;
  const sec=(icon,kind,title,body,id)=>`<section class="card set-sec k-${kind}" data-sec="${id}"><div class="set-h"><span class="set-i">${ic(icon)}</span><h3>${title}</h3></div>${body}</section>`;
  openSheet(`<div class="grab"></div><h2>Réglages</h2>
  ${sec('perso','pts','Profil',`<div class="flat row between"><span><b>${esc(p.name||'Toi')}</b>${p.weight?` · ${nf(p.weight,p.weight%1?1:0)} kg${p.goal?` → objectif ${nf(p.goal,0)} kg`:''}`:''}</span></div>
    <button class="btn ghost" data-act="reonboard">Modifier mon profil et mon programme</button>`,'profil')}
  ${sec('jour','work','Affichage et alarmes',`<div class="seg">${[['auto','Auto'],['light','Jour'],['dark','Nuit']].map(([k,l])=>`<button class="${s.theme===k?'on':''}" data-act="theme" data-v="${k}">${l}</button>`).join('')}</div>
    <div>${tog('sound','Son d’alarme','Sonne dans l’app quand un pointage est dû (app ouverte).')}</div>`,'affichage')}
  ${sec('repas','meal','Repas',`<div class="seg"><button class="${p.omad?'on':''}" data-act="omad" data-v="1">OMAD · 1 repas</button><button class="${!p.omad?'on':''}" data-act="omad" data-v="0">Plusieurs repas</button></div>
    ${p.omad?`<div class="field"><span class="lbl">Heure de ton repas</span>${stepper('PF','omadTime',15,600,1320,'time')}</div><div class="chips">${[30,60,90,120].map(v=>`<button class="chip sm ${(p.omadWin||60)===v?'on':''}" data-act="omadWin" data-v="${v}">Fenêtre ${durTxt(v)}</button>`).join('')}</div>${note(`Si ton travail tombe à cette heure, la fenêtre se décale toute seule sur le créneau libre le plus proche. Repas à l’heure : ${M$(OMAD_PTS,false)}, en retard : ${M$(OMAD_PTS/2,false)}.`)}`:''}`,'repas')}
  ${sec('cagnotte','money','Pointage et cagnotte',`<div>${tog('ai','Vérification de la salle par l’IA','La photo doit montrer une salle de sport. Sinon : simple contrôle de luminosité.')}${tog('malus','Malus si non validé','Une tâche marquée pas fait, ou non validée le lendemain, retire sa somme de la cagnotte.')}</div>`,'pointage')}
  ${sec('cam','sport','Analyse photo (IA)',`<div class="flat row between"><span>${aiProv()==='gemini'?'Gemini':'Claude'} · ${k?'clé enregistrée':'aucune clé'}</span><span class="stamp ${k?'st-done':'st-up'}">${k?'Active':'Inactive'}</span></div>
    ${k&&!SETAI?`<button class="btn ghost sm" data-act="setAi">Changer de fournisseur ou de clé</button>`:keySetup()}`,'ia')}
  ${sec('agenda','work','Agenda',`<label for="icsIn" class="btn ghost">${ic('agenda')} Importer un agenda (.ics)</label>${note(`${S.ics.length?`${S.ics.length} événements importés. `:''}Exporte ton planning en .ics (Google Agenda, Outlook, appli RH) puis choisis le fichier ici : les événements des 60 prochains jours deviennent des tâches à pointer.`)}`,'agenda')}
  ${sec('disk','trip','Tes données',`<div class="row" style="gap:8px"><button class="btn ghost sm" style="flex:1" data-act="bkExport">Exporter</button><label for="bkIn" class="btn ghost sm" style="flex:1">Importer</label></div>
    ${note(`Tes données vivent sur ce téléphone, dans Safari. Exporte une sauvegarde de temps en temps (elle va dans l’app Fichiers). ${UID?'Elles sont aussi synchronisées dans ton espace privé Claude.':''} Les selfies ne sont jamais enregistrés.`)}`,'donnees')}
  ${sec('gear','trip','Application',`<div class="flat row between"><span>Version <span class="num">${APP_VERSION}</span></span>${hasUpdate()?`<span class="stamp st-done">Nouvelle : ${esc(REMOTE_V.v)}</span>`:REMOTE_V?'<span class="stamp st-up">À jour</span>':''}</div>
    ${hasUpdate()&&REMOTE_V.notes?`<p style="font-size:13.5px">${esc(REMOTE_V.notes)}</p>`:''}
    <div class="row" style="gap:8px"><button class="btn sm ${hasUpdate()?'':'ghost'}" style="flex:1" data-act="forceUpdate">Forcer la mise à jour</button><button class="btn ghost sm" style="flex:1" data-act="diag">Tester l’application</button></div>
    ${note('« Forcer la mise à jour » recharge la dernière version publiée. Tes données restent sur le téléphone.')}`,'app')}
  <section class="set-danger" data-sec="reset">${rstConfirm?`<p class="set-note">Tout ton historique, ta cagnotte et tes réglages seront effacés de ce téléphone.</p><div class="row" style="gap:8px"><button class="btn danger" style="flex:1" data-act="resetDo">Tout effacer</button><button class="btn ghost" style="flex:1" data-act="resetCancel">Annuler</button></div>`:`<button class="btn danger" data-act="reset">Réinitialiser l’application</button>`}</section>`,'settings')}
Object.assign(ACT,{setAi:()=>{SETAI=true;settingsSheet()}});

/* ---------- ONBOARDING ---------- */
let OB=null;
const OB_STEPS=['Toi','Corps','Quotidien','Sport','Alimentation','Cagnotte','Ton plan'];
function renderOnboarding(){
  if(!OB)OB=JSON.parse(JSON.stringify(S.profile));
  const s=V.obStep,o=OB;const c=(k,v,l,num)=>`<button class="chip ${String(o[k])===String(v)?'on':''}" data-act="pick" data-o="OB" data-k="${k}" data-v="${v}" ${num?'data-n="1"':''}>${l}</button>`;
  const m=(k,v,l)=>`<button class="chip ${(o[k]||[]).includes(v)?'on':''}" data-act="tog" data-o="OB" data-k="${k}" data-v="${v}" ${typeof v==='number'?'data-n="1"':''}>${l}</button>`;
  let body='';
  if(s===0)body=`<h1>Bienvenue sur Cadence</h1><p class="muted">Quelques questions pour construire ton planning, ton programme sport, ton alimentation et ta cagnotte. Tout se fait en touchant, presque rien à écrire.</p>
    <div class="field"><span class="lbl">Prénom</span><input id="obName" value="${esc(o.name)}" placeholder="Ton prénom" autocomplete="given-name" style="border:1.5px solid var(--line);background:var(--surface);border-radius:14px;padding:14px;font-size:17px"></div>
    <div class="field"><span class="lbl">Sexe</span><div class="chips">${c('sex','h','Homme')}${c('sex','f','Femme')}</div></div>
    <div class="field"><span class="lbl">Date de naissance</span><input type="date" id="obBirth" value="${esc(o.birth)}" style="border:1.5px solid var(--line);background:var(--surface);border-radius:14px;padding:14px;font-size:17px;width:100%"></div>`;
  if(s===1)body=`<h1>Ton corps aujourd’hui</h1>
    <div class="field"><span class="lbl">Taille</span>${stepper('OB','height',1,140,220,'cm')}</div>
    <div class="field"><span class="lbl">Poids</span>${stepper('OB','weight',.5,40,250,'kg')}</div>
    <div class="field"><span class="lbl">Tour de taille (au nombril)</span>${o.waist?stepper('OB','waist',1,50,200,'cm'):''}<div class="chips">${c('waist',0,'Je ne sais pas',1)}${!o.waist?c('waist',110,'Je le mesure',1):''}</div></div>
    <div class="field"><span class="lbl">Poids visé</span>${stepper('OB','goal',1,40,200,'kg')}<p class="muted" style="font-size:13px">Un premier objectif à −15 % est réaliste en 6 à 9 mois. On l’ajuste ensuite.</p></div>
    <div class="field"><span class="lbl">Rythme</span><div class="chips">${c('pace','doux','Doux')}${c('pace','standard','Standard')}${c('pace','rapide','Soutenu')}</div></div>`;
  if(s===2)body=`<h1>Ton quotidien</h1>
    <div class="field"><span class="lbl">Réveil souhaité</span>${stepper('OB','wake',15,240,720,'time','big')}</div>
    <div class="field"><span class="lbl">Ton travail</span><div class="chips">${Object.entries(ACTIVITY).map(([k,[,l]])=>c('activity',k,l)).join('')}</div></div>
    <div class="field"><span class="lbl">Jours travaillés</span><div class="chips">${DAYS.map((d,i)=>m('workDays',i,d)).join('')}</div></div>
    <div class="row" style="gap:10px"><div class="field" style="flex:1;min-width:0"><span class="lbl">Début</span>${stepper('OB','workStart',15,240,1380,'time')}</div><div class="field" style="flex:1;min-width:0"><span class="lbl">Fin</span>${stepper('OB','workEnd',15,300,1440,'time')}</div></div>
    <div class="field"><span class="lbl">Trajet domicile → travail</span><div class="chips">${[0,15,30,45,60].map(v=>c('commute',v,v?v+' min':'Aucun',1)).join('')}</div></div>
    <p class="muted" style="font-size:13px">Ton vrai planning vient de ton agenda (synchronisé). Ces horaires ne servent que pour les semaines pas encore publiées.</p>`;
  if(s===3)body=`<h1>Ton sport</h1>
    <div class="field"><span class="lbl">Niveau en musculation</span><div class="chips">${c('exp','jamais','Jamais fait')}${c('exp','debutant','Débutant')}${c('exp','reprise','Reprise')}${c('exp','regulier','Régulier')}</div></div>
    <div class="field"><span class="lbl">Où</span><div class="chips">${c('place','salle','Salle de sport')}${c('place','maison','Maison avec haltères')}${c('place','maison0','Maison sans matériel')}</div></div>
    <div class="field"><span class="lbl">Jours d’entraînement</span><div class="chips">${DAYS.map((d,i)=>m('days',i,d)).join('')}</div><p class="muted" style="font-size:13px">3 jours non consécutifs, c’est l’idéal pour démarrer (ex. lun, mer, ven).</p></div>
    <div class="field"><span class="lbl">Heure des séances</span>${stepper('OB','sessionTime',15,300,1320,'time')}</div>
    <div class="field"><span class="lbl">Durée</span><div class="chips">${[45,60,75].map(v=>c('sessionMin',v,v+' min',1)).join('')}</div></div>
    <div class="field"><span class="lbl">Douleurs ou fragilités</span><div class="chips">${[['genoux','Genoux'],['dos','Dos'],['epaules','Épaules']].map(([k,l])=>m('injuries',k,l)).join('')}</div></div>`;
  if(s===4)body=`<h1>Ton alimentation</h1>
    <div class="field"><span class="lbl">Régime</span><div class="chips">${[['halal','Halal'],['sansporc','Sans porc'],['pescetarien','Pescétarien'],['vegetarien','Végétarien'],['sanslactose','Sans lactose']].map(([k,l])=>m('diet',k,l)).join('')}</div></div>
    <div class="field"><span class="lbl">Repas par jour</span><div class="chips">${c('meals',3,'3 repas',1)}${c('meals',4,'3 repas + collation',1)}</div></div>
    <div class="field"><span class="lbl">Budget courses par semaine</span>${stepper('OB','budget',5,20,300,'eur')}<div class="chips">${[50,70,90,120].map(v=>c('budget',v,v+' €',1)).join('')}</div></div>
    <div class="field"><span class="lbl">Magasin</span><div class="chips">${Object.entries(STORES).map(([k,[n]])=>c('store',k,n)).join('')}</div></div>
    <div class="field"><span class="lbl">Jour des grandes courses</span><div class="chips">${DAYS.map((d,i)=>c('shopDay',i,d,1)).join('')}</div></div>`;
  if(s===5)body=`<h1>Ta cagnotte</h1><p class="muted">Chaque pointage validé ajoute de l’argent à ta cagnotte. À chaque période, tu vires la somme sur ton épargne. Cet argent sert ensuite à tes récompenses.</p>
    <div class="field"><span class="lbl">Combien tu te récompenses</span><div class="chips">${[[.01,'Léger'],[.02,'Normal'],[.03,'Généreux'],[.05,'Très généreux']].map(([v,l])=>c('rate',v,l,1)).join('')}</div><p class="muted" style="font-size:13px">Séance de sport : ${eur(50*o.rate)} · repas validé : ${eur(15*o.rate)} · service de travail : ${eur(10*o.rate)}. Une très bonne journée ≈ ${eur(200*o.rate)}, soit environ ${eur(200*o.rate*7)} par semaine.</p></div>
    <div class="field"><span class="lbl">Virement vers l’épargne</span><div class="chips">${c('payout','hebdo','Chaque semaine')}${c('payout','quinzaine','Tous les 15 jours')}</div></div>
    <div class="field"><span class="lbl">Première récompense</span><div class="chips">${Object.entries(CAT).map(([k,l])=>c('firstReward',k,l)).join('')}</div><div class="chips">${[40,60,100,150].map(v=>c('firstPrice',v,v+' €',1)).join('')}</div></div>`;
  if(s===6){const save=S.profile;S.profile=o;const tg=targets();S.profile=save;
    body=`<h1>Ton plan est prêt</h1>
    <section class="card"><span class="lbl">Alimentation</span><div class="kv"><div><span class="lbl">Calories</span><b>${tg.kcal}</b></div><div><span class="lbl">Protéines</span><b>${tg.prot} g</b></div><div><span class="lbl">Perte visée</span><b>${nf(tg.lossWk,1)} kg/sem</b></div><div><span class="lbl">Objectif</span><b>${tg.weeks} sem.</b></div></div></section>
    <section class="card"><span class="lbl">Sport</span><p>${o.days.length} séances par semaine (${o.days.map(d=>DAYS[d].toLowerCase()).join(', ')}) à ${hm(o.sessionTime)}, programme de 12 semaines en 3 phases, ${o.place==='salle'?'en salle':'à la maison'}. Marche active les autres jours.</p></section>
    <section class="card"><span class="lbl">Sommeil</span><p>Réveil ${hm(o.wake)}, coucher conseillé ${hm(o.wake+1440-(o.cycles||5)*90-15)} (${o.cycles||5} cycles).</p></section>
    <section class="card"><span class="lbl">Cagnotte</span><p>Séance ${eur(50*o.rate)}, repas ${eur(15*o.rate)}, virement ${o.payout==='hebdo'?'chaque semaine':'tous les 15 jours'}.</p></section>`}
  return`<div class="ob-prog" aria-hidden="true">${OB_STEPS.map((_,i)=>`<i class="${i<=s?'on':''}"></i>`).join('')}</div><span class="lbl">Étape ${s+1} sur ${OB_STEPS.length} · ${OB_STEPS[s]}</span>${body}
  <div class="ob-nav">${s>0?`<button class="btn ghost" style="width:auto" data-act="obPrev">Retour</button>`:'<span></span>'}<button class="btn" data-act="obNext">${s===OB_STEPS.length-1?'Commencer':'Continuer'}</button></div>`;
}
function obCapture(){const n=$('#obName');if(n)OB.name=n.value.trim().slice(0,30);const b=$('#obBirth');if(b&&b.value)OB.birth=b.value}
function obFinish(){
  const first=!S.onboarded;S.profile=OB;OB=null;
  if(!S.profile.days.length)S.profile.days=[0,2,4];
  if(first){S.onboarded=true;S.since=Date.now();S.periodStart=Date.now();
    const d=new Date();S.programStart=dow(d)===0?today():ymd(addDays(d,7-dow(d)));
    S.weights=[{d:today(),kg:S.profile.weight}];
    S.rewards=[{id:'r'+Date.now(),label:CAT[S.profile.firstReward]||'Récompense',price:S.profile.firstPrice}];
  }else{const lw=S.weights[S.weights.length-1];if(!lw||lw.kg!==S.profile.weight)S.weights.push({d:today(),kg:S.profile.weight})}
  V.obStep=0;V.tab='jour';save();render();window.scrollTo(0,0);
}
