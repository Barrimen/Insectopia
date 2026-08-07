// ============================================================================
// INSECTOPIA - Calendrier d'Entoma (livre de base p.278-279)
// ============================================================================
//
// Sources confirmées dans le livre de base :
//  - Le lonas est un cycle lunaire de 28 jours (= une "année" pour un intre,
//    de la naissance à l'âge adulte).
//  - Le jour et la nuit ont la même durée qu'en mesure humaine (24h).
//  - Un kumi (saison) dure "en moyenne trois lonas", mais "leur durée peut
//    varier selon les pays" -> aucune valeur fixe donnée par le livre.
//  - La météo n'est PAS associée à une table kumi -> météo fixe : le livre
//    indique explicitement qu'il serait "complexe, et sans doute
//    improductif" de proposer une telle table, et laisse ce choix au Deus.
//  - Table Météorologie -> Activité/Métabolisme -> Risques (p.279),
//    reproduite ci-dessous à l'identique.
//
// Zones non tranchées par le livre, marquées House Rule / valeur par
// défaut ajustable :
//  - Durée d'un kumi en lonas (LONAS_PAR_KUMI_DEFAUT = 3, réglage monde
//    ajustable, cf. common/settings.js).
//  - Frontière jour/nuit : le livre ne donne aucune heure de lever/coucher
//    différente de la mesure humaine ("les nuits et les jours ont la même
//    durée" que pour les humains) -> on prend ici le milieu de journée
//    (moitié JOUR / moitié NUIT), à ajuster si besoin.
//  - Chute de température nocturne : le livre mentionne que "la température
//    baisse" la nuit mais ne donne AUCUN chiffre -> non implémenté ici,
//    volontairement laissé de côté plutôt que d'inventer une valeur (cf.
//    STATUS.md, chantier Calendrier).

/** Durée d'un jour, en secondes de `game.time.worldTime` (mesure humaine). */
export const SECONDES_PAR_JOUR = 86400;

/** Longueur d'un lonas (cycle lunaire), en jours. Valeur fixe du livre. */
export const JOURS_PAR_LONAS = 28;

/** Durée par défaut d'un kumi, en lonas. House Rule ajustable (réglage monde). */
export const LONAS_PAR_KUMI_DEFAUT = 3;

/** Les quatre kumis (saisons), dans l'ordre cyclique du livre. */
export const KUMIS = ["Printemps", "Été", "Automne", "Hiver"];

/** Index du kumi d'hiver dans KUMIS, utilisé pour le repère "diapause probable". */
export const KUMI_HIVER_INDEX = KUMIS.indexOf("Hiver");

/**
 * Table Météorologie / Activité & Métabolisme / Risques (livre de base p.279).
 * `modificateur` s'applique identiquement à l'Activité ET au Métabolisme.
 * `risques` : liste informative de mots-clés ("gel", "diapause", "frenesie"),
 * jamais appliqués automatiquement à l'acteur (choix explicite d'Obe :
 * indicateurs seulement, la main reste au Deus).
 *
 * Rappel du livre sur le déclenchement des risques :
 *  - Gel / Diapause : se déclenchent quand le Métabolisme (après
 *    modificateur météo) tombe à 0.
 *  - Frénésie : se déclenche quand le Métabolisme (après modificateur)
 *    atteint le double de sa valeur de base.
 */
export const TABLE_METEO = {
  glaciaire: { label: "Glaciaire", temperature: "-30°", modificateur: -4, risques: ["gel"] },
  tres_froid: { label: "Très froid", temperature: "-10°", modificateur: -3, risques: ["gel", "diapause"] },
  gel: { label: "Gel", temperature: "0°", modificateur: -2, risques: ["diapause"] },
  froid: { label: "Froid", temperature: "10°", modificateur: -1, risques: ["diapause"] },
  tempere: { label: "Tempéré", temperature: "20°", modificateur: 0, risques: [] },
  chaud: { label: "Chaud", temperature: "30°", modificateur: 1, risques: [] },
  canicule: { label: "Canicule", temperature: "40°", modificateur: 2, risques: ["frenesie"] },
  desertique: { label: "Désertique", temperature: "50°", modificateur: 3, risques: ["frenesie"] },
};

/** Ordre d'affichage du plus froid au plus chaud (objets JS = ordre d'insertion, mais explicite ici pour l'UI). */
export const ORDRE_METEO = ["glaciaire", "tres_froid", "gel", "froid", "tempere", "chaud", "canicule", "desertique"];

export const METEO_DEFAUT = "tempere";

/**
 * Calcule l'état complet du calendrier à partir du `worldTime` (secondes,
 * API Foundry native) et du réglage `lonasParKumi` (House Rule ajustable).
 * Pure fonction (aucun accès à `game.*`), pour rester testable simplement.
 *
 * @param {number} worldTimeSecondes
 * @param {number} lonasParKumi
 * @returns {{
 *   jourTotal:number, jourDansLonas:number, lonasTotal:number,
 *   lonasDansKumi:number, kumiIndex:number, kumiLabel:string, estNuit:boolean
 * }}
 */
export function calculerDate(worldTimeSecondes, lonasParKumi = LONAS_PAR_KUMI_DEFAUT) {
  const secondes = Number(worldTimeSecondes) || 0;
  const parKumi = Math.max(1, Number(lonasParKumi) || LONAS_PAR_KUMI_DEFAUT);

  const jourTotal = Math.floor(secondes / SECONDES_PAR_JOUR);
  const jourDansLonas = (((jourTotal % JOURS_PAR_LONAS) + JOURS_PAR_LONAS) % JOURS_PAR_LONAS) + 1;
  const lonasTotal = Math.floor(jourTotal / JOURS_PAR_LONAS);

  const cycleComplet = parKumi * KUMIS.length;
  const lonasIndexAbs = ((lonasTotal % cycleComplet) + cycleComplet) % cycleComplet;
  const kumiIndex = Math.floor(lonasIndexAbs / parKumi);
  const lonasDansKumi = (lonasIndexAbs % parKumi) + 1;

  const secondesDansJour = ((secondes % SECONDES_PAR_JOUR) + SECONDES_PAR_JOUR) % SECONDES_PAR_JOUR;
  const estNuit = secondesDansJour >= SECONDES_PAR_JOUR / 2;

  return {
    jourTotal,
    jourDansLonas,
    lonasTotal,
    lonasDansKumi,
    kumiIndex,
    kumiLabel: KUMIS[kumiIndex],
    estNuit,
  };
}
