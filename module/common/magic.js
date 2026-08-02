import { Blattes } from "./roll.js";
import { ROLL_TYPE } from "./config.js";
import { SPHERES, MOTS_POUVOIR, MOTS_POUVOIR_PAR_METIER, TABLE_INFLUENCE } from "./data-spheres.js";
import { asArray } from "./utils.js";

/**
 * Ouvre la boîte de dialogue de lancer de sort (livre p.262-276) pour cet
 * acteur.
 *
 * Pré-requis pour qu'un sort soit proposé :
 *  - au moins une compétence de Caste taguée avec un champ "sphere" valide
 *    (posé automatiquement par applyCaste() quand le libellé est non
 *    ambigu, ou à la main sur la fiche sinon — livre p.267) ;
 *  - system.identite.metierKey renseigné (posé par applyCaste()) et
 *    présent dans MOTS_POUVOIR_PAR_METIER.
 *
 * Le formulaire libre proposé calcule à chaque lancer, sans rien
 * enregistrer sur la fiche : Sphère + Mot de pouvoir (combinaisons
 * filtrées selon le métier) puis 5 niveaux d'Influence (Puissance/Portée/
 * Cibles/Zone d'effet/Durée, 0 à 7 chacun) dont la somme forme la
 * Difficulté qui s'oppose au score de Sphère.
 */
export async function ouvrirDialogueLancerSort(actor) {
  const competencesCaste = asArray(actor.system.caracteristiques.caste.competences);
  const spheresConnues = competencesCaste
    .map((c, index) => ({ ...c, index }))
    .filter((c) => c.sphere && SPHERES[c.sphere]);

  if (!spheresConnues.length) {
    ui.notifications.warn(
      `${actor.name} ne connaît aucune Sphère de magie taguée. Sur la fiche, choisis la Sphère correspondante dans le menu déroulant de la ligne de compétence de Caste concernée (livre p.267).`
    );
    return;
  }

  const metierKey = actor.system.identite.metierKey;
  const motsParMetier = MOTS_POUVOIR_PAR_METIER[metierKey];
  if (!motsParMetier) {
    ui.notifications.warn(
      `${actor.name} n'a pas de métier divin reconnu (métier vide ou non répertorié dans data-spheres.js). Repasse par "Appliquer la caste" dans l'assistant de création, ou vérifie system.identite.metierKey.`
    );
    return;
  }

  // Intersection des Sphères connues par le personnage et de la table des
  // Mots de pouvoir autorisés par son métier (livre p.267).
  const combinaisons = [];
  for (const sphere of spheresConnues) {
    const motsAutorises = motsParMetier[sphere.sphere];
    if (!motsAutorises) continue; // Sphère connue mais étrangère au métier : ne devrait pas arriver si bien taguée.
    for (const mot of motsAutorises) {
      combinaisons.push({
        value: `${sphere.index}|${mot}`,
        label: `${SPHERES[sphere.sphere].label} — ${MOTS_POUVOIR[mot]} (score ${sphere.value})`,
        sphereKey: sphere.sphere,
        sphereLabel: SPHERES[sphere.sphere].label,
        sphereValue: sphere.value,
        mot,
        motLabel: MOTS_POUVOIR[mot],
      });
    }
  }

  if (!combinaisons.length) {
    ui.notifications.warn(
      `${actor.name} : aucune combinaison Sphère/Mot de pouvoir valide pour son métier parmi ses Sphères connues (livre p.267).`
    );
    return;
  }

  const html = await foundry.applications.handlebars.renderTemplate("systems/insectopia/templates/dialog/sort-cast.html", {
    combinaisons,
    tableInfluence: TABLE_INFLUENCE,
  });

  return new Dialog({
    title: `Lancer un sort — ${actor.name}`,
    content: html,
    buttons: {
      lancer: {
        icon: '<i class="fas fa-hand-sparkles"></i>',
        label: "Lancer le sort",
        callback: async (dialogHtml) => {
          const comboValue = dialogHtml.find("#sort-combo")[0]?.value;
          const trouvee = combinaisons.find((c) => c.value === comboValue);
          if (!trouvee) return;

          const niveauPuissance = parseInt(dialogHtml.find("#sort-puissance")[0]?.value) || 0;
          const niveauPortee = parseInt(dialogHtml.find("#sort-portee")[0]?.value) || 0;
          const niveauCibles = parseInt(dialogHtml.find("#sort-cibles")[0]?.value) || 0;
          const niveauZone = parseInt(dialogHtml.find("#sort-zone")[0]?.value) || 0;
          const niveauDuree = parseInt(dialogHtml.find("#sort-duree")[0]?.value) || 0;
          const difficulteSort = niveauPuissance + niveauPortee + niveauCibles + niveauZone + niveauDuree;

          const competence = { value: trouvee.sphereValue, label: trouvee.sphereLabel };
          const data = {
            modifier: actor.system.malusBlessuresInternes || 0,
            introTextOverride: `${actor.name} lance un sort : ${trouvee.sphereLabel} (${trouvee.motLabel}) — Difficulté ${difficulteSort} (Puissance ${niveauPuissance}).`,
            sphereKey: trouvee.sphereKey,
            sphereLabel: trouvee.sphereLabel,
            motPouvoir: trouvee.mot,
            motPouvoirLabel: trouvee.motLabel,
            niveauPuissance,
            difficulteSort,
          };

          const blattes = new Blattes(actor, ROLL_TYPE.SORT, competence, data);
          return blattes.lancerSort();
        },
      },
      cancel: { icon: '<i class="fas fa-times"></i>', label: "Annuler", callback: () => {} },
    },
    default: "lancer",
  }).render(true);
}
