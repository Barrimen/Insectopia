import { SAC_BLATTES } from "./config.js";

/**
 * Ordre de tirage des Blattes d'évolution (livre de base p.202-203).
 * 7 caractéristiques : les 6 premières sont appliquées immédiatement
 * (étape 2 du wizard), la 7e (Caste) est tirée ici mais son effet n'est
 * appliqué qu'à l'étape 4, une fois le métier connu (les compétences de
 * Caste dépendent du métier choisi).
 */
export const ORDRE_CARACS_EVOLUTION = ["aile", "antenne", "esprit", "mandibule", "chitine", "temperature", "caste"];

/**
 * Description des effets par couleur (livre de base p.202-203).
 */
export const EFFETS_BLATTES_EVOLUTION = {
  rouge: {
    label: "Rouge : augmentation de caractéristique",
    description: "La caractéristique augmente de +1 point, de façon permanente.",
  },
  verte: {
    label: "Verte : +1 point de compétence liée, +1 point libre",
    description:
      "+1 point dans une compétence liée à la caractéristique, et +1 point supplémentaire à répartir librement dans n'importe quelle compétence.",
  },
  bleue: {
    label: "Bleue : +2 points de compétence",
    description: "+2 points à répartir librement entre les compétences liées à la caractéristique.",
  },
  blanche: {
    label: "Blanche : +1 point de compétence",
    description: "+1 point à répartir dans une compétence liée à la caractéristique.",
  },
  noire: {
    label: "Noire : capacité",
    description:
      "Choisissez une capacité de race liée à cette caractéristique (gain de Souillure, sauf si cette capacité est considérée comme une évolution pour la race — livre de base p.202).",
  },
};

/**
 * Tire 7 Blattes sans remise dans un sac reconstitué à sa composition
 * complète (3 noires, 18 blanches, 12 bleues, 6 vertes, 3 rouges = 42).
 * Contrairement aux tirages de résolution d'action, ce tirage précis ne
 * remet pas les Blattes tirées dans le sac (livre de base p.202 : "on ne
 * remet pas les Blattes piochées dans le sachet").
 *
 * @returns {string[]} 7 couleurs, dans l'ordre correspondant à
 *   ORDRE_CARACS_EVOLUTION.
 */
export function tirerBlattesEvolution() {
  const sac = [];
  for (const [couleur, nombre] of Object.entries(SAC_BLATTES.REPARTITION)) {
    for (let i = 0; i < nombre; i++) sac.push(couleur);
  }
  // Mélange (Fisher-Yates), puis on prend les 7 premières = tirage sans remise.
  for (let i = sac.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sac[i], sac[j]] = [sac[j], sac[i]];
  }
  return sac.slice(0, 7);
}
