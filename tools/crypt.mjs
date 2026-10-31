// Chiffre / déchiffre les fichiers *.enc.json (AES-GCM). La clé n'est JAMAIS dans le dépôt :
// elle est dans le lien de l'utilisateur, après « #k= ». Fournis-la par variable d'environnement.
//   CADENCE_KEY=xxxx node tools/crypt.mjs encrypt entree.json sortie.enc.json
//   CADENCE_KEY=xxxx node tools/crypt.mjs decrypt agenda.enc.json   (affiche le JSON)
import fs from 'node:fs';
import { webcrypto as C } from 'node:crypto';
const [, , mode, input, output] = process.argv;
const k = process.env.CADENCE_KEY;
if (!k || !mode || !input) { console.error('Usage : CADENCE_KEY=… node tools/crypt.mjs encrypt|decrypt entree [sortie]'); process.exit(1); }
const raw = Buffer.from(k.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
const key = await C.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
if (mode === 'encrypt') {
  const iv = C.getRandomValues(new Uint8Array(12));
  const ct = await C.subtle.encrypt({ name: 'AES-GCM', iv }, key, fs.readFileSync(input));
  fs.writeFileSync(output, JSON.stringify({ v: 1, iv: Buffer.from(iv).toString('base64'), ct: Buffer.from(ct).toString('base64') }));
  console.log('Chiffré →', output);
} else {
  const j = JSON.parse(fs.readFileSync(input, 'utf8'));
  const pt = await C.subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(j.iv, 'base64') }, key, Buffer.from(j.ct, 'base64'));
  const out = Buffer.from(pt).toString('utf8');
  if (output) { fs.writeFileSync(output, out); console.log('Déchiffré →', output); } else console.log(out);
}
