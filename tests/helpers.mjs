// Outils de test : charge l'app dans un navigateur simulé (jsdom) avec une date, un état et des réponses réseau contrôlés.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const fixture = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/fixtures', f), 'utf8'));

// index.html avec CSS et scripts intégrés (jsdom ne charge pas les fichiers locaux tout seul)
export function bundle() {
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  html = html.replace(/<link rel="stylesheet" href="(css\/[^"?]+)(\?[^"]*)?">/g, (_, f) => `<style>${fs.readFileSync(path.join(ROOT, f), 'utf8')}</style>`);
  html = html.replace(/<script src="(js\/[^"?]+)(\?[^"]*)?"><\/script>/g, (_, f) => `<script>${fs.readFileSync(path.join(ROOT, f), 'utf8')}</script>`);
  return html.replace(/<link rel="stylesheet" href="https:[^>]+>/g, '');
}

/**
 * boot({ now, state, agenda, ls, fetch, url })
 * now   : date et heure simulées, ex. '2026-11-04T16:00:00' (heure de Paris)
 * state : état de l'app (objet) ou null pour un premier lancement
 * agenda: true pour ajouter le planning fictif
 * ls    : autres clés localStorage
 * fetch : (url, options) => réponse simulée ; sinon tout échoue proprement
 */
export async function boot(o = {}) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(e.message));
  const st = o.state === undefined ? fixture('state.json') : o.state;
  if (st && o.agenda) st.agenda = fixture('agenda.json');
  const dom = new JSDOM(bundle(), {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    url: o.url || 'https://mvtax.github.io/Planning/',
    beforeParse(w) {
      const Real = Date, offset = o.now ? new Real(o.now).getTime() - Real.now() : 0;
      class FakeDate extends Real {
        constructor(...a) { if (a.length) super(...a); else super(Real.now() + offset); }
        static now() { return Real.now() + offset; }
      }
      w.Date = FakeDate;
      if (!w.crypto || !w.crypto.subtle) Object.defineProperty(w, 'crypto', { value: globalThis.crypto });
      w.TextDecoder = TextDecoder; w.TextEncoder = TextEncoder;
      w.scrollTo = () => {};
      if (st) w.localStorage.setItem('cadence.v1', JSON.stringify(st));
      for (const [k, v] of Object.entries(o.ls || {})) w.localStorage.setItem(k, v);
      w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (t, k) => k === 'getImageData' ? () => ({ data: new Uint8Array(4000).fill(120) }) : () => {}, set: () => true });
      w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,' + 'A'.repeat(2000);
      w.HTMLCanvasElement.prototype.toBlob = (cb) => cb(new w.Blob(['x'], { type: 'image/jpeg' }));
      w.fetch = async (u, opt) => {
        if (o.fetch) { const r = await o.fetch(String(u), opt || {}); if (r) return r; }
        return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
      };
    },
  });
  const w = dom.window;
  await wait(200);
  const app = {
    w, d: w.document, errors,
    ev: (code) => w.eval(code),
    $: (s) => w.document.querySelector(s),
    $$: (s) => [...w.document.querySelectorAll(s)],
    click(sel) { const e = typeof sel === 'string' ? w.document.querySelector(sel) : sel; if (!e) throw new Error('élément introuvable : ' + sel); e.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); },
    text: (s) => (w.document.querySelector(s) || {}).textContent || '',
    close() { w.close(); },
  };
  app.ev("loadImg=async()=>({width:1600,height:1200})");
  return app;
}
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Réponse Gemini simulée
export const gemini = (obj) => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(obj) }] } }] }), text: async () => '' });
