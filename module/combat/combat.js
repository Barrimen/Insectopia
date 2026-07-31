/**
 * InsectopiaCombat
 * ---------------------------------------------------------------------
 * Reprend le mécanisme d'OmegaCombat : chaque combattant tire un nombre
 * de Blattes égal à son Initiative (Activité − encombrement) en début de
 * tour. Le Deus appelle ensuite les couleurs dans l'ordre rouge → verte →
 * bleue → blanche → noire (livret p.29) ; à chaque fois qu'un combattant
 * agit, il "dépense" sa meilleure Blatte restante et l'initiative est
 * recalculée pour refléter la Blatte suivante.
 *
 * Différences avec Omega : pas de paliers "rouge+" / "noire-" (spécifiques
 * au système de Diodes d'Omega, absents des règles d'Insectopia).
 */
export default class InsectopiaCombat extends Combat {
  /** @override */
  _sortCombatants(a, b) {
    if (a.defeated) return 1;
    if (b.defeated) return -1;

    const initA = a.getFlag("insectopia", "initblattes");
    const initB = b.getFlag("insectopia", "initblattes");
    if (initA && initB) {
      const diff = initB.initEval - initA.initEval;
      if (diff !== 0) return diff;
    }
    return a.tokenId - b.tokenId;
  }

  _onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId) {
    this.setupTurns();
    if (game.user.id === userId) this.update({ turn: 0 });
    else this.updateSource({ turn: 0 });
    if (this.active && options.render !== false) this.collection.render();
  }

  /** @override */
  async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
    ids = typeof ids === "string" ? [ids] : ids;

    const ignorerTirage = game.settings.get("insectopia", "ignorerTirageInitiative");

    for (const combatantId of ids) {
      const c = this.combatants.get(combatantId);
      if (!c) continue;
      const actor = game.actors.get(c.actorId);
      if (!actor) continue;

      let initBlattes;
      if (ignorerTirage) {
        // Règle optionnelle (livret p.29) : le Deus peut ignorer le tirage
        // de Blattes et faire jouer en premier l'initiative la plus haute.
        initBlattes = {
          rouge: 0, verte: 0, bleue: 0, blanche: 0, noire: 0,
          nbActions: 1,
          initEval: actor.system.combat.initiative,
        };
      } else {
        const resultat = await actor.rollInitiative();
        initBlattes = {
          rouge: resultat.blattesParCouleur.rouge,
          verte: resultat.blattesParCouleur.verte,
          bleue: resultat.blattesParCouleur.bleue,
          blanche: resultat.blattesParCouleur.blanche,
          noire: resultat.blattesParCouleur.noire,
          nbActions: resultat.nbBlattes,
          initEval: 0,
        };
        initBlattes.initEval = c.calculerInitEval(initBlattes);
      }

      await c.update({ "flags.insectopia.initblattes": initBlattes, initiative: initBlattes.initEval });
    }
    return this;
  }

  /** @override */
  async startCombat() {
    if (game.user.isGM) await this.setFlag("insectopia", "turnHistory", []);
    return super.startCombat();
  }

  /** @override */
  async nextTurn() {
    await this._pushHistory(this.combatant.getState());
    await this.combatant.depenserBlatte();
    if (this.combatant.initiative <= 0) return this.nextRound();
    return this.update({ turn: 0 });
  }

  /** @override */
  async nextRound() {
    await this._pushHistory(this.combatants.map((c) => c.getState()));
    await this._pushHistory("newRound");
    await this.resetAll();
    return this.update({ round: this.round + 1, turn: 0 }, { advanceTime: CONFIG.time.roundTime });
  }

  /** @override */
  async previousTurn() {
    const data = await this._popHistory();
    if (data == null || data === "newRound") return this.previousRound();
    const combatant = this.getEmbeddedDocument("Combatant", data.id);
    await combatant.setState(data);
    return this.update({ turn: 0 });
  }

  /** @override */
  async previousRound() {
    const round = Math.max(this.round - 1, 0);
    if (round > 0) {
      const turnHistory = this.getFlag("insectopia", "turnHistory").slice();
      let data = turnHistory.pop();
      let roundState;
      if (Array.isArray(data)) {
        roundState = data;
      } else if (data === "newRound") {
        roundState = turnHistory.pop();
      } else {
        const index = turnHistory.lastIndexOf("newRound");
        turnHistory.splice(index);
        roundState = turnHistory.pop();
      }
      await this.setFlag("insectopia", "turnHistory", turnHistory);
      for (const c of roundState) {
        const combatant = this.getEmbeddedDocument("Combatant", c.id);
        await combatant.setState(c);
      }
      return this.update({ round, turn: 0 }, { advanceTime: -CONFIG.time.roundTime });
    }
  }

  /** Réinitialise l'initiative de tous les combattants (nouveau tour). */
  async resetAll() {
    const initblattes = { rouge: 0, verte: 0, bleue: 0, blanche: 0, noire: 0, nbActions: 0, initEval: 0 };
    for (const c of this.combatants) {
      c.updateSource({ initiative: null, "flags.insectopia.initblattes": initblattes });
    }
    return this.update({ turn: 0, combatants: this.combatants.toObject() }, { diff: false });
  }

  async _pushHistory(data) {
    const turnHistory = this.getFlag("insectopia", "turnHistory").slice();
    turnHistory.push(data);
    return this.setFlag("insectopia", "turnHistory", turnHistory);
  }

  async _popHistory() {
    const turnHistory = this.getFlag("insectopia", "turnHistory").slice();
    const result = turnHistory.pop();
    await this.setFlag("insectopia", "turnHistory", turnHistory);
    return result;
  }
}
