# Addendum — Compétences de caste (point ouvert résolu)

À la fin de l'étape 6, une question restait ouverte : la liste complète
des **compétences de caste** (référencée p.229, étape 4 de la création
de personnage) n'existait nulle part dans le projet — seuls les noms des
2 compétences de départ par métier étaient connus (`data-castes.js`).

Le nouveau PDF fourni ("Insectopia — Création de personnages", pages
196-245) couvrait justement cette section. Voici ce qui a été ajouté :

```
module/common/data-competences-caste.js   les 26 compétences de caste,
                                            avec description paraphrasée
                                            de leur effet de jeu
tools/build-castes-journal.mjs             (mis à jour) ajoute une page
                                            récapitulative des 26
                                            compétences au journal
                                            "Castes et métiers"
packs/castes, packs-src/castes             régénérés (7 entrées : 5
                                            castes + 1 page compétences)
system.json                                version 0.4.1
```

## Ce que dit le livre (p.205, p.229)

Le personnage possède autant de compétences de caste que sa valeur en
Caste. Elles s'ajoutent aux deux compétences de départ de son métier.
Certaines sont des compétences spéciales de combat (Blocage, Escrime,
Fureur, Coup Vicieux, Tireur d'élite, Vivacité) dont le détail mécanique
complet est dans un chapitre "Règles de combat" que je n'ai pas encore lu
— les descriptions actuelles renvoient à ce chapitre sans le détailler.

Certaines compétences (Artisanat, Art des voleurs, Commerce, Éducation,
Dressage, Essaim, Art du spectacle) ont des sous-systèmes assez riches
(pools de points de Ressource/Marché noir, paliers de dressage, tables
de résultat par couleur de Blatte) que j'ai résumés fidèlement mais de
façon condensée — le détail fin (tableaux d'exemples de prix, paliers
complets) reste dans le livre.

## Toujours pas fait

Ces 26 compétences ne sont **pas encore intégrées** au modèle de données
de l'Actor (`system.caracteristiques.caste.competences` reste un tableau
libre où on tape le nom à la main, cf. étape 2). Les brancher proprement
(ex : un sélecteur qui pré-remplit le nom + ouvre une fenêtre d'aide avec
la description) est un candidat naturel pour le futur assistant de
création de personnage, puisque c'est exactement à l'étape 4 de la
création qu'on les choisit.
