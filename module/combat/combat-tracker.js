export default class InsectopiaCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  static DEFAULT_OPTIONS = {
    actions: {
      blatteup: InsectopiaCombatTracker.#onBlatteup,
    },
  };

  /** @override */
  static PARTS = {
    header: { template: "templates/sidebar/tabs/combat/header.hbs" },
    tracker: { template: "systems/insectopia/templates/combat/tracker.hbs", scrollable: [""] },
    footer: { template: "templates/sidebar/tabs/combat/footer.hbs" },
  };

  /** @override */
  async _prepareTurnContext(combat, combatant, index) {
    const turn = await super._prepareTurnContext(combat, combatant, index);
    turn.initblattes = combatant.getFlag("insectopia", "initblattes");
    // Armes encore en cours de rechargement (livre p.240) : petit badge
    // dans le tracker pour rappeler que ce combattant ne peut pas encore
    // tirer avec cette arme.
    turn.armesEnRecharge = (combatant.actor?.items ?? [])
      .filter((i) => i.type === "arme" && i.system.equipee && i.system.actionsRechargeRestantes > 0)
      .map((i) => ({ nom: i.name, restant: i.system.actionsRechargeRestantes }));
    return turn;
  }

  static #onBlatteup(...args) {
    return this._onBlatte(...args);
  }

  /**
   * Ajuste manuellement la couleur d'initiative d'un combattant (ex :
   * utilisation d'une Blatte de chance).
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  async _onBlatte(event, target) {
    event.preventDefault();
    const sens = parseInt(target.dataset.field, 10);
    const combat = this.viewed;
    const combatant = combat.combatants.get(target.dataset.combatantId);
    combatant.ajusterBlatte(sens);
  }
}
