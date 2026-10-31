# Cadence — guide pour les agents

Cadence est l'app personnelle de pointage de l'utilisateur : planning de travail, sport, repas (OMAD), sommeil et cagnotte en euros.
Site statique hébergé sur GitHub Pages (`https://mvtax.github.io/Planning/`), sans build : HTML + CSS + JavaScript « classique ».
L'utilisateur l'ouvre en signet sur iPhone (Safari, écran d'accueil). Tout le texte de l'app est en **français, tutoiement**.

## Qui fait quoi (une conversation = un agent)

| Agent | Fichiers qu'il modifie | Périmètre |
|---|---|---|
| **Général** | `js/core.js`, `js/ia.js`, `js/planning.js`, `js/cagnotte.js`, `js/reglages.js`, `js/app.js`, `css/style.css` (hors blocs agents), `index.html`, `tools/`, `tests/helpers.mjs` | Données, IA, moteur de la journée, cagnotte, réglages, démarrage, design global |
| **Jour** | `js/jour.js` + son bloc dans `css/style.css` | Page d'accueil, détail d'une tâche, ajout de tâche, planning de travail / agenda |
| **Sommeil** | `js/sommeil.js` + son bloc CSS | Onglet Sommeil, mode chevet, alarmes, écoute et analyse des nuits |
| **Sport** | `js/sport.js` + son bloc CSS | Exercices, programme 12 semaines, choix des jours de salle, photo de la salle, onglet Sport |
| **Repas** | `js/repas.js` + son bloc CSS | Aliments, recettes, nutrition, OMAD, photo du plat + IA, sucres interdits, onglet Repas, courses |

Règles :
- Ne modifie **que tes fichiers**. Si un changement ailleurs est nécessaire, explique-le à l'utilisateur pour qu'il le demande à l'agent concerné (ou à « Général »).
- Nouveaux boutons : n'ajoute rien dans `js/app.js`. Déclare tes actions dans ton fichier :
  `Object.assign(ACT,{monAction:(el,v)=>{…}})` puis `<button data-act="monAction" data-v="…">`.
- Une seule conversation à la fois par fichier. Toujours `git pull --rebase` avant de pousser.

## Architecture

- `index.html` charge `css/style.css` puis les scripts **dans cet ordre** : `core, ia, planning, sport, repas, jour, sommeil, cagnotte, reglages, app`.
  Ce sont des scripts classiques : leurs `const`, `let` et `function` de premier niveau sont partagés entre fichiers.
  Ne mets pas de code exécuté au chargement qui dépend d'un fichier chargé après le tien ; mets la logique dans des fonctions.
- État : objet global `S` (sauvé dans `localStorage` `cadence.v1` par `save()`). Champs principaux :
  `profile` (poids, objectifs, `omad`, `omadTime`, `omadWin`, `cycles`, `wake`, `commute`, `rate`…), `ledger` (gains, champ `pts` interne),
  `punches` (validations `{in,how,at,mode}`), `meals[jour]`, `nights`, `agenda` (planning de travail), `workOv` (modifs manuelles),
  `custom` (tâches perso), `settings`, `programStart`, `since`, `periodStart`.
- Rendu : `render()` reconstruit l'onglet courant (`renderJour`, `renderSommeil`, `renderSport`, `renderRepas`, `renderCagnotte`).
  Fenêtres : `openSheet(html,nom)` / `closeSheet()`. Message bref : `toast(texte)`. Icônes : `ic(nom)`.
- Outils utiles : `today()`, `addDs(jour,n)`, `hm(minutes)`, `durTxt(minutes)`, `eur(x)`, `M$(pts)` (montant en euros signé), `nowMin()`.
- Journée : `dayTasks(jour)` (travail, séance, repas OMAD, tâches perso, événements .ics), `status(tâche)`, `valBtns`, `validate`.

## Règles métier à ne pas casser

- **Pas de points à l'écran** : uniquement des euros (`M$`). Les `pts` sont internes × `profile.rate`.
- Barème : service de travail 10, séance 50, repas OMAD 40 (retard 20), journée parfaite 30.
  À l'heure = tout ; retard ou oubli = moitié ; pas fait = tout en négatif ; non validé le lendemain = pas fait (si malus actif).
- Le travail se valide (« En cours » prune, puis vert/rouge). Le sport se valide par **photo de la salle** vérifiée par l'IA.
- Repas : **OMAD** (fenêtre par défaut 21:00–23:00, décalée autour du travail). Photo refusée avant la fenêtre et après un repas déjà pris.
  L'IA peut poser **une** question sur les ingrédients (réponse vocale ou écrite). **Sucres interdits** (IA + contrôle `sugarHit`).
- Sport : 3 séances/semaine, sur les jours de repos et les services de 14:45, **jamais** les jours qui commencent à midi (`sportDays`).
- Sommeil : rythme en cycles de 90 min + 15 min d'endormissement (par défaut 4 cycles, réveil 8:00, au lit 1:45). Mode chevet = 3 alarmes à 5 min.
- Démarrage : `START_DAY = 2026-11-01`. Rien n'est compté avant.
- 1er novembre : thème drapeau algérien automatique (`isFete`), uniquement ce jour-là.

## Design

- Couleurs uniquement via les variables de `:root` dans `css/style.css`, définies en clair **et** en sombre.
- Thème : indigo et prune, élégant. **Pas d'orange** (seule la veilleuse du mode chevet est ambrée, exprès).
- Une couleur par catégorie : travail `--c-work`, sport `--c-sport`, repas `--c-meal`, libre `--c-free`, trajets `--c-trip`, argent `--c-money`.
- Interface épurée : l'accueil ne montre que l'essentiel ; le détail s'ouvre en fenêtre au toucher.

## IA

- Fournisseur par défaut : Gemini, modèles **Flash-Lite uniquement** (`GEM_MODELS`), **sans** `thinkingConfig` (refusé par Flash-Lite).
  Les modèles Flash « normaux » répondent en plus de 20 s : ne pas les utiliser. Objectif : réponse en moins de 5 s.
- Appel : `aiRaw(canvas, prompt, maxTokens)` renvoie l'objet JSON. Prompts courts, réponses JSON courtes.
- Si l'app passe en arrière-plan, iOS coupe la requête : l'analyse est relancée au retour.

## Données personnelles et chiffrement (dépôt PUBLIC)

- Ne jamais committer de données personnelles en clair, ni la clé.
- `agenda.enc.json` (planning de travail), `state.enc.json` (profil de départ), `secrets.enc.json` (clé Gemini, nom de l'agenda) sont chiffrés en AES-GCM.
- La clé est dans le lien de l'utilisateur (`…/Planning/#k=CLÉ`). Si tu en as besoin, demande-lui de coller son lien. Ne l'écris dans aucun fichier.
- `CADENCE_KEY=CLÉ node tools/crypt.mjs decrypt agenda.enc.json` / `encrypt entrée.json sortie.enc.json`.
- Mettre à jour le planning de travail : récupérer les événements de l'agenda de travail (outil calendrier du téléphone, de J-7 à J+90),
  les enregistrer en JSON, puis `CADENCE_KEY=CLÉ node tools/agenda.mjs evenements.json`.

## Faire un changement (procédure)

1. `npm install` (une fois), puis lire le fichier concerné.
2. Modifier **uniquement** tes fichiers.
3. Ajouter ou adapter un test dans `tests/run.mjs` pour le comportement changé, puis `npm test` : tout doit passer.
4. `./bump.sh "Une phrase pour l'utilisateur"` (numéro de version, cache des fichiers, bandeau « Nouvelle version »).
5. Commit avec l'auteur `MvTax <MvTax@users.noreply.github.com>` (jamais l'adresse personnelle), puis :
   `git pull --rebase origin main && git push origin main && git push origin main:gh-pages`
6. Dire à l'utilisateur : Réglages → « Forcer la mise à jour » (GitHub Pages met 1 à 2 minutes).

## Diagnostic

Réglages → « Tester l'application » produit un rapport (réseau, IA, fichiers chiffrés, fonctions de l'iPhone, journal d'erreurs).
L'utilisateur peut le copier et le coller dans la conversation : pars de là pour chercher un problème.
