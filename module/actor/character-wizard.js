import { RACES } from "../common/data-races.js";
import { CASTES, COMPETENCES_CASTE } from "../common/data-castes.js";
import { tirerBlattesEvolution, EFFETS_BLATTES_EVOLUTION, ORDRE_CARACS_EVOLUTION } from "../common/evolution.js";
import { extraireSphereDepuisLabel, MOTS_POUVOIR_PAR_METIER, SPHERES } from "../common/data-spheres.js";

const LABELS_CARAC = {
  aile: "Aile",
  antenne: "Antenne",
  esprit: "Esprit",
  mandibule: "Mandibule",
  chitine: "Chitine",
  temperature: "Température",
  caste: "Caste",
};

/**
 * Assistant de création de personnage intre (livre de base p.196-206),
 * en 7 étapes :
 *  1. Choix d'une race            -> IntreActor#applyRace()
 *  2. Blattes d'évolution          -> tirage sans remise + application
 *  3. Choix de la caste et du métier -> IntreActor#applyCaste()
 *  4. Compétences de caste supplémentaires (score Caste - 2)
 *  5. Répartition des points de compétence
 *  6. Attributs secondaires (recap, déjà calculés par prepareDerivedData)
 *  7. Finalisation (nom, historique, marquage "création terminée")
 *
 * Limité aux 18 races d'intres pour l'instant (pas de support Arak
 * Patte/Palpe/Chélicère). Implémenté comme une chaîne de Dialog plutôt
 * qu'une Application à onglets, pour rester cohérent avec le style déjà
 * utilisé par la classe Blattes (module/common/roll.js).
 */
export default class CharacterWizard {
  constructor(actor) {
    this.actor = actor;
    // Couleur tirée pour Caste (7e Blatte), appliquée seulement une fois
    // le métier connu (étape 3), car les compétences de Caste dépendent
    // du métier.
    this.casteBlatteColor = null;
  }

  async start() {
    if (!this.actor.isOwner) {
      ui.notifications.warn("Vous ne pouvez pas lancer l'assistant de création sur ce personnage.");
      return;
    }
    return this.step1Race();
  }

  // --------------------------------------------------------------------
  // Étape 1 : choix d'une race
  // --------------------------------------------------------------------
  async step1Race() {
    const racesIntres = Object.entries(RACES).filter(([, r]) => r.variante === "intre");
    const options = racesIntres.map(([key, r]) => `<option value="${key}">${r.label}</option>`).join("");

    const content = `
      <p>Étape 1/7 — Choisissez une race parmi les 18 races d'intres jouables (livre de base p.198-201).
      Ceci écrasera les 7 caractéristiques et ajoutera les capacités natives de la race.</p>
      <div class="form-group">
        <label>Race</label>
        <select id="wizard-race">${options}</select>
      </div>`;

    return new Promise((resolve) => {
      new Dialog({
        title: "Création de personnage — 1. Race",
        content,
        buttons: {
          next: {
            icon: '<i class="fas fa-arrow-right"></i>',
            label: "Suivant",
            callback: async (html) => {
              const raceKey = html.find("#wizard-race")[0].value;
              await this.actor.applyRace(raceKey);
              resolve(this.step2Blattes());
            },
          },
          cancel: { icon: '<i class="fas fa-times"></i>', label: "Annuler", callback: () => resolve(undefined) },
        },
        default: "next",
      }).render(true);
    });
  }

  // --------------------------------------------------------------------
  // Étape 2 : Blattes d'évolution (6 caractéristiques physiques ; la 7e
  // tirée est Caste, dont l'effet est différé à l'étape 3)
  // --------------------------------------------------------------------
  async step2Blattes() {
    const couleurs = tirerBlattesEvolution(); // 7 couleurs, ordre = ORDRE_CARACS_EVOLUTION
    this.casteBlatteColor = couleurs[6];

    // On applique séquentiellement les 6 premières (une petite boîte de
    // dialogue par caractéristique, pour permettre la répartition libre
    // des Blattes vertes/bleues/blanches et le choix de capacité en noire).
    for (let i = 0; i < 6; i++) {
      const caracKey = ORDRE_CARACS_EVOLUTION[i];
      await this._appliquerBlatteCaracteristique(caracKey, couleurs[i]);
    }

    ui.notifications.info(
      `Blatte de Caste tirée : ${couleurs[6]} (${EFFETS_BLATTES_EVOLUTION[couleurs[6]].label}). Son effet sera appliqué à l'étape 3, une fois le métier choisi.`
    );

    return this.step3CasteMetier();
  }

  /** Affiche un petit dialogue pour appliquer l'effet d'une Blatte tirée sur une caractéristique donnée. */
  async _appliquerBlatteCaracteristique(caracKey, couleur) {
    const carac = this.actor.system.caracteristiques[caracKey];
    const effet = EFFETS_BLATTES_EVOLUTION[couleur];
    const competencesEntries = Object.entries(carac.competences); // [[key, {value,label}], ...]

    let corpsSpecifique = "";
    if (couleur === "rouge") {
      corpsSpecifique = `<p><i class="fas fa-check"></i> ${LABELS_CARAC[caracKey]} passera de ${carac.value} à ${carac.value + 1}.</p>`;
    } else if (couleur === "noire") {
      const capacitesDispo = await this._getCapacitesCompendium(caracKey);
      corpsSpecifique =
        capacitesDispo.length
          ? `
        <p>Choisissez une capacité liée à ${LABELS_CARAC[caracKey]} (compendium des capacités spéciales).</p>
        <div class="form-group"><label>Capacité</label>
          <select id="wizard-capacite-choix">
            ${capacitesDispo.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-group"><label><input type="checkbox" id="wizard-capacite-evolutive" /> Capacité évolutive pour cette race (pas de gain de Souillure)</label></div>`
          : `<p><i>Aucune capacité répertoriée dans le compendium pour ${LABELS_CARAC[caracKey]} — à ajouter manuellement sur la fiche une fois le compendium complété.</i></p>`;
    } else {
      // vert / bleue / blanche : choix des compétences à incrémenter
      const optionsCompetences = competencesEntries
        .map(([key, comp]) => `<option value="${key}">${comp.label ? game.i18n.localize(comp.label) : key} (actuel : ${comp.value})</option>`)
        .join("");
      const nbPoints = couleur === "bleue" ? 2 : 1;
      corpsSpecifique = `
        <p>${nbPoints} point(s) à répartir parmi les compétences de ${LABELS_CARAC[caracKey]} (plafond = ${carac.value}).</p>
        <div class="form-group"><label>Compétence #1</label><select id="wizard-comp-1">${optionsCompetences}</select></div>
        ${
          couleur === "bleue"
            ? `<div class="form-group"><label>Compétence #2 (peut être la même)</label><select id="wizard-comp-2">${optionsCompetences}</select></div>`
            : ""
        }
        ${
          couleur === "verte"
            ? `<div class="form-group"><label>Point libre — n'importe quelle compétence</label>
               <select id="wizard-comp-libre">${this._optionsToutesCompetences()}</select></div>`
            : ""
        }`;
    }

    const content = `<p><b>${LABELS_CARAC[caracKey]}</b> — Blatte tirée : <b>${effet.label}</b></p><p>${effet.description}</p>${corpsSpecifique}`;

    return new Promise((resolve) => {
      new Dialog({
        title: `Blatte d'évolution — ${LABELS_CARAC[caracKey]}`,
        content,
        buttons: {
          ok: {
            icon: '<i class="fas fa-check"></i>',
            label: "Valider",
            callback: async (html) => {
              await this._resoudreBlatte(caracKey, couleur, html);
              resolve(undefined);
            },
          },
        },
        default: "ok",
      }).render(true);
    });
  }

  /** Récupère, dans le compendium "insectopia.capacites", les capacités dont system.categorie correspond à la caractéristique donnée. */
  async _getCapacitesCompendium(caracKey) {
    const pack = game.packs.get("insectopia.capacites");
    if (!pack) return [];
    const index = await pack.getIndex({ fields: ["system.categorie"] });
    return index.filter((e) => e.system?.categorie === caracKey).map((e) => ({ id: e._id, name: e.name }));
  }

  /** Construit les <option> pour toutes les compétences des 6 caractéristiques physiques (point libre, Blatte verte). */
  _optionsToutesCompetences() {
    const caracsPhysiques = ["aile", "antenne", "esprit", "mandibule", "chitine", "temperature"];
    const options = [];
    for (const caracKey of caracsPhysiques) {
      const carac = this.actor.system.caracteristiques[caracKey];
      for (const [compKey, comp] of Object.entries(carac.competences)) {
        options.push(
          `<option value="${caracKey}.${compKey}">${LABELS_CARAC[caracKey]} — ${game.i18n.localize(comp.label)} (actuel : ${comp.value})</option>`
        );
      }
    }
    return options.join("");
  }

  async _resoudreBlatte(caracKey, couleur, html) {
    const updates = {};
    const carac = this.actor.system.caracteristiques[caracKey];

    if (couleur === "rouge") {
      updates[`system.caracteristiques.${caracKey}.value`] = carac.value + 1;
    } else if (couleur === "noire") {
      const capaciteId = html.find("#wizard-capacite-choix")[0]?.value;
      const evolutive = html.find("#wizard-capacite-evolutive")[0]?.checked;
      if (capaciteId) {
        const pack = game.packs.get("insectopia.capacites");
        const source = await pack.getDocument(capaciteId);
        await this.actor.createEmbeddedDocuments("Item", [source.toObject()]);
        if (!evolutive) {
          updates["system.combat.souillure"] = (this.actor.system.combat.souillure || 0) + 1;
        }
      }
    } else {
      const bump = (compKey, amount) => {
        const cur = this.actor.system.caracteristiques[caracKey].competences[compKey]?.value ?? 0;
        const key = `system.caracteristiques.${caracKey}.competences.${compKey}.value`;
        const already = updates[key] ?? cur;
        updates[key] = Math.min(carac.value, already + amount);
      };
      if (couleur === "blanche") {
        bump(html.find("#wizard-comp-1")[0].value, 1);
      } else if (couleur === "bleue") {
        bump(html.find("#wizard-comp-1")[0].value, 1);
        bump(html.find("#wizard-comp-2")[0].value, 1);
      } else if (couleur === "verte") {
        bump(html.find("#wizard-comp-1")[0].value, 1);
        const libre = html.find("#wizard-comp-libre")[0]?.value;
        if (libre && libre.includes(".")) {
          const [lCarac, lComp] = libre.split(".");
          const key = `system.caracteristiques.${lCarac}.competences.${lComp}.value`;
          const cur = this.actor.system.caracteristiques[lCarac].competences[lComp].value;
          const plafond = this.actor.system.caracteristiques[lCarac].value;
          updates[key] = Math.min(plafond, (updates[key] ?? cur) + 1);
        }
      }
    }

    if (Object.keys(updates).length) await this.actor.update(updates);
  }

  // --------------------------------------------------------------------
  // Étape 3 : choix de la caste et du métier
  // --------------------------------------------------------------------
  async step3CasteMetier() {
    const casteOptions = Object.entries(CASTES)
      .map(([key, c]) => `<option value="${key}">${c.label} (${c.bonus})</option>`)
      .join("");

    const content = `
      <p>Étape 3/7 — Choisissez la caste et le métier de votre personnage (livre de base p.203-204).</p>
      <div class="form-group"><label>Caste</label><select id="wizard-caste">${casteOptions}</select></div>
      <div class="form-group"><label>Métier</label><select id="wizard-metier"></select></div>
      <div class="form-group"><label>Caractéristique bonus de caste</label><select id="wizard-bonus-carac"></select></div>
      <div id="wizard-spheres"></div>
      <p><i>Les capacités de caste (livre de base p.203, "au choix") ne sont pas automatisées : ajoutez-les
      ensuite via le bouton "Ajouter une capacité" sur la fiche.</i></p>`;

    return new Promise((resolve) => {
      const dialog = new Dialog({
        title: "Création de personnage — 3. Caste et métier",
        content,
        buttons: {
          next: {
            icon: '<i class="fas fa-arrow-right"></i>',
            label: "Suivant",
            callback: async (html) => {
              const casteKey = html.find("#wizard-caste")[0].value;
              const metierKey = html.find("#wizard-metier")[0].value;
              const bonusCaracKey = html.find("#wizard-bonus-carac")[0].value;
              const sphereChoix = html
                .find("#wizard-spheres select")
                .toArray()
                .map((el) => el.value);
              await this.actor.applyCaste(casteKey, metierKey, bonusCaracKey, sphereChoix);
              await this._appliquerBlatteCaste(casteKey, metierKey);
              resolve(this.step4CompetencesCaste());
            },
          },
          cancel: { icon: '<i class="fas fa-times"></i>', label: "Annuler", callback: () => resolve(undefined) },
        },
        default: "next",
        render: (html) => {
          if (html.data("wizardInit")) return;
          html.data("wizardInit", true);
          const majMetiers = () => {
            const casteKey = html.find("#wizard-caste")[0].value;
            const metiers = CASTES[casteKey].metiers;
            html.find("#wizard-metier").html(
              Object.entries(metiers)
                .map(([key, m]) => `<option value="${key}">${m.label}</option>`)
                .join("")
            );
          };
          const majBonus = () => {
            const casteKey = html.find("#wizard-caste")[0].value;
            // Extrait les clés de caractéristiques citées dans le texte du bonus (ex: "+1 en Mandibule ou +1 en Antenne").
            const bonusTexte = CASTES[casteKey].bonus.toLowerCase();
            const candidats = Object.keys(LABELS_CARAC).filter((k) => bonusTexte.includes(LABELS_CARAC[k].toLowerCase()));
            html.find("#wizard-bonus-carac").html(
              candidats.map((k) => `<option value="${k}">${LABELS_CARAC[k]}</option>`).join("")
            );
          };
          // Pour un métier divin dont une (ou plusieurs) des deux compétences
          // de départ est une Sphère "au choix parmi ..." (label ambigu,
          // extraireSphereDepuisLabel() renvoie null), on demande la sphère
          // ici plutôt que de laisser la compétence sans sphère assignée —
          // c'est le seul moment où l'on connaît encore le métier ET où l'on
          // peut encore poser la question avant que la compétence existe.
          const majSpheres = () => {
            const casteKey = html.find("#wizard-caste")[0].value;
            const metierKey = html.find("#wizard-metier")[0].value;
            const metier = CASTES[casteKey]?.metiers?.[metierKey];
            const spheresMetier = Object.keys(MOTS_POUVOIR_PAR_METIER[metierKey] || {});
            const zone = html.find("#wizard-spheres");
            if (!metier || !spheresMetier.length) {
              zone.html("");
              return;
            }
            const labelsAmbigus = metier.competences.filter(
              (label) => /Sphère de magie/i.test(label) && !extraireSphereDepuisLabel(label)
            );
            if (!labelsAmbigus.length) {
              zone.html("");
              return;
            }
            // Sphères déjà fixées sans ambiguïté par une autre compétence du
            // même métier (ex: "Sphère de magie (Vie)" pour le Chaman) —
            // exclues des choix ci-dessous pour éviter un doublon évident.
            const spheresDejaFixees = metier.competences
              .map((label) => extraireSphereDepuisLabel(label))
              .filter(Boolean);
            const candidats = spheresMetier.filter((s) => !spheresDejaFixees.includes(s));
            zone.html(
              labelsAmbigus
                .map(
                  (label, i) => `
                <div class="form-group">
                  <label>${label}</label>
                  <select data-label="${label}" data-index="${i}">
                    ${candidats.map((s) => `<option value="${s}">${SPHERES[s].label}</option>`).join("")}
                  </select>
                </div>`
                )
                .join("")
            );
          };
          html.find("#wizard-caste").change(() => {
            majMetiers();
            majBonus();
            majSpheres();
          });
          html.find("#wizard-metier").change(majSpheres);
          majMetiers();
          majBonus();
          majSpheres();
        },
      });
      dialog.render(true);
    });
  }

  /**
   * Applique l'effet de la 7e Blatte (Caste), tirée à l'étape 2 mais
   * appliquée ici puisque les compétences de Caste dépendent du métier
   * (livre de base p.203).
   */
  async _appliquerBlatteCaste(casteKey, metierKey) {
    const couleur = this.casteBlatteColor;
    if (!couleur) return;
    const effet = EFFETS_BLATTES_EVOLUTION[couleur];
    const competences = foundry.utils.duplicate(this.actor.system.caracteristiques.caste.competences ?? []);

    if (couleur === "rouge") {
      await this.actor.update({ "system.caracteristiques.caste.value": this.actor.system.caracteristiques.caste.value + 1 });
      ui.notifications.info("Blatte de Caste rouge : +1 en Caste appliqué.");
      return;
    }
    if (couleur === "noire") {
      ui.notifications.info(
        "Blatte de Caste noire : vous pouvez acquérir une compétence de caste au choix, sans restriction raciale (livre de base p.203, voir p.229) — à ajouter à l'étape suivante."
      );
      return;
    }
    // vert / bleue / blanche : point(s) de compétence de Caste, sur les
    // compétences déjà connues (celles du métier) faute de mieux, ou une
    // nouvelle compétence au choix pour la Blatte verte.
    const nb = couleur === "bleue" ? 2 : 1;
    for (let i = 0; i < nb && competences.length; i++) {
      competences[0].value += 1;
    }
    if (couleur === "verte") {
      const nouvelle = await this._choisirCompetenceCaste("Blatte de Caste verte : choisissez la compétence de caste supplémentaire (livre de base p.203, p.229).");
      if (nouvelle) competences.push(nouvelle);
    }
    await this.actor.update({ "system.caracteristiques.caste.competences": competences });
    ui.notifications.info(`Blatte de Caste (${effet.label}) : points appliqués sur les compétences de métier — à ajuster si besoin sur la fiche.`);
  }

  /**
   * Petit dialogue de choix d'une compétence de Caste (pool p.229), avec
   * sous-choix de sphère si "Sphère de magie" est sélectionné — même
   * logique que l'étape 4 et le bouton "+Compétence de Caste" de la fiche.
   * Centralisé ici pour éviter de dupliquer une troisième fois la même
   * mécanique (leçon tirée du "Point libre à renommer" qui comptait sur un
   * champ texte depuis supprimé de la fiche).
   * @returns {Promise<{label:string, value:number, sphere?:string}|null>}
   */
  async _choisirCompetenceCaste(intro) {
    const optionsCompetences = COMPETENCES_CASTE.map((label) => `<option value="${label}">${label}</option>`).join("");
    const metierKey = this.actor.system.identite.metierKey;
    const spheresDisponibles = Object.keys(MOTS_POUVOIR_PAR_METIER[metierKey] || SPHERES);
    const optionsSpheres = spheresDisponibles.map((key) => `<option value="${key}">${SPHERES[key].label}</option>`).join("");
    const content = `
      <p>${intro}</p>
      <div class="form-group"><label>Compétence de Caste</label><select id="choix-comp">${optionsCompetences}</select></div>
      <div class="form-group" id="choix-comp-sphere-group" style="display:none;">
        <label>Sphère de magie</label><select id="choix-comp-sphere">${optionsSpheres}</select>
      </div>`;
    return new Promise((resolve) => {
      new Dialog({
        title: "Compétence de caste",
        content,
        buttons: {
          add: {
            icon: '<i class="fas fa-plus"></i>',
            label: "Ajouter",
            callback: (html) => {
              const choix = html.find("#choix-comp")[0].value;
              if (choix === "Sphère de magie") {
                const sphereKey = html.find("#choix-comp-sphere")[0]?.value;
                resolve(sphereKey ? { label: `Sphère de magie (${SPHERES[sphereKey].label})`, value: 1, sphere: sphereKey } : null);
              } else {
                resolve({ label: choix, value: 1 });
              }
            },
          },
        },
        default: "add",
        render: (html) => {
          html.find("#choix-comp").change((e) => {
            html.find("#choix-comp-sphere-group").toggle(e.currentTarget.value === "Sphère de magie");
          });
        },
        close: () => resolve(null),
      }).render(true);
    });
  }

  // --------------------------------------------------------------------
  // Étape 4 : compétences de caste supplémentaires (score Caste - 2)
  // --------------------------------------------------------------------
  async step4CompetencesCaste() {
    const scoreCaste = this.actor.system.caracteristiques.caste.value;
    const nbActuelles = this.actor.system.caracteristiques.caste.competences.length;
    const nbAChoisir = Math.max(0, scoreCaste - 2 - Math.max(0, nbActuelles - 2));

    const optionsCompetences = COMPETENCES_CASTE.map((label) => `<option value="${label}">${label}</option>`).join("");
    const metierKey = this.actor.system.identite.metierKey;
    const spheresDisponibles = Object.keys(MOTS_POUVOIR_PAR_METIER[metierKey] || SPHERES);
    const optionsSpheres = spheresDisponibles.map((key) => `<option value="${key}">${SPHERES[key].label}</option>`).join("");

    const content = `
      <p>Étape 4/7 — Compétences de caste et leurs évolutions (livre de base p.205 et 229).</p>
      <p>Score en Caste : <b>${scoreCaste}</b>. Vous avez déjà ${Math.min(nbActuelles, 2)} compétence(s) de métier.
      Il vous reste donc <b>${nbAChoisir}</b> compétence(s) de caste à choisir parmi la liste du récapitulatif p.229
      (le livre indique une restriction "selon la race", mais ne fournit pas de table exhaustive croisant race et
      compétence — le choix ci-dessous n'est donc pas filtré par race).</p>
      <p>Reste à choisir : <b><span id="wizard-reste-caste">${nbAChoisir}</span></b></p>
      <div id="wizard-competences-supp"></div>
      <a id="wizard-add-comp"><i class="fas fa-plus"></i> Ajouter une compétence de caste</a>`;

    return new Promise((resolve) => {
      const dialog = new Dialog({
        title: "Création de personnage — 4. Compétences de caste",
        content,
        buttons: {
          next: {
            icon: '<i class="fas fa-arrow-right"></i>',
            label: "Suivant",
            callback: async (html) => {
              const lignes = html.find("#wizard-competences-supp > .form-group");
              if (lignes.length !== nbAChoisir) return false; // bloque : ne ferme pas le dialogue
              const competences = foundry.utils.duplicate(this.actor.system.caracteristiques.caste.competences ?? []);
              lignes.toArray().forEach((ligneEl) => {
                const ligne = $(ligneEl);
                const choix = ligne.find(".wizard-comp-supp-input")[0]?.value;
                if (!choix) return;
                if (choix === "Sphère de magie") {
                  const sphereKey = ligne.find(".wizard-comp-supp-sphere")[0]?.value;
                  if (!sphereKey) return; // pas de sphère dispo pour ce métier (non divin) : ligne ignorée
                  competences.push({ label: `Sphère de magie (${SPHERES[sphereKey].label})`, value: 1, sphere: sphereKey });
                } else {
                  competences.push({ label: choix, value: 1 });
                }
              });
              await this.actor.update({ "system.caracteristiques.caste.competences": competences });
              resolve(this.step5Repartition());
            },
          },
          skip: { icon: '<i class="fas fa-forward"></i>', label: "Passer", callback: () => resolve(this.step5Repartition()) },
        },
        default: "next",
        render: (html) => {
          // Le Dialog peut être re-rendu plusieurs fois par Foundry (ex : après un changement de taille de fenêtre) ;
          // sans garde, ce callback ré-exécutait la boucle d'ajout de lignes à chaque passage, dupliquant les champs.
          if (html.data("wizardInit")) return;
          html.data("wizardInit", true);

          let count = 0;
          const majReste = () => {
            const restant = nbAChoisir - html.find(".wizard-comp-supp-input").length;
            const span = html.find("#wizard-reste-caste");
            span.text(restant);
            span.css("color", restant === 0 ? "green" : "red");
            html.find("#wizard-add-comp").toggle(restant > 0);
            dialog.setPosition({ height: "auto" });
          };
          const addRow = () => {
            count++;
            const row = $(
              `<div class="form-group" data-row="${count}"><label>Compétence #${count}</label>
                <select class="wizard-comp-supp-input">${optionsCompetences}</select>
                <select class="wizard-comp-supp-sphere" style="display:none;">${optionsSpheres}</select>
                <a class="wizard-remove-comp"><i class="fas fa-trash"></i></a></div>`
            );
            // "Sphère de magie" est une entrée générique du pool p.229 : sans
            // sous-choix, on se retrouvait avec une ligne "Sphère de magie"
            // sans sphère assignée (cf. retour du 05/08, capture d'écran).
            // Même logique que le dialogue "+Compétence de Caste" de la
            // fiche : le sous-choix apparaît uniquement pour cette entrée.
            row.find(".wizard-comp-supp-input").change((e) => {
              row.find(".wizard-comp-supp-sphere").toggle(e.currentTarget.value === "Sphère de magie");
              dialog.setPosition({ height: "auto" });
            });
            row.find(".wizard-remove-comp").click((e) => {
              e.preventDefault();
              row.remove();
              majReste();
            });
            html.find("#wizard-competences-supp").append(row);
            majReste();
          };
          html.find("#wizard-add-comp").click((e) => {
            e.preventDefault();
            addRow();
          });
          for (let i = 0; i < nbAChoisir; i++) addRow();
        },
      });
      dialog.render(true);
    });
  }


  // --------------------------------------------------------------------
  // Étape 5 : répartition des points de compétence
  // --------------------------------------------------------------------
  async step5Repartition() {
    const caracsPhysiques = ["aile", "antenne", "esprit", "mandibule", "chitine", "temperature"];
    const lignes = caracsPhysiques
      .map((key) => {
        const carac = this.actor.system.caracteristiques[key];
        const comps = Object.entries(carac.competences)
          .map(([ckey, comp]) => {
            const plafondLigne = carac.value - comp.value; // marge max pour cette compétence
            return `<label style="margin-right:1em">${game.i18n.localize(comp.label)} (actuel : ${comp.value})
               +<input type="number" min="0" max="${plafondLigne}" value="0" class="wizard-repart" data-carac="${key}" data-comp="${ckey}" data-actuel="${comp.value}" style="width:3em" /></label>`;
          })
          .join("");
        return `<div class="form-group" data-carac-group="${key}">
          <b>${LABELS_CARAC[key]}</b> — points à ajouter : <b>${carac.value}</b>,
          reste : <span class="wizard-reste" data-carac="${key}">${carac.value}</span><br/>${comps}
        </div>`;
      })
      .join("");

    const content = `
      <p>Étape 5/7 — Répartition des points de compétence (livre de base p.205). Pour chaque caractéristique,
      vous disposez d'un nouveau budget de points égal à sa valeur, à ajouter aux compétences liées (plafond
      final = valeur de la caractéristique). Ce budget s'ajoute aux points déjà obtenus via les Blattes
      d'évolution (étape 2), qui ne sont pas remis en jeu ici.</p>
      ${lignes}`;

    return new Promise((resolve) => {
      new Dialog({
        title: "Création de personnage — 5. Répartition des points",
        content,
        buttons: {
          next: {
            icon: '<i class="fas fa-arrow-right"></i>',
            label: "Suivant",
            callback: async (html) => {
              const updates = {};
              const totals = {};
              html.find(".wizard-repart").each((_, el) => {
                const carac = el.dataset.carac;
                const comp = el.dataset.comp;
                const actuel = parseInt(el.dataset.actuel);
                const plafond = this.actor.system.caracteristiques[carac].value;
                const ajout = Math.max(0, Math.min(plafond - actuel, parseInt(el.value) || 0));
                updates[`system.caracteristiques.${carac}.competences.${comp}.value`] = actuel + ajout;
                totals[carac] = (totals[carac] || 0) + ajout;
              });
              for (const [carac, total] of Object.entries(totals)) {
                const attendu = this.actor.system.caracteristiques[carac].value;
                if (total !== attendu) {
                  ui.notifications.warn(
                    `${LABELS_CARAC[carac]} : ${total}/${attendu} point(s) attribués — il reste des points non répartis, à ajuster sur la fiche si besoin.`
                  );
                }
              }
              await this.actor.update(updates);
              resolve(this.step6Recap());
            },
          },
        },
        default: "next",
        render: (html) => {
          if (html.data("wizardInit")) return;
          html.data("wizardInit", true);
          const majReste = (caracKey) => {
            const budget = this.actor.system.caracteristiques[caracKey].value;
            let somme = 0;
            html.find(`.wizard-repart[data-carac="${caracKey}"]`).each((_, el) => (somme += parseInt(el.value) || 0));
            const reste = budget - somme;
            const span = html.find(`.wizard-reste[data-carac="${caracKey}"]`);
            span.text(reste);
            span.css("color", reste === 0 ? "green" : reste < 0 ? "red" : "inherit");
          };
          html.find(".wizard-repart").on("input", (e) => majReste(e.currentTarget.dataset.carac));
          for (const key of caracsPhysiques) majReste(key);
        },
      }).render(true);
    });
  }

  // --------------------------------------------------------------------
  // Étape 6 : attributs secondaires (récapitulatif, déjà calculés)
  // --------------------------------------------------------------------
  async step6Recap() {
    const c = this.actor.system.combat;
    const content = `
      <p>Étape 6/7 — Attributs secondaires (livre de base p.206), calculés automatiquement à partir de vos
      caractéristiques :</p>
      <ul>
        <li>Blessures (Impact) : ${c.blessures.impact.max}</li>
        <li>Blessures internes : ${c.blessures.blessureinterne.max}</li>
        <li>Initiative : ${c.initiative}</li>
        <li>Fluide : ${c.fluide.max}</li>
        <li>Souillure : ${c.souillure}</li>
        <li>Vitesse au sol / en vol : ${c.vitesseSol} / ${c.vitesseVol}</li>
      </ul>
      <p>Rien à faire ici — passez à la finalisation.</p>`;

    return new Promise((resolve) => {
      new Dialog({
        title: "Création de personnage — 6. Attributs secondaires",
        content,
        buttons: {
          next: { icon: '<i class="fas fa-arrow-right"></i>', label: "Suivant", callback: () => resolve(this.step7Finalisation()) },
        },
        default: "next",
      }).render(true);
    });
  }

  // --------------------------------------------------------------------
  // Étape 7 : finalisation
  // --------------------------------------------------------------------
  async step7Finalisation() {
    const content = `
      <p>Étape 7/7 — Finalisation.</p>
      <div class="form-group"><label>Nom du personnage</label><input type="text" id="wizard-nom" value="${this.actor.name}" /></div>
      <div class="form-group"><label>Historique / description rapide</label><textarea id="wizard-historique" rows="4"></textarea></div>`;

    return new Promise((resolve) => {
      new Dialog({
        title: "Création de personnage — 7. Finalisation",
        content,
        buttons: {
          finish: {
            icon: '<i class="fas fa-check-double"></i>',
            label: "Terminer la création",
            callback: async (html) => {
              const nom = html.find("#wizard-nom")[0].value?.trim();
              const historique = html.find("#wizard-historique")[0].value?.trim();
              const updates = {};
              if (nom) updates.name = nom;
              if (historique) updates["system.identite.historique"] = historique;
              if (Object.keys(updates).length) await this.actor.update(updates);

              await this.actor.setFlag("insectopia", "creationTerminee", true);
              ui.notifications.info(`Création de ${this.actor.name} terminée !`);

              // Popup de confirmation, réservé au Deus (MJ), en filet de
              // sécurité au cas où la fiche aurait besoin d'être rouverte
              // manuellement (import de PNJ, correction ultérieure, etc.)
              if (game.user.isGM) {
                Dialog.confirm({
                  title: "Assistant de création",
                  content: `<p>La création de <b>${this.actor.name}</b> est marquée comme terminée. Confirmer ?</p>`,
                  yes: () => {},
                  no: async () => await this.actor.unsetFlag("insectopia", "creationTerminee"),
                });
              }
              resolve(undefined);
            },
          },
        },
        default: "finish",
      }).render(true);
    });
  }
}