// ============================================================================
// INSECTOPIA — La Souillure et ses mutations (livre de base p.295-298)
// ============================================================================
//
// Ce module centralise le Lot A du chantier Souillure (cf. échange avec Obe,
// 2026-08-07) :
//   - Test de CONTRACTION : déclenché par le Deus lors d'une exposition
//     (toxicité de la source, table p.295).
//   - Test d'ÉVOLUTION MENSUELLE : un test par lonas pour tout personnage
//     déjà contaminé, Difficulté = niveau de Souillure actuel (p.298).
//     Les Blattes de chance y sont interdites (géré dans roll.js).
//   - Application des paliers d'effets (marques, phosphorescence, mort à 13)
//     et notification du Deus aux seuils de mutation (5/7/9/11) — le choix
//     et l'application mécanique de la mutation elle-même sont reportés au
//     Lot B (le livre laisse ce choix au Deus, p.296).
//
// Conçu "prêt pour un calendrier" (demande d'Obe) : le déclenchement
// automatique du test d'évolution s'appuie sur le hook natif Foundry
// `updateWorldTime`, sans dépendance à un module de calendrier particulier.
// Tant qu'aucun calendrier ne fait avancer le temps de la partie, le bouton
// GM "Forcer un test de lonas" (sidebar Paramètres) sert de secours manuel.
// ============================================================================

import { ROLL_TYPE, TOXICITE_SOUILLURE, SOUILLURE_PALIERS, MUTATIONS_BLAFARDES } from "../common/config.js";
import { Blattes } from "../common/roll.js";
import { openItemPicker } from "../dialog/item-picker.js";

const { DialogV2 } = foundry.applications.api;

const SOUILLURE_MORT = 13;
// Seuils qui déclenchent une mutation blafarde (livre p.296) : à chacun
// d'eux, le Deus choisit une mutation dans la liste du niveau correspondant.
const SEUILS_MUTATION = { 5: 1, 7: 2, 9: 3, 11: 4 };

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

/**
 * Lance un test de CONTRACTION pour `actor`, sur une exposition de toxicité
 * `toxiciteKey` (clé de TOXICITE_SOUILLURE). Respecte les flags "évite le
 * prochain test" (Blatte verte) et "plus de test aujourd'hui" (Blatte rouge)
 * posés par un précédent test — livre p.296.
 */
export async function lancerTestContraction(actor, toxiciteKey) {
  const toxicite = TOXICITE_SOUILLURE[toxiciteKey];
  if (!actor || !toxicite) return;

  if (actor.getFlag("insectopia", "souillureEviteProchainTest")) {
    await actor.unsetFlag("insectopia", "souillureEviteProchainTest");
    ui.notifications.info(`${actor.name} évite ce test de contraction (Résistance nette au précédent test, livre p.296).`);
    return;
  }
  const skipUntil = actor.getFlag("insectopia", "souillureSkipContractionUntil");
  if (skipUntil && game.time.worldTime < skipUntil) {
    ui.notifications.info(`${actor.name} est immunisé aux tests de contraction pour le reste de la journée (livre p.296).`);
    return;
  }

  const chrysalide = actor.system.caracteristiques.chitine.competences.chrysalide;
  const blattes = new Blattes(actor, ROLL_TYPE.SOUILLURE, chrysalide, {
    difficulte: toxicite.difficulte,
    souillureContexte: "contraction",
    introTextOverride: `${actor.name} — test de contraction (${toxicite.label}).`,
  });
  return blattes.testSouillure();
}

/**
 * Lance le test d'ÉVOLUTION MENSUELLE pour `actor` (livre p.298). Ne fait
 * rien si le personnage n'est pas contaminé (Souillure = 0) : la maladie ne
 * progresse pas toute seule chez un intre sain.
 */
export async function lancerTestEvolution(actor) {
  if (!actor) return;
  const souillureActuelle = actor.system.combat.souillure || 0;
  if (souillureActuelle <= 0) return false;

  const chrysalide = actor.system.caracteristiques.chitine.competences.chrysalide;
  const blattes = new Blattes(actor, ROLL_TYPE.SOUILLURE, chrysalide, {
    difficulte: souillureActuelle,
    souillureContexte: "evolution",
    souillureNoChance: true,
    introTextOverride: `${actor.name} — test d'évolution mensuelle de la Souillure (lonas), Difficulté ${souillureActuelle}.`,
  });
  await blattes.testSouillure();
  return true;
}

// --------------------------------------------------------------------------
// Application du résultat (appelée depuis Blattes.resoudreChoixSouillure)
// --------------------------------------------------------------------------

export async function appliquerResultatSouillure(actor, contexte, couleur, resultat) {
  if (!actor) return;

  if (contexte === "contraction") {
    if (couleur === "verte") await actor.setFlag("insectopia", "souillureEviteProchainTest", true);
    if (couleur === "rouge") {
      // "Plus de test de contraction aujourd'hui" — faute de calendrier
      // garanti, on couvre 1 lonas de temps de jeu (86400s) comme fenêtre
      // de sécurité large ; à ajuster si un calendrier avec un vrai concept
      // de "jour" est branché.
      await actor.setFlag("insectopia", "souillureSkipContractionUntil", game.time.worldTime + 86400);
    }
  }

  if (!resultat.souillureDelta) return;

  const avant = actor.system.combat.souillure || 0;
  const apres = Math.max(0, avant + resultat.souillureDelta);
  await actor.update({ "system.combat.souillure": apres });

  await notifierPaliers(actor, avant, apres);
}

/**
 * Compare le niveau de Souillure avant/après pour notifier le Deus des
 * paliers franchis (marques, phosphorescence, mutation à choisir, mort).
 * Ne notifie que les seuils NOUVELLEMENT franchis (pas déjà actifs avant).
 */
async function notifierPaliers(actor, avant, apres) {
  for (const palier of SOUILLURE_PALIERS) {
    if (apres >= palier.seuil && avant < palier.seuil) {
      ChatMessage.create({
        content: `<div class="souillure-palier"><strong>${actor.name}</strong> franchit le seuil de Souillure ${palier.seuil} : ${palier.label}.</div>`,
        whisper: ChatMessage.getWhisperRecipients("GM"),
      });
    }
  }

  if (apres >= SOUILLURE_MORT && avant < SOUILLURE_MORT) {
    ui.notifications.error(`${actor.name} atteint 13 en Souillure : mort (livre p.297).`);
    await actor.toggleStatusEffect?.("dead", { active: true });
    return;
  }

  const seuilMutation = Object.keys(SEUILS_MUTATION)
    .map(Number)
    .find((s) => apres >= s && avant < s);
  if (seuilMutation !== undefined) {
    const niveau = SEUILS_MUTATION[seuilMutation];
    ChatMessage.create({
      content:
        `<div class="souillure-mutation"><strong>${actor.name}</strong> franchit ${seuilMutation} en Souillure : une mutation blafarde de niveau ${niveau} doit être choisie (livre p.296-297).<br/>` +
        `<a class="choisir-mutation" data-actor-id="${actor.id}" data-niveau="${niveau}"><i class="fas fa-dna"></i> Choisir la mutation</a></div>`,
      whisper: ChatMessage.getWhisperRecipients("GM"),
    });
  }
}

// --------------------------------------------------------------------------
// Mutations blafardes (Lot B)
// --------------------------------------------------------------------------

/**
 * Dialogue GM : choix d'une mutation parmi celles du `niveau` donné (livre
 * p.296-297), application de son effet mécanique quand il est automatisable
 * (voir MUTATIONS_BLAFARDES / auto), puis ouverture du picker de capacité
 * existant pour que le joueur choisisse sa capacité gratuite en échange
 * (contrepartie du livre : "sans payer son coût éventuel en points de
 * Souillure").
 */
export async function ouvrirDialogueMutation(actorId, niveau) {
  const actor = game.actors.get(actorId);
  const liste = MUTATIONS_BLAFARDES[niveau];
  if (!actor || !liste) return;

  const dejaChoisies = actor.getFlag("insectopia", "mutationsBlafardes") ?? [];
  if (dejaChoisies.some((m) => m.niveau === niveau)) {
    ui.notifications.info(`${actor.name} a déjà une mutation de niveau ${niveau}.`);
    return;
  }

  const options = liste.map((m) => `<option value="${m.key}">${m.label}${m.auto ? "" : " (effet manuel)"}</option>`).join("");
  const content = `
    <form>
      <div class="form-group">
        <label>Mutation de niveau ${niveau} pour ${actor.name}</label>
        <select name="mutation">${options}</select>
      </div>
      <p id="mutation-description" style="font-style: italic;"></p>
    </form>`;

  const choix = await DialogV2.wait({
    window: { title: `Mutation blafarde — niveau ${niveau}` },
    content,
    buttons: [
      { action: "choisir", label: "Appliquer cette mutation", icon: "fas fa-check", default: true, callback: (e, b) => b.form.elements["mutation"].value },
      { action: "annuler", label: "Annuler", icon: "fas fa-times" },
    ],
    render: (event, dialog) => {
      const root = dialog.element;
      const select = root.querySelector("select[name=mutation]");
      const desc = root.querySelector("#mutation-description");
      const majDescription = () => {
        desc.textContent = liste.find((m) => m.key === select.value)?.description ?? "";
      };
      select.addEventListener("change", majDescription);
      majDescription();
    },
    rejectClose: false,
  });

  if (!choix || choix === "annuler") return;
  await appliquerMutation(actor, niveau, choix);
}

async function appliquerMutation(actor, niveau, mutationKey) {
  const mutation = MUTATIONS_BLAFARDES[niveau]?.find((m) => m.key === mutationKey);
  if (!mutation) return;

  if (mutation.auto && mutation.effet.type === "caracteristique") {
    const { caracKey, delta } = mutation.effet;
    const actuel = actor.system.caracteristiques[caracKey]?.value ?? 0;
    await actor.update({ [`system.caracteristiques.${caracKey}.value`]: actuel + delta });
  } else if (mutation.auto && mutation.effet.type === "bonus") {
    const { caracKey, compKey, valeur } = mutation.effet;
    await actor.createEmbeddedDocuments("Item", [
      {
        name: `Mutation : ${mutation.label}`,
        type: "capacite",
        system: {
          categorie: caracKey,
          souillureCout: 0,
          fluideCout: 0,
          bonus: { actif: true, caracKey, compKey: compKey ?? "", valeur },
        },
      },
    ]);
  } else {
    ui.notifications.warn(
      `Mutation "${mutation.label}" : effet non automatisé (plusieurs cibles ou contrôle narratif du Deus, livre p.296-297) — à appliquer manuellement.`
    );
  }

  const historique = actor.getFlag("insectopia", "mutationsBlafardes") ?? [];
  historique.push({ niveau, key: mutation.key, label: mutation.label });
  await actor.setFlag("insectopia", "mutationsBlafardes", historique);

  ChatMessage.create({
    content: `<strong>${actor.name}</strong> développe la mutation <strong>${mutation.label}</strong> (niveau ${niveau}). ${mutation.description}`,
  });

  ui.notifications.info(`Le joueur de ${actor.name} peut maintenant choisir une capacité gratuite en échange (livre p.296).`);
  await openItemPicker(actor, "capacite");
}

// --------------------------------------------------------------------------
// Outils GM (sidebar Paramètres)
// --------------------------------------------------------------------------

/** Dialogue GM : choix d'un PJ + de la toxicité d'exposition, puis lance le test de contraction. */
export async function ouvrirDialogueContraction() {
  const pjs = game.actors.filter((a) => a.type === "intre" && a.hasPlayerOwner);
  if (!pjs.length) {
    ui.notifications.warn("Aucun personnage joueur trouvé.");
    return;
  }

  const optionsActeurs = pjs.map((a) => `<option value="${a.id}">${a.name}</option>`).join("");
  const optionsToxicite = Object.entries(TOXICITE_SOUILLURE)
    .map(([key, t]) => `<option value="${key}">${t.label} (Difficulté ${t.difficulte})</option>`)
    .join("");

  const content = `
    <form>
      <div class="form-group">
        <label>Personnage exposé</label>
        <select name="actorId">${optionsActeurs}</select>
      </div>
      <div class="form-group">
        <label>Toxicité de l'exposition (livre p.295)</label>
        <select name="toxicite">${optionsToxicite}</select>
      </div>
    </form>`;

  await DialogV2.wait({
    window: { title: "Test de Souillure — contraction" },
    content,
    buttons: [
      {
        action: "roll",
        icon: "fas fa-check",
        label: "Lancer le test",
        default: true,
        callback: async (event, button) => {
          const form = button.form;
          const actor = game.actors.get(form.elements["actorId"].value);
          const toxiciteKey = form.elements["toxicite"].value;
          await lancerTestContraction(actor, toxiciteKey);
        },
      },
      { action: "cancel", icon: "fas fa-times", label: "Annuler" },
    ],
    rejectClose: false,
  });
}

/** Déclenche manuellement le test d'évolution mensuelle pour tous les PJ contaminés. */
export async function forcerTestLonasTousActeurs() {
  const pjs = game.actors.filter((a) => a.type === "intre" && a.hasPlayerOwner && (a.system.combat.souillure || 0) > 0);
  if (!pjs.length) {
    ui.notifications.info("Aucun personnage contaminé par la Souillure.");
    return;
  }
  for (const actor of pjs) {
    await lancerTestEvolution(actor);
    await actor.setFlag("insectopia", "souillureDernierLonas", game.time.worldTime);
  }
}

// --------------------------------------------------------------------------
// Déclenchement automatique "prêt pour un calendrier"
// --------------------------------------------------------------------------
//
// Aucun module de calendrier n'est requis pour que le système fonctionne
// (le bouton GM manuel suffit). Mais dès qu'un calendrier (Simple Calendar,
// ou le calendrier natif Foundry v13+) avance `game.time.worldTime`, ce hook
// déclenche automatiquement le test d'évolution pour chaque PJ contaminé qui
// a dépassé la durée d'un lonas (réglage "secondesParLonas") depuis son
// dernier test — sans aucune modification de code nécessaire à l'intégration
// du calendrier.

export function registerSouillureCalendarHook() {
  Hooks.on("updateWorldTime", async () => {
    if (!game.user.isGM) return; // un seul client déclenche, évite les doublons.
    const secondesParLonas = game.settings.get("insectopia", "secondesParLonas");
    const maintenant = game.time.worldTime;

    for (const actor of game.actors.filter((a) => a.type === "intre" && a.hasPlayerOwner)) {
      const souillure = actor.system.combat.souillure || 0;
      if (souillure <= 0) continue;

      const dernier = actor.getFlag("insectopia", "souillureDernierLonas");
      if (dernier === undefined) {
        // Première contamination détectée : on amorce le compteur sans
        // lancer de test immédiat.
        await actor.setFlag("insectopia", "souillureDernierLonas", maintenant);
        continue;
      }
      if (maintenant - dernier >= secondesParLonas) {
        await actor.setFlag("insectopia", "souillureDernierLonas", maintenant);
        await lancerTestEvolution(actor);
      }
    }
  });
}
