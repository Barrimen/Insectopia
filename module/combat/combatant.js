/**
 * InsectopiaCombatant
 * ---------------------------------------------------------------------
 * Chaque combattant conserve, dans le flag "initblattes", le décompte de
 * ses Blattes d'initiative restantes pour le tour. calculerInitEval()
 * transforme la meilleure couleur restante en une valeur numérique
 * utilisée pour trier le combat tracker (rouge > verte > bleue > blanche
 * > noire). depenserBlatte() est appelé à chaque changement de tour :
 * la meilleure Blatte restante est consommée, ce qui simule le fait que
 * le personnage vient d'agir à ce niveau d'initiative.
 */
export default class InsectopiaCombatant extends Combatant {
  _onCreate(data, options, userID) {
    super._onCreate(data, options, userID);
    if (game.user.isGM) {
      this.setFlag("insectopia", "initblattes", {
        rouge: 0, verte: 0, bleue: 0, blanche: 0, noire: 0,
        nbActions: 0,
        initEval: 0,
      });
    }
  }

  /**
   * Valeur numérique de tri à partir de la meilleure couleur restante.
   * Les paliers (100/80/60/40/20) ne servent qu'au tri de l'ordre
   * d'action ; leur valeur absolue n'a pas de signification de jeu.
   */
  calculerInitEval(initBlattes) {
    if (initBlattes.rouge) return 100;
    if (initBlattes.verte) return 80;
    if (initBlattes.bleue) return 60;
    if (initBlattes.blanche) return 40;
    if (initBlattes.noire) return 20;
    return 0;
  }

  /**
   * Le combattant vient d'agir : on retire sa meilleure Blatte restante
   * et on recalcule son rang d'initiative pour le reste du tour.
   */
  async depenserBlatte() {
    const initblattes = this.getFlag("insectopia", "initblattes");
    if (initblattes.rouge > 0) initblattes.rouge -= 1;
    else if (initblattes.verte > 0) initblattes.verte -= 1;
    else if (initblattes.bleue > 0) initblattes.bleue -= 1;
    else if (initblattes.blanche > 0) initblattes.blanche -= 1;
    else if (initblattes.noire > 0) initblattes.noire -= 1;
    else return this.update({ initiative: 0 });

    initblattes.nbActions = Math.max(0, initblattes.nbActions - 1);
    initblattes.initEval = this.calculerInitEval(initblattes);
    // Fait progresser le rechargement des armes à distance équipées
    // (livre de base p.240) : voir base-actor.js#tickRechargesArmes pour
    // l'hypothèse d'automatisation retenue.
    await this.actor?.tickRechargesArmes?.();
    return this.update({ "flags.insectopia.initblattes": initblattes, initiative: initblattes.initEval });
  }

  /**
   * Correction manuelle (le Deus peut ajuster une Blatte de couleur au
   * combat tracker, par exemple si un joueur a utilisé une Blatte de
   * chance pour améliorer/dégrader son initiative). sens=1 améliore,
   * sens=0 dégrade.
   */
  async ajusterBlatte(sens) {
    const initblattes = this.getFlag("insectopia", "initblattes");
    const ordre = ["noire", "blanche", "bleue", "verte", "rouge"];
    for (let i = 0; i < ordre.length; i++) {
      if (initblattes[ordre[i]] > 0) {
        initblattes[ordre[i]] -= 1;
        const nouvelIndex = sens ? Math.min(i + 1, ordre.length - 1) : Math.max(i - 1, 0);
        initblattes[ordre[nouvelIndex]] += 1;
        break;
      }
    }
    initblattes.initEval = this.calculerInitEval(initblattes);
    return this.update({ "flags.insectopia.initblattes": initblattes, initiative: initblattes.initEval });
  }

  async setState(data) {
    return this.update({ initiative: data.initiative, ["flags.insectopia.initblattes"]: data.initblattes });
  }

  getState() {
    return { id: this.id, initiative: this.initiative, initblattes: this.getFlag("insectopia", "initblattes") };
  }
}
