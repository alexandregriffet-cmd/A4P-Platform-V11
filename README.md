# A4P Platform V11

Version opérationnelle de base avec :
- Supabase branché
- comptes utilisateurs
- passation réelle CMP
- stockage des résultats
- dashboard dynamique
- email automatique des résultats
- admin A4P

## 1. Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 2. Supabase

1. Crée un projet Supabase.
2. Copie les clés API dans `.env.local`.
3. Exécute `sql/schema.sql` dans l’éditeur SQL Supabase.
4. Crée au moins un club et une équipe via le dashboard ou directement dans Supabase.

## 3. Email résultats

Cette V11 utilise **Resend**.

Renseigne :
- `RESEND_API_KEY`
- `RESULTS_EMAIL_TO=alexandre.griffet@yahoo.fr`
- `RESULTS_EMAIL_FROM`

À chaque soumission CMP :
1. le résultat est stocké dans `tests`
2. un email est envoyé à Alexandre
3. le log est stocké dans `email_logs`

## 4. Routes principales

- `/` : portail principal
- `/login` : connexion
- `/signup` : création de compte
- `/dashboard` : dashboard global
- `/individuel` : entrée individuelle
- `/individuel/tests/cmp` : CMP individuel
- `/club` : entrée club
- `/club/equipes` : équipes
- `/club/passations/create` : création passation club
- `/passation/[token]` : passation publique joueur
- `/admin` : back-office A4P

## 5. Important

Cette V11 est prête à être branchée et testée. Pour qu’elle fonctionne réellement en production, tu dois :
- créer le projet Supabase
- configurer les variables d’environnement
- déployer sur Vercel
- configurer le domaine d’envoi Resend
