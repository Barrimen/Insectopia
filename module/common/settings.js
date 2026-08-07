import { registerCalendrierSettings } from "./calendrier.js";

export default function registerSystemSettings() {
  registerCalendrierSettings();

  // Durée d'un lonas (cycle lunaire, livre p.278) en secondes de temps de
  // jeu (game.time.worldTime). Sert de seuil au test d'évolution mensuelle
  // de la Souillure (module/combat/souillure.js). Le calendrier d'Entoma
  // pilote désormais worldTime (module/common/calendrier.js) : ce réglage
  // reste la source de vérité pour la Souillure, indépendante de
  // calendrierLonasParKumi (durée d'un KUMI, un concept différent — un kumi
  // dure plusieurs lonas). Défaut : 28 jours (28 * 86400s), cohérent avec
  // JOURS_PAR_LONAS dans data-calendrier.js.
  game.settings.register("insectopia", "secondesParLonas", {
    name: "Durée d'un lonas (Souillure) en secondes de jeu",
    hint: "Utilisé pour déclencher automatiquement le test d'évolution mensuelle de Souillure quand le temps de la partie avance (calendrier d'Entoma). Défaut : 28 jours.",
    scope: "world",
    config: true,
    type: Number,
    default: 28 * 86400,
  });

  game.settings.register("insectopia", "visibiliteJetsPNJ", {
    name: "Visibilité des jets de PNJ",
    hint: "Détermine si les jets de Blattes effectués par le Deus pour ses PNJ sont visibles des joueurs.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      default: "Suivre le mode de jet du chat",
      public: "Toujours publics",
      private: "Toujours privés (visibles du Deus uniquement)",
      depends: "Suivre le mode de jet du chat",
    },
    default: "default",
  });

  game.settings.register("insectopia", "ignorerTirageInitiative", {
    name: "Règle optionnelle : ignorer le tirage de Blattes pour l'initiative",
    hint: "Le Deus peut choisir d'ignorer le tirage de Blattes pour déterminer l'initiative et faire jouer en premier le personnage à l'initiative la plus élevée, avec une seule action par tour (livret p.29).",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });
}