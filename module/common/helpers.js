/**
 * Handlebars fournit déjà nativement (Foundry v10+) les helpers de
 * sous-expression eq / ne / lt / gt / not / and / or, utilisés tels quels
 * dans les templates (ex: {{#if (ne charImg "...")}}).
 *
 * On ajoute ici seulement les helpers "bloc" à la syntaxe Omega qui sont
 * repris dans les templates de feuille pour rester cohérent d'un fichier
 * à l'autre pendant la conversion.
 */
export default function registerHandlebarsHelpers() {
  // if equal (bloc)
  Handlebars.registerHelper("ife", function (v1, v2, options) {
    return v1 === v2 ? options.fn(this) : options.inverse(this);
  });

  // if not equal (bloc)
  Handlebars.registerHelper("ifne", function (v1, v2, options) {
    return v1 !== v2 ? options.fn(this) : options.inverse(this);
  });

  // répète le bloc n fois (utilisé par templates/combat/tracker.hbs pour
  // dessiner une blatte par unité de couleur d'initiative restante)
  Handlebars.registerHelper("times", function (n, options) {
    let result = "";
    for (let i = 0; i < (n || 0); i++) {
      result += options.fn(i);
    }
    return result;
  });
}
