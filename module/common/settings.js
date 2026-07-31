export default function registerSystemSettings() {
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
