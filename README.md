# Cadence

Application web de pointage pour organiser ses journées : réveil et cycles de sommeil, programme sport 12 semaines, menus, courses avec budget et cagnotte d'épargne.

- Tout fonctionne dans le navigateur ; les données restent sur le téléphone (localStorage).
- Le planning de travail (`agenda.enc.json`) et le profil initial (`state.enc.json`) sont chiffrés en AES-GCM. La clé n'est jamais dans ce dépôt : elle est passée dans le lien (`#k=…`), qui n'est pas envoyé au serveur.
- Détection de visage sur l'appareil avec MediaPipe Face Landmarker.
