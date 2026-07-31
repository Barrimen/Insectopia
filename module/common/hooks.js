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
}
