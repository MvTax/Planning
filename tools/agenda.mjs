// Met à jour le planning de travail chiffré (agenda.enc.json) à partir des événements de l'agenda.
// 1. Récupère les événements (outil calendrier du téléphone : event_search_v0 sur l'agenda de travail,
//    de J-7 à J+90) et enregistre-les dans un fichier JSON : soit la réponse brute de l'outil,
//    soit une liste [{title,start_time,end_time,location}].
// 2. CADENCE_KEY=xxxx node tools/agenda.mjs evenements.json
// 3. npm test, puis ./bump.sh "Planning mis à jour jusqu'au …", commit, push main + gh-pages.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const src = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const evs = Array.isArray(src) ? src : (src.calendar_events || []).flatMap((c) => c.events || []);
const cap = (s) => s.toLowerCase().replace(/(^|[\s-])\S/g, (c) => c.toUpperCase());
const ymd = (d) => d.toISOString().slice(0, 10);
const shifts = evs.filter((e) => !e.all_day && e.start_time && e.end_time).map((e) => {
  const a = e.start_time, b = e.end_time, d = a.slice(0, 10), db = b.slice(0, 10);
  const s = +a.slice(11, 13) * 60 + +a.slice(14, 16);
  let en = +b.slice(11, 13) * 60 + +b.slice(14, 16) + Math.round((new Date(db) - new Date(d)) / 864e5) * 1440;
  return { d, s, e: Math.max(en, s + 15), t: cap((e.title || '').split(' - ')[0].trim() || 'Travail'), loc: cap((e.location || '').replace(/\s*-\s*\.?\s*$/, '').trim()) };
}).sort((x, y) => (x.d + x.s).localeCompare(y.d + y.s));
if (!shifts.length) { console.error('Aucun service trouvé.'); process.exit(1); }
const last = shifts[shifts.length - 1].d, ld = new Date(last + 'T12:00:00Z');
const sunday = new Date(ld); sunday.setUTCDate(ld.getUTCDate() + ((7 - ld.getUTCDay()) % 7));
const from = new Date(); from.setUTCDate(from.getUTCDate() - 7);
const first = evs[0] || {};
const agenda = { source: cap(String(first.title || 'Travail').split(' - ')[0]), calName: process.env.CADENCE_CAL || 'Agenda de travail', from: ymd(from), to: ymd(sunday), shifts, updatedAt: Date.now() };
fs.writeFileSync('/tmp/agenda.plain.json', JSON.stringify(agenda));
execFileSync('node', ['tools/crypt.mjs', 'encrypt', '/tmp/agenda.plain.json', 'agenda.enc.json'], { stdio: 'inherit', env: process.env });
fs.unlinkSync('/tmp/agenda.plain.json');
console.log(`${shifts.length} services, planning connu jusqu'au ${agenda.to}.`);
