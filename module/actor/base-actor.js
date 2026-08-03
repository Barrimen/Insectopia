import { Blattes } from "../common/roll.js";
import { ROLL_TYPE } from "../common/config.js";
import { RACES } from "../common/data-races.js";
import { CASTES } from "../common/data-castes.js";
import { extraireSphereDepuisLabel } from "../common/data-spheres.js";
import { asArray } from "../common/utils.js";

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
      carac.temperature.competences.activite.value - (this.system.combat.encombrement || 0) - this.getEncombrementArmures()
    );

    this.system.combat.vitesseSol = carac.aile.value;
    // Livre de base p.196 : vitesse en vol = Aile + 2 (le kit de démarrage,
    // simplifié, indiquait Aile x2 — corrigé ici pour suivre le livre de base).
    this.system.combat.vitesseVol = carac.aile.value + 2;

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

    const competence = { value: cible.value, label: cible.label, caracKey, compKey };
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
    const bonusCapacite = this.getCapaciteBonus(caracKey, competenceCombat);
    const modifier = (this.system.malusBlessuresInternes || 0) + (arme?.system.modificateurAttaque || 0) + bonusCapacite;

    const competence = { value: cible.value, label: cible.label, caracKey, compKey: competenceCombat };
    const data = {
      modifier,
      itemId: arme?.id ?? null,
      nomArme: arme?.name ?? "attaque naturelle",
    };

    const blattes = new Blattes(this, ROLL_TYPE.ATTACK, competence, data);
    blattes.openDialog();
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
  getEncombrementArmures() {
    return this.items
      .filter((i) => i.type === "armure" && i.system.equipee)
      .reduce((sum, i) => sum + (i.system.malusEncombrement || 0), 0);
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
        img: "icons/magic/symbols/rune-sigil-blue-pink.webp",
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
   */
  async applyCaste(casteKey, metierKey, bonusCaracKey) {
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
    for (const label of metier.competences) {
      if (!competencesCaste.some((c) => c.label === label)) {
        // Pour un métier divin, "Sphère de magie (Vie)" est non ambigu et se
        // tague automatiquement ; "Sphère de magie (au choix parmi ...)"
        // reste à taguer manuellement sur la fiche (livre de base p.267).
        const sphere = extraireSphereDepuisLabel(label);
        competencesCaste.push(sphere ? { label, value: 1, sphere } : { label, value: 1 });
      }
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
            img: "icons/magic/symbols/rune-sigil-blue-pink.webp",
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
   * p.30) : tête ou abdomen -> mort immédiate ; thorax -> immobilisation.
   * Le joueur/Deus effectuant le test de dégâts choisit la partie du corps.
   */
  async demanderMutilation() {
    const actor = this;
    return new Promise((resolve) => {
      new Dialog({
        title: `Mutilation — ${actor.name}`,
        content: `<p>Quelle partie du corps est sectionnée par cette mutilation ?</p>`,
        buttons: {
          tete: {
            label: "Tête (mort immédiate)",
            callback: async () => {
              await actor.toggleStatusEffect?.("dead", { active: true });
              ui.notifications.error(`${actor.name} meurt sur le coup (mutilation à la tête).`);
              resolve("tete");
            },
          },
          abdomen: {
            label: "Abdomen (mort immédiate)",
            callback: async () => {
              await actor.toggleStatusEffect?.("dead", { active: true });
              ui.notifications.error(`${actor.name} meurt sur le coup (mutilation à l'abdomen).`);
              resolve("abdomen");
            },
          },
          thorax: {
            label: "Thorax (immobilisation)",
            callback: async () => {
              await actor.setFlag("insectopia", "immobilise", true);
              ui.notifications.warn(`${actor.name} est immobilisé (mutilation au thorax).`);
              resolve("thorax");
            },
          },
        },
        default: "thorax",
      }).render(true);
    });
  }
}
