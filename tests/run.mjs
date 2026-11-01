// Tests automatiques de Cadence. Lancer : npm test  (après npm install une première fois)
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { boot, wait, gemini, fixture } from './helpers.mjs';

const T = [];
const test = (name, fn) => T.push({ name, fn });
const noErr = (a) => assert.deepEqual(a.errors, [], 'erreurs JS : ' + a.errors.join(' | '));
const okAI = { v: 'ok', plat: 'Poulet riz légumes', kcal: 2100, p: 130, g: 200, l: 60, msg: 'Parfait.', fix: [], ing: ['poulet', 'riz', 'légumes'] };

test('premier lancement : formulaire puis tous les onglets', async () => {
  const a = await boot({ now: '2026-11-04T10:00:00', state: null });
  for (let i = 0; i < 2; i++) a.click('[data-act="obNext"]');
  assert.equal(a.$$('[data-k="activity"]').length, 3, 'niveaux d’activité : 3 attendus');
  for (let i = 0; i < 2; i++) a.click('[data-act="obPrev"]');
  for (let i = 0; i < 7; i++) a.click('[data-act="obNext"]');
  assert.equal(a.$$('#tabs button').length, 5);
  for (const t of ['sommeil', 'sport', 'repas', 'cagnotte', 'jour']) { a.click(`[data-act="tab"][data-v="${t}"]`); assert.ok(a.text('#main').length > 50, 'onglet vide : ' + t); }
  noErr(a);
});

test('remise à zéro au démarrage (1er novembre)', async () => {
  const st = fixture('state.json'); delete st.reset5; st.ledger = [{ t: Date.now(), pts: 50, label: 'x', key: '' }];
  const a = await boot({ now: '2026-11-04T10:00:00', state: st });
  assert.equal(a.ev('S.ledger.length'), 0);
  assert.equal(a.ev('S.programStart'), a.ev('START_DAY'));
  noErr(a);
});

test('avant le départ : pointages bloqués', async () => {
  const a = await boot({ now: '2026-10-31T23:00:00', agenda: true });
  assert.match(a.text('#main'), /commence le dimanche 1er novembre/);
  assert.equal(a.ev('started()'), false);
  noErr(a);
});

test('jours de salle : jamais les jours qui commencent à midi', async () => {
  const a = await boot({ now: '2026-11-04T10:00:00', agenda: true });
  const r = JSON.parse(a.ev(`JSON.stringify(Array.from({length:14},(_,i)=>{const d=addDs('2026-11-01',i);return{d,s:!!sessionFor(d),sc:dayScore(d)}}))`));
  for (const x of r) if (x.s) assert.ok(x.sc >= 1, 'séance un jour à midi : ' + x.d);
  assert.equal(r.slice(0, 7).filter((x) => x.s).length, 3);
  assert.equal(r.slice(7).filter((x) => x.s).length, 3);
  noErr(a);
});

test('journée coupée : un seul service du début du premier à la fin du dernier', async () => {
  const a = await boot({ now: '2026-11-04T10:00:00', agenda: true });
  assert.deepEqual(JSON.parse(a.ev(`JSON.stringify(workBlocks('2026-11-01').blocks.map(b=>[b.s,b.e,b.t,b.loc]))`)), [[720, 1230, 'Resto', 'Centre-ville']]);
  assert.equal(a.ev(`dayTasks('2026-11-01').filter(t=>t.type==='travail').length`), 1);
  assert.equal(a.ev(`dayStats('2026-11-01').work`), 510);
  assert.equal(a.ev(`dayStats('2026-11-01').trips`), 2 * a.ev('S.profile.commute'), 'un seul aller-retour');
  // estimé (après la fin de l'agenda) et manuel suivent la même règle
  assert.equal(a.ev(`workBlocks('2026-11-22').src`), 'estime'); assert.equal(a.ev(`workBlocks('2026-11-22').blocks.length`), 1);
  a.ev(`S.workOv['2026-11-05']={on:true,blocks:[{s:885,e:1100},{s:600,e:800}]}`);
  assert.deepEqual(JSON.parse(a.ev(`JSON.stringify(workBlocks('2026-11-05').blocks.map(b=>[b.s,b.e]))`)), [[600, 1100]]);
  noErr(a);
});

test('travail en cours : oubli = moitié, pas fait = négatif', async () => {
  const a = await boot({ now: '2026-11-04T16:00:00', agenda: true });
  assert.match(a.text('.hero'), /En cours/);
  assert.match(a.text('.hero'), /oublié de pointer/);
  a.click('.hero [data-act="val"][data-v="forgot"]');
  assert.equal(a.ev('dayPts(today())'), 5);
  a.ev(`S.custom.push({id:'cx',type:'perso',title:'Lecture',start:nowMin()-30,dur:30,pts:20,repeat:'once',date:today()});render()`);
  a.ev(`valAct(today()+':cx','miss')`);
  assert.equal(a.ev('dayPts(today())'), -15);
  assert.ok(!/\bpts\b/.test(a.text('#main')), 'le mot « pts » ne doit plus apparaître');
  noErr(a);
});

test('salle : photo vérifiée par l’IA', async () => {
  const a = await boot({ now: '2026-11-05T09:05:00', agenda: true, ls: { 'cadence.gkey': 'AQ.test' }, fetch: (u) => u.includes('generateContent') ? gemini({ ok: true, msg: 'Salle reconnue' }) : null });
  const key = a.ev(`dayTasks(today()).find(x=>x.type==='sport').key`);
  a.ev(`valAct('${key}','ok')`);
  assert.match(a.text('.sheet h2'), /salle/);
  await a.ev(`handlePhoto({lastModified:Date.now()})`);
  assert.match(a.text('.sheet'), /VALIDÉ/);
  assert.equal(a.ev('dayPts(today())'), 50);
  noErr(a);
});

test('OMAD : avant la fenêtre refusé, pendant validé, après refusé', async () => {
  const a = await boot({ now: '2026-11-05T19:00:00', agenda: true, ls: { 'cadence.gkey': 'AQ.test' }, fetch: (u) => u.includes('generateContent') ? gemini(okAI) : null });
  a.ev('openMeal()'); assert.match(a.text('.sheet h2'), /Pas encore/); a.ev('closeSheet()');
  a.ev('S.profile.omadTime=nowMin()-10;render()');
  a.ev('openMeal()'); await a.ev('handleMealPhoto({lastModified:Date.now()})');
  assert.match(a.text('.sheet'), /VALIDÉ/);
  assert.equal(a.ev('dayPts(today())'), 40);
  a.ev('closeSheet();S.profile.omadTime=nowMin()-300;render()');
  a.ev('openMeal()'); assert.match(a.text('.sheet h2'), /déjà pris/);
  noErr(a);
});

test('repas : correction puis validation', async () => {
  let n = 0;
  const a = await boot({ now: '2026-11-04T22:00:00', agenda: true, ls: { 'cadence.gkey': 'AQ.test' }, fetch: (u) => u.includes('generateContent') ? gemini(++n === 1 ? { ...okAI, v: 'fix', kcal: 900, fix: ['Ajoute 2 œufs'] } : okAI) : null });
  a.ev('S.profile.omadTime=nowMin()-10');
  a.ev('openMeal()'); await a.ev('handleMealPhoto({lastModified:Date.now()})');
  assert.match(a.text('.sheet'), /À CORRIGER/); assert.match(a.text('.sheet'), /Ajoute 2 œufs/);
  await a.ev('handleMealPhoto({lastModified:Date.now()})');
  assert.match(a.text('.sheet'), /VALIDÉ/);
  noErr(a);
});

test('repas : question sur les ingrédients, réponse écrite', async () => {
  const prompts = []; let n = 0;
  const a = await boot({ now: '2026-11-04T22:00:00', agenda: true, ls: { 'cadence.gkey': 'AQ.test' }, fetch: (u, o) => { if (!u.includes('generateContent')) return null; prompts.push(JSON.parse(o.body).contents[0].parts[1].text); return gemini(++n === 1 ? { v: 'q', q: 'Qu’y a-t-il dans ton sandwich ?', sug: ['Poulet', 'Thon'] } : okAI); } });
  a.ev('S.profile.omadTime=nowMin()-10');
  a.ev('openMeal()'); await a.ev('handleMealPhoto({lastModified:Date.now()})');
  assert.match(a.text('.sheet h3'), /sandwich/);
  assert.ok(a.$('.sheet .mic') && a.$('.sheet .describe'));
  a.click('[data-act="askText"]'); a.click('[data-act="pickIng"][data-v="Poulet"]');
  a.click('[data-act="sendAns"]'); await wait(50);
  assert.match(prompts[1], /Poulet/);
  assert.match(a.text('.sheet'), /VALIDÉ/);
  noErr(a);
});

test('sucres interdits', async () => {
  const a = await boot({ now: '2026-11-04T22:00:00', agenda: true, ls: { 'cadence.gkey': 'AQ.test' }, fetch: (u) => u.includes('generateContent') ? gemini({ ...okAI, plat: 'Frappé', ing: ['lait', 'chantilly'] }) : null });
  const hit = (p, ing) => a.ev(`sugarHit(${JSON.stringify({ plat: p, ing })},[])`);
  assert.equal(hit('Burger + Coca', ['coca cola']), 'soda');
  assert.equal(hit('Burger + Coca zéro', ['coca zero']), null);
  assert.equal(hit('Crêpes', ['nutella']), 'crêpe');
  assert.equal(hit('Steak oignons caramélisés', ['steak']), null);
  a.ev('S.profile.omadTime=nowMin()-10');
  a.ev('openMeal()'); await a.ev('handleMealPhoto({lastModified:Date.now()})');
  assert.match(a.text('.sheet'), /INTERDIT/);
  assert.equal(a.ev('dayPts(today())'), 0);
  noErr(a);
});

const typeIn = (a, sel, v) => { const e = a.$(sel); e.value = v; e.dispatchEvent(new a.w.Event('input', { bubbles: true })); };

test('listes d’aliments : par défaut, emojis, sans sucre interdit, enregistrées', async () => {
  const a = await boot({ now: '2026-11-04T10:00:00', agenda: true });
  const L = JSON.parse(a.ev('JSON.stringify(foodLists())'));
  assert.deepEqual(L.day.map((f) => f.n), ['Café', 'Thé', 'Tisane', 'Eau', 'Eau gazeuse']);
  assert.ok(L.omad.length >= 60, 'liste du soir trop courte');
  for (const c of ['feculents', 'proteines', 'legumes', 'fruits', 'laitiers', 'gras', 'epices']) assert.ok(L.omad.some((f) => f.c === c), 'catégorie vide : ' + c);
  for (const n of ['Banane', 'Fromage', 'Œufs', 'Poulet', 'Thon', 'Riz', 'Pâtes', 'Pain', 'Pommes de terre', 'Lentilles', 'Yaourt nature', 'Tomates', 'Salade', 'Avocat', 'Huile d’olive']) assert.ok(L.omad.some((f) => f.n === n), 'manque : ' + n);
  for (const f of [...L.day, ...L.omad]) assert.equal(a.ev(`sugarHit({plat:${JSON.stringify(f.n)},ing:[]},[])`), null, 'sucre interdit : ' + f.n);
  assert.equal(new Set(L.omad.map((f) => f.id)).size, L.omad.length, 'identifiants en double');
  const emo = (n) => a.ev(`suggestEmoji(${JSON.stringify(n)})`);
  assert.equal(emo('Banane'), '🍌'); assert.equal(emo('Pommes de terre'), '🥔'); assert.equal(emo('Pomme'), '🍎');
  assert.equal(emo('Eau gazeuse'), '🫧'); assert.equal(emo('Œufs brouillés'), '🥚'); assert.equal(emo('Café'), '☕'); assert.equal(emo('Cerises'), '🍒');
  assert.equal(emo('Tempeh'), '');
  assert.ok(a.ev(`foodIcon({n:'Tempeh',e:''})`).includes('fd-pas'), 'pastille attendue');
  // onglet Repas → Aliments
  a.click('[data-act="tab"][data-v="repas"]'); a.click('[data-act="foodSub"][data-v="aliments"]');
  assert.equal(a.$$('#foodGrid .fd-tile').length, 5);
  a.click('[data-act="foodList"][data-v="omad"]');
  assert.ok(a.$$('#foodGrid .fd-tile').length >= 60);
  assert.match(a.text('#foodGrid'), /Féculents/); assert.match(a.text('#foodGrid'), /🍌/);
  typeIn(a, '#foodQ', 'pom');
  assert.deepEqual(a.$$('#foodGrid .fd-n').map((e) => e.textContent), ['Pommes de terre', 'Pomme']);
  // ajouter : emoji et catégorie proposés tout seuls
  typeIn(a, '#foodQ', ''); a.click('[data-act="fdAdd"][data-l="omad"]');
  typeIn(a, '#fdName', 'Cerises');
  assert.match(a.text('#fdPrev'), /🍒/); assert.equal(a.ev('FD.c'), 'fruits');
  a.click('[data-act="fdAddSave"]');
  assert.ok(a.ev(`foodLists().omad.some(f=>f.n==='Cerises'&&f.e==='🍒'&&f.c==='fruits'&&f.k>0)`));
  // sucre interdit refusé
  a.click('[data-act="fdAdd"][data-l="omad"]'); typeIn(a, '#fdName', 'Nutella'); a.click('[data-act="fdAddSave"]');
  assert.ok(!a.ev(`foodLists().omad.some(f=>f.n==='Nutella')`));
  a.ev('closeSheet()');
  // retirer
  a.click('[data-act="fdEdit"]'); a.click('[data-act="fdDel"][data-v="banane"]');
  assert.ok(!a.ev(`foodLists().omad.some(f=>f.id==='banane')`));
  // enregistré avec le reste des données
  const saved = JSON.parse(a.w.localStorage.getItem('cadence.v1'));
  assert.ok(saved.foodLists.omad.some((f) => f.n === 'Cerises')); assert.ok(!saved.foodLists.omad.some((f) => f.id === 'banane'));
  // les Réglages ne voient que les 3 niveaux d'activité
  assert.equal(a.ev('Object.keys(ACTIVITY).length'), 3); assert.equal(typeof a.ev('ACT.fdLog'), 'function');
  noErr(a);
});

test('journée : café pointé sans casser l’OMAD, banane = avertissement', async () => {
  const a = await boot({ now: '2026-11-04T10:00:00', agenda: true });
  assert.ok(a.$('.fd-dayrow'), 'raccourci « dans la journée » absent de l’accueil');
  a.click('.fd-dayrow'); assert.match(a.text('.sheet h2'), /Dans la journée/);
  a.click('#dfGrid [data-act="fdLog"][data-v="cafe"]');
  assert.deepEqual(JSON.parse(a.ev('JSON.stringify(S.foodLog[today()].map(x=>[x.n,x.ok]))')), [['Café', true]]);
  assert.match(a.text('.sheet'), /OMAD respecté/);
  typeIn(a, '#dfQ', 'banane');
  a.click('#dfGrid [data-act="fdOther"][data-v="banane"]');
  assert.match(a.text('.sheet h2'), /casse ton OMAD/);
  a.click('[data-act="fdBack"]'); assert.equal(a.ev('S.foodLog[today()].length'), 1);
  typeIn(a, '#dfQ', 'banane'); a.click('#dfGrid [data-act="fdOther"][data-v="banane"]'); a.click('[data-act="fdBreak"]');
  assert.deepEqual(JSON.parse(a.ev('JSON.stringify(S.foodLog[today()].map(x=>[x.n,x.ok]))')), [['Café', true], ['Banane', false]]);
  assert.match(a.text('.sheet'), /Jeûne rompu/);
  // aliment libre (pas dans les listes) : même avertissement
  typeIn(a, '#dfQ', 'Coca'); a.click('#dfGrid [data-act="fdOther"][data-n="Coca"]');
  assert.match(a.text('.sheet h2'), /casse ton OMAD/); assert.match(a.text('.sheet'), /sucre interdit/);
  assert.equal(a.ev('dayPts(today())'), 0);
  noErr(a);
});

test('repas composé avec la liste : validé, puis trop léger = à corriger', async () => {
  const a = await boot({ now: '2026-11-04T22:00:00', agenda: true });
  a.ev('S.profile.omadTime=nowMin()-10');
  a.ev('openMeal()'); a.click('[data-act="mealMode"][data-v="pick"]');
  assert.match(a.text('.sheet h2'), /compose/);
  a.click('[data-act="fdPick"][data-v="riz"]');
  a.click('[data-act="pickGo"]');
  assert.match(a.text('.sheet'), /À CORRIGER/); assert.match(a.text('.sheet'), /Ajoute/);
  a.click('[data-act="mealRedo"]');
  for (const [id, n] of [['riz', 2], ['poulet', 2], ['brocoli', 1], ['huile_d_olive', 2], ['oeufs', 1], ['fromage', 1], ['banane', 1], ['avocat', 1]]) for (let i = 0; i < n; i++) a.click(`[data-act="fdPick"][data-v="${id}"]`);
  const kc = a.ev('Math.round(plateTot(plateItems()).k)');
  a.click('[data-act="pickGo"]');
  assert.match(a.text('.sheet'), /VALIDÉ/);
  const m = JSON.parse(a.ev('JSON.stringify(S.meals[today()][0])'));
  assert.equal(m.src, 'pick'); assert.equal(m.kcal, kc); assert.equal(m.tries, 2);
  assert.equal(a.ev('dayPts(today())'), 40);
  noErr(a);
});

test('repas écrit : même analyse que la photo (IA + sucres interdits)', async () => {
  const prompts = [], parts = []; let n = 0;
  const a = await boot({ now: '2026-11-04T22:00:00', agenda: true, ls: { 'cadence.gkey': 'AQ.test' }, fetch: (u, o) => { if (!u.includes('generateContent')) return null; const ps = JSON.parse(o.body).contents[0].parts; parts.push(ps); prompts.push(ps[ps.length - 1].text); return gemini(++n === 1 ? okAI : { ...okAI, plat: 'Riz poulet' }); } });
  a.ev('S.profile.omadTime=nowMin()-10');
  a.ev('openMeal()'); a.click('[data-act="mealMode"][data-v="text"]');
  typeIn(a, '#ansIn', 'Une crêpe au nutella'); a.click('[data-act="txtGo"]'); await wait(50);
  assert.match(prompts[0], /crêpe au nutella/); assert.match(prompts[0], /Pas de photo/);
  assert.ok(parts.every((ps) => ps.length === 1 && !ps[0].inline_data), 'un repas écrit part sans image');
  assert.match(a.text('.sheet'), /INTERDIT/); assert.equal(a.ev('dayPts(today())'), 0);
  a.click('[data-act="mealRedo"]');
  typeIn(a, '#ansIn', '250 g de riz, 300 g de poulet, brocoli, huile d’olive'); a.click('[data-act="txtGo"]'); await wait(50);
  assert.match(a.text('.sheet'), /VALIDÉ/);
  assert.equal(a.ev('S.meals[today()][0].src'), 'text');
  assert.equal(a.ev('dayPts(today())'), 40);
  noErr(a);
});

test('IA : bascule sur un modèle de secours', async () => {
  const calls = [];
  const a = await boot({ now: '2026-11-04T22:00:00', agenda: true, ls: { 'cadence.gkey': 'AQ.test' }, fetch: (u) => {
    if (!u.includes('generateContent')) return null; calls.push(u.split('/models/')[1]);
    if (calls.length === 1) return { ok: false, status: 404, json: async () => ({ error: { message: 'not found' } }) };
    return gemini(okAI); } });
  a.ev('S.profile.omadTime=nowMin()-10');
  a.ev('openMeal()'); await a.ev('handleMealPhoto({lastModified:Date.now()})');
  assert.equal(calls.length, 2);
  assert.match(a.text('.sheet'), /VALIDÉ/);
  noErr(a);
});

test('sommeil : rythme 4 cycles puis 5', async () => {
  const a = await boot({ now: '2026-11-04T12:00:00', agenda: true });
  a.click('[data-act="tab"][data-v="sommeil"]');
  assert.match(a.text('.hero'), /01:45/); assert.match(a.text('.hero'), /08:00/);
  a.click('[data-act="cyc"][data-v="5"]');
  assert.match(a.text('.hero'), /00:15/);
  noErr(a);
});

test('sommeil : passé l’heure du coucher, le réveil part de maintenant', async () => {
  const a = await boot({ now: '2026-11-05T03:42:00', agenda: true });
  a.click('[data-act="tab"][data-v="sommeil"]');
  assert.match(a.text('.hero'), /03:42/); assert.match(a.text('.hero'), /09:57/); assert.match(a.text('.hero'), /6,0 h/);
  a.click('[data-act="cyc"][data-v="5"]');
  assert.match(a.text('.hero'), /11:27/);
  a.click('[data-act="cyc"][data-v="3"]');
  assert.match(a.text('.hero'), /08:27/); assert.match(a.text('.hero'), /4,5 h/);
  a.click('[data-act="cyc"][data-v="5"]');
  a.click('.hero [data-act="night"]'); assert.match(a.text('.sheet .stepper'), /11:27/);
  noErr(a);
});

test('sommeil : jour de travail, réveil selon la durée choisie et avertissement', async () => {
  const a = await boot({ now: '2026-11-06T03:42:00', agenda: true });
  a.ev('S.profile.cycles=6;S.profile.commute=30');
  const s0 = a.ev('workBlocks(today()).blocks[0].s'); assert.equal(s0, 720);
  const P = a.ev('sleepPlan()');
  assert.equal(P.late, true); assert.equal(P.cycles, 6); assert.equal(P.wake, 777);
  assert.equal(P.workWake, 597); assert.equal(P.workCycles, 4);
  a.click('[data-act="tab"][data-v="sommeil"]'); assert.match(a.text('.hero'), /12:57/); assert.match(a.text('.hero'), /au plus tard à 09:57/);
  noErr(a);
});

test('mode chevet : alarme, 5 minutes de plus, rapport', async () => {
  const a = await boot({ now: '2026-11-04T23:50:00', agenda: true });
  a.click('[data-act="tab"][data-v="sommeil"]');
  a.click('.hero [data-act="night"]'); assert.match(a.text('.sheet h2'), /Bonne nuit/);
  const sh = a.$('.sheet'); a.click('.sheet [data-act="st"][data-o="NS"][aria-label="Plus"]');
  assert.equal(a.$('.sheet'), sh, 'la fenêtre ne doit pas se recréer au réglage du réveil'); assert.match(a.text('.sheet .stepper'), /08:05/);
  a.click('[data-act="nsTog"][data-v="listen"]'); a.click('[data-act="nightGo"]'); await wait(50);
  assert.ok(a.$('.night'));
  a.ev('NIGHT.alarms[0]=Date.now()-1000;nightTick()');
  assert.match(a.$('.night').className, /ring/);
  a.click('[data-act="snooze"]'); assert.equal(a.ev('NIGHT.idx'), 1);
  a.ev('NIGHT.ringing=false'); a.click('.night'); a.click('[data-act="nightOff"]');
  assert.match(a.text('.sheet h2'), /Nuit/);
  noErr(a);
});

test('Réglages : la fenêtre ne se referme pas et ne se rouvre pas (pas de clignotement)', async () => {
  const J = (o) => ({ ok: true, status: 200, json: async () => o, text: async () => JSON.stringify(o) });
  const a = await boot({ now: '2026-11-04T10:00:00', agenda: true, fetch: (u) => u.includes('version.json') ? wait(30).then(() => J({ v: '2000-01-01.1' })) : null });
  a.click('header [data-act="settings"]');
  a.ev(`window._sc=document.querySelector('#sheetRoot .scrim');window._sh=document.querySelector('#sheetRoot .sheet')`);
  await wait(120); // la vérification de mise à jour revient et rafraîchit la fenêtre
  assert.ok(a.ev(`document.querySelector('#sheetRoot .scrim')===window._sc&&document.querySelector('#sheetRoot .sheet')===window._sh`), 'fenêtre recréée après la vérification de mise à jour');
  a.click('[data-act="setTog"][data-v="sound"]');
  assert.ok(a.ev(`document.querySelector('#sheetRoot .sheet')===window._sh`), 'fenêtre recréée après un réglage');
  assert.match(a.text('.sheet h2'), /Réglages/);
  assert.equal(a.$$('.sheet .sheet-x').length, 1);
  // fermeture en douceur : la fenêtre glisse puis disparaît, et une nouvelle peut s'ouvrir aussitôt
  a.click('.sheet [data-act="close"]');
  assert.equal(a.ev('sheetName'), null);
  assert.ok(a.$('#sheetRoot .scrim.out'), 'pas d’animation de fermeture');
  await wait(260);
  assert.equal(a.$$('#sheetRoot .scrim').length, 0);
  a.click('header [data-act="settings"]'); a.ev('closeSheet()'); a.click('header [data-act="settings"]');
  assert.equal(a.$$('#sheetRoot .scrim:not(.out)').length, 1); assert.match(a.text('#sheetRoot .scrim:not(.out) h2'), /Réglages/);
  noErr(a);
});

test('Réglages : parties séparées, clé IA repliée quand elle marche', async () => {
  const a = await boot({ now: '2026-11-04T10:00:00', agenda: true, ls: { 'cadence.gkey': 'AQ.test' } });
  a.click('header [data-act="settings"]');
  assert.deepEqual(a.$$('.sheet [data-sec]').map((e) => e.dataset.sec), ['profil', 'affichage', 'repas', 'pointage', 'ia', 'agenda', 'donnees', 'app', 'reset']);
  for (const act of ['reonboard', 'theme', 'setTog', 'omad', 'omadWin', 'bkExport', 'forceUpdate', 'diag', 'reset']) assert.ok(a.$(`.sheet [data-act="${act}"]`), 'bouton manquant : ' + act);
  assert.ok(a.$('.sheet label[for="icsIn"]') && a.$('.sheet label[for="bkIn"]'));
  assert.ok(!a.$('#apiKeyIn'), 'la clé IA doit être repliée');
  a.click('[data-act="setAi"]'); assert.ok(a.$('#apiKeyIn'));
  a.ev('closeSheet()'); a.click('header [data-act="settings"]'); assert.ok(!a.$('#apiKeyIn'), 'repliée à la réouverture');
  a.click('[data-act="reset"]'); assert.ok(a.$('[data-act="resetDo"]')); a.click('[data-act="resetCancel"]');
  noErr(a);
  const b = await boot({ now: '2026-11-04T10:00:00', agenda: true });
  b.click('header [data-act="settings"]'); assert.ok(b.$('#apiKeyIn'), 'sans clé : le formulaire est ouvert');
  noErr(b);
});

test('glisser à gauche / à droite pour changer d’onglet', async () => {
  const a = await boot({ now: '2026-11-04T10:00:00', agenda: true });
  const swipe = async (sel, dx, dy = 0) => {
    const el = a.$(sel); const ev = (type, x, y) => { const e = new a.w.Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(e, 'touches', { value: type === 'touchend' ? [] : [{ clientX: x, clientY: y }] }); el.dispatchEvent(e); };
    ev('touchstart', 200, 300); ev('touchmove', 200 + dx / 3, 300 + dy / 3); ev('touchmove', 200 + dx, 300 + dy); ev('touchend'); await wait(200);
  };
  assert.equal(a.ev('V.tab'), 'jour');
  await swipe('#main h1', 60); assert.equal(a.ev('V.tab'), 'jour', 'rien avant Jour');
  await swipe('#main h1', -120); assert.equal(a.ev('V.tab'), 'sommeil');
  await swipe('#main h1', -120); assert.equal(a.ev('V.tab'), 'sport');
  await swipe('#main h1', 120); assert.equal(a.ev('V.tab'), 'sommeil');
  await swipe('#main h1', -20, 200); assert.equal(a.ev('V.tab'), 'sommeil', 'un défilement vertical ne change pas d’onglet');
  a.ev(`openSheet('<h2>x</h2>','x')`); await swipe('#main h1', -120); assert.equal(a.ev('V.tab'), 'sommeil', 'pas de glissement sous une fenêtre'); a.ev('closeSheet()');
  a.ev(`document.querySelector('#main').insertAdjacentHTML('beforeend','<input id="swIn">')`); await swipe('#swIn', -120); assert.equal(a.ev('V.tab'), 'sommeil', 'pas de glissement sur un champ');
  a.click('[data-act="tab"][data-v="cagnotte"]'); assert.equal(a.ev('V.tab'), 'cagnotte'); assert.ok(a.$('#main.tab-in-r'));
  await swipe('#main h1', -120); assert.equal(a.ev('V.tab'), 'cagnotte', 'rien après Cagnotte');
  assert.equal(a.ev(`document.querySelector('#main').style.transform`), '');
  noErr(a);
});

test('planning : onglet « Planning », bouton +, fenêtre qui s’ouvre depuis la tâche', async () => {
  const a = await boot({ now: '2026-11-04T10:00:00', agenda: true });
  assert.match(a.text('#tabs button[data-v="jour"]'), /Planning/);
  assert.equal(a.$('#fab').hidden, false);
  a.click('.tc[data-pop]'); assert.ok(a.$('#sheetRoot .scrim.pop'), 'la tâche doit s’ouvrir en petite fenêtre'); a.ev('closeSheet()');
  a.click('[data-act="tab"][data-v="sport"]'); assert.equal(a.$('#fab').hidden, true, 'le + seulement sur le planning');
  a.click('[data-act="tab"][data-v="jour"]'); assert.equal(a.$('#fab').hidden, false);
  noErr(a);
});

test('créer une tâche en parlant : sans IA, écrit, avec question si l’heure manque', async () => {
  const a = await boot({ now: '2026-11-04T10:00:00', agenda: true });
  const send = async (t) => { a.ev(`document.querySelector('#crIn').value=${JSON.stringify(t)}`); a.click('[data-act="crSend"]'); await wait(50); };
  a.click('#fab'); assert.ok(a.$('#sheetRoot .scrim.pop'));
  assert.ok(a.$('#crIn'), 'sans dictée : on passe à l’écrit'); // jsdom n’a pas de reconnaissance vocale
  await send('Ajoute courses demain à 18 h pendant 45 min');
  let c = JSON.parse(a.ev('JSON.stringify(S.custom.at(-1))'));
  assert.deepEqual([c.title, c.type, c.date, c.start, c.dur, c.repeat], ['Courses', 'courses', '2026-11-05', 1080, 45, 'once']);
  assert.match(a.text('.sheet h2'), /Tâche ajoutée/);
  a.click('[data-act="crUndo"]'); assert.equal(a.ev('S.custom.length'), 0);
  a.click('#fab'); await send('ajoute une tâche de tac-tac');
  assert.match(a.text('.sheet h2'), /heure/i); assert.equal(a.ev('S.custom.length'), 0);
  await send('à 15h');
  c = JSON.parse(a.ev('JSON.stringify(S.custom.at(-1))'));
  assert.deepEqual([c.title, c.start, c.date], ['Tac-tac', 900, '2026-11-04']);
  assert.ok(a.ev(`dayTasks('2026-11-04').some(t=>t.title==='Tac-tac')`), 'la tâche apparaît dans le planning');
  noErr(a);
});

test('créer une tâche en parlant : l’IA remplit et pose une question', async () => {
  let n = 0;
  const a = await boot({ now: '2026-11-04T10:00:00', agenda: true, ls: { 'cadence.gkey': 'AQ.test' }, fetch: (u) => u.includes('generateContent') ? gemini(n++ === 0 ? { title: 'Lecture', type: 'etude', date: '', start: '', dur: 30, repeat: 'daily', q: 'À quelle heure veux-tu lire ?' } : { title: 'Lecture', type: 'etude', date: '2026-11-05', start: '20:30', dur: 30, repeat: 'daily', q: '' }) : null });
  a.click('#fab'); a.ev(`document.querySelector('#crIn').value='ajoute lecture tous les jours'`); a.click('[data-act="crSend"]'); await wait(80);
  assert.match(a.text('.sheet h2'), /À quelle heure veux-tu lire/);
  a.ev(`document.querySelector('#crIn').value='20h30'`); a.click('[data-act="crSend"]'); await wait(80);
  const c = JSON.parse(a.ev('JSON.stringify(S.custom.at(-1))'));
  assert.deepEqual([c.title, c.type, c.date, c.start, c.dur, c.repeat, c.pts], ['Lecture', 'etude', '2026-11-05', 1230, 30, 'daily', 20]);
  a.click('[data-act="crEdit"]'); assert.match(a.text('.sheet h2'), /Nouvelle tâche/); assert.equal(a.ev('S.custom.length'), 0);
  assert.equal(a.ev('NT.start'), 1230);
  noErr(a);
});

test('test complet de l’app (diagnostic)', async () => {
  const raw = webcrypto.getRandomValues(new Uint8Array(32));
  const b64u = Buffer.from(raw).toString('base64url');
  const key = await webcrypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt']);
  const enc = async (o) => { const iv = webcrypto.getRandomValues(new Uint8Array(12)); const ct = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(o))); return { v: 1, iv: Buffer.from(iv).toString('base64'), ct: Buffer.from(ct).toString('base64') }; };
  const files = { 'agenda.enc.json': await enc(fixture('agenda.json')), 'state.enc.json': await enc(fixture('state.json')), 'secrets.enc.json': await enc({ gkey: 'AQ.test', ai: 'gemini' }) };
  const J = (o) => ({ ok: true, status: 200, json: async () => o, text: async () => JSON.stringify(o) });
  const a = await boot({ now: '2026-11-04T12:00:00', agenda: true, ls: { 'cadence.gkey': 'AQ.test', 'cadence.key': b64u }, fetch: (u) => {
    const f = u.split('?')[0].split('/').pop();
    if (files[f]) return J(files[f]);
    if (f === 'version.json') return J({ v: '2000-01-01.1' });
    if (u.includes('/models?')) return J({ models: [{ name: 'models/gemini-flash-lite-latest' }, { name: 'models/gemini-3.5-flash-lite' }] });
    if (u.includes('generateContent')) return wait(u.includes('flash-lite-latest') ? 400 : 0).then(() => J({ candidates: [{ content: { parts: [{ text: '{"ok":1}' }] } }] }));
    return null; } });
  a.ev('runDiag()');
  for (let i = 0; i < 100 && !a.ev('DIAG&&DIAG.done'); i++) await wait(50);
  const rep = a.ev('DIAG.report');
  assert.ok(a.ev('DIAG.done'), 'diagnostic non terminé');
  const bad = rep.split('\n').filter((l) => l.startsWith('[ÉCHEC]') && !/Son \(alarmes\)/.test(l));
  assert.deepEqual(bad, [], bad.join(' // '));
  assert.ok(a.$('[data-act="diagCopy"]'));
  // modèles rangés du plus rapide au plus lent, et mémorisés pour les prochains repas
  assert.equal(a.ev('GEM_MODELS[0]'), 'gemini-3.5-flash-lite');
  assert.match(rep, /Modèle retenu pour tes repas — gemini-3\.5-flash-lite \(\d+ ms\) · secours : gemini-flash-lite-latest \(\d+ ms\)/);
  const saved = a.w.localStorage.getItem('cadence.gmodels');
  assert.equal(JSON.parse(saved)[0], 'gemini-3.5-flash-lite');
  noErr(a);
  const b = await boot({ now: '2026-11-04T12:00:00', ls: { 'cadence.gmodels': saved, 'cadence.gmodel': 'gemini-3.5-flash-lite' } });
  assert.deepEqual(JSON.parse(b.ev('JSON.stringify(GEM_MODELS)')).slice(0, 2), ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest']);
  noErr(b);
});

test('pas de thème spécial le 1er novembre', async () => {
  const a = await boot({ now: '2026-11-01T10:00:00', agenda: true });
  assert.equal(a.d.documentElement.dataset.fete, undefined); assert.ok(!a.$('.fete'));
  noErr(a);
});

test('cagnotte : le bocal se remplit avec l’argent de la période', async () => {
  const a = await boot({ now: '2026-11-04T12:00:00', agenda: true });
  a.ev(`S.periodStart=Date.now()-3600e3;S.ledger=[]`);
  a.click('[data-act="tab"][data-v="cagnotte"]');
  assert.ok(a.$('.hero .jar'), 'bocal absent'); assert.equal(a.$$('.jar .jar-new').length, 0);
  assert.match(a.text('.hero'), /rempli à 0 %/);
  const max = a.ev('periodMax()'); assert.ok(max > 1, 'maximum de la période');
  a.ev(`addPts(Math.round(periodMax()*.4/S.profile.rate),'test');render()`);
  const n1 = a.$$('.jar ellipse[fill="url(#jGold)"], .jar rect[fill="var(--bill)"]').length;
  assert.ok(n1 > 5); assert.match(a.text('.hero'), /rempli à 4\d %/);
  assert.ok(a.$$('.jar .jar-new').length > 0 && a.$('.jar .jar-coin'), 'les nouvelles pièces doivent tomber');
  render: { a.ev('render()'); assert.equal(a.$$('.jar .jar-new').length, 0, 'pas de nouvelle animation sans nouveau gain'); }
  a.ev(`addPts(Math.round(periodMax()*2/S.profile.rate),'test');render()`);
  assert.match(a.text('.hero'), /rempli à 100 %/);
  assert.ok(a.$$('.jar ellipse[fill="url(#jGold)"], .jar rect[fill="var(--bill)"]').length > n1);
  assert.ok(!/\bpts\b/.test(a.text('#main')));
  noErr(a);
});

test('cagnotte en euros, sans points', async () => {
  const a = await boot({ now: '2026-11-04T12:00:00', agenda: true });
  a.click('[data-act="tab"][data-v="cagnotte"]');
  assert.ok(!/\bpts\b|\bpoints?\b/i.test(a.text('#main')), a.text('#main').match(/.{30}(pts|points?).{10}/i));
  assert.match(a.text('#main'), /€/);
  noErr(a);
});

// ---- exécution ----
let ok = 0, ko = 0;
for (const t of T) {
  try { await t.fn(); ok++; console.log('  ✓ ' + t.name); }
  catch (e) { ko++; console.log('  ✗ ' + t.name + '\n      ' + String(e && e.message || e).split('\n').slice(0, 6).join('\n      ')); }
}
console.log(`\n${ok} réussi(s), ${ko} échec(s)`);
process.exit(ko ? 1 : 0);
