# Journal de conception — Insectopia

> Ce document explique **pourquoi** le système est construit comme il l'est : choix de modélisation, écarts avec Omega (le système dont Insectopia est dérivé), et limites assumées. Pour savoir **où en est** le projet aujourd'hui, voir `STATUS.md`. Ce journal est un historique de raisonnement, pas un suivi d'état — il n'est mis à jour qu'en cas de changement de choix de conception, pas à chaque session.
>
> Remplace les anciens `README-etape1.md` à `README-etape6b.md` (fusionnés et réorganisés par thème le 2026-08-03 ; les corrections ultérieures ont été intégrées directement dans les sections concernées plutôt que laissées comme erreurs historiques à repérer soi-même).

---

## 1. Moteur de résolution (sac de Blattes)

**Fichiers** : `module/common/config.js`, `module/common/roll.js`, `templates/chat/roll-dialog.html`, `templates/chat/roll-result.html`, `style/chat/blattes.less`

Le mécanisme de fond est identique à Omega : un sac reconstruit et mélangé (Fisher-Yates) à chaque tirage, pioche sans remise au sein d'un même test, logique de résolution +1/-1/>1/<-1 reprise mot pour mot (elle correspond littéralement aux règles Insectopia p.24-25).

**Ce qui change vs Omega** :
- Sac de 42 Blattes (3 noire / 18 blanche / 12 bleue / 6 verte / 3 rouge) au lieu de 30 Diodes (3/12/6/6/3) — proportion de réussite simple plus élevée dans Insectopia.
- Terminologie : Diode → Blatte, Matrice → Deus, "programme" → compétence/caractéristique.
- Échelle de difficulté 0-6 avec libellés (Facile → Impossible), contre 0-7 sans libellés côté Omega.
- Suppression du superflu propre à Omega (précision d'arme, équipage/vaisseau, types de programme).
- Couleurs en CSS pur (pas d'assets graphiques) — à remplacer par des icônes si un illustrateur en fournit un jour.

**Choix philosophique important, conservé à toutes les étapes suivantes** : le moteur ne "choisit" jamais lui-même la Blatte retenue en cas de choix multiple (>1 ou <-1) — ce choix reste humain, matérialisé par des boutons cliquables dans le chat.

---

## 2. Feuille de personnage

**Fichiers** : `template.json`, `module/actor/base-actor.js`, `module/actor/sheet/intre-sheet.js`, `templates/actor/intre.html`, `module/common/helpers.js`

**Un seul type d'Actor : `intre`.** Contrairement à Omega (Advanced Synth / Synthétique / Organique / Vaisseau — des architectures très différentes), Insectopia n'a qu'une structure de personnage (race, caste, métier), utilisable pour PJ comme PNJ.

**Les 6 caractéristiques fixes** (Aile, Antenne, Mandibule, Esprit, Chitine, Température) ont chacune deux compétences liées, codées en dur (identiques pour tout le monde, livret p.26-28).

**La Caste est traitée à part** : ses deux compétences varient selon le métier (`system.caracteristiques.caste.competences` est un tableau libre rempli par le joueur). Choix assumé de "système ouvert" plutôt que liste fermée codée en dur — modifiable facilement si besoin.

**Attributs dérivés** (`prepareDerivedData`) : Impact max = Résistance ; Blessure interne max = Métabolisme ; Initiative = Activité − Encombrement ; malus de blessures internes injecté automatiquement dans les jets.

> **Correction (étape 6)** : la vitesse en vol est **Aile + 2** (livret p.196), pas Aile × 2 comme indiqué initialement d'après le kit de démarrage simplifié.

---

## 3. Combat

**Fichiers** : `module/combat/combat.js`, `combatant.js`, `combat-tracker.js`, `templates/combat/tracker.hbs`, `module/common/hooks.js`, `settings.js`

**Initiative** : reprise quasi telle quelle d'Omega — chaque combattant tire des Blattes selon son Activité, le Deus appelle les couleurs de la meilleure à la pire (rouge → verte → bleue → blanche → noire), correspond littéralement à la règle p.29. Une règle optionnelle du livret (le Deus peut ignorer le tirage et faire jouer l'Initiative la plus haute en premier) est câblée comme réglage système.

**Chaîne Attaque → Dégâts** (nouveau, absent du moteur générique de l'étape 1) :
1. Test d'Attaque (Mêlée/Tir/Prédateur vs Défense) → une couleur sort, avec un sens propre au test d'attaque (pas le sens générique).
2. Test de Dégâts (Chitine+arme vs Chitine+armure) → nombre d'impacts **fixe** par couleur (0/1/2/4/4+mutilation).
3. Réussite améliorée à l'Attaque = +1 Blatte tirée aux Dégâts ; réussite critique = +1 Blatte **et** couleur retenue améliorée d'un cran.

Ce choix de couleur reste humain (cohérent avec le principe posé en §1) : boutons cliquables dans le chat, qui enchaînent automatiquement Attaque → dialogue de Dégâts pré-rempli en cas de succès.

**Encaissement** : `subirImpacts()` — impacts jusqu'à Résistance, surplus en Blessures internes jusqu'à Métabolisme, inconscience notifiée (le décompte des 10 rounds avant hémorragie n'est **pas automatisé**, reste au Deus). `demanderMutilation()` — délègue au dialogue de Localisation (schéma cliquable + tirage au sort), détail complet en §8.

**Limites connues** : pas de restriction automatique "une arme = une action par phase d'initiative" (dépend de quelle arme a été utilisée à quelle phase — nécessite le modèle d'Item, posé à l'étape suivante).

---

## 4. Items (armes, armures, capacités)

**Fichiers** : `module/item/base-item.js`, `item-sheet.js`, `templates/item/{arme,armure,capacite}.html`, `style/item.less`

Avant cette étape, la Chitine d'attaque/défense se saisissait à la main à chaque test de Dégâts. Depuis : une arme équipée est retrouvée automatiquement par `attack()` selon sa compétence de combat, son modificateur d'Attaque s'ajoute au jet, et si l'attaque touche une cible ciblée sur la scène, le dialogue de Dégâts s'ouvre pré-rempli (Chitine attaquant+arme, Chitine défenseur+armures). Même principe pour les armures (bonus de Chitine en défense, malus d'encombrement soustrait automatiquement de l'Initiative).

**Deux systèmes de capacités qui coexistent (assumé, pas un oubli)** :
- Texte libre (`system.identite.capacites`) pour les capacités **non chiffrables** (Pestilence, Fouisseur...) — plus rapide à remplir, pas d'automatisation possible simplement.
- Items avec bonus chiffré optionnel (`getCapaciteBonus()`) pour les capacités **chiffrables** (Antennes ramifiées +1 Antenne...) — utile pour un futur compendium de races.

Fusionner les deux en un seul système (Items avec flag "chiffrable oui/non") est possible si souhaité, mais pas fait par défaut.

**Limites connues** : pas de restriction automatique "une arme = une action/phase" ; le bonus de capacité ne s'applique qu'aux jets `check()`/`attack()` de son propre personnage, pas aux jets faits par un tiers contre lui (ex : Mimétisme qui complique le repérage par l'adversaire) — nécessite une réflexion de design à part.

---

## 5. Compendiums

**Fichiers** : `tools/build-compendium-source.mjs`, `build-races-journal.mjs`, `build-castes-journal.mjs`, `packs-src/`, `packs/`

Contenu initial repris **tel quel** du kit de démarrage "Insectopia — L'invasion" (6 personnages pré-tirés jouables, 7 armes, 1 armure, 9 capacités, journal des 4 races du kit), puis étendu au livre de base complet (voir §6).

**Limite assumée découverte à cette étape** : "Antennes ramifiées" et "Mimétisme" améliorent l'Antenne *seulement* pour le repérage/camouflage (caractéristique utilisée seule), pas pour Phéromones/Tir — mais `getCapaciteBonus()` ne distingue pas "caractéristique seule" de "caractéristique via n'importe laquelle de ses compétences". Plutôt que livrer un bonus automatique subtilement faux, ces deux capacités restent `actif: false` (descriptif seul). Seule "Perception chimique hors du commun" est automatisée (bonus sans ambiguïté). Corriger ça proprement demanderait un mode explicite dans le modèle `capacite` ("s'applique à la caractéristique seule" vs "à toute compétence associée").

**Pipeline de régénération** :
```
1. Éditer tools/build-compendium-source.mjs (ou build-races-journal.mjs / build-castes-journal.mjs)
2. node tools/build-compendium-source.mjs   → régénère packs-src/
3. npx fvtt package pack -n <nom> -t <Type> --in packs-src/<nom> --out packs
   (nécessite npm install @foundryvtt/foundryvtt-cli en local une fois)
```

**Piège déjà résolu** : le format source attendu par `fvtt package pack` a besoin d'un champ interne `_key` sur chaque document (ex : `!actors!<id>`). Sans lui, l'outil **ignore silencieusement** le fichier — pas d'erreur, juste un pack vide. Le script générateur pose ce champ automatiquement.

---

## 6. Enrichissement depuis le livre de base (races, castes, capacités, armes)

Après lecture des pages 196-245 du livre de base, deux types de changements sur ce qui avait été construit à partir du kit simplifié :

**Corrections** :
- Vitesse en vol : Aile+2, pas Aile×2 (voir §2)
- Jauge "Souillure" 0-10 (pas "Sombre" démarrant à -1)
- Cuir de Sangchauds : bonus de **résistance au feu +1**, pas un bonus général de Chitine

**Ajouts** :
- Ressource **Fluide** (Chrysalide + Métabolisme + Souillure) — calcul automatique, dépense manuelle (comme les Blattes de chance)
- **20 races jouables** (18 intres + 2 araks) avec sélecteur sur la fiche (écrase les 7 caractéristiques + ajoute les capacités natives, après confirmation)
- **5 castes / 26 métiers** avec bonus, capacités, compétences de départ
- **68 capacités spéciales** classées par caractéristique, avec coûts Souillure/Fluide
- **27 armes/armures/boucliers** avec vrais tarifs ; dégâts fixes pour certaines armes (`system.degatsFixes`)
- **26 compétences de caste** détaillées (`data-competences-caste.js`), le personnage en possède autant que sa valeur en Caste, en plus des 2 compétences de départ du métier

**Sur les descriptions de capacités/métiers** : paraphrasées, pas recopiées — le livre consacre un long paragraphe de prose à chaque capacité (plus la liste d'éligibilité par race), ce qui aurait représenté une copie substantielle de texte protégé. Seul l'effet mécanique est capturé en une phrase courte. Si les tableaux d'éligibilité par race (données factuelles) sont voulus malgré tout, c'est faisable en complément.

---

## 7. Limites connues transversales (non résolues à ce jour)

- **Variante Arak non structurellement supportée.** Arak'chass/Arak'tiss utilisent Patte/Palpe/Chélicère et la compétence Soie à la place d'Aile/Antenne/Mandibule/Mêlée (p.197). `applyRace()` les case par approximation dans les mêmes emplacements que les intres, avec notification, mais rien ne renomme les champs. Une vraie prise en charge demande un second type d'Actor ou un mode d'affichage alternatif. *(Reporté, cf. STATUS.md)*
- **Malus d'encombrement des armures mal modélisé.** Le livre exprime le malus comme "-1 couleur au tirage d'initiative" ou "-1 action" (p.241), pas comme soustraction chiffrée à l'Activité. Le champ `modInitiativeType` existe avec les bonnes valeurs par pièce, **mais le moteur de jet ne le lit pas encore** — seul l'ancien `malusEncombrement` numérique (approximatif) est utilisé.
- **Boucliers modélisés comme de simples armures.** Pas de vraie mécanique de Parade/couvert (p.241), ni la restriction "inopérant contre Prédateur/saisie/Blocage/fuite/surprise" (notée en description, non appliquée).
- **Compétences de caste non branchées au modèle de données.** Le champ reste un tableau libre où on tape le nom à la main (cf. §2) — les brancher proprement (sélecteur + aide contextuelle) est un candidat naturel pour l'assistant de création de personnage.
- **Compétences spéciales de combat de caste** (Blocage, Escrime, Fureur, Coup Vicieux, Tireur d'élite, Vivacité) : détail mécanique complet renvoyant à un chapitre "Règles de combat" non encore dépouillé.

---

## 8. Localisation des mutilations (voir aussi STATUS.md §5 pour l'état courant)

**Fichiers** : `module/combat/mutilation.js`, `templates/dialog/mutilation.html`, `assets/localisation-insecte.png`, `module/common/config.js` (`LOCALISATION_ZONES`), `module/actor/base-actor.js`

Le livret (p.30) ne détaille pas de table de localisation chiffrée : il renvoie à *"la table de localisation de la fiche de personnage"*, qui est en réalité le petit schéma d'insecte de l'encart "Localisation" (fiche p.1), sans zones ni pourcentages imprimés. Deux choix ont donc été nécessaires, tous deux validés avec Obe plutôt que devinés :

- **Correspondance couleur → zone pour le tirage au sort** (Rouge=Tête, Verte=Thorax, Noire=Abdomen, Bleue=Aile, Blanche=Patte) : réutilise le sac de 42 Blattes déjà en place pour toutes les résolutions du jeu (cf. §1), plutôt que d'inventer un nouveau mécanisme de hasard. Une seule Blatte est piochée, indépendamment du tirage de Dégâts qui a déclenché la mutilation.
- **Effets Aile/Patte** : le livre ne chiffre qu'une "mutilation permanente" pour ces deux zones (contrairement à Tête/Abdomen = mort, Thorax = immobilisation, qui sont des règles fixes p.30). Un malus simple a été ajouté en **House Rule explicite** (Aile → vitesseVol à 0 ; Patte → vitesseSol -2, minimum 0), isolé dans `_prepareDataIntre()` et commenté comme extrapolation, pas comme règle du livre.

**Pourquoi un overlay SVG plutôt que des zones cliquables en `<div>` + `position:absolute` en `%`** : première implémentation avec des `div.loc-hotspot` positionnées en pourcentage sur un conteneur à hauteur automatique — bug classique CSS, un élément en `position:absolute` ne peut pas résoudre un `%` de `top`/`height` si son conteneur positionné n'a pas de hauteur explicite (elle dépend elle-même du contenu, ici l'image). Résultat observé en test live : zones qui flottent au-dessus de l'image, hors de son cadre. Remplacé par un `<svg viewBox="0 0 490 486">` (dimensions natives de `localisation-insecte.png`) superposé à l'image via `display:grid` + `grid-area:1/1` sur les deux éléments — alignement garanti par construction, indépendant de la taille réelle d'affichage du dialogue.

**Choix cohérent avec le reste du système** : `demanderMutilation()` (déjà existant depuis l'étape Combat, cf. §3) délègue simplement à `ouvrirDialogueMutilation()` — un seul point de branchement modifié, la logique reste dans un module dédié plutôt que noyée dans `base-actor.js`.

**Historique** : chaque mutilation résolue est journalisée dans un flag acteur (`insectopia.mutilations` : zone, effet, round, manuel/hasard), sans affichage dédié sur la fiche — pas jugé nécessaire pour l'instant (retour Obe), l'info reste accessible en flag si un futur écran de récapitulatif la veut.

---

## 9. Magie (voir aussi STATUS.md §4 pour l'état courant)

Cinq Mots de pouvoir (Altération, Contrôle, Connaissance, Évocation, Négation), restriction par métier/sphère selon la table p.267. Résolution en deux phases : compétence de sphère vs Difficulté (somme de 5 axes d'Influence 0-7), puis Puissance vs opposition choisie par le Deus. Maladresse (Blatte noire) = revers ; sphère Souillure donne des points de Souillure au lieu de dégâts.

Choix : sorts en dialogue libre par lancer, pas des Items réutilisables (cohérent avec la nature très variable d'un sort à l'autre, contrairement à une arme qui a des stats fixes).

Sept cellules de la table p.267 restent `// À VÉRIFIER` (scan PDF ambigu sur le comptage de points) — voir STATUS.md pour le détail et la marche à suivre.
