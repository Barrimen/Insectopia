/**
 * Effets/tags d'armes et d'armures (livre de base p.238). Ce sont des
 * mots-clés apposés à certaines armes/armures/boucliers en plus de
 * leur bonus chiffré de base. Purement descriptif pour l'instant :
 * aucun de ces effets n'est automatisé dans le moteur de résolution
 * (module/common/roll.js) — à faire quand le modèle d'Item "arme"/
 * "armure" sera étendu avec un tableau `effets: []` référençant ces
 * clés.
 */
export const EFFETS_ARMES = {
  positifs: [
    { nom: "Allonge", description: "Avantage en initiative, mais seulement pour la première attaque du tour de combat." },
    { nom: "Assommant", description: "Si le coup inflige une blessure interne, l'assaillant peut choisir d'assommer sa cible (durée = nombre de blessures internes infligées) au lieu de les lui infliger." },
    { nom: "Anti-magie", description: "Augmente d'un point la résistance magique du porteur." },
    { nom: "Contondant", description: "Inflige une blessure supplémentaire en cas de blessure." },
    { nom: "Couvert", description: "Défense supplémentaire ajoutée à l'Agilité, contre les attaques à distance uniquement." },
    { nom: "Créature", description: "Inflige des dégâts non modifiés aux créatures (table des échelles de créature, livre de base p.287)." },
    { nom: "Immobilise", description: "La cible immobilisée subit un malus de deux Blattes pour attaquer et se défendre." },
    { nom: "Parade", description: "Défense supplémentaire ajoutée à la Défense, contre les attaques de mêlée uniquement." },
    { nom: "Perforant", description: "Passe l'armure (pas la Chitine) : réduit la valeur d'armure du défenseur." },
  ],
  negatifs: [
    { nom: "Incommode", description: "Objet non conçu pour le combat : malus à la compétence Mêlée en cas d'utilisation." },
    { nom: "Fragile", description: "Casse sur un tirage noir en attaque ou en dégâts." },
  ],
};
