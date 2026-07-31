import { RACES } from "../common/data-races.js";
import { CASTES } from "../common/data-castes.js";
import { tirerBlattesEvolution, EFFETS_BLATTES_EVOLUTION, ORDRE_CARACS_EVOLUTION } from "../common/evolution.js";

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
      const capacitesRace = this.actor.system.identite.capacites?.length
        ? ""
        : "<p><i>Aucune capacité de race enregistrée pour l'instant — indiquez-en une manuellement à l'étape suivante ou via la fiche.</i></p>";
      corpsSpecifique = `
        <p>Choisissez une capacité liée à ${LABELS_CARAC[caracKey]} (parmi celles de la race, livre de base p.207+).</p>
        <div class="form-group"><label>Nom de la capacité</label><input type="text" id="wizard-capacite-nom" placeholder="Ex : Antennes ramifiées" /></div>
        <div class="form-group"><label><input type="checkbox" id="wizard-capacite-evolutive" /> Capacité évolutive pour cette race (pas de gain de Souillure)</label></div>
        ${capacitesRace}`;
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
            ? `<div class="form-group"><label>Point libre — n'importe quelle compétence (indiquez caractéristique.compétence, ex: chitine.resistance)</label>
               <input type="text" id="wizard-comp-libre" placeholder="ex: chitine.resistance" /></div>`
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

  async _resoudreBlatte(caracKey, couleur, html) {
    const updates = {};
    const carac = this.actor.system.caracteristiques[caracKey];

    if (couleur === "rouge") {
      updates[`system.caracteristiques.${caracKey}.value`] = carac.value + 1;
    } else if (couleur === "noire") {
      const nom = html.find("#wizard-capacite-nom")[0].value?.trim();
      const evolutive = html.find("#wizard-capacite-evolutive")[0].checked;
      if (nom) {
        await this.actor.createEmbeddedDocuments("Item", [
          {
            name: nom,
            type: "capacite",
            img: "icons/magic/symbols/rune-sigil-blue-pink.webp",
            system: { categorie: caracKey, description: `Capacité acquise par tirage d'évolution (${LABELS_CARAC[caracKey]}).` },
          },
        ]);
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
        const libre = html.find("#wizard-comp-libre")[0].value?.trim();
        if (libre && libre.includes(".")) {
          const [lCarac, lComp] = libre.split(".");
          if (this.actor.system.caracteristiques[lCarac]?.competences?.[lComp]) {
            const key = `system.caracteristiques.${lCarac}.competences.${lComp}.value`;
            const cur = this.actor.system.caracteristiques[lCarac].competences[lComp].value;
            const plafond = this.actor.system.caracteristiques[lCarac].value;
            updates[key] = Math.min(plafond, (updates[key] ?? cur) + 1);
          } else {
            ui.notifications.warn(`Compétence libre "${libre}" introuvable — point non attribué, à ajouter manuellement sur la fiche.`);
          }
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
              await this.actor.applyCaste(casteKey, metierKey, bonusCaracKey);
              await this._appliquerBlatteCaste(casteKey, metierKey);
              resolve(this.step4CompetencesCaste());
            },
          },
          cancel: { icon: '<i class="fas fa-times"></i>', label: "Annuler", callback: () => resolve(undefined) },
        },
        default: "next",
        render: (html) => {
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
          html.find("#wizard-caste").change(() => {
            majMetiers();
            majBonus();
          });
          majMetiers();
          majBonus();
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
    // nouvelle ligne libre pour la Blatte verte.
    const nb = couleur === "bleue" ? 2 : 1;
    for (let i = 0; i < nb && competences.length; i++) {
      competences[0].value += 1;
    }
    if (couleur === "verte") {
      competences.push({ label: "Point libre (Blatte verte, à renommer)", value: 1 });
    }
    await this.actor.update({ "system.caracteristiques.caste.competences": competences });
    ui.notifications.info(`Blatte de Caste (${effet.label}) : points appliqués sur les compétences de métier — à ajuster si besoin sur la fiche.`);
  }

  // --------------------------------------------------------------------
  // Étape 4 : compétences de caste supplémentaires (score Caste - 2)
  // --------------------------------------------------------------------
  async step4CompetencesCaste() {
    const scoreCaste = this.actor.system.caracteristiques.caste.value;
    const nbActuelles = this.actor.system.caracteristiques.caste.competences.length;
    const nbAChoisir = Math.max(0, scoreCaste - 2 - Math.max(0, nbActuelles - 2));

    const content = `
      <p>Étape 4/7 — Compétences de caste et leurs évolutions (livre de base p.205).</p>
      <p>Score en Caste : <b>${scoreCaste}</b>. Vous avez déjà ${Math.min(nbActuelles, 2)} compétence(s) de métier.
      Il vous reste donc <b>${nbAChoisir}</b> compétence(s) de caste à choisir librement (section "Compétences de
      caste" p.229 du livre de base — liste non encore intégrée au système : saisissez le nom manuellement).</p>
      <div id="wizard-competences-supp"></div>
      <a id="wizard-add-comp"><i class="fas fa-plus"></i> Ajouter une compétence de caste</a>`;

    return new Promise((resolve) => {
      new Dialog({
        title: "Création de personnage — 4. Compétences de caste",
        content,
        buttons: {
          next: {
            icon: '<i class="fas fa-arrow-right"></i>',
            label: "Suivant",
            callback: async (html) => {
              const noms = html
                .find(".wizard-comp-supp-input")
                .toArray()
                .map((el) => el.value?.trim())
                .filter(Boolean);
              if (noms.length) {
                const competences = foundry.utils.duplicate(this.actor.system.caracteristiques.caste.competences ?? []);
                for (const label of noms) competences.push({ label, value: 1 });
                await this.actor.update({ "system.caracteristiques.caste.competences": competences });
              }
              resolve(this.step5Repartition());
            },
          },
          skip: { icon: '<i class="fas fa-forward"></i>', label: "Passer", callback: () => resolve(this.step5Repartition()) },
        },
        default: "next",
        render: (html) => {
          let count = 0;
          const addRow = () => {
            count++;
            html.find("#wizard-competences-supp").append(
              `<div class="form-group"><label>Compétence #${count}</label><input type="text" class="wizard-comp-supp-input" /></div>`
            );
          };
          html.find("#wizard-add-comp").click((e) => {
            e.preventDefault();
            addRow();
          });
          for (let i = 0; i < nbAChoisir; i++) addRow();
        },
      }).render(true);
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
          .map(
            ([ckey, comp]) =>
              `<label style="margin-right:1em">${game.i18n.localize(comp.label)}
               <input type="number" min="1" max="${carac.value}" value="${comp.value}" class="wizard-repart" data-carac="${key}" data-comp="${ckey}" style="width:3em" /></label>`
          )
          .join("");
        return `<div class="form-group"><b>${LABELS_CARAC[key]} (valeur ${carac.value}, à répartir : ${carac.value} points)</b><br/>${comps}</div>`;
      })
      .join("");

    const content = `
      <p>Étape 5/7 — Répartition des points de compétence (livre de base p.205). Pour chaque caractéristique,
      répartissez autant de points que sa valeur entre ses compétences liées (1 pour 1, plafonné par la valeur
      de la caractéristique, minimum 1 par compétence). Ces valeurs incluent déjà les points de l'étape 2.</p>
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
                let value = parseInt(el.value) || 1;
                const plafond = this.actor.system.caracteristiques[carac].value;
                value = Math.max(1, Math.min(plafond, value));
                updates[`system.caracteristiques.${carac}.competences.${comp}.value`] = value;
                totals[carac] = (totals[carac] || 0) + value;
              });
              for (const [carac, total] of Object.entries(totals)) {
                const attendu = this.actor.system.caracteristiques[carac].value;
                if (total !== attendu) {
                  ui.notifications.warn(
                    `${LABELS_CARAC[carac]} : ${total} point(s) répartis pour ${attendu} attendus — vérifiez la répartition sur la fiche si besoin.`
                  );
                }
              }
              await this.actor.update(updates);
              resolve(this.step6Recap());
            },
          },
        },
        default: "next",
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
