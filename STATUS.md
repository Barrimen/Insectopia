# STATUS — Insectopia (Foundry VTT v14)

> Ce fichier est la source de vérité sur l'avancement du projet. Il est mis à jour par Claude après chaque session de travail. En début de session, Claude le lit en premier (via clone du repo) avant de proposer quoi que ce soit.

Dernière mise à jour : 2026-08-07 (fusion Souillure Lot A/B + Calendrier d'Entoma — voir note en §5quater)

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
| Système de magie | ✅ Fait | voir §4 |
| Localisation des mutilations | ✅ Fait | voir §5 |
| **Souillure — Lot A (jauge, tests, calendrier-ready) + Lot B (mutations)** | ✅ Fait | voir §5bis / §5ter |
| **Calendrier d'Entoma** | ✅ Fait (dernière session), non testé live | voir §5quater |

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

## 5. Localisation des mutilations — détail

- Déclenchée sur Blatte rouge au test de Dégâts (`mutilation: true`, livret p.30). Dialogue : schéma d'insecte cliquable (overlay SVG en `viewBox`, cf. §7 Journal de conception pour le pourquoi du SVG plutôt que des `div` en `position:absolute`) + boutons de secours + tirage au sort optionnel.
- Tirage au sort = une Blatte indépendante piochée dans le sac de 42 (pas le tirage de Dégâts lui-même) : Rouge→Tête, Verte→Thorax, Noire→Abdomen, Bleue→Aile, Blanche→Patte (mapping validé par Obe, absent du livre tel quel).
- Effets Tête/Abdomen = mort immédiate, Thorax = immobilisation : règle fixe p.30.
- Effets Aile (vitesseVol → 0) / Patte (vitesseSol -2) : **House Rule**, le livre ne chiffrant qu'une "mutilation permanente" sans effet mécanique pour ces deux zones. Isolé et commenté comme tel dans `_prepareDataIntre()`.
- Fichiers : `module/combat/mutilation.js`, `templates/dialog/mutilation.html`, `assets/localisation-insecte.png` (nouveaux) ; `module/common/config.js` (`LOCALISATION_ZONES`), `module/actor/base-actor.js` (modifiés).
- Historique des mutilations journalisé en flag acteur (`insectopia.mutilations`), pas affiché sur la fiche (choix assumé — pas nécessaire selon Obe).

---

## 5bis. Souillure — Lot A — détail

- Règle source : livre de base p.295-298 (section Deus, "La Souillure et ses mutations"), absente du kit de démarrage.
- **Test de contraction** (exposition) : Chrysalide vs Difficulté selon une table de toxicité à 5 niveaux (`TOXICITE_SOUILLURE`, p.295). Résultat par couleur : noire +2 Souillure, blanche +1, bleue aucun effet, verte évite le prochain test (flag `insectopia.souillureEviteProchainTest`), rouge plus de test ce jour-là (flag `insectopia.souillureSkipContractionUntil`, fenêtre de 86400s de temps de jeu).
- **Test d'évolution mensuelle** (par lonas, personnage déjà contaminé) : Chrysalide vs Difficulté = Souillure actuelle. Résultat par couleur : noire +2, blanche +1, bleue 0, verte -1, rouge -2 (borné à 0 minimum). **Blattes de chance interdites sur ce test** (livre p.298).
- **Paliers d'effets** (`SOUILLURE_PALIERS`) : 3 = marques blanches, 5 = phosphorescence + mutation niv.1, 7/9/11 = mutations niv.2/3/4, 13 = mort (`toggleStatusEffect("dead")` automatique). Notification uniquement au *franchissement* du seuil.
- **Calendrier-ready** : hook natif `updateWorldTime` (`registerSouillureCalendarHook`, appelé depuis `insectopia.js`). Dès que le temps de la partie avance, le test d'évolution se déclenche automatiquement pour chaque PJ contaminé ayant dépassé la durée d'un lonas depuis son dernier test (réglage `secondesParLonas`, défaut 28 jours). Bouton GM manuel "Forcer un test de lonas" en secours (sidebar Paramètres).
- Jauge Souillure sur la fiche : lecture seule pour les joueurs, éditable par le Deus uniquement ; badges "marqué"/"phosphorescent" aux seuils 3/5.
- Fichiers : `module/combat/souillure.js` (nouveau) ; `module/common/config.js`, `module/common/roll.js`, `module/common/hooks.js`, `module/common/settings.js`, `templates/actor/intre.html`, `templates/chat/roll-result-choix.html`, `insectopia.js` (modifiés).
- Nouveaux dialogues construits directement en **DialogV2**.

---

## 5ter. Souillure — Lot B (mutations) — détail

- Au franchissement d'un seuil de Souillure (5/7/9/11), message chat GM-only avec bouton "Choisir la mutation" → `ouvrirDialogueMutation(actorId, niveau)` : liste (DialogV2) filtrée sur les mutations du niveau atteint (`MUTATIONS_BLAFARDES`, livre p.296-297), description affichée dynamiquement.
- **Effets automatisés** (5 mutations sur 14, cible unique et non ambiguë) : *Inerte* (Température -1), *Fonte de chitine* (Chitine -1), *Couard* (-2 caractéristique-large sur Mandibule via `system.bonus`), *Tête de Plume/Sang-chaud* (-3 ciblé sur Instinct).
- **Effets non automatisés** (9 mutations) : multi-cibles sur des caractéristiques différentes ou contrôle narratif (*Possédé*, *Instable*, *Éphémère*, *Vide magique*, etc.) — notifiés par chat avec description complète, à appliquer manuellement plutôt que d'automatiser une approximation inexacte.
- Historique par acteur : flag `insectopia.mutationsBlafardes`, affiché en badges sur la fiche.
- Contrepartie du livre (capacité gratuite en échange) : ouverture auto du picker de capacité existant (`item-picker.js`) après la mutation. **Gap pré-existant identifié au passage** : le picker hors wizard de création n'a jamais appliqué automatiquement le coût en Souillure d'une capacité choisie — cette "gratuité" était donc déjà le comportement par défaut, aucun bypass spécial nécessaire ; ce gap reste à traiter séparément si besoin (voir §7).
- Fichiers modifiés : `module/common/config.js` (`MUTATIONS_BLAFARDES`), `module/combat/souillure.js`, `module/common/hooks.js` (bouton chat `.choisir-mutation`), `templates/actor/intre.html` (badges).

---

## 5quater. Calendrier d'Entoma — détail

- Modèle temporel piloté par `game.time.worldTime` (API Foundry native) : aucun compteur maison en doublon. `module/common/data-calendrier.js` (pure, testable) transforme `worldTime` + réglage `calendrierLonasParKumi` en `{jourTotal, jourDansLonas (1-28), lonasTotal, lonasDansKumi, kumiIndex, kumiLabel, estNuit}`.
- Lonas = 28 jours (valeur fixe du livre p.278). Kumi = 3 lonas par défaut, **House Rule ajustable** (réglage monde `calendrierLonasParKumi`) : le livre précise que la durée d'un kumi "varie selon les pays" sans donner de valeur fixe.
- **Météo non déduite du kumi** : le livre indique explicitement (p.279) qu'une table météo-par-kumi serait "complexe, et sans doute improductif" à fournir, et laisse ce choix au Deus. La météo actuelle (`calendrierMeteoActuelle`) est donc une sélection manuelle dans le widget, indépendante du kumi.
- Table Météorologie → modificateur Activité/Métabolisme → Risques reproduite à l'identique du livre (p.279) dans `TABLE_METEO`. Le modificateur est injecté dans `base-actor.js#_prepareDataIntre()` (initiative, `blessureinterne.max`, `fluide.max`) — avec météo "Tempéré" par défaut (modificateur 0), tous les calculs restent strictement identiques à avant ce chantier.
- Risques (Gel/Diapause/Frénésie) : calculés et exposés (`system.combat.risqueGel`, `risqueDiapauseMeteo`, `risqueFrenesie`) mais **jamais appliqués automatiquement** (pas de mort, pas de blocage) — décision explicite d'Obe : indicateurs seulement, la main reste au Deus.
- Diapause hivernale (p.278) : flag purement déclaratif (`actor.getFlag("insectopia","diapause")`, méthode `actor.estEnDiapause()`), basculé à la main par le Deus depuis le widget (case à cocher par acteur). Le livre ne donnant pas de liste mécanique des exceptions (Sang-chaud, peuples septentrionaux), aucune déduction automatique depuis la race n'est faite.
- Jour/nuit : frontière = milieu de journée (le livre ne précise pas d'heure différente de la mesure humaine). Bonus nocturne aux Phéromones (+1) = **House Rule non chiffrée par le livre** (`calendrierBonusNuitPheromones`, réglage désactivable), actuellement affiché (`system.combat.bonusNuitPheromones`) mais **pas encore branché sur les jets** (`roll.js` non touché ce chantier — reporté, à faire dans une prochaine session si Obe le souhaite).
- **Chute de température nocturne : non implémentée.** Le livre mentionne "la température baisse" la nuit sans donner de chiffre — volontairement non inventé plutôt que de poser une valeur arbitraire.
- Widget `CalendrierApp` (ApplicationV2) : accessible via un nouveau bouton "Calendrier d'Entoma" dans les contrôles de scène (visible de tous). Contrôles GM (jour suivant / lonas suivant / forcer kumi suivant / changer météo / cocher diapause par acteur) ; vue lecture seule pour les joueurs. Se ré-affiche automatiquement via le hook `insectopia.calendrierChange`.
- **Intégration avec la Souillure — corrigée le 2026-08-07** : cette session avait cloné le dépôt GitHub distant, qui ne reflétait pas encore le chantier Souillure (livré et appliqué localement par Obe via `dispatch.py`, mais jamais poussé sur GitHub avant ce clonage) — d'où la conclusion initiale (et erronée a posteriori) que `module/combat/souillure.js` et `secondesParLonas` n'existaient pas. Les deux systèmes coexistent en réalité et ont été fusionnés après coup (voir §5bis/§5ter) : `registerSouillureCalendarHook()` est maintenant bien appelé depuis `insectopia.js`, aux côtés de `registerCalendrierHooks()` — deux listeners `updateWorldTime` distincts et indépendants, aucun conflit. **Amélioration possible non faite (à discuter avec Obe)** : faire écouter `souillure.js` sur le hook `insectopia.calendrierChange` (plus riche, expose directement `lonasTotal` etc.) plutôt que sur `updateWorldTime` brut, pour n'avoir qu'un seul point d'entrée temporel dans le système. **Leçon de process à retenir** : pousser sur GitHub après application d'un patch Claude évite ce genre de divergence entre sessions qui clonent le dépôt à des moments différents.
- Fichiers : `module/common/data-calendrier.js`, `module/common/calendrier.js`, `module/dialog/calendrier-app.js`, `templates/dialog/calendrier.html` (nouveaux) ; `module/common/settings.js`, `module/actor/base-actor.js`, `insectopia.js` (modifiés).
- **Non testé en Foundry live à ce stade.**

---

## 6. Dette technique / à surveiller

- **Compendiums (`packs/`) en retard** sur le code source (`packs-src/`, `data-capacites.js`, `data-competences-caste.js`). Recompilation à faire après les derniers ajouts.
- CLI `@foundryvtt/foundryvtt-cli` : chaque document source doit avoir un champ `_key`, sinon il est silencieusement ignoré au packing.
- `fvtt package pack` ajoute automatiquement le nom du pack au `--out`.
- Stratégie d'import CSS (GPT) : compatibilité avec le tableau `styles` de `system.json` à confirmer.
- Champs de données pour la vitesse de déplacement : non confirmés.
- Licence des polices utilisées par GPT : non confirmée.
- **Classe `Dialog` (V1 Application framework) dépréciée depuis Foundry v13**, suppression prévue en v16 — confirmé par warning console en test live (2026-08-05). Utilisée par tous les dialogues actuels du système (`magic.js`/`sort-cast.html`, `mutilation.js`/`mutilation.html`, et les dialogues de `roll.js`). Migration vers `DialogV2` (`foundry.applications.api`, déjà stable en v14) actée comme prochain chantier — voir §7.
- **Process** : pousser sur GitHub après application d'un patch via `dispatch.py`, pour éviter qu'une session ultérieure clone un état distant obsolète et écrase silencieusement un chantier appliqué localement mais non poussé (cf. incident Souillure/Calendrier du 2026-08-07, corrigé — voir §5quater).

---

## 7. À venir / backlog

Voir GitHub Issues (mise en place en cours — voir README ou demander à Claude/Obe pour le détail).

Éléments identifiés au 2026-08-05 :
- **Migration DialogV2** : chantier transverse, tous les dialogues du système à la fois (pas un fichier isolé) pour éviter la cohabitation de deux styles. Priorité proche vu la dépréciation déjà active en v14.
- Test live du wizard de création de personnage sur Foundry
- Bonus nocturne Phéromones (calendrier) : brancher `system.combat.bonusNuitPheromones` sur les jets réels dans `roll.js` (actuellement affichage seul, cf. §5quater)
- **Souillure — Lot C éventuel** : gap pré-existant confirmé pendant le Lot B (l'ajout d'une capacité via le picker de la fiche n'applique jamais automatiquement son `souillureCout`), envisager d'étendre `system.bonus` des capacités pour supporter plusieurs cibles (array de {caracKey, compKey, valeur}) afin d'automatiser les mutations restées manuelles (Purulent, Décérébré, Antenne en moins, Obèse, Membre atrophié).
- **Fusion des hooks temporels** (optionnel) : faire écouter `souillure.js` sur `insectopia.calendrierChange` plutôt que `updateWorldTime` brut (voir note §5quater).
- Résolution des 7 cellules `// À VÉRIFIER` (magie, table p.267)
- Recompilation des `packs/`
- Support race Arak (reporté)
- Fonctionnalités magie V2 (§4)

---

## 8. Règles apprises (erreurs corrigées)

- Vitesse de vol = Aile+2, **pas** Aile×2
- Jauge de corruption = "Souillure" 0–10, **pas** "Sombre" démarrant à −1

*(Rappel : toujours revérifier dans le PDF plutôt que de supposer, même pour des règles qui semblent connues.)*