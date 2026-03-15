PATCH COMPILABLE V11 / SPRINT 2

Ce patch corrige deux problèmes :
1. Build Vercel bloqué par useSearchParams() dans les pages de création.
2. Schéma Supabase insuffisant par rapport aux colonnes réellement attendues par l'app Sprint 2.

FICHIERS À ÉCRASER DANS GITHUB V11 :
- app/players/create/page.tsx
- app/passations/create/page.tsx

PUIS DANS SUPABASE :
- exécuter database/sprint2_schema_patch.sql

ENSUITE :
- redeploy Vercel
