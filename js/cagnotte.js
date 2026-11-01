/* CAGNOTTE : onglet Cagnotte, virements, récompenses. Propriétaire : « Général ». */
/* ---------- CAGNOTTE ---------- */
let RW=null,payConfirm=false,buyConfirm=null;
const CAT={vetements:'Vêtements',sneakers:'Sneakers',resto:'Resto',tech:'Tech',voyage:'Voyage',sport:'Matériel sport',perso:'Autre'};
/* ---------- BOCAL : se remplit de pièces et de billets selon l'argent de la période ----------
   Rempli = la période parfaite (tout pointé à l'heure + journées parfaites). Les objets nouveaux tombent dans le bocal. */
function periodMax(){const p=S.profile,days=p.payout==='hebdo'?7:14;const st=ymd(new Date(S.periodStart||Date.now()));let pts=0;
  for(let i=0;i<days;i++){const d=addDs(st,i);if(d<START_DAY)continue;try{pts+=dayTasks(d).reduce((a,t)=>a+Math.max(0,t.pts||0),0)+30}catch(e){pts+=80}}
  return Math.max(1,pts)*p.rate}
let JAR_N=0;
const JAR_ITEMS=(()=>{let z=7;const r=()=>(z=(z*16807)%2147483647)/2147483647;const L=[];
  for(let y=224;y>=56;y-=6.5){const half=y<92?Math.max(34,66-(92-y)*1.0):66;
    for(let x=100-half+6+r()*8;x<100+half-4;x+=15+r()*9){const bill=r()<.27;L.push({x,y:y+r()*3-1.5,bill,rot:bill?r()*60-30:r()*50-25,ry:3.4+r()*3.4,sh:r()})}}
  return L})();
function jarSVG(f,animate){
  const lvl=226-f*(226-66);const items=f>0?JAR_ITEMS.filter(o=>o.y>=lvl):[];const n=items.length;
  const from=animate==='all'?0:animate==='new'?JAR_N:n;JAR_N=n;
  const coin=o=>`<ellipse cy="2.3" rx="10" ry="${o.ry}" fill="var(--gold-2)"/><ellipse rx="10" ry="${o.ry}" fill="url(#jGold)" stroke="var(--gold-2)" stroke-width=".8"/><ellipse rx="6.4" ry="${(o.ry*.62).toFixed(2)}" fill="none" stroke="var(--gold-2)" stroke-width=".7" opacity=".55"/><path d="M-6 ${(-o.ry*.35).toFixed(2)}q3 -1.6 6 -1.2" stroke="var(--gold-3)" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  const bill=o=>`<rect x="-20" y="-9" width="40" height="18" rx="2" fill="var(--bill)" stroke="var(--bill-2)" stroke-width=".9"/><path d="M0 -9H18a2 2 0 0 1 2 2V7a2 2 0 0 1-2 2H0Z" fill="var(--bill-2)" opacity=".16"/><rect x="-16.5" y="-5.8" width="33" height="11.6" rx="1.4" fill="none" stroke="var(--bill-2)" stroke-width=".55" opacity=".6"/><circle cx="-8" r="3.6" fill="none" stroke="var(--bill-2)" stroke-width=".7"/><text x="8" y="2.6" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--bill-2)">€</text>`;
  const drawn=items.map((o,i)=>{const g=`<g transform="translate(${o.x.toFixed(1)} ${o.y.toFixed(1)}) rotate(${o.rot.toFixed(1)})">${o.bill?bill(o):coin(o)}</g>`;
    return i>=from?`<g class="jar-new" style="animation-delay:${Math.min(1400,(i-from)*(animate==='all'?22:90))}ms">${g}</g>`:g}).join('');
  const drop=animate==='new'&&n>from?`<g class="jar-coin"><g transform="translate(100 -8)"><ellipse rx="9" ry="9" fill="url(#jGold)" stroke="var(--gold-2)" stroke-width="1"/><ellipse rx="5.6" ry="5.6" fill="none" stroke="var(--gold-2)" stroke-width=".7" opacity=".6"/></g></g>`:'';
  const J='M62 36V50C62 62 30 64 30 86V212C30 226 40 234 56 234H144C160 234 170 226 170 212V86C170 64 138 62 138 50V36Z';
  return`<svg class="jar" viewBox="0 -14 200 262" role="img" aria-label="Bocal rempli à ${Math.round(f*100)} %">
   <defs><linearGradient id="jGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--gold-3)"/><stop offset=".45" stop-color="var(--gold)"/><stop offset="1" stop-color="var(--gold-2)"/></linearGradient>
    <linearGradient id="jMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--metal-2)"/><stop offset=".3" stop-color="var(--metal)"/><stop offset=".55" stop-color="var(--metal-2)"/><stop offset=".8" stop-color="var(--metal)"/><stop offset="1" stop-color="var(--metal-2)"/></linearGradient>
    <clipPath id="jIn"><path d="M66 38V51C66 66 34 67 34 88V211C34 223 43 230 57 230H143C157 230 166 223 166 211V88C166 67 134 66 134 51V38Z"/></clipPath></defs>
   <ellipse cx="100" cy="240" rx="74" ry="6" fill="currentColor" opacity=".13"/>
   <path d="${J}" fill="currentColor" opacity=".07"/>
   <g clip-path="url(#jIn)">${f>0?`<path d="M20 ${(lvl+7).toFixed(1)}q20 -5 40 0t40 0t40 0t40 0V240H20Z" fill="var(--gold-2)" opacity=".55"/>`:''}${drawn}</g>
   ${drop}
   <path d="M44 98C40 132 40 176 45 206" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" fill="none" opacity=".3"/>
   <path d="M53 94v7M51 110v4" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".3"/>
   <path d="M158 112C161 140 161 172 157 198" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" opacity=".18"/>
   <path d="M70 40v8" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" opacity=".32"/>
   <path d="M42 227C64 236 136 236 158 227" stroke="currentColor" stroke-width="1.4" fill="none" opacity=".25"/>
   <path d="${J}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" opacity=".9"/>
   <path d="${J}" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round" opacity=".3" transform="translate(1.4 -1.1)"/>
   <rect x="55" y="14" width="90" height="23" rx="5" fill="url(#jMetal)" stroke="currentColor" stroke-width="2" opacity=".98"/>
   <path d="${Array.from({length:16},(_,i)=>`M${61+i*5.2} 19v13`).join('')}" stroke="var(--metal-2)" stroke-width="1" opacity=".55"/>
   <rect x="85" y="15.5" width="30" height="4" rx="2" fill="var(--ink-jar)"/>
   <path d="M136 44C150 46 160 52 166 62" stroke="var(--paper-2)" stroke-width="1.3" fill="none"/>
   <g transform="translate(170 76) rotate(14)"><path d="M-12 -14H8l6 6V14H-12Z" fill="var(--paper)" stroke="var(--paper-2)" stroke-width="1.2" stroke-linejoin="round"/><circle cx="-4" cy="-8" r="2" fill="none" stroke="var(--paper-2)" stroke-width="1"/><text x="0" y="8" font-size="13" font-weight="700" text-anchor="middle" fill="var(--paper-2)">€</text></g>
  </svg>`}
function renderCagnotte(){
  const p=S.profile,pts=periodPts(),e=periodEur();const days=p.payout==='hebdo'?7:14;
  const next=addDays(new Date(S.periodStart||Date.now()),days);const avail=totalSaved()-totalSpent();
  const recent=[...S.ledger].reverse().slice(0,12);
  const fill=e>0?clamp(e/periodMax(),.05,1):0;const had=document.querySelector('#main .jar');const anim=!had?'all':JAR_N<JAR_ITEMS.filter(o=>o.y>=226-fill*160).length?'new':'none';
  const t=today();const week=Array.from({length:7},(_,i)=>{const d=addDs(t,i-6);return{d,v:dayPts(d)}});
  const mx=Math.max(50,...week.map(x=>x.v));
  const bars=`<svg class="chart" viewBox="0 0 320 110" role="img" aria-label="Gains des 7 derniers jours">${week.map((x,i)=>{const h=Math.max(0,x.v)/mx*70;const cx=12+i*44;return`<rect x="${cx}" y="${84-h}" width="28" height="${Math.max(h,2)}" rx="6" fill="${x.d===t?'var(--money)':'var(--money-soft)'}"/><text x="${cx+14}" y="${100}" text-anchor="middle">${DAYS[dow(parseYmd(x.d))].slice(0,2)}</text>${x.v?`<text x="${cx+14}" y="${78-h}" text-anchor="middle" style="fill:var(--ink)">${eur(x.v*S.profile.rate)}</text>`:''}`}).join('')}</svg>`;
  return`<header class="top"><div class="stack" style="gap:4px"><span class="lbl">Ton argent gagné en tenant ton plan</span><h1>Cagnotte</h1></div></header>
  <section class="hero"><div class="cg-top"><div class="stack" style="gap:10px;min-width:0"><span class="lbl">À virer sur ton épargne · période en cours</span><span class="big" style="color:var(--money)">${eur(e)}</span>
   <p class="meta">Gagné depuis le ${fmtShort(new Date(S.periodStart||Date.now()))} · virement prévu le ${fmtShort(next)}</p><p class="meta cg-pct">Bocal rempli à ${Math.round(fill*100)} %</p></div>${jarSVG(fill,anim)}</div>
   ${payConfirm?`<div class="stack" style="gap:8px"><p class="meta">Confirme que tu as viré ${eur(e)} sur ton compte épargne depuis ton appli bancaire.</p><div class="row"><button class="btn go" data-act="payDo">C’est fait</button><button class="btn" data-act="payCancel">Annuler</button></div></div>`:
   `<button class="btn ${Date.now()>=next.getTime()?'go':''}" data-act="pay" ${e<=0?'disabled style="opacity:.5"':''}>J’ai fait le virement de ${eur(e)}</button>`}</section>
  <div class="stats" style="grid-template-columns:repeat(2,1fr)"><div class="stat money"><span class="lbl">Épargné au total</span><b>${eur(totalSaved())}</b></div><div class="stat"><span class="lbl">Dispo à dépenser</span><b>${eur(avail)}</b></div></div>
  <section class="card"><h3>7 derniers jours</h3>${bars}</section>
  <section class="card" style="gap:0"><div class="row between" style="padding-bottom:6px"><h3>Mes récompenses</h3><button class="chip sm on" data-act="addReward">${ic('plus')} Ajouter</button></div>
   ${S.rewards.length?S.rewards.map(r=>{const pr=clamp(avail/r.price,0,1);return`<div class="reward"><div style="min-width:0"><b>${esc(r.label)}</b><br><span class="muted num" style="font-size:13px">${eur(Math.min(avail,r.price))} / ${eur(r.price)}</span></div>
     ${pr>=1?(buyConfirm===r.id?`<div class="row" style="gap:6px"><button class="btn money sm" data-act="buyDo" data-v="${r.id}">Confirmer</button><button class="btn ghost sm" data-act="buyCancel">Non</button></div>`:`<button class="btn money sm" data-act="buy" data-v="${r.id}">Je me l’offre</button>`):`<button class="chip sm" data-act="delReward" data-v="${r.id}" aria-label="Retirer">${ic('x')}</button>`}
     <div class="bar m"><i style="width:${pr*100}%"></i></div></div>`}).join(''):`<div class="empty">Ajoute ce que tu veux t’offrir : la barre se remplit avec ce que tu as vraiment viré sur ton épargne.</div>`}</section>
  <section class="card" style="gap:0"><h3 style="padding-bottom:6px">Historique</h3>${recent.length?recent.map(l=>`<div class="ledger"><span style="min-width:0">${esc(l.label)}<br><span class="muted num" style="font-size:12px">${fmtShort(new Date(l.t))} · ${clock(l.t)}</span></span><span class="num" style="color:${l.pts<0?'var(--bad)':'var(--money)'}">${M$(l.pts)}</span></div>`).join(''):`<div class="empty">Ton premier pointage apparaîtra ici.</div>`}</section>
  <section class="flat stack" style="gap:6px"><b>Ce que tu gagnes</b><p style="font-size:13.5px">Service de travail : ${M$(10,false)} · séance de sport (photo de la salle) : ${M$(50,false)} · repas validé : ${M$(MEAL_PTS,false)} · journée parfaite : ${M$(30)}. À l’heure : la somme entière. En retard ou oubli de pointage : la moitié. Pas fait : la somme est retirée de la cagnotte. Non validé le lendemain : ${S.settings.malus?'compté comme pas fait':'rien n’est retiré'}. Sucre interdit : la photo du repas est refusée.</p></section>
  ${S.payouts.length?`<section class="card" style="gap:0"><h3 style="padding-bottom:6px">Virements</h3>${[...S.payouts].reverse().map(x=>`<div class="ledger"><span>${fmtShort(new Date(x.t))}</span><span class="num" style="color:var(--money)">${eur(x.eur)}</span></div>`).join('')}</section>`:''}`;
}
function rewardSheet(){if(!RW)RW={cat:'vetements',price:60,label:''};
  openSheet(`<div class="grab"></div><h2>Nouvelle récompense</h2>
  <div class="field"><span class="lbl">Catégorie</span><div class="chips">${Object.entries(CAT).map(([k,l])=>`<button class="chip ${RW.cat===k?'on':''}" data-act="pick" data-o="RW" data-k="cat" data-v="${k}">${l}</button>`).join('')}</div></div>
  <div class="field"><span class="lbl">Prix</span><div class="chips">${[20,40,60,100,150,250].map(v=>`<button class="chip ${RW.price===v?'on':''}" data-act="pick" data-o="RW" data-k="price" data-v="${v}" data-n="1">${v} €</button>`).join('')}</div>${stepper('RW','price',5,5,3000,'eur')}</div>
  <div class="field"><span class="lbl">Nom (facultatif)</span><input id="rwLabel" value="${esc(RW.label)}" placeholder="${CAT[RW.cat]}" style="border:1.5px solid var(--line);background:var(--surface);border-radius:14px;padding:13px 14px;font-size:16px"></div>
  <button class="btn money" data-act="rwSave">Ajouter · ${RW.price} €</button>`,'reward')}
