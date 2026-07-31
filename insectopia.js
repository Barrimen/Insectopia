import { LOG_HEAD, ROLL_TYPE } from "./module/common/config.js";
import { Blattes } from "./module/common/roll.js";
import registerHandlebarsHelpers from "./module/common/helpers.js";
import registerSystemSettings from "./module/common/settings.js";
import registerHooks from "./module/common/hooks.js";

import IntreActor from "./module/actor/base-actor.js";
import IntreActorSheet from "./module/actor/sheet/intre-sheet.js";
import IntreItem from "./module/item/base-item.js";
import IntreItemSheet from "./module/item/sheet/item-sheet.js";

import InsectopiaCombat from "./module/combat/combat.js";
import InsectopiaCombatant from "./module/combat/combatant.js";
import InsectopiaCombatTracker from "./module/combat/combat-tracker.js";

Hooks.once("init", function () {
  console.log(LOG_HEAD + "Initializing Insectopia System");

  CONFIG.Actor.documentClass = IntreActor;
  CONFIG.Item.documentClass = IntreItem;
  CONFIG.Combat.documentClass = InsectopiaCombat;
  CONFIG.Combatant.documentClass = InsectopiaCombatant;
  CONFIG.ui.combat = InsectopiaCombatTracker;

  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("insectopia", IntreActorSheet, {
    types: ["intre"],
    makeDefault: true,
  });

  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("insectopia", IntreItemSheet, { makeDefault: true });

  registerHandlebarsHelpers();
  registerSystemSettings();
  registerHooks();
});

// Bouton de contrôle "Piocher des Blattes" (tirage libre pour le Deus).
Hooks.on("init", () => {
  Hooks.on("getSceneControlButtons", (controls) => {
    if (!game.user.isGM) return;
    controls.insectopia = {
      name: "insectopia",
      title: "Insectopia",
      icon: "fas fa-bug",
      tools: {
        piocherblattes: {
          name: "piocherblattes",
          title: "Piocher des Blattes",
          icon: "fas fa-sack",
          button: true,
          onChange: () => new Blattes(undefined, ROLL_TYPE.SIMPLE, undefined, {}).openDialog(),
        },
      },
    };
  });
});
