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
  SOUILLURE: "souillure",
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
 * Localisation d'une Mutilation (livret p.30 : "le joueur choisit la partie
 * du corps qu'il sectionne, ou si le Deus le désire, le joueur utilise la
 * table de localisation de la fiche de personnage"). Le livre ne détaille
 * pas cette "table" au-delà du schéma d'insecte de la fiche ; la
 * correspondance couleur -> zone ci-dessous a été fixée avec l'auteur du
 * jeu pour permettre un tirage au sort (une Blatte piochée dans le sac de
 * 42, indépendamment du tirage de Dégâts).
 *
 * Effets Tête/Abdomen (mort immédiate) et Thorax (immobilisation) : livret
 * p.30, mécanique fixe. Effets Aile/Patte : le livre ne précise qu'une
 * "mutilation permanente" sans effet chiffré ; le malus appliqué ici
 * (vitesseVol à 0, vitesseSol -2) est une House Rule, clairement isolée
 * dans _prepareDataIntre() et facile à retirer/ajuster.
 */
export const LOCALISATION_ZONES = {
  rouge: { zone: "tete", label: "Tête", effet: "mort" },
  verte: { zone: "thorax", label: "Thorax", effet: "immobilisation" },
  noire: { zone: "abdomen", label: "Abdomen", effet: "mort" },
  bleue: { zone: "aile", label: "Aile", effet: "mutilation_aile" },
  blanche: { zone: "patte", label: "Patte", effet: "mutilation_patte" },
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

/**
 * La Souillure et ses mutations (livre de base p.295-298, section Deus).
 * Deux tests distincts partagent le ROLL_TYPE.SOUILLURE, distingués par
 * data.souillureContexte :
 *  - "contraction" : test de Chrysalide déclenché par une exposition
 *    (toxicité de la source), voir TOXICITE_SOUILLURE.
 *  - "evolution"   : test de Chrysalide mensuel (chaque lonas) pour un
 *    personnage déjà contaminé, Difficulté = niveau de Souillure actuel.
 *    Les Blattes de chance sont interdites sur ce test (livre p.298).
 */
export const TOXICITE_SOUILLURE = {
  tresfaible: { label: "Très faible — objet souillé faiblement", difficulte: 1 },
  faible: { label: "Faible — respirer l'air d'un lieu souillé", difficulte: 2 },
  moyenne: { label: "Moyenne — contact objet souillé / Blafard Souillure ≥ 5", difficulte: 3 },
  forte: { label: "Forte — blessé par un Blafard Souillure ≥ 5", difficulte: 4 },
  tresforte: { label: "Très forte — ingestion liquide souillé / Blafard Souillure ≥ 9", difficulte: 5 },
  fatale: { label: "Fatale — immersion liquide souillé / Blafard Souillure ≥ 9", difficulte: 5 },
};

export const RESULTAT_SOUILLURE_CONTRACTION = {
  noire: { label: "Contamination sévère", souillureDelta: 2, description: "Gain de 2 points de Souillure." },
  blanche: { label: "Contamination", souillureDelta: 1, description: "Gain de 1 point de Souillure." },
  bleue: { label: "Résistance", souillureDelta: 0, description: "Aucun effet." },
  verte: { label: "Résistance nette", souillureDelta: 0, description: "Évite le prochain test de contraction (livre p.296)." },
  rouge: { label: "Immunité passagère", souillureDelta: 0, description: "Plus de test de contraction aujourd'hui (livre p.296)." },
};

export const RESULTAT_SOUILLURE_EVOLUTION = {
  noire: { label: "Aggravation sévère", souillureDelta: 2, description: "Gain de 2 points de Souillure." },
  blanche: { label: "Aggravation", souillureDelta: 1, description: "Gain de 1 point de Souillure." },
  bleue: { label: "Stagnation", souillureDelta: 0, description: "Aucun effet." },
  verte: { label: "Rémission", souillureDelta: -1, description: "Perte de 1 point de Souillure." },
  rouge: { label: "Rémission nette", souillureDelta: -2, description: "Perte de 2 points de Souillure." },
};

/**
 * Paliers d'effets de la jauge de Souillure (livre p.296-297). Purement
 * informatif ici — l'application mécanique des mutations (Lot B) reste à
 * la discrétion du Deus, qui choisit librement la mutation dans la liste
 * du livre pour chaque palier atteint.
 */
export const SOUILLURE_PALIERS = [
  { seuil: 3, label: "Marques blanches sur la chitine" },
  { seuil: 5, label: "Phosphorescence + Mutation niveau 1" },
  { seuil: 7, label: "Mutation niveau 2" },
  { seuil: 9, label: "Mutation niveau 3" },
  { seuil: 11, label: "Mutation niveau 4" },
  { seuil: 13, label: "Mort" },
];

/**
 * Mutations blafardes (livre p.296-297). À chaque seuil de Souillure
 * (5/7/9/11), le Deus choisit librement UNE mutation dans la liste du
 * niveau correspondant. En contrepartie, le joueur choisit une nouvelle
 * capacité sans payer son coût en Souillure (voir souillure.js).
 *
 * `auto` distingue les effets automatisables sans ambiguïté (un seul
 * modificateur chiffré, sur une seule caractéristique/compétence) de ceux
 * qui restent à appliquer manuellement par le Deus : plusieurs mutations
 * touchent plusieurs cibles à la fois (ex: Purulent = Résistance ET
 * Phéromones, sous deux caractéristiques différentes) ou ont un effet
 * narratif/de contrôle (Possédé, Insectophage) que le système générique de
 * bonus (un item capacité = une caractéristique + une compétence) ne peut
 * pas représenter fidèlement sans risquer d'être inexact. Dans le doute,
 * on documente plutôt que d'automatiser une approximation — cohérent avec
 * le reste du système (cf. cellules "À VÉRIFIER" de data-spheres.js).
 *
 * Effets `auto: true` :
 *  - type "caracteristique" : modifie system.caracteristiques.{caracKey}.value
 *    de façon permanente (ex: Inerte, Fonte de chitine).
 *  - type "bonus" : crée un Item capacité avec system.bonus rempli
 *    (caracKey + compKey optionnel), réutilise le mécanisme existant de
 *    getCapaciteBonus() (ex: Couard = malus caractéristique-large sur
 *    Mandibule, Tête de Plume/Sang-chaud = malus ciblé sur Instinct).
 */
export const MUTATIONS_BLAFARDES = {
  1: [
    {
      key: "purulent",
      label: "Purulent",
      description:
        "Des pustules d'hémolymphe et de pus parcourent sa chitine. Malus d'une Blatte à Résistance ET à Phéromones.",
      auto: false,
    },
    {
      key: "couard",
      label: "Couard",
      description: "Personnage craintif, ne s'engage que rarement dans le danger. Malus de deux Blattes à tous les tests de Mandibule.",
      auto: true,
      effet: { type: "bonus", caracKey: "mandibule", compKey: null, valeur: -2 },
    },
    {
      key: "insectophage",
      label: "Insectophage",
      description:
        "A goûté à l'hémolymphe des intres, ne peut plus s'en passer : doit manger de la chair d'intre tous les jours ou souffrir d'un effet de manque important.",
      auto: false,
    },
  ],
  2: [
    {
      key: "membre_atrophie",
      label: "Membre atrophié",
      description:
        "Un membre n'est plus qu'un moignon. Si Aile : malus de deux Blattes en Aile et en Agilité. Si Patte : malus d'une Blatte à Mêlée, Prédateur et Défense.",
      auto: false,
    },
    {
      key: "decerebre",
      label: "Décérébré",
      description: "Raisonnement et comportement altérés. Malus de deux Blattes en Esprit et en Conscience.",
      auto: false,
    },
    {
      key: "antenne_en_moins",
      label: "Antenne en moins",
      description: "Une antenne (ou un pédipalpe) n'assure plus ses fonctions. Malus d'une Blatte en Antenne et de deux en Phéromones.",
      auto: false,
    },
    {
      key: "obese",
      label: "Obèse",
      description:
        "Proportions gigantesques, lourd et difforme. Malus d'une Blatte en Aile, Température, Activité, Défense et Agilité ; bonus d'une Blatte en Chitine.",
      auto: false,
    },
    {
      key: "plumes_ou_poils",
      label: "À plumes ou à poils",
      description: "Recouvert de plumes ou de poils : aucun bonus/malus mécanique, mais ne peut plus camoufler son appartenance aux Blafards.",
      auto: false,
    },
  ],
  3: [
    {
      key: "aveugle",
      label: "Aveugle",
      description: "Ne voit plus rien, se fie uniquement à ses phéromones. Tous les tests physiques réduits d'une Blatte.",
      auto: false,
    },
    {
      key: "instable",
      label: "Instable",
      description:
        "Hémolymphe partiellement explosive : si une Blessure interne lui est infligée, il explose et inflige des dégâts égaux à sa Température autour de lui.",
      auto: false,
    },
    {
      key: "possede",
      label: "Possédé",
      description: "N'est plus en pleine possession de ses moyens. Le Deus en prend fréquemment le contrôle au cours des aventures.",
      auto: false,
    },
    {
      key: "inerte",
      label: "Inerte",
      description: "Perd en température. Caractéristique Température -1 permanent.",
      auto: true,
      effet: { type: "caracteristique", caracKey: "temperature", delta: -1 },
    },
    {
      key: "fonte_chitine",
      label: "Fonte de chitine",
      description: "La chitine devient très fine. Caractéristique Chitine -1 permanent.",
      auto: true,
      effet: { type: "caracteristique", caracKey: "chitine", delta: -1 },
    },
    {
      key: "tete_plume_ou_sangchaud",
      label: "Tête de Plume ou de Sang-chaud",
      description: "La tête devient celle d'une créature : inspire la peur, mais Instinct réduit de trois.",
      auto: true,
      effet: { type: "bonus", caracKey: "esprit", compKey: "instinct", valeur: -3 },
    },
  ],
  4: [
    {
      key: "ephemere",
      label: "Éphémère",
      description: "Membres, chitine et antennes se délitent rapidement : perte de 1 point de Température permanent à la fin de chaque scénario.",
      auto: false,
    },
    {
      key: "explosif",
      label: "Explosif",
      description:
        "Bombe vivante consciente de son état : peut déclencher une explosion infligeant des dégâts de force 7, au prix de sa propre vie.",
      auto: false,
    },
    {
      key: "vide_magique",
      label: "Vide magique",
      description: "Toute magie a quitté le personnage. Résistance à la magie réduite à zéro, ne peut plus lancer de sorts.",
      auto: false,
    },
  ],
};

export const INSECTOPIA = {
  // Espace réservé pour les futures constantes de données (races, castes,
  // sphères de magie, mots de pouvoir, etc.) qui seront ajoutées au fil des
  // prochaines étapes de la conversion.
};
