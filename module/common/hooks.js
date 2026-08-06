import { Blattes } from "./roll.js";

export default function registerHooks() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    // Repioche (règle +1/-1, ou utilisation d'une Blatte de chance).
    for (const btn of html.querySelectorAll(".repiocher")) {
      btn.addEventListener("click", async () => {
        const userId = message.getFlag("world", "reRollUserId");
        if (!game.user.isGM && game.user.id !== userId) return;
        const flagData = message.getFlag("world", "blatteData");
        if (!flagData) return;
        const actor = game.actors.get(flagData.actorId);
        const blattes = new Blattes(actor, flagData.rolltype, flagData.competence, flagData.data);
        blattes.reroll(null, message);
      });
    }

    // Choix de la couleur retenue pour une Attaque : enchaîne
    // automatiquement sur le test de Dégâts si l'attaque a réussi.
    for (const btn of html.querySelectorAll(".choix-attaque")) {
      btn.addEventListener("click", async () => {
        await Blattes.resoudreChoixAttaque(btn.dataset.couleur, message);
      });
    }

    // Choix de la couleur retenue pour un test de Dégâts : calcule les
    // impacts et propose de les appliquer à la cible ciblée sur la scène.
    for (const btn of html.querySelectorAll(".choix-degats")) {
      btn.addEventListener("click", async () => {
        await Blattes.resoudreChoixDegats(btn.dataset.couleur, message);
      });
    }

    // Choix de la couleur retenue pour un test de Sphère de magie :
    // enchaîne sur la Maladresse ou l'Effet du sort selon le résultat
    // (livre p.262-276).
    for (const btn of html.querySelectorAll(".choix-sort")) {
      btn.addEventListener("click", async () => {
        await Blattes.resoudreChoixSort(btn.dataset.couleur, message);
      });
    }

    // Choix de la couleur retenue pour un jet Opposition/Difficulté simple
    // (plusieurs Blattes tirées) : affiche uniquement le résultat retenu,
    // au Deus de l'appliquer selon le contexte (hors combat : lecture
    // directe ; en combat : à interpréter manuellement pour l'instant).
    for (const btn of html.querySelectorAll(".choix-simple")) {
      btn.addEventListener("click", async () => {
        await Blattes.resoudreChoixSimple(btn.dataset.couleur, message);
      });
    }

    // Utilisation d'une Blatte de chance : un contrôle est généré pour
    // chaque acteur éligible sur ce jet (flagData.chanceActorIds — le
    // rôleur, et l'adversaire ciblé sur la scène le cas échéant, voir
    // roll.js), mais un contrôle n'est visible que par le joueur
    // propriétaire de CET acteur (ou le Deus), et seulement s'il lui reste
    // au moins une Blatte de chance en stock. Chacun dépense son propre
    // stock, indépendamment de l'autre.
    for (const wrapper of html.querySelectorAll(".chance-blatte-action")) {
      const flagData = message.getFlag("world", "chanceData");
      for (const actorId of flagData?.chanceActorIds ?? []) {
        const actor = game.actors.get(actorId);
        const aDuStock = actor && Object.values(actor.system.chance ?? {}).some((v) => v > 0);
        if (!actor || !(actor.isOwner || game.user.isGM) || !aDuStock) continue;

        const lien = document.createElement("a");
        lien.className = "utiliser-chance";
        lien.innerHTML = `<i class="fas fa-leaf"></i> Utiliser une Blatte de chance (${actor.name})`;
        lien.addEventListener("click", async () => {
          await Blattes.echangerBlatteDeChance(message, actorId);
        });
        wrapper.appendChild(lien);
      }
    }

    // Application des impacts (et de la mutilation éventuelle) à la
    // cible actuellement ciblée sur la scène (game.user.targets).
    for (const btn of html.querySelectorAll(".appliquer-degats")) {
      btn.addEventListener("click", async () => {
        const impacts = parseInt(btn.dataset.impacts) || 0;
        const mutilation = btn.dataset.mutilation === "true";

        const cibles = Array.from(game.user.targets);
        if (!cibles.length) {
          ui.notifications.warn("Ciblez un token sur la scène avant d'appliquer les dégâts.");
          return;
        }
        for (const token of cibles) {
          const actor = token.actor;
          if (!actor) continue;
          await actor.subirImpacts(impacts);
          if (mutilation) await actor.demanderMutilation();
        }
        btn.replaceWith(document.createTextNode("Dégâts appliqués."));
      });
    }
  });

  // Fin de scénario : le Deus réinitialise les Blattes de chance de tous
  // les PJ (elles sont perdues à la fin de chaque scénario, et retirées
  // au fur et à mesure de leur utilisation en cours de partie). Bouton
  // ajouté dans l'onglet Paramètres de la sidebar, visible du Deus
  // uniquement.
  //
  // NB pour un futur dev : Obe a évoqué l'idée d'un message de début de
  // séance regroupant les infos/actions utiles (dont le tirage de Chance
  // de chacun) — non traité ici, à envisager comme chantier séparé.
  Hooks.on("renderSettings", (app, html) => {
    if (!game.user.isGM) return;
    const root = html instanceof HTMLElement ? html : html[0];
    const section = root.querySelector("#settings-game") ?? root;

    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = '<i class="fas fa-sack"></i> Réinitialiser les Blattes de chance';
    button.addEventListener("click", async () => {
      const confirme = await foundry.applications.api.DialogV2.confirm({
        window: { title: "Réinitialiser les Blattes de chance" },
        content:
          "<p>Remet à 0 les Blattes de chance de tous les personnages joueurs (fin de scénario). Cette action est irréversible.</p>",
      });
      if (!confirme) return;
      await resetBlattesDeChanceTousPJ();
    });
    section.appendChild(button);
  });
}

async function resetBlattesDeChanceTousPJ() {
  const zero = { rouge: 0, verte: 0, bleue: 0, blanche: 0, noire: 0 };
  const pjs = game.actors.filter((a) => a.type === "intre" && a.hasPlayerOwner);
  for (const actor of pjs) {
    await actor.update({ "system.chance": zero });
  }
  ui.notifications.info(`Blattes de chance réinitialisées pour ${pjs.length} personnage(s).`);
}
