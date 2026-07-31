/**
 * Les 26 compétences de caste (livre de base p.229-236). Contrairement
 * aux compétences des 6 caractéristiques "fixes" (Antenne, Aile, etc.),
 * ces compétences sont réparties librement selon le score en Caste du
 * personnage (voir livret p.205 : "le personnage aura autant de
 * compétences dépendantes de Caste que la valeur de cette dernière").
 *
 * Descriptions paraphrasées (pas de reproduction mot pour mot du
 * livret — voir README pour la note sur les droits d'auteur). Certaines
 * sont des compétences spéciales de combat (Blocage, Escrime, Fureur,
 * Coup Vicieux, Tireur d'élite, Vivacité) dont le détail mécanique
 * complet est dans le chapitre Règles de combat, non lu à ce stade.
 */
export const COMPETENCES_CASTE = [
  {
    nom: "Artisanat",
    description:
      "Fabrication d'objets manufacturés dans une spécialité choisie à la création. Test d'Artisanat (ou Médecine et décoctions / Sciences et techniques selon l'objet) opposé à une Difficulté fixée par le Deus. La couleur du résultat détermine la qualité de l'objet obtenu (échec critique : composants perdus + incident ; échec : composants perdus ; réussite : objet conforme ; réussite améliorée/critique : qualité supérieure, délai réduit, ou composants économisés).",
  },
  {
    nom: "Art de la guerre",
    description:
      "Une fois par tour de combat, permet de tirer un test (opposé à Art de la guerre adverse, ou difficulté 0 s'il ne la possède pas) pour accorder un bonus ou infliger un malus tactique à son escouade (attaque, défense, agilité ou dégâts), utilisable une fois par bénéficiaire pendant le tour. Un échec critique retourne l'effet contre l'équipe du tacticien.",
  },
  {
    nom: "Art de la forêt",
    description:
      "Connaissance des forêts : déplacement, repérage de pièges et de dangers, recherche de traces d'animaux, de plantes ou de champignons, recherche d'abris. Compétence de survie spécialisée doublée d'une bonne connaissance de la faune et de la flore.",
  },
  {
    nom: "Art du spectacle",
    description:
      "Divertir un public (musique, danse, théâtre). Un tirage détermine la qualité de la prestation, avec une difficulté fixée selon les Phéromones de la cible, la proximité avec un spectacle précédent, la réputation locale. Une bonne réputation ouvre invitations, cadeaux ou avantages ; une mauvaise rencontre peut au contraire créer un ennemi durable.",
  },
  {
    nom: "Art des voleurs",
    description:
      "Réputation dans les milieux criminels. Le personnage dispose d'un nombre de points de Marché noir égal à son score ; il tire une Blatte avec ce montant pour obtenir un bien ou un service illégal (difficulté fixée par le Deus selon la rareté). Les résultats vont de l'obtention d'un bien de qualité supérieure à la catastrophe (guet-apens, trahison). Les points se régénèrent en début de scénario ou après une ellipse.",
  },
  {
    nom: "Belluaire",
    description:
      "Connaissance empathique des animaux sauvages d'Entoma (points faibles, régime alimentaire, communication non-verbale). Un test de Belluaire opposé au Sens de l'animal cible permet une influence ou un apaisement temporaire — mais jamais un contrôle total comme un druide : l'animal n'obéit que si cela sert son intérêt.",
  },
  {
    nom: "Blocage",
    description:
      "Compétence martiale de saisie et d'immobilisation, très appréciée des soldats animistes. C'est une compétence d'attaque et non de défense : une fois la cible saisie, si elle ne parvient pas à se libérer, l'expert en Blocage peut l'achever facilement au corps à corps. Détail complet dans les règles de combat (compétences spéciales de combat).",
  },
  {
    nom: "Commerce",
    description:
      "Richesse, contacts et réputation d'un marchand (plafonnée à 4 sans affiliation à la Guilde des Négociants). Le personnage dispose d'un nombre de points de Ressource égal à son score, dépensés via un tirage pour obtenir des biens ou services coûteux ; mêmes paliers de résultat qu'Art des voleurs (bien de qualité supérieure à catastrophe).",
  },
  {
    nom: "Coup Vicieux",
    description:
      "Compétence d'attaque sournoise et déloyale (bottes interdites, attaques par surprise), dont l'efficacité est proportionnelle à la discrétion de l'assaillant. Certaines armes exigent sa maîtrise. Détail complet dans les règles de combat.",
  },
  {
    nom: "Courtoisie",
    description:
      "Connaissance des convenances sociales d'Entoma. Un test de Courtoisie opposé à la caractéristique Caste de l'interlocuteur permet de faire bonne impression ou de se sortir d'une situation délicate sans froisser autrui.",
  },
  {
    nom: "Dressage",
    description:
      "Domestication et dressage de petits Sangchauds, Plumes ou insectes. Progression par 8 paliers de difficulté (de la capture d'un animal sauvage à l'obéissance aveugle), au moins une semaine de jeu s'écoulant entre chaque palier.",
  },
  {
    nom: "Éducation",
    description:
      "Capacité à éduquer œufs, larves, nymphes et jeunes intres, à transmettre les valeurs raciales et sociétales. Laisse une empreinte durable : un test opposé aux Phéromones de la cible détermine un bonus ou un malus persistant dans les interactions sociales avec les intres qu'il a élevés, selon le souvenir laissé.",
  },
  {
    nom: "Escrime",
    description:
      "Compétence martiale de précision alliant technique et esthétique du geste, prisée des Bretteurs. Vise à désarmer l'adversaire ou à toucher ses points faibles pour passer au travers de la chitine. Détail complet dans les règles de combat.",
  },
  {
    nom: "Essaim",
    description:
      "Contrôle phéromonal d'intres non doués d'intelligence (ouvriers), utilisé notamment par les Termides Dominants. Le score détermine le nombre d'ouvriers sous commandement permanent, ainsi que leur facteur de dégâts et de résistance en action collective. Opposé à l'Antenne de la cible (+1 par cible supplémentaire) ; un ordre réussi peut avoir n'importe quelle issue sauf pousser la cible à se donner la mort.",
  },
  {
    nom: "Fureur",
    description:
      "Compétence d'attaque brutale et dévastatrice au corps à corps, utilisant les armes naturelles. Détail complet dans les règles de combat.",
  },
  {
    nom: "Histoire et religion",
    description:
      "Connaissances historiques et théologiques couvrant toutes les cultures d'Entoma. En cas de désaccord entre deux personnages sur un fait, un test d'opposition détermine lequel impose son point de vue.",
  },
  {
    nom: "Infiltration",
    description:
      "S'introduire dans des lieux interdits sans être repéré : mouvement silencieux, camouflage physique et phéromonal, déguisement, comédie, imitation animale.",
  },
  {
    nom: "Médecine et décoctions",
    description:
      "Soigner intres et araks, ou à l'inverse fabriquer poisons et remèdes. Opposée à un niveau de difficulté selon l'effet recherché (voir chapitres Soins et poisons).",
  },
  {
    nom: "Navigation",
    description:
      "Diriger une embarcation, un navire fluvial ou une nef aérienne ; s'orienter et estimer les temps de trajet.",
  },
  {
    nom: "Nefs aériennes",
    description:
      "Confectionner et réparer les nefs de transport Lulle. Compétence réservée à cette race.",
  },
  {
    nom: "Sciences et techniques",
    description:
      "Concevoir et fabriquer des objets technologiques. Fréquente chez les adeptes des Anciens Dieux, mais pas réservée à ce culte (ex : un Érudit Lulle l'utilise pour améliorer une nef aérienne).",
  },
  {
    nom: "Sexualité",
    description:
      "Maîtrise de tout ce qui touche à la sexualité (courante et valorisée en Entoma, bien que certaines sociétés la bride) : séduire, donner du plaisir, renforcer une fertilité défaillante. Accorde un bonus de circonstance dans les interactions selon la couleur du tirage.",
  },
  {
    nom: "Survie",
    description:
      "Trouver nourriture, eau et abri dans n'importe quelles conditions climatiques ou géographiques, opposée à un niveau de difficulté fixé par le Deus.",
  },
  {
    nom: "Tireur d'élite",
    description:
      "Compétence d'attaque à distance réservée aux Archers (animistes ou cultistes), reflétant précision et concentration. Détail complet dans les règles de combat.",
  },
  {
    nom: "Vivacité",
    description:
      "Compétence martiale animiste basée sur le mouvement et l'exploitation des capacités naturelles dévastatrices des intres. Détail complet dans les règles de combat.",
  },
  {
    nom: "Sphère de magie",
    description:
      "Permet de choisir une sphère magique parmi les quatre associées au métier divin choisi (jusqu'à deux au moment du choix de la caste, les deux autres via la répartition des compétences de caste). Compétence active utilisée pour résoudre l'effet de tous les sorts de cette sphère.",
  },
];

/**
 * Compétences de caste accessibles à chaque race (livre de base p.236-237,
 * "Tableau récapitulatif des compétences par races"). Une race ne peut
 * choisir ses compétences de caste que dans cette liste (en plus des
 * compétences de son métier). Clés de race identiques à data-races.js.
 */
export const COMPETENCES_CASTE_PAR_RACE = {
  apis: ["Art de la guerre", "Art des voleurs", "Artisanat", "Art du spectacle", "Commerce", "Courtoisie", "Éducation", "Essaim", "Histoire et religion", "Infiltration", "Médecine et décoctions", "Sexualité", "Survie", "Sphère de magie"],
  araktiss: ["Art de la forêt", "Art des voleurs", "Artisanat", "Art du spectacle", "Belluaire", "Commerce", "Courtoisie", "Dressage", "Éducation", "Histoire et religion", "Infiltration", "Médecine et décoctions", "Sexualité", "Survie", "Sphère de magie"],
  blatere: ["Art de la guerre", "Artisanat", "Commerce", "Courtoisie", "Éducation", "Infiltration", "Médecine et décoctions", "Survie", "Sphère de magie"],
  brindis: ["Artisanat", "Commerce", "Courtoisie", "Éducation", "Histoire et religion", "Infiltration", "Médecine et décoctions", "Navigation", "Sciences et techniques", "Sphère de magie"],
  cerk: ["Art de la guerre", "Artisanat", "Belluaire", "Commerce", "Courtoisie", "Dressage", "Éducation", "Essaim", "Histoire et religion", "Infiltration", "Médecine et décoctions", "Survie", "Sphère de magie"],
  crinar: ["Art de la forêt", "Artisanat", "Belluaire", "Commerce", "Dressage", "Infiltration", "Médecine et décoctions", "Navigation", "Sexualité", "Survie", "Sphère de magie"],
  crinelle: ["Art de la forêt", "Art des voleurs", "Artisanat", "Art du spectacle", "Belluaire", "Commerce", "Courtoisie", "Dressage", "Éducation", "Histoire et religion", "Infiltration", "Médecine et décoctions", "Navigation", "Sexualité", "Survie", "Sphère de magie"],
  koksihne: ["Art de la forêt", "Art des voleurs", "Artisanat", "Art du spectacle", "Belluaire", "Commerce", "Courtoisie", "Dressage", "Éducation", "Infiltration", "Médecine et décoctions", "Survie", "Sphère de magie"],
  lepide: ["Artisanat", "Art du spectacle", "Commerce", "Courtoisie", "Éducation", "Infiltration", "Médecine et décoctions", "Sciences et techniques", "Sphère de magie"],
  lulle: ["Art de la forêt", "Artisanat", "Art du spectacle", "Belluaire", "Commerce", "Courtoisie", "Dressage", "Éducation", "Histoire et religion", "Infiltration", "Médecine et décoctions", "Navigation", "Nefs aériennes", "Sexualité", "Survie", "Sphère de magie"],
  mantide: ["Art de la forêt", "Artisanat", "Belluaire", "Dressage", "Histoire et religion", "Infiltration", "Médecine et décoctions", "Survie", "Sphère de magie"],
  myrmide: ["Art de la guerre", "Artisanat", "Commerce", "Courtoisie", "Éducation", "Essaim", "Histoire et religion", "Infiltration", "Médecine et décoctions", "Sciences et techniques", "Survie", "Sphère de magie"],
  putere: ["Art des voleurs", "Artisanat", "Art du spectacle", "Commerce", "Courtoisie", "Éducation", "Histoire et religion", "Infiltration", "Médecine et décoctions", "Navigation", "Sexualité", "Survie", "Sphère de magie"],
  skadan: ["Art de la forêt", "Artisanat", "Éducation", "Médecine et décoctions", "Survie", "Sphère de magie"],
  skarab: ["Art de la forêt", "Art de la guerre", "Artisanat", "Commerce", "Courtoisie", "Éducation", "Infiltration", "Médecine et décoctions", "Survie", "Sphère de magie"],
  stick: ["Art des voleurs", "Artisanat", "Belluaire", "Commerce", "Courtoisie", "Dressage", "Éducation", "Infiltration", "Médecine et décoctions", "Sexualité", "Survie", "Sphère de magie"],
  syrphe: ["Art des voleurs", "Artisanat", "Art du spectacle", "Commerce", "Coup Vicieux", "Courtoisie", "Éducation", "Infiltration", "Médecine et décoctions", "Sexualité", "Survie", "Sphère de magie"],
  termide: ["Art de la guerre", "Artisanat", "Art du spectacle", "Belluaire", "Courtoisie", "Dressage", "Éducation", "Essaim", "Histoire et religion", "Infiltration", "Médecine et décoctions", "Navigation", "Survie", "Sphère de magie"],
  vespale: ["Art de la forêt", "Art des voleurs", "Artisanat", "Art du spectacle", "Belluaire", "Courtoisie", "Dressage", "Éducation", "Infiltration", "Médecine et décoctions", "Sexualité", "Survie", "Sphère de magie"],
  arakchass: ["Art de la forêt", "Artisanat", "Belluaire", "Dressage", "Médecine et décoctions", "Survie", "Sphère de magie"],
};
