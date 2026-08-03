# STATUS — Insectopia (Foundry VTT v14)

> Ce fichier est la source de vérité sur l'avancement du projet. Il est mis à jour par Claude après chaque session de travail. En début de session, Claude le lit en premier (via clone du repo) avant de proposer quoi que ce soit.

Dernière mise à jour : 2026-08-03 (création initiale du fichier)

---

## 1. Périmètre Claude vs GPT

- **Claude** : logique de création de personnage, moteur de règles, validation mécanique vs rulebook.
- **GPT** : CSS / UI graphique. Travail visible dans `#GPT - remodelage graphique/` (pas encore fusionné dans les fichiers actifs).
- **Claude** review le travail GPT pour cohérence rulebook quand demandé, ne produit pas de CSS.

---

## 2. État des 7 étapes de création de personnage

| Étape | État | Fichiers clés |
|---|---|---|
| 1. Caractéristiques + compétences | ✅ Fait | `character-wizard.js`, `base-actor.js` |
| 2. Choix de race | ✅ Fait (20 races) | `data-races.js`, `evolution.js` |
| 3. Blattes d'évolution | ✅ Fait | `evolution.js` |
| 4. Caste / métier | ✅ Fait (5 castes / 26 métiers) | `data-castes.js` |
| 5. Compétences de caste | ✅ Fait | `data-competences-caste.js` |
| 6. Répartition points de compétence | ✅ Fait | `character-wizard.js` |
| 7. Attributs secondaires | ✅ Fait | `base-actor.js` |

⚠️ **Non confirmé testé en live sur une instance Foundry réelle.** C'est le point bloquant principal avant de considérer la création de personnage comme livrée.

---

## 3. Autres systèmes

| Système | État | Notes |
|---|---|---|
| Moteur de résolution (Blattes, sac 42 jetons) | ✅ Fait | |
| Fiche de personnage (7 carac + compétences) | ✅ Fait | |
| Combat | ✅ Fait | `combat.js`, `combat-tracker.js`, `combatant.js` |
| Items (armes/armures/capacités + bonus auto) | ✅ Fait | |
| Compendiums LevelDB | ✅ Fait mais **désynchronisé** | voir §5 |
| Enrichissement données rulebook (races/castes/métiers/capacités) | ✅ Fait | |
| **Système de magie** | ✅ Fait (dernière session) | voir §4 |

---

## 4. Système de magie — détail

- 5 Mots de pouvoir (Altération, Contrôle, Connaissance, Évocation, Négation), restriction par métier/sphère (rulebook p. 267)
- Table d'Influence 5 axes (Puissance/Portée/Cibles/Zone/Durée, niveaux 0–7), somme = Difficulté
- Résolution 2 phases : compétence de sphère vs Difficulté, puis Puissance vs opposition choisie par le Deus
- Maladresse (Blatte noire) = revers ; sphère Souillure donne des points de Souillure au lieu de dégâts
- Sorts = dialogue libre par lancer (pas des Items réutilisables)
- Fichiers : `data-spheres.js`, `magic.js`, `sort-cast.html` (nouveaux) + 9 fichiers modifiés

**7 cellules `// À VÉRIFIER`** dans `data-spheres.js` (table p. 267, scan PDF ambigu sur le comptage de points). Confirmé acceptable en l'état, à corriger si un meilleur scan ou clarification éditeur arrive.

**Reporté en V2** : bonus de crans d'Influence Blatte verte/rouge, interruption de lancer en combat par blessures internes, limite quotidienne de sorts.

---

## 5. Dette technique / à surveiller

- **Compendiums (`packs/`) en retard** sur le code source (`packs-src/`, `data-capacites.js`, `data-competences-caste.js`). Recompilation à faire après les derniers ajouts.
- CLI `@foundryvtt/foundryvtt-cli` : chaque document source doit avoir un champ `_key`, sinon il est silencieusement ignoré au packing.
- `fvtt package pack` ajoute automatiquement le nom du pack au `--out`.
- Stratégie d'import CSS (GPT) : compatibilité avec le tableau `styles` de `system.json` à confirmer.
- Champs de données pour la vitesse de déplacement : non confirmés.
- Licence des polices utilisées par GPT : non confirmée.

---

## 6. À venir / backlog

Voir GitHub Issues (mise en place en cours — voir README ou demander à Claude/Obe pour le détail).

Éléments identifiés au 2026-08-03 :
- Test live du wizard de création de personnage sur Foundry
- Résolution des 7 cellules `// À VÉRIFIER`
- Recompilation des `packs/`
- Support race Arak (reporté)
- Fonctionnalités magie V2 (§4)

---

## 7. Règles apprises (erreurs corrigées)

- Vitesse de vol = Aile+2, **pas** Aile×2
- Jauge de corruption = "Souillure" 0–10, **pas** "Sombre" démarrant à −1

*(Rappel : toujours revérifier dans le PDF plutôt que de supposer, même pour des règles qui semblent connues.)*
