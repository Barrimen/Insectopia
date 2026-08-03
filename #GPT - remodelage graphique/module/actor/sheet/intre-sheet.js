import { RACES } from "../../common/data-races.js";
import CharacterWizard from "../character-wizard.js";

const CHARACTERISTIC_ORDER = [
  "antenne",
  "esprit",
  "aile",
  "mandibule",
  "chitine",
  "temperature",
  "caste",
];

const ITEM_DEFAULT_NAMES = Object.freeze({
  arme: "Nouvelle arme",
  armure: "Nouvelle armure",
  capacite: "Nouvelle capacité",
});

/**
 * Feuille principale des personnages Intres.
 *
 * Cette classe prépare les données nécessaires au template, enregistre les
 * interactions de la feuille et délègue les règles de jeu à l'Actor.
 */
export default class IntreActorSheet extends foundry.appv1.sheets.ActorSheet {
  constructor(...args) {
    super(...args);
    this.options.submitOnClose = true;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 1040,
      height: 820,
      resizable: true,
      template: "systems/insectopia/templates/actor/intre.html",
      classes: ["insectopia", "sheet", "actor", "intre"],
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "caracteristiques",
        },
      ],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
    });
  }

  /** @override */
  async getData(options = {}) {
    const context = await super.getData(options);
    const system = context.actor.system;

    context.system = system;
    context.flags = context.actor.flags;
    context.editable = this.isEditable;
    context.owner = this.actor.isOwner;
    context.isGm = game.user.isGM;
    context.unlocked = Boolean(
      this.actor.getFlag(game.system.id, "SheetUnlocked")
    );
    context.creationTerminee = Boolean(
      this.actor.getFlag(game.system.id, "creationTerminee")
    );

    context.historiquehtml =
      await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        system.identite?.historique ?? "",
        { async: false }
      );

    context.descriptionhtml =
      await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        system.identite?.description ?? "",
        { async: false }
      );

    context.caracteristiquesListe = this._prepareCharacteristics(
      system.caracteristiques ?? {}
    );

    context.armes = this.actor.items.filter((item) => item.type === "arme");
    context.armures = this.actor.items.filter((item) => item.type === "armure");
    context.capacitesItems = this.actor.items.filter(
      (item) => item.type === "capacite"
    );

    context.racesListe = Object.entries(RACES).map(([key, race]) => ({
      key,
      label: race.label,
    }));

    return context;
  }

  /**
   * Prépare les caractéristiques dans un ordre stable pour l'interface.
   *
   * Les six caractéristiques principales suivent la disposition retenue pour
   * la nouvelle feuille. La Caste reste placée à la fin, car sa liste de
   * compétences est libre.
   *
   * @param {object} characteristics Données de l'Actor.
   * @returns {Array<object>} Caractéristiques prêtes pour Handlebars.
   * @private
   */
  _prepareCharacteristics(characteristics) {
    return CHARACTERISTIC_ORDER
      .filter((key) => characteristics[key])
      .map((key) => {
        const characteristic = characteristics[key];
        const competences =
          key === "caste"
            ? Array.isArray(characteristic.competences)
              ? characteristic.competences
              : []
            : Object.entries(characteristic.competences ?? {}).map(
                ([competenceKey, competence]) => ({
                  key: competenceKey,
                  ...competence,
                })
              );

        return {
          key,
          ...characteristic,
          competencesListe: competences,
        };
      });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".sheet-change-lock").on(
      "click",
      this._onSheetChangeLock.bind(this)
    );

    html.find(".caract-roll").on("click", this._onCaracRoll.bind(this));
    html.find(".comp-roll").on("click", this._onCompRoll.bind(this));
    html.find(".chance-roll").on("click", this._onChanceRoll.bind(this));
    html.find(".init-roll").on("click", this._onInitRoll.bind(this));
    html.find(".attack-roll").on("click", this._onAttackRoll.bind(this));

    html.find(".caste-comp-add").on(
      "click",
      this._onCasteCompAdd.bind(this)
    );
    html.find(".caste-comp-remove").on(
      "click",
      this._onCasteCompRemove.bind(this)
    );

    html.find(".capacite-add").on("click", this._onCapaciteAdd.bind(this));
    html.find(".capacite-remove").on(
      "click",
      this._onCapaciteRemove.bind(this)
    );

    html.find(".item-create").on("click", this._onItemCreate.bind(this));
    html.find(".item-edit").on("click", this._onItemEdit.bind(this));
    html.find(".item-delete").on("click", this._onItemDelete.bind(this));
    html.find(".item-equip-toggle").on(
      "change",
      this._onItemEquipToggle.bind(this)
    );

    html.find(".race-apply").on("click", this._onRaceApply.bind(this));
    html.find(".character-wizard-open").on(
      "click",
      this._onWizardOpen.bind(this)
    );
    html.find(".character-wizard-gm-toggle").on(
      "click",
      this._onWizardGmToggle.bind(this)
    );
  }

  /**
   * Lance l'assistant de création de personnage.
   */
  async _onWizardOpen(event) {
    event.preventDefault();
    return new CharacterWizard(this.actor).start();
  }

  /**
   * Bascule manuellement le statut de création du personnage.
   * Cette action est réservée au Deus.
   */
  async _onWizardGmToggle(event) {
    event.preventDefault();

    if (!game.user.isGM) return;

    const creationTerminee = Boolean(
      this.actor.getFlag(game.system.id, "creationTerminee")
    );

    const confirmed = await Dialog.confirm({
      title: "Assistant de création",
      content: creationTerminee
        ? `<p>Rouvrir la création de personnage pour <strong>${this.actor.name}</strong> ?</p>`
        : `<p>Marquer la création de <strong>${this.actor.name}</strong> comme terminée ?</p>`,
    });

    if (!confirmed) return;

    if (creationTerminee) {
      await this.actor.unsetFlag(game.system.id, "creationTerminee");
    } else {
      await this.actor.setFlag(game.system.id, "creationTerminee", true);
    }

    this.render(false);
  }

  async _onSheetChangeLock(event) {
    event.preventDefault();

    const isUnlocked = Boolean(
      this.actor.getFlag(game.system.id, "SheetUnlocked")
    );

    if (isUnlocked) {
      await this.actor.unsetFlag(game.system.id, "SheetUnlocked");
    } else {
      await this.actor.setFlag(
        game.system.id,
        "SheetUnlocked",
        "SheetUnlocked"
      );
    }

    await this.actor.sheet.render(true);
  }

  async _onCaracRoll(event) {
    event.preventDefault();

    const characteristicKey = event.currentTarget.dataset.carac;
    if (!characteristicKey) return;

    return this.actor.check(characteristicKey, null);
  }

  async _onCompRoll(event) {
    event.preventDefault();

    const characteristicKey = event.currentTarget.dataset.carac;
    const competenceKey = event.currentTarget.dataset.comp;

    if (!characteristicKey || !competenceKey) return;

    return this.actor.check(characteristicKey, competenceKey);
  }

  async _onChanceRoll(event) {
    event.preventDefault();
    return this.actor.chanceRoll();
  }

  async _onInitRoll(event) {
    event.preventDefault();
    return this.actor.rollInitiative();
  }

  async _onAttackRoll(event) {
    event.preventDefault();

    const competenceCombat = event.currentTarget.dataset.competence;
    if (!competenceCombat) return;

    return this.actor.attack(competenceCombat);
  }

  async _onCasteCompAdd(event) {
    event.preventDefault();

    const current = this.actor.system.caracteristiques?.caste?.competences;
    const competences = foundry.utils.duplicate(
      Array.isArray(current) ? current : []
    );

    competences.push({
      label: "Nouvelle compétence",
      value: 1,
    });

    await this.actor.update({
      "system.caracteristiques.caste.competences": competences,
    });
  }

  async _onCasteCompRemove(event) {
    event.preventDefault();

    const index = Number.parseInt(event.currentTarget.dataset.index, 10);
    if (!Number.isInteger(index)) return;

    const current = this.actor.system.caracteristiques?.caste?.competences;
    const competences = foundry.utils.duplicate(
      Array.isArray(current) ? current : []
    );

    if (index < 0 || index >= competences.length) return;

    competences.splice(index, 1);

    await this.actor.update({
      "system.caracteristiques.caste.competences": competences,
    });
  }

  async _onCapaciteAdd(event) {
    event.preventDefault();

    const current = this.actor.system.identite?.capacites;
    const capacites = foundry.utils.duplicate(
      Array.isArray(current) ? current : []
    );

    capacites.push({
      label: "Nouvelle capacité",
      description: "",
    });

    await this.actor.update({
      "system.identite.capacites": capacites,
    });
  }

  async _onCapaciteRemove(event) {
    event.preventDefault();

    const index = Number.parseInt(event.currentTarget.dataset.index, 10);
    if (!Number.isInteger(index)) return;

    const current = this.actor.system.identite?.capacites;
    const capacites = foundry.utils.duplicate(
      Array.isArray(current) ? current : []
    );

    if (index < 0 || index >= capacites.length) return;

    capacites.splice(index, 1);

    await this.actor.update({
      "system.identite.capacites": capacites,
    });
  }

  async _onItemCreate(event) {
    event.preventDefault();

    const type = event.currentTarget.dataset.type;
    if (!Object.hasOwn(ITEM_DEFAULT_NAMES, type)) return;

    const itemData = {
      name: ITEM_DEFAULT_NAMES[type],
      type,
    };

    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  _onItemEdit(event) {
    event.preventDefault();

    const itemId = event.currentTarget.dataset.itemId;
    if (!itemId) return;

    this.actor.items.get(itemId)?.sheet.render(true);
  }

  async _onItemDelete(event) {
    event.preventDefault();

    const itemId = event.currentTarget.dataset.itemId;
    const item = itemId ? this.actor.items.get(itemId) : null;
    if (!item) return;

    const confirmed = await Dialog.confirm({
      title: "Supprimer l’objet",
      content: `<p>Supprimer définitivement <strong>${item.name}</strong> de la feuille ?</p>`,
    });

    if (!confirmed) return;

    return this.actor.deleteEmbeddedDocuments("Item", [item.id]);
  }

  async _onItemEquipToggle(event) {
    event.preventDefault();

    const itemId = event.currentTarget.dataset.itemId;
    const item = itemId ? this.actor.items.get(itemId) : null;
    if (!item) return;

    return item.update({
      "system.equipee": Boolean(event.currentTarget.checked),
    });
  }

  async _onRaceApply(event) {
    event.preventDefault();

    const raceKey = this.element.find("#raceSelect")[0]?.value;
    if (!raceKey || !Object.hasOwn(RACES, raceKey)) return;

    const confirmed = await Dialog.confirm({
      title: "Appliquer la race",
      content:
        "<p>Cette action remplacera les sept caractéristiques du personnage par les valeurs de la race choisie et ajoutera ses capacités natives. Continuer ?</p>",
    });

    if (!confirmed) return;

    return this.actor.applyRace(raceKey);
  }
}
