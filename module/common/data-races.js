/**
 * Données des races (livre de base p.198-201).
 *
 * Chaque race donne les 7 caractéristiques (Aile, Antenne, Esprit,
 * Mandibule, Caste, Chitine, Température), ses capacités de race
 * natives, sa religion "par défaut", et ses castes de prédilection
 * (indicatives, pas contraignantes).
 *
 * Les deux races d'araks (Arak'chass, Arak'tiss) utilisent en réalité
 * Patte/Palpe/Chélicère à la place d'Aile/Antenne/Mandibule, et la
 * compétence Soie à la place de Mêlée (livret p.197). Cette variante de
 * feuille de personnage n'est pas modélisée pour l'instant : les valeurs
 * sont stockées dans les mêmes emplacements que les intres à titre
 * d'approximation, à renommer manuellement sur la fiche si besoin.
 */
export const RACES = {
  apis: {
    label: "Apis", variante: "intre",
    caracteristiques: { aile: 4, antenne: 4, esprit: 4, mandibule: 3, caste: 3, chitine: 2, temperature: 3 },
    capacites: ["Ailé", "Dard", "Cire"],
    religion: "cultiste",
    castes: ["Dominant (érudit, reproducteur, diplomate)", "Producteur (marchand, artisan cireur, chasseur)", "Divin (Prêtre des Anciens Dieux)", "Combattant (bretteur, archer, éclaireur, soldat)"],
  },
  blatere: {
    label: "Blatère", variante: "intre",
    caracteristiques: { aile: 2, antenne: 3, esprit: 3, mandibule: 4, caste: 3, chitine: 4, temperature: 3 },
    capacites: ["Ailé", "Résistance à la Souillure"],
    religion: "cultiste",
    castes: ["Combattant (bretteur, archer, éclaireur, soldat)", "Dominant (tous)", "Divin (Prêtre des Anciens Dieux)", "Producteur (dresseur, marchand)"],
  },
  brindis: {
    label: "Brindis", variante: "intre",
    caracteristiques: { aile: 3, antenne: 3, esprit: 4, mandibule: 3, caste: 4, chitine: 4, temperature: 2 },
    capacites: ["Mimétisme"],
    religion: "cultiste",
    castes: ["Dominant (tous sauf reproducteur)", "Combattant (bretteur, archer, soldat)", "Divin (Prêtre des Anciens Dieux)", "Hors caste (explorateur)"],
  },
  cerk: {
    label: "Cerk", variante: "intre",
    caracteristiques: { aile: 2, antenne: 3, esprit: 4, mandibule: 3, caste: 4, chitine: 3, temperature: 3 },
    capacites: ["Pinces", "Fouisseur"],
    religion: "animiste",
    castes: ["Producteur (artisan, marchand)", "Combattant (archer, éclaireur, soldat)", "Dominant (diplomate, érudit, reproducteur)", "Divin (Contrôleur d'énergie)", "Hors caste (explorateur)"],
  },
  crinar: {
    label: "Crinar Acridien", variante: "intre",
    caracteristiques: { aile: 4, antenne: 4, esprit: 2, mandibule: 4, caste: 2, chitine: 4, temperature: 3 },
    capacites: ["Sauteur", "Ailé"],
    religion: "animiste",
    castes: ["Producteur (chasseur, dresseur)", "Combattant (voltigeur)", "Divin (Chaman)"],
  },
  crinelle: {
    label: "Crinelle", variante: "intre",
    caracteristiques: { aile: 3, antenne: 4, esprit: 3, mandibule: 2, caste: 4, chitine: 3, temperature: 3 },
    capacites: ["Sauteur", "Ailé"],
    religion: "animiste",
    castes: ["Producteur (chasseur, dresseur)", "Combattant (éclaireur, voltigeur)", "Divin (Chaman)", "Hors caste (roublard, troubadour)"],
  },
  koksihne: {
    label: "Koks'ihne", variante: "intre",
    caracteristiques: { aile: 3, antenne: 4, esprit: 4, mandibule: 2, caste: 4, chitine: 2, temperature: 3 },
    capacites: ["Lien animal", "Élytres"],
    religion: "animiste",
    castes: ["Producteur (artisan, dresseur)", "Dominant (diplomate, érudit)", "Divin (Druide)", "Hors caste (explorateur)", "Combattant (archer, éclaireur)"],
  },
  lepide: {
    label: "Lépide", variante: "intre",
    caracteristiques: { aile: 3, antenne: 4, esprit: 4, mandibule: 3, caste: 4, chitine: 3, temperature: 2 },
    capacites: ["Parure du danger ou de séduction", "Ailé"],
    religion: "cultiste",
    castes: ["Producteur (artisan)", "Dominant (diplomate, érudit, reproducteur)", "Divin (Psyché)", "Combattant (bretteur, archer, soldat, éclaireur)"],
  },
  lulle: {
    label: "Lulle", variante: "intre",
    caracteristiques: { aile: 4, antenne: 3, esprit: 2, mandibule: 3, caste: 3, chitine: 4, temperature: 3 },
    capacites: ["Ailé", "Vitesse surnaturelle"],
    religion: "animiste",
    castes: ["Producteur (transporteur)", "Dominant (diplomate, érudit, reproducteur)", "Divin (Chaman)", "Hors caste (explorateur, roublard)", "Combattant (archer, éclaireur, voltigeur, soldat)"],
  },
  mantide: {
    label: "Mantide", variante: "intre",
    caracteristiques: { aile: 3, antenne: 3, esprit: 2, mandibule: 4, caste: 2, chitine: 5, temperature: 2 },
    capacites: ["Ravisseuses", "Monstrueux", "Élytres"],
    religion: "animiste",
    castes: ["Producteur (dresseur, chasseur)", "Dominant (diplomate, reproducteur)", "Divin (Chaman)", "Hors caste (explorateur, roublard)", "Combattant (soldat, goliath)"],
  },
  myrmide: {
    label: "Myrmide", variante: "intre",
    caracteristiques: { aile: 3, antenne: 4, esprit: 4, mandibule: 4, caste: 4, chitine: 2, temperature: 3 },
    capacites: ["Force de titan"],
    religion: "cultiste",
    castes: ["Producteur (artisan, marchand, dresseur)", "Dominant (diplomate, érudit, reproducteur)", "Divin (Prêtre des Anciens Dieux)", "Hors caste (explorateur, assassin)", "Combattant (archer, bretteur, éclaireur, soldat)"],
  },
  putere: {
    label: "Putère", variante: "intre",
    caracteristiques: { aile: 3, antenne: 3, esprit: 3, mandibule: 3, caste: 4, chitine: 3, temperature: 3 },
    capacites: ["Pestilence", "Ailé"],
    religion: "cultiste",
    castes: ["Producteur (artisan, marchand)", "Dominant (diplomate, érudit, reproducteur)", "Divin (Prêtre des Anciens Dieux)", "Hors caste (explorateur, assassin)", "Combattant (archer, bretteur, soldat)"],
  },
  skadan: {
    label: "Skadan", variante: "intre",
    caracteristiques: { aile: 3, antenne: 2, esprit: 4, mandibule: 4, caste: 3, chitine: 4, temperature: 2 },
    capacites: ["Mandibule hypertrophiée", "Élytres"],
    religion: "animiste",
    castes: ["Producteur (chasseur)", "Dominant (érudit)", "Divin (Chaman, Sylvegarde)", "Combattant (soldat, goliath)"],
  },
  skarab: {
    label: "Skarab", variante: "intre",
    caracteristiques: { aile: 3, antenne: 2, esprit: 2, mandibule: 4, caste: 3, chitine: 5, temperature: 2 },
    capacites: ["Résistance à la Souillure", "Élytres"],
    religion: "cultiste",
    castes: ["Producteur (artisan, dresseur)", "Dominant (diplomate, érudit)", "Divin (Prêtre des Anciens Dieux)", "Combattant (éclaireur, soldat, archer)"],
  },
  stick: {
    label: "Stick", variante: "intre",
    caracteristiques: { aile: 3, antenne: 4, esprit: 3, mandibule: 2, caste: 4, chitine: 2, temperature: 4 },
    capacites: ["Piqueur-suceur", "Ailé"],
    religion: "animiste",
    castes: ["Producteur (marchand, artisan saigneur)", "Dominant (érudit)", "Divin (Chaman)", "Hors caste (roublard, assassin)", "Combattant (archer, éclaireur, voltigeur)"],
  },
  syrphe: {
    label: "Syrphe", variante: "intre",
    caracteristiques: { aile: 4, antenne: 4, esprit: 3, mandibule: 3, caste: 3, chitine: 2, temperature: 4 },
    capacites: ["Vision de Syrphe", "Ailé"],
    religion: "animiste",
    castes: ["Producteur (marchand, artisan tanneur)", "Dominant (érudit)", "Divin (Chaman)", "Hors caste (roublard, assassin)", "Combattant (archer, éclaireur, voltigeur)"],
  },
  termide: {
    label: "Termide", variante: "intre",
    caracteristiques: { aile: 3, antenne: 4, esprit: 4, mandibule: 4, caste: 4, chitine: 3, temperature: 2 },
    capacites: ["Perception chimique hors du commun"],
    religion: "animiste",
    castes: ["Producteur (marchand, artisan champignonneur)", "Dominant (reproducteur, érudit, diplomate)", "Divin (Chaman)", "Combattant (archer, soldat, goliath)"],
  },
  vespale: {
    label: "Vespale", variante: "intre",
    caracteristiques: { aile: 4, antenne: 3, esprit: 2, mandibule: 4, caste: 3, chitine: 2, temperature: 4 },
    capacites: ["Ailé", "Dard", "Frénésie"],
    religion: "animiste",
    castes: ["Producteur (chasseur)", "Divin (Chaman)", "Hors caste (roublard, assassin)", "Combattant (archer, éclaireur, soldat, voltigeur)"],
  },
  arakchass: {
    label: "Arak'chass", variante: "arak",
    // Patte -> aile, Palpe -> antenne, Chélicère -> mandibule (voir note en tête de fichier).
    caracteristiques: { aile: 3, antenne: 3, esprit: 2, mandibule: 4, caste: 2, chitine: 5, temperature: 3 },
    capacites: ["Morsure venimeuse", "Monstrueux", "Rampant"],
    faiblesse: "Pas de mains",
    religion: "animiste",
    castes: ["Producteur (uniquement chasseur)"],
  },
  araktiss: {
    label: "Arak'tiss", variante: "arak",
    caracteristiques: { aile: 3, antenne: 3, esprit: 4, mandibule: 2, caste: 4, chitine: 3, temperature: 3 },
    capacites: ["Morsure venimeuse", "Jet de toile", "Soie"],
    faiblesse: "Pas de mains",
    religion: "animiste",
    castes: ["Dominant (diplomate)", "Producteur (chasseur)", "Divin (Maîtresse des pouvoirs, Chaman)", "Hors caste (roublard)", "Combattant (éclaireur)"],
  },
};
