# Étape 4 — Items (armes, armures, capacités)

Fichiers fournis (en plus des étapes 1-3) :

```
template.json                       (mis à jour) types d'Item réels : arme, armure, capacite
module/item/base-item.js            classe IntreItem (estArme/estArmure/estCapacite)
module/item/sheet/item-sheet.js     feuille d'Item générique (un gabarit par type)
templates/item/arme.html
templates/item/armure.html
templates/item/capacite.html
style/item.less                     styles des feuilles d'Item + liste d'objets
module/actor/base-actor.js          (mis à jour) attack() va chercher l'arme équipée automatiquement,
                                     + getArmeEquipee/getChitineAttaqueTotal/getChitineDefenseTotal/
                                     getEncombrementArmures/getCapaciteBonus
module/common/roll.js               (mis à jour) préremplissage automatique des Chitine dans le
                                     dialogue de Dégâts (arme équipée + cible ciblée)
templates/chat/roll-dialog.html     (mis à jour) affiche les valeurs préremplies
module/actor/sheet/intre-sheet.js   (mis à jour) gestion des Items (créer/éditer/supprimer/équiper)
templates/actor/intre.html          (mis à jour) nouvel onglet "Objets"
insectopia.js                       (mis à jour) enregistre CONFIG.Item.documentClass + la feuille d'Item
lang/fr-snippet-etape4.json         libellés des types d'Item
```

## Ce que ça change concrètement

Avant cette étape, une attaque demandait de saisir "à la main" la Chitine
totale de l'attaquant et du défenseur dans le test de Dégâts. Maintenant :

1. Tu crées une arme (onglet Objets → "+ Ajouter une arme"), tu choisis sa
   compétence de combat (Mêlée/Tir/Prédateur), son modificateur d'Attaque
   et son modificateur de Dégâts (cf. livret p.28 : Griffes = Chitine-1,
   Mandibules hypertrophiées = Chitine+1, etc.), et tu coches "Équipée".
2. Tu cliques sur "Attaque Mêlée" (par exemple) dans l'onglet Combat :
   `attack()` retrouve automatiquement l'arme équipée pour cette
   compétence et ajoute son modificateur d'Attaque au jet.
3. Si l'attaque réussit et que tu as ciblé un token sur la scène avant de
   cliquer sur la couleur retenue, le dialogue de Dégâts s'ouvre avec les
   deux Chitine déjà pré-remplies : celle de l'attaquant (+ arme) et celle
   du défenseur ciblé (+ ses armures équipées). Il ne reste qu'à piocher.

C'est le même principe pour les **armures** : leur bonus de Chitine est
pris en compte automatiquement dans `getChitineDefenseTotal()`, et leur
malus d'encombrement est maintenant soustrait automatiquement de
l'Initiative (`_prepareDataIntre`), ce qui rend obsolète le champ manuel
"Encombrement" de l'onglet Combat pour tout ce qui vient d'une armure
équipée (le champ manuel reste utile pour d'autres sources d'encombrement
— fardeau transporté, entraves, etc.).

## Les capacités : deux systèmes qui coexistent (assumé, pas un oubli)

Depuis l'étape 2, il existe un onglet "Capacités" en texte libre
(`system.identite.capacites`, un tableau de {nom, description}). Cette
étape ajoute un **second** système, en Item, avec un bonus chiffré
optionnel et automatisé (`IntreActor.getCapaciteBonus()`, appelé
automatiquement dans `check()` et `attack()`).

Je n'ai pas fusionné les deux car ils ne servent pas le même besoin :
- Les capacités **non chiffrables** (Pestilence, Fouisseur, Vitesse
  surnaturelle...) n'ont pas vocation à s'automatiser facilement — le
  texte libre suffit et reste plus rapide à remplir.
- Les capacités **chiffrables** (Antennes ramifiées +1 Antenne, Mimétisme
  +1 aux tests de camouflage...) gagnent à être des Items avec bonus
  automatique, surtout si elles doivent un jour être glissées depuis un
  compendium de races.

Si tu préfères n'avoir qu'un seul système, dis-le-moi et je fusionne (le
plus simple serait de tout basculer en Items, avec un champ "chiffrable
oui/non" plutôt que deux emplacements distincts sur la feuille).

## Ce qui reste volontairement de côté

- **Pas de compendium de races/armes pré-remplies.** Chaque table doit
  être créée à la main pour l'instant. C'est l'étape logique suivante :
  un pack de compendium avec les 20 races, leurs capacités et quelques
  armes/armures de base tirées du kit de démarrage.
- **La restriction "une arme = une action par phase d'initiative"**
  (livret p.29) n'est toujours pas appliquée automatiquement.
- **Le bonus de capacité ne s'applique qu'aux jets `check()`/`attack()`**,
  pas encore aux tests de Dégâts ou aux tests de Défense subis (ex :
  Mimétisme qui améliore la difficulté à être repéré par un adversaire,
  qui est un jet fait par *l'autre* personnage — ce cas de figure
  "bonus qui s'applique au jet d'un tiers" demande un peu plus de
  réflexion sur le design, à voir à l'étape compendium/finitions).

## Pour tester

Crée une arme (ex : "Platère", compétence Mêlée, modificateur de Dégâts
+0), équipe-la sur un personnage, cible un second personnage, clique sur
"Attaque Mêlée", pioche, choisis une couleur de réussite : le dialogue de
Dégâts doit s'ouvrir avec les deux Chitine déjà remplies.
