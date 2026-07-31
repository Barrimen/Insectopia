# Étape 5 — Compendiums

Fichiers fournis (en plus des étapes 1-4) :

```
tools/build-compendium-source.mjs   génère packs-src/ (armes, armures, capacités, personnages)
tools/build-races-journal.mjs       génère packs-src/races/ (journal des 4 races)
packs-src/                          sources JSON lisibles/modifiables (une par document)
packs/personnages/                  compendium Actor compilé (LevelDB)
packs/armes-armures/                compendium Item compilé
packs/capacites/                    compendium Item compilé
packs/races/                        compendium JournalEntry compilé
system.json                         (mis à jour) déclare les 4 packs
```

## Contenu, fidèle au kit de démarrage

Plutôt que d'inventer du contenu placeholder, j'ai repris **tel quel**
tout ce que le kit de démarrage "Insectopia — L'invasion" fournit
déjà de statué :

- **6 personnages pré-tirés**, stats complètes (Combeis Marginatus,
  Pénore de Néopté, Mosha le gris, Terna Mé, Apenlys, Norim), avec leurs
  armes/armures/capacités déjà équipées en Items embarqués — ils
  s'ouvrent prêts à jouer.
- **7 armes** (Platère, Arcin, Griffes, Griffes acérées, Mandibules
  hypertrophiées, Pinces) et **1 armure** (Cuir de Sangchauds), avec les
  valeurs exactes du livret p.28-29.
- **9 capacités spéciales** de race et de caste (Pince, Fouisseur,
  Vitesse surnaturelle, Pestilence, Perception chimique hors du commun,
  Ailé, Antennes ramifiées, Mimétisme, Vision infra rouge), texte du
  livret p.27-28.
- **1 journal** présentant les 4 races détaillées dans le kit (Cerk,
  Lulle, Putère, Termide) : lore, société, préjugés, renvoi vers leurs
  capacités raciales.

Ça ne couvre que 4 des 20 races du jeu complet — logique, le kit de
démarrage ne détaille que celles-là. Le reste viendra avec le livre de
base complet, once qu'on l'aura dépouillé.

## Une limite assumée sur les bonus automatisés

En construisant "Antennes ramifiées" et "Mimétisme", j'ai buté sur une
limite du système de bonus posé à l'étape 4 : ces deux capacités
n'améliorent l'Antenne **que pour le repérage/camouflage** (un jet où la
caractéristique Antenne est utilisée seule, sans compétence), pas pour
Phéromones ni Tir. Or `getCapaciteBonus()` ne sait pas distinguer "cette
caractéristique utilisée seule" de "cette caractéristique utilisée via
n'importe laquelle de ses compétences" — les deux se traduisent
actuellement par `compKey: ""`.

Plutôt que de livrer un bonus automatique subtilement faux, j'ai laissé
ces deux capacités en **actif: false** (texte descriptif seul, à
appliquer manuellement). Seule "Perception chimique hors du commun" est
automatisée, car son bonus vise une compétence précise et sans ambiguïté
(Phéromones). Une vraie correction demanderait d'ajouter un mode
("s'applique à la caractéristique seule" vs "à toute compétence de cette
caractéristique") au modèle `capacite` — une piste pour une prochaine
itération si tu veux pousser l'automatisation plus loin.

## Comment regénérer / modifier le contenu

Le contenu compilé (`packs/`) n'est pas fait pour être édité à la main.
Pour changer quoi que ce soit :
1. Édite `tools/build-compendium-source.mjs` (ou `build-races-journal.mjs`)
2. Relance-le : `node tools/build-compendium-source.mjs` (régénère
   `packs-src/`)
3. Recompile avec le CLI officiel Foundry :
   ```
   npx fvtt package pack -n personnages -t Actor --in packs-src/personnages --out packs
   npx fvtt package pack -n armes-armures -t Item --in packs-src/armes-armures --out packs
   npx fvtt package pack -n capacites -t Item --in packs-src/capacites --out packs
   npx fvtt package pack -n races -t JournalEntry --in packs-src/races --out packs
   ```
   (nécessite `npm install @foundryvtt/foundryvtt-cli` en local une fois)

C'est le même outil que celui qu'utilise le pipeline de build d'Omega
(package.json y référence `@foundryvtt/foundryvtt-cli`), donc rien
d'exotique — juste invoqué directement en ligne de commande plutôt que
via un script gulp dédié.

## Piège rencontré (pour info, déjà résolu)

Le format source attendu par `fvtt package pack` n'est pas du JSON Foundry
"brut" : chaque document a besoin d'un champ interne `_key` (ex :
`!actors!<id>`, `!items!<id>`, ou `!actors.items!<idParent>.<idEnfant>`
pour un Item embarqué). Sans ce champ, l'outil **ignore silencieusement**
le fichier — pas d'erreur, juste un pack vide. Le script générateur pose
maintenant ce champ automatiquement ; si tu écris un jour un document à la
main, pense à l'ajouter.

## Pour tester

Dans Foundry, onglet Compendiums (livre) : tu devrais voir "Insectopia —
Personnages pré-tirés", "Armes et armures", "Capacités spéciales" et
"Races (kit de démarrage)". Glisse Norim ou Terna Mé sur la scène/dans
les Actors du monde : la fiche doit s'ouvrir avec ses armes déjà équipées
et ses stats correctes.
