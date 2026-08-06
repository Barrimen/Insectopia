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
    const inactif = (c) => c.defeated || c.actor?.statuses?.has("unconscious");
    if (inactif(a) && !inactif(b)) return 1;
    if (inactif(b) && !inactif(a)) return -1;

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
    // Garde-fou : this.combatant (= this.turns[this.turn]) peut être
    // undefined juste après un rechargement de page si this.turns n'a pas
    // fini de se recalculer, ou s'il n'y a aucun combattant en lice. On
    // force un recalcul et on abandonne proprement plutôt que de planter,
    // au lieu de laisser passer l'exception d'origine :
    // "Cannot read properties of undefined (reading 'getState')".
    this.setupTurns();
    let current = this.combatant;
    if (!current) {
      console.warn(
        "Insectopia | nextTurn() : aucun combattant courant valide (this.combatant est undefined). " +
          "Vérifie qu'au moins un combattant a tiré son Initiative, ou recharge la page si le souci persiste."
      );
      ui.notifications?.warn("Impossible de passer au tour suivant : aucun combattant valide trouvé.");
      return this;
    }

    // Saute automatiquement les combattants inconscients ou morts : ils ne
    // peuvent pas agir, mais on doit tout de même consommer leur Blatte
    // (silencieusement, sans les proposer au Deus) pour que le tour
    // avance normalement jusqu'au prochain combattant valide.
    let garde = 0;
    const estInactif = (c) => c.defeated || c.actor?.statuses?.has("unconscious");
    while (current && estInactif(current) && garde < this.turns.length) {
      await current.depenserBlatte();
      this.setupTurns();
      current = this.combatant;
      garde += 1;
    }
    if (!current || estInactif(current)) {
      ui.notifications?.info("Plus aucun combattant valide ne peut agir ce round.");
      return this;
    }

    const idAvant = current.id;
    await this._pushHistory(current.getState());
    await current.depenserBlatte();
    if (current.initiative <= 0) return this.nextRound();
    const resultat = await this.update({ turn: 0 });
    // Annonce uniquement dans le cas normal (pas juste après un
    // changement de round, où personne n'a encore tiré d'Initiative —
    // l'annonce n'aurait alors aucun sens, "0 action restante" pour tout
    // le monde).
    await this._annoncerTour(idAvant);
    return resultat;
  }

  /**
   * Poste un message de chat annonçant à qui c'est le tour et combien
   * d'actions (Blattes) il lui reste — indicateur demandé par Obe, sous
   * forme de message plutôt que de bandeau flottant (cohérent avec le
   * reste du système, tout passe par le chat). Ne poste rien si le
   * combattant actif n'a pas changé (ex : plusieurs actions d'affilée
   * pour le même combattant grâce à une bonne Initiative).
   */
  async _annoncerTour(idCombattantPrecedent) {
    this.setupTurns();
    const actuel = this.combatant;
    if (!actuel || actuel.id === idCombattantPrecedent) return;
    const initblattes = actuel.getFlag("insectopia", "initblattes");
    const restant = initblattes?.nbActions ?? 0;
    ChatMessage.create({
      content: `<strong>C'est au tour de ${actuel.name}</strong> — ${restant} action(s) restante(s) ce round.`,
      speaker: { alias: "Combat" },
    });
  }

  /** @override */
  async nextRound() {
    await this._pushHistory(this.combatants.map((c) => c.getState()));
    await this._pushHistory("newRound");
    await this.resetAll();
    // Compte à rebours d'hémorragie (livret) : un round de plus sans soins
    // pour chaque combattant inconscient présent dans ce combat.
    for (const c of this.combatants) {
      await c.actor?.tickHemorragie?.();
    }
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
      c.updateSource({ initiative: null, "flags.insectopia.initblattes": initblattes, "flags.insectopia.armesUtilisees": [] });
    }
    await this.update({ turn: 0, combatants: this.combatants.toObject() }, { diff: false });
    // updateSource() + update() groupé ci-dessus ne passe pas par
    // _onUpdateDescendantDocuments (réservé aux mises à jour normales de
    // Combattant) : on force donc explicitement le retri du tracker ici,
    // sinon l'ordre du round précédent reste figé tant qu'aucune autre
    // mise à jour de Combattant n'a lieu.
    this.setupTurns();
    if (this.active) this.collection.render();
    return this;
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