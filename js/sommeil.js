/* SOMMEIL : onglet Sommeil, mode chevet (veilleuse, 3 alarmes), écoute et analyse des nuits. Propriétaire : « Agent Sommeil ». */
/* ---------- SOMMEIL ---------- */
let SL={mode:'now',wakeAt:null};
function renderSommeil(){
  const p=S.profile,t=today(),n=nowMin();const wd=n<600?t:addDs(t,1);
  const myC=p.cycles||5,wake=wakeFor(wd),bed=wake-sleepNeed(),asleep=wake-myC*90;
  const early=wake!==p.wake;
  const nights=(S.nights||[]).filter(r=>!r.short&&r.asleep).slice(0,7).reverse().map(r=>({d:r.d,h:r.asleep/60}));
  const last=(S.nights||[])[0];
  const cyc=`<div class="cycles" aria-hidden="true" style="height:10px"><i class="lat" style="background:rgba(255,255,255,.25)"></i>${Array.from({length:myC},()=>'<i style="background:rgba(255,255,255,.55)"></i>').join('')}</div>`;
  return`<header class="top"><div class="stack" style="gap:4px"><span class="lbl">${n<600?'Cette nuit':'Ce soir'}</span><h1>Sommeil</h1></div></header>
  <section class="hero col" style="--hc:#2E2F7A;--hc2:#4B2E6E;gap:18px">
   <div class="row between" style="align-items:flex-end">
    <div class="stack" style="gap:2px"><span class="lbl">Au lit</span><span class="big" style="font-size:40px">${hm(bed)}</span></div>
    <span class="meta" style="padding-bottom:8px">${ic('arrow')}</span>
    <div class="stack" style="gap:2px;text-align:right"><span class="lbl">Réveil</span><span class="big" style="font-size:40px">${hm(wake)}</span></div></div>
   ${cyc}
   <p class="meta">Endormi vers ${hm(asleep)} · ${myC} cycles · ${nf(myC*1.5,1)} h${early?' · réveil avancé pour ton travail':''}</p>
   <button class="btn go" data-act="night" data-wake="${wake}">${ic('coucher')} Lancer le mode chevet</button>
   <button class="btn" data-act="alarms" data-bed="${bed}" data-wake="${wake}">${ic('bell')} Alarmes iPhone ${hm(wake)} · ${hm(wake+5)} · ${hm(wake+10)}</button></section>
  <section class="sec"><div class="sec-h"><h2>Mon rythme</h2></div>
   <div class="card" style="gap:12px">
    <div class="seg">${[4,5,6].map(c=>`<button class="${myC===c?'on':''}" data-act="cyc" data-v="${c}">${nf(c*1.5,1)} h</button>`).join('')}</div>
    <div class="row between"><span class="muted">Réveil habituel</span><div style="width:190px">${stepper('PF','wake',15,300,720,'time')}</div></div>
    ${myC<5?`<p class="muted" style="font-size:12.5px">6 h, c’est court pour récupérer de la musculation. Si tu es fatigué, passe à 7,5 h.</p>`:''}</div></section>
  <section class="sec"><div class="sec-h"><h2>Mes nuits</h2></div>
   <div class="card" style="gap:12px">${last?`${hypno(last)}${nightStats(last)}`:`<p class="muted" style="font-size:14px">Lance le mode chevet ce soir : demain tu verras ta nuit (phases, ronflements, réveils).</p>`}
    ${nights.length>1?`<span class="lbl" style="padding-top:6px">7 dernières nuits</span>${sleepChart(nights)}`:''}</div></section>`;
}
function sleepChart(n){
  const W=320,H=150,pl=26,pb=22,max=10,bw=(W-pl)/7;
  const y=h=>H-pb-(h/max)*(H-pb-8);
  let g='';for(const v of [0,5,7.5,10]){g+=`<line x1="${pl}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1" ${v===7.5?'stroke-dasharray="3 3"':''}/><text x="${pl-4}" y="${y(v)+3}" text-anchor="end">${v===7.5?'7,5':v}</text>`}
  n.forEach((x,i)=>{const cx=pl+i*bw+bw*.2,w=bw*.6;const c=x.h>=7?'var(--money)':x.h>=6?'var(--warn)':'var(--bad)';
    g+=`<rect x="${cx}" y="${y(x.h)}" width="${w}" height="${H-pb-y(x.h)}" rx="5" fill="${c}"/><text x="${cx+w/2}" y="${H-6}" text-anchor="middle">${DAYS[dow(parseYmd(x.d))].slice(0,2)}</text><text x="${cx+w/2}" y="${y(x.h)-4}" text-anchor="middle" style="fill:var(--ink)">${nf(x.h,1)}</text>`});
  return`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Heures de sommeil">${g}</svg>`;
}
function alarmSheet(bed,wake){
  const al=[0,5,10].map(m=>hm(wake+m));
  openSheet(`<div class="grab"></div><span class="lbl">Alarmes de secours</span><h2>Réveil ${hm(wake)}</h2>
  <p class="muted">Une page web ne peut pas régler les alarmes de l’iPhone elle-même. Mets ces 3 alarmes dans <b>Horloge → Alarmes → +</b> (20 secondes) :</p>
  <div class="chips">${al.map((t,i)=>`<button class="chip" data-act="copy" data-v="${t}">${i?'+'+i*5+' min · ':''}<span class="num">${t}</span></button>`).join('')}</div>
  <p class="muted" style="font-size:13px">Touche une heure pour la copier. Règle : tu n’éteins la dernière qu’une fois debout. Le mode chevet sonne aussi aux 3 heures, dans l’app.</p>
  <button class="btn ghost" data-act="close">Fermer</button>`);
}

/* ---------- mode chevet : veilleuse, 3 alarmes, écoute du sommeil ---------- */
let actx=null,ringT=null,nightT=null,wakeLock=null,NIGHT=null,NS=null,AU=null;
function unlockAudio(){try{if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume()}catch(e){}}
function beep(force,vol){if(!actx||(!S.settings.sound&&!force))return;const v=vol||.35;const t0=actx.currentTime;for(let i=0;i<4;i++){const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=i%2?988:784;g.gain.setValueAtTime(0,t0+i*.32);g.gain.linearRampToValueAtTime(v,t0+i*.32+.03);g.gain.linearRampToValueAtTime(0,t0+i*.32+.26);o.connect(g).connect(actx.destination);o.start(t0+i*.32);o.stop(t0+i*.32+.3)}}
function ring(){if(ringT)return;if(NIGHT)stopListening();try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}unlockAudio();let k=0;const b=()=>{beep(!!NIGHT,Math.min(.95,.3+k*.06));k++};b();ringT=setInterval(b,1800)}
function stopRing(){clearInterval(ringT);ringT=null}
function nightSheet(wake){
  if(wake!=null||!NS){const n=nowMin();NS={wake:wake!=null?wake%1440:wakeFor(n<600?today():addDs(today(),1)),listen:S.settings.nightListen!==false,motion:!!S.settings.nightMotion,dawn:S.settings.nightDawn!==false}}
  const al=[0,5,10].map(m=>hm(NS.wake+m));const p=S.profile;
  const tg=(k,l,d)=>`<button class="ing" data-act="nsTog" data-v="${k}" style="grid-template-columns:1fr auto"><span class="nm">${l}<small>${d}</small></span><span class="ck ${NS[k]?'on':''}">${NS[k]?ic('check'):''}</span></button>`;
  const html=`<div class="grab"></div><span class="lbl">Mode chevet</span><h2>Bonne nuit${p.name?', '+esc(p.name):''}</h2>
  <div class="field"><span class="lbl">Réveil</span>${stepper('NS','wake',5,180,780,'time','big')}<div class="chips">${al.map((t,i)=>`<span class="stamp ${i?'st-up':'st-run'}">${i?'+'+i*5+' min · ':'1er · '}${t}</span>`).join('')}</div></div>
  <section class="card" style="gap:0">${tg('listen','Écouter mon sommeil','Ronflements, paroles, bruits et agitation. Rien n’est enregistré : seuls des compteurs restent sur ton iPhone.')}${tg('motion','Téléphone posé sur le matelas','Détecte aussi tes mouvements avec l’accéléromètre (coin du matelas, près de l’oreiller).')}${tg('dawn','Aube douce','La veilleuse se réchauffe doucement 15 min avant le réveil.')}</section>
  <section class="flat stack" style="gap:6px"><b>Avant de dormir</b><ol class="steps" style="font-size:14px">
   <li><b>Branche</b> ton iPhone (sinon l’écran allumé + le micro consomment environ 3 à 4 % par heure).</li>
   <li>Centre de contrôle : <b>luminosité au minimum</b>.</li>
   <li>Concentration <b>Sommeil</b> ou Ne pas déranger : les alarmes sonnent quand même.</li>
   <li>Désactive le <b>mode silencieux</b> (sinon l’alarme de l’app peut rester muette).</li>
   <li><b>Ne verrouille pas</b> l’écran : verrouillé, Safari coupe le micro et l’alarme de l’app.</li></ol></section>
  <div class="field"><span class="lbl">Filet de sécurité · alarmes iPhone</span><div class="chips">${al.map(t=>`<button class="chip sm" data-act="copy" data-v="${t}">Copier <span class="num">${t}</span></button>`).join('')}</div></div>
  <button class="btn" data-act="nightGo">${ic('coucher')} Lancer · réveil ${al[0]}</button>`;
  /* déjà ouverte : on met à jour le contenu sur place (sinon l'animation d'ouverture se rejoue à chaque + / −) */
  const sh=sheetName==='night'&&document.querySelector('#sheetRoot .sheet');
  if(sh){const x=sh.querySelector('.sheet-x'),sc=sh.scrollTop;sh.innerHTML=(x?x.outerHTML:'')+html;sh.scrollTop=sc}else openSheet(html,'night');
}
async function openNight(){
  const o=NS;if(!o)return;unlockAudio();
  if(o.motion&&typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission==='function'){try{await DeviceMotionEvent.requestPermission()}catch(e){}}
  const now=new Date();let t=new Date(now);t.setHours(0,0,0,0);t.setMinutes(o.wake);if(t<=now)t=addDays(t,1);const T=t.getTime();
  S.settings.nightListen=o.listen;S.settings.nightMotion=o.motion;S.settings.nightDawn=o.dawn;
  NIGHT={alarms:[T,T+5*6e4,T+10*6e4],idx:0,ringing:false,wakeDs:ymd(t),dawn:o.dawn,show:0,dim:0,lastMin:-1,listen:o.listen,motion:o.motion,
    rec:{start:Date.now(),bins:[],wake:T},cur:{s:0,t:0,mv:0,n:0,mo:0,sum:0,k:0},stars:Array.from({length:26},()=>[Math.random()*100,Math.random()*62,Math.random()<.2?.9:.5])};
  S.nightLive=NIGHT.rec;save();
  try{wakeLock=await navigator.wakeLock?.request('screen')}catch(e){wakeLock=null}
  if(o.listen)startListening();if(o.motion)startMotion();
  closeSheet();drawNight();clearInterval(nightT);nightT=setInterval(nightTick,1000);
}
function nightTick(){
  if(!NIGHT)return;const n=Date.now(),d=new Date(n);
  if(NIGHT.idx<3&&!NIGHT.ringing&&n>=NIGHT.alarms[NIGHT.idx]){NIGHT.ringing=true;ring();drawNight();return}
  const m=d.getHours()*60+d.getMinutes();
  if(m!==NIGHT.lastMin){NIGHT.lastMin=m;pushBin();drawNight();return}
  if(NIGHT.show&&n>NIGHT.show){NIGHT.show=0;drawNight()}
}
function pushBin(){const c=NIGHT.cur;if(c.k||NIGHT.rec.bins.length||!NIGHT.listen){NIGHT.rec.bins.push({a:c.k?Math.round(c.sum/c.k):0,s:c.s,t:c.t,mv:c.mv,n:c.n,mo:Math.min(99,c.mo)})}
  NIGHT.cur={s:0,t:0,mv:0,n:0,mo:0,sum:0,k:0};if(NIGHT.rec.bins.length%10===0){S.nightLive=NIGHT.rec;save()}}
function drawNight(){
  if(!NIGHT)return;const n=Date.now(),d=new Date(n);const A=NIGHT.alarms;const next=A[Math.min(NIGHT.idx,2)];const left=next-n;
  const shift=`translate(${((d.getMinutes()*7)%17)-8}px,${((d.getMinutes()*11)%13)-6}px)`;
  let bg='#000';if(NIGHT.dawn&&!NIGHT.ringing&&left<15*6e4&&left>0){const f=1-left/(15*6e4);bg=`rgb(${Math.round(42*f)},${Math.round(20*f)},${Math.round(8*f)})`}
  const dimOp=[1,.55,.3][NIGHT.dim];const show=NIGHT.show>n;
  const lst=NIGHT.listen?(AU?`<i></i> Écoute du sommeil${NIGHT.cnt?` · ${NIGHT.cnt} sons notés`:''}`:NIGHT.listenErr?'Micro refusé : pas d’analyse cette nuit':'Démarrage du micro…'):'';
  $('#nightRoot').innerHTML=`<div class="night ${NIGHT.ringing?'ring':''}" style="${NIGHT.ringing?'':'background:'+bg}" data-act="nightTap">
   ${NIGHT.ringing?'':`<div class="sky">${NIGHT.stars.map(([x,y,o])=>`<span class="star" style="left:${x}%;top:${y}%;opacity:${o*dimOp}"></span>`).join('')}</div>`}
   <div class="content" style="opacity:${NIGHT.ringing?1:dimOp};transform:${NIGHT.ringing?'none':shift}">
    ${NIGHT.ringing?'':'<div class="moon"></div>'}
    <div class="nclock">${pad(d.getHours())}:${pad(d.getMinutes())}</div>
    <p class="nsub">${NIGHT.ringing?(NIGHT.idx<2?'C’est l’heure. Lève-toi et pointe ton réveil.':'Dernière alarme. Debout !'):`Réveil ${A.map(x=>clock(x)).join(' · ')}${left<12*36e5?` · dans ${Math.floor(left/36e5)} h ${pad(Math.floor(left%36e5/6e4))}`:''}`}</p>
    ${NIGHT.ringing?'':`<p class="nlisten">${lst}</p>`}
   </div>
   ${NIGHT.ringing?`<div class="ctl"><button class="nbtn go" data-act="nightUp">Je suis levé</button>${NIGHT.idx<2?`<button class="nbtn" data-act="snooze">5 minutes de plus (alarme ${NIGHT.idx+2}/3)</button>`:''}</div>`:
    show?`<div class="ctl"><button class="nbtn" data-act="nightDim">Atténuer encore (${NIGHT.dim+1}/3)</button>${NIGHT.listen?`<button class="nbtn" data-act="nightMute">Arrêter l’écoute</button>`:''}<button class="nbtn" data-act="nightOff">Terminer la nuit</button></div>`:''}
  </div>`;
}
/* écoute : bandes de fréquences, rien n'est enregistré */
async function startListening(){
  try{const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    if(!NIGHT){stream.getTracks().forEach(t=>t.stop());return}
    unlockAudio();const src=actx.createMediaStreamSource(stream);const an=actx.createAnalyser();an.fftSize=2048;an.smoothingTimeConstant=0;src.connect(an);
    AU={stream,src,an,buf:new Float32Array(an.frequencyBinCount),fl:null,ev:null,lastSnore:0};AU.timer=setInterval(audioFrame,250);NIGHT.cnt=0;drawNight();
  }catch(e){if(NIGHT){NIGHT.listenErr=true;drawNight()}}
}
function stopListening(){if(!AU)return;clearInterval(AU.timer);try{AU.src.disconnect();AU.stream.getTracks().forEach(t=>t.stop())}catch(e){}AU=null}
function audioFrame(){
  if(!AU||!NIGHT)return;const{an,buf}=AU;an.getFloatFrequencyData(buf);const hz=an.context.sampleRate/an.fftSize;
  const band=(a,b)=>{let s=0,k=0;for(let i=Math.max(1,Math.floor(a/hz));i<=Math.min(buf.length-1,Math.floor(b/hz));i++){s+=Math.pow(10,buf[i]/10);k++}return 10*Math.log10(s/Math.max(1,k)+1e-14)};
  const v=[band(60,400),band(400,2500),band(2500,8000)];
  if(!AU.fl)AU.fl=v.slice();for(let i=0;i<3;i++){const r=v[i]<AU.fl[i]?.08:.0015;AU.fl[i]+=(v[i]-AU.fl[i])*r}
  const rel=v.map((x,i)=>x-AU.fl[i]);const top=Math.max(...rel);const c=NIGHT.cur;c.sum+=Math.max(0,top);c.k++;
  if(top>9){const e=AU.ev||(AU.ev={f:0,r:[0,0,0]});e.f++;for(let i=0;i<3;i++)e.r[i]+=rel[i];if(e.f>=40){classify(e);AU.ev=null}}
  else if(AU.ev){classify(AU.ev);AU.ev=null}
}
function classify(e){
  const d=e.f*.25,[lo,mi,hi]=e.r.map(x=>x/e.f),c=NIGHT.cur;let k;
  if(d>=.4&&d<=3.5&&lo>mi+3&&lo>hi+5)k='s';else if(d>=.5&&mi>=lo-2&&mi>hi+2)k='t';else if(hi>=mi-3&&d<=8)k='mv';else k='n';
  if(k==='s'){const n=Date.now();if(n-AU.lastSnore<10000)c.s++;AU.lastSnore=n}else c[k]++;
  NIGHT.cnt=(NIGHT.cnt||0)+1;
}
function startMotion(){let last=null,lt=0;NIGHT.motionH=e=>{const n=Date.now();if(n-lt<200)return;lt=n;const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;
  if(last){const dd=Math.abs(a.x-last.x)+Math.abs(a.y-last.y)+Math.abs(a.z-last.z);if(dd>.3&&NIGHT)NIGHT.cur.mo++}last={x:a.x,y:a.y,z:a.z}};window.addEventListener('devicemotion',NIGHT.motionH)}
function stopMotion(){if(NIGHT&&NIGHT.motionH)window.removeEventListener('devicemotion',NIGHT.motionH)}
function analyzeNight(rec,end){
  const B=rec.bins;const total=Math.round((end-rec.start)/6e4);
  if(B.length<30)return{d:ymd(new Date(rec.start)),start:rec.start,end,total,short:true};
  const act=B.map(b=>b.mv*2+b.t*2+b.n+Math.min(6,b.mo/4)+(b.a>8?1:0));
  let on=B.findIndex((_,i)=>i+10<=B.length&&act.slice(i,i+10).every(x=>x<=1));if(on<0)on=0;
  const ph=B.map((_,i)=>{if(i<on)return'w';if(act[i]>=4)return'w';const w=act.slice(Math.max(on,i-7),i+8);return w.reduce((s,x)=>s+x,0)/w.length<.12?'d':'l'});
  let awak=0;for(let i=on+1;i<ph.length;i++)if(ph[i]==='w'&&ph[i-1]!=='w'&&ph[i+1]==='w')awak++;
  const asleep=ph.filter(x=>x!=='w').length,deep=ph.filter(x=>x==='d').length;
  const ph5=[];const sn5=[];for(let i=0;i<ph.length;i+=5){const seg=ph.slice(i,i+5);const c={w:0,l:0,d:0};seg.forEach(x=>c[x]++);ph5.push(c.w>=2?'w':c.d>=3?'d':'l');sn5.push(B.slice(i,i+5).reduce((s,b)=>s+b.s,0))}
  const sum=k=>B.reduce((s,b)=>s+(b[k]||0),0);const eff=asleep/Math.max(1,B.length);
  const score=Math.round(clamp(100*(Math.min(asleep/450,1)*.55+eff*.3+(1-Math.min(awak/6,1))*.15),0,100));
  return{d:ymd(new Date(rec.start)),start:rec.start,end,total,latency:on,asleep,deep,awake:B.length-asleep,awak,snoreMin:B.filter(b=>b.s>=2).length,talk:sum('t'),moves:sum('mv')+Math.round(sum('mo')/8),noise:sum('n'),score,ph5:ph5.join(''),sn5};
}
function finishNight(){
  if(!NIGHT)return null;pushBin();stopRing();stopListening();stopMotion();clearInterval(nightT);try{wakeLock&&wakeLock.release()}catch(e){}wakeLock=null;
  const r=analyzeNight(NIGHT.rec,Date.now());S.nights=[r,...(S.nights||[]).filter(x=>x.start!==r.start)].slice(0,30);S.nightLive=null;save();
  const info={key:NIGHT.wakeDs+':reveil',r};NIGHT=null;$('#nightRoot').innerHTML='';return info;
}
function hypno(r){
  if(!r||r.short||!r.ph5)return'';const W=320,H=120,pl=46,n=r.ph5.length,bw=(W-pl-4)/Math.max(1,n);const Y={w:14,l:46,d:78};
  let g=`<text x="0" y="${Y.w+4}">Éveil</text><text x="0" y="${Y.l+4}">Léger</text><text x="0" y="${Y.d+4}">Profond</text>`;
  for(const k in Y)g+=`<line x1="${pl}" x2="${W}" y1="${Y[k]}" y2="${Y[k]}" stroke="var(--line)"/>`;
  let path='';[...r.ph5].forEach((p,i)=>{const x=pl+i*bw;path+=(i?'L':'M')+x.toFixed(1)+','+Y[p]+'L'+(x+bw).toFixed(1)+','+Y[p]});
  g+=`<path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linejoin="round"/>`;
  r.sn5.forEach((v,i)=>{if(v>=3)g+=`<rect x="${(pl+i*bw).toFixed(1)}" y="92" width="${Math.max(1.5,bw-1).toFixed(1)}" height="8" rx="2" fill="var(--warn)"/>`});
  g+=`<text x="${pl}" y="${H-4}">${clock(r.start)}</text><text x="${W}" y="${H-4}" text-anchor="end">${clock(r.end)}</text><text x="${(pl+W)/2}" y="${H-4}" text-anchor="middle" style="fill:var(--warn)">ronflements</text>`;
  return`<svg class="chart hyp" viewBox="0 0 ${W} ${H}" role="img" aria-label="Phases de sommeil estimées">${g}</svg>`;
}
function nightStats(r){
  if(r.short)return`<p class="muted">Nuit trop courte pour une analyse (moins de 30 min d’écoute).</p>`;
  return`<div class="tiles"><div class="tile tint k-work"><span class="lbl">Score</span><b>${r.score}/100</b></div><div class="tile tint k-free"><span class="lbl">Sommeil</span><b>${durTxt(r.asleep)}</b></div><div class="tile tint k-sport"><span class="lbl">Réveils</span><b>${r.awak}</b></div></div>
  <p class="muted" style="font-size:13px">Endormi en ${r.latency} min · profond ${durTxt(r.deep)} · ronflements ${r.snoreMin} min${r.talk?' · '+r.talk+' paroles':''} · ${r.moves} mouvements. Estimation, pas un examen médical.</p>
  ${r.snoreMin>=30?`<p style="font-size:13px;color:var(--warn)">Beaucoup de ronflements : si ça se répète et que tu es fatigué, parles-en à ton médecin.</p>`:''}`;
}
function lastNightCard(){const r=(S.nights||[])[0];if(!r)return`<section class="card"><h3>Analyse du sommeil</h3><div class="empty">Lance le mode chevet avec l’écoute : demain matin, tu verras tes phases de sommeil, tes ronflements et tes réveils ici.</div></section>`;
  return`<section class="card"><div class="row between"><h3>Dernière nuit analysée</h3><span class="muted num" style="font-size:13px">${fmtShort(new Date(r.start))}</span></div>${hypno(r)}${nightStats(r)}</section>`}
function nightReport(r,key){openSheet(`<div class="grab"></div><span class="lbl">Ta nuit · ${clock(r.start)} → ${clock(r.end)}</span><h2>${r.short?'Nuit terminée':r.score>=75?'Bonne nuit de récupération':r.score>=55?'Nuit correcte':'Nuit agitée'}</h2>${hypno(r)}${nightStats(r)}
  ${false?`<button class="btn" data-act="punch" data-k="${key}" data-w="in">${ic('check')} Pointer mon réveil</button>`:''}<button class="btn ghost" data-act="close">Fermer</button>`,'report')}
document.addEventListener('visibilitychange',async()=>{if(document.visibilityState==='visible'&&NIGHT){try{wakeLock=await navigator.wakeLock?.request('screen')}catch(e){}if(NIGHT.listen&&!AU&&!NIGHT.ringing)startListening()}});
