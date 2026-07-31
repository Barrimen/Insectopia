export default class IntreItemSheet extends foundry.appv1.sheets.ItemSheet {
  constructor(...args) {
    super(...args);
    this.options.submitOnClose = true;
  }

  get template() {
    return `systems/insectopia/templates/item/${this.item.type}.html`;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 480,
      height: 420,
      resizable: true,
      classes: ["insectopia", "sheet", "item"],
    });
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.system = context.item.system;
    context.editable = this.isEditable;
    context.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      { async: false }
    );
    return context;
  }
}
