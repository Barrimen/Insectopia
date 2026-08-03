// ============================================================================
// INSECTOPIA - Configuration du système
// Adapté depuis le système Omega (Khaali-dev/omega, GPL-3.0), avec l'accord
// d'Odonata éditions pour l'usage du contenu Insectopia.
// ============================================================================

export const SYSTEM_NAME = "insectopia";
export const SYSTEM_DESCRIPTION = "Insectopia";
export const LOG_HEAD = "Insectopia | ";

/**
 * Types de jets gérés par le moteur de résolution.
 * - ATTACK      : compétence de combat (Mêlée / Tir / Prédateur) opposée à la Défense de la cible
 * - OPPOSITION  : compétence ou caractéristique opposée à celle d'un autre personnage
 * - DIFFICULTE  : compétence ou caractéristique opposée à un niveau de difficulté fixé par le Deus
 * - CHANCE      : tirage des Blattes de chance en début de scénario (= score d'Instinct)
 * - INITIATIVE  : tirage d'Activité (modifiée par l'encombrement) déterminant l'ordre et le nombre d'actions
 * - SIMPLE      : tirage libre, à la discrétion du Deus (nombre de blattes choisi manuellement)
 * - SORT        : test de Sphère de magie vs Difficulté de l'Influence du sort (livre de base p.262-276).
 *                 La résolution de l'effet (Puissance vs compétence d'opposition, livre p.270) et le
 *                 test de Maladresse (Difficulté du sort vs Résistance, livre p.270) réutilisent tous
 *                 les deux le ROLL_TYPE.OPPOSITION générique existant, avec un texte d'intro dédié.
 */
export const ROLL_TYPE = {
  ATTACK: "attack",
  DEGATS: "degats",
  OPPOSITION: "opposition",
  DIFFICULTE: "difficulte",
  CHANCE: "chance",
  INITIATIVE: "initiative",
  SIMPLE: "simple",
  SORT: "sort",
};

/**
 * Échelle de difficulté (livret de règles, p.25).
 * Le niveau de difficulté est soustrait à la compétence/caractéristique du
 * personnage pour obtenir le nombre de blattes à tirer.
 */
export const DIFFICULTE = {
  0: "Facile",
  1: "Moyen",
  2: "Complexe",
  3: "Ardu",
  4: "Très difficile",
  5: "Irréalisable",
  6: "Impossible",
};

/**
 * Composition du sac de Blattes (livret de règles, p.24) :
 * 3 noires, 18 blanches, 12 bleues, 6 vertes, 3 rouges = 42 blattes.
 *
 * NB : à titre de comparaison, le sac de Diodes d'Omega compte 30 jetons
 * répartis 3/12/6/6/3 (noire/blanche/bleue/verte/rouge), soit une
 * proportion de réussite simple ("bleue") nettement plus faible que dans
 * Insectopia. Les deux systèmes utilisent en revanche exactement le même
 * mécanisme : un sac reconstruit et mélangé à chaque tirage, une pioche
 * sans remise au sein d'un même tirage.
 */
export const SAC_BLATTES = {
  TAILLE: 42,
  REPARTITION: {
    noire: 3,
    blanche: 18,
    bleue: 12,
    verte: 6,
    rouge: 3,
  },
};

/**
 * Ordre de résolution des couleurs, du pire au meilleur résultat.
 * Sert notamment à l'ordre d'affichage et à la logique d'initiative
 * (les blattes rouges agissent en premier, puis vertes, bleues,
 * blanches, et enfin noires).
 */
export const ORDRE_COULEURS = ["rouge", "verte", "bleue", "blanche", "noire"];

/**
 * Ordre du pire au meilleur (utile pour "améliorer" une couleur d'un cran,
 * règle de la réussite critique sur une attaque, livret p.29).
 */
export const ORDRE_COULEURS_CROISSANT = ["noire", "blanche", "bleue", "verte", "rouge"];

/**
 * Résultats d'une attaque (compétence de combat vs Défense), livret p.29.
 */
export const RESULTAT_ATTAQUE = {
  noire: { label: "Échec critique", description: "L'attaque est complètement ratée, c'est une maladresse." },
  blanche: { label: "Échec", description: "L'attaque ne porte pas, ou ne fait pas de dégât." },
  bleue: { label: "Réussite", description: "L'attaque porte, les dégâts sont normaux." },
  verte: { label: "Réussite améliorée", description: "Point sensible : +1 blatte tirée aux dégâts." },
  rouge: { label: "Réussite critique", description: "Point vital : +1 blatte tirée aux dégâts, et sa couleur est améliorée d'un cran." },
};

/**
 * Résultats d'un test de dégâts (Chitine attaquant+arme vs Chitine
 * défenseur+armure), livret p.29-30. Le nombre d'impacts est fixe par
 * couleur, indépendant du nombre de blattes tirées (une seule blatte,
 * choisie par le joueur/le Deus selon les règles d'opposition, détermine
 * le résultat final).
 */
export const RESULTAT_DEGATS = {
  noire: { label: "Échec critique", impacts: 0, mutilation: false, description: "Aucun dégât." },
  blanche: { label: "Égratignure", impacts: 1, mutilation: false, description: "L'attaque ne porte que faiblement." },
  bleue: { label: "Coup porté", impacts: 2, mutilation: false, description: "L'attaque porte normalement." },
  verte: { label: "Blessure aggravée", impacts: 4, mutilation: false, description: "Point sensible touché." },
  rouge: { label: "Mutilation", impacts: 4, mutilation: true, description: "Point vital touché : mutilation (voir livret p.30)." },
};

/**
 * Résultats du test de Sphère de magie vs Difficulté (livre p.262-276).
 * Contrairement à RESULTAT_ATTAQUE/RESULTAT_DEGATS, aucune table de
 * sévérité chiffrée n'est donnée par le livre pour la magie : la couleur
 * ne fait que déclencher la suite de la résolution (Maladresse ou Effet du
 * sort), voir Blattes.resoudreChoixSort(). Les bonus de cran d'Influence
 * sur Blatte verte/rouge (livre p.270) ne sont pas automatisés (v2).
 */
export const RESULTAT_SORT = {
  noire: { label: "Maladresse", description: "Le sort se retourne contre son lanceur (livre p.270)." },
  blanche: { label: "Échec", description: "Le sort échoue, aucun effet ne se produit." },
  bleue: { label: "Réussite", description: "Le sort réussit, ses effets s'appliquent." },
  verte: { label: "Réussite améliorée", description: "Réussite ; +1 cran d'Influence au choix, non automatisé (livre p.270)." },
  rouge: { label: "Réussite critique", description: "Réussite ; +2 crans d'Influence au choix, non automatisé (livre p.270)." },
};

/**
 * Résultats génériques d'un jet Opposition/Difficulté/Simple (livret
 * p.24-25) : contrairement à Attaque/Dégâts/Sort, la couleur ne déclenche
 * aucune suite automatisée — elle sert uniquement à qualifier le degré de
 * réussite affiché dans le message de chat une fois choisie par le joueur
 * (ou le Deus, en cas d'Opposition négative).
 */
export const RESULTAT_SIMPLE = {
  noire: { label: "Échec critique" },
  blanche: { label: "Échec" },
  bleue: { label: "Réussite" },
  verte: { label: "Réussite améliorée" },
  rouge: { label: "Réussite critique" },
};

export const INSECTOPIA = {
  // Espace réservé pour les futures constantes de données (races, castes,
  // sphères de magie, mots de pouvoir, etc.) qui seront ajoutées au fil des
  // prochaines étapes de la conversion.
};
