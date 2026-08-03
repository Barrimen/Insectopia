import { RACES } from "../../common/data-races.js";
import CharacterWizard from "../character-wizard.js";
import { ouvrirDialogueLancerSort } from "../../common/magic.js";
import { SPHERES, MOTS_POUVOIR, MOTS_POUVOIR_PAR_METIER } from "../../common/data-spheres.js";
import { asArray } from "../../common/utils.js";

const CARAC_SIDE = {
  antenne: "left",
  esprit: "right",
  mandibule: "left",
  aile: "right",
  chitine: "left",
  temperature: "right",
};

// Angle (en degrés, convention mathématique : 0° = droite, sens
// anti-horaire) de chaque caractéristique autour du centre vide de la
// rosace. Avec cette disposition (multiples de 60°), les hexagones
// diagonaux (Antenne/Esprit/Chitine/Temperature) touchent le centre par
// une arête et les hexagones horizontaux (Mandibule/Aile) par un sommet
// — exactement la géométrie d'un pavage hexagonal réel, cf. livre p.27
// pour la disposition des caractéristiques sur la fiche officielle.
const CARAC_ANGLE = {
  aile: 0,
  esprit: 60,
  antenne: 120,
  mandibule: 180,
  chitine: 240,
  temperature: 300,
};

/**
 * Calcule la géométrie exacte de la rosace hexagonale des 6
 * caractéristiques (SVG). Deux principes géométriques :
 *
 * 1. Les 6 grands hexagones sont placés à des angles multiples de 60°
 *    autour du centre vide, à une distance = distance de contact
 *    (arête-à-arête pour les diagonaux, sommet-à-sommet pour les
 *    horizontaux) MULTIPLIÉE par un facteur d'écartement > 1, pour les
 *    désolidariser les uns des autres (cf. retour du 04/08 : "la
 *    proximité désolidarise et diminue leur taille").
 * 2. Les 2 hexagones de compétence d'une caractéristique ne sont plus
 *    décalés horizontalement à plat : ils sont placés SUR LE MÊME CERCLE
 *    (rayon plus grand), à ± un angle delta autour de l'angle propre de
 *    la caractéristique — donc dans son prolongement radial, "dans son
 *    angle", comme sur la fiche officielle et le croquis fourni. Lequel
 *    des deux est "en haut" est déterminé en comparant les Y résultants
 *    (robuste quel que soit le cadran), pas codé en dur par index.
 *
 * @returns {{viewBox: string, caracs: Record<string, object>}}
 */
function buildRosaceGeometry() {
  const rBig = 65; // rayon des grands hexagones (-1/6 par rapport à la v1 : 78 -> 65)
  const rSmall = 84; // rayon des hexagones de compétence (x2 par rapport à la v1 : 42 -> 84)
  const cx = 400;
  const cy = 360;
  const spacing = 1.55; // facteur d'écartement entre grands hexagones (> 1 = désolidarisé)
  const deltaCompAngle = 13; // écart angulaire (°) des 2 compétences autour de l'angle de la caract.
  // spacing/deltaCompAngle validés par simulation (aucune collision de
  // bounding box entre hexagones de caractéristiques voisines, marge de
  // sécurité incluse — cf. tests numériques du 04/08).

  const R_diagonale = rBig * Math.sqrt(3) * spacing; // Antenne/Esprit/Chitine/Temperature
  const R_horizontale = rBig * 2 * spacing; // Mandibule/Aile
  // Rayon du cercle où sont placées les compétences : juste au-delà du
  // bord extérieur du grand hexagone parent.
  const R_comp_extra = rBig + rSmall;

  const bigWidth = rBig * 2;
  const bigHeight = rBig * Math.sqrt(3);
  const smallWidth = rSmall * 2;
  const smallHeight = rSmall * Math.sqrt(3);

  const toXY = (angleDeg, distance) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return { x: cx + distance * Math.cos(angleRad), y: cy - distance * Math.sin(angleRad) };
  };

  const caracs = {};
  let maxExtent = 0;

  for (const [key, angleDeg] of Object.entries(CARAC_ANGLE)) {
    const isHorizontale = key === "mandibule" || key === "aile";
    const R_carac = isHorizontale ? R_horizontale : R_diagonale;
    const center = toXY(angleDeg, R_carac);
    const R_comp = R_carac + R_comp_extra;

    // Les deux positions candidates pour les compétences, triées par Y
    // croissant : la plus haute à l'écran devient la première compétence
    // (dans l'ordre du modèle de données, ex. Phéromone avant Tir).
    const candidateA = toXY(angleDeg - deltaCompAngle, R_comp);
    const candidateB = toXY(angleDeg + deltaCompAngle, R_comp);
    const sortedComps = [candidateA, candidateB].sort((a, b) => a.y - b.y);

    caracs[key] = {
      cx: center.x,
      cy: center.y,
      x: center.x - bigWidth / 2,
      y: center.y - bigHeight / 2,
      w: bigWidth,
      h: bigHeight,
      comps: sortedComps.map((pt) => ({
        x: pt.x - smallWidth / 2,
        y: pt.y - smallHeight / 2,
        w: smallWidth,
        h: smallHeight,
      })),
    };

    for (const pt of [
      { x: center.x - bigWidth / 2, y: center.y - bigHeight / 2 },
      { x: center.x + bigWidth / 2, y: center.y + bigHeight / 2 },
      ...sortedComps.map((p) => ({ x: p.x - smallWidth / 2, y: p.y - smallHeight / 2 })),
      ...sortedComps.map((p) => ({ x: p.x + smallWidth / 2, y: p.y + smallHeight / 2 })),
    ]) {
      maxExtent = Math.max(maxExtent, Math.abs(pt.x - cx), Math.abs(pt.y - cy));
    }
  }

  // viewBox recalculé pour englober toute la rosace avec une marge, quels
  // que soient les paramètres ci-dessus (évite tout rognage si on retouche
  // rBig/rSmall/spacing plus tard).
  const half = maxExtent + 20;
  const viewBox = `${cx - half} ${cy - half} ${half * 2} ${half * 2}`;

  return { viewBox, caracs };
}

export default class IntreActorSheet extends foundry.appv1.sheets.ActorSheet {
  constructor(...args) {
    super(...args);
    this.options.submitOnClose = true;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      height: 840,
      width: 1040,
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
    const rosaceGeometry = buildRosaceGeometry();
    context.rosaceViewBox = rosaceGeometry.viewBox;

    context.caracteristiquesListe = Object.entries(this.actor.system.caracteristiques).filter(([key]) => key).map(([key, carac]) => {
      const geo = rosaceGeometry.caracs[key];
      const competencesListe =
        key === "caste"
          ? asArray(carac.competences) // tableau libre pour Caste
          : Object.entries(carac.competences).map(([ckey, comp], index) => ({
              key: ckey,
              ...comp,
              geo: geo?.comps?.[index],
            }));

      return {
        key,
        side: CARAC_SIDE[key] || "left",
        geo,
        ...carac,
        competencesListe,
      };
    });

    const toutesArmes = this.actor.items.filter((i) => i.type === "arme");
    context.armes = toutesArmes.filter((i) => !i.system.naturelle);
    context.armesNaturelles = toutesArmes.filter((i) => i.system.naturelle);
    context.armures = this.actor.items.filter((i) => i.type === "armure");
    context.capacitesItems = this.actor.items.filter((i) => i.type === "capacite");
    context.objets = this.actor.items.filter((i) => i.type === "objet");
    context.poidsTotalObjets = this.actor.getPoidsTotalObjets();
    context.poidsPorte = this.actor.getPoidsPorte();

    // Total d'Armure affiché en synthèse (somme des bonus/malus des
    // armures équipées) — purement informatif, cf. livre p.28 : "Carapace
    // = Chitine + protections".
    const armuresEquipees = context.armures.filter((a) => a.system.equipee);
    context.armureTotal = {
      protection: armuresEquipees.reduce((total, a) => total + (a.system.bonusChitine || 0), 0),
      malus: armuresEquipees.reduce(
        (total, a) => total + (a.system.malusEncombrement || 0) + (a.system.malusAile || 0),
        0
      ),
    };

    context.contacts = asArray(this.actor.system.ressources?.contacts);
    context.racesListe = Object.entries(RACES).map(([key, race]) => ({ key, label: race.label }));
    context.spheresListe = Object.entries(SPHERES).map(([key, sphere]) => ({ key, label: sphere.label }));

    // Tableau statique "Jeteur de sorts" (livre p.267, cf. la feuille papier
    // p.2) : une ligne par Sphère connue (compétence de Caste taguée
    // "sphere"), avec les Mots de pouvoir autorisés pour cette Sphère selon
    // le métier du personnage. Vide si le métier n'est pas un métier divin
    // reconnu, ou si aucune Sphère n'est encore taguée.
    const motsParMetierSheet = MOTS_POUVOIR_PAR_METIER[this.actor.system.identite.metierKey];
    context.jeteurDeSorts = motsParMetierSheet
      ? asArray(this.actor.system.caracteristiques.caste.competences)
          .filter((c) => c.sphere && SPHERES[c.sphere])
          .map((c) => ({
            sphereLabel: SPHERES[c.sphere].label,
            sphereValue: c.value,
            motsLabels: (motsParMetierSheet[c.sphere] || []).map((m) => MOTS_POUVOIR[m]).join(", ") || "—",
          }))
      : [];

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

    html.find(".contact-add").click(this._onContactAdd.bind(this));
    html.find(".contact-remove").click(this._onContactRemove.bind(this));

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

  /** Ajoute un contact (livre de base, fiche p.2 : Allié / Ennemi / neutre). */
  async _onContactAdd(event) {
    event.preventDefault();
    const contacts = foundry.utils.duplicate(asArray(this.actor.system.ressources?.contacts));
    contacts.push({ nom: "Nouveau contact", relation: "neutre", description: "" });
    await this.actor.update({ "system.ressources.contacts": contacts });
  }

  async _onContactRemove(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.dataset.index);
    const contacts = foundry.utils.duplicate(asArray(this.actor.system.ressources?.contacts));
    contacts.splice(index, 1);
    await this.actor.update({ "system.ressources.contacts": contacts });
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