PATCH FLOW CREATE / PASSATION

Ce patch ajoute un flux simple et compilable :
1. /teams/create
2. /players/create
3. /passations/create
4. /passations/[token]

Objectif :
- créer une équipe
- créer un joueur
- créer une passation
- obtenir une page avec un lien vers le test correspondant

Aucune modification n'est faite sur les tests eux-mêmes.
Ce patch crée seulement le pont plateforme -> passation -> test.

Après injection :
- commit GitHub
- redeploy Vercel
- tester /teams/create puis /players/create puis /passations/create
