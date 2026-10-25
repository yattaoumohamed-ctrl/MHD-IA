# MHD AI — version sans clé API

Cette version utilise Puter.js depuis le navigateur : aucune clé API n'est à copier dans le code et aucun serveur Node.js n'est requis. La documentation officielle explique le modèle « User-Pays » : l'utilisateur peut devoir se connecter à Puter et les quotas gratuits sont limités. Au-delà, des frais ou une limite peuvent s'appliquer.

## Démarrage
1. Décompresse `MHD_AI_Gratuit.zip`.
2. Pour tester rapidement, publie les fichiers sur GitHub Pages (HTTPS) ou un hébergeur statique HTTPS. Évite d'ouvrir `index.html` directement en `file://`.
3. Sur GitHub, mets `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js` et le dossier `icons` à la racine du dépôt.
4. Dans Settings → Pages, active la publication depuis la branche principale et le dossier racine.
5. Ouvre le lien HTTPS publié, attends que Puter.js charge, puis envoie un message. Le service peut demander une connexion ou une autorisation Puter.
6. Dans Chrome Android, menu ⋮ → « Installer l'application » ou « Ajouter à l'écran d'accueil ».

## Fonctionnalités
- Chat IA avec historique de conversation en mémoire pendant la session
- Choix de modèle
- Dictée vocale via le navigateur si pris en charge
- Lecture vocale des réponses
- PWA installable et fichiers statiques mis en cache

## À savoir
- Ce n'est pas le moteur ChatGPT directement intégré : Puter.js fournit une passerelle vers des modèles IA tiers. La disponibilité des modèles et les quotas peuvent changer.
- Le mode hors ligne permet seulement de charger l'interface mise en cache ; les réponses IA demandent Internet.
- Le code a été assemblé et l'archive vérifiée, mais il faut encore tester le service IA depuis le téléphone et accepter les éventuelles demandes de connexion.
