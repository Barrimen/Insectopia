# Étape 2 — Feuille de personnage

Fichiers fournis (en plus de ceux de l'étape 1) :

```
template.json                       modèle de données Actor "intre" +
                                     stub Item "objet" (provisoire)
module/actor/base-actor.js          classe IntreActor : calculs dérivés,
                                     check()/attack()/chanceRoll()/
                                     rollInitiative()
module/actor/sheet/intre-sheet.js   classe de la feuille (ActorSheet)
templates/actor/intre.html          template Handlebars de la feuille
module/common/helpers.js            helpers Handlebars (ife/ifne)
style/actor.less                    styles de base de la feuille
lang/fr-snippet-etape2.json         libellés des caractéristiques/compétences
insectopia.js                       point d'entrée minimal pour tester
                                     (enregistre l'actor + la feuille)
```

## Choix de modélisation

**Un seul type d'Actor : `intre`.** Contrairement à Omega qui distingue
Advanced Synth / Synthétique / Organique / Vaisseau (des architectures de
personnage très différentes mécaniquement), Insectopia n'a qu'une seule
structure de personnage — race, caste, métier. J'ai donc gardé un type
unique, utilisable aussi bien pour les PJ que pour les PNJ (un PNJ peut
laisser des champs à 0 ou ne pas remplir les capacités).

**Les 6 caractéristiques "fixes"** (Aile, Antenne, Mandibule, Esprit,
Chitine, Température) ont chacune deux compétences liées, codées en dur
dans `template.json` puisqu'elles sont identiques pour tout le monde
(livret p.26-28).

**La Caste est traitée à part.** Ses deux compétences varient selon le
métier du personnage (un Contrôleur d'énergies a Air/Terre, un Soldat a
Blocage/Fureur, une Diplomate a Courtoisie/Histoire et religion...). Plutôt
que de coder en dur toutes les combinaisons possibles, j'ai modélisé
`system.caracteristiques.caste.competences` comme un **tableau libre** que
le joueur remplit lui-même (boutons + / 🗑 sur la feuille). Ça colle à
l'esprit "système ouvert" du livret, mais si tu préfères une liste fermée
de compétences de caste prédéfinies (comme pour les autres caractéristiques),
c'est un changement simple à faire une fois qu'on aura la liste complète
des castes du livre de base.

**Capacités spéciales** (raciales et de caste — Pince, Vitesse
surnaturelle, Pestilence, Antennes ramifiées, Mimétisme, Vision infra-rouge,
etc.) : même logique, tableau libre de {nom, description}. Elles seront
génériques tant qu'on n'a pas encore construit de compendium de races avec
des effets mécaniques automatisés (ex : Pestilence qui fait perdre une
action à l'adversaire) — pour l'instant c'est descriptif, l'automatisation
viendra avec l'étape "Items/Compendiums".

**Attributs dérivés implémentés** (`prepareDerivedData`) :
- Impact max = Résistance ; Blessure interne max = Métabolisme
- Initiative = Activité − Encombrement
- Vitesse sol = Aile ; vitesse en vol = Aile × 2
- Malus courant lié aux blessures internes, injecté automatiquement comme
  modificateur par défaut dans le dialogue de tirage (comme le
  `malusDegatsSubis` d'Omega)

**Item "objet"** : stub minimal, juste pour que le système ne plante pas
si quelqu'un crée un item. La vraie modélisation (armes avec Mêlée/Tir/
Prédateur et facteur de dégâts, armures, capacités raciales avec effets
automatisés) est pour l'étape Items/Combat.

## Ce qui n'est pas encore fait

- Pas de gestion des armes/dégâts sur la feuille (onglet Combat a une note
  explicite à ce sujet).
- Pas de compendium de races/castes pré-remplies : chaque fiche part
  vierge, à remplir à la main pour l'instant.
- Le tour de combat (qui agit quand, selon la couleur d'initiative) n'est
  pas orchestré — seul le tirage d'initiative individuel fonctionne.

## Pour tester

Même remarque qu'à l'étape 1 : copier ces fichiers dans un système
Foundry `insectopia` (avec un `system.json` minimal pointant vers
`insectopia.js`, `style/actor.less` compilé, etc.), créer un Actor de type
`intre`, et la feuille devrait s'afficher avec les caractéristiques
cliquables pour lancer un tirage de Blattes.
