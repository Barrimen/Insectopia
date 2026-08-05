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
    tradition: "naturelle",
    competenceCombat: "melee",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "",
    description:
      "La platère est fabriquée à partir des pattes anguleuses et acérées des Skarabs de Thron. Une fois la bête tuée, on retire la partie inférieure de sa patte, effilée et rectiligne, taillée en un long tranchoir. Facteur de dégâts équivalent à la Chitine de l'assaillant.",
  },
  {
    name: "Arcin",
    tradition: "naturelle",
    competenceCombat: "tir",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "jusqu'à 100 insètres",
    description:
      "Les arcins sont des armes animistes ressemblant aux arcs, fabriquées à partir de tiges de bois souples et résistantes ou d'os de créatures aux mêmes propriétés. Facteur de dégâts équivalent à la Chitine de l'assaillant.",
  },
  {
    name: "Griffes",
    tradition: "naturelle",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: -1,
    portee: "",
    description: "Griffes naturelles des intres. Facteur de dégâts équivalent à la Chitine de l'assaillant moins un.",
  },
  {
    name: "Griffes acérées",
    tradition: "naturelle",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "",
    description:
      "Certains intres possèdent des griffes particulièrement longues et effilées. Dégâts égaux à la caractéristique Chitine du personnage.",
  },
  {
    name: "Mandibules hypertrophiées",
    tradition: "naturelle",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: 1,
    portee: "",
    description:
      "Immenses armes naturelles extrêmement dévastatrices. Elles infligent des dégâts équivalents à la Chitine plus un.",
  },
  {
    name: "Pinces (arme)",
    tradition: "naturelle",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: -1,
    portee: "",
    description:
      "Les pinces infligent des dégâts mineurs, équivalant à Chitine moins un. Cette arme permet aussi de saisir un adversaire (voir la capacité \"Pince\").",
  },
  {
    name: "Rostre hypertrophié",
    tradition: "naturelle",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "10 insètres",
    porteeInsettres: 10,
    description: "Rostre rétractable permettant de saisir une proie à distance et de la ramener jusqu'à l'appendice buccal. Dégâts égaux à la Chitine.",
  },
  {
    name: "Ravisseuses",
    tradition: "naturelle",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "",
    description: "Membres antérieurs en forme de ravisseuses offrant de l'allonge. Dégâts égaux à la Chitine ; améliore la couleur de la première Blatte d'initiative en attaquant.",
  },
  {
    name: "Pinces démesurées",
    tradition: "naturelle",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "",
    description: "Pinces surdimensionnées permettant de saisir un adversaire en plus d'infliger des dégâts égaux à la Chitine.",
  },
  {
    name: "Morsure",
    tradition: "naturelle",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: 0,
    portee: "",
    description:
      "Les intres dotés de mandibules peuvent mordre leur adversaire, infligeant des dégâts équivalents à la Chitine de l'assaillant.",
  },
  {
    name: "Défenses",
    tradition: "naturelle",
    competenceCombat: "predateur",
    modificateurAttaque: 0,
    modificateurDegats: 1,
    portee: "",
    description: "Défenses naturelles de l'intre. Facteur de dégâts équivalent à la Chitine plus un.",
  },
  {
    name: "Découpeuse",
    tradition: "naturelle",
    competenceCombat: "melee",
    modificateurAttaque: 0,
    modificateurDegats: 1,
    portee: "",
    description:
      "Arme en demi-lune à lame crantée, l'une des plus redoutées d'Entoma. Dégâts égaux à la Chitine plus un. Modificateur d'initiative : moins une couleur. Prix : 30 quartz.",
  },
  {
    name: "Os de tema",
    tradition: "naturelle",
    competenceCombat: "melee",
    modificateurAttaque: 0,
    modificateurDegats: -1,
    portee: "",
    description:
      "Arme d'estoc longue, souple et fine, taillée dans l'os d'un tema. Dégâts égaux à la Chitine moins un. Modificateur d'initiative : plus une couleur. Prix : 12 quartz.",
  },
  {
    name: "Épée de justice",
    tradition: "anciens_dieux",
    competenceCombat: "melee",
    modificateurAttaque: 0,
    modificateurDegats: 1,
    portee: "",
    prixQuartz: 50,
    description: "Arme fétiche des armées cultistes, forgée par la volonté des Anciens Dieux. Dégâts égaux à la Chitine plus un. Aucun modificateur d'initiative. Prix : 50 quartz.",
  },
  {
    name: "Épée de justice ultime",
    tradition: "anciens_dieux",
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
    tradition: "anciens_dieux",
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
    tradition: "naturelle",
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
    tradition: "naturelle",
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
    tradition: "anciens_dieux",
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
    tradition: "anciens_dieux",
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
    tradition: "naturelle",
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
    tradition: "naturelle",
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
    tradition: "naturelle",
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
    tradition: "anciens_dieux",
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
    tradition: "anciens_dieux",
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
    tradition: "anciens_dieux",
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
    tradition: null,
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
    tradition: null,
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
    tradition: null,
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
const { CAPACITES: capacites } = await import("../module/common/data-capacites.js");

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
    capacitesNoms: ["Pinces démesurées", "Mimétisme"],
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
          tradition: doc.tradition ?? null,
        }),
        ...(type === "armure" && {
          bonusChitine: doc.bonusChitine,
          bonusFeu: doc.bonusFeu ?? 0,
          malusAile: doc.malusAile ?? 0,
          malusEncombrement: doc.malusEncombrement,
          modInitiativeType: doc.modInitiativeType ?? "aucun",
          prixQuartz: doc.prixQuartz ?? 0,
          equipee: false,
          tradition: doc.tradition ?? null,
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
