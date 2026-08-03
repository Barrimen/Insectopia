/**
 * Système de magie (livre de base p.262-276).
 * ---------------------------------------------------------------------
 * Un jeteur de sorts choisit une Sphère qu'il maîtrise, un Mot de pouvoir
 * autorisé pour cette Sphère par son métier (Chaman, Druide, etc.), puis
 * détermine l'Influence de son sort (Puissance/Portée/Cibles/Zone d'effet/
 * Durée) via la Table des Influences (p.269). Chaque niveau choisi sur
 * chaque axe (0 à 7) s'ajoute aux autres pour former la Difficulté totale
 * qui s'oppose au score de Sphère lors du test de réussite.
 */

export const MOTS_POUVOIR = {
  alteration: "Altération",
  controle: "Contrôle",
  connaissance: "Connaissance",
  evocation: "Évocation",
  negation: "Négation",
};

/**
 * Les 19 Sphères magiques et l'ensemble (théorique, tous jeteurs de sorts
 * confondus) des Mots de pouvoir qu'elles admettent, d'après les
 * descriptions génériques par sphère (p.271-276). La restriction réelle
 * par métier se trouve dans MOTS_POUVOIR_PAR_METIER ci-dessous.
 */
export const SPHERES = {
  ancetre: { label: "Ancêtre", mots: ["connaissance", "negation"] },
  bois: { label: "Bois", mots: ["alteration", "connaissance", "evocation", "negation"] },
  feu: { label: "Feu", mots: ["alteration", "connaissance", "evocation", "negation"] },
  vie: { label: "Vie", mots: ["alteration", "connaissance", "evocation", "negation"] },
  air: { label: "Air", mots: ["alteration", "connaissance", "evocation", "negation"] },
  eau: { label: "Eau", mots: ["alteration", "connaissance", "evocation", "negation"] },
  terre: { label: "Terre", mots: ["alteration", "connaissance", "evocation", "negation"] },
  ecaille: { label: "Écaille", mots: ["alteration", "controle", "connaissance"] },
  insecte: { label: "Insecte", mots: ["alteration", "controle", "connaissance"] },
  plume: { label: "Plume", mots: ["alteration", "controle", "connaissance"] },
  sangchaud: { label: "Sang-chaud", mots: ["alteration", "controle", "connaissance"] },
  pensee: { label: "Pensée", mots: ["alteration", "controle", "connaissance", "evocation", "negation"] },
  temps: { label: "Temps", mots: ["alteration", "connaissance"] },
  souillure: { label: "Souillure", mots: ["alteration", "connaissance", "evocation", "negation"] },
  alchimie: { label: "Alchimie", mots: ["alteration", "connaissance"] },
  foudre: { label: "Foudre", mots: ["alteration", "connaissance", "evocation", "negation"] },
  folie: { label: "Folie", mots: ["evocation", "negation"] },
  telekinesie: { label: "Télékinésie", mots: ["evocation"] },
  mycelium: { label: "Mycélium", mots: ["alteration", "connaissance"] },
};

/**
 * Restriction réelle des Mots de pouvoir par métier x Sphère (tableau
 * p.267). Les clés de premier niveau correspondent exactement aux clés de
 * métier de CASTES.divin.metiers (data-castes.js).
 *
 * FIABILITÉ : la plupart des lignes ont été validées sans ambiguïté (le
 * nombre de puces du tableau correspond exactement à la totalité des Mots
 * possibles pour la Sphère.
 */
export const MOTS_POUVOIR_PAR_METIER = {
  chaman: {
    ancetre: ["connaissance", "negation"],
    bois: ["alteration", "connaissance"],
    feu: ["alteration", "connaissance", "evocation", "negation"],
    vie: ["alteration", "connaissance", "evocation"],
  },
  controleurenergie: {
    air: ["alteration", "connaissance", "evocation", "negation"],
    eau: ["alteration", "connaissance", "evocation", "negation"],
    feu: ["alteration", "connaissance", "evocation", "negation"],
    terre: ["alteration", "connaissance", "evocation", "negation"],
  },
  druide: {
    ecaille: ["alteration", "controle", "connaissance"],
    insecte: ["alteration", "controle", "connaissance"],
    plume: ["alteration", "controle", "connaissance"],
    sangchaud: ["alteration", "controle", "connaissance"],
  },
  maitressedespouvoirs: {
    pensee: ["alteration"], 
    temps: ["alteration", "connaissance"],
    vie: ["alteration", "connaissance", "evocation", "negation"],
    souillure: ["connaissance", "negation"], 
  },
  pretreanciensdieux: {
    alchimie: ["alteration", "connaissance"],
    pensee: ["controle", "negation"], 
    foudre: ["alteration", "connaissance", "evocation", "negation"],
    souillure: ["altéraion","connaissance"],
  },
  psyche: {
    pensee: ["alteration", "controle", "connaissance", "evocation", "negation"],
    insecte: ["alteration", "controle", "connaissance"],
    souillure: ["connaissance", "negation"],
    telekinesie: ["evocation"],
  },
  herautsouillure: {
    alchimie: ["alteration", "connaissance"],
    folie: ["evocation", "negation"],
    terre: ["alteration", "connaissance", "evocation", "negation"],
    souillure: ["alteration", "connaissance", "evocation", "negation"],
  },
  sylvegarde: {
    bois: ["alteration", "connaissance", "evocation", "negation"],
    eau: ["alteration", "connaissance", "evocation", "negation"],
    mycelium: ["alteration", "connaissance"],
    terre: ["alteration", "connaissance", "evocation", "negation"],
  },
};

/**
 * Table des Influences (p.269). Le niveau choisi sur chaque axe (0 à 7)
 * s'ajoute aux autres pour former la Difficulté totale du sort. Le niveau
 * choisi sur l'axe Puissance sert aussi, séparément, de score de Puissance
 * pour la résolution de l'effet du sort une fois le test de Sphère réussi.
 * Base gratuite (Difficulté 0) : Puissance 0, Portée niveau 0, 1 cible,
 * Zone d'effet niveau 0, Durée niveau 0.
 */
export const TABLE_INFLUENCE = [
  { niveau: 0, portee: "0-50 insètres", cibles: "Une (soi ou autrui)", zone: "Une fiole", duree: "Instantané" },
  { niveau: 1, portee: "50-200 insètres", cibles: "2 intres ou 1 créature", zone: "Une table", duree: "Tours" },
  { niveau: 2, portee: "À portée sensorielle", cibles: "5 intres ou 1 colosse", zone: "Une pièce", duree: "Minutes" },
  { niveau: 3, portee: "1000-5000 insètres", cibles: "10 intres ou 1 mastodonte", zone: "Une habitation", duree: "Heures" },
  { niveau: 4, portee: "Un lieu, un être connu", cibles: "100 intres", zone: "Une place", duree: "Jours" },
  { niveau: 5, portee: "Un lieu, un être dont on a le nom", cibles: "Une armée", zone: "Une cité", duree: "Kumis" },
  { niveau: 6, portee: "Passé", cibles: "La population d'une cité", zone: "Une vallée", duree: "Cycles" },
  { niveau: 7, portee: "Futur", cibles: "Une espèce dans son ensemble", zone: "Un royaume", duree: "Permanent" },
];

/**
 * Table inverse label français -> clé de sphère, utilisée pour déduire
 * automatiquement le champ "sphere" d'une compétence de caste à partir de
 * son libellé (ex: "Sphère de magie (Vie)" -> "vie"), quand le libellé
 * désigne une sphère unique et non ambiguë.
 */
const LABEL_TO_KEY = Object.fromEntries(
  Object.entries(SPHERES).map(([key, sphere]) => [sphere.label.toLowerCase(), key])
);

/**
 * Tente de déduire la clé de sphère à partir du libellé d'une compétence
 * de caste telle que générée par applyCaste() (data-castes.js), par ex.
 * "Sphère de magie (Vie)" -> "vie". Renvoie null si le libellé décrit un
 * choix parmi plusieurs sphères ("Sphère de magie (au choix parmi
 * Eau/Air/Feu/Terre)", "Sphère de magie (Bois, Feu ou Ancêtre)") : dans ce
 * cas, le joueur doit taguer manuellement la sphère choisie sur la fiche.
 */
export function extraireSphereDepuisLabel(label) {
  if (!label) return null;
  const match = label.match(/Sphère de magie\s*\(([^)]+)\)/i);
  if (!match) return null;
  const contenu = match[1].trim();
  if (/choix|\/|,| ou /i.test(contenu)) return null; // choix multiple -> à taguer à la main
  return LABEL_TO_KEY[contenu.toLowerCase()] ?? null;
}
