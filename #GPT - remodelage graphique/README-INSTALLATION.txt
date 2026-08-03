INSECTOPIA — LOT COMPLET DE REFONTE UI
==========================================

PRINCIPE
--------
Tous les fichiers de cette archive sont volontairement fournis avec une
extension finale .txt.

Pour les installer :
1. Retirer uniquement le dernier suffixe ".txt".
2. Conserver exactement le reste du nom.
3. Copier le fichier dans le chemin reproduit par l'arborescence du ZIP.
4. Sauvegarder le dépôt avant remplacement.
5. Tester dans une copie du monde Foundry avant usage en campagne.

EXEMPLE
-------
templates/item/capacite.html.txt
devient :
templates/item/capacite.html

FICHIERS DU LOT
---------------
1. css/insectopia.css
   Feuille de style consolidée. Cette version remplace la première version
   transmise et inclut les styles des fiches d'objets, dialogues, cartes de
   chat et tracker de combat.

2. templates/actor/intre.html
   Structure principale de la feuille d'Intre.

3. module/actor/sheet/intre-sheet.js
   Contrôleur de la feuille d'Intre.

4. templates/item/arme.html
   Fiche d'arme.

5. templates/item/armure.html
   Fiche d'armure.

6. templates/item/capacite.html
   Fiche de capacité, y compris les coûts Souillure et Fluide déjà présents
   dans template.json.

7. templates/chat/roll-dialog.html
   Dialogue de préparation des tirages.

8. templates/chat/roll-result.html
   Carte de résultat des tirages.

9. templates/chat/roll-result-choix.html
   Carte de choix de couleur pour attaque ou dégâts.

10. templates/combat/tracker.hbs
    Tracker de combat. Les data-action existants sont conservés.

LIMITES VOLONTAIRES
-------------------
- Aucun champ absent de template.json n'a été ajouté.
- Aucun calcul de règle n'a été inventé.
- Aucun changement n'est apporté à template.json ou system.json.
- Les éléments Magie, Contacts, Quartz d'Actor et localisation corporelle
  restent hors périmètre, car ils ne sont pas modélisés actuellement.
- Les templates de chat conservent les variables, classes d'action et
  attributs data-* utilisés par le système actuel.

ORDRE DE TEST CONSEILLÉ
-----------------------
1. css/insectopia.css
2. templates/item/*.html
3. templates/chat/*.html
4. templates/combat/tracker.hbs
5. templates/actor/intre.html
6. module/actor/sheet/intre-sheet.js

TESTS MANUELS À EFFECTUER
-------------------------
- Ouverture d'un Actor Intre.
- Modification et sauvegarde des champs d'identité.
- Tir de caractéristique et de compétence.
- Tir de Chance.
- Initiative.
- Attaques Mêlée, Tir et Prédateur.
- Création, édition, équipement et suppression d'une arme.
- Création, édition, équipement et suppression d'une armure.
- Création et édition d'une capacité.
- Affichage des résultats de tirage dans le chat.
- Choix d'une couleur de résultat.
- Affichage et actions du tracker de combat.
- Redimensionnement de la feuille.

IMPORTANT
---------
Le lot a été conçu à partir du dépôt public Barrimen/Insectopia consulté le
31 juillet 2026 et des fichiers produits dans cette conversation. Une
validation dans Foundry reste obligatoire avant fusion dans la branche
principale.
