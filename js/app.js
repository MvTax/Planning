/* APP : gestionnaire des clics (H + registre ACT), horloge, migrations, démarrage. Chargé en dernier. Propriétaire : « Général ». */
/* ============ événements ============ */
document.addEventListener('pointerdown',unlockAudio,{passive:true});
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act,v=el.dataset.v;
  if(a==='scrim'){if(e.target===el)closeSheet();return}
  if(el.tagName==='A')return;
  const H={
   tab:()=>{closeSheet();V.tab=v;if(v==='sport')V.sportDate=null;saveView();render();window.scrollTo(0,0)},
   date:()=>{V.date=v;render()},
   task:()=>taskSheet(el.dataset.k),
   punch:()=>punchSheet(el.dataset.k,el.dataset.w),
   val:()=>valAct(el.dataset.k,v),
   showDone:()=>{V.showDone=!V.showDone;render()},
   close:()=>{closeSheet();render()},
   shift:()=>{const k=el.dataset.k;S.shifts[k]=(S.shifts[k]||0)+Number(v);save();render();taskSheet(k)},
   skip:()=>{S.skips[el.dataset.k]=1;save();closeSheet();render();toast('Retirée de cette journée')},
   delcustom:()=>{S.custom=S.custom.filter(c=>c.id!==v);save();closeSheet();render();toast('Tâche supprimée')},
   addtask:()=>{NT=null;addTaskSheet()},
   ntType:()=>{NT.type=v;NT.pts=TYPE[v][1];if(v==='sport')NT.dur=60;addTaskSheet()},
   ntSave:()=>{const ti=$('#ntTitle').value.trim();S.custom.push({id:'c'+Date.now().toString(36),type:NT.type,title:ti||TYPE[NT.type][0],start:NT.start,dur:NT.dur,pts:NT.pts,repeat:NT.repeat,date:NT.day});save();const d=NT.day;closeSheet();V.date=d;render();toast('Tâche ajoutée')},
   pick:()=>{const o=el.dataset.o;let val=el.dataset.n?Number(v):el.dataset.b?v==='1':v;if(o==='OB')obCapture();CTX[o][el.dataset.k]=val;rerenderCtx(o)},
   tog:()=>{const o=el.dataset.o;if(o==='OB')obCapture();const arr=CTX[o][el.dataset.k]||(CTX[o][el.dataset.k]=[]);const val=el.dataset.n?Number(v):v;const i=arr.indexOf(val);i>=0?arr.splice(i,1):arr.push(val);arr.sort();rerenderCtx(o)},
   st:()=>{const o=el.dataset.o,k=el.dataset.k;if(o==='OB')obCapture();const d=Number(el.dataset.d);let x=Math.round((Number(CTX[o][k])+d)*10)/10;x=clamp(x,Number(el.dataset.min),Number(el.dataset.max));CTX[o][k]=x;rerenderCtx(o)},
   workday:()=>{WO=null;planSheet(v)},
   plWk:()=>{planSheet(addDs(PLW,Number(v)))},
   woDay:()=>{WO=null;dayEditSheet(v)},
   woBack:()=>{WO=null;planSheet()},
   woSave:()=>{const o=WO;const bl=[];if(o.mode!=='off'){bl.push({s:o.s0,e:Math.max(o.e0,o.s0+15)});if(o.mode==='two')bl.push({s:Math.max(o.s1,o.e0),e:Math.max(o.e1,o.s1+15)})}
     S.workOv[o.ds]={on:bl.length>0,blocks:bl};save();const d=o.ds;WO=null;render();planSheet(d);toast('Journée réorganisée')},
   woReset:()=>{delete S.workOv[WO.ds];const d=WO.ds;WO=null;save();render();planSheet(d)},
   agSync:()=>syncAgenda(),
   settings:()=>settingsSheet(),
   theme:()=>{S.settings.theme=v;save();applyTheme();settingsSheet()},
   setTog:()=>{S.settings[v]=!S.settings[v];save();settingsSheet()},
   reonboard:()=>{closeSheet();OB=JSON.parse(JSON.stringify(S.profile));OB.weight=curWeight();V.obStep=0;V.reob=true;render();window.scrollTo(0,0)},
   reset:()=>{rstConfirm=true;settingsSheet()},resetCancel:()=>{rstConfirm=false;settingsSheet()},
   resetDo:()=>{S=defaultState();OB=null;try{localStorage.removeItem(LS)}catch(e){};save();closeSheet();render()},
   obNext:()=>{obCapture();if(V.obStep<OB_STEPS.length-1){V.obStep++;render();window.scrollTo(0,0)}else{V.reob=false;obFinish()}},
   obPrev:()=>{obCapture();V.obStep=Math.max(0,V.obStep-1);render();window.scrollTo(0,0)},
   slMode:()=>{SL.mode=v;render()},
   alarms:()=>alarmSheet(Number(el.dataset.bed),Number(el.dataset.wake)),
   slPick:()=>{alarmApply(Number(el.dataset.bed),Number(el.dataset.wake))},
   slApply:()=>{alarmApply(Number(el.dataset.bed),Number(el.dataset.wake))},
   night:()=>{NS=null;nightSheet(el.dataset.wake!=null?Number(el.dataset.wake):null)},
   nsTog:()=>{NS[v]=!NS[v];nightSheet()},
   nightGo:()=>openNight(),
   nightTap:()=>{if(NIGHT&&!NIGHT.ringing){NIGHT.show=Date.now()+8000;drawNight()}},
   nightDim:()=>{NIGHT.dim=(NIGHT.dim+1)%3;NIGHT.show=Date.now()+8000;drawNight()},
   nightMute:()=>{stopListening();stopMotion();NIGHT.listen=false;NIGHT.show=0;drawNight()},
   nightOff:()=>{const i=finishNight();render();if(i)nightReport(i.r,i.key)},
   snooze:()=>{stopRing();NIGHT.ringing=false;NIGHT.idx++;drawNight()},
   nightUp:()=>{const i=finishNight();if(!i)return;V.tab='jour';render();nightReport(i.r)},
   copy:()=>{const txt=v;const done=()=>toast(`${txt} copié`);try{navigator.clipboard.writeText(txt).then(done,()=>toast(txt))}catch(err){toast(txt)}},
   sportSub:()=>{V.sportSub=v;saveView();render()},
   sportDate:()=>{V.sportDate=v;V.sportSub='seance';render();window.scrollTo(0,0)},
   gosport:()=>{closeSheet();V.tab='sport';V.sportSub='seance';V.sportDate=v;render();window.scrollTo(0,0)},
   progWeek:()=>{V.progWeek=Number(v);render()},
   set:()=>{const k=el.dataset.k,j=Number(el.dataset.j),n=Number(el.dataset.n);const arr=S.setsDone[k]||(S.setsDone[k]=Array(n).fill(false));arr[j]=!arr[j];
     S.lifts[el.dataset.ex+'_ok']=arr.filter(Boolean).length>=n;save();render();if(arr[j]&&S.settings.sound){unlockAudio()}},
   kg:()=>{const id=v;const ex=EX[id];const cur=S.lifts[id]??ex.kg??0;S.lifts[id]=Math.max(0,cur+Number(el.dataset.d));S.lifts[id+'_ok']=false;save();render()},
   weigh:()=>weighSheet(),
   weighSave:()=>{const t=today();S.weights=S.weights.filter(w=>w.d!==t);S.weights.push({d:t,kg:WG.kg});S.weights.sort((a,b)=>a.d<b.d?-1:1);S.profile.weight=WG.kg;
     const pk=t+':pesee';if(dayTasks(t).some(x=>x.key===pk)&&!(S.punches[pk]||{}).in){S.punches[pk]={in:Date.now(),inV:'tap',inF:1};addPts(10,'Pesée du lundi',pk)}
     save();closeSheet();render();toast('Poids enregistré · cibles recalculées')},
   foodSub:()=>{V.foodSub=v;saveView();render()},
   foodDate:()=>{V.foodDate=v;render()},
   recipe:()=>recipeSheet(el.dataset.ds,el.dataset.slot),
   goshop:()=>{closeSheet();V.tab='repas';V.foodSub='courses';render();window.scrollTo(0,0)},
   shopWk:()=>{V.shopNext=v==='1';render()},
   store:()=>{S.profile.store=v;save();render()},
   ck:()=>{const wk=shopData().wk;const c=S.shopChecked[wk]||(S.shopChecked[wk]={});c[v]=!c[v];const keys=Object.keys(S.shopChecked).sort();while(keys.length>4)delete S.shopChecked[keys.shift()];save();render()},
   pay:()=>{payConfirm=true;render()},payCancel:()=>{payConfirm=false;render()},
   payDo:()=>{const e=Math.round(periodEur()*100)/100;S.payouts.push({t:Date.now(),eur:e,pts:periodPts()});S.periodStart=Date.now();payConfirm=false;save();render();toast(`${eur(e)} ajoutés à ton épargne`)},
   addReward:()=>{RW=null;rewardSheet()},
   rwSave:()=>{const l=$('#rwLabel').value.trim();S.rewards.push({id:'r'+Date.now().toString(36),label:l||CAT[RW.cat],price:RW.price});save();closeSheet();render()},
   delReward:()=>{S.rewards=S.rewards.filter(r=>r.id!==v);save();render()},
   buy:()=>{buyConfirm=v;render()},buyCancel:()=>{buyConfirm=null;render()},
   buyDo:()=>{const r=S.rewards.find(x=>x.id===v);if(r){S.spent.push({t:Date.now(),eur:r.price,label:r.label});S.rewards=S.rewards.filter(x=>x.id!==v);toast(`Profite bien : ${r.label}`)}buyConfirm=null;save();render()},
   forceUpdate:()=>forceUpdate(),
   bkExport:()=>{try{const b=new Blob([JSON.stringify(S)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`cadence-sauvegarde-${today()}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}catch(e){toast('Export impossible sur ce navigateur')}},
   meal:()=>openMeal(),
   cyc:()=>{S.profile.cycles=Number(v);save();render()},
   dayStats:()=>dayStatsSheet(),
   omad:()=>{S.profile.omad=v==='1';save();render();settingsSheet()},
   omadWin:()=>{S.profile.omadWin=Number(v);save();render();settingsSheet()},
   mealRetry:()=>{if(MEAL){MEAL.bgRetry=0;analyzeMeal()}},
   diag:()=>{if(!DIAG||DIAG.done)runDiag();else diagSheet()},
   diagCopy:()=>{const t=DIAG&&DIAG.report||'';const ok=()=>toast('Rapport copié : colle-le dans ta conversation avec Claude');
     try{navigator.clipboard.writeText(t).then(ok,()=>{const a=$('#diagOut');if(a){a.focus();a.select();a.setSelectionRange(0,t.length)}toast('Sélectionné : touche Copier')})}catch(e){const a=$('#diagOut');if(a){a.focus();a.select()}}},
   mealSlot:()=>{MEAL.slot=v;mealSheet()},
   voice:()=>toggleVoice(),
   askText:()=>{stopVoice();MEAL.askMode='text';MEAL.voiceErr='';mealSheet();setTimeout(()=>$('#ansIn')?.focus(),60)},
   askVoice:()=>{MEAL.askMode='voice';toggleVoice()},
   pickIng:()=>{const a=MEAL.picks,i=a.indexOf(v);i>=0?a.splice(i,1):a.push(v);mealSheet()},
   sendAns:()=>{const M=MEAL;stopVoice();const el=$('#ansIn');if(el)M.answer=el.value.trim();const ans=[M.picks.join(', '),M.answer].filter(Boolean).join(' · ');if(!ans){toast('Dis ou choisis au moins un ingrédient');return}M.notes.push(ans);analyzeMeal()},
   skipAns:()=>{stopVoice();MEAL.skipped=true;analyzeMeal()},
   fixIng:()=>{const M=MEAL,r=M.res||{};M.askQ='Qu’est-ce qui n’est pas juste ? Dis-moi ce qu’il y a vraiment dans ton plat.';M.askSug=(r.ing||[]).map(a=>String(a).slice(0,30)).slice(0,8);M.tries.pop();M.answer='';M.picks=[];M.askMode='voice';M.voiceErr='';M.state='ask';mealSheet()},
   keySave:()=>{const k=($('#apiKeyIn').value||'').trim(),g=aiProv()==='gemini';if(g?!/^(AIza|AQ\.)/.test(k):!/^sk-ant-/.test(k)){toast(g?'Une clé Gemini commence par AIza ou AQ.':'Une clé Claude commence par sk-ant-');return}try{localStorage.setItem(g?'cadence.gkey':'cadence.apikey',k)}catch(e){}toast('Clé enregistrée');if(sheetName==='meal'){mealSheet()}else settingsSheet()},
   aiProv:()=>{try{localStorage.setItem('cadence.ai',v)}catch(e){}sheetName==='meal'?mealSheet():settingsSheet()},
   keyDel:()=>{try{localStorage.removeItem(aiProv()==='gemini'?'cadence.gkey':'cadence.apikey')}catch(e){}toast('Clé supprimée');sheetName==='meal'?mealSheet():settingsSheet()},
   aiModel:()=>{try{localStorage.setItem('cadence.aimodel',v)}catch(e){}sheetName==='meal'?mealSheet():settingsSheet()},
   noop:()=>{}
  };
  if(ACT[a]){ACT[a](el,v,e);return}
  (H[a]||(()=>{}))();
});
function alarmApply(bed,wake){
  const t=today(),tm=addDs(t,1),now=nowMin();let wakeDay,bedRel;
  if(SL.mode==='now'){wakeDay=(wake>=1440||wake%1440<now)?tm:t;bedRel=wakeDay===tm?now:now+1440}
  else{wakeDay=(now<240&&wake>now)?t:tm;bedRel=bed+1440}
  S.wakeOv[wakeDay]=wake%1440;S.bedOv[addDs(wakeDay,-1)]=bedRel;
  save();render();alarmSheet(bed,wake%1440);
}
document.addEventListener('change',async e=>{
  if(e.target.id==='cam'){const f=e.target.files&&e.target.files[0];e.target.value='';if(f)handlePhoto(f)}
  if(e.target.id==='mealCam'){const f=e.target.files&&e.target.files[0];e.target.value='';if(f)handleMealPhoto(f)}
  if(e.target.id==='bkIn'){const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;try{const r=JSON.parse(await f.text());if(!r||!r.profile)throw 0;S=Object.assign(defaultState(),r);S.profile=Object.assign(defaultState().profile,r.profile);S.settings=Object.assign(defaultState().settings,r.settings||{});save();closeSheet();render();toast('Sauvegarde importée')}catch(err){toast('Fichier de sauvegarde invalide')}}
  if(e.target.id==='icsIn'){const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;try{const txt=await f.text();const ev=parseICS(txt);S.ics=ev;save();render();settingsSheet();toast(`${ev.length} événements importés`)}catch(err){toast('Fichier .ics illisible')}}
});
document.addEventListener('input',e=>{if(e.target.id==='ansIn'&&MEAL)MEAL.answer=e.target.value;if(e.target.id==='ntTitle'&&NT)NT.title=e.target.value;if(e.target.id==='rwLabel'&&RW)RW.label=e.target.value});
function parseICS(txt){
  const un=txt.replace(/\r?\n[ \t]/g,'');const blocks=un.split('BEGIN:VEVENT').slice(1);const out=[];const t0=addDays(new Date(),-1),t1=addDays(new Date(),60);
  const pd=s=>{const m=s.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?/);if(!m)return null;return m[7]?new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5])):new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5])};
  for(const b of blocks){const g=k=>{const m=b.match(new RegExp('\\n'+k+'[^:\\n]*:([^\\n\\r]*)'));return m?m[1].trim():''};
    const s=pd(g('DTSTART')),e=pd(g('DTEND'));if(!s||s<t0||s>t1)continue;const sm=s.getHours()*60+s.getMinutes();const em=e&&ymd(e)===ymd(s)?e.getHours()*60+e.getMinutes():sm+60;
    out.push({d:ymd(s),s:sm,e:em,t:(g('SUMMARY')||'Événement').replace(/\\,/g,',').replace(/\\n/g,' ').slice(0,60)})}
  return out.sort((a,b)=>(a.d+pad(a.s)).localeCompare(b.d+pad(b.s))).slice(0,300);
}

/* ============ horloge ============ */
let lastDay=today();const alarmed={};
function tick(){
  if(!S.onboarded||V.reob)return;
  const t=today();if(t!==lastDay){lastDay=t;V.date=t}
  const ch=sweepMissed();if(ch)save();
  for(const x of dayTasks(t)){const st=status(x);if(st==='due'&&!alarmed[x.key]&&!(S.punches[x.key]||{}).in){alarmed[x.key]=1;if(S.settings.sound&&!NIGHT){beep();if(x.type==='reveil')ring()}}}
  if(!sheetName&&!NIGHT&&V.tab==='jour'&&document.activeElement.tagName!=='INPUT')render();
}
if(S.onboarded&&!S.reset4){resetCounters();save()}
if(S.onboarded&&!S.reset5){startFresh();save()}
if(S.onboarded&&!S.sleep2){S.profile.wake=480;S.profile.cycles=4;S.wakeOv={};S.bedOv={};S.sleep2=1;save()}
if(S.onboarded&&!S.omadEve){S.profile.omadTime=1260;S.profile.omadWin=120;S.omadEve=1;save()}
if(S.onboarded&&!S.omadInit){S.profile.omad=true;S.profile.omadTime=S.profile.omadTime||1260;S.profile.omadWin=S.profile.omadWin||120;S.omadInit=1;save()}
try{if(S.nightLive&&S.nightLive.bins){const L=S.nightLive;const r=analyzeNight(L,L.start+Math.max(1,L.bins.length)*6e4);S.nights=[r,...(S.nights||[])].slice(0,30);S.nightLive=null;save()}}catch(e){}
async function loadSecrets(){try{const x=await decFile('secrets.enc.json');let ch=false;
  if(x.gkey&&!lsGet('cadence.gkey','')){localStorage.setItem('cadence.gkey',x.gkey);ch=true}
  if(x.ai&&!lsGet('cadence.ai','')){localStorage.setItem('cadence.ai',x.ai)}
  if(x.agendaCal&&!S.agendaCal){S.agendaCal=x.agendaCal;save()}
  if(ch&&sheetName==='meal')mealSheet()}catch(e){}}
applyTheme();render();connect();loadSecrets();loadSeed().then(()=>loadAgendaFile(false));setInterval(tick,30000);setTimeout(tick,1500);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){loadAgendaFile(false);checkUpdate().then(()=>{if(hasUpdate()&&!sheetName&&!NIGHT)render()});tick()}});
checkUpdate().then(()=>{if(hasUpdate()&&!sheetName&&!NIGHT)render()});
if(/[?&]v=\d/.test(location.search))try{history.replaceState(null,'',location.pathname+location.hash)}catch(e){}
