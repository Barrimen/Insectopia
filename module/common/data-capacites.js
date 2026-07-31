/**
 * Les 68 capacités spéciales (livre de base p.207-218), classées par
 * caractéristique. Descriptions paraphrasées (voir README-etape6.md
 * pour la note sur les droits d'auteur). Source unique utilisée à la
 * fois par tools/build-compendium-source.mjs (pour le compendium) et
 * par module/actor/sheet/intre-sheet.js (pour le sélecteur sur la
 * fiche de personnage).
 *
 * Les capacités qui sont en réalité des armes naturelles (Griffes
 * acérées, Mandibules hypertrophiées, Ravisseuses, Pinces démesurées,
 * Défenses) sont modélisées comme des Items "arme" plutôt que
 * dupliquées ici.
 */
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

export const CAPACITES = [
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
