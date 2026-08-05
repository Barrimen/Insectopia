import { Blattes } from "../common/roll.js";
import { ROLL_TYPE } from "../common/config.js";
import { RACES } from "../common/data-races.js";
import { CASTES } from "../common/data-castes.js";
import { extraireSphereDepuisLabel, SPHERES } from "../common/data-spheres.js";
import { asArray } from "../common/utils.js";
import { ouvrirDialogueMutilation } from "../combat/mutilation.js";

/**
 * IntreActor
 * ---------------------------------------------------------------------
 * Actor Foundry pour un personnage (ou PNJ) d'Insectopia : un « intre ».
 */
export default class IntreActor extends Actor {
  /** @override */
  prepareDerivedData() {
    if (this.type === "intre") this._prepareDataIntre();
  }

  /**
   * Calcule les attributs secondaires (livret de règles p.28) :
   *  - Blessures (Impact = Résistance, Blessure interne = Métabolisme)
   *  - Initiative = Activité modifiée par l'encombrement
   *  - malus courant lié aux blessures internes (-1 par blessure interne,
   *    à toutes les compétences et caractéristiques)
   */
  _prepareDataIntre() {
    const carac = this.system.caracteristiques;

    this.system.combat.blessures.impact.max = carac.chitine.competences.resistance.value;
    this.system.combat.blessures.blessureinterne.max = carac.temperature.competences.metabolisme.value;

    this.system.combat.initiative = Math.max(
      0,
      carac.temperature.competences.activite.value -
        (this.system.combat.encombrement || 0) -
        this.getModificateursInitiativeEquipement().actionMalus
    );

    this.system.combat.vitesseSol = carac.aile.value;
    // Livre de base p.196 : vitesse en vol = Aile + 2 (le kit de démarrage,
    // simplifié, indiquait Aile x2 — corrigé ici pour suivre le livre de base).
    this.system.combat.vitesseVol = carac.aile.value + 2;

    // House Rule (non écrite au livre, cf. module/combat/mutilation.js) :
    // le livret p.30 ne chiffre aucun effet pour une Mutilation à
    // l'Aile/la Patte (juste "mutilation permanente"). On applique ici un
    // malus simple, isolé et facile à retirer/ajuster si besoin.
    if (this.getFlag("insectopia", "aileMutilee")) this.system.combat.vitesseVol = 0;
    if (this.getFlag("insectopia", "patteMutilee")) {
      this.system.combat.vitesseSol = Math.max(0, this.system.combat.vitesseSol - 2);
    }

    // Fluide (livre de base p.206) : ressource consommée par de nombreuses
    // capacités pour améliorer la couleur d'un tirage. Égal à Chrysalide +
    // Métabolisme + Souillure.
    this.system.combat.fluide.max =
      carac.chitine.competences.chrysalide.value + carac.temperature.competences.metabolisme.value + (this.system.combat.souillure || 0);
    if (this.system.combat.fluide.value > this.system.combat.fluide.max) {
      this.system.combat.fluide.value = this.system.combat.fluide.max;
    }

    this.system.malusBlessuresInternes = -(this.system.combat.blessures.blessureinterne.value || 0);
  }

  /**
   * Jet d'une compétence (ou d'une caractéristique utilisée comme
   * compétence), en OPPOSITION à un adversaire ou en DIFFICULTE face à un
   * niveau fixé par le Deus — le choix entre les deux se fait dans le
   * dialogue de tirage.
   *
   * @param caracKey  clé de la caractéristique (ex: "antenne")
   * @param compKey   clé de la compétence (ex: "pheromones"), ou null pour
   *                  utiliser directement la caractéristique
   */
  async check(caracKey, compKey = null) {
    const caracteristique = this.system.caracteristiques[caracKey];
    if (!caracteristique) return;

    const cible = compKey ? caracteristique.competences[compKey] : caracteristique;
    if (!cible || typeof cible.value === "undefined") return;

    const competence = {
      value: cible.value,
      label: cible.label ?? caracteristique.label ?? caracKey,
      caracKey,
      compKey,
    };
    const data = { modifier: (this.system.malusBlessuresInternes || 0) + this.getCapaciteBonus(caracKey, compKey) };

    const blattes = new Blattes(this, ROLL_TYPE.OPPOSITION, competence, data);
    blattes.openDialog();
  }

  /**
   * Jet d'Attaque (Mêlée / Tir / Prédateur), opposé à la Défense de
   * l'adversaire (livret p.29). Si une arme correspondante est équipée,
   * son modificateur d'Attaque est appliqué automatiquement, et son
   * modificateur de Dégâts sera repris automatiquement lors du test de
   * Dégâts enchaîné (voir Blattes.resoudreChoixAttaque). En cas de
   * réussite, le joueur choisit la couleur retenue dans le message de
   * chat, ce qui enchaîne automatiquement le test de Dégâts.
   *
   * @param competenceCombat  "melee" | "tir" | "predateur"
   */
  async attack(competenceCombat) {
    const map = { melee: "mandibule", tir: "antenne", predateur: "mandibule" };
    const caracKey = map[competenceCombat];
    if (!caracKey) return;

    const cible = this.system.caracteristiques[caracKey].competences[competenceCombat];
    if (!cible) return;

    const arme = this.getArmeEquipee(competenceCombat);

    // Verrou de rechargement (livre de base p.240) : tant que l'arme n'a
    // pas encaissé son nombre d'actions de recharge, l'Attaque est
    // bloquée. Voir tickRechargesArmes() pour la décrémentation.
    if (arme?.system.actionsRechargeRestantes > 0) {
      ui.notifications.warn(
        `${arme.name} est en cours de rechargement (encore ${arme.system.actionsRechargeRestantes} action(s) avant de pouvoir tirer).`
      );
      return;
    }

    // Munitions : automatisation absente telle quelle du livret (qui ne
    // chiffre qu'un coût en actions de recharge, pas un stock), ajoutée
    // à la demande d'Obe. Bloque le tir si l'arme requiert un type de
    // munition (system.munitionType) et que l'acteur n'en possède plus
    // (Item "objet" avec le même munitionType, quantite > 0).
    let munition = null;
    if (arme?.system.munitionType) {
      munition = this.items.find(
        (i) => i.type === "objet" && i.system.munitionType === arme.system.munitionType && (i.system.quantite || 0) > 0
      );
      if (!munition) {
        ui.notifications.warn(`${this.name} n'a plus de munitions (${arme.system.munitionType}) pour ${arme.name}.`);
        return;
      }
    }

    const bonusCapacite = this.getCapaciteBonus(caracKey, competenceCombat);
    const modifier = (this.system.malusBlessuresInternes || 0) + (arme?.system.modificateurAttaque || 0) + bonusCapacite;

    const competence = { value: cible.value, label: cible.label, caracKey, compKey: competenceCombat };
    const data = {
      modifier,
      itemId: arme?.id ?? null,
      nomArme: arme?.name ?? "attaque naturelle",
      munitionItemId: munition?.id ?? null,
    };

    const blattes = new Blattes(this, ROLL_TYPE.ATTACK, competence, data);
    blattes.openDialog();
  }

  /**
   * Consomme le tir d'une arme à distance au moment où le joueur confirme
   * le tirage de Blattes d'Attaque (roll.js, callback du bouton "Piocher"
   * — volontairement pas dans attack() pour ne rien consommer si le
   * dialogue est annulé) : décrémente le stock de munitions liées s'il y
   * en a, puis arme le verrou de rechargement (livre de base p.240).
   */
  async consommerTirDistance(itemId, munitionItemId) {
    const arme = itemId ? this.items.get(itemId) : null;
    if (!arme || arme.type !== "arme") return;

    if (munitionItemId) {
      const munition = this.items.get(munitionItemId);
      if (munition) {
        const restant = Math.max(0, (munition.system.quantite || 0) - 1);
        await munition.update({ "system.quantite": restant });
      }
    }

    if (arme.system.rechargeActions > 0) {
      await arme.update({ "system.actionsRechargeRestantes": arme.system.rechargeActions });
    }
  }

  /**
   * Décrémente d'une action le compteur de rechargement de toutes les
   * armes à distance équipées encore en cours de rechargement. Appelé à
   * chaque action dépensée en combat (InsectopiaCombatant.depenserBlatte).
   *
   * Hypothèse d'automatisation à valider avec Obe : le livret chiffre un
   * coût en actions de recharge sans préciser si ces actions doivent être
   * exclusivement dédiées à la recharge ou si n'importe quelle action du
   * combattant la fait progresser. On retient ici la seconde lecture
   * (plus simple à automatiser) ; à revoir si ça ne correspond pas à
   * l'intention du livre.
   */
  async tickRechargesArmes() {
    const armes = this.items.filter((i) => i.type === "arme" && i.system.actionsRechargeRestantes > 0);
    if (!armes.length) return;
    const updates = armes.map((i) => ({
      _id: i.id,
      "system.actionsRechargeRestantes": Math.max(0, i.system.actionsRechargeRestantes - 1),
    }));
    await this.updateEmbeddedDocuments("Item", updates);
  }

  /**
   * Arme équipée correspondant à une compétence de combat donnée, s'il y
   * en a une (sinon l'attaque est considérée comme une attaque naturelle,
   * sans modificateur d'arme).
   */
  getArmeEquipee(competenceCombat) {
    return this.items.find(
      (i) => i.type === "arme" && i.system.equipee && i.system.competenceCombat === competenceCombat
    );
  }

  /**
   * Chitine totale de l'attaquant pour le test de Dégâts, arme comprise.
   * Certaines armes (Arbalète et Crache-sang fétide des Anciens Dieux,
   * livret p.240) ont un facteur de dégâts fixe qui remplace la Chitine
   * de l'attaquant plutôt que de s'y ajouter.
   */
  getChitineAttaqueTotal(itemId) {
    const base = this.system.caracteristiques.chitine.value;
    const arme = itemId ? this.items.get(itemId) : null;
    if (arme && typeof arme.system.degatsFixes === "number") return arme.system.degatsFixes;
    return base + (arme?.system.modificateurDegats || 0);
  }

  /** Chitine totale du défenseur pour le test de Dégâts, armures comprises. */
  getChitineDefenseTotal() {
    const base = this.system.caracteristiques.chitine.value;
    const bonusArmures = this.items
      .filter((i) => i.type === "armure" && i.system.equipee)
      .reduce((sum, i) => sum + (i.system.bonusChitine || 0), 0);
    return base + bonusArmures;
  }

  /** Somme des malus d'encombrement des armures équipées. */
  /**
   * Modificateurs d'Initiative cumulés de l'équipement (livre de base
   * p.239-240) : chaque armure/arme équipée porte un `modInitiativeType`
   * parmi "aucun" / "-1couleur" / "+1couleur" / "-1action".
   *
   *  - "-1action" réduit le nombre d'actions du tour (Activité) de un.
   *  - "-1couleur"/"+1couleur" dégradent/améliorent d'un cran la couleur
   *    de CHAQUE Blatte tirée à l'initiative (appliqué dans
   *    Blattes.piocher(), pas ici).
   *
   * Force de titan (p.216) atténue d'un cran chaque malus, objet par
   * objet, avant cumul : -1action → -1couleur → aucun. Les bonus
   * (+1couleur) ne sont pas concernés (la capacité ne parle que des
   * malus d'armure).
   *
   * Empilement (décision Obe, non chiffrée telle quelle au livret) :
   * si le cumul des malus atteint ou dépasse 2 crans de sévérité (ex :
   * deux "-1couleur", ou un "-1action" isolé), le résultat final est
   * plafonné à "-1action" plutôt que de dégrader indéfiniment la couleur.
   *
   * @returns {{actionMalus:number, couleurShift:number, allongeBonus:number}}
   */
  getModificateursInitiativeEquipement() {
    const aForceDeTitan = this.items.some((i) => i.type === "capacite" && i.name === "Force de titan");

    const SEVERITE = { "-1action": 2, "-1couleur": 1, aucun: 0, "": 0 };

    const equipements = [
      ...this.items.filter((i) => i.type === "armure" && i.system.equipee),
      ...this.items.filter((i) => i.type === "arme" && i.system.equipee),
    ];

    let severiteTotale = 0;
    let couleurBonus = 0;
    let allongeBonus = 0;

    for (const item of equipements) {
      const type = item.system.modInitiativeType || "aucun";
      if (type === "+1couleur") {
        couleurBonus += 1;
      } else {
        let severite = SEVERITE[type] ?? 0;
        if (aForceDeTitan && severite > 0) severite -= 1; // atténuation d'un cran, par objet
        severiteTotale += severite;
      }
      allongeBonus += item.system.bonusAllongePremiereBlatte || 0;
    }

    // Conversion de la sévérité cumulée en malus final : 0 = aucun,
    // 1 = -1couleur, 2+ = -1action (plafond, cf. décision empilement).
    const actionMalus = severiteTotale >= 2 ? 1 : 0;
    const couleurMalus = severiteTotale === 1 ? 1 : 0;

    return {
      actionMalus,
      couleurShift: couleurBonus - couleurMalus,
      allongeBonus,
    };
  }

  /**
   * Poids total porté (indrammes), somme de quantite * poidsUnitaire sur
   * tous les Items de type "objet" (livre de base p.242). N'inclut
   * volontairement pas les armes/armures, qui n'ont pas de champ poids
   * dans ce système — à revoir si besoin un jour.
   */
  getPoidsTotalObjets() {
    return this.items
      .filter((i) => i.type === "objet")
      .reduce((sum, i) => sum + (i.system.quantite || 0) * (i.system.poidsUnitaire || 0), 0);
  }

  /**
   * Seuil "Porter" (livre de base p.206, table Chitine -> Lever/Porter,
   * en indrammes). Pas de formule donnée dans le livre : table en dur,
   * bornée aux valeurs 2-8 listées. Au-delà, on extrapole en gardant la
   * dernière valeur connue plutôt que d'inventer une progression.
   * Note : ce seuil n'est pour l'instant qu'informatif — aucun malus
   * automatique n'est appliqué en cas de dépassement (à faire si besoin).
   */
  getPoidsPorte() {
    const TABLE_PORTER = { 2: 10, 3: 20, 4: 30, 5: 50, 6: 80, 7: 100, 8: 150 };
    const chitine = this.system.caracteristiques?.chitine?.value ?? 3;
    if (TABLE_PORTER[chitine] !== undefined) return TABLE_PORTER[chitine];
    const clef = Math.max(2, Math.min(8, chitine));
    return TABLE_PORTER[clef];
  }

  /**
   * Bonus chiffré automatique apporté par les capacités spéciales
   * possédées (livret p.27-28, ex : Antennes ramifiées => +1 Antenne).
   * Ne prend en compte que les capacités dont system.bonus.actif est
   * coché et dont la caractéristique (et, le cas échéant, la compétence)
   * correspond à celle du jet en cours.
   */
  getCapaciteBonus(caracKey, compKey = null) {
    return this.items
      .filter((i) => i.type === "capacite" && i.system.bonus?.actif && i.system.bonus?.caracKey === caracKey)
      .filter((i) => !i.system.bonus?.compKey || i.system.bonus.compKey === compKey)
      .reduce((sum, i) => sum + (i.system.bonus?.valeur || 0), 0);
  }

  /**
   * Applique les valeurs de caractéristiques et les capacités natives
   * d'une race (livre de base p.198-201) au personnage. Écrase les
   * valeurs actuelles des 7 caractéristiques et crée un Item "capacite"
   * pour chaque capacité native non déjà possédée (categorie: "race").
   * Pour les araks, voir la note dans data-races.js : Patte/Palpe/
   * Chélicère sont approximés par Aile/Antenne/Mandibule.
   */
  async applyRace(raceKey) {
    const race = RACES[raceKey];
    if (!race) return;

    const updates = { "system.identite.race": race.label };
    for (const [caracKey, value] of Object.entries(race.caracteristiques)) {
      updates[`system.caracteristiques.${caracKey}.value`] = value;
    }
    await this.update(updates);

    const capacitesExistantes = new Set(this.items.filter((i) => i.type === "capacite").map((i) => i.name));
    const nouvellesCapacites = race.capacites
      .filter((nom) => !capacitesExistantes.has(nom))
      .map((nom) => ({
        name: nom,
        type: "capacite",
        img: "icons/svg/mystery-man.svg",
        system: { categorie: "race", description: `Capacité native de race (${race.label}).` },
      }));
    if (nouvellesCapacites.length) await this.createEmbeddedDocuments("Item", nouvellesCapacites);

    if (race.variante === "arak") {
      ui.notifications.info(
        "Race arak : Patte/Palpe/Chélicère remplacent Aile/Antenne/Mandibule, et Soie remplace Mêlée (livret p.197). Renommez manuellement sur la fiche si besoin."
      );
    }
  }

  /**
   * Applique le choix de caste et de métier (livre de base p.203-204) :
   *  - Nom de la caste/métier sur la fiche.
   *  - Bonus de caste : +1 sur la caractéristique choisie.
   *  - Les deux compétences de métier, ajoutées comme compétences de
   *    Caste de départ (tableau libre system.caracteristiques.caste.competences).
   *  - Les capacités de caste ne sont volontairement pas automatisées ici :
   *    leur liste précise dépend d'un choix libre du joueur (livre de base
   *    p.203, "au choix") ; à ajouter manuellement via le bouton "Ajouter
   *    une capacité" de la fiche, ou depuis le compendium de capacités.
   *
   * @param casteKey        clé dans CASTES (ex: "combattant")
   * @param metierKey       clé du métier dans CASTES[casteKey].metiers
   * @param bonusCaracKey   caractéristique choisie pour le bonus de caste
   * @param sphereChoix     tableau ORDONNÉ de clés de sphère, une par
   *                        compétence "au choix parmi ..." rencontrée dans
   *                        metier.competences, DANS L'ORDRE. Pas un objet
   *                        indexé par libellé : un métier peut avoir deux
   *                        fois EXACTEMENT le même intitulé ambigu (ex:
   *                        Contrôleur d'énergie), qu'un objet ne peut pas
   *                        distinguer. Résolu à l'étape 3 de l'assistant.
   */
  async applyCaste(casteKey, metierKey, bonusCaracKey, sphereChoix = []) {
    const caste = CASTES[casteKey];
    const metier = caste?.metiers?.[metierKey];
    if (!caste || !metier) return;

    const updates = {
      "system.identite.casteNom": caste.label,
      "system.identite.metier": metier.label,
      "system.identite.casteKey": casteKey,
      "system.identite.metierKey": metierKey,
    };
    if (bonusCaracKey && this.system.caracteristiques[bonusCaracKey]) {
      updates[`system.caracteristiques.${bonusCaracKey}.value`] = this.system.caracteristiques[bonusCaracKey].value + 1;
    }

    const competencesCaste = foundry.utils.duplicate(asArray(this.system.caracteristiques.caste.competences));
    // sphereChoix est un tableau ordonné (une valeur par compétence ambiguë
    // rencontrée dans metier.competences, dans l'ordre) — pas un objet
    // indexé par texte de libellé : deux compétences peuvent avoir
    // EXACTEMENT le même intitulé ambigu (ex: Contrôleur d'énergie a deux
    // fois "Sphère de magie (au choix parmi Eau/Air/Feu/Terre)"), ce
    // qu'un objet ne peut pas distinguer.
    const sphereChoixRestants = [...sphereChoix];
    const occurrences = {}; // combien de fois CE texte de métier a déjà été traité dans cette boucle
    for (const label of metier.competences) {
      const occurrence = (occurrences[label] = (occurrences[label] || 0) + 1);
      // Dédup par origineMetier (texte original du métier), pas par label
      // affiché : ce dernier est réécrit avec la sphère résolue et ne
      // correspond donc plus au texte du métier dès le deuxième passage
      // dans l'assistant (ex: "Rouvrir la création") — sans ce marqueur
      // stable, on perdrait la détection "déjà acquise" et on dupliquerait
      // la compétence à chaque nouveau passage (cf. capture du 05/08 :
      // 4 lignes de Sphère pour un métier qui n'en donne que 2).
      const dejaAcquises = competencesCaste.filter((c) => (c.origineMetier ?? c.label) === label).length;
      if (dejaAcquises >= occurrence) continue;

      const sphereAuto = extraireSphereDepuisLabel(label);
      const sphereChoisie = sphereAuto ?? sphereChoixRestants.shift() ?? null;
      // Le libellé affiché doit toujours nommer la sphère résolue, jamais
      // rester sur le texte ambigu "au choix parmi ..." une fois le choix
      // fait — c'est justement ce que montrait la capture du 05/08.
      const labelFinal =
        sphereChoisie && !sphereAuto ? `Sphère de magie (${SPHERES[sphereChoisie]?.label ?? sphereChoisie})` : label;
      const entry = { id: foundry.utils.randomID(), label: labelFinal, value: 1, origineMetier: label };
      if (sphereChoisie) entry.sphere = sphereChoisie;
      competencesCaste.push(entry);
    }
    updates["system.caracteristiques.caste.competences"] = competencesCaste;

    await this.update(updates);

    // p.229 : capacité offerte automatiquement par certaines castes (ex. Ailé pour les Dominants), sans coût de choix ni Souillure.
    if (caste.capaciteGratuite) {
      const dejaPresente = this.items.some((i) => i.type === "capacite" && i.name === caste.capaciteGratuite);
      if (!dejaPresente) {
        await this.createEmbeddedDocuments("Item", [
          {
            name: caste.capaciteGratuite,
            type: "capacite",
            img: "icons/svg/mystery-man.svg",
            system: { categorie: "caste", description: `Capacité offerte gratuitement par la caste (${caste.label}, livre de base p.229).` },
          },
        ]);
      }
    }
  }

  /**
   * Tirage des Blattes de chance en début de scénario. Le nombre de
   * blattes tirées est égal au score d'Instinct.
   */
  async chanceRoll() {
    const competence = {
      value: this.system.caracteristiques.esprit.competences.instinct.value,
      label: "INSECTOPIA.label.competences.instinct",
    };
    const blattes = new Blattes(this, ROLL_TYPE.CHANCE, competence, {});
    blattes.openDialog();
  }

  /**
   * Tirage d'initiative en tour de combat.
   */
  async rollInitiative() {
    const competence = { value: this.system.combat.initiative, label: "INSECTOPIA.label.combat.initiative" };
    const blattes = new Blattes(this, ROLL_TYPE.INITIATIVE, competence, {});
    return blattes.openDialog();
  }

  // --------------------------------------------------------------------
  // Encaissement des dégâts (livret p.30)
  // --------------------------------------------------------------------
  /**
   * Ajoute des impacts au personnage. Une fois le total d'impacts au-delà
   * de la Résistance (max), le surplus est reporté en Blessures internes.
   * Chaque Blessure interne applique un malus de -1 à toutes les
   * compétences/caractéristiques (déjà reflété dans malusBlessuresInternes,
   * recalculé par prepareDerivedData après update()). Au maximum de
   * Blessures internes, le personnage sombre dans l'inconscience.
   */
  async subirImpacts(nbImpacts) {
    const blessures = foundry.utils.duplicate(this.system.combat.blessures);
    let impactValue = (blessures.impact.value || 0) + nbImpacts;
    let surplus = 0;
    if (impactValue > blessures.impact.max) {
      surplus = impactValue - blessures.impact.max;
      impactValue = blessures.impact.max;
    }
    blessures.impact.value = impactValue;
    blessures.blessureinterne.value = Math.min(
      blessures.blessureinterne.max,
      (blessures.blessureinterne.value || 0) + surplus
    );

    await this.update({ "system.combat.blessures": blessures });

    if (blessures.blessureinterne.value >= blessures.blessureinterne.max) {
      ui.notifications.warn(
        `${this.name} sombre dans l'inconscience. Sans soins rapides, il meurt d'hémorragie dans les 10 rounds qui suivent.`
      );
    }
    return blessures;
  }

  /**
   * Choix de la partie du corps sectionnée par une mutilation (livret
   * p.30) : tête ou abdomen -> mort immédiate ; thorax -> immobilisation ;
   * aile ou patte -> mutilation permanente (House Rule de malus, cf.
   * _prepareDataIntre). Ouvre le dialogue de Localisation (schéma
   * cliquable + tirage au sort optionnel), voir module/combat/mutilation.js.
   */
  async demanderMutilation() {
    return ouvrirDialogueMutilation(this);
  }
}