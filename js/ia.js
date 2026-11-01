/* IA : clés (Gemini/Claude), modèles, appel image→JSON (aiRaw), journal technique (logE). Propriétaire : « Général ». */
const lsGet=(k,d)=>{try{return localStorage.getItem(k)||d}catch(e){return d}};
const aiProv=()=>lsGet('cadence.ai','gemini');
const apiKey=(pv)=>lsGet((pv||aiProv())==='claude'?'cadence.apikey':'cadence.gkey','');
const aiModel=()=>lsGet('cadence.aimodel','claude-haiku-5-5');
let GEM_MODELS=['gemini-flash-lite-latest','gemini-3.5-flash-lite','gemini-3.1-flash-lite'];
try{const gm=localStorage.getItem('cadence.gmodel');if(gm&&/lite/.test(gm))GEM_MODELS=[gm,...GEM_MODELS.filter(x=>x!==gm)];else localStorage.removeItem('cadence.gmodel')}catch(e){}
/* journal technique (pour le test de l'app) */
let LOGS=[];try{LOGS=JSON.parse(localStorage.getItem('cadence.log')||'[]')}catch(e){}
function logE(type,msg){const d=new Date();LOGS.push(`${ymd(d)} ${clock(+d)}:${pad(d.getSeconds())} [${type}] ${String(msg).slice(0,300)}`);LOGS=LOGS.slice(-60);try{localStorage.setItem('cadence.log',JSON.stringify(LOGS))}catch(e){}}
window.addEventListener('error',e=>logE('js',`${e.message} @${(e.filename||'').split('/').pop()}:${e.lineno}`));
window.addEventListener('unhandledrejection',e=>logE('promise',e.reason&&(e.reason.message||e.reason)));
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(MEAL&&MEAL.state==='busy'){MEAL.hid=true;logE('vis','app en arrière-plan pendant une analyse')}}else if(MEAL&&MEAL.state==='retry'){logE('vis','retour au premier plan : relance de l’analyse');analyzeMeal()}});
const aiReady=()=>!!(SAMPLE&&SAMPLE_IMG)||!!apiKey();

function warmAI(){try{fetch(aiProv()==='gemini'?'https://generativelanguage.googleapis.com/':'https://api.anthropic.com/',{mode:'no-cors',cache:'no-store'}).catch(()=>{})}catch(e){}}

function keySetup(){const pv=aiProv(),k=apiKey(),m=aiModel();
  const seg=`<div class="seg"><button class="${pv==='gemini'?'on':''}" data-act="aiProv" data-v="gemini">Gemini · gratuit</button><button class="${pv==='claude'?'on':''}" data-act="aiProv" data-v="claude">Claude · payant</button></div>`;
  const help=pv==='gemini'?`<p style="font-size:14px">Gemini Flash de Google, gratuit sans carte bancaire (quota quotidien largement suffisant pour tes repas). En contrepartie, Google peut utiliser les photos envoyées pour améliorer ses produits.</p>
   <ol class="steps" style="font-size:14px"><li>Va sur <a class="link" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> avec ton compte Google.</li><li>Touche <b>Create API key</b>, puis copie la clé.</li><li>Colle-la ici (elle commence par AIza ou AQ.).</li></ol>`:
   `<p style="font-size:14px">Claude d’Anthropic, environ 1 à 2 centimes par photo. Tes photos ne servent pas à entraîner les modèles.</p>
   <ol class="steps" style="font-size:14px"><li>Va sur <a class="link" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a> → API Keys → Create Key.</li><li>Ajoute quelques euros de crédit (Billing).</li><li>Colle la clé ici (elle commence par sk-ant-).</li></ol>`;
  return`${seg}${help}
  <input id="apiKeyIn" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${k?'Clé enregistrée · colle une nouvelle clé pour la remplacer':pv==='gemini'?'AIza… ou AQ.…':'sk-ant-…'}" style="border:1.5px solid var(--line);background:var(--surface);border-radius:14px;padding:13px 14px;font-size:16px;width:100%">
  ${pv==='claude'?`<div class="field"><span class="lbl">Modèle</span><div class="seg"><button class="${m.includes('haiku')?'on':''}" data-act="aiModel" data-v="claude-haiku-5-5">Rapide (Haiku)</button><button class="${m.includes('sonnet')?'on':''}" data-act="aiModel" data-v="claude-sonnet-5-5">Précis (Sonnet, plus lent)</button></div></div>`:''}
  <button class="btn" data-act="keySave">Enregistrer la clé</button>${k?`<button class="btn ghost" data-act="keyDel">Supprimer la clé</button>`:''}
  <p class="muted" style="font-size:12.5px">La clé reste uniquement dans Safari sur ce téléphone : elle n’est jamais envoyée sur GitHub ni dans les sauvegardes.</p>`}

const parseJSON=txt=>{const a=txt.indexOf('{'),b=txt.lastIndexOf('}');if(a<0)throw new Error('Réponse illisible. Reprends la photo.');return JSON.parse(txt.slice(a,b+1))};

/* aiRaw(canvas, prompt) : image + texte → JSON. aiText(prompt) : texte seul (ex. repas décrit par écrit), mêmes modèles et mêmes erreurs. */
async function aiRaw(cv,prompt,maxTok){return aiCall(cv,prompt,maxTok)}
async function aiText(prompt,maxTok){return aiCall(null,prompt,maxTok)}
async function aiCall(cv,prompt,maxTok){
  if(SAMPLE&&(SAMPLE_IMG||(!cv&&!apiKey()))){if(!cv)return await SAMPLE.json(prompt,{modelTier:'quick',cache:false});const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',.72));return await SAMPLE.json(prompt,{images:blob,modelTier:'quick',cache:false})}
  const data=cv?cv.toDataURL('image/jpeg',.72).split(',')[1]:'';
  const go=async(u,o,lim)=>{const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),lim||10000);const t0=performance.now(),hid0=document.hidden,host=u.split('/')[2],mdl=(u.match(/models\/([^:]+)/)||[])[1]||aiModel();
    try{const r=await fetch(u,Object.assign({method:'POST',signal:ctl.signal},o));logE('ai',`${host} ${mdl} → HTTP ${r.status} en ${Math.round(performance.now()-t0)} ms · ${data?'image '+Math.round(data.length*.75/1024)+' Ko':'texte seul'}`);return r}
    catch(e){const ms=Math.round(performance.now()-t0),bg=hid0||document.hidden||(MEAL&&MEAL.hid);logE('ai',`${host} ${mdl} → ÉCHEC ${e&&e.name}: ${e&&e.message} après ${ms} ms${bg?' (app en arrière-plan)':''} · en ligne=${navigator.onLine}`);
      const err=new Error(bg?'Analyse interrompue : l’app est passée en arrière-plan.':e&&e.name==='AbortError'?'L’IA met trop de temps à répondre. Réessaie.':!navigator.onLine?'Pas de connexion internet. Réessaie dans un instant.':'La requête vers l’IA a échoué ('+(e&&e.message||'réseau')+').');err.bg=bg;err.slow=e&&e.name==='AbortError'&&!bg;throw err}
    finally{clearTimeout(to)}};
  if(aiProv()==='gemini'){
    let lastErr=null;
    for(const mdl of GEM_MODELS){
      let res;try{res=await go(`https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent`,{headers:{'content-type':'application/json','x-goog-api-key':apiKey()},
        body:JSON.stringify({contents:[{role:'user',parts:[...(data?[{inline_data:{mime_type:'image/jpeg',data}}]:[]),{text:prompt}]}],generationConfig:{temperature:.2,maxOutputTokens:maxTok||400,responseMimeType:'application/json'}})},9000)}
      catch(e){if(e.slow){lastErr=e;continue}throw e}
      if(res.ok){const j=await res.json();if(mdl!==GEM_MODELS[0]){GEM_MODELS=[mdl,...GEM_MODELS.filter(x=>x!==mdl)];try{localStorage.setItem('cadence.gmodel',mdl)}catch(e){}}
        return parseJSON(((j.candidates||[])[0]?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join(''))}
      let m='';try{m=(await res.json()).error?.message||''}catch(e){}
      logE('ai',`détail ${res.status} : ${m}`);
      if(res.status===404||res.status===500||res.status===503||(res.status===400&&!/key/i.test(m))){lastErr=new Error(res.status===503?'Gemini est surchargé. Réessaie dans une minute.':'Erreur de Gemini ('+res.status+'). '+m);continue}
      throw new Error(res.status===400||res.status===403?'Clé Gemini refusée. Vérifie-la dans Réglages → Analyse des repas.':res.status===429?'Quota gratuit atteint pour le moment. Réessaie dans une minute (ou demain).':'Erreur de Gemini ('+res.status+'). '+m)}
    throw lastErr||new Error('Gemini ne répond pas. Réessaie.');
  }
  const res=await go('https://api.anthropic.com/v1/messages',{headers:{'content-type':'application/json','x-api-key':apiKey(),'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({model:aiModel(),max_tokens:maxTok||400,messages:[{role:'user',content:[...(data?[{type:'image',source:{type:'base64',media_type:'image/jpeg',data}}]:[]),{type:'text',text:prompt}]}]})},15000);
  if(!res.ok){let m='';try{m=(await res.json()).error?.message||''}catch(e){}
    throw new Error(res.status===401?'Clé API refusée. Vérifie-la dans Réglages → Analyse des repas.':res.status===400&&/credit/i.test(m)?'Plus de crédit sur ton compte Anthropic (Billing).':res.status===429||res.status===529?'Le service est surchargé. Réessaie dans une minute.':res.status===404?'Modèle indisponible : choisis l’autre modèle dans Réglages.':'Erreur de l’IA ('+res.status+'). '+m)}
  const j=await res.json();return parseJSON((j.content||[]).map(c=>c.text||'').join(''));
}
