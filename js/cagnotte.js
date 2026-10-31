/* CAGNOTTE : onglet Cagnotte, virements, récompenses. Propriétaire : « Général ». */
/* ---------- CAGNOTTE ---------- */
let RW=null,payConfirm=false,buyConfirm=null;
const CAT={vetements:'Vêtements',sneakers:'Sneakers',resto:'Resto',tech:'Tech',voyage:'Voyage',sport:'Matériel sport',perso:'Autre'};
function renderCagnotte(){
  const p=S.profile,pts=periodPts(),e=periodEur();const days=p.payout==='hebdo'?7:14;
  const next=addDays(new Date(S.periodStart||Date.now()),days);const avail=totalSaved()-totalSpent();
  const recent=[...S.ledger].reverse().slice(0,12);
  const t=today();const week=Array.from({length:7},(_,i)=>{const d=addDs(t,i-6);return{d,v:dayPts(d)}});
  const mx=Math.max(50,...week.map(x=>x.v));
  const bars=`<svg class="chart" viewBox="0 0 320 110" role="img" aria-label="Gains des 7 derniers jours">${week.map((x,i)=>{const h=Math.max(0,x.v)/mx*70;const cx=12+i*44;return`<rect x="${cx}" y="${84-h}" width="28" height="${Math.max(h,2)}" rx="6" fill="${x.d===t?'var(--money)':'var(--money-soft)'}"/><text x="${cx+14}" y="${100}" text-anchor="middle">${DAYS[dow(parseYmd(x.d))].slice(0,2)}</text>${x.v?`<text x="${cx+14}" y="${78-h}" text-anchor="middle" style="fill:var(--ink)">${eur(x.v*S.profile.rate)}</text>`:''}`}).join('')}</svg>`;
  return`<header class="top"><div class="stack" style="gap:4px"><span class="lbl">Ton argent gagné en tenant ton plan</span><h1>Cagnotte</h1></div></header>
  <section class="hero"><span class="lbl">À virer sur ton épargne · période en cours</span><span class="big" style="color:var(--money)">${eur(e)}</span>
   <p class="meta">Gagné depuis le ${fmtShort(new Date(S.periodStart||Date.now()))} · virement prévu le ${fmtShort(next)}</p>
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
