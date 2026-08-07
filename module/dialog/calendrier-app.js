import {
  getDateActuelle,
  avancerJours,
  avancerLonas,
  forcerKumiSuivant,
  definirMeteo,
  basculerDiapauseActeur,
} from "../common/calendrier.js";
import { ORDRE_METEO, TABLE_METEO } from "../common/data-calendrier.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

/**
 * CalendrierApp
 * ---------------------------------------------------------------------
 * Widget de calendrier d'Entoma (livre p.278-279). Se ré-affiche
 * automatiquement à chaque avancée du temps (`insectopia.calendrierChange`,
 * cf. common/calendrier.js) tant qu'il reste ouvert.
 *
 * GM : contrôles d'avancement du temps, sélection de la météo actuelle,
 * gestion manuelle de la diapause hivernale par acteur.
 * Joueurs : vue lecture seule (date, kumi, météo, jour/nuit).
 */
export default class CalendrierApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "insectopia-calendrier",
    tag: "form",
    window: { title: "Calendrier d'Entoma", icon: "fas fa-calendar-alt", resizable: true },
    position: { width: 420, height: "auto" },
    actions: {
      "jour-suivant": CalendrierApp.#onJourSuivant,
      "lonas-suivant": CalendrierApp.#onLonasSuivant,
      "kumi-suivant": CalendrierApp.#onKumiSuivant,
      "toggle-diapause": CalendrierApp.#onToggleDiapause,
    },
  };

  static PARTS = {
    corps: { template: "systems/insectopia/templates/dialog/calendrier.html" },
  };

  /** @override */
  async _prepareContext() {
    const etat = getDateActuelle();
    const isGM = game.user.isGM;

    const acteurs = isGM
      ? game.actors
          .filter((a) => a.type === "intre")
          .map((a) => ({ id: a.id, name: a.name, diapause: a.getFlag("insectopia", "diapause") ?? false }))
          .sort((a, b) => a.name.localeCompare(b.name, "fr"))
      : [];

    return {
      isGM,
      etat,
      meteoOptions: ORDRE_METEO.map((key) => ({ key, ...TABLE_METEO[key], selectionnee: key === etat.meteo.key })),
      acteurs,
    };
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    if (!this._hookId) {
      this._hookId = Hooks.on("insectopia.calendrierChange", () => this.render());
    }
    this.element.querySelector("#calendrier-meteo")?.addEventListener("change", async (ev) => {
      await definirMeteo(ev.target.value);
    });
  }

  /** @override */
  async close(options) {
    if (this._hookId) Hooks.off("insectopia.calendrierChange", this._hookId);
    return super.close(options);
  }

  static async #onJourSuivant() {
    await avancerJours(1);
  }

  static async #onLonasSuivant() {
    await avancerLonas(1);
  }

  static async #onKumiSuivant() {
    await forcerKumiSuivant();
  }

  static async #onToggleDiapause(event, target) {
    const actor = game.actors.get(target.dataset.actorId);
    await basculerDiapauseActeur(actor);
    this.render();
  }
}
