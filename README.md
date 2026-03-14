# A4P ULTIMATE PLATFORM + HUB INTEGRATION

Ce pack combine :
- le portail A4P Ultimate Platform
- les liens avec le hub diagnostique A4P
- l'ouverture des 3 moteurs de tests existants

## Liens utilisés
- Hub diagnostique : https://alexandregriffet-cmd.github.io/A4P-Diagnostic-Academie-de-Performances-/
- CMP : https://alexandregriffet-cmd.github.io/CMP-A4P-ACADEMIE-DE-PERFORMANCES-/
- PMP : https://alexandregriffet-cmd.github.io/PMP-A4P-Acad-mie-de-Performances-/
- PSYCHO : https://alexandregriffet-cmd.github.io/Module-psycho-motionnelle/

## Ce que fait le pack
- ajoute un portail principal relié au hub
- ajoute des boutons "Retour au hub diagnostique"
- ouvre les 3 tests existants
- prépare l'ingestion des résultats dans Supabase via `/api/results/ingest`

## Important
Pour que les résultats remontent automatiquement :
- exécuter `sql/schema_master.sql` dans Supabase
- déployer le portail sur Vercel
- injecter les adaptateurs dans les 3 moteurs de tests existants
