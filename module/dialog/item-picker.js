/**
 * Picker générique "Compendium / Création libre" pour l'ajout d'Items sur
 * une fiche de personnage.
 *
 * Étape 1 : choix Compendium vs Création libre.
 * Étape 2 (si Compendium) : sélection filtrée dans une liste, avec
 *   possibilité d'ignorer le filtre par défaut (case "Afficher tout").
 *
 * Filtres appliqués par défaut :
 *   - arme / armure : system.tradition vs system.identite.religion de
 *     l'acteur (naturelle <-> animiste, anciens_dieux <-> cultiste,
 *     autre <-> aucun filtre). Les entrées sans tradition renseignée
 *     (ex. boucliers, tradition non tranchée par le livre p.241) sont
 *     toujours affichées.
 *   - capacite : filtre manuel par caractéristique (system.categorie),
 *     sur le même principe que le filtre déjà utilisé à l'étape "Blatte
 *     noire" du wizard de création (character-wizard.js).
 *
 * Non testé en Foundry live à ce stade (cf. STATUS.md — migration
 * Dialog -> DialogV2 en cours sur l'ensemble du système).
 */

const { DialogV2 } = foundry.applications.api;

/** Traditions autorisées selon la religion de l'acteur. `null` = pas de filtre. */
const RELIGION_TRADITIONS = {
  animiste: ["naturelle"],
  cultiste: ["anciens_dieux"],
  autre: null,
};

const CATEGORIE_LABELS = {
  aile: "Aile",
  antenne: "Antenne",
  esprit: "Esprit",
  mandibule: "Mandibule",
  chitine: "Chitine",
  temperature: "Température",
};

const NOMS_PAR_DEFAUT = {
  arme: "Nouvelle arme",
  armure: "Nouvelle armure",
  capacite: "Nouvelle capacité",
  objet: "Nouvel objet",
};

/** Configuration par type d'Item pris en charge par le picker Compendium. */
const TYPE_CONFIG = {
  arme: { pack: "insectopia.armes-armures", itemType: "arme", label: "une arme", useTradition: true },
  armure: { pack: "insectopia.armes-armures", itemType: "armure", label: "une armure", useTradition: true },
  capacite: { pack: "insectopia.capacites", itemType: "capacite", label: "une capacité", useTradition: false },
};

/**
 * Point d'entrée principal. Ouvre le picker pour ajouter un Item de type
 * `type` sur `actor`. Types sans configuration Compendium (ex. "objet") :
 * bascule directement en création libre, comportement inchangé.
 * @returns {Promise<Item|null>} l'Item créé, ou null si annulé.
 */
export async function openItemPicker(actor, type) {
  const cfg = TYPE_CONFIG[type];
  const pack = cfg ? game.packs.get(cfg.pack) : null;

  if (!cfg || !pack) return _creerVierge(actor, type);

  const choix = await DialogV2.wait({
    window: { title: `Ajouter ${cfg.label}` },
    content: `<p>Voulez-vous piocher ${cfg.label} dans le compendium, ou la créer de toutes pièces ?</p>`,
    buttons: [
      { action: "compendium", label: "Depuis le compendium", icon: "fas fa-book", default: true },
      { action: "libre", label: "Création libre", icon: "fas fa-pen" },
    ],
    rejectClose: false,
  });

  if (choix === "libre") return _creerVierge(actor, type);
  if (choix !== "compendium") return null; // fermeture sans choix

  return _choisirDansCompendium(actor, type, cfg, pack);
}

/** Comportement historique : Item vierge du type demandé, à compléter à la main. */
async function _creerVierge(actor, type) {
  const [item] = await actor.createEmbeddedDocuments("Item", [
    { name: NOMS_PAR_DEFAUT[type] ?? "Nouvel objet", type },
  ]);
  return item;
}

/** Récupère et filtre l'index du compendium pour le type/config donnés. */
async function _getEntries(pack, cfg, actor, { montrerTout, categorieFiltre }) {
  const fields = cfg.useTradition ? ["system.tradition"] : ["system.categorie"];
  const index = await pack.getIndex({ fields });
  let entries = index.filter((e) => e.type === cfg.itemType);

  if (cfg.useTradition && !montrerTout) {
    const religion = actor.system.identite?.religion ?? "autre";
    const autorisees = RELIGION_TRADITIONS[religion];
    if (autorisees) {
      entries = entries.filter((e) => !e.system?.tradition || autorisees.includes(e.system.tradition));
    }
  }

  if (!cfg.useTradition && categorieFiltre && categorieFiltre !== "toutes") {
    entries = entries.filter((e) => e.system?.categorie === categorieFiltre);
  }

  return entries
    .map((e) => ({ id: e._id, name: e.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

/** Étape 2 : sélection dans la liste filtrée, puis copie du document sur l'acteur. */
async function _choisirDansCompendium(actor, type, cfg, pack) {
  const state = { montrerTout: false, categorieFiltre: "toutes" };

  const rafraichir = async (root) => {
    const entries = await _getEntries(pack, cfg, actor, state);
    const select = root.querySelector("#picker-choix");
    select.innerHTML = entries.length
      ? entries.map((e) => `<option value="${e.id}">${e.name}</option>`).join("")
      : `<option value="" disabled selected>Aucune entrée disponible avec ce filtre</option>`;
  };

  const labelCapital = cfg.label.charAt(0).toUpperCase() + cfg.label.slice(1);
  const filtreExtra = cfg.useTradition
    ? `<div class="form-group">
         <label><input type="checkbox" id="picker-montrer-tout" />
           Afficher toutes les traditions (ignorer le filtre de religion)</label>
       </div>`
    : `<div class="form-group">
         <label>Filtrer par caractéristique</label>
         <select id="picker-categorie">
           <option value="toutes">Toutes</option>
           ${Object.entries(CATEGORIE_LABELS)
             .map(([k, l]) => `<option value="${k}">${l}</option>`)
             .join("")}
         </select>
       </div>`;

  const resultId = await DialogV2.wait({
    window: { title: `Choisir ${cfg.label} dans le compendium` },
    content: `
      <div class="form-group">
        <label>${labelCapital}</label>
        <select id="picker-choix"></select>
      </div>
      ${filtreExtra}
    `,
    buttons: [
      {
        action: "ajouter",
        label: "Ajouter",
        icon: "fas fa-plus",
        default: true,
        callback: (event, button) => button.form.elements["picker-choix"]?.value ?? null,
      },
      { action: "annuler", label: "Annuler", icon: "fas fa-times" },
    ],
    render: (event, dialog) => {
      const root = dialog.element;
      rafraichir(root);
      root.querySelector("#picker-montrer-tout")?.addEventListener("change", (ev) => {
        state.montrerTout = ev.target.checked;
        rafraichir(root);
      });
      root.querySelector("#picker-categorie")?.addEventListener("change", (ev) => {
        state.categorieFiltre = ev.target.value;
        rafraichir(root);
      });
    },
    rejectClose: false,
  });

  if (!resultId || resultId === "annuler") return null;

  const source = await pack.getDocument(resultId);
  if (!source) return null;
  const [item] = await actor.createEmbeddedDocuments("Item", [source.toObject()]);
  return item;
}
