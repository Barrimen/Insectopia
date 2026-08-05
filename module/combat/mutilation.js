import { SAC_BLATTES, LOCALISATION_ZONES } from "../common/config.js";

/**
 * Localisation d'une Mutilation
 * ---------------------------------------------------------------------
 * Livret p.30 : sur une Mutilation (Blatte rouge au test de Dégâts), la
 * partie du corps sectionnée est choisie par le joueur effectuant le test,
 * ou tirée sur "la table de localisation de la fiche de personnage" si le
 * Deus le préfère. Ce module reprend le schéma d'insecte de la fiche comme
 * support cliquable, et ajoute un tirage au sort optionnel réutilisant le
 * sac de 42 Blattes déjà utilisé pour toutes les résolutions du jeu
 * (correspondance couleur -> zone fixée avec l'auteur, cf. config.js).
 *
 * Tête / Abdomen -> mort immédiate ; Thorax -> immobilisation (règle
 * fixe, livret p.30). Aile / Patte -> mutilation permanente ; le livre ne
 * chiffrant aucun effet pour ces deux zones, un malus simple est appliqué
 * en House Rule (cf. IntreActor._prepareDataIntre) et clairement identifié
 * comme tel dans le message de chat et le journal de mutilations de
 * l'acteur.
 */

/**
 * Pioche une Blatte dans un sac de 42 reconstitué, indépendamment de tout
 * tirage de compétence (pas d'opposition, pas de choix de couleur : une
 * seule Blatte, un seul résultat).
 */
function tirerBlatteLocalisation() {
  const bag = [];
  for (const [couleur, nombre] of Object.entries(SAC_BLATTES.REPARTITION)) {
    for (let i = 0; i < nombre; i++) bag.push(couleur);
  }
  return bag[Math.floor(Math.random() * bag.length)];
}

/**
 * Applique les effets d'une Mutilation localisée à `zoneKey` sur `actor`,
 * journalise l'évènement (flag "insectopia.mutilations", consulté par
 * _prepareDataIntre pour les malus Aile/Patte), et poste un message de
 * chat.
 */
export async function appliquerMutilation(actor, zoneKey, source = "manuel") {
  const entree = Object.values(LOCALISATION_ZONES).find((z) => z.zone === zoneKey);
  if (!entree) return;

  const historique = foundry.utils.duplicate(actor.getFlag("insectopia", "mutilations") || []);
  historique.push({
    zone: entree.zone,
    label: entree.label,
    effet: entree.effet,
    round: game.combat?.round ?? null,
    source, // "manuel" (clic/choix du joueur) ou "hasard" (tirage de Blatte)
  });
  await actor.setFlag("insectopia", "mutilations", historique);

  let flavor = "";
  switch (entree.effet) {
    case "mort":
      await actor.toggleStatusEffect?.("dead", { active: true });
      flavor = `${actor.name} meurt sur le coup (mutilation — ${entree.label}, livret p.30).`;
      ui.notifications.error(flavor);
      break;
    case "immobilisation":
      await actor.setFlag("insectopia", "immobilise", true);
      flavor = `${actor.name} est immobilisé (mutilation — ${entree.label}, livret p.30).`;
      ui.notifications.warn(flavor);
      break;
    case "mutilation_aile":
      await actor.setFlag("insectopia", "aileMutilee", true);
      flavor = `${actor.name} perd une aile (mutilation permanente). House Rule : ne peut plus voler (vitesseVol à 0).`;
      ui.notifications.warn(flavor);
      break;
    case "mutilation_patte":
      await actor.setFlag("insectopia", "patteMutilee", true);
      flavor = `${actor.name} perd une patte (mutilation permanente). House Rule : -2 en vitesse au sol (minimum 0).`;
      ui.notifications.warn(flavor);
      break;
  }

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content:
      `<div class="mutilation-result"><strong>Localisation : ${entree.label}</strong>` +
      ` (${source === "hasard" ? "tirage au sort" : "choix manuel"})<br>${flavor}</div>`,
  });
}

/**
 * Ouvre le dialogue de Localisation pour `actor` et résout la promesse une
 * fois la zone déterminée (clic sur le schéma, bouton, ou tirage au sort),
 * après application des effets.
 */
export async function ouvrirDialogueMutilation(actor) {
  const html = await foundry.applications.handlebars.renderTemplate("systems/insectopia/templates/dialog/mutilation.html", {});

  return new Promise((resolve) => {
    let dlg;
    dlg = new Dialog({
      title: `Mutilation — Localisation (${actor.name})`,
      content: html,
      buttons: {
        cancel: { icon: '<i class="fas fa-times"></i>', label: "Annuler", callback: () => resolve(null) },
      },
      default: "cancel",
      render: (dialogHtml) => {
        const root = dialogHtml[0] ?? dialogHtml;

        const choisirZone = async (zoneKey, source) => {
          await appliquerMutilation(actor, zoneKey, source);
          dlg.close();
          resolve(zoneKey);
        };

        for (const el of root.querySelectorAll(".loc-hotspot, .loc-zone-btn")) {
          el.addEventListener("click", () => choisirZone(el.dataset.zone, "manuel"));
        }

        const tirageBtn = root.querySelector(".loc-tirage-btn");
        tirageBtn?.addEventListener("click", () => {
          const couleur = tirerBlatteLocalisation();
          choisirZone(LOCALISATION_ZONES[couleur].zone, "hasard");
        });
      },
    });
    dlg.render(true);
  });
}