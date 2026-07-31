# Étape 6 — Enrichissement depuis le livre de base

J'ai lu les pages 196-242 du livre de base ("La création de personnage",
capacités, castes et métiers, armes/armures/équipements) et j'en ai tiré
deux types de changements : **des corrections** de ce qui avait été
construit à partir du kit de démarrage simplifié, et **des ajouts**
(races, castes/métiers, capacités, armes/armures complètes).

## Corrections (le kit divergeait du livre de base)

1. **Vitesse en vol** : le livre de base dit "Aile + 2" (p.196). Le kit
   disait "deux fois supérieure" (Aile × 2). `_prepareDataIntre()` utilise
   maintenant la formule du livre de base.
2. **Souillure au lieu de Sombre** : le livre de base nomme cette jauge
   "Souillure", sur une échelle de **0 à 10** (p.206), alors que le kit
   parlait de "Sombre" démarrant à **-1**. `template.json`, `base-actor.js`
   et la feuille ont été mis à jour (`system.combat.souillure`).
3. **Cuir de Sangchauds** : le livre de base précise que cette armure
   donne un bonus de **résistance au feu +1**, pas un bonus général de
   Chitine (p.241) — contrairement à ce que laissait supposer le kit
   ("armure totale 4" pour une Chitine de 3). Les personnages pré-tirés
   embarquent maintenant la version correcte de cette armure ; leur
   Chitine de défense effective baisse donc légèrement par rapport aux
   étapes précédentes. C'est une correction assumée, pas un oubli.

## Ajouts

- **Ressource Fluide** (`system.combat.fluide`), absente du kit :
  Chrysalide + Métabolisme + Souillure. C'est la ressource que dépensent
  la plupart des capacités pour améliorer la couleur d'un tirage. Le
  calcul est automatique ; la dépense reste manuelle (comme les Blattes
  de chance), aucune UI de dépense automatisée n'a été construite.
- **20 races jouables** (18 intres + 2 araks), `module/common/data-races.js` :
  caractéristiques, capacités natives, religion, castes de prédilection.
  Un sélecteur de race est apparu en tête de fiche ("Appliquer la race") :
  il écrase les 7 caractéristiques et ajoute les capacités natives
  manquantes, après confirmation.
- **5 castes / 26 métiers**, `module/common/data-castes.js` : bonus de
  caste, choix de capacités, et les 2 compétences de départ par métier.
  Disponible en compendium JournalEntry ("Castes et métiers") pour
  référence ; pas (encore) de sélecteur automatique sur la fiche, la
  Caste restant un système ouvert (voir étape 2).
- **68 capacités spéciales** classées par caractéristique (au lieu des 9
  du kit), avec coûts en Souillure et en Fluide. Compendium "Capacités"
  mis à jour en conséquence.
- **27 armes/armures/boucliers** (au lieu de 8), avec vrais tarifs en
  quartz et, pour l'Arbalète et le Crache-sang fétide des Anciens Dieux,
  des **dégâts fixes** plutôt qu'un modificateur à la Chitine — nouveau
  champ `system.degatsFixes` sur les armes, pris en compte automatiquement
  par `getChitineAttaqueTotal()`.

## Sur les descriptions de capacités : paraphrasées, pas recopiées

Le livre de base consacre un paragraphe entier de prose à chaque
capacité (souvent une dizaine de lignes, plus la liste exhaustive des
races Natif/Évolution/Souillure qui peuvent l'acquérir). Reproduire ce
texte mot pour mot dans 68 fiches d'Item aurait représenté une copie
substantielle de texte protégé. J'ai donc **paraphrasé l'effet mécanique
en une phrase courte** pour chaque capacité (ce qui compte pour faire
fonctionner le jet), et **omis la prose d'ambiance ainsi que le détail
"quelle race peut acquérir quoi et à quel prix de Souillure"** — cette
dernière info reste dans ton livre, à consulter à la table. Si tu veux
que j'intègre malgré tout ces tableaux d'éligibilité par race (ce sont
des données factuelles, pas de la prose), dis-le-moi, c'est faisable en
étape suivante.

Pour la même raison, je n'ai pas recopié les longs paragraphes de
présentation de chaque métier (Archer, Bretteur, Chaman...) : seules les
2 compétences de départ de chaque métier sont capturées, qui sont
l'information mécaniquement utile.

## Limites assumées (nouvelles, découvertes à cette étape)

- **Variante Arak non structurellement supportée.** Les Arak'chass et
  Arak'tiss utilisent Patte/Palpe/Chélicère et la compétence Soie à la
  place d'Aile/Antenne/Mandibule/Mêlée (livret p.197). `applyRace()` les
  case dans les mêmes emplacements que les intres par approximation, et
  affiche une notification pour te le rappeler — mais rien ne renomme
  automatiquement les champs sur la fiche. Une vraie prise en charge
  demanderait un second type d'Actor ou un mode d'affichage alternatif.
- **Le malus d'encombrement des armures est mal modélisé.** Le livre de
  base (p.241) exprime le malus d'une armure comme "-1 couleur au tirage
  d'initiative" ou "-1 action", pas comme une soustraction chiffrée à
  l'Activité — alors que `getEncombrementArmures()` (étape 3) soustrait
  un nombre brut. J'ai ajouté le champ `modInitiativeType` (valeurs
  "aucun"/"-1couleur"/"-1action"/"-2action") sur les armures avec les
  bonnes valeurs par pièce d'équipement, mais **le moteur de jet ne lit
  pas encore ce champ** — seul l'ancien `malusEncombrement` numérique
  (mis à 0 ou 1 de façon approximative sur les nouvelles armures) est
  pris en compte. C'est le prochain chantier logique côté combat.
- **Boucliers modélisés comme des armures.** Le livre de base leur donne
  une vraie mécanique de Parade/couvert (p.241) que je n'ai pas
  implémentée ; ils n'apportent pour l'instant qu'un bonus/malus de
  Chitine, sans les bonus de Parade ni la restriction "inopérant contre
  Prédateur/saisie/Blocage/fuite/surprise" (notée dans leur description,
  mais pas appliquée automatiquement).
- **Compétences de caste non détaillées mécaniquement.** J'ai les noms
  (Tireur d'élite, Blocage, Escrime, Fureur, Essaim, Courtoisie...) mais
  pas leur effet de jeu complet (pages au-delà de 218, non lues à cette
  étape).

## Fichiers fournis (en plus des étapes 1-5)

```
module/common/data-races.js         20 races (caractéristiques, capacités, religion, castes)
module/common/data-castes.js        5 castes / 26 métiers (bonus, capacités, compétences de départ)
template.json                        (mis à jour) Souillure/Fluide, nouveaux champs arme/armure/capacité
module/actor/base-actor.js           (mis à jour) formules corrigées, applyRace(), degatsFixes
module/actor/sheet/intre-sheet.js    (mis à jour) sélecteur de race + confirmation avant application
templates/actor/intre.html            (mis à jour) Souillure/Fluide, sélecteur de race
tools/build-compendium-source.mjs    (mis à jour) 68 capacités, 27 armes/armures/boucliers
tools/build-races-journal.mjs        réécrit : 20 races au lieu de 4, généré depuis data-races.js
tools/build-castes-journal.mjs       nouveau : journal des 5 castes/26 métiers
packs/*, packs-src/*                 régénérés et recompilés
system.json                          (mis à jour) + compendium castes, version 0.4.0
```

## Pour tester

Ouvre une fiche, choisis une race dans le nouveau menu déroulant en haut,
clique sur "Appliquer" : les 7 caractéristiques doivent se mettre à jour
et les capacités natives apparaître dans l'onglet Objets. Vérifie aussi
l'onglet Combat : Souillure (0-10) et Fluide doivent s'afficher à la
place de l'ancien "Sombre".
