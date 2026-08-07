import {
  calculerDate,
  TABLE_METEO,
  METEO_DEFAUT,
  LONAS_PAR_KUMI_DEFAUT,
  SECONDES_PAR_JOUR,
  JOURS_PAR_LONAS,
  KUMI_HIVER_INDEX,
} from "./data-calendrier.js";

/**
 * Calendrier d'Entoma
 * ---------------------------------------------------------------------
 * Pilote `game.time.worldTime` (API Foundry native) pour dater les
 * scénarios (lonas/kumi/jour-nuit, livre p.278-279) et calcule le
 * modificateur météo Activité/Métabolisme (p.279), sans jamais appliquer
 * automatiquement de blocage ou de conséquence directe sur les acteurs
 * (choix explicite d'Obe : indicateurs uniquement, la main reste au Deus
 * via le widget ou les flags de fiche).
 *
 * Point d'extension : chaque avancée du temps déclenche un hook générique
 * `insectopia.calendrierChange` (voir `registerCalendrierHooks` ci-dessous),
 * utilisable tel quel par un futur système lié au temps (ex. évolution
 * mensuelle de la Souillure) sans avoir à toucher à ce fichier. Ce hook
 * n'existait pas dans le code avant ce chantier (aucun `souillure.js` ni
 * réglage `secondesParLonas` trouvés dans le dépôt au moment d'écrire ceci).
 */

/** Enregistre les réglages monde liés au calendrier. Appelé une fois à l'init. */
export function registerCalendrierSettings() {
  game.settings.register("insectopia", "calendrierLonasParKumi", {
    name: "Durée d'un kumi (en lonas)",
    hint:
      "Livre p.278 : un kumi dure « en moyenne trois lonas », mais sa durée " +
      "varie selon les royaumes — aucune valeur fixe n'est donnée. Réglage " +
      "ajustable (House Rule), 3 par défaut.",
    scope: "world",
    config: true,
    type: Number,
    default: LONAS_PAR_KUMI_DEFAUT,
  });

  game.settings.register("insectopia", "calendrierMeteoActuelle", {
    name: "Météo actuelle (interne, gérée via le widget Calendrier)",
    scope: "world",
    config: false,
    type: String,
    default: METEO_DEFAUT,
  });

  game.settings.register("insectopia", "calendrierBonusNuitPheromones", {
    name: "House Rule : bonus nocturne aux Phéromones",
    hint:
      "Livre p.278 : « la nuit, les perceptions phéromonales sont exacerbées », " +
      "sans chiffrage donné par le livre. Applique ici un +1 informatif à la " +
      "compétence Phéromones la nuit (affichage uniquement pour l'instant, " +
      "pas encore branché sur les jets — voir STATUS.md).",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
}

/** Relance un rendu de tout widget Calendrier ouvert + notifie les systèmes tiers. */
export function registerCalendrierHooks() {
  Hooks.on("updateWorldTime", () => {
    Hooks.callAll("insectopia.calendrierChange", getDateActuelle());
  });
}

/**
 * État complet et actuel du calendrier (date, kumi, météo, jour/nuit).
 * @returns {object}
 */
export function getDateActuelle() {
  const worldTime = game.time.worldTime ?? 0;
  const lonasParKumi = game.settings.get("insectopia", "calendrierLonasParKumi");
  const date = calculerDate(worldTime, lonasParKumi);

  const meteoKey = game.settings.get("insectopia", "calendrierMeteoActuelle");
  const meteo = TABLE_METEO[meteoKey] ? { key: meteoKey, ...TABLE_METEO[meteoKey] } : { key: METEO_DEFAUT, ...TABLE_METEO[METEO_DEFAUT] };

  const bonusNuitPheromones = date.estNuit && game.settings.get("insectopia", "calendrierBonusNuitPheromones") ? 1 : 0;

  return {
    ...date,
    meteo,
    lonasParKumi,
    estHiver: date.kumiIndex === KUMI_HIVER_INDEX,
    bonusNuitPheromones,
  };
}

/** Avance le temps d'un nombre de jours entiers. GM uniquement. */
export async function avancerJours(nombre = 1) {
  if (!game.user.isGM) return;
  await game.time.advance(nombre * SECONDES_PAR_JOUR);
}

/** Avance le temps d'un lonas entier (28 jours). GM uniquement. */
export async function avancerLonas(nombre = 1) {
  if (!game.user.isGM) return;
  await game.time.advance(nombre * JOURS_PAR_LONAS * SECONDES_PAR_JOUR);
}

/**
 * Force le passage au kumi suivant : saute directement au premier jour du
 * prochain kumi (utile pour ne pas avoir à cliquer "jour suivant" des
 * dizaines de fois). GM uniquement.
 */
export async function forcerKumiSuivant() {
  if (!game.user.isGM) return;
  const lonasParKumi = game.settings.get("insectopia", "calendrierLonasParKumi");
  const etat = getDateActuelle();
  const lonasRestants = lonasParKumi - (etat.lonasDansKumi - 1);
  const joursRestantsLonasCourant = JOURS_PAR_LONAS - (etat.jourDansLonas - 1);
  const joursASauter = joursRestantsLonasCourant + (lonasRestants - 1) * JOURS_PAR_LONAS;
  await game.time.advance(joursASauter * SECONDES_PAR_JOUR);
}

/** Définit la météo actuelle (sélection manuelle, cf. note data-calendrier.js). GM uniquement. */
export async function definirMeteo(key) {
  if (!game.user.isGM) return;
  if (!TABLE_METEO[key]) return;
  await game.settings.set("insectopia", "calendrierMeteoActuelle", key);
  Hooks.callAll("insectopia.calendrierChange", getDateActuelle());
}

/** Bascule le flag de diapause hivernale d'un acteur (geste manuel du Deus, jamais automatique). */
export async function basculerDiapauseActeur(actor) {
  if (!game.user.isGM || !actor) return;
  const actuel = actor.getFlag("insectopia", "diapause") ?? false;
  await actor.setFlag("insectopia", "diapause", !actuel);
}
