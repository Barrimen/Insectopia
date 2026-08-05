import { RACES } from "../../common/data-races.js";
import { COMPETENCES_CASTE } from "../../common/data-castes.js";
import CharacterWizard from "../character-wizard.js";
import { ouvrirDialogueLancerSort } from "../../common/magic.js";
import { SPHERES, MOTS_POUVOIR, MOTS_POUVOIR_PAR_METIER } from "../../common/data-spheres.js";
import { asArray } from "../../common/utils.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

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
// rosace. Cf. buildRosaceGeometry ci-dessous pour le détail du calcul.
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
 * caractéristiques (rendue en SVG, cf. templates/actor/intre.html) :
 *
 * 1. Les 6 grands hexagones sont placés à des angles multiples de 60°
 *    autour du centre vide, à une distance = distance de contact
 *    (arête-à-arête pour les diagonaux, sommet-à-sommet pour les
 *    horizontaux) MULTIPLIÉE par un facteur d'écartement > 1, pour les
 *    désolidariser les uns des autres (retour du 04/08).
 * 2. Les 2 hexagones de compétence d'une caractéristique sont placés sur
 *    le même cercle (rayon plus grand), à ± un angle delta autour de
 *    l'angle propre de la caractéristique — donc dans son prolongement
 *    radial, "dans son angle", comme sur la fiche officielle. Lequel des
 *    deux est "en haut" est déterminé en comparant les Y résultants
 *    (robuste quel que soit le cadran), pas codé en dur par index.
 *
 * Paramètres (rBig/rSmall/spacing/deltaCompAngle) validés par simulation
 * numérique le 04/08 : aucune collision de bounding box entre hexagones
 * de caractéristiques voisines, marge de sécurité incluse.
 *
 * @returns {{viewBox: string, caracs: Record<string, object>}}
 */
function buildRosaceGeometry() {
  const rBig = 65; // rayon des grands hexagones
  const rSmall = 34; // rayon des hexagones de compétence (était 84 : plus grand que rBig, cause du chevauchement massif signalé le 04/08)
  const cx = 400;
  const cy = 360;
  const spacing = 1.55; // facteur d'écartement entre grands hexagones (> 1 = désolidarisé)
  const deltaCompAngle = 10; // écart angulaire (°) des 2 compétences autour de l'angle de la caract.

  const R_diagonale = rBig * Math.sqrt(3) * spacing; // Antenne/Esprit/Chitine/Temperature
  const R_horizontale = rBig * 2 * spacing; // Mandibule/Aile
  const R_comp_extra = (rBig + rSmall) * 0.62; // rapproché du 04/08 (était 1.0, cf. retour "rapprocher les compétences")

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
      comps: sortedComps.map((pt) => {
        // Angle (convention CSS rotate : sens horaire, 0° = droite) du
        // centre de la compétence vers le centre de sa caractéristique
        // parente — utilisé pour orienter la pastille de couleur vers
        // l'extérieur, en pointant vers son hexagone (retour du 04/08).
        const dx = center.x - pt.x;
        const dy = center.y - pt.y;
        const dotAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return {
          x: pt.x - smallWidth / 2,
          y: pt.y - smallHeight / 2,
          w: smallWidth,
          h: smallHeight,
          dotAngle,
          dotRadius: rSmall * 0.55, // rayon de la pastille = proportionnel à la vraie taille du hexagone (auparavant 60px fixe, hérité de l'ancien rSmall=84 : trop loin depuis le passage à rSmall=34, la pastille débordait sur le hexagone voisin)
        };
      }),
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

  const half = maxExtent + 20;
  const viewBox = `${cx - half} ${cy - half} ${half * 2} ${half * 2}`;

  return { viewBox, caracs };
}

/**
 * Fiche de personnage Intre — migrée vers ApplicationV2 (cf. Foundry v13+,
 * la couche de compatibilité `foundry.appv1.*` disparaîtra en v16).
 *
 * Le gabarit Handlebars reste un fichier unique (`intre.html`), les onglets
 * sont gérés à la main dans _onRender() plutôt que via le système TABS
 * intégré, pour rester au plus proche du comportement V1 existant sans
 * réécrire le template en plusieurs PARTS.
 */
export default class IntreActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["insectopia", "sheet", "actor", "intre"],
    position: { width: 1040, height: 840 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      sheetChangeLock: this.#onSheetChangelock,
      editImage: this.#onEditImage,
      caracRoll: this.#onCaracRoll,
      compRoll: this.#onCompRoll,
      chanceRoll: this.#onChanceRoll,
      initRoll: this.#onInitRoll,
      attackRoll: this.#onAttackRoll,
      casteCompAdd: this.#onCasteCompAdd,
      casteCompRemove: this.#onCasteCompRemove,
      sortCastOpen: this.#onSortCastOpen,
      capaciteAdd: this.#onCapaciteAdd,
      capaciteRemove: this.#onCapaciteRemove,
      contactAdd: this.#onContactAdd,
      contactRemove: this.#onContactRemove,
      itemCreate: this.#onItemCreate,
      itemEdit: this.#onItemEdit,
      itemDelete: this.#onItemDelete,
      raceApply: this.#onRaceApply,
      wizardOpen: this.#onWizardOpen,
      wizardGmToggle: this.#onWizardGmToggle,
    },
  };

  /** @override */
  static PARTS = {
    // "scrollable" déclare à ApplicationV2 quel(s) élément(s), dans ce PART,
    // doivent voir leur position de scroll sauvegardée avant un re-render
    // puis restaurée après. Sans ça, chaque update() (ex: cocher "équiper"
    // sur une arme, qui déclenche un re-render complet de la fiche) fait
    // remonter la vue en haut, puisque le DOM du corps de fiche est
    // reconstruit. C'est un mécanisme natif, pas un correctif à la main.
    form: { template: "systems/insectopia/templates/actor/intre.html", scrollable: [".sheet-body"] },
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.actor;
    context.system = this.actor.system;
    context.flags = this.actor.flags;
    context.editable = this.isEditable;
    context.owner = this.actor.isOwner;
    context.isGm = game.user.isGM;
    context.unlocked = this.actor.getFlag(game.system.id, "SheetUnlocked");
    context.creationTerminee = this.actor.getFlag(game.system.id, "creationTerminee");

    context.historiquehtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.identite.historique,
      { secrets: this.actor.isOwner, relativeTo: this.actor }
    );
    context.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.identite.description,
      { secrets: this.actor.isOwner, relativeTo: this.actor }
    );

    // Liste à plat des caractéristiques + compétences, pour un affichage
    // simple en tableau côté template.
    const rosaceGeometry = buildRosaceGeometry();
    context.rosaceViewBox = rosaceGeometry.viewBox;

    context.caracteristiquesListe = Object.entries(this.actor.system.caracteristiques)
      .filter(([key]) => key)
      .map(([key, carac]) => {
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

    // Tableau statique "Jeteur de sorts" (livre p.267, cf. la feuille papier
    // p.2) : une ligne par Sphère connue (compétence de Caste taguée
    // "sphere"), avec les Mots de pouvoir autorisés pour cette Sphère selon
    // le métier du personnage. Vide si le métier n'est pas un métier divin
    // reconnu, ou si aucune Sphère n'est encore taguée.
    const motsParMetierSheet = MOTS_POUVOIR_PAR_METIER[this.actor.system.identite.metierKey];
    context.estMetierDivin = Boolean(motsParMetierSheet);
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
  _onRender(context, options) {
    super._onRender(context, options);
    this.#activateTabs();
    this.#activateChangeListeners();
    this.#fixScrollableLayout();
  }

  /**
   * Filet de sécurité pour le scroll interne de la fiche : on a eu, à
   * plusieurs reprises, des règles CSS ciblant le mauvais nom de classe
   * pour l'ancêtre Foundry (`.window-app`, qui n'existe plus depuis le
   * passage à ApplicationV2 — la classe réelle est `.application`). Plutôt
   * que de deviner encore une fois la structure exacte du DOM, on la
   * lit directement ici et on force les styles nécessaires en JS, ce qui
   * ne dépend d'aucune hypothèse sur les noms de classes internes de
   * Foundry.
   */
  #fixScrollableLayout() {
    const form = this.element;
    if (!form) return;

    // .window-content est un ENFANT du form (avec .window-header comme
    // frère), pas un ancêtre : structure confirmée par inspection directe
    // du DOM (voir échanges du 04/08). querySelector() descend, closest()
    // remonte — c'est bien querySelector() qu'il faut ici.
    const windowContent = form.querySelector(":scope > .window-content");
    if (windowContent) {
      windowContent.style.display = "flex";
      windowContent.style.flexDirection = "column";
      windowContent.style.flex = "1 1 auto";
      windowContent.style.minHeight = "0";
      windowContent.style.overflow = "hidden";
      windowContent.style.padding = "0";
    }

    // Couche identifiée par diagnostic console le 04/08 : la racine du PART
    // Handlebars (<div class="sheet-content droppable">) est un enfant de
    // .window-content qui n'était traité nulle part, et débordait de sa
    // hauteur disponible faute de flex+min-height:0.
    const sheetContent = windowContent?.querySelector(":scope > .sheet-content");
    if (sheetContent) {
      sheetContent.style.display = "flex";
      sheetContent.style.flexDirection = "column";
      sheetContent.style.flex = "1 1 auto";
      sheetContent.style.minHeight = "0";
      sheetContent.style.height = "100%";
      sheetContent.style.overflow = "hidden";
    }

    form.style.flex = "1 1 auto";
    form.style.minHeight = "0";
    form.style.display = "flex";
    form.style.flexDirection = "column";
    form.style.overflow = "hidden";

    const body = form.querySelector(".sheet-body");
    if (body) {
      body.style.flex = "1 1 auto";
      body.style.minHeight = "0";
      body.style.overflowY = "auto";
    }
  }

  /**
   * Gestion manuelle des onglets (équivalent du `tabs` de defaultOptions en
   * V1) : le gabarit reste un PART unique, donc pas de système TABS natif
   * de l'ApplicationV2 ici — on reproduit juste le comportement précédent
   * (classe "active" sur le lien et le panneau correspondants), et on
   * mémorise l'onglet courant pour le restaurer après chaque re-render
   * (déclenché par exemple à chaque sauvegarde de champ).
   */
  #activateTabs() {
    const nav = this.element.querySelector(".sheet-tabs");
    if (!nav) return;
    const panels = this.element.querySelectorAll(".sheet-body > .tab");

    const activer = (tabId) => {
      nav.querySelectorAll("[data-tab]").forEach((a) => a.classList.toggle("active", a.dataset.tab === tabId));
      panels.forEach((p) => p.classList.toggle("active", p.dataset.tab === tabId));
      this._ongletActif = tabId;
    };

    nav.querySelectorAll("[data-tab]").forEach((a) => {
      a.addEventListener("click", (event) => {
        event.preventDefault();
        activer(event.currentTarget.dataset.tab);
      });
    });

    activer(this._ongletActif || "fiche");
  }

  /**
   * Écouteurs "change" (checkbox) — le système d'actions déclaratif
   * (`data-action`) ne couvre que les clics ; ce champ doit donc être
   * relié à la main à chaque re-render.
   */
  #activateChangeListeners() {
    this.element
      .querySelectorAll(".item-equip-toggle")
      .forEach((checkbox) => checkbox.addEventListener("change", this._onItemEquipToggle.bind(this)));
  }

  _onItemEquipToggle(event) {
    event.preventDefault();
    // Le <form> de la fiche a `submitOnChange: true` : sans stopPropagation,
    // l'événement "change" remonte ET déclenche le listener natif de
    // soumission de Foundry EN PLUS de ce handler — deux mises à jour
    // concurrentes de l'acteur, la seconde écrasant potentiellement la
    // première avec un instantané de formulaire pris à un autre moment
    // (cause probable du scroll qui saute après un re-render).
    event.stopPropagation();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) item.update({ "system.equipee": event.currentTarget.checked });
  }

  /** Lance l'assistant de création de personnage (livre de base p.196-206). */
  static async #onWizardOpen(event) {
    event.preventDefault();
    return new CharacterWizard(this.actor).start();
  }

  /**
   * Bascule manuelle, réservée au Deus (MJ), du statut "création
   * terminée" — utile pour un PNJ importé ou un personnage prêt à jouer
   * qui n'est pas passé par l'assistant.
   */
  static async #onWizardGmToggle(event) {
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

  static async #onSheetChangelock(event) {
    event.preventDefault();
    const flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    flagData
      ? await this.actor.unsetFlag(game.system.id, "SheetUnlocked")
      : await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");
    await this.actor.sheet.render(true);
  }

  static async #onEditImage(event, target) {
    event.preventDefault();
    const field = target.dataset.field || "img";
    const current = foundry.utils.getProperty(this.actor, field);
    const fp = new foundry.applications.apps.FilePicker({
      type: "image",
      current,
      callback: (path) => this.actor.update({ [field]: path }),
    });
    return fp.render(true);
  }

  static async #onCaracRoll(event, target) {
    event.preventDefault();
    const caracKey = target.dataset.carac;
    return this.actor.check(caracKey, null);
  }

  static async #onCompRoll(event, target) {
    event.preventDefault();
    const caracKey = target.dataset.carac;
    const compKey = target.dataset.comp;
    // Une compétence de Caste taguée comme Sphère de magie ne se lance pas
    // comme une compétence normale : elle ouvre le dialogue de lancer de
    // sort (choix du Mot de pouvoir), présélectionné sur cette Sphère.
    if (caracKey === "caste") {
      const index = parseInt(compKey);
      const comp = asArray(this.actor.system.caracteristiques.caste.competences)[index];
      if (comp?.sphere) return ouvrirDialogueLancerSort(this.actor, index);
    }
    return this.actor.check(caracKey, compKey);
  }

  static async #onChanceRoll(event) {
    event.preventDefault();
    return this.actor.chanceRoll();
  }

  static async #onInitRoll(event) {
    event.preventDefault();
    return this.actor.rollInitiative();
  }

  static async #onAttackRoll(event, target) {
    event.preventDefault();
    const competenceCombat = target.dataset.competence; // melee | tir | predateur
    return this.actor.attack(competenceCombat);
  }

  /**
   * Ajoute une compétence de Caste (deux, en général, cf. livret p.27 :
   * Blocage/Fureur, Essaim/Courtoisie, Air/Terre, etc.) via un dialogue de
   * choix (livre de base p.229, COMPETENCES_CASTE) plutôt qu'un texte libre
   * à renommer ensuite : la ligne sur la fiche n'a plus de champ éditable,
   * le nom doit donc être fixé au moment de l'ajout. "Sphère de magie"
   * propose en plus un sous-choix de sphère, immédiatement résolu (jamais
   * de compétence Sphère sans sphère assignée).
   */
  static async #onCasteCompAdd(event) {
    event.preventDefault();
    const actor = this.actor;
    const metierKey = actor.system.identite.metierKey;
    const spheresDisponibles = Object.keys(MOTS_POUVOIR_PAR_METIER[metierKey] || SPHERES);

    const options = COMPETENCES_CASTE.map((label) => `<option value="${label}">${label}</option>`).join("");
    const sphereOptions = spheresDisponibles.map((key) => `<option value="${key}">${SPHERES[key].label}</option>`).join("");
    const content = `
      <div class="form-group">
        <label>Compétence de Caste</label>
        <select id="caste-comp-choix">${options}</select>
      </div>
      <div class="form-group" id="caste-comp-sphere-group" style="display:none;">
        <label>Sphère de magie</label>
        <select id="caste-comp-sphere-choix">${sphereOptions}</select>
      </div>`;

    new Dialog({
      title: "Ajouter une compétence de Caste",
      content,
      buttons: {
        add: {
          icon: '<i class="fas fa-plus"></i>',
          label: "Ajouter",
          callback: async (html) => {
            const choix = html.find("#caste-comp-choix")[0].value;
            const competences = foundry.utils.duplicate(asArray(actor.system.caracteristiques.caste.competences));
            if (choix === "Sphère de magie") {
              const sphereKey = html.find("#caste-comp-sphere-choix")[0].value;
              competences.push({ label: `Sphère de magie (${SPHERES[sphereKey].label})`, value: 1, sphere: sphereKey });
            } else {
              competences.push({ label: choix, value: 1 });
            }
            await actor.update({ "system.caracteristiques.caste.competences": competences });
          },
        },
        cancel: { icon: '<i class="fas fa-times"></i>', label: "Annuler" },
      },
      default: "add",
      render: (html) => {
        html.find("#caste-comp-choix").change((ev) => {
          html.find("#caste-comp-sphere-group").toggle(ev.currentTarget.value === "Sphère de magie");
        });
      },
    }).render(true);
  }

  static async #onCasteCompRemove(event, target) {
    event.preventDefault();
    const index = parseInt(target.dataset.index);
    const competences = foundry.utils.duplicate(asArray(this.actor.system.caracteristiques.caste.competences));
    competences.splice(index, 1);
    await this.actor.update({ "system.caracteristiques.caste.competences": competences });
  }

  /** Ouvre la boîte de dialogue de lancer de sort (livre p.262-276). */
  static async #onSortCastOpen(event) {
    event.preventDefault();
    return ouvrirDialogueLancerSort(this.actor);
  }

  /**
   * Ajoute une capacité spéciale (de race ou de caste, cf. livret p.27-28 :
   * Pince, Vitesse surnaturelle, Pestilence, Antennes ramifiées, etc.)
   */
  static async #onCapaciteAdd(event) {
    event.preventDefault();
    const capacites = foundry.utils.duplicate(this.actor.system.identite.capacites);
    capacites.push({ label: "Nouvelle capacité", description: "" });
    await this.actor.update({ "system.identite.capacites": capacites });
  }

  static async #onCapaciteRemove(event, target) {
    event.preventDefault();
    const index = parseInt(target.dataset.index);
    const capacites = foundry.utils.duplicate(this.actor.system.identite.capacites);
    capacites.splice(index, 1);
    await this.actor.update({ "system.identite.capacites": capacites });
  }

  /** Ajoute un contact (livre de base, fiche p.2 : Allié / Ennemi / neutre). */
  static async #onContactAdd(event) {
    event.preventDefault();
    const contacts = foundry.utils.duplicate(asArray(this.actor.system.ressources?.contacts));
    contacts.push({ nom: "Nouveau contact", relation: "neutre", description: "" });
    await this.actor.update({ "system.ressources.contacts": contacts });
  }

  static async #onContactRemove(event, target) {
    event.preventDefault();
    const index = parseInt(target.dataset.index);
    const contacts = foundry.utils.duplicate(asArray(this.actor.system.ressources?.contacts));
    contacts.splice(index, 1);
    await this.actor.update({ "system.ressources.contacts": contacts });
  }

  /** Crée un nouvel Item embarqué du type indiqué (data-type: arme|armure|capacite). */
  static async #onItemCreate(event, target) {
    event.preventDefault();
    const type = target.dataset.type;
    const nomParDefaut = { arme: "Nouvelle arme", armure: "Nouvelle armure", capacite: "Nouvelle capacité", objet: "Nouvel objet" };
    const itemData = { name: nomParDefaut[type] ?? "Nouvel objet", type };
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  static #onItemEdit(event, target) {
    event.preventDefault();
    const itemId = target.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) item.sheet.render(true);
  }

  static #onItemDelete(event, target) {
    event.preventDefault();
    const itemId = target.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) this.actor.deleteEmbeddedDocuments("Item", [item.id]);
  }

  static async #onRaceApply(event) {
    event.preventDefault();
    const raceKey = this.element.querySelector("#raceSelect")?.value;
    if (!raceKey) return;
    const confirmed = await Dialog.confirm({
      title: "Appliquer la race",
      content:
        "<p>Ceci va écraser les 7 caractéristiques du personnage avec les valeurs de la race choisie, et ajouter ses capacités natives (livre de base p.198-201). Continuer ?</p>",
    });
    if (confirmed) return this.actor.applyRace(raceKey);
  }
}