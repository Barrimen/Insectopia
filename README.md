# Insectopia — Système Foundry VTT

Système de jeu pour Foundry VTT (v14) adaptant *Insectopia* (Odonata éditions), converti à partir du système open-source **Omega** (Khaali-dev, GPL-3.0), avec l'accord de l'éditeur.

## Installation

1. Cloner ce dépôt dans le dossier `Data/systems/insectopia/` de votre installation Foundry (ou l'ajouter comme système via son manifest `system.json`).
2. Lancer Foundry, créer un monde utilisant le système "Insectopia".

## Contenu du dépôt

| Dossier / fichier | Contenu |
|---|---|
| `module/` | Logique du système (Actor, Item, combat, magie, résolution de Blattes) |
| `templates/` | Templates Handlebars des feuilles et dialogues |
| `packs-src/` / `packs/` | Compendiums (sources JSON éditables / compilés LevelDB) |
| `style/` | Feuilles de style (`.less`) |
| `lang/` | Traductions FR |
| `tools/` | Scripts de génération des compendiums |

## Documentation

- **[STATUS.md](STATUS.md)** — état d'avancement actuel du projet, ce qui reste à faire, dette technique. À lire en premier pour savoir où on en est.
- **[docs/JOURNAL-CONCEPTION.md](docs/JOURNAL-CONCEPTION.md)** — pourquoi le système est construit ainsi : choix de modélisation, écarts avec Omega, limites assumées, organisé par thème.

## Source de règles

L'unique source faisant autorité pour toute question de règle est le livre de base *Insectopia* (et le livret "Création de personnages"). En cas d'ambiguïté (ex : scan PDF peu clair), c'est signalé explicitement dans le code (`// À VÉRIFIER`) plutôt que deviné.
