/**
 * Récapitulatif des castes et des métiers (livre de base p.204).
 * Bonus de caste = augmentation de caractéristique immédiate au choix.
 * Capacités de caste = choix de capacités selon la caractéristique.
 * Chaque métier ouvre deux compétences de caste de départ.
 */
export const CASTES = {
  combattant: {
    label: "Combattants",
    bonus: "+1 en Mandibule ou +1 en Antenne",
    capacites: "Au choix, 1 capacité en Chitine ou Température, ou 2 capacités en Aile, Antenne ou Mandibule",
    metiers: {
      archer: { label: "Archer", competences: ["Tireur d'élite", "Infiltration"] },
      bretteur: { label: "Bretteur", competences: ["Escrime", "Vivacité"] },
      eclaireur: { label: "Éclaireur", competences: ["Escrime ou Vivacité", "Infiltration"] },
      goliath: { label: "Goliath", competences: ["Fureur", "Blocage"] },
      soldat: { label: "Soldat", competences: ["Art de la guerre", "Blocage ou Escrime"] },
      voltigeur: { label: "Voltigeur", competences: ["Fureur", "Vivacité"] },
    },
  },
  divin: {
    label: "Divins",
    bonus: "+1 en Esprit",
    capacites: "2 capacités en Aile, Antenne ou Esprit",
    metiers: {
      chaman: { label: "Chaman", competences: ["Sphère de magie (Vie)", "Sphère de magie (Bois, Feu ou Ancêtre)"] },
      controleurenergie: { label: "Contrôleur d'énergie", competences: ["Sphère de magie (au choix parmi Eau/Air/Feu/Terre)", "Sphère de magie (au choix parmi Eau/Air/Feu/Terre)"] },
      druide: { label: "Druide", competences: ["Sphère de magie (au choix parmi Sangchauds/Écailles/Plumes/Insectes)", "Sphère de magie (au choix parmi Sangchauds/Écailles/Plumes/Insectes)"] },
      herautsouillure: { label: "Héraut de la souillure", competences: ["Sphère de magie (au choix parmi Alchimie/Folie/Terre/Souillure)", "Sphère de magie (au choix parmi Alchimie/Folie/Terre/Souillure)"] },
      maitressedespouvoirs: { label: "Maîtresse des pouvoirs", competences: ["Sphère de magie (au choix parmi Pensée/Temps/Souillure/Vie)", "Sphère de magie (au choix parmi Pensée/Temps/Souillure/Vie)"] },
      pretreanciensdieux: { label: "Prêtre des Anciens Dieux", competences: ["Sphère de magie (au choix parmi Alchimie/Pensée/Foudre/Souillure)", "Sphère de magie (au choix parmi Alchimie/Pensée/Foudre/Souillure)"] },
      psyche: { label: "Psyché", competences: ["Sphère de magie (au choix parmi Télékinésie/Pensée/Insecte/Souillure)", "Sphère de magie (au choix parmi Télékinésie/Pensée/Insecte/Souillure)"] },
      sylvegarde: { label: "Sylvegarde", competences: ["Sphère de magie (au choix parmi Bois/Eau/Mycélium/Terre)", "Sphère de magie (au choix parmi Bois/Eau/Mycélium/Terre)"] },
    },
  },
  dominant: {
    label: "Dominants",
    bonus: "+1 en Antenne ou +1 en Esprit",
    capacites: "Au choix, 1 capacité en Chitine ou Température, ou 2 capacités en Antenne ou Esprit",
    metiers: {
      couveuse: { label: "Couveuse", competences: ["Éducation", "Sexualité"] },
      diplomate: { label: "Diplomate", competences: ["Courtoisie", "Essaim"] },
      erudit: { label: "Érudit", competences: ["Histoire et religion", "Science et technique"] },
      reproducteur: { label: "Reproducteur", competences: ["Escrime ou Blocage", "Essaim"] },
    },
  },
  horscaste: {
    label: "Hors-caste",
    bonus: "+1 en Aile ou +1 en Antenne",
    capacites: "Au choix, 1 capacité en Température, ou 2 capacités en Antenne, Aile ou Esprit",
    metiers: {
      assassin: { label: "Assassin", competences: ["Coup Vicieux", "Infiltration"] },
      explorateur: { label: "Explorateur", competences: ["Histoire et religion", "Survie"] },
      roublard: { label: "Roublard", competences: ["Art des voleurs", "Infiltration"] },
      troubadour: { label: "Troubadour", competences: ["Arts du spectacle", "Essaim"] },
    },
  },
  producteur: {
    label: "Producteurs",
    bonus: "+1 en Caste",
    capacites: "Au choix, 1 capacité en Chitine ou Température, ou 2 capacités en Antenne ou Aile",
    metiers: {
      artisanmarchand: { label: "Artisan / Marchand", competences: ["Artisanat et commerce ou Commerce et courtoisie"] },
      chasseur: { label: "Chasseur", competences: ["Arts de la forêt", "Belluaire"] },
      dresseur: { label: "Dresseur", competences: ["Belluaire", "Dressage"] },
      transporteur: { label: "Transporteur", competences: ["Nefs aériennes", "Navigation"] },
    },
  },
};
