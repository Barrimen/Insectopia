# Étape 1 — Moteur de résolution (sac de Blattes)

Fichiers fournis, à intégrer dans un système Foundry `insectopia/` (même
arborescence que le dépôt Omega) :

```
module/common/config.js       constantes : ROLL_TYPE, échelle de difficulté,
                               composition du sac de blattes (42 : 3 noire,
                               18 blanche, 12 bleue, 6 verte, 3 rouge)
module/common/roll.js         classe Blattes : pioche, couleur, résolution
                               (opposition, difficulté, repioche +1/-1,
                               choix multiple >1/<-1), affichage du résultat
templates/chat/roll-dialog.html   dialogue de tirage (opposition / difficulté
                                   / modificateur libre, ou tirage simple)
templates/chat/roll-result.html   affichage du résultat dans le chat
style/chat/blattes.less           couleurs des blattes en CSS pur (pas
                                   d'assets graphiques à ce stade)
lang/fr-snippet.json              clés de traduction à fusionner dans le
                                   lang/fr.json définitif du système
```

## Ce qui a été repris tel quel d'Omega

Le mécanisme de fond est identique dans les deux jeux : un sac reconstruit
et mélangé (Fisher-Yates) à chaque tirage, une pioche sans remise au sein
d'un même test. La logique de résolution +1/-1/>1/<-1 d'Omega correspond
mot pour mot aux règles d'Insectopia (p.24-25 du livret) — je n'ai donc
pas eu à réinventer cette partie, seulement à la ré-exprimer avec le
vocabulaire et les nombres d'Insectopia.

## Ce qui a changé

- **Taille et répartition du sac** : 42 blattes (3/18/12/6/3) au lieu de
  30 diodes (3/12/6/6/3). La proportion de réussite simple est plus élevée
  dans Insectopia.
- **Terminologie** : Diode → Blatte, Matrice → Deus, "programme" (Omega)
  → "compétence/caractéristique" (Insectopia), etc.
- **Échelle de difficulté** : 0-6 avec libellés (Facile → Impossible) au
  lieu de 0-7 sans libellés côté Omega.
- **Suppression du superflu propre à Omega** : precision d'arme,
  équipage/vaisseau, types de programme — tout ce qui dépendait du modèle
  de données Omega (systèmes auxiliaires, synthétiques). Ces éléments
  seront remplacés par leurs équivalents Insectopia (armes/mêlée/tir/
  prédateur, Sombre/Chrysalide, capacités raciales) aux étapes suivantes,
  une fois le template.json défini.
- **Couleurs en CSS** plutôt qu'en images `.webp` : je n'ai pas d'assets
  graphiques Insectopia sous la main. À remplacer facilement par des
  icônes dès qu'on en aura (ou qu'on demandera à l'illustrateur).

## Ce qui reste volontairement en suspens (étapes suivantes)

- Le tirage `ATTACK` référence encore un `itemId` d'arme de façon
  générique : la structure réelle des armes (mêlée/tir/prédateur,
  facteur de dégâts = Chitine ± modificateur) sera posée à l'étape
  "Feuille de personnage" / "Combat".
- L'utilisation d'une Blatte de chance (`utiliserBlatteDeChance`) est
  esquissée mais son interface (bouton sur la feuille, défausse visible)
  sera branchée avec la feuille de personnage.
- Le calcul du nombre d'actions par tour (Activité/Initiative, ordre
  rouge→noire) est géré par ce moteur pour le tirage, mais la mise en
  musique du tour de combat (qui agit quand) est pour l'étape "Combat".

## Comment tester dès maintenant

Le plus simple : copier ces fichiers dans une copie locale du dépôt
Omega renommée en système `insectopia` (id dans `system.json`), et
remplacer les imports `Diodes`/`diode.js` par `Blattes`/`roll.js` dans les
points d'appel (feuilles, combat). Ça donnera un premier jet jouable du
moteur de résolution pur, avant qu'on reconstruise les feuilles autour.
