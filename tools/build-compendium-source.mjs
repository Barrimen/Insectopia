// Génère les fichiers source JSON du compendium à partir des données du
// kit de démarrage "Insectopia — L'invasion". Exécuté une fois en local
// (node tools/build-compendium-source.mjs), le résultat est ensuite
// compilé en pack LevelDB par le CLI officiel Foundry (fvtt package pack).
import fs from "fs";
import path from "path";

function id16() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 16; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function carac(value, label, competences) {
  return { value, label: `INSECTOPIA.label.caracteristiques.${label}`, competences };
}
function comp(value, label) {
  return { value, label: `INSECTOPIA.label.competences.${label}` };
}

// --------------------------------------------------------------------
// Armes (livret p.28)
// --------------------------------------------------------------------
const armes = [
  {
    name: "Platère",
    competenceCombat: "melee",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "",
    description:
      "La platère est fabriquée à partir des pattes anguleuses et acérées des Skarabs de Thron. Une fois la bête tuée, on retire la partie inférieure de sa patte, effilée et rectiligne, taillée en un long tranchoir. Facteur de dégâts équivalent à la Chitine de l'assaillant.",
  },
  {
    name: "Arcin",
    competenceCombat: "tir",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "jusqu'à 100 insètres",
    description:
      "Les arcins sont des armes animistes ressemblant aux arcs, fabriquées à partir de tiges de bois souples et résistantes ou d'os de créatures aux mêmes propriétés. Facteur de dégâts équivalent à la Chitine de l'assaillant.",
  },
  {
    name: "Griffes",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: -1,
    portee: "",
    description: "Griffes naturelles des intres. Facteur de dégâts équivalent à la Chitine de l'assaillant moins un.",
  },
  {
    name: "Griffes acérées",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "",
    description:
      "Certains intres possèdent des griffes particulièrement longues et effilées. Dégâts égaux à la caractéristique Chitine du personnage.",
  },
  {
    name: "Mandibules hypertrophiées",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: 1,
    portee: "",
    description:
      "Immenses armes naturelles extrêmement dévastatrices. Elles infligent des dégâts équivalents à la Chitine plus un.",
  },
  {
    name: "Pinces (arme)",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: -1,
    portee: "",
    description:
      "Les pinces infligent des dégâts mineurs, équivalant à Chitine moins un. Cette arme permet aussi de saisir un adversaire (voir la capacité \"Pince\").",
  },
  {
    name: "Rostre hypertrophié",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "10 insètres",
    porteeInsettres: 10,
    description: "Rostre rétractable permettant de saisir une proie à distance et de la ramener jusqu'à l'appendice buccal. Dégâts égaux à la Chitine.",
  },
  {
    name: "Ravisseuses",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "",
    description: "Membres antérieurs en forme de ravisseuses offrant de l'allonge. Dégâts égaux à la Chitine ; améliore la couleur de la première Blatte d'initiative en attaquant.",
  },
  {
    name: "Pinces démesurées",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "",
    description: "Pinces surdimensionnées permettant de saisir un adversaire en plus d'infliger des dégâts égaux à la Chitine.",
  },
  {
    name: "Découpeuse",
    competenceCombat: "melee",
    modificateurAttaque: 0,
    modificateurDegats: 1,
    portee: "",
    description:
      "Arme en demi-lune à lame crantée, l'une des plus redoutées d'Entoma. Dégâts égaux à la Chitine plus un. Modificateur d'initiative : moins une couleur. Prix : 30 quartz.",
  },
  {
    name: "Os de tema",
    competenceCombat: "melee",
    modificateurAttaque: 0,
    modificateurDegats: -1,
    portee: "",
    description:
      "Arme d'estoc longue, souple et fine, taillée dans l'os d'un tema. Dégâts égaux à la Chitine moins un. Modificateur d'initiative : plus une couleur. Prix : 12 quartz.",
  },
  {
    name: "Épée de justice",
    competenceCombat: "melee",
    modificateurAttaque: 0,
    modificateurDegats: 1,
    portee: "",
    prixQuartz: 50,
    description: "Arme fétiche des armées cultistes, forgée par la volonté des Anciens Dieux. Dégâts égaux à la Chitine plus un. Aucun modificateur d'initiative. Prix : 50 quartz.",
  },
  {
    name: "Épée de justice ultime",
    competenceCombat: "melee",
    modificateurAttaque: 0,
    modificateurDegats: 2,
    portee: "",
    prixQuartz: 250,
    description:
      "Grande sœur de l'épée de justice, maniée à quatre mains. Dégâts égaux à la Chitine plus deux. Modificateur d'initiative : moins une action. Prix : 250 quartz.",
  },
  {
    name: "Masse des Anciens Dieux",
    competenceCombat: "melee",
    modificateurAttaque: 0,
    modificateurDegats: 1,
    portee: "",
    prixQuartz: 280,
    description:
      "Arme contondante dévastatrice, utilisée pour défoncer armures et chitines épaisses. Dégâts égaux à la Chitine plus un. Modificateur d'initiative : moins une couleur. Prix : 280 quartz.",
  },
  {
    name: "Lance perce-chitine",
    competenceCombat: "melee",
    modificateurAttaque: 0,
    modificateurDegats: 1,
    portee: "",
    prixQuartz: 150,
    description:
      "Longue lance utilisée pour arrêter les charges, avantageuse au premier tour de combat mais peu maniable ensuite. Dégâts égaux à la Chitine plus un. Modificateur d'initiative : moins une couleur. Prix : 150 quartz.",
  },
  {
    name: "Fronde",
    competenceCombat: "tir",
    modificateurAttaque: 0,
    modificateurDegats: -1,
    portee: "50 insètres",
    porteeInsettres: 50,
    rechargeActions: 1,
    prixQuartz: 3,
    description: "Arme ancienne utilisée par les chasseurs et bergers du Sud. Dégâts égaux à la Chitine moins un. Portée 50 insètres. Prix : 3 quartz.",
  },
  {
    name: "Arbalète des Anciens Dieux",
    competenceCombat: "tir",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    degatsFixes: 4,
    portee: "300 insètres",
    porteeInsettres: 300,
    rechargeActions: 2,
    prixQuartz: 100,
    description:
      "Arme cultiste redoutable en siège, mais lourde et lente à recharger (2 actions). Dégâts fixes de 4, indépendants de la Chitine de l'attaquant. Portée 300 insètres. Prix : 100 quartz.",
  },
  {
    name: "Crache-sang fétide des Anciens Dieux",
    competenceCombat: "tir",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    degatsFixes: 5,
    portee: "50 insètres",
    porteeInsettres: 50,
    rechargeActions: 1,
    prixQuartz: 1000,
    description:
      "Arme sophistiquée propulsant un liquide corrosif depuis une poche de cuir de Sangchaud. Dégâts fixes de 5, indépendants de la Chitine. Modificateur d'initiative : moins une couleur. Portée 50 insètres. Rare. Prix : 1000 quartz.",
  },
];

// --------------------------------------------------------------------
// Armures (livret p.29)
// --------------------------------------------------------------------
const armures = [
  {
    name: "Armure de cuir de Sangchauds",
    bonusChitine: 0,
    bonusFeu: 1,
    malusAile: 0,
    malusEncombrement: 0,
    modInitiativeType: "aucun",
    prixQuartz: 6,
    description:
      "Le cuir utilisé pour réaliser ces armures est celui des petits ou des gros Sangchauds poilus, tanné dans les quartiers des tanneurs des cités d'Entoma. N'ajoute pas de bonus de Chitine mais confère un bonus de résistance au feu de +1. Prix : 6 quartz.",
  },
  {
    name: "Armure de bois",
    bonusChitine: 1,
    bonusFeu: 0,
    malusAile: 0,
    malusEncombrement: 1,
    modInitiativeType: "-1couleur",
    prixQuartz: 30,
    description: "Réalisée à partir d'écorce d'arbre, légère mais protectrice. Bonus de Chitine +1. Modificateur d'initiative : moins une couleur. Prix : 30 quartz.",
  },
  {
    name: "Armure de carapace",
    bonusChitine: 2,
    bonusFeu: 0,
    malusAile: -1,
    malusEncombrement: 0,
    modInitiativeType: "-1action",
    prixQuartz: 70,
    description:
      "Restes de chitine d'Insectes réutilisés comme armure ; mal vue socialement (associée à l'insectophagie). Bonus de Chitine +2, -1 en Aile. Modificateur d'initiative : moins une action. Prix : 70 quartz.",
  },
  {
    name: "Armure de cuir clouté (Anciens Dieux)",
    bonusChitine: 1,
    bonusFeu: 1,
    malusAile: 0,
    malusEncombrement: 1,
    modInitiativeType: "-1couleur",
    prixQuartz: 12,
    description: "Cuir renforcé de clous de métal. Bonus de Chitine +1 et résistance au feu +1. Modificateur d'initiative : moins une couleur. Prix : 12 quartz.",
  },
  {
    name: "Cotte de mailles (Anciens Dieux)",
    bonusChitine: 2,
    bonusFeu: 0,
    malusAile: -1,
    malusEncombrement: 0,
    modInitiativeType: "-1action",
    prixQuartz: 100,
    description: "Anneaux de métal couvrant membres antérieurs et thorax, portée par les gradés d'armée. Bonus de Chitine +2, -1 en Aile. Modificateur d'initiative : moins une action. Prix : 100 quartz.",
  },
  {
    name: "Armure de plaques de fer (Anciens Dieux)",
    bonusChitine: 3,
    bonusFeu: 0,
    malusAile: -2,
    malusEncombrement: 0,
    modInitiativeType: "-2action",
    prixQuartz: 500,
    description: "Protection très efficace mais très encombrante. Bonus de Chitine +3, -2 en Aile. Modificateur d'initiative : moins deux actions. Prix : 500 quartz.",
  },
];

// --------------------------------------------------------------------
// Boucliers (livret p.241) — modélisés comme des armures (bonus au
// défenseur), en l'absence pour l'instant d'une mécanique dédiée de
// Parade/couvert dans le moteur de résolution.
// --------------------------------------------------------------------
const boucliers = [
  {
    name: "Écu",
    bonusChitine: -1,
    bonusFeu: 0,
    malusAile: 0,
    malusEncombrement: 0,
    modInitiativeType: "aucun",
    prixQuartz: 12,
    description: "Petit bouclier à une patte. +1 Parade (une fois par tour). Non effectif contre les attaques Prédateur, de saisie, de Blocage, en fuite ou par surprise. Prix : 12 quartz.",
  },
  {
    name: "Bouclier",
    bonusChitine: 0,
    bonusFeu: 0,
    malusAile: 0,
    malusEncombrement: 1,
    modInitiativeType: "-1couleur",
    prixQuartz: 30,
    description: "Bouclier à deux pattes. +1 Parade, +1 couvert. Modificateur d'initiative : moins une couleur. Prix : 30 quartz.",
  },
  {
    name: "Grand bouclier",
    bonusChitine: -1,
    bonusFeu: 0,
    malusAile: 0,
    malusEncombrement: 0,
    modInitiativeType: "-1action",
    prixQuartz: 80,
    description: "Grand bouclier à trois pattes. +2 Parade, +1 couvert. Modificateur d'initiative : moins une action. Prix : 80 quartz.",
  },
];

// --------------------------------------------------------------------
// Capacités spéciales (livre de base p.207-218), classées par
// caractéristique. Descriptions paraphrasées (pas de reproduction mot
// pour mot du livret) : l'essentiel mécanique est conservé (coûts en
// Souillure et en Fluide, effet résumé), la prose originale ne l'est pas.
// Les capacités qui sont en réalité des armes naturelles (Griffes
// acérées, Mandibules hypertrophiées, Ravisseuses, Pinces démesurées,
// Défenses) sont modélisées comme des Items "arme" ci-dessus plutôt que
// dupliquées ici.
// --------------------------------------------------------------------
function cap(name, categorie, souillureCout, fluideCout, description, bonus) {
  return {
    name,
    categorie,
    souillureCout,
    fluideCout,
    description,
    bonus: bonus ?? { actif: false, caracKey: "", compKey: "", valeur: 0 },
  };
}

const capacites = [
  // --- Aile (p.208) ---
  cap("Ailé", "aile", 3, 0, "Le personnage possède des ailes et peut voler (vitesse en vol = Aile + 2)."),
  cap("Contorsion", "aile", 1, 1, "Réduit d'un cran le résultat d'une tentative de saisie ou d'immobilisation adverse."),
  cap("Déplacement silencieux", "aile", 0, 1, "Pour 1 Fluide, améliore la couleur d'un test de déplacement furtif (Antenne vs Antenne)."),
  cap("Flottant", "aile", 0, 0, "Peut flotter et se déplacer sur l'eau à sa vitesse Aile normale ; peut plonger brièvement (durée : Métabolisme en minutes)."),
  cap("Fouisseur", "aile", 0, 0, "Peut creuser et s'enterrer rapidement ; la galerie créée a une taille équivalente au score de Chitine."),
  cap("Musicien", "aile", 1, 0, "Organe stridulant permettant de produire des mélodies, utilisable aussi comme mode de communication."),
  cap("Parure du danger", "aile", 2, 0, "Dissuade les prédateurs animaux de l'attaquer (test de Peur, Aile vs Fougue de la créature)."),
  cap("Quatre mains", "aile", 4, 0, "Possède des mains articulées permettant d'utiliser armes et outils (la plupart des races l'ont nativement)."),
  cap("Rampant", "aile", 1, 0, "Vitesse de déplacement au sol égale à Aile + 2, en utilisant au moins quatre pattes."),
  cap("Sauteur", "aile", 1, 0, "Bonds impressionnants (portée = Aile x10) ; bonus gratuit sur l'action Foncer, et sur l'Agilité pour se dégager d'un combat."),
  cap("Vitesse surnaturelle", "aile", 2, 0, "Vitesse en vol égale à Aile + 3 au lieu de Aile + 2."),
  cap("Voltigeur", "aile", 1, 1, "Pour 1 Fluide, améliore la couleur d'un tirage de manœuvre en vol."),

  // --- Antenne (p.209-210) ---
  cap("Antennes ramifiées", "antenne", 1, 1, "Pour 1 Fluide, améliore la couleur d'un test de repérage à l'ouïe ou à l'odorat."),
  cap("Crache-acide", "antenne", 3, 1, "Attaque à distance (Tir vs Agilité, jusqu'à 50 insètres, ou en cône) infligeant des dégâts via Température."),
  cap("Jet de toile", "antenne", 3, 1, "Projette une toile englobante à distance (test de Tir) ; résistance égale à la compétence Soie."),
  cap("Lance-dard", "antenne", 3, 0, "Lance un dard empoisonné à distance (nécessite la capacité Dard)."),
  cap("Lien animal", "antenne", 1, 1, "Pour 1 Fluide, améliore la couleur d'un test visant à calmer un animal."),
  cap("Mimétisme", "antenne", 0, 0, "Diminue la couleur du test adverse de repérage tant que le personnage reste immobile en environnement naturel."),
  cap("Parure de séduction", "antenne", 2, 1, "Pour 1 Fluide, améliore la couleur d'un test de séduction."),
  cap("Perception chimique hors du commun", "antenne", 2, 1, "Pour 1 Fluide, améliore la couleur d'un test de Phéromones.", {
    actif: true, caracKey: "antenne", compKey: "pheromones", valeur: 1,
  }),
  cap("Pestilence", "antenne", 3, 1, "Nuage de gaz (Température vs Température, portée 10 insètres, dure un tour) qui fait fuir Sangchauds/Plumes/Écailles et fait perdre 1 à 3 actions aux intres selon la réussite."),
  cap("Rostre hypertrophié", "antenne", 3, 0, "Rostre rétractable (portée 10 insètres) permettant de saisir puis ramener une proie (compétence Prédateur)."),
  cap("Vision de Syrphe", "antenne", 1, 1, "Pour 1 Fluide, réduit la couleur du résultat d'une attaque à distance subie."),
  cap("Vision infrarouge", "antenne", 0, 0, "Permet de repérer les sources de chaleur dans l'obscurité."),

  // --- Esprit (p.211-212) ---
  cap("Aura magique", "esprit", 0, 1, "Pour 1 Fluide, améliore d'un cran une colonne du tableau d'influence des sorts sans augmenter la difficulté."),
  cap("Bonne étoile", "esprit", 0, 0, "Tire deux fois ses Blattes de chance en début de scénario et choisit le résultat conservé ; peut aussi repiocher une Blatte de chance pour 1 Fluide."),
  cap("Commandant suprême", "esprit", 0, 1, "Pour 1 Fluide, donne une de ses Blattes d'action à un autre joueur."),
  cap("Contrôle de la bête", "esprit", 1, 0, "Ignore les tests de Conscience liés à la bestialité ; choisit librement s'il cède à l'insectophagie."),
  cap("Électrique", "esprit", 3, 1, "Arcs électriques (portée 10 insètres, Température vs Température) qui paralysent l'adversaire 1 à 3 tours selon la réussite."),
  cap("Écran Mental", "esprit", 2, 1, "Ferme son esprit aux lectures de pensées perçues ; pour 1 Fluide, réduit d'une couleur le test de l'agresseur."),
  cap("Leader né", "esprit", 0, 0, "Peut donner ses Blattes de chance à un autre intre."),
  cap("Macrocéphale", "esprit", 3, 0, "Modification permanente des caractéristiques : Esprit +2, Température -1."),
  cap("Omniscient", "esprit", 0, 1, "Pour 1 Fluide, améliore la couleur d'un test de Connaissance (Conscience)."),
  cap("Psyché", "esprit", 3, 1, "Lit les pensées et crée un lien mental de groupe (Esprit vs Esprit) ; un échec révèle le pouvoir à la cible."),
  cap("Résistance psychique", "esprit", 0, 0, "Augmente d'une Blatte la difficulté des sorts qui le ciblent (bonus d'une Blatte sur les sorts de zone)."),
  cap("Voyageur Spectral", "esprit", 4, 1, "Voyage dans le Payolave (plans parallèles), seul ou en groupe, en opposant Esprit à une difficulté fixée comme pour un sort."),

  // --- Mandibule (p.213-215) ---
  cap("Pince (capacité de saisie)", "mandibule", 0, 0, "Permet de saisir un adversaire et de l'immobiliser avec un test de Prédateur réussi (capacité native Cerk ; détail exact du coût non vérifié depuis le livre de base, repris du kit de démarrage)."),
  cap("Danse de guerre", "mandibule", 0, 1, "Pour 1 Fluide, améliore la couleur d'un test d'intimidation (Mandibule vs Mandibule)."),
  cap("Dard", "mandibule", 3, 1, "Attaque empoisonnée au contact (Prédateur vs Défense), dégâts résolus via Température vs Température."),
  cap("Escrimeur", "mandibule", 3, 1, "Dégâts de mêlée basés sur Antenne -1 au lieu de Chitine ; pour 1 Fluide, améliore la couleur d'une attaque de mêlée."),
  cap("Frénésie", "mandibule", 0, 1, "Déclenchée en encaissant une blessure interne (coût 2 Fluide) : augmentations gratuites de couleur en Initiative/Mêlée/Prédateur, mais Défense réduite à zéro."),
  cap("Membres crantés", "mandibule", 0, 1, "Pour 1 Fluide, améliore la couleur d'une attaque de saisie ou d'immobilisation (Blocage)."),
  cap("Morsure venimeuse", "mandibule", 3, 1, "Attaque empoisonnée au contact (Prédateur vs Défense), dégâts résolus via Température vs Température."),
  cap("Monstrueux", "mandibule", 3, 0, "Impose un test de Peur (Mandibule vs Mandibule) aux intres qui l'attaquent."),
  cap("Piqueur-suceur", "mandibule", 3, 1, "Vole des points de Fluide à sa cible lors d'une attaque réussie (Prédateur vs Défense) ; risque de contamination sur un Blafard."),
  cap("Pugnace", "mandibule", 0, 1, "Pour 1 Fluide, ignore les malus des Blessures internes pendant un combat."),
  cap("Téméraire", "mandibule", 0, 1, "Pour 1 Fluide, améliore la couleur des tests de peur ou de terreur."),

  // --- Chitine (p.215-217) ---
  cap("Chitine renforcée", "chitine", 0, 1, "Impacts = Résistance + 2 ; pour 1 Fluide, améliore la couleur d'un test de Résistance."),
  cap("Colosse", "chitine", 0, 0, "Modification permanente : +1 Chitine et +1 impact, mais -1 Température (coûte de la Souillure hors création de personnage)."),
  cap("Élytres", "chitine", 2, 0, "Membranes chitineuses protégeant les ailes au repos (+1 impact), mais vitesse en vol réduite à Aile + 1 au lieu de Aile + 2."),
  cap("Épines", "chitine", 4, 1, "Pour 1 Fluide, réduit la couleur d'une attaque de corps à corps adverse."),
  cap("Force de titan", "chitine", 3, 1, "Force brute renforcée (capacité native Myrmide)."),
  cap("Ignifugé", "chitine", 3, 0, "Résistance renforcée au feu."),
  cap("Membres allongés", "chitine", 0, 0, "Allonge supplémentaire au corps à corps."),
  cap("Régénération accrue", "chitine", 0, 0, "Récupération de blessures améliorée."),
  cap("Résistance à la Souillure", "chitine", 1, 1, "Résistance renforcée à la maladie des Blafards."),

  // --- Température (p.217-218) ---
  cap("Amphibien", "temperature", 2, 1, "Adaptation à la vie aquatique."),
  cap("Anticipation", "temperature", 0, 1, "Bonus d'anticipation, notamment en Initiative."),
  cap("Catalyseur de chaleur", "temperature", 0, 1, "Manipulation de sa propre chaleur corporelle."),
  cap("Cire", "temperature", 2, 1, "Sécrète de la cire, utilisable comme matériau de construction ou comme onguent."),
  cap("Métabolisme accru", "temperature", 0, 0, "Ne subit pas de blessure interne supplémentaire en cas de chute de température brutale."),
  cap("Microbe", "temperature", 0, 0, "Effet lié à une contamination mineure contrôlée."),
  cap("Mutagène", "temperature", 0, 0, "Effet lié à une mutation mineure."),
  cap("Neuf vies", "temperature", 0, 1, "Bonus de survie dans les situations critiques."),
  cap("Pouvoir renforcé", "temperature", 0, 1, "Renforce l'effet d'une autre capacité du personnage."),
  cap("Résistance au froid", "temperature", 3, 0, "Résistance renforcée au froid."),
  cap("Sang acide", "temperature", 3, 0, "Hémolymphe corrosive."),
  cap("Soie", "temperature", 3, 1, "Production de soie (toile, cocon)."),
];

// --------------------------------------------------------------------
// Personnages pré-tirés (livret p.34-39)
// --------------------------------------------------------------------
function personnage({ name, race, casteNom, metier, religion, regimealimentaire, couleur, historique, caracteristiques, casteCompetences, armesNoms, armureNom, capacitesNoms, chance }) {
  const itemsRefs = [];
  for (const armeName of armesNoms) {
    const source = armes.find((a) => a.name === armeName);
    itemsRefs.push({
      _id: id16(),
      name: source.name,
      type: "arme",
      img: "icons/skills/melee/weapons-crossed-swords-yellow.webp",
      system: {
        description: source.description,
        competenceCombat: source.competenceCombat,
        modificateurAttaque: source.modificateurAttaque,
        modificateurDegats: source.modificateurDegats,
        degatsFixes: source.degatsFixes ?? null,
        portee: source.portee,
        porteeInsettres: source.porteeInsettres ?? 0,
        rechargeActions: source.rechargeActions ?? 0,
        prixQuartz: source.prixQuartz ?? 0,
        equipee: true,
      },
    });
  }
  if (armureNom) {
    const source = armures.find((a) => a.name === armureNom);
    itemsRefs.push({
      _id: id16(),
      name: source.name,
      type: "armure",
      img: "icons/equipment/chest/breastplate-layered-leather-brown.webp",
      system: {
        description: source.description,
        bonusChitine: source.bonusChitine,
        bonusFeu: source.bonusFeu ?? 0,
        malusAile: source.malusAile ?? 0,
        malusEncombrement: source.malusEncombrement,
        modInitiativeType: source.modInitiativeType ?? "aucun",
        prixQuartz: source.prixQuartz ?? 0,
        equipee: true,
      },
    });
  }
  for (const capName of capacitesNoms) {
    const source = capacites.find((c) => c.name === capName);
    itemsRefs.push({
      _id: id16(),
      name: source.name,
      type: "capacite",
      img: "icons/magic/symbols/rune-sigil-blue-pink.webp",
      system: {
        description: source.description,
        categorie: source.categorie,
        souillureCout: source.souillureCout ?? 0,
        fluideCout: source.fluideCout ?? 0,
        bonus: { ...source.bonus },
      },
    });
  }

  return {
    _id: id16(),
    name,
    type: "intre",
    img: "icons/svg/mystery-man.svg",
    system: {
      caracteristiques: caracteristiques,
      identite: {
        race,
        casteNom,
        metier,
        religion,
        regimealimentaire,
        couleur,
        historique: `<p>${historique}</p>`,
        description: "",
        capacites: [],
      },
      chance: chance ?? { rouge: 0, verte: 0, bleue: 0, blanche: 0, noire: 0 },
      combat: {
        blessures: { impact: { value: 0, max: 0 }, blessureinterne: { value: 0, max: 0 } },
        souillure: 0,
        fluide: { value: 0, max: 0 },
        encombrement: 0,
        initiative: 0,
      },
    },
    items: itemsRefs,
    folder: null,
    ownership: { default: 0 },
  };
}
// Écrase la valeur de Caste avec les compétences propres au personnage.
function withCaste(caracteristiques, casteValue, casteCompetences) {
  return {
    ...caracteristiques,
    caste: {
      value: casteValue,
      label: "INSECTOPIA.label.caracteristiques.caste",
      competences: casteCompetences,
    },
  };
}

const personnages = [
  personnage({
    name: "Combeis Marginatus",
    race: "Putère",
    casteNom: "Dominant",
    metier: "Reproducteur",
    religion: "animiste",
    regimealimentaire: "omnivore",
    couleur: "Ocre",
    historique:
      "Issu d'une famille de dominants d'Aran Bara, Combeis fit les frais des jeux de cour des Royaumes Marchands et fut exilé à Akis, où il rejeta le culte des Anciens Dieux pour embrasser le culte d'Onono. Il commande depuis deux cycles une troupe de huit Putères affiliées aux Fils d'Onono, spécialisées dans l'assaut chimique.",
    caracteristiques: withCaste(
      {
        aile: carac(3, "aile", { agilite: comp(1, "agilite"), defense: comp(3, "defense") }),
        antenne: carac(4, "antenne", { pheromones: comp(3, "pheromones"), tir: comp(2, "tir") }),
        mandibule: carac(3, "mandibule", { predateur: comp(1, "predateur"), melee: comp(3, "melee") }),
        esprit: carac(3, "esprit", { conscience: comp(2, "conscience"), instinct: comp(2, "instinct") }),
        chitine: carac(3, "chitine", { chrysalide: comp(2, "chrysalide"), resistance: comp(2, "resistance") }),
        temperature: carac(3, "temperature", { activite: comp(2, "activite"), metabolisme: comp(2, "metabolisme") }),
      },
      4,
      [
        { label: "Essaim", value: 3 },
        { label: "Courtoisie", value: 2 },
      ]
    ),
    armesNoms: ["Platère"],
    armureNom: "Armure de cuir de Sangchauds",
    capacitesNoms: ["Ailé", "Pestilence", "Antennes ramifiées"],
    chance: { rouge: 0, verte: 0, bleue: 0, blanche: 0, noire: 0 },
  }),

  personnage({
    name: "Pénore de Néopté",
    race: "Cerk",
    casteNom: "Penseur",
    metier: "Contrôleur d'énergies",
    religion: "animiste",
    regimealimentaire: "omnivore",
    couleur: "Marron",
    historique:
      "Formé dès l'enfance à l'école des contrôleurs de Néopté, Pénore fut grièvement blessé lors de la destruction de la nef « Le Bellan » par une troupe de Myrmides. Convalescent, il rejoignit les Fils d'Onono à Akis pour servir la cause des peuples du Sud, en anti-cultiste acharné mais pacifiste.",
    caracteristiques: withCaste(
      {
        aile: carac(2, "aile", { agilite: comp(1, "agilite"), defense: comp(2, "defense") }),
        antenne: carac(3, "antenne", { pheromones: comp(2, "pheromones"), tir: comp(2, "tir") }),
        mandibule: carac(3, "mandibule", { predateur: comp(3, "predateur"), melee: comp(1, "melee") }),
        esprit: carac(5, "esprit", { conscience: comp(3, "conscience"), instinct: comp(3, "instinct") }),
        chitine: carac(3, "chitine", { chrysalide: comp(1, "chrysalide"), resistance: comp(3, "resistance") }),
        temperature: carac(3, "temperature", { activite: comp(2, "activite"), metabolisme: comp(2, "metabolisme") }),
      },
      4,
      [
        { label: "Air", value: 2 },
        { label: "Terre", value: 3 },
      ]
    ),
    armesNoms: ["Pinces (arme)"],
    armureNom: null,
    capacitesNoms: ["Pince (capacité de saisie)", "Mimétisme"],
  }),

  personnage({
    name: "Mosha le gris",
    race: "Termide",
    casteNom: "Dominant",
    metier: "Reproducteur",
    religion: "animiste",
    regimealimentaire: "herbivore",
    couleur: "Nacré et gris",
    historique:
      "Né dans une couveuse de la reine d'Akis, sélectionné dès la larve pour devenir dominant, Mosha intégra le corps des diplomates avant de rejoindre les Fils d'Onono voilà deux cycles. Il respecte le culte des Anciens Dieux pour ses apports, mais combat avec ferveur la maladie des blafards qu'il a permis de répandre.",
    caracteristiques: withCaste(
      {
        aile: carac(3, "aile", { agilite: comp(1, "agilite"), defense: comp(3, "defense") }),
        antenne: carac(5, "antenne", { pheromones: comp(5, "pheromones"), tir: comp(1, "tir") }),
        mandibule: carac(4, "mandibule", { predateur: comp(2, "predateur"), melee: comp(2, "melee") }),
        esprit: carac(4, "esprit", { conscience: comp(3, "conscience"), instinct: comp(2, "instinct") }),
        chitine: carac(3, "chitine", { chrysalide: comp(2, "chrysalide"), resistance: comp(2, "resistance") }),
        temperature: carac(3, "temperature", { activite: comp(2, "activite"), metabolisme: comp(1, "metabolisme") }),
      },
      4,
      [
        { label: "Essaim", value: 3 },
        { label: "Histoire et religion", value: 2 },
      ]
    ),
    armesNoms: ["Platère"],
    armureNom: null,
    capacitesNoms: ["Ailé", "Perception chimique hors du commun"],
  }),

  personnage({
    name: "Terna Mé",
    race: "Termide",
    casteNom: "Combattant",
    metier: "Soldat",
    religion: "animiste",
    regimealimentaire: "herbivore",
    couleur: "Nacré",
    historique:
      "Ancien soldat termide de la cité d'Akis, Terna Mé fut choisi par les Fils d'Onono pour devenir l'un des leurs, ce qui l'émancipa de sa condition de soldat lié à sa reine. Depuis deux cycles, il est le bras armé d'un groupe de Fils d'Onono chargé de faire taire la menace blafarde au royaume de Gao.",
    caracteristiques: withCaste(
      {
        aile: carac(3, "aile", { agilite: comp(1, "agilite"), defense: comp(3, "defense") }),
        antenne: carac(4, "antenne", { pheromones: comp(2, "pheromones"), tir: comp(3, "tir") }),
        mandibule: carac(5, "mandibule", { predateur: comp(2, "predateur"), melee: comp(4, "melee") }),
        esprit: carac(4, "esprit", { conscience: comp(1, "conscience"), instinct: comp(4, "instinct") }),
        chitine: carac(3, "chitine", { chrysalide: comp(1, "chrysalide"), resistance: comp(3, "resistance") }),
        temperature: carac(2, "temperature", { activite: comp(1, "activite"), metabolisme: comp(2, "metabolisme") }),
      },
      4,
      [
        { label: "Blocage", value: 3 },
        { label: "Essaim", value: 2 },
      ]
    ),
    armesNoms: ["Platère", "Mandibules hypertrophiées"],
    armureNom: "Armure de cuir de Sangchauds",
    capacitesNoms: ["Perception chimique hors du commun"],
  }),

  personnage({
    name: "Apenlys",
    race: "Lulle",
    casteNom: "Producteur",
    metier: "Transporteur",
    religion: "animiste",
    regimealimentaire: "omnivore",
    couleur: "Verte",
    historique:
      "Capitaine de la nef « l'Agrillon » depuis six cycles, Apenlys loue depuis peu ses services aux Fils d'Onono, plus risqués mais mieux payés. Il soutient secrètement la confrérie, portant assistance à ses membres dans les situations difficiles, toujours accompagné de son ami Norim.",
    caracteristiques: withCaste(
      {
        aile: carac(4, "aile", { agilite: comp(2, "agilite"), defense: comp(3, "defense") }),
        antenne: carac(3, "antenne", { pheromones: comp(2, "pheromones"), tir: comp(2, "tir") }),
        mandibule: carac(3, "mandibule", { predateur: comp(1, "predateur"), melee: comp(3, "melee") }),
        esprit: carac(2, "esprit", { conscience: comp(1, "conscience"), instinct: comp(2, "instinct") }),
        chitine: carac(4, "chitine", { chrysalide: comp(2, "chrysalide"), resistance: comp(3, "resistance") }),
        temperature: carac(3, "temperature", { activite: comp(2, "activite"), metabolisme: comp(2, "metabolisme") }),
      },
      4,
      [
        { label: "Nefs aériennes", value: 2 },
        { label: "Navigation", value: 3 },
      ]
    ),
    armesNoms: ["Platère"],
    armureNom: null,
    capacitesNoms: ["Vitesse surnaturelle", "Vision infrarouge"],
  }),

  personnage({
    name: "Norim",
    race: "Lulle",
    casteNom: "Combattant",
    metier: "Soldat",
    religion: "animiste",
    regimealimentaire: "omnivore",
    couleur: "Bleue",
    historique:
      "Né dans les nids aquatiques de Linné, au caractère impulsif et turbulent, Norim fut condamné à mort après avoir dévoré une partie du crâne d'une Putère qui le provoquait. Évadé, il erra dans le désert Locustir avant de rencontrer le capitaine Apenlys, qu'il suit depuis fidèlement.",
    caracteristiques: withCaste(
      {
        aile: carac(4, "aile", { agilite: comp(2, "agilite"), defense: comp(3, "defense") }),
        antenne: carac(3, "antenne", { pheromones: comp(1, "pheromones"), tir: comp(3, "tir") }),
        mandibule: carac(4, "mandibule", { predateur: comp(4, "predateur"), melee: comp(2, "melee") }),
        esprit: carac(2, "esprit", { conscience: comp(1, "conscience"), instinct: comp(2, "instinct") }),
        chitine: carac(4, "chitine", { chrysalide: comp(2, "chrysalide"), resistance: comp(3, "resistance") }),
        temperature: carac(3, "temperature", { activite: comp(2, "activite"), metabolisme: comp(2, "metabolisme") }),
      },
      3,
      [
        { label: "Fureur", value: 2 },
        { label: "Nefs aériennes", value: 2 },
      ]
    ),
    armesNoms: ["Platère", "Griffes acérées"],
    armureNom: "Armure de cuir de Sangchauds",
    capacitesNoms: ["Vitesse surnaturelle"],
  }),
];

// --------------------------------------------------------------------
// Écriture des fichiers source
// --------------------------------------------------------------------
function writeDocs(list, type, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const collectionByType = { arme: "items", armure: "items", capacite: "items", intre: "actors" };
  const collection = collectionByType[type];
  for (const doc of list) {
    const _id = doc._id ?? id16();
    const full = {
      _id,
      _key: `!${collection}!${_id}`,
      name: doc.name,
      type,
      img: doc.img ?? "icons/svg/item-bag.svg",
      system: doc.system ?? doc,
      effects: [],
      folder: null,
      ownership: { default: 0 },
    };
    // Pour les items génériques (armes/armures/capacités hors personnages)
    if (!doc.system && type !== "intre") {
      full.system = {
        description: doc.description,
        ...(type === "arme" && {
          competenceCombat: doc.competenceCombat,
          modificateurAttaque: doc.modificateurAttaque,
          modificateurDegats: doc.modificateurDegats,
          degatsFixes: doc.degatsFixes ?? null,
          portee: doc.portee,
          porteeInsettres: doc.porteeInsettres ?? 0,
          rechargeActions: doc.rechargeActions ?? 0,
          prixQuartz: doc.prixQuartz ?? 0,
          equipee: false,
        }),
        ...(type === "armure" && {
          bonusChitine: doc.bonusChitine,
          bonusFeu: doc.bonusFeu ?? 0,
          malusAile: doc.malusAile ?? 0,
          malusEncombrement: doc.malusEncombrement,
          modInitiativeType: doc.modInitiativeType ?? "aucun",
          prixQuartz: doc.prixQuartz ?? 0,
          equipee: false,
        }),
        ...(type === "capacite" && {
          categorie: doc.categorie,
          souillureCout: doc.souillureCout ?? 0,
          fluideCout: doc.fluideCout ?? 0,
          bonus: doc.bonus,
        }),
      };
    }
    if (type === "intre") {
      full.system = doc.system;
      full.items = doc.items.map((it) => ({ ...it, _key: `!actors.items!${_id}.${it._id}`, effects: [] }));
    }
    const filename = doc.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    fs.writeFileSync(path.join(dir, `${filename}.json`), JSON.stringify(full, null, 2));
  }
  console.log(`${list.length} documents écrits dans ${dir}`);
}

writeDocs(armes, "arme", "packs-src/armes-armures");
writeDocs(armures, "armure", "packs-src/armes-armures");
writeDocs(boucliers, "armure", "packs-src/armes-armures");
writeDocs(capacites, "capacite", "packs-src/capacites");
writeDocs(personnages, "intre", "packs-src/personnages");

console.log("Terminé.");
