OVERLAY V11 + SPRINT 2

Ce pack est conçu pour être injecté dans le repo GitHub A4P-Platform-V11.

Il ajoute le noyau Sprint 2 déjà construit :
- teams
- players
- passations
- CMPQuestionnaire
- API /api/cmp/submit
- fichiers Supabase
- SQL sprint2

Fichiers inclus :
- database/sprint2.sql
- app/dashboard/page.tsx
- app/teams/page.tsx
- app/teams/create/page.tsx
- app/teams/[teamId]/page.tsx
- app/players/create/page.tsx
- app/passations/page.tsx
- app/passations/create/page.tsx
- app/passations/[token]/page.tsx
- app/api/cmp/submit/route.ts
- components/CMPQuestionnaire.tsx
- lib/supabaseClient.ts
- lib/supabaseServer.ts
- styles/globals.css

Étapes après injection :
1. Commit sur main
2. Exécuter database/sprint2.sql dans Supabase
3. Redeploy Vercel
4. Tester /teams/create, /players/create, /passations/create et /passations/[token]
