# Controverse SDHI

Site statique - projet ESIEE Paris.

## Deploiement Vercel

1. Importer le depot GitHub `Simonrtp/Controverse`.
2. Root Directory : laisser vide (racine du depot).
3. Framework Preset : Other (detecte automatiquement via `vercel.json`).
4. Build Command / Install Command : vides (pas de build npm).
5. Output Directory : `.` (racine — `index.html` doit etre a la racine).
6. Nom du projet Vercel : utiliser un nom sans espace (ex. `controverse-sdhi`).

Le fichier `vercel.json` force deja ces regles. Ne pas creer de dossier `public/` a la racine :
Vercel le prendrait par defaut comme repertoire de sortie et le site ne s'afficherait pas.

Apres un changement : Redeploy le dernier deploiement, ou laisser le deploiement auto GitHub.

Fichiers a la racine : index.html, style.css, script.js, favicon.png, images/.

## Local

npx serve .
