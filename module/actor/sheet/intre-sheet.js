import { RACES } from "../../common/data-races.js";
import CharacterWizard from "../character-wizard.js";
import { ouvrirDialogueLancerSort } from "../../common/magic.js";
import { SPHERES } from "../../common/data-spheres.js";
import { asArray } from "../../common/utils.js";

export default class IntreActorSheet extends foundry.appv1.sheets.ActorSheet {
  constructor(...args) {
    super(...args);
    this.options.submitOnClose = true;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      height: 820,
      width: 640,
      resizable: true,
      template: "systems/insectopia/templates/actor/intre.html",
      classes: ["insectopia", "sheet", "actor", "intre"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "caracteristiques" }],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
    });
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.system = context.actor.system;
    context.flags = context.actor.flags;
    context.editable = this.isEditable;
    context.owner = this.actor.isOwner;
    context.isGm = game.user.isGM;
    context.unlocked = this.actor.getFlag(game.system.id, "SheetUnlocked");
    context.creationTerminee = this.actor.getFlag(game.system.id, "creationTerminee");

    context.historiquehtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.identite.historique,
      { async: false }
    );
    context.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.identite.description,
      { async: false }
    );

    // Liste à plat des caractéristiques + compétences, pour un affichage
    // simple en tableau côté template.
context.caracteristiquesListe = Object.entries(this.actor.system.caracteristiques).filter(([key]) => key).map(([key, carac]) => ({
      key,
      ...carac,
      competencesListe:
        key === "caste"
          ? asArray(carac.competences) // tableau libre pour Caste
          : Object.entries(carac.competences).map(([ckey, comp]) => ({ key: ckey, ...comp })),
    }));

    context.armes = this.actor.items.filter((i) => i.type === "arme");
    context.armures = this.actor.items.filter((i) => i.type === "armure");
    context.capacitesItems = this.actor.items.filter((i) => i.type === "capacite");
    context.objets = this.actor.items.filter((i) => i.type === "objet");
    context.poidsTotalObjets = this.actor.getPoidsTotalObjets();
    context.poidsPorte = this.actor.getPoidsPorte();
    context.racesListe = Object.entries(RACES).map(([key, race]) => ({ key, label: race.label }));
    context.spheresListe = Object.entries(SPHERES).map(([key, sphere]) => ({ key, label: sphere.label }));

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));

    html.find(".caract-roll").click(this._onCaracRoll.bind(this));
    html.find(".comp-roll").click(this._onCompRoll.bind(this));
    html.find(".chance-roll").click(this._onChanceRoll.bind(this));
    html.find(".init-roll").click(this._onInitRoll.bind(this));
    html.find(".attack-roll").click(this._onAttackRoll.bind(this));

    html.find(".caste-comp-add").click(this._onCasteCompAdd.bind(this));
    html.find(".caste-comp-remove").click(this._onCasteCompRemove.bind(this));
    html.find(".caste-comp-sphere").change(this._onCasteCompSphereChange.bind(this));

    html.find(".sort-cast-open").click(this._onSortCastOpen.bind(this));

    html.find(".capacite-add").click(this._onCapaciteAdd.bind(this));
    html.find(".capacite-remove").click(this._onCapaciteRemove.bind(this));

    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
    html.find(".item-equip-toggle").change(this._onItemEquipToggle.bind(this));

    html.find(".race-apply").click(this._onRaceApply.bind(this));

    html.find(".character-wizard-open").click(this._onWizardOpen.bind(this));
    html.find(".character-wizard-gm-toggle").click(this._onWizardGmToggle.bind(this));
  }

  /** Lance l'assistant de création de personnage (livre de base p.196-206). */
  async _onWizardOpen(event) {
    event.preventDefault();
    return new CharacterWizard(this.actor).start();
  }

  /**
   * Bascule manuelle, réservée au Deus (MJ), du statut "création
   * terminée" — utile pour un PNJ importé ou un personnage prêt à jouer
   * qui n'est pas passé par l'assistant.
   */
  async _onWizardGmToggle(event) {
    event.preventDefault();
    const actuel = this.actor.getFlag(game.system.id, "creationTerminee");
    const confirmed = await Dialog.confirm({
      title: "Assistant de création",
      content: actuel
        ? `<p>Rouvrir la création de personnage pour ${this.actor.name} (réaffiche le bouton de l'assistant) ?</p>`
        : `<p>Marquer la création de ${this.actor.name} comme terminée (masque le bouton de l'assistant) ?</p>`,
    });
    if (!confirmed) return;
    if (actuel) await this.actor.unsetFlag(game.system.id, "creationTerminee");
    else await this.actor.setFlag(game.system.id, "creationTerminee", true);
    this.render(false);
  }

  async _onSheetChangelock(event) {
    event.preventDefault();
    const flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    flagData
      ? await this.actor.unsetFlag(game.system.id, "SheetUnlocked")
      : await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");
    await this.actor.sheet.render(true);
  }

  async _onCaracRoll(event) {
    event.preventDefault();
    const caracKey = event.currentTarget.dataset.carac;
    return this.actor.check(caracKey, null);
  }

  async _onCompRoll(event) {
    event.preventDefault();
    const caracKey = event.currentTarget.dataset.carac;
    const compKey = event.currentTarget.dataset.comp;
    return this.actor.check(caracKey, compKey);
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
    const competenceCombat = event.currentTarget.dataset.competence; // melee | tir | predateur
    return this.actor.attack(competenceCombat);
  }

  /**
   * Ajoute une compétence de Caste libre (deux, en général, cf. livret
   * p.27 : Blocage/Fureur, Essaim/Courtoisie, Air/Terre, etc.)
   */
  async _onCasteCompAdd(event) {
    event.preventDefault();
    const competences = foundry.utils.duplicate(asArray(this.actor.system.caracteristiques.caste.competences));
    competences.push({ label: "Nouvelle compétence", value: 1 });
    await this.actor.update({ "system.caracteristiques.caste.competences": competences });
  }

  async _onCasteCompRemove(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.dataset.index);
    const competences = foundry.utils.duplicate(asArray(this.actor.system.caracteristiques.caste.competences));
    competences.splice(index, 1);
    await this.actor.update({ "system.caracteristiques.caste.competences": competences });
  }

  /**
   * Tague (ou détague) manuellement une compétence de Caste comme Sphère
   * de magie connue (livre p.267) — nécessaire quand le libellé décrit un
   * choix parmi plusieurs sphères ("au choix parmi ..."), qu'applyCaste()
   * ne peut pas déduire automatiquement, ou pour une "Sphère de magie"
   * générique ajoutée librement à l'étape 4 du wizard.
   */
  async _onCasteCompSphereChange(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.dataset.index);
    const competences = foundry.utils.duplicate(asArray(this.actor.system.caracteristiques.caste.competences));
    const sphereKey = event.currentTarget.value;
    if (sphereKey) competences[index].sphere = sphereKey;
    else delete competences[index].sphere;
    await this.actor.update({ "system.caracteristiques.caste.competences": competences });
  }

  /** Ouvre la boîte de dialogue de lancer de sort (livre p.262-276). */
  async _onSortCastOpen(event) {
    event.preventDefault();
    return ouvrirDialogueLancerSort(this.actor);
  }

  /**
   * Ajoute une capacité spéciale (de race ou de caste, cf. livret p.27-28 :
   * Pince, Vitesse surnaturelle, Pestilence, Antennes ramifiées, etc.)
   */
  async _onCapaciteAdd(event) {
    event.preventDefault();
    const capacites = foundry.utils.duplicate(this.actor.system.identite.capacites);
    capacites.push({ label: "Nouvelle capacité", description: "" });
    await this.actor.update({ "system.identite.capacites": capacites });
  }

  async _onCapaciteRemove(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.dataset.index);
    const capacites = foundry.utils.duplicate(this.actor.system.identite.capacites);
    capacites.splice(index, 1);
    await this.actor.update({ "system.identite.capacites": capacites });
  }

  /** Crée un nouvel Item embarqué du type indiqué (data-type: arme|armure|capacite). */
  async _onItemCreate(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    const nomParDefaut = { arme: "Nouvelle arme", armure: "Nouvelle armure", capacite: "Nouvelle capacité", objet: "Nouvel objet" };
    const itemData = { name: nomParDefaut[type] ?? "Nouvel objet", type };
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  _onItemEdit(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) this.actor.deleteEmbeddedDocuments("Item", [item.id]);
  }

  _onItemEquipToggle(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) item.update({ "system.equipee": event.currentTarget.checked });
  }

  async _onRaceApply(event) {
    event.preventDefault();
    const raceKey = this.element.find("#raceSelect")[0]?.value;
    if (!raceKey) return;
    const confirmed = await Dialog.confirm({
      title: "Appliquer la race",
      content:
        "<p>Ceci va écraser les 7 caractéristiques du personnage avec les valeurs de la race choisie, et ajouter ses capacités natives (livre de base p.198-201). Continuer ?</p>",
    });
    if (confirmed) return this.actor.applyRace(raceKey);
  }
}
