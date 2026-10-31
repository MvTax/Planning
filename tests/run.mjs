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

test('mode chevet : alarme, 5 minutes de plus, rapport', async () => {
  const a = await boot({ now: '2026-11-04T23:50:00', agenda: true });
  a.click('[data-act="tab"][data-v="sommeil"]');
  a.click('.hero [data-act="night"]'); assert.match(a.text('.sheet h2'), /Bonne nuit/);
  a.click('[data-act="nsTog"][data-v="listen"]'); a.click('[data-act="nightGo"]'); await wait(50);
  assert.ok(a.$('.night'));
  a.ev('NIGHT.alarms[0]=Date.now()-1000;nightTick()');
  assert.match(a.$('.night').className, /ring/);
  a.click('[data-act="snooze"]'); assert.equal(a.ev('NIGHT.idx'), 1);
  a.ev('NIGHT.ringing=false'); a.click('.night'); a.click('[data-act="nightOff"]');
  assert.match(a.text('.sheet h2'), /Nuit/);
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
    if (u.includes('generateContent')) return J({ candidates: [{ content: { parts: [{ text: '{"ok":1}' }] } }] });
    return null; } });
  a.ev('runDiag()');
  for (let i = 0; i < 100 && !a.ev('DIAG&&DIAG.done'); i++) await wait(50);
  const rep = a.ev('DIAG.report');
  assert.ok(a.ev('DIAG.done'), 'diagnostic non terminé');
  const bad = rep.split('\n').filter((l) => l.startsWith('[ÉCHEC]') && !/Son \(alarmes\)/.test(l));
  assert.deepEqual(bad, [], bad.join(' // '));
  assert.ok(a.$('[data-act="diagCopy"]'));
  noErr(a);
});

test('thème du 1er Novembre : seulement ce jour-là', async () => {
  const a = await boot({ now: '2026-11-01T10:00:00', agenda: true });
  assert.equal(a.d.documentElement.dataset.fete, 'dz'); assert.ok(a.$('.fete'));
  const b = await boot({ now: '2026-11-02T10:00:00', agenda: true });
  assert.equal(b.d.documentElement.dataset.fete, undefined); assert.ok(!b.$('.fete'));
  noErr(a); noErr(b);
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
