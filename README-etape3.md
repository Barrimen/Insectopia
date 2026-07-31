# Étape 3 — Combat

Fichiers fournis (en plus des étapes 1 et 2) :

```
module/combat/combat.js            InsectopiaCombat : tri par couleur d'initiative
module/combat/combatant.js         InsectopiaCombatant : blattes d'initiative individuelles
module/combat/combat-tracker.js    Tracker de combat (affichage + ajustement)
templates/combat/tracker.hbs       Template du tracker
module/common/roll.js              (mis à jour) jets ATTACK/DEGATS avec choix de couleur
module/common/hooks.js             branchement des boutons de chat
module/common/settings.js          réglages (visibilité PNJ, règle optionnelle d'initiative)
templates/chat/roll-dialog.html    (mis à jour) mode dédié pour le test de Dégâts
templates/chat/roll-result-choix.html   résultat avec boutons de choix de couleur
module/actor/base-actor.js         (mis à jour) attack(), subirImpacts(), demanderMutilation()
module/actor/sheet/intre-sheet.js  (mis à jour) boutons d'attaque
templates/actor/intre.html         (mis à jour) boutons d'attaque dans l'onglet Combat
style/combat.less                  styles du tracker
style/chat/blattes.less            (mis à jour) styles des boutons de choix
insectopia.js                      (mis à jour) enregistre Combat/Combatant/Tracker + hooks + settings
lang/fr-snippet-etape3.json        libellé "Dégâts"
```

## Ce qui a été repris tel quel d'Omega

**L'ordre d'initiative.** Le mécanisme d'Omega (chaque combattant tire un
nombre de jetons égal à son score d'Activité/Initiative, le Deus appelle
les couleurs de la meilleure à la pire, chacun agit une fois par jeton en
« dépensant » sa meilleure couleur restante à chaque tour) correspond
littéralement à la règle d'Insectopia (p.29 : *"Le Deus appelle l'initiative
la plus haute... rouges jouent en premier, puis les vertes, puis les
bleues, les blanches et enfin les noires"*). J'ai donc porté `combat.js` /
`combatant.js` / `combat-tracker.js` en renommant Diode→Blatte et en
supprimant les paliers `rouge+`/`noire-` qui sont une extension propre à
Omega, absente d'Insectopia.

Une règle optionnelle d'Insectopia (*"Le Deus peut choisir d'ignorer le
tirage de Blattes... et faire jouer en premier le personnage à
l'initiative la plus élevée"*) est câblée comme réglage système
(`ignorerTirageInitiative`).

## Ce qui est nouveau : la chaîne Attaque → Dégâts

C'est le morceau qui n'existait pas dans le moteur de résolution
générique de l'étape 1. Le livret distingue deux tests liés (p.29-30) :

1. **Test d'Attaque** : Mêlée/Tir/Prédateur vs Défense adverse → une
   des 5 couleurs sort, avec un sens précis (échec critique / échec /
   réussite / réussite améliorée / réussite critique) qui n'est **pas**
   le même sens que pour un jet générique.
2. **Test de Dégâts** : Chitine (+arme) vs Chitine (+armure) → la couleur
   retenue donne un nombre d'impacts **fixe** (0/1/2/4/4+mutilation),
   indépendant du nombre de blattes tirées.
3. Le résultat du test d'Attaque modifie le test de Dégâts : réussite
   améliorée = +1 blatte tirée aux dégâts ; réussite critique = +1 blatte
   **et** la couleur retenue aux dégâts est améliorée d'un cran.

Comme le moteur de base ne "choisit" jamais lui-même la blatte retenue
(ce choix reste humain, cf. étape 1 — je n'ai pas voulu changer cette
philosophie), j'ai matérialisé ce choix par des **boutons cliquables**
dans le message de chat (`roll-result-choix.html`) : le joueur (ou le
Deus, selon qui a la main sur l'opposition) clique sur la couleur qu'il
retient. Ce clic :
- pour une **Attaque** : affiche le résultat retenu, et si c'est un
  succès, ouvre *automatiquement* le dialogue de Dégâts avec le bon bonus
  de blattes et le flag d'amélioration de couleur déjà positionnés
  (`Blattes.resoudreChoixAttaque`) ;
- pour des **Dégâts** : applique l'amélioration de couleur si besoin,
  affiche le nombre d'impacts, et propose un bouton "Appliquer à la
  cible" qui envoie les impacts (et déclenche la mutilation si
  nécessaire) au token actuellement ciblé sur la scène
  (`Blattes.resoudreChoixDegats` + bouton `.appliquer-degats` dans
  `hooks.js`).

C'est un pattern différent de celui de la repioche (qui, lui, reste
entièrement automatique), mais cohérent avec lui : les deux utilisent des
flags stockés sur le `ChatMessage` et des boutons branchés via le hook
`renderChatMessageHTML`, exactement comme le fait Omega pour son bouton
de repioche.

## Encaissement des dégâts et mutilation

`IntreActor.subirImpacts(nb)` implémente la règle p.30 : les impacts
s'accumulent jusqu'à Résistance (max), le surplus devient des Blessures
internes jusqu'à Métabolisme (max), l'inconscience est signalée par une
notification une fois ce maximum atteint (le décompte des 10 rounds avant
la mort par hémorragie n'est pas automatisé — ça reste au Deus de le
suivre, un compteur de rounds étant hors du périmètre "combat" pur).

`IntreActor.demanderMutilation()` ouvre un petit dialogue pour choisir la
partie du corps sectionnée (tête/abdomen = mort immédiate, appliquée via
le statut "dead" ; thorax = immobilisation, appliquée via un flag
`insectopia.immobilise`).

## Ce qui reste volontairement de côté

- **Les armes ne sont pas encore des Items.** Le modificateur de dégâts
  d'une arme se saisit à la main dans le dialogue de Dégâts ("Chitine de
  l'attaquant, arme comprise"). Une fois les Items posés (étape
  suivante), `attack()` pourra aller chercher automatiquement le bonus de
  l'arme équipée, comme le fait `OmegaBaseActor.shoot()` avec
  `arme.system.effetdiode`.
- **La restriction "une seule action par arme et par phase d'initiative"**
  (p.29) n'est pas encore appliquée : elle nécessite de savoir quelle
  arme a été utilisée à quelle phase, ce qui dépend du modèle d'Item.
- **Le calcul automatique du malus d'encombrement** à partir d'une armure
  portée n'existe pas encore (le champ `system.combat.encombrement` se
  remplit à la main pour l'instant).
- **Le décompte des rounds avant hémorragie** en cas d'inconscience n'est
  pas automatisé.

## Pour tester

Créer un combat Foundry avec deux Actors `intre`, lancer l'initiative
(les Blattes d'initiative doivent s'afficher dans le tracker), puis
depuis la feuille d'un des deux personnages cliquer sur "Attaque Mêlée" :
remplir la Défense adverse, piocher, cliquer sur une couleur de résultat
dans le chat. Si le résultat est un succès, le dialogue de Dégâts doit
s'ouvrir automatiquement ; renseignez les deux Chitine, piochez, cliquez
sur une couleur, puis ciblez un token et cliquez sur "Appliquer à la
cible" pour voir les impacts se répercuter sur la feuille du défenseur.
