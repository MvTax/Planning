/* REPAS : aliments, recettes, calculs nutrition, OMAD, photo du plat + IA, sucres interdits, dictée, onglet Repas (menu, courses). Propriétaire : « Agent Repas ». */
/* ============ données : aliments & recettes ============ */
// [nom, kcal, prot, gluc, lip /100 g, €/kg, paquet g, rayon, périssable]
const I={
 poulet:['Blanc de poulet',110,23,0,1.5,11.5,600,'Viandes & poissons',1],
 boeuf5:['Bœuf haché 5 %',125,21,0,5,13,500,'Viandes & poissons',1],
 dinde:['Escalopes de dinde',105,23,0,1.5,12,500,'Viandes & poissons',1],
 colin:['Colin d’Alaska surgelé',80,17,0,1,9,1000,'Surgelés',0],
 thon:['Thon au naturel (boîte)',115,26,0,1,12,140,'Épicerie',0],
 oeuf:['Œufs',145,12.5,0.7,10,5.5,720,'Frais',1],
 skyr:['Skyr nature',63,11,4,0.2,5,450,'Frais',1],
 fb0:['Fromage blanc 0 %',48,7.5,4,0.2,2.4,1000,'Frais',1],
 lait:['Lait demi-écrémé',46,3.3,4.8,1.6,1.15,1000,'Frais',0],
 tofu:['Tofu nature',145,15,2,8.5,9,400,'Frais',1],
 avoine:['Flocons d’avoine',370,13,60,7,2.2,1000,'Épicerie',0],
 riz:['Riz basmati',355,8,78,1,3,1000,'Épicerie',0],
 pates:['Pâtes complètes',350,13,65,2.5,2.2,500,'Épicerie',0],
 lentilles:['Lentilles corail',340,24,52,1.5,3.6,500,'Épicerie',0],
 hrouge:['Haricots rouges (boîte)',110,8,15,0.5,2.6,250,'Épicerie',0],
 poischiche:['Pois chiches (boîte)',120,7,16,2.5,2.4,265,'Épicerie',0],
 concasse:['Tomates concassées (boîte)',24,1.2,4,0.2,1.9,400,'Épicerie',0],
 mais:['Maïs (boîte)',80,3,14,1.5,3.2,285,'Épicerie',0],
 amandes:['Amandes',600,21,9,52,14,200,'Épicerie',0],
 huile:['Huile d’olive',900,0,0,100,9,1000,'Épicerie',0],
 pain:['Pain complet',245,10,42,3.5,4,500,'Épicerie',0],
 tortilla:['Tortillas complètes',300,9,48,7,6,370,'Épicerie',0],
 patate:['Patates douces',86,1.6,20,0.1,2.8,1000,'Fruits & légumes',1],
 pdt:['Pommes de terre',77,2,17,0.1,1.6,2500,'Fruits & légumes',0],
 courgette:['Courgettes',17,1.2,2.5,0.3,2.8,1000,'Fruits & légumes',1],
 poivron:['Poivrons',26,1,5,0.3,4,500,'Fruits & légumes',1],
 tomate:['Tomates',18,0.9,3.5,0.2,3,1000,'Fruits & légumes',1],
 oignon:['Oignons',40,1.1,9,0.1,2,1000,'Fruits & légumes',0],
 banane:['Bananes',90,1.1,21,0.3,2,1000,'Fruits & légumes',1],
 pomme:['Pommes',52,0.3,12,0.2,2.6,1000,'Fruits & légumes',1],
 brocoli:['Brocoli surgelé',34,2.8,4.5,0.4,2.8,1000,'Surgelés',0],
 hverts:['Haricots verts surgelés',31,1.8,5,0.2,2.6,1000,'Surgelés',0],
 wok:['Légumes pour wok surgelés',35,2,5,0.3,3.2,1000,'Surgelés',0],
 epinards:['Épinards hachés surgelés',23,2.9,1.4,0.4,2.6,1000,'Surgelés',0],
 fruitsR:['Fruits rouges surgelés',45,1,8,0.4,6,750,'Surgelés',0]
};
const PANTRY=['huile','riz','pates','avoine','lentilles','amandes','pdt','oignon','colin','brocoli','hverts','wok','epinards','fruitsR'];
const VRAC=['tomate','pomme','banane','courgette','poivron','patate'];
const MEAT=['poulet','boeuf5','dinde'];
const DAIRY=['skyr','fb0','lait'];
const R=[
 {id:'b1',slot:'b',n:'Bol skyr, avoine & fruits rouges',t:5,ing:[['skyr',250],['avoine',50],['fruitsR',100],['amandes',15]],steps:['Mets le skyr dans un bol.','Ajoute les flocons et les fruits rouges encore surgelés (ils décongèlent en 5 min).','Parsème d’amandes concassées.']},
 {id:'b2',slot:'b',n:'Omelette 3 œufs & pain complet',t:10,ing:[['oeuf',180],['pain',60],['tomate',100],['huile',5]],steps:['Bats les œufs avec sel et poivre.','Cuis 3 min à feu moyen dans la poêle huilée.','Sers avec le pain grillé et la tomate en tranches.']},
 {id:'b3',slot:'b',n:'Overnight oats protéinés',t:5,ing:[['avoine',60],['lait',200],['fb0',150],['banane',100]],steps:['La veille : mélange avoine, lait et fromage blanc dans un bocal.','Ferme et mets au frigo.','Le matin : ajoute la banane en rondelles.']},
 {id:'b4',slot:'b',n:'Tartines œufs brouillés & fromage blanc',t:8,ing:[['pain',70],['oeuf',120],['fb0',150],['pomme',150]],steps:['Brouille les œufs à feu doux en remuant.','Pose-les sur le pain grillé.','Fromage blanc et pomme à côté.']},
 {id:'s1',slot:'s',n:'Fromage blanc & banane',t:2,ing:[['fb0',250],['banane',100]],steps:['Coupe la banane dans le fromage blanc. Cannelle si tu aimes.']},
 {id:'s2',slot:'s',n:'Œufs durs & pomme',t:2,ing:[['oeuf',120],['pomme',150]],steps:['Prépare 6 œufs durs le dimanche (10 min d’ébullition), garde-les au frigo 5 jours.']},
 {id:'s3',slot:'s',n:'Skyr & amandes',t:1,ing:[['skyr',200],['amandes',15]],steps:['Skyr + amandes. Facile à emporter au travail.']},
 {id:'m1',slot:'m',k:'meat',n:'Poulet, riz & brocoli',t:25,batch:1,ing:[['poulet',170],['riz',70],['brocoli',200],['huile',10]],steps:['Lance le riz (12 min).','Coupe le poulet en dés, saisis 6-7 min avec l’huile, paprika, sel.','Brocoli à la vapeur ou au micro-ondes 6 min.','Batch : fais 3 portions, garde-les 3 jours au frigo.']},
 {id:'m2',slot:'m',k:'meat',n:'Chili con carne léger',t:30,batch:1,ing:[['boeuf5',140],['hrouge',120],['riz',60],['poivron',80],['concasse',150],['oignon',50],['huile',5]],steps:['Fais revenir oignon et poivron 5 min.','Ajoute le bœuf, émiette, 5 min.','Tomates, haricots rincés, cumin, paprika : 15 min à feu doux.','Sers avec le riz. Encore meilleur le lendemain.']},
 {id:'m3',slot:'m',k:'fish',n:'Colin, patate douce & haricots verts',t:30,ing:[['colin',200],['patate',250],['hverts',200],['huile',10]],steps:['Patate douce en cubes au four 25 min à 200 °C avec la moitié de l’huile.','Colin au four les 12 dernières minutes, citron et herbes.','Haricots verts à la poêle avec le reste de l’huile.']},
 {id:'m4',slot:'m',k:'meat',n:'Wok de dinde aux légumes',t:15,ing:[['dinde',160],['wok',250],['riz',70],['huile',10]],steps:['Lance le riz.','Dinde en lamelles, saisis 4 min à feu vif.','Ajoute les légumes surgelés, sauce soja, gingembre : 6 min.']},
 {id:'m5',slot:'m',k:'meat',n:'Pâtes complètes bolognaise',t:25,batch:1,ing:[['boeuf5',130],['pates',80],['concasse',200],['courgette',150],['oignon',50]],steps:['Oignon et courgette râpée à la poêle 5 min.','Ajoute le bœuf, puis les tomates, origan : 15 min.','Pâtes al dente, mélange.']},
 {id:'m6',slot:'m',k:'fish',n:'Salade de pâtes au thon',t:15,batch:1,ing:[['thon',140],['pates',70],['mais',80],['tomate',150],['huile',10]],steps:['Cuis les pâtes, rince à l’eau froide.','Mélange thon égoutté, maïs, tomates, huile, vinaigre.','Se garde 2 jours : parfait en boîte repas.']},
 {id:'m7',slot:'m',k:'meat',n:'Curry de poulet aux pois chiches',t:25,batch:1,ing:[['poulet',150],['poischiche',120],['concasse',150],['epinards',150],['riz',50],['oignon',50],['huile',5]],steps:['Oignon + curry en poudre 3 min.','Poulet en dés 5 min, puis tomates, pois chiches, épinards : 12 min.','Sers avec le riz.']},
 {id:'m8',slot:'m',k:'meat',n:'Wraps poulet croquants',t:15,ing:[['tortilla',120],['poulet',140],['poivron',80],['tomate',80],['fb0',60]],steps:['Poulet en lamelles épicées, 6 min à la poêle.','Sauce : fromage blanc, ail, ciboulette, sel.','Garnis les tortillas avec poivron et tomate crus, roule.']},
 {id:'m9',slot:'m',k:'veg',n:'Dahl de lentilles & œufs mollets',t:25,batch:1,ing:[['lentilles',80],['concasse',150],['epinards',150],['oeuf',120],['oignon',50],['huile',5]],steps:['Oignon + curry + cumin 3 min.','Lentilles rincées, tomates, 300 ml d’eau : 15 min.','Ajoute les épinards. Œufs mollets 6 min à part.']},
 {id:'m10',slot:'m',k:'veg',only:1,n:'Tofu sauté, riz & légumes',t:20,ing:[['tofu',200],['riz',70],['wok',250],['huile',10]],steps:['Tofu en cubes, sèche-le, dore-le 8 min.','Ajoute les légumes et sauce soja : 6 min.','Sers avec le riz.']},
 {id:'m11',slot:'m',k:'veg',n:'Omelette pommes de terre & salade',t:25,ing:[['oeuf',180],['pdt',250],['tomate',150],['huile',10]],steps:['Pommes de terre en fines tranches, 12 min à la poêle couverte.','Verse les œufs battus, 6 min à feu doux.','Salade de tomates à côté.']},
 {id:'m12',slot:'m',k:'meat',n:'Bœuf, pommes de terre rôties & haricots',t:35,ing:[['boeuf5',150],['pdt',300],['hverts',200],['huile',10]],steps:['Pommes de terre en quartiers au four 30 min à 210 °C.','Steaks hachés 3 min par face.','Haricots verts à la poêle.']}
];
const RID=Object.fromEntries(R.map(r=>[r.id,r]));
function macros(ing,f=1){let k=0,p=0,c=0,l=0;for(const[id,g]of ing){const x=I[id];const q=g*f/100;k+=x[1]*q;p+=x[2]*q;c+=x[3]*q;l+=x[4]*q}return{k,p,c,l}}

/* ============ calculs nutrition ============ */
function age(){const b=new Date(S.profile.birth);if(isNaN(b))return 30;const n=new Date();let a=n.getFullYear()-b.getFullYear();if(n<new Date(n.getFullYear(),b.getMonth(),b.getDate()))a--;return clamp(a,14,90)}
function curWeight(){const w=S.weights;return w.length?w[w.length-1].kg:S.profile.weight}
const ACTIVITY={bureau:[1.375,'Bureau, assis'],debout:[1.5,'Debout souvent'],physique:[1.65,'Travail physique']};
const PACE={doux:[.15,'Doux'],standard:[.2,'Standard'],rapide:[.25,'Soutenu']};
function targets(){
  const p=S.profile,w=curWeight(),a=age();
  const bmr=10*w+6.25*p.height-5*a+(p.sex==='f'?-161:5);
  const tdee=bmr*(ACTIVITY[p.activity]||ACTIVITY.bureau)[0];
  const def=(PACE[p.pace]||PACE.standard)[0];
  let kcal=Math.round(tdee*(1-def)/10)*10;kcal=Math.max(kcal,p.sex==='f'?1400:1700);
  const goal=Math.min(p.goal,w);
  let prot=Math.round(Math.min(2*goal,1.7*w));if(p.omad)prot=Math.round(Math.min(prot,1.5*goal));
  const fat=Math.round(.8*goal);
  const carb=Math.max(80,Math.round((kcal-prot*4-fat*9)/4));
  const lossWk=(tdee-kcal)*7/7700;
  const weeks=lossWk>0?Math.ceil((w-p.goal)/lossWk):0;
  return{bmr,tdee,kcal,prot,fat,carb,lossWk,weeks,water:Math.min(4,Math.round(w*.035*10)/10),bmi:w/((p.height/100)**2),w,a,def};
}


/* ---------- repas : photo du plat analysée par l'IA ---------- */
const SLOT_L={b:'Petit-déjeuner',l:'Déjeuner',s:'Collation',d:'Dîner',o:'Repas unique',o1:'Plat principal',o2:'Complément',o3:'Dessert protéiné'};
const SLOT_END={b:630,l:930,s:1110,d:1380};
const slotShares=()=>S.profile.omad?{o:1}:S.profile.meals===4?{b:.25,l:.32,s:.12,d:.31}:{b:.28,l:.38,d:.34};
function guessSlot(){if(S.profile.omad)return'o';const h=nowMin(),four=S.profile.meals===4;return h<630?'b':h<930?'l':(four&&h<1110)?'s':'d'}

function mealCard(){
  const p=S.profile,tg=targets(),t=today(),ms=(S.meals||{})[t]||[];const k=ms.reduce((a,m)=>a+m.kcal,0),pr=ms.reduce((a,m)=>a+m.prot,0);const n=nowMin();
  let info='',canEat=true;
  if(p.omad){const o=omadInfo(t),y=omadInfo(addDs(t,-1));
    if(o){const st=o.done?'done':n<o.start-30?'before':n<=o.end+30?'open':'late';canEat=st!=='before'&&!(st==='late'&&o.done);
      info=`<div class="row between" style="background:var(--surface);border-radius:14px;padding:10px 12px;gap:10px"><span><b>Fenêtre ${hm(o.start)} → ${hm(o.end)}</b>${o.t.moved?'<br><span class="muted" style="font-size:12px">décalée autour de ton travail</span>':''}</span><span class="pill p-${o.done?'done':st==='open'?'run':st==='late'?'due':'up'}">${o.done?'Repas pris à '+clock(o.first.t):st==='open'?'Ouverte':st==='late'?'Pas encore mangé':'Dans '+durTxt(o.start-n)}</span></div>
      ${!o.done&&st==='late'?`<div class="banner"><span class="grow">Ta fenêtre est passée et tu n’as pas mangé. Ne saute pas ton seul repas : prends-le maintenant (${M$(OMAD_PTS/2,false)} au lieu de ${M$(OMAD_PTS,false)}).</span></div>`:''}
      ${!o.done&&y&&!y.done&&y.t.ds>=ymd(new Date(S.since))?`<p class="muted" style="font-size:13px">Hier tu n’as pas mangé : fais un repas complet aujourd’hui, sans doubler les portions.</p>`:''}
      ${st==='before'||st==='done'?dayRow():''}`}}
  else{const skip=Object.keys(slotShares()).filter(s=>n>SLOT_END[s]&&!ms.some(m=>m.slot===s));
    if(skip.length)info=`<p class="muted" style="font-size:13px">${skip.map(s=>SLOT_L[s]).join(', ')} : pas pointé, donc pas mangé. Les calories sont reportées sur tes prochains repas.</p>`}
  return`<section class="sec"><div class="sec-h"><span class="badge k-meal">${ic('repas')}</span><h2>${p.omad?'Repas unique · OMAD':'Repas du jour'}</h2><span class="pill k-meal" style="--pc:var(--c-meal)">${ms.length}/${mealsN()} ${p.omad?'repas':'validés'}</span></div>
   <div class="card tint k-meal" style="gap:14px">
   <div class="row between" style="align-items:flex-end"><div><span class="big-n" style="color:var(--c-meal)">${Math.round(k)}</span><span class="muted"> / ${tg.kcal} kcal</span></div><div style="text-align:right"><span class="big-n" style="font-size:22px;color:var(--c-money)">${Math.round(pr)}</span><span class="muted"> / ${tg.prot} g prot.</span></div></div>
   <div class="stack" style="gap:6px"><div class="bar" style="height:10px"><i style="width:${clamp(k/tg.kcal,0,1)*100}%;background:${k>tg.kcal*1.05?'var(--bad)':'var(--c-meal)'}"></i></div><div class="bar" style="height:10px"><i style="width:${clamp(pr/tg.prot,0,1)*100}%;background:var(--c-money)"></i></div></div>
   ${info}
   ${ms.length?`<div class="stack" style="gap:0;background:var(--surface);border-radius:14px;padding:4px 12px">${ms.map(m=>`<div class="ledger"><span style="min-width:0"><b>${SLOT_L[m.slot]||'Repas'}</b> · ${esc(m.nom)}<br><span class="muted num" style="font-size:12px">${clock(m.t)}${m.tries>1?' · validé au '+m.tries+'e essai':''}</span></span><span class="num">${Math.round(m.kcal)} kcal</span></div>`).join('')}</div>`:''}
   ${canEat?`<button class="btn btn-meal" data-act="meal">${ic('repas')} Pointer mon repas</button>`:''}</div></section>`;
}
/* ligne « dans la journée » de la carte repas : ce qui a été pointé hors repas */
function dayRow(){const lg=(S.foodLog||{})[today()]||[],bad=lg.some(x=>!x.ok);
  return`<button class="fd-dayrow${bad?' bad':''}" data-act="dayFood"><span class="fd-grow">${lg.length?lg.slice(-8).map(x=>x.e?esc(x.e):'<b>'+esc(x.n.charAt(0).toUpperCase())+'</b>').join(' '):'<span class="muted">Café, thé, tisane, eau…</span>'}<small>${bad?'Jeûne rompu aujourd’hui':'Pointer hors repas · ne casse pas l’OMAD'}</small></span><span class="fd-plus">${ic('plus')}</span></button>`}
let MEAL=null,mealTok=0;

function openMeal(mode,pre){
  if(!started()){openSheet(`<div class="grab"></div><span class="lbl">Bientôt</span><h2>Ça commence demain</h2><p class="muted">Les pointages de repas démarrent le dimanche 1er novembre.</p><button class="btn ghost" data-act="close">Compris</button>`,'meal');return}
  if(S.profile.omad){const o=omadInfo(today()),n=nowMin();
    if(o&&n<o.start-30){openSheet(`<div class="grab"></div><span class="lbl">OMAD</span><h2>Pas encore</h2><section class="card" style="border:2px solid var(--bad);gap:8px"><span class="lbl" style="color:var(--bad)">Hors de ta fenêtre</span><p style="font-size:15px">Ton repas du jour est à <b>${hm(o.start)}</b> (dans ${durTxt(o.start-n)}). D’ici là : ${esc(dayAllowedTxt())}.</p></section><button class="btn" data-act="dayFood">Pointer un café, un thé, de l’eau…</button><button class="btn ghost" data-act="close">Compris</button>`,'meal');return}
    if(o&&o.done&&n>o.end+30){openSheet(`<div class="grab"></div><span class="lbl">OMAD</span><h2>Repas déjà pris</h2><section class="card" style="border:2px solid var(--bad);gap:8px"><span class="lbl" style="color:var(--bad)">Hors de ta fenêtre</span><p style="font-size:15px">Tu as mangé à ${clock(o.first.t)}. Prochain repas demain vers ${hm(o.start)}. En attendant : ${esc(dayAllowedTxt())}.</p></section><button class="btn ghost" data-act="close">Compris</button>`,'meal');return}}
  warmAI();MEAL={slot:guessSlot(),tries:[],state:'idle',src:null,notes:[],asks:0,answer:'',picks:[],askMode:'voice',plate:{},pq:'',desc:''};
  const M=MEAL;
  if(mode==='pick'){M.state='pick';if(pre)M.plate[pre]=1}
  else if(mode==='text'){M.answer=pre||'';M.want='text';M.state=aiReady()?'text':'key'}
  mealSheet()}
/* ce qui s'affiche à la place de la photo (texte écrit ou assiette composée) */
function mealVisual(M){
  if(M.src==='pick')return`<div class="fd-plate">${plateItems().map(({f,n})=>`<span class="row" style="gap:2px">${foodIcon(f)}${n>1?`<small>×${n}</small>`:''}</span>`).join('')}</div>`;
  if(M.src==='text')return`<div class="fd-quote">« ${esc(M.desc)} »</div>`;
  return M.img?`<img src="${M.img}" alt="Ton plat" style="width:100%;max-height:260px;object-fit:cover;border-radius:16px">`:'';
}
/* bouton « refaire » selon la façon de pointer */
function mealRedoBtn(M,n,cls){const t=` (essai ${n+1})`;
  if(M.src==='pick')return`<button class="btn ${cls||''}" data-act="mealRedo">${ic('repas')} Modifier mon assiette${t}</button>`;
  if(M.src==='text')return`<button class="btn ${cls||''}" data-act="mealRedo">${ic('pen')} Corriger ma description${t}</button>`;
  return''}
function mealSheet(){
  const M=MEAL;if(!M)return;
  if(M.state==='key'){if(!aiReady()){openSheet(`<div class="grab"></div><h2>Activer l’analyse des plats</h2>${keySetup()}<button class="btn ghost" data-act="mealMode" data-v="pick">${ic('repas')} Composer plutôt avec ma liste (sans IA)</button>`,'meal');return}M.state=M.want==='text'?'text':'idle'}
  const chips=Object.keys(slotShares()).map(k=>`<button class="chip sm ${M.slot===k?'on':''}" data-act="mealSlot" data-v="${k}">${SLOT_L[k]}</button>`).join('');
  const img=mealVisual(M);const photo=M.src!=='text'&&M.src!=='pick';
  let body='';const r=M.res;const n=M.tries.length;
  if(M.state==='busy')body=`${img}<div class="row" style="justify-content:center;padding:8px"><span class="spin"></span><span class="muted">Analyse${n?(photo?' du plat corrigé':' corrigée'):photo?'':' de ta description'}… <span class="num" id="aiT">0,0 s</span></span></div><p class="muted" style="font-size:12.5px;text-align:center">Garde l’app ouverte pendant l’analyse.</p>`;
  else if(M.state==='retry')body=`${img}<div class="banner info"><span class="grow">Analyse interrompue quand l’app est passée en arrière-plan. Elle repart toute seule maintenant.</span></div>`;
  else if(M.state==='error')body=`${img}<div class="banner bad"><span class="grow">${esc(M.err)}</span></div>${photo?`${M.cv?`<button class="btn" data-act="mealRetry">Réessayer avec la même photo</button>`:''}<label for="mealCam" class="btn ghost">${ic('cam')} Reprendre la photo</label>`:`<button class="btn" data-act="mealRetry">Réessayer</button>${mealRedoBtn(M,n,'ghost')}`}`;
  else if(M.state==='ask'){
    const sug=[...new Set([...(M.askSug||[]),'Mayonnaise','Fromage','Sauce','Beurre'])].slice(0,10);
    body=`${img}<section class="card" style="gap:12px"><span class="lbl">Question</span><h3 style="font-size:18px;text-wrap:balance">${esc(M.askQ||'Qu’est-ce qu’il y a dedans ?')}</h3>
      ${M.askMode==='voice'?`<button class="mic ${M.listening?'on':''}" data-act="voice">${ic('mic')} ${M.listening?'Je t’écoute… touche pour arrêter':M.answer?'Reparler':'Répondre à la voix'}</button>
        ${M.answer||M.listening?`<textarea id="ansIn" class="ans" placeholder="Ta réponse apparaît ici">${esc(M.answer)}</textarea>`:''}
        <button class="describe" data-act="askText">${ic('pen')} Décrire les ingrédients</button>`:
       `<div class="chips">${sug.map(x=>`<button class="chip ${M.picks.includes(x)?'on':''}" data-act="pickIng" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        <textarea id="ansIn" class="ans" placeholder="Ex. : poulet, crudités, sauce blanche, pain baguette">${esc(M.answer)}</textarea>
        <button class="describe" data-act="askVoice">${ic('mic')} Répondre à la voix plutôt</button>`}
      ${M.voiceErr?`<p class="muted" style="font-size:13px">${esc(M.voiceErr)}</p>`:''}
      ${M.askMode==='text'||M.answer||M.picks.length?`<button class="btn" data-act="sendAns">${ic('arrow')} Envoyer et analyser</button>`:''}</section>
      <button class="btn ghost" data-act="skipAns">Je ne sais pas · estime au mieux</button>`;
  }
  else if(M.state==='result'&&r){
    const ok=r.verdict==='valide',np=r.verdict==='pas_un_plat';
    if(r.verdict==='interdit'){body=`<div style="position:relative">${img}<span class="bigstamp" style="color:var(--bad);bottom:12px;font-size:22px">INTERDIT</span></div>
      <section class="card" style="gap:8px;border:2px solid var(--bad)"><span class="lbl" style="color:var(--bad)">Sucre interdit</span><h3 style="font-size:20px">${esc(r.bad.charAt(0).toUpperCase()+r.bad.slice(1))}</h3><p style="font-size:14.5px">Pas de sucre rapide dans ton plan. Remplace-le, puis ${photo?'reprends la photo':M.src==='pick'?'modifie ton assiette':'corrige ta description'}.</p></section>
      ${photo?`<label for="mealCam" class="btn danger" style="font-size:17px;padding:18px">${ic('cam')} Reprendre la photo</label>`:mealRedoBtn(M,n,'danger')}<button class="btn ghost" data-act="close">Annuler ce repas</button>`;}
    else
    body=`<div style="position:relative">${img}<span class="bigstamp" style="color:${ok?'var(--money)':np?'var(--muted)':'var(--warn)'};bottom:12px">${ok?'VALIDÉ':np?'PAS UN PLAT':'À CORRIGER'}</span></div>
     ${np?`<p>${esc(r.resume||(photo?'Je ne vois pas de repas sur cette photo.':'Je ne reconnais pas de repas dans ta description.'))}</p>`:`
     <div class="row between" style="align-items:baseline;gap:12px"><h3 style="min-width:0">${esc(r.plat||'Ton plat')}</h3><span class="num" style="font-size:30px;white-space:nowrap">${Math.round(r.kcal||0)}<small class="muted" style="font-size:13px"> kcal</small></span></div>
     <p class="num muted" style="font-size:13.5px">Protéines ${Math.round(r.prot||0)} g · Glucides ${Math.round(r.gluc||0)} g · Lipides ${Math.round(r.lip||0)} g</p>
     ${r.resume?`<p style="font-size:15px">${esc(r.resume)}</p>`:''}
     ${!ok&&(r.fix||[]).length?`<section class="card" style="gap:10px"><span class="lbl" style="color:var(--warn)">Avant de manger</span>${r.fix.map(x=>`<div class="row" style="gap:10px;align-items:flex-start"><b style="color:var(--warn);flex:none">→</b><span>${esc(x)}</span></div>`).join('')}</section>`:''}`}
     ${M.ms?`<p class="muted num" style="font-size:12px;text-align:right">Analysé en ${nf(M.ms/1000,1)} s</p>`:''}
     ${ok?`<div class="banner info">${ic('check')}<span class="grow">Repas pointé${M.gain?' · '+M$(M.gain)+' dans la cagnotte':' · complément ajouté'}${n>1?' · validé au '+n+'e essai':''}</span></div><button class="btn" data-act="close">Bon appétit</button>`:
      photo?`<label for="mealCam" class="btn">${ic('cam')} ${np?'Reprendre la photo':'J’ai corrigé · reprendre la photo'} (essai ${n+1})</label>${np?'':`<button class="describe" data-act="fixIng">${ic('pen')} Ce n’est pas ça · préciser les ingrédients</button>`}<button class="btn ghost" data-act="close">Annuler ce repas</button>`
      :`${mealRedoBtn(M,n)}<button class="btn ghost" data-act="close">Annuler ce repas</button>`}`;
  }
  else if(M.state==='text')body=`<section class="card" style="gap:12px"><span class="lbl">Ton repas en quelques mots</span>
      <textarea id="ansIn" class="ans" placeholder="Ex. : 200 g de riz, 150 g de poulet, une salade avec 1 cuillère d’huile d’olive, 1 banane">${esc(M.answer)}</textarea>
      <button class="describe" data-act="voice">${ic('mic')} ${M.listening?'Je t’écoute… touche pour arrêter':'Dicter à la voix'}</button>
      ${M.voiceErr?`<p class="muted" style="font-size:13px">${esc(M.voiceErr)}</p>`:''}
      <p class="muted" style="font-size:12.5px">Donne les quantités si tu les connais, et la boisson. L’IA estime les calories et vérifie les sucres interdits, comme avec une photo.</p>
      <button class="btn btn-meal" data-act="txtGo">${ic('arrow')} Analyser et pointer</button></section>
      <button class="btn ghost" data-act="mealMode" data-v="idle">Changer de méthode</button>`;
  else if(M.state==='pick')body=pickBody(M);
  else body=`<div class="fd-modes">
      ${aiReady()?`<label for="mealCam" class="fd-mode">`:`<button class="fd-mode" data-act="mealMode" data-v="photo">`}${ic('cam')}<b>Photo</b><small>L’IA regarde ton plat</small>${aiReady()?'</label>':'</button>'}
      <button class="fd-mode" data-act="mealMode" data-v="text">${ic('pen')}<b>L’écrire</b><small>Décris ce que tu manges</small></button>
      <button class="fd-mode" data-act="mealMode" data-v="pick">${ic('repas')}<b>Composer</b><small>Touche les aliments de ta liste</small></button></div>
    <p class="muted" style="font-size:12.5px;text-align:center">Les trois façons comptent pareil : calories, validation et sucres interdits. Photo : tout le plat dans le cadre, vu d’au-dessus, avec la boisson.</p>`;
  const h2=M.state==='result'&&r&&r.verdict==='valide'?'C’est validé':M.state==='ask'?'Une précision':M.state==='text'?'J’écris mon repas':M.state==='pick'?'Je compose mon repas':'Mon repas';
  openSheet(`<div class="grab"></div><div class="stack" style="gap:8px"><span class="lbl">Pointage repas${n?' · essai '+(M.state==='busy'?n+1:n):''}</span><h2>${h2}</h2>${(['idle','text','pick'].includes(M.state)||!n)&&M.state!=='ask'&&Object.keys(slotShares()).length>1?`<div class="chips">${chips}</div>`:''}</div>${body}`,'meal');
}
/* composer le repas avec la liste « Mon repas OMAD du soir » */
function plateItems(){const L=foodLists().omad,P=(MEAL&&MEAL.plate)||{};return Object.entries(P).filter(([,n])=>n>0).map(([id,n])=>{const f=L.find(x=>x.id===id);return f?{f,n}:null}).filter(Boolean)}
function plateTot(it){return it.reduce((a,{f,n})=>({k:a.k+(+f.k||0)*n,p:a.p+(+f.p||0)*n,g:a.g+(+f.g||0)*n,l:a.l+(+f.l||0)*n}),{k:0,p:0,g:0,l:0})}
function plateName(it){const xs=[...it].sort((a,b)=>b.f.k*b.n-a.f.k*a.n).slice(0,3).map(x=>x.f.n);const s=xs.map((x,i)=>i?x.toLowerCase():x).join(', ');return(s+(it.length>3?'…':'')).slice(0,60)}
function pickGrid(){const M=MEAL;if(!M)return'';const L=foodLists().omad,q=M.pq||'',xs=filterFoods(L,q);
  return xs.length?groupTiles(xs,'fdPick',{cnt:M.plate}):`<p class="empty">Rien de tel dans ta liste.</p><button class="describe" data-act="mealMode" data-v="text">${ic('pen')} L’écrire plutôt</button>`}
function pickBody(M){
  const it=plateItems(),t=plateTot(it),b=mealBudget();
  const lines=it.map(({f,n})=>`<div class="fd-line">${foodIcon(f,'sm')}<span class="fd-grow"><b>${esc(f.n)}</b><small>${n} × ${esc(f.q||'portion')} · ${Math.round(f.k*n)} kcal · ${Math.round(f.p*n)} g prot.</small></span><button class="fd-stp" data-act="pickDec" data-v="${esc(f.id)}" aria-label="Une portion de moins">−</button><span class="num">${n}</span><button class="fd-stp" data-act="pickInc" data-v="${esc(f.id)}" aria-label="Une portion de plus">+</button></div>`).join('');
  return`<section class="card tint k-meal" style="gap:10px"><div class="row between"><span class="lbl">Ton assiette</span><span class="num" style="font-size:13px">${Math.round(t.k)} / ${b.bk} kcal · ${Math.round(t.p)} / ${b.bp} g prot.</span></div>
    <div class="bar"><i style="width:${clamp(t.k/b.bk,0,1)*100}%;background:${t.k>b.bk*b.hi?'var(--bad)':'var(--c-meal)'}"></i></div>
    ${it.length?`<div class="fd-lines">${lines}</div>`:`<p class="muted" style="font-size:13.5px">Touche les aliments ci-dessous : chaque touche ajoute une portion.</p>`}</section>
   <input id="pkQ" class="fd-in" type="search" placeholder="Chercher un aliment" value="${esc(M.pq)}" autocomplete="off">
   <div id="pickGrid" class="stack" style="gap:8px">${pickGrid()}</div>
   <div class="fd-go"><button class="btn btn-meal" data-act="pickGo">${ic('check')} Valider mon repas${it.length?' · '+Math.round(t.k)+' kcal':''}</button></div>
   <button class="btn ghost" data-act="mealMode" data-v="idle">Changer de méthode</button>`}
/* analyse d'une assiette composée : mêmes règles que celles données à l'IA (budget, protéines, sucres interdits) */
function evalPlate(){
  const it=plateItems(),t=plateTot(it),b=mealBudget(),L=foodLists().omad;
  const r={verdict:'valide',plat:plateName(it),kcal:Math.round(t.k),prot:Math.round(t.p),gluc:Math.round(t.g),lip:Math.round(t.l),resume:'',fix:[],ing:it.map(x=>(x.n>1?x.n+' × ':'')+x.f.n),question:'',suggestions:[],bad:''};
  const lo=b.bk*b.lo,hi=b.bk*b.hi,r10=x=>Math.max(10,Math.round(x/10)*10),low=s=>s.toLowerCase();
  if(t.k<lo){const f=it.map(x=>x.f).filter(f=>f.c==='feculents').sort((a,b)=>b.k-a.k)[0]||L.filter(f=>f.c==='feculents').sort((a,b)=>b.k-a.k)[0];
    r.fix.push(`Ajoute environ ${r10(lo-t.k)} kcal${f?` : par exemple 1 portion de ${low(f.n)} (${f.q}, +${Math.round(f.k)} kcal)`:''}`)}
  else if(t.k>hi){const x=[...it].sort((a,b)=>b.f.k-a.f.k)[0];r.fix.push(`Retire environ ${r10(t.k-hi)} kcal : par exemple 1 portion de ${low(x.f.n)} (−${Math.round(x.f.k)} kcal)`)}
  if(t.p<b.bp*.9){const f=it.map(x=>x.f).filter(f=>f.p>=10).sort((a,b)=>b.p-a.p)[0]||L.filter(f=>f.c==='proteines').sort((a,b)=>b.p-a.p)[0];
    r.fix.push(`Ajoute ${Math.ceil(b.bp-t.p)} g de protéines${f?` : par exemple 1 portion de ${low(f.n)} (${f.q}, +${Math.round(f.p)} g)`:''}`)}
  if(r.fix.length){r.verdict='a_corriger';r.resume=t.k>hi?'Assiette trop copieuse pour ton objectif.':'Il manque de quoi faire un vrai repas complet.'}
  else r.resume=b.omad?'Repas complet et dans ton budget : bon appétit.':'Dans ton budget, protéines correctes.';
  return r}

/* budget du repas : le même pour l'IA (photo, texte) et pour l'assiette composée */
function mealBudget(){
  const p=S.profile,tg=targets(),sh=slotShares();const ms=(S.meals||{})[today()]||[];const slot=MEAL&&sh[MEAL.slot]!=null?MEAL.slot:Object.keys(sh)[0];
  const ek=ms.reduce((a,m)=>a+m.kcal,0);
  const n=nowMin(),left=Math.max(0,tg.kcal-ek),rem=Object.keys(sh).filter(k=>k===slot||(!ms.some(m=>m.slot===k)&&n<(SLOT_END[k]||1440))).reduce((a,k)=>a+sh[k],0)||sh[slot];
  const ep=ms.reduce((a,m)=>a+m.prot,0),omad=p.omad;
  const bk=omad?Math.round(Math.max(300,left)/10)*10:Math.round(Math.max(150,Math.min(tg.kcal*sh[slot]*1.6,left*sh[slot]/rem))/10)*10;const bp=omad?Math.max(25,Math.round((tg.prot-ep)*.8)):Math.round(tg.prot*sh[slot]/rem*.85);
  return{bk,bp,omad,ms,lo:omad?.75:.8,hi:omad?1.15:1.2}}
function mealPrompt(){
  const M=MEAL,p=S.profile,{bk,bp,omad,ms}=mealBudget();
  const diet=(p.diet||[]).map(d=>({halal:'halal',sansporc:'sans porc',vegetarien:'végétarien',pescetarien:'pescétarien',sanslactose:'sans lactose'}[d])).join(', ');
  const last=M.tries[M.tries.length-1];const noQ=M.notes.length||M.asks>=2||M.skipped;
  const src=M.src==='text'?`Pas de photo : l’utilisateur décrit par écrit le plat qu’il va manger : « ${String(M.desc||'').replace(/[«»"]/g,'')} ».`:'Photo d’un plat avant de le manger.';
  return`Coach nutrition. ${src} Objectif : perte de gras, garder le muscle.${diet?' Régime '+diet+'.':''}
${omad?`Mode OMAD : c’est le SEUL repas de la journée${ms.length?' (complément du repas déjà validé)':''}. Il doit être copieux et complet : protéines, légumes, féculents. Budget ${bk} kcal : valide entre 75 % et 115 % du budget ; s’il en manque beaucoup, demande d’ajouter (fix). Au moins ${bp} g de protéines.`:`Repas : ${SLOT_L[M.slot]}. Budget ${bk} kcal (±20 %), au moins ${bp} g de protéines.`}${last?` Essai précédent : ${Math.round(last.kcal||0)} kcal, demandé : ${(last.fix||[]).join(' ; ')||'rien'}. Si c’est corrigé et dans le budget, valide.`:''}${M.notes.length?` Ingrédients donnés par l’utilisateur (à utiliser) : ${M.notes.join(' ; ')}.`:''}${M.skipped?' Ingrédients cachés inconnus : prends les plus probables.':''}
Estime les quantités et les calories. Verdict v :
"interdit" EN PRIORITÉ si tu vois un aliment ou une boisson très sucré, même en petite quantité : crêpe, gaufre, donut, muffin, cookie, brownie, gâteau, pâtisserie, viennoiserie sucrée, bonbons, chocolat, glace, chantilly, pâte à tartiner, céréales sucrées, soda ou canette sucrée, jus de fruits, ice tea, limonade, sirop, boisson énergisante, milkshake, frappé, café ou thé sucré aromatisé, bubble tea. Mets l’élément dans bad. Les boissons zéro sucre sont autorisées ;
"ok" si dans le budget et protéines correctes ;
"fix" sinon, avec 1 ou 2 actions courtes et chiffrées dans fix (ex. « Retire la moitié des frites (100 g) », « Ajoute 150 g de skyr ») ;
"non" si ce n’est pas de la nourriture${noQ?'':` ;
"q" si des ingrédients caloriques sont cachés (sandwich fermé, burger, sauce…) : q = question courte, sug = 4 à 6 ingrédients probables`}.
Pas de correction pour moins de 10 % d’écart. msg = 1 phrase courte, tutoiement. ing = 3 à 5 ingrédients vus.
JSON uniquement : {"v":"","bad":"","plat":"","kcal":0,"p":0,"g":0,"l":0,"msg":"","fix":[],"ing":[]${noQ?'':',"q":"","sug":[]'}}`;
}
function normAI(o){const V={ok:'valide',fix:'a_corriger',non:'pas_un_plat',q:'question',interdit:'interdit'};const L=a=>Array.isArray(a)?a.map(x=>String(x)).filter(Boolean):[];
  return{verdict:V[o.v]||o.verdict||'a_corriger',plat:o.plat||'',kcal:+o.kcal||0,prot:+(o.p??o.prot)||0,gluc:+(o.g??o.gluc)||0,lip:+(o.l??o.lip)||0,resume:o.msg||o.resume||'',fix:L(o.fix).slice(0,3),ing:L(o.ing).slice(0,6),question:o.q||o.question||'',suggestions:L(o.sug||o.suggestions).slice(0,8),bad:o.bad?String(o.bad):''}}
/* sucres interdits : contrôle par l'app, en plus de l'IA */
const SUGAR=[['crepe','crêpe'],['gaufre','gaufre'],['donut','donut'],['doughnut','donut'],['muffin','muffin'],['pancake','pancake'],['brioche','brioche'],['cookie','cookie'],['brownie','brownie'],['gateau','gâteau'],['patisserie','pâtisserie'],['viennoiserie','viennoiserie'],['pain au chocolat','pain au chocolat'],['chocolatine','chocolatine'],['eclair','éclair'],['macaron','macaron'],['churros','churros'],['cupcake','cupcake'],['cheesecake','cheesecake'],['tiramisu','tiramisu'],['bonbon','bonbons'],['confiserie','confiserie'],['chocolat','chocolat'],['nutella','pâte à tartiner'],['pate a tartiner','pâte à tartiner'],['glace','glace'],['creme glacee','glace'],['sorbet','sorbet'],['sundae','glace'],['chantilly','chantilly'],['creme fouettee','chantilly'],['milkshake','milkshake'],['milk shake','milkshake'],['frappe','frappé'],['frappuccino','frappuccino'],['bubble tea','bubble tea'],['soda','soda'],['coca','soda'],['cola','soda'],['fanta','soda'],['sprite','soda'],['oasis','soda'],['orangina','soda'],['schweppes','soda'],['ice tea','ice tea'],['iced tea','ice tea'],['the glace','ice tea'],['lipton','ice tea'],['limonade','limonade'],['canette','canette'],['red bull','boisson énergisante'],['monster','boisson énergisante'],['energy drink','boisson énergisante'],['boisson energisante','boisson énergisante'],['sirop','sirop'],['jus de fruit','jus de fruits'],['jus d orange','jus de fruits'],['jus de pomme','jus de fruits'],['nectar','jus de fruits'],['smoothie','smoothie'],['cereales chocolat','céréales sucrées'],['cereales sucrees','céréales sucrées'],['caramel','caramel'],['confiture','confiture'],['sucre','sucre'],['dessert','dessert']];
const SUGAR_OK=/z[eé]ro|light|sans sucre|diet|max|chocolat noir 8|chocolat noir 9|0 ?%/;
const normTxt=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/['’-]/g,' ');
function sugarHit(r,notes){const txt=normTxt([r.plat,...(r.ing||[]),r.bad,...(notes||[])].join(' | '));
  for(const[k,lbl]of SUGAR){const re=new RegExp('(^|[^a-z])'+k+'(s|x)?([^a-z]|$)');if(re.test(txt)){
    if(['soda','ice tea','limonade','canette','boisson énergisante','sucre'].includes(lbl)&&SUGAR_OK.test(txt))continue;
    if(k==='sucre'&&/sans sucre|sucre ajoute 0|peu sucre/.test(txt))continue;return lbl}}
  return null}

async function aiVision(cv,prompt){return normAI(await aiRaw(cv,prompt,400))}
/* repas écrit : appel IA sans image (aiText) ; photo : aiRaw */
async function aiMeal(M,prompt){return M.src==='text'?normAI(await aiText(prompt,400)):aiVision(M.cv,prompt)}

async function handleMealPhoto(file){
  const M=MEAL;if(!M||!file)return;M.src='photo';
  if(Date.now()-(file.lastModified||Date.now())>5*6e4){M.state='error';M.err='Cette photo ne vient pas d’être prise. Utilise l’appareil photo, pas la galerie.';mealSheet();return}
  let im;try{im=await loadImg(file)}catch(e){M.state='error';M.err='Impossible de lire la photo.';mealSheet();return}
  const sc=Math.min(1,640/Math.max(im.width,im.height));const cv=document.createElement('canvas');cv.width=Math.round(im.width*sc);cv.height=Math.round(im.height*sc);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
  M.img=cv.toDataURL('image/jpeg',.7);M.cv=cv;return analyzeMeal();
}
/* photo ou texte : analyse par l'IA */
async function analyzeMeal(){
  const M=MEAL;if(!M)return;if(M.src==='pick')return finishMeal(evalPlate());if(M.src!=='text'&&!M.cv)return;
  stopVoice();M.state='busy';M.res=null;M.ms=0;M.hid=false;mealSheet();const tok=++mealTok;const t0=performance.now();
  const tick=setInterval(()=>{const el=$('#aiT');if(el)el.textContent=nf((performance.now()-t0)/1000,1)+' s'},100);
  try{const r=await aiMeal(M,mealPrompt());clearInterval(tick);M.ms=Math.round(performance.now()-t0);if(MEAL!==M||tok!==mealTok)return;
    return finishMeal(r);
  }catch(e){clearInterval(tick);if(MEAL!==M)return;
    if(e&&e.bg&&(M.bgRetry||0)<2){M.bgRetry=(M.bgRetry||0)+1;M.hid=false;if(document.hidden){M.state='retry';mealSheet();return}logE('ai','relance automatique après arrière-plan');return analyzeMeal()}
    M.state='error';M.err=e&&e.message?e.message:'L’analyse a échoué. Réessaie.'}
  mealSheet();
}
/* suite commune aux trois façons de pointer (photo, texte, assiette composée) : sucres interdits, question, validation, cagnotte */
function finishMeal(r){
  const M=MEAL;if(!M)return;const notes=[...M.notes,M.src==='text'?M.desc:''].filter(Boolean);
  const hit=r.verdict==='interdit'?(r.bad||sugarHit(r,notes)||'sucre'):sugarHit(r,notes);
  if(hit&&r.verdict!=='pas_un_plat'){r.verdict='interdit';r.bad=r.bad||hit;M.res=r;M.tries.push({verdict:'interdit',kcal:r.kcal,fix:[]});M.state='result';logE('repas','interdit : '+r.bad);mealSheet();return}
  if(r.verdict==='question'&&M.asks<2&&!M.skipped&&M.src!=='pick'){M.asks++;M.askQ=r.question;M.askSug=(r.suggestions||[]).map(x=>String(x).slice(0,30)).slice(0,8);M.answer='';M.picks=[];M.askMode='voice';M.voiceErr='';M.state='ask';mealSheet();return}
  if(r.verdict==='question')r.verdict='a_corriger';
  M.res=r;M.tries.push({verdict:r.verdict,kcal:r.kcal,fix:r.fix});M.state='result';
  if(r.verdict==='valide'){const ds=today();S.meals=S.meals||{};(S.meals[ds]=S.meals[ds]||[]).push({id:'m'+Date.now().toString(36),t:Date.now(),slot:M.slot,nom:String(r.plat||'Repas').slice(0,60),kcal:+r.kcal||0,prot:+r.prot||0,gluc:+r.gluc||0,lip:+r.lip||0,tries:M.tries.length,src:M.src||'photo'});
    const nm=nowMin(),o=S.profile.omad?omadInfo(ds):null;const first=S.meals[ds].length===1;M.gain=o?(first?(nm<=o.end+30?OMAD_PTS:Math.round(OMAD_PTS/2)):0):MEAL_PTS;
    if(M.gain)addPts(M.gain,(o&&nm>o.end+30?'Repas en retard · ':'Repas validé · ')+String(r.plat||SLOT_L[M.slot]).slice(0,40),'meal');checkPerfect(ds);save();render()}
  mealSheet();
}
/* dictée vocale (Safari : reconnaissance vocale d'Apple) */
let REC=null;
function stopVoice(){if(REC){try{REC.stop()}catch(e){}REC=null}if(MEAL)MEAL.listening=false}
function toggleVoice(){
  const M=MEAL;if(!M)return;if(M.listening){stopVoice();mealSheet();return}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){M.askMode='text';M.voiceErr='La dictée de l’app n’est pas disponible ici : touche le micro du clavier pour dicter.';mealSheet();setTimeout(()=>$('#ansIn')?.focus(),60);return}
  const rec=new SR();REC=rec;rec.lang='fr-FR';rec.interimResults=true;rec.continuous=true;let fin=M.answer||'';
  rec.onresult=e=>{let tmp='';for(let i=e.resultIndex;i<e.results.length;i++){const x=e.results[i];if(x.isFinal)fin=(fin+' '+x[0].transcript).trim();else tmp+=x[0].transcript}
    M.answer=fin;const el=$('#ansIn');if(el)el.value=(fin+' '+tmp).trim();else if(fin||tmp){M.answer=(fin+' '+tmp).trim();mealSheet()}};
  rec.onerror=e=>{if(REC!==rec)return;M.voiceErr=e.error==='not-allowed'||e.error==='service-not-allowed'?'Micro ou dictée refusés : autorise le micro pour ce site (aA → Réglages du site) et active Siri et Dictée dans Réglages.':e.error==='no-speech'?'Je n’ai rien entendu. Réessaie ou décris par écrit.':'La dictée a coupé. Réessaie ou décris par écrit.'};
  rec.onend=()=>{if(REC===rec)REC=null;M.listening=false;if(MEAL===M&&(M.state==='ask'||M.state==='text'))mealSheet()};
  try{rec.start();M.listening=true;M.voiceErr=''}catch(e){M.voiceErr='Impossible de démarrer la dictée.'}mealSheet();
}



/* ---------- REPAS ---------- */
function dietOK(r){const d=S.profile.diet||[];if(r.only&&!d.includes('vegetarien')&&!d.includes('pescetarien'))return false;if(d.includes('vegetarien')&&r.k&&r.k!=='veg')return false;if(d.includes('pescetarien')&&r.k==='meat')return false;return true}
function mealsFor(ds){
  const p=S.profile,tg=targets(),w=Math.max(0,weekOf(ds)),wd=dow(parseYmd(ds));
  const M=R.filter(r=>r.slot==='m'&&dietOK(r)),B=R.filter(r=>r.slot==='b'),SN=R.filter(r=>r.slot==='s');
  const off=(w*4+cycleOf(ds)*3)%M.length;const Lp=[0,0,1,1,2,2,3],Dp=[1,2,2,3,3,0,0];
  const L=M[(Lp[wd]+off)%M.length];let D=M[(Dp[wd]+off)%M.length];if(D===L)D=M[(Dp[wd]+off+1)%M.length];
  let sh,out;
  if(p.omad){sh={o1:.6,o2:.25,o3:.15};out=[{slot:'o1',label:'Plat principal',r:D},{slot:'o2',label:'Complément',r:B[(wd+w)%B.length]},{slot:'o3',label:'Dessert protéiné',r:SN[(wd+w)%SN.length]}]}
  else{sh=p.meals===4?{b:.25,l:.32,s:.12,d:.31}:{b:.28,l:.38,d:.34};out=[{slot:'b',label:'Petit-déjeuner',r:B[(wd+w)%B.length]},{slot:'l',label:'Déjeuner',r:L}];
  if(p.meals===4)out.push({slot:'s',label:'Collation',r:SN[(wd+w)%SN.length]});
  out.push({slot:'d',label:'Dîner',r:D})}
  for(const m of out){const base=macros(m.r.ing).k;m.f=Math.round(clamp(tg.kcal*sh[m.slot]/base,.6,p.omad?2.6:1.8)*20)/20;m.mac=macros(m.r.ing,m.f)}
  return out;
}
const ingName=id=>{const d=S.profile.diet||[];let n=I[id][0];if(d.includes('halal')&&MEAT.includes(id))n+=' (halal)';if(d.includes('sanslactose')&&DAIRY.includes(id))n+=' sans lactose';return n};
const qtyTxt=(id,g)=>id==='oeuf'?`${Math.max(1,Math.round(g/60))} œuf${Math.round(g/60)>1?'s':''}`:id==='lait'?`${Math.round(g/10)*10} ml`:`${Math.max(5,Math.round(g/5)*5)} g`;
function renderRepas(){
  const sub=V.foodSub;
  return`<header class="top"><div class="stack" style="gap:4px"><span class="lbl">Alimentation · courses · budget</span><h1>Repas</h1></div></header>
  <div class="seg">${[['menu','Menu'],['aliments','Aliments'],['courses','Courses'],['cibles','Objectifs']].map(([k,l])=>`<button class="${sub===k?'on':''}" data-act="foodSub" data-v="${k}">${l}</button>`).join('')}</div>
  ${sub==='courses'?renderCourses():sub==='cibles'?renderCibles():sub==='aliments'?renderAliments():renderMenu()}`;
}
function renderMenu(){
  const t=today(),ds=V.foodDate||t,mon=mondayOf(ds),tg=targets();const ms=mealsFor(ds);
  const tot=ms.reduce((a,m)=>({k:a.k+m.mac.k,p:a.p+m.mac.p,c:a.c+m.mac.c,l:a.l+m.mac.l}),{k:0,p:0,c:0,l:0});
  const strip=Array.from({length:7},(_,i)=>{const d=addDs(mon,i);return`<button class="wd ${d===ds?'on':''}" data-act="foodDate" data-v="${d}">${DAYS[i]}<b>${parseYmd(d).getDate()}</b><i class="dot"></i></button>`}).join('');
  const bar=(l,v,tv,u,c)=>`<div class="macro"><span class="muted">${l}</span><div class="bar ${c}"><i style="width:${clamp(v/tv,0,1)*100}%"></i></div><span class="num">${Math.round(v)}/${tv} ${u}</span></div>`;
  const tasks=dayTasks(ds);
  return`<div class="week">${strip}</div>
  <section class="card"><div class="row between"><span class="lbl">${ds===t?'Aujourd’hui':fmtDate(parseYmd(ds))}</span><span class="num muted" style="font-size:13px">${Math.round(tot.k)} / ${tg.kcal} kcal</span></div>
   ${bar('Protéines',tot.p,tg.prot,'g','m')}${bar('Glucides',tot.c,tg.carb,'g','')}${bar('Lipides',tot.l,tg.fat,'g','w')}${tot.p<tg.prot-10?`<p class="muted" style="font-size:13px">Il manque ${Math.round(tg.prot-tot.p)} g de protéines : ajoute ${Math.round((tg.prot-tot.p)/11*100/50)*50} g de skyr ou de fromage blanc dans la journée.</p>`:''}</section>
  <section class="card" style="gap:0">${ms.map(m=>{const tk=tasks.find(x=>x.slot===m.slot);const pu=tk?S.punches[tk.key]:null;
    return`<button class="meal" data-act="recipe" data-ds="${ds}" data-slot="${m.slot}"><span class="lbl">${m.label}${tk?' · '+hm(tk.start):''}</span><span style="min-width:0"><b>${esc(m.r.n)}</b><br><span class="muted num" style="font-size:13px">${Math.round(m.mac.k)} kcal · ${Math.round(m.mac.p)} g prot. · ${m.r.t} min</span></span>${pu&&pu.out?'<span class="stamp st-done">Mangé</span>':ic('arrow')}</button>`}).join('')}</section>
  <section class="flat"><p style="font-size:13.5px">Eau : <b class="num">${nf(tg.water,1)} L</b> par jour. Légumes à volonté en plus (ils ne sont pas comptés). Les plats marqués batch se cuisinent en 2-3 portions le jour des courses.</p></section>`;
}
function recipeSheet(ds,slot){
  const m=mealsFor(ds).find(x=>x.slot===slot);if(!m)return;const tk=dayTasks(ds).find(x=>x.slot===slot);const pu=tk?S.punches[tk.key]||{}:{};const isT=ds===today();
  openSheet(`<div class="grab"></div><span class="lbl">${m.label} · ${fmtShort(parseYmd(ds))}${m.r.batch?' · batch':''}</span><h2>${esc(m.r.n)}</h2>
   <div class="kv"><div><span class="lbl">Énergie</span><b>${Math.round(m.mac.k)} kcal</b></div><div><span class="lbl">Protéines</span><b>${Math.round(m.mac.p)} g</b></div></div>
   <section class="card" style="gap:0"><span class="lbl" style="margin-bottom:6px">Pour 1 portion (ajustée à tes besoins)</span>${m.r.ing.map(([id,g])=>`<div class="ing" style="grid-template-columns:1fr auto"><span class="nm">${esc(ingName(id))}</span><span class="num">${qtyTxt(id,g*m.f)}</span></div>`).join('')}</section>
   <section class="stack" style="gap:8px"><span class="lbl">Préparation · ${m.r.t} min</span><ol class="steps">${m.r.steps.map(s=>`<li>${s}</li>`).join('')}</ol></section>
   ${isT&&tk?(pu.out?'':pu.in?`<button class="btn" data-act="punch" data-k="${tk.key}" data-w="out">${ic('check')} Pointer la fin du repas</button>`:`<button class="btn" data-act="punch" data-k="${tk.key}" data-w="in">${ic('check')} Pointer le début du repas</button>`):''}`);
}
const STORES={lidl:['Lidl',.9],aldi:['Aldi',.89],leclerc:['E.Leclerc',.95],auchan:['Auchan',.98],inter:['Intermarché',1],superu:['Super U',1],carrefour:['Carrefour',1.03],monop:['Monoprix',1.22]};
const SWAP={poulet:'Cuisses de poulet désossées : environ −30 %',boeuf5:'Moitié bœuf, moitié lentilles dans le chili et la bolognaise : −35 %',colin:'Colin ou merlu en promo surgelé, ou thon en boîte',skyr:'Fromage blanc 0 % à la place du skyr : −50 %',fruitsR:'Bananes ou pommes à la place des fruits rouges : −60 %',amandes:'Cacahuètes nature : −55 %',tofu:'Œufs à la place du tofu : −40 %',dinde:'Poulet en gros conditionnement',tortilla:'Pain complet à la place des tortillas'};
function shopData(){
  const t=today();const p=S.profile;let mon;
  if(V.shopNext==null)V.shopNext=dow(new Date())>=4;
  mon=addDs(mondayOf(t),V.shopNext?7:0);
  const midIdx=(p.shopDay+3)%7;const mid=addDs(mon,midIdx);
  const big=p.shopDay===0?mon:addDs(mon,p.shopDay-7);
  const agg={};
  for(let i=0;i<7;i++){const ds=addDs(mon,i);for(const m of mealsFor(ds))for(const[id,g]of m.r.ing){const a=agg[id]||(agg[id]={id,g:0,g2:0});a.g+=g*m.f;if(I[id][8]&&i>midIdx)a.g2+=g*m.f}}
  const sf=STORES[p.store][1];const lines=[];
  const needTxt=(id,g)=>id==='oeuf'?`${Math.ceil(g/60)} œufs`:id==='lait'?`${nf(g/1000,1)} L`:g>=1000?`${nf(g/1000,1)} kg`:`${Math.max(10,Math.round(g/10)*10)} g`;
  for(const a of Object.values(agg)){const x=I[a.id];const pantry=PANTRY.includes(a.id),vrac=VRAC.includes(a.id);
    const push=(g,trip,packs)=>{if(g<=0)return;let cost,buy;
      if(pantry){cost=g/1000*x[5]*sf;const pct=Math.round(g/x[6]*100);buy=x[7]==='Surgelés'?`1 sachet de ${x[6]>=1000?nf(x[6]/1000,1)+' kg':x[6]+' g'} · ${pct} % utilisé`:`stock · ${pct} % du paquet`}
      else if(vrac){const kg=Math.max(.1,Math.ceil(g/100)/10);cost=kg*x[5]*sf;buy=`au poids · ${nf(kg,1)} kg`}
      else{cost=packs*x[6]/1000*x[5]*sf;buy=a.id==='oeuf'?`${packs} boîte${packs>1?'s':''} de 12`:a.id==='lait'?`${packs} × 1 L`:`${packs} × ${x[6]>=1000?nf(x[6]/1000,1)+' kg':x[6]+' g'}`}
      lines.push({id:a.id+trip,ing:a.id,trip,name:ingName(a.id),ray:x[7],need:needTxt(a.id,g),buy,cost,pantry})};
    const total=Math.max(1,Math.ceil(a.g/x[6]-.08));
    if(pantry||!x[8]||a.g2<=0){push(a.g,1,total);continue}
    if(vrac){push(a.g-a.g2,1);push(a.g2,2);continue}
    const p2=Math.round(total*a.g2/a.g);
    if(p2<=0||p2>=total){push(a.g,p2>=total&&a.g2>=a.g?2:1,total);continue}
    push(a.g-a.g2,1,total-p2);push(a.g2,2,p2)}
  lines.push({id:'epices1',ing:'epices',trip:1,name:'Épices, ail, sauce soja, vinaigre',ray:'Épicerie',need:'pour la semaine',buy:'placard',cost:1.5,pantry:true});
  const total=lines.reduce((a,l)=>a+l.cost,0);
  return{mon,big,mid,lines,total,wk:ymd(parseYmd(mon))};
}
function renderCourses(){
  const p=S.profile,d=shopData();const ck=S.shopChecked[d.wk]||{};const over=d.total>p.budget;
  const store=STORES[p.store][0];
  const group=trip=>{const ls=d.lines.filter(l=>l.trip===trip);const rays=[...new Set(ls.map(l=>l.ray))];
    return rays.map(r=>`<span class="lbl" style="padding-top:12px">${r}</span>${ls.filter(l=>l.ray===r).sort((a,b)=>a.name.localeCompare(b.name)).map(l=>`<button class="ing ${ck[l.id]?'on':''}" data-act="ck" data-v="${l.id}"><span class="ck ${ck[l.id]?'on':''}">${ck[l.id]?ic('check'):''}</span><span class="nm">${esc(l.name)}<small>${l.need} · ${l.buy}</small></span><span class="num">${eur(l.cost)}</span></button>`).join('')}`).join('')};
  const top=d.lines.filter(l=>SWAP[l.ing]).sort((a,b)=>b.cost-a.cost).slice(0,3);
  const t1=d.lines.filter(l=>l.trip===1).reduce((a,l)=>a+l.cost,0),t2=d.total-t1;
  return`<div class="seg"><button class="${!V.shopNext?'on':''}" data-act="shopWk" data-v="0">Cette semaine</button><button class="${V.shopNext?'on':''}" data-act="shopWk" data-v="1">Semaine prochaine</button></div>
  <section class="card"><div class="row between"><span class="lbl">Budget · semaine du ${fmtShort(parseYmd(d.mon))}</span><span class="stamp ${over?'st-miss':'st-done'}">${over?'Dépassé':'OK'}</span></div>
   <div class="row" style="align-items:baseline;gap:8px"><span class="num" style="font-size:38px;letter-spacing:-.03em">${eur(d.total)}</span><span class="muted">/ ${eur(p.budget)}</span></div>
   <div class="bar ${over?'b':'m'}"><i style="width:${clamp(d.total/p.budget,0,1)*100}%"></i></div>
   <div class="chips">${Object.entries(STORES).map(([k,[n]])=>`<button class="chip sm ${p.store===k?'on':''}" data-act="store" data-v="${k}">${n}</button>`).join('')}</div>
   <a class="btn ghost sm" style="width:100%" href="https://www.google.com/maps/search/${encodeURIComponent(store)}" target="_blank" rel="noopener">${ic('map')} ${esc(store)} le plus proche</a>
   <p class="muted" style="font-size:12.5px">Prix moyens estimés (France, automne 2026), ajustés selon l’enseigne. Placard et surgelés (riz, huile, légumes surgelés…) sont comptés au prorata de ce que tu consommes : la première semaine coûte un peu plus, les suivantes moins.</p></section>
  ${over&&top.length?`<section class="card"><span class="lbl">Pour revenir dans le budget</span>${top.map(l=>`<p style="font-size:14px">${SWAP[l.ing]}</p>`).join('')}</section>`:''}
  <section class="card" style="gap:0"><div class="row between"><h3>${ic('courses')} Grandes courses · ${fmtShort(parseYmd(d.big))}</h3><span class="num">${eur(t1)}</span></div><p class="muted" style="font-size:13px;padding-top:4px">Tout l’épicerie, les surgelés, et le frais pour lundi → ${DAYS_L[(p.shopDay+3)%7]}.</p>${group(1)}</section>
  <section class="card" style="gap:0"><div class="row between"><h3>${ic('courses')} Petites courses · ${fmtShort(parseYmd(d.mid))}</h3><span class="num">${eur(t2)}</span></div><p class="muted" style="font-size:13px;padding-top:4px">Le frais pour la fin de semaine : il reste bon jusqu’au dimanche.</p>${group(2)}</section>`;
}
function renderCibles(){
  const tg=targets(),p=S.profile;
  return`<section class="card"><span class="lbl">Tes cibles quotidiennes</span>
   <div class="kv"><div><span class="lbl">Calories</span><b>${tg.kcal}</b></div><div><span class="lbl">Protéines</span><b>${tg.prot} g</b></div><div><span class="lbl">Glucides</span><b>${tg.carb} g</b></div><div><span class="lbl">Lipides</span><b>${tg.fat} g</b></div><div><span class="lbl">Fibres</span><b>30-35 g</b></div><div><span class="lbl">Eau</span><b>${nf(tg.water,1)} L</b></div></div></section>
  <section class="card"><span class="lbl">Comment c’est calculé</span>
   <div class="ledger"><span>Métabolisme de base (Mifflin-St Jeor, ${tg.a} ans)</span><span class="num">${Math.round(tg.bmr)} kcal</span></div>
   <div class="ledger"><span>Dépense totale · ${(ACTIVITY[p.activity]||ACTIVITY.bureau)[1].toLowerCase()} + sport</span><span class="num">${Math.round(tg.tdee)} kcal</span></div>
   <div class="ledger"><span>Déficit ${PACE[p.pace][1].toLowerCase()} (−${Math.round(tg.def*100)} %)</span><span class="num">−${Math.round(tg.tdee-tg.kcal)} kcal</span></div>
   <div class="ledger"><span>Perte attendue</span><span class="num">${nf(tg.lossWk,2)} kg/sem.</span></div>
   <p style="font-size:13.5px;padding-top:8px">Protéines à environ 2 g par kg de poids visé (${nf(p.goal,0)} kg) : c’est ce qui protège et construit le muscle pendant que tu perds du gras. Lipides à 0,8 g/kg pour les hormones. Le reste en glucides, placés surtout autour de l’entraînement. Les cibles se recalculent à chaque pesée.</p></section>
  <section class="flat"><p style="font-size:13px">Repères généraux, pas un avis médical. Avec ${nf(tg.w,0)} kg, un bilan chez ton médecin (tension, glycémie, lipides) avant d’accélérer est une bonne idée.</p></section>`;
}


/* ============ listes d'aliments (enregistrées dans S.foodLists) ============ */
// 1. « Autorisé pendant la journée » (hors repas OMAD) · 2. « Mon repas OMAD du soir » (par catégorie, valeurs pour une portion)
const FCAT={feculents:['Féculents','🍚'],proteines:['Protéines','🍗'],legumes:['Légumes','🥦'],fruits:['Fruits','🍎'],laitiers:['Produits laitiers','🧀'],gras:['Matières grasses','🫒'],epices:['Épices et sauces','🌶️'],boissons:['Boissons','💧']};
// valeurs proposées pour un aliment ajouté : [portion, kcal, prot, gluc, lip]
const FCAT_DEF={feculents:['75 g cru',260,8,52,2],proteines:['150 g',200,30,0,8],legumes:['150 g',40,2,6,.5],fruits:['1 fruit',80,1,18,.3],laitiers:['1 portion',100,8,5,5],gras:['1 c. à soupe',90,0,0,10],epices:['1 c. à café',10,0,1,.5],boissons:['1 verre',0,0,0,0]};
const FOOD_DAY=[['☕','Café','sans sucre'],['🍵','Thé','sans sucre'],['🫖','Tisane','sans sucre'],['💧','Eau',''],['🫧','Eau gazeuse','']];
// [emoji ('' = pastille), nom, catégorie, portion, kcal, prot, gluc, lip]
const FOOD_OMAD=[
 ['🍚','Riz','feculents','75 g cru',265,6,58,1],['🍝','Pâtes','feculents','80 g cru',285,10,57,1.5],['🍞','Pain','feculents','2 tranches (60 g)',150,5,28,1.5],
 ['🥖','Baguette','feculents','¼ de baguette',160,5,33,.8],['🥔','Pommes de terre','feculents','250 g',195,5,43,.3],['🍠','Patate douce','feculents','200 g',170,3,40,.2],
 ['🫘','Lentilles','feculents','70 g cru',240,17,36,1],['🫘','Pois chiches','feculents','150 g (boîte)',180,10,24,4],['🫘','Haricots rouges','feculents','150 g (boîte)',165,12,22,1],
 ['🌾','Quinoa','feculents','70 g cru',255,10,45,4],['🌾','Semoule','feculents','70 g cru',250,9,50,1],['🌾','Boulgour','feculents','70 g cru',240,9,48,1],
 ['🌾','Flocons d’avoine','feculents','50 g',185,6.5,30,3.5],['🌯','Tortilla','feculents','1 galette',180,5,30,4.5],['🍜','Nouilles','feculents','80 g cru',285,9,58,1.5],
 ['🌽','Maïs','feculents','100 g',80,3,14,1.5],
 ['🥚','Œufs','proteines','2 œufs',145,12.5,.8,10],['🍗','Poulet','proteines','150 g',165,35,0,2.5],['🍗','Dinde','proteines','150 g',160,35,0,2],
 ['🥩','Bœuf (steak)','proteines','150 g',190,32,0,7],['🥩','Bœuf haché 5 %','proteines','125 g',160,26,0,6],['🍖','Agneau','proteines','120 g',280,25,0,20],
 ['🐟','Thon','proteines','1 boîte (110 g)',125,28,0,1],['🐟','Saumon','proteines','125 g',250,25,0,16],['🐟','Cabillaud','proteines','150 g',120,27,0,1],
 ['🐟','Sardines','proteines','1 boîte (100 g)',210,24,0,12],['🍤','Crevettes','proteines','150 g',140,30,0,1.5],['🍖','Jambon de dinde','proteines','4 tranches',85,16,1,2],
 ['🧆','Falafels','proteines','4 pièces',330,13,32,18],['','Tofu','proteines','150 g',190,20,3,11],
 ['🍅','Tomates','legumes','150 g',27,1.3,5,.3],['🥬','Salade','legumes','1 bol',12,1,1.5,.2],['🥒','Concombre','legumes','150 g',18,1,3,.2],
 ['🥕','Carottes','legumes','150 g',55,1.3,11,.3],['🥦','Brocoli','legumes','200 g',70,5.6,9,.8],['🥒','Courgettes','legumes','200 g',34,2.4,5,.6],
 ['🫛','Haricots verts','legumes','200 g',62,3.6,10,.4],['🥬','Épinards','legumes','200 g',46,5.8,2.8,.8],['🫑','Poivron','legumes','150 g',40,1.5,7.5,.5],
 ['🍆','Aubergine','legumes','200 g',50,2,9,.4],['🍄','Champignons','legumes','150 g',33,4.5,3,.5],['🥦','Chou-fleur','legumes','200 g',50,4,8,.6],
 ['🫛','Petits pois','legumes','150 g',120,8,16,.6],['🧅','Oignon','legumes','½ oignon',20,.6,4.5,.1],['🧄','Ail','legumes','1 gousse',4,.2,1,0],
 ['🍌','Banane','fruits','1 banane',105,1.3,25,.4],['🍎','Pomme','fruits','1 pomme',78,.4,19,.3],['🍐','Poire','fruits','1 poire',90,.6,22,.2],
 ['🍊','Orange','fruits','1 orange',70,1.4,16,.2],['🍊','Clémentines','fruits','2 clémentines',55,1,13,.2],['🥝','Kiwis','fruits','2 kiwis',90,1.7,20,.8],
 ['🍓','Fraises','fruits','150 g',50,1,11,.5],['🫐','Myrtilles','fruits','100 g',57,.7,14,.3],['🍇','Raisin','fruits','125 g',85,.9,20,.2],
 ['🥭','Mangue','fruits','150 g',90,1.2,22,.6],['🍍','Ananas','fruits','150 g',75,.8,18,.2],['🍑','Pêche','fruits','1 pêche',60,1.4,14,.4],
 ['🍉','Pastèque','fruits','250 g',75,1.5,19,.4],['🍋','Citron','fruits','½ citron',5,.2,1.5,0],
 ['🧀','Fromage','laitiers','30 g',110,7,.3,9],['🧀','Mozzarella','laitiers','½ boule',150,11,1,11],['🧀','Feta','laitiers','40 g',105,5.6,1.6,8.5],
 ['🥛','Yaourt nature','laitiers','1 pot (125 g)',65,5,6,2],['🥛','Skyr nature','laitiers','150 g',95,16.5,6,.3],['🥛','Fromage blanc 0 %','laitiers','200 g',96,15,8,.4],
 ['🥛','Lait','laitiers','1 verre (200 ml)',92,6.6,9.6,3.2],
 ['🫒','Huile d’olive','gras','1 c. à soupe',90,0,0,10],['🧈','Beurre','gras','10 g',75,0,0,8.3],['🥑','Avocat','gras','½ avocat',130,1.5,1.5,13],
 ['🥜','Amandes','gras','30 g',180,6.3,2.7,15.6],['🌰','Noix','gras','30 g',200,4.5,2,19.5],['🥜','Cacahuètes','gras','30 g',170,7.5,3,14.5],
 ['🫒','Olives','gras','40 g',60,.4,1,6],['','Crème fraîche','gras','2 c. à soupe',90,.7,.8,9],
 ['🧂','Sel','epices','1 pincée',0,0,0,0],['','Poivre','epices','1 pincée',0,0,0,0],['🌶️','Épices (cumin, paprika…)','epices','1 c. à café',8,.3,1,.3],
 ['🌿','Herbes fraîches','epices','1 poignée',3,.3,.5,0],['🫚','Gingembre','epices','1 c. à café',2,0,.4,0],['🍛','Curry','epices','1 c. à café',7,.3,1.2,.3],
 ['🥫','Sauce tomate','epices','100 g',35,1.5,6,.5],['🌶️','Harissa','epices','1 c. à café',10,.3,1,.6],['','Moutarde','epices','1 c. à café',8,.4,.3,.6],
 ['','Sauce soja','epices','1 c. à soupe',10,1,1,0],['','Vinaigre','epices','1 c. à soupe',3,0,.1,0],['','Mayonnaise','epices','1 c. à soupe',95,.2,.1,10.5],
 ['💧','Eau','boissons','1 verre',0,0,0,0],['🫧','Eau gazeuse','boissons','1 verre',0,0,0,0],['🍵','Thé','boissons','sans sucre',0,0,0,0],['☕','Café','boissons','sans sucre',2,.1,0,0]
];
const normFood=t=>normTxt(t).replace(/œ/g,'oe').replace(/æ/g,'ae');
const fidOf=n=>normFood(n).replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')||'x';
const mkDay=([e,n,q])=>({id:fidOf(n),n,e,q,c:'boissons'});
const mkOmad=([e,n,c,q,k,p,g,l])=>({id:fidOf(n),n,e,c,q,k,p,g,l});
function foodLists(){let L=S.foodLists;if(!L||!Array.isArray(L.day)||!Array.isArray(L.omad))L=S.foodLists={v:1,day:FOOD_DAY.map(mkDay),omad:FOOD_OMAD.map(mkOmad)};return L}
const filterFoods=(list,q)=>{const k=normFood(q).trim();return k?list.filter(f=>normFood(f.n).includes(k)):list};
const sameFood=(list,n)=>list.find(f=>normFood(f.n).trim()===normFood(n).trim());
const dayAllowedTxt=()=>{const d=foodLists().day.map(f=>f.n.toLowerCase());return d.length?(d.length>1?d.slice(0,-1).join(', ')+' ou '+d[d.length-1]:d[0])+' sans sucre':'eau, café ou thé sans sucre'};

/* emoji : proposé automatiquement d'après le nom (mots sans accents, du plus précis au plus général) ; sinon pastille avec l'initiale */
const EMO=[
 ['eau (gazeuse|petillante)|perrier|badoit|san pellegrino|eau de seltz','🫧','boissons'],['glacons?','🧊','boissons'],
 ['tisanes?|infusions?|verveine|camomille|tilleul|rooibos','🫖','boissons'],['the|the vert|the noir|matcha','🍵','boissons'],
 ['cafe|expresso|espresso|cappuccino|latte|ristretto|americano','☕','boissons'],
 ['lait de coco|noix de coco|coco','🥥','fruits'],['beurre de cacahuetes?|cacahuetes?|arachides?|amandes?|noisettes?|pistaches?|cajou','🥜','gras'],
 ['eau','💧','boissons'],['sodas?|coca|cola|limonade|jus|smoothie|milkshake|ice tea|sprite|fanta|orangina','🥤',''],['bieres?','🍺',''],['vins?','🍷',''],
 ['fromage blanc|yaourts?|yogourts?|yoghourts?|skyr|petits? suisses?|kefir|leben|lben|raib|faisselle','🥛','laitiers'],['lait','🥛','laitiers'],
 ['fromages?|emmental|comte|mozzarella|feta|chevre|camembert|parmesan|gruyere|raclette|cheddar|ricotta|brie|roquefort|burrata|halloumi|babybel|kiri','🧀','laitiers'],
 ['oeufs?|omelette','🥚','proteines'],['bacon|lardons?','🥓','proteines'],['saucisses?|merguez|hot dog|knacki|chipolatas?','🌭','proteines'],
 ['burgers?|hamburgers?|cheeseburgers?','🍔',''],['frites','🍟','feculents'],['pizzas?','🍕',''],['sandwichs?|panini|croque','🥪',''],
 ['kebab|pitas?|pittas?|shawarma|chawarma|durum','🥙',''],['tacos?','🌮',''],['wraps?|burritos?|tortillas?|fajitas?','🌯','feculents'],['falafels?','🧆','proteines'],
 ['sushis?|makis?|sashimis?','🍣','proteines'],['crevettes?|gambas','🍤','proteines'],['crabes?|surimi','🦀','proteines'],['homards?|langoustes?|langoustines?','🦞','proteines'],
 ['calamars?|encornets?|poulpes?|seiches?','🦑','proteines'],['huitres?|moules?|saint jacques','🦪','proteines'],
 ['poulet|dinde|volaille|pilons?|nuggets?|escalopes?','🍗','proteines'],['steaks?|boeuf|veau|viande|bavette|entrecote|rumsteck|hache|roti|kefta|kofta','🥩','proteines'],
 ['agneau|mouton|cotelettes?|jambon|gigot|cordon bleu','🍖','proteines'],
 ['thon|saumon|poissons?|cabillaud|colin|merlu|sardines?|maquereaux?|truites?|dorade|daurade|lieu|sole|tilapia|harengs?|anchois|loup|pangasius|morue','🐟','proteines'],
 ['patates? douces?','🍠','feculents'],['pommes? de terre|patates?|puree','🥔','feculents'],['riz|risotto','🍚','feculents'],['curry|dahl|dal|masala|tikka','🍛','epices'],
 ['pates|spaghettis?|tagliatelles?|penne|macaronis?|lasagnes?|fusilli|coquillettes?|raviolis?|gnocchis?','🍝','feculents'],['nouilles?|ramen|udon|soba|vermicelles?','🍜','feculents'],
 ['soupe|potage|veloute|bouillon|chorba|harira|ragout|pot au feu|tajine|couscous|chili con carne','🍲',''],['salade composee|salade cesar|salade nicoise|taboule|poke','🥗',''],
 ['brocolis?|chou fleur|choux fleurs|romanesco','🥦','legumes'],['salades?|laitue|roquette|mache|choux?|epinards?|blettes?|endives?|cresson|kale|mesclun','🥬','legumes'],
 ['sauce tomate|coulis|concasse|conserves?','🥫','epices'],['tomates?','🍅','legumes'],['concombres?|cornichons?|courgettes?','🥒','legumes'],['carottes?','🥕','legumes'],
 ['poivrons?','🫑','legumes'],['piments?|harissa|epices?|paprika|cumin|tabasco|sriracha|cayenne|ras el hanout|curcuma|cannelle','🌶️','epices'],
 ['mais','🌽','feculents'],['aubergines?','🍆','legumes'],['champignons?|cepes?|girolles?','🍄','legumes'],['ail','🧄','legumes'],['oignons?|echalotes?|poireaux?','🧅','legumes'],
 ['haricots? verts?|petits? pois|pois gourmands?|feves?|edamame','🫛','legumes'],['haricots?|lentilles?|pois chiches?|flageolets?|houmous|hummus','🫘','feculents'],
 ['noix|chataignes?|marrons?','🌰','gras'],['avocats?|guacamole','🥑','gras'],['olives?|huile','🫒','gras'],['beurre|margarine|ghee','🧈','gras'],['sel','🧂','epices'],
 ['herbes?|persil|basilic|coriandre|menthe|thym|romarin|ciboulette|aneth|laurier|origan','🌿','epices'],['gingembre','🫚','epices'],
 ['baguettes?','🥖','feculents'],['croissants?','🥐',''],['bagels?','🥯','feculents'],['bretzels?','🥨',''],['crepes?|galettes?|pancakes?|blinis?','🥞',''],
 ['pain|toasts?|biscottes?|naan|chapati|matlouh|khobz','🍞','feculents'],
 ['avoine|quinoa|semoule|boulgour|ble|cereales?|epeautre|sarrasin|millet|orge|muesli|polenta|farine','🌾','feculents'],
 ['bananes?','🍌','fruits'],['pommes?','🍎','fruits'],['poires?','🍐','fruits'],['oranges?|clementines?|mandarines?|pamplemousses?','🍊','fruits'],['citrons?','🍋','fruits'],
 ['raisins?','🍇','fruits'],['fraises?|framboises?','🍓','fruits'],['myrtilles?|cassis|mures?|fruits rouges','🫐','fruits'],['cerises?','🍒','fruits'],
 ['peches?|nectarines?|abricots?|brugnons?','🍑','fruits'],['mangues?','🥭','fruits'],['ananas','🍍','fruits'],['kiwis?','🥝','fruits'],['melons?','🍈','fruits'],['pasteques?','🍉','fruits'],
 ['chocolat','🍫',''],['bonbons?','🍬',''],['glaces?|sorbets?','🍨',''],['gateaux?|tartes?|patisseries?','🍰',''],['cookies?|biscuits?','🍪',''],['donuts?|beignets?','🍩',''],['miel','🍯',''],['pop ?corn','🍿','']
];
let EMO_RE=null;
function suggestFood(name){
  if(!EMO_RE)EMO_RE=EMO.map(([k,e,c])=>[new RegExp('(^| )('+k+')(s|x)?( |$)'),e,c]);
  const t=normFood(name).replace(/[^a-z0-9]+/g,' ').trim();const out=[];
  if(t)for(const[re,e,c]of EMO_RE)if(re.test(t)&&!out.some(x=>x.e===e))out.push({e,c});
  return out}
const suggestEmoji=n=>(suggestFood(n)[0]||{}).e||'';
const PAS=['--c-meal','--c-work','--c-sport','--c-free','--c-money','--c-perso'];
function foodIcon(f,cls=''){
  if(f.e)return`<span class="fd-i ${cls}" aria-hidden="true">${esc(f.e)}</span>`;
  const n=String(f.n||'?').trim();const ch=(n.match(/[\p{L}\p{N}]/u)||['?'])[0].toUpperCase();let h=0;for(const c of normFood(n))h=(h*31+c.charCodeAt(0))>>>0;
  return`<span class="fd-i fd-pas ${cls}" style="--pc:var(${PAS[h%PAS.length]})" aria-hidden="true">${esc(ch)}</span>`}

/* tuiles */
const nbsp=t=>esc(t).replace(/(\d) (?=[a-zA-Zµ%])/g,'$1&nbsp;');
function foodTiles(items,act,o={}){return items.map(f=>{const c=o.cnt&&o.cnt[f.id];
  return`<button class="fd-tile${o.edit?' edit':''}${c?' on':''}${o.out?' out':''}" data-act="${o.edit?'fdDel':act}" data-l="${o.l||''}" data-v="${esc(f.id)}" aria-label="${esc(f.n)}${o.edit?' : retirer':''}">${foodIcon(f)}<span class="fd-n">${esc(f.n)}</span>${f.q?`<small>${nbsp(f.q)}</small>`:''}${c?`<b class="fd-c num">×${c}</b>`:''}${o.edit?`<i class="fd-x">${ic('x')}</i>`:''}</button>`}).join('')}
function groupTiles(items,act,o){const out=[];const cats=[...Object.keys(FCAT),''];
  for(const c of cats){const xs=items.filter(f=>c?f.c===c:!FCAT[f.c]);if(xs.length)out.push(`<span class="lbl fd-cat">${c?FCAT[c][1]+' '+FCAT[c][0]:'Autres'}</span><div class="fd-grid">${foodTiles(xs,act,o)}</div>`)}
  return out.join('')}

/* pointages de la journée (hors repas) : S.foodLog[jour] = [{t, n, e, ok}] (ok = dans la liste 1) */
function logDay(f,ok){S.foodLog=S.foodLog||{};const d=today();(S.foodLog[d]=S.foodLog[d]||[]).push({t:Date.now(),n:String(f.n).slice(0,40),e:f.e||'',ok:!!ok});
  const cut=addDs(d,-75);for(const k in S.foodLog)if(k<cut)delete S.foodLog[k];save()}
function dayLogCard(){const lg=(S.foodLog||{})[today()]||[],omad=S.profile.omad;
  return`<section class="card fd-log" style="gap:10px"><div class="row between"><span class="lbl">Aujourd’hui hors repas</span>${omad&&lg.some(x=>!x.ok)?'<span class="pill p-miss">Jeûne rompu</span>':omad&&lg.length?'<span class="pill p-done">OMAD respecté</span>':''}</div>
   ${lg.length?`<div class="chips">${lg.map((x,i)=>`<button class="chip sm fd-lg${x.ok?'':' bad'}" data-act="fdLogDel" data-v="${i}" aria-label="Effacer ${esc(x.n)}">${x.e?esc(x.e)+' ':''}${esc(x.n)} · <span class="num">${clock(x.t)}</span></button>`).join('')}</div><p class="muted" style="font-size:12px">Touche un pointage pour l’effacer.</p>`:`<p class="muted" style="font-size:13.5px">Rien pointé pour l’instant.</p>`}</section>`}
function dayGrid(q,edit){const L=foodLists();const xs=filterFoods(L.day,q);let h=xs.length?`<div class="fd-grid">${foodTiles(xs,'fdLog',{edit,l:'day'})}</div>`:'';
  if(q.trim()&&!edit&&!sameFood(L.day,q)){const om=filterFoods(L.omad,q).filter(f=>!sameFood(L.day,f.n)).slice(0,6);const free=!om.length&&!sameFood(L.omad,q);
    h+=`<div class="fd-out"><span class="lbl" style="color:var(--bad)">Pas dans ta liste de la journée${S.profile.omad?' · casse ton OMAD':''}</span>
     <div class="fd-grid">${foodTiles(om,'fdOther',{out:1})}${free?`<button class="fd-tile out" data-act="fdOther" data-n="${esc(q.trim())}">${foodIcon({n:q,e:suggestEmoji(q)})}<span class="fd-n">${esc(q.trim())}</span><small>pointer quand même</small></button>`:''}</div>
     ${free?`<button class="describe" data-act="fdAdd" data-l="day" data-n="${esc(q.trim())}">${ic('plus')} Ajouter « ${esc(q.trim())} » à ma liste de la journée</button>`:''}</div>`}
  return h||`<p class="empty">Ta liste est vide : ajoute un aliment.</p>`}
let DF=null;
function dayFoodSheet(){DF=DF||{q:''};
  openSheet(`<div class="grab"></div><span class="lbl">Hors repas OMAD · sans sucre</span><h2>Dans la journée</h2>
   <p class="muted" style="font-size:13.5px">Touche ce que tu prends : ça ne casse pas ton jeûne.</p>
   <input id="dfQ" class="fd-in" type="search" placeholder="Chercher (ex. banane)" value="${esc(DF.q)}" autocomplete="off">
   <div id="dfGrid" class="stack" style="gap:10px">${dayGrid(DF.q,false)}</div>${dayLogCard()}`,'dayfood')}
function foodRefresh(){const from=DF&&DF.from;if(from==='dayfood'){DF={q:''};dayFoodSheet()}else{DF=null;closeSheet();render()}}
/* aliment hors liste 1 : avertissement « ça casse ton OMAD » */
function breakSheet(f){
  const o=S.profile.omad?omadInfo(today()):null,n=nowMin(),sug=sugarHit({plat:f.n,ing:[]},[]);
  DF=DF||{q:''};DF.item=f;DF.from=sheetName==='dayfood'?'dayfood':'tab';
  if(!o){logDay(f,false);toast(`${f.e?f.e+' ':''}${f.n} pointé`);foodRefresh();return}
  const win=n>=o.start-30&&n<=o.end+30;
  openSheet(`<div class="grab"></div><span class="lbl">OMAD</span><h2>${win?'C’est l’heure de ton repas':'Ça casse ton OMAD'}</h2>
   <div class="fd-big">${foodIcon(f,'xl')}<b>${esc(f.n)}</b></div>
   ${win?`<section class="card tint k-meal" style="gap:8px"><span class="lbl" style="color:var(--c-meal)">Fenêtre ouverte · ${hm(o.start)} → ${hm(o.end)}</span><p style="font-size:15px">Ajoute-le à ton repas plutôt que dans la journée : il sera compté avec le reste.</p></section>
     <button class="btn btn-meal" data-act="fdToMeal">${ic('repas')} Ajouter à mon repas</button><button class="btn ghost" data-act="fdBack">Annuler</button>`
   :`<section class="card" style="border:2px solid var(--bad);gap:8px"><span class="lbl" style="color:var(--bad)">Pas dans ta liste de la journée</span>
     <p style="font-size:15px">« ${esc(f.n)} » n’est pas autorisé hors repas : si tu le prends maintenant, ton jeûne est rompu. ${o.done?`Ton repas est déjà pris : prochain repas demain vers <b>${hm(o.start)}</b>.`:`Ton repas est à <b>${hm(o.start)}</b>${n<o.start?' (dans '+durTxt(o.start-n)+')':''}.`}${sug?` En plus, c’est un sucre interdit (${esc(sug)}).`:''}</p>
     <p class="muted" style="font-size:13px">Autorisé en attendant : ${esc(dayAllowedTxt())}.</p></section>
     <button class="btn" data-act="fdBack">Je ne le prends pas</button><button class="btn danger" data-act="fdBreak">Je le prends quand même</button>`}`,'dayfood');
}

/* onglet Repas → Aliments */
function renderAliments(){
  const which=V.foodList==='omad'?'omad':'day',edit=!!V.foodEdit;
  return`<div class="seg"><button class="${which==='day'?'on':''}" data-act="foodList" data-v="day">Dans la journée</button><button class="${which==='omad'?'on':''}" data-act="foodList" data-v="omad">Repas du soir</button></div>
  <section class="card" style="gap:12px">
   ${which==='day'?`<h2>Autorisé pendant la journée</h2><p class="muted" style="font-size:13.5px">Hors repas OMAD et sans sucre : ça ne casse pas ton jeûne. Touche un aliment pour le pointer.</p>`
    :`<h2>Mon repas OMAD du soir</h2><p class="muted" style="font-size:13.5px">Rangés par catégorie, sans sucre interdit. Quand tu pointes ton repas, touche-les pour composer ton assiette.</p>`}
   <div class="fd-bar"><input id="foodQ" class="fd-in" type="search" placeholder="Chercher un aliment" value="${esc(V.foodQ||'')}" autocomplete="off"><button class="chip sm${edit?' on':''}" data-act="fdEdit">${edit?'Terminé':'Modifier'}</button></div>
   ${edit?`<p class="muted" style="font-size:13px">Touche un aliment pour le retirer de la liste.</p>`:''}
   <div id="foodGrid" class="stack" style="gap:10px">${foodTabGrid()}</div>
   <button class="btn ghost" data-act="fdAdd" data-l="${which}">${ic('plus')} Ajouter un aliment</button>
   ${edit?`<button class="btn ghost sm" style="width:100%" data-act="fdReset" data-l="${which}">Remettre les aliments de départ</button>`:''}
  </section>
  ${which==='day'?dayLogCard():''}`}
function foodTabGrid(){const L=foodLists(),q=V.foodQ||'',edit=!!V.foodEdit;
  if(V.foodList!=='omad')return dayGrid(q,edit);
  const xs=filterFoods(L.omad,q);
  return(xs.length?groupTiles(xs,'fdInfo',{edit,l:'omad'}):`<p class="empty">Aucun aliment ne correspond.</p>`)+(q.trim()&&!edit&&!sameFood(L.omad,q)?`<button class="describe" data-act="fdAdd" data-l="omad" data-n="${esc(q.trim())}">${ic('plus')} Ajouter « ${esc(q.trim())} » à ma liste</button>`:'')}

/* ajouter un aliment */
let FD=null;
function fdNew(list,name){const n=(name||'').trim(),s=suggestFood(n)[0];const c=list==='omad'?(s&&FCAT[s.c]?s.c:'proteines'):'boissons';const d=FCAT_DEF[c];
  FD={list,n,e:s?s.e:'',manual:false,c,q:list==='omad'?d[0]:'',k:d[1],p:d[2],touched:false,from:sheetName==='dayfood'?'dayfood':'tab'};fdAddSheet()}
function fdEmoChips(){const F=FD;const c=suggestFood(F.n).map(x=>x.e);const base=F.list==='omad'?[FCAT[F.c][1],'🍽️','🥘']:['🍵','💧','🥤'];
  const all=[...new Set([F.e,...c,...base].filter(Boolean))].slice(0,7);
  return all.map(e=>`<button class="fd-emo${F.e===e?' on':''}" data-act="fdEmo" data-v="${esc(e)}" aria-label="Emoji ${esc(e)}">${esc(e)}</button>`).join('')+`<button class="fd-emo${F.e?'':' on'}" data-act="fdEmo" data-v="" aria-label="Pastille avec l’initiale">${foodIcon({n:F.n||'?',e:''},'sm')}</button>`}
function fdCatChips(){return Object.entries(FCAT).map(([k,[l,e]])=>`<button class="chip sm${FD.c===k?' on':''}" data-act="fdCat" data-v="${k}">${e} ${l}</button>`).join('')}
function fdPreview(){const p=$('#fdPrev'),c=$('#fdEmo');if(p)p.innerHTML=foodIcon(FD,'xl');if(c)c.innerHTML=fdEmoChips()}
function fdCapture(){const F=FD;if(!F)return;const v=id=>{const e=$('#'+id);return e?e.value:null};
  const n=v('fdName');if(n!=null)F.n=n;const q=v('fdQty');if(q!=null)F.q=q;const k=v('fdK');if(k!=null)F.k=k;const p=v('fdP');if(p!=null)F.p=p}
function fdAddSheet(){const F=FD,om=F.list==='omad';
  openSheet(`<div class="grab"></div><span class="lbl">${om?'Mon repas OMAD du soir':'Autorisé pendant la journée'}</span><h2>Nouvel aliment</h2>
   <div class="fd-new"><span id="fdPrev">${foodIcon(F,'xl')}</span><input id="fdName" class="fd-in" placeholder="Nom (ex. cerises)" value="${esc(F.n)}" autocomplete="off" autocapitalize="sentences"></div>
   <div class="field"><span class="lbl">Emoji proposé · touche pour changer</span><div class="fd-emos" id="fdEmo">${fdEmoChips()}</div></div>
   ${om?`<div class="field"><span class="lbl">Catégorie</span><div class="chips" id="fdCats">${fdCatChips()}</div></div>
    <div class="fd-form"><label><span class="lbl">Portion</span><input id="fdQty" class="fd-in" value="${esc(F.q)}" autocomplete="off"></label><label><span class="lbl">kcal</span><input id="fdK" class="fd-in" type="number" inputmode="decimal" min="0" value="${esc(F.k)}"></label><label><span class="lbl">Protéines g</span><input id="fdP" class="fd-in" type="number" inputmode="decimal" min="0" value="${esc(F.p)}"></label></div>
    <p class="muted" style="font-size:12.5px">Valeurs pour une portion, préremplies selon la catégorie : corrige-les si tu les connais.</p>`
    :`<p class="muted" style="font-size:12.5px">Seulement ce qui ne casse pas ton jeûne : boissons sans sucre, presque sans calories.</p>`}
   <button class="btn" data-act="fdAddSave">${ic('plus')} Ajouter à ma liste</button>`,'fdadd');
  if(!F.n)setTimeout(()=>{const i=$('#fdName');if(i)try{i.focus()}catch(e){}},60)}
function fdSave(){fdCapture();const F=FD;if(!F)return;const n=String(F.n||'').trim().slice(0,40);
  if(!n){toast('Écris le nom de l’aliment');return}
  const sug=sugarHit({plat:n,ing:[]},[]);if(sug){toast(`Sucre interdit (${sug}) : je ne l’ajoute pas`);return}
  const L=foodLists(),list=L[F.list];if(sameFood(list,n)){toast('Déjà dans ta liste');return}
  let id=fidOf(n),i=2;while(list.some(f=>f.id===id))id=fidOf(n)+'_'+i++;
  let item;if(F.list==='omad'){const d=FCAT_DEF[F.c]||FCAT_DEF.proteines,k=Math.max(0,+String(F.k).replace(',','.')||0),r=d[1]?k/d[1]:0;
    item={id,n,e:F.e||'',c:F.c,q:String(F.q||'').trim().slice(0,30)||'1 portion',k,p:Math.max(0,+String(F.p).replace(',','.')||0),g:Math.round(d[3]*r*10)/10,l:Math.round(d[4]*r*10)/10,mine:1}}
  else item={id,n,e:F.e||'',q:'',c:'boissons',mine:1};
  list.push(item);save();toast(`${item.e?item.e+' ':''}${n} ajouté à ta liste`);
  const from=F.from;FD=null;V.foodQ='';if(from==='dayfood'){DF={q:''};dayFoodSheet()}else{closeSheet();render()}}

/* boutons de l'onglet Repas */
Object.assign(ACT,{
  foodList:(el,v)=>{V.foodList=v;V.foodQ='';V.foodEdit=false;render()},
  fdEdit:()=>{V.foodEdit=!V.foodEdit;render()},
  fdLog:(el,v)=>{const f=foodLists().day.find(x=>x.id===v);if(!f)return;logDay(f,true);toast(`${f.e?f.e+' ':''}${f.n} pointé · ton OMAD continue`);if(sheetName==='dayfood')dayFoodSheet();else render()},
  fdLogDel:(el,v)=>{const lg=(S.foodLog||{})[today()]||[];const x=lg.splice(Number(v),1)[0];save();if(x)toast(`${x.n} effacé`);if(sheetName==='dayfood')dayFoodSheet();else render()},
  fdOther:(el,v)=>{const L=foodLists();const f=v?L.omad.find(x=>x.id===v):{n:el.dataset.n||'',e:suggestEmoji(el.dataset.n||'')};if(!f||!f.n)return;
    const inDay=sameFood(L.day,f.n);if(inDay){logDay(inDay,true);toast(`${f.n} pointé · ton OMAD continue`);if(sheetName==='dayfood')dayFoodSheet();else render();return}
    breakSheet(f)},
  fdBreak:()=>{if(!DF||!DF.item)return;logDay(DF.item,false);toast('Noté · jeûne rompu. Eau, café ou thé jusqu’au repas.');DF.q='';foodRefresh()},
  fdBack:()=>foodRefresh(),
  fdToMeal:()=>{const f=DF&&DF.item;if(!f)return;const om=foodLists().omad.find(x=>x.id===f.id||normFood(x.n)===normFood(f.n));DF=null;closeSheet();
    if(om)openMeal('pick',om.id);else openMeal(aiReady()?'text':'pick',f.n)},
  dayFood:()=>{DF={q:''};dayFoodSheet()},
  fdInfo:(el,v)=>{const f=foodLists().omad.find(x=>x.id===v);if(f)toast(`${f.e?f.e+' ':''}${f.n} · ${f.q} · ${Math.round(f.k)} kcal · ${nf(f.p,0)} g prot.`)},
  fdDel:(el,v)=>{const L=foodLists(),k=el.dataset.l==='omad'?'omad':'day',f=L[k].find(x=>x.id===v);L[k]=L[k].filter(x=>x.id!==v);save();render();if(f)toast(`${f.n} retiré de ta liste`)},
  fdReset:(el)=>{const k=el.dataset.l==='omad'?'omad':'day',L=foodLists();const def=k==='omad'?FOOD_OMAD.map(mkOmad):FOOD_DAY.map(mkDay);let n=0;
    for(const f of def)if(!L[k].some(x=>x.id===f.id)){L[k].push(f);n++}save();render();toast(n?`${n} aliment${n>1?'s':''} remis`:'Rien à remettre : tout y est')},
  fdAdd:(el)=>fdNew(el.dataset.l==='omad'?'omad':'day',el.dataset.n||''),
  fdEmo:(el,v)=>{if(!FD)return;fdCapture();FD.e=v||'';FD.manual=true;fdPreview()},
  fdCat:(el,v)=>{if(!FD)return;fdCapture();FD.c=v;FD.catSet=true;if(!FD.touched){const d=FCAT_DEF[v];FD.q=d[0];FD.k=d[1];FD.p=d[2]}if(!FD.manual)FD.e=suggestEmoji(FD.n)||'';fdAddSheet()},
  fdAddSave:()=>fdSave(),
  /* pointer le repas : photo, texte ou assiette composée */
  mealMode:(el,v)=>{const M=MEAL;if(!M)return;stopVoice();M.res=null;
    if(v==='pick'){M.state='pick'}else if(v==='text'){M.want='text';M.state=aiReady()?'text':'key'}else if(v==='photo'){M.want='photo';M.state='key'}else{M.state='idle'}
    mealSheet();if(M.state==='text')setTimeout(()=>{const a=$('#ansIn');if(a&&!a.value)try{a.focus()}catch(e){}},60)},
  mealRedo:()=>{const M=MEAL;if(!M)return;M.res=null;M.state=M.src==='pick'?'pick':'text';if(M.src==='text')M.answer=M.desc;mealSheet()},
  txtGo:()=>{const M=MEAL;if(!M)return;stopVoice();const el=$('#ansIn');if(el)M.answer=el.value;const t=String(M.answer||'').trim();
    if(t.length<3){toast('Écris ce qu’il y a dans ton repas');return}M.desc=t.slice(0,400);M.src='text';M.notes=[];M.asks=0;M.skipped=false;M.bgRetry=0;analyzeMeal()},
  fdPick:(el,v)=>{const M=MEAL;if(!M)return;M.plate[v]=Math.min(9,(M.plate[v]||0)+1);mealSheet()},
  pickInc:(el,v)=>{const M=MEAL;if(!M)return;M.plate[v]=Math.min(9,(M.plate[v]||0)+1);mealSheet()},
  pickDec:(el,v)=>{const M=MEAL;if(!M)return;M.plate[v]=Math.max(0,(M.plate[v]||0)-1);if(!M.plate[v])delete M.plate[v];mealSheet()},
  pickGo:()=>{const M=MEAL;if(!M)return;if(!plateItems().length){toast('Touche au moins un aliment de ta liste');return}M.src='pick';M.ms=0;finishMeal(evalPlate())}
});
/* recherche en direct et formulaire d'ajout (sans perdre le clavier) */
document.addEventListener('input',e=>{const id=e.target.id,v=e.target.value;
  if(id==='foodQ'){V.foodQ=v;const g=$('#foodGrid');if(g)g.innerHTML=foodTabGrid()}
  else if(id==='dfQ'&&DF){DF.q=v;const g=$('#dfGrid');if(g)g.innerHTML=dayGrid(v,false)}
  else if(id==='pkQ'&&MEAL){MEAL.pq=v;const g=$('#pickGrid');if(g)g.innerHTML=pickGrid()}
  else if(id==='fdName'&&FD){FD.n=v;if(!FD.manual)FD.e=suggestEmoji(v);
    if(FD.list==='omad'&&!FD.catSet){const s=suggestFood(v)[0];if(s&&FCAT[s.c]&&s.c!==FD.c){FD.c=s.c;
      if(!FD.touched){const d=FCAT_DEF[s.c];FD.q=d[0];FD.k=d[1];FD.p=d[2];for(const[i,x]of[['fdQty',FD.q],['fdK',FD.k],['fdP',FD.p]]){const el=$('#'+i);if(el)el.value=x}}
      const cc=$('#fdCats');if(cc)cc.innerHTML=fdCatChips()}}
    fdPreview()}
  else if((id==='fdQty'||id==='fdK'||id==='fdP')&&FD){FD.touched=true;fdCapture()}
});
