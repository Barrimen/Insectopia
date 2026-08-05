const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/**
 * Fiche d'Item (arme, armure, capacité, objet) — migrée vers ApplicationV2
 * (cf. Foundry v13+, la couche de compatibilité `foundry.appv1.*`
 * disparaîtra en v16). Même pattern que IntreActorSheet : template unique
 * par instance choisi dynamiquement selon `item.type` via
 * _configureRenderParts, tag "form" géré nativement par ApplicationV2 (les
 * gabarits ne contiennent donc plus leur propre balise <form>).
 */
export default class IntreItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["insectopia", "sheet", "item"],
    position: { width: 480, height: 420 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      editImage: this.#onEditImage,
    },
  };

  /** @override */
  static PARTS = {
    form: { template: "systems/insectopia/templates/item/objet.html" },
  };

  /** @override */
  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    parts.form = { ...parts.form, template: `systems/insectopia/templates/item/${this.item.type}.html` };
    return parts;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.system = this.item.system;
    context.editable = this.isEditable;
    context.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      { secrets: this.item.isOwner, relativeTo: this.item }
    );
    return context;
  }

  static async #onEditImage(event, target) {
    event.preventDefault();
    const field = target.dataset.field || "img";
    const current = foundry.utils.getProperty(this.item, field);
    const fp = new foundry.applications.apps.FilePicker({
      type: "image",
      current,
      callback: (path) => this.item.update({ [field]: path }),
    });
    return fp.render(true);
  }
}