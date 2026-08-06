import { ROLL_TYPE, SAC_BLATTES, DIFFICULTE, RESULTAT_ATTAQUE, RESULTAT_DEGATS, RESULTAT_SORT, RESULTAT_SIMPLE, ORDRE_COULEURS_CROISSANT } from "./config.js";

const { DialogV2 } = foundry.applications.api;

/** Noms affichables des couleurs de Blattes, utilisés par l'échange de Blattes de chance. */
const NOM_COULEUR = { rouge: "Rouge", verte: "Verte", bleue: "Bleue", blanche: "Blanche", noire: "Noire" };

/**
 * Classe Blattes
 * ---------------------------------------------------------------------
 * Moteur de résolution des actions d'Insectopia : tirage d'une ou plusieurs
 * blattes de couleur dans un sac de 42 (3 noires, 18 blanches, 12 bleues,
 * 6 vertes, 3 rouges).
 *
 * Règles reprises (livret de règles p.24-25) :
 *  - Opposition = 0            -> tirer 1 blatte, résultat imposé.
 *  - Opposition = +1           -> tirer 1 blatte ; le joueur peut la refuser
 *                                  et repiocher, mais doit garder le second
 *                                  résultat.
 *  - Opposition = -1           -> tirer 1 blatte ; le Deus (ou l'adversaire)
 *                                  peut imposer un nouveau tirage, dont le
 *                                  résultat est définitif.
 *  - Opposition = +2, +3, ...  -> tirer un nombre de blattes égal à la
 *                                  valeur ; le joueur choisit la meilleure.
 *  - Opposition = -2, -3, ...  -> tirer un nombre de blattes égal à la
 *                                  valeur absolue ; le Deus (ou l'adversaire)
 *                                  choisit celle qui convient.
 *
 * Pour les jets ATTACK et DEGATS (livret p.29-30), le choix de la blatte
 * retenue n'est pas seulement cosmétique : il déclenche la suite de la
 * résolution (test de dégâts après une attaque réussie, application des
 * impacts, mutilation...). Ce choix est donc matérialisé par des boutons
 * cliquables dans le message de chat plutôt que laissé à une simple
 * lecture du tableau de résultat.
 */
export class Blattes {
  constructor(actor, rolltype, competence, data) {
    this.actor = actor;
    this.rolltype = rolltype;
    this.competence = competence;
    this.data = data ?? {};
    this.isReroll = false;
  }

  // --------------------------------------------------------------------
  // Ouverture du dialogue de jet
  // --------------------------------------------------------------------
  async openDialog() {
    this.data.isAttack = this.rolltype === ROLL_TYPE.ATTACK;
    this.data.isDegats = this.rolltype === ROLL_TYPE.DEGATS;

    let visibilityMode = this.data.rollMode ?? game.settings.get("core", "rollMode");
    if (game.user.isGM) {
      const visibilityChoice = game.settings.get("insectopia", "visibiliteJetsPNJ");
      if (visibilityChoice === "public") visibilityMode = "publicroll";
      else if (visibilityChoice === "private") visibilityMode = "gmroll";
      else if (visibilityChoice === "depends") visibilityMode = game.settings.get("core", "rollMode");
    }
    this.data.rollMode = visibilityMode;

    if (this.rolltype === ROLL_TYPE.SIMPLE) {
      this.data.introText = "Pioche simple de blattes";
      this.data.actorname = game.users.get(game.userId)?.name;
      this.data.charImg = "icons/svg/mystery-man.svg";
    } else {
      this.data.introText =
        this.data.introTextOverride ??
        game.i18n.format("INSECTOPIA.dialog.introtext." + this.rolltype, {
          actorname: this.actor.name,
          competence: game.i18n.localize(this.competence.label),
        });
      this.data.actorname = this.actor.name;
      this.data.charImg = this.actor.img;
    }

    // Tirage immédiat, sans dialogue, pour la Chance et l'Initiative.
    if ([ROLL_TYPE.CHANCE, ROLL_TYPE.INITIATIVE].includes(this.rolltype)) {
      this.data.formula = this.competence.value.toString();
      this.data.formulaValue = this.competence.value;
      await this.piocher();
      return await this.showResult();
    }

    const html = await foundry.applications.handlebars.renderTemplate(
      "systems/insectopia/templates/chat/roll-dialog.html",
      {
        actorname: this.data.actorname,
        competence: this.competence,
        isAttack: this.data.isAttack,
        introText: this.data.introText,
        charImg: this.data.charImg,
        difficulteLabels: DIFFICULTE,
        isSimple: this.rolltype === ROLL_TYPE.SIMPLE,
      }
    );

    return await DialogV2.wait({
      window: { title: "Tirage de Blattes" },
      content: html,
      buttons: [
        {
          action: "roll",
          icon: "fas fa-check",
          label: "Piocher",
          default: true,
          callback: async (event, button) => {
            // Détection de la cible ciblée sur la scène (game.user.targets),
            // si c'est un intre : elle devient éligible à l'échange de
            // Blattes de chance sur CE jet, en plus du rôleur lui-même
            // (livre — un joueur peut remplacer les Blattes de son propre
            // tirage, OU celles du tirage de son adversaire). S'applique à
            // l'Attaque comme à tout jet d'Opposition/Difficulté avec une
            // cible sélectionnée (demande d'Obe).
            const cibleActor = Array.from(game.user.targets)[0]?.actor;
            if (cibleActor?.type === "intre") this.data.opposantActorId = cibleActor.id;

            const form = button.form;
            if (this.rolltype === ROLL_TYPE.SIMPLE) {
              const nbBlattes = parseInt(form.elements["nbblattes"]?.value) || 0;
              this.data.formula = nbBlattes.toString();
              this.data.formulaValue = nbBlattes;
            } else {
              this.data.formula = this.competence.value.toString();
              this.data.formulaValue = this.competence.value;

              const opposant = parseInt(form.elements["opposantvalue"]?.value);
              if (!Number.isNaN(opposant)) {
                this.data.opposantValue = opposant;
                this.data.formula = this.data.formula.concat(" - ", opposant.toString());
                this.data.formulaValue -= opposant;
              }

              const difficulte = parseInt(form.elements["difficulte"]?.value);
              if (!Number.isNaN(difficulte)) {
                this.data.difficulte = difficulte;
                this.data.difficulteLabel = DIFFICULTE[difficulte];
                this.data.formula = this.data.formula.concat(" - ", difficulte.toString());
                this.data.formulaValue -= difficulte;
              }

              const modifier = parseInt(form.elements["rollmodifier"]?.value) || 0;
              if (modifier) {
                this.data.modifier = modifier;
                this.data.formula = this.data.formula.concat(modifier > 0 ? " + " : " ", modifier.toString());
                this.data.formulaValue += modifier;
              }
            }
            // Consommation munitions/rechargement (livre de base p.240) :
            // uniquement ici, au clic sur "Piocher", pas dans actor.attack()
            // — sinon un dialogue annulé consommerait quand même le tir.
            if (this.rolltype === ROLL_TYPE.ATTACK && this.data.itemId) {
              await this.actor.consommerTirDistance(this.data.itemId, this.data.munitionItemId);
            }
            // Verrou "une Attaque par arme et par round" + consommation
            // automatique de l'action du tour (demandes d'Obe).
            if (this.rolltype === ROLL_TYPE.ATTACK) {
              await this.actor.terminerActionAttaque(this.data.itemId);
            }

            await this.piocher();
            return await this.showResult();
          },
        },
        { action: "cancel", icon: "fas fa-times", label: "Annuler" },
      ],
      rejectClose: false,
    });
  }

  /**
   * Dialogue simplifié utilisé pour le jet de Dégâts enchaîné après une
   * Attaque réussie : on ne demande que l'opposition Chitine (arme
   * comprise) vs Chitine (armure comprise), le bonus de blattes et
   * l'éventuelle amélioration de couleur ayant déjà été fixés par le
   * résultat de l'Attaque (voir Blattes.resoudreChoixAttaque).
   */
  async openDegatsDialog() {
    this.data.isDegats = true;
    this.data.introText = "Test de Dégâts (Chitine attaquant + arme vs Chitine défenseur + armure)";
    this.data.actorname = this.actor?.name;
    this.data.charImg = this.actor?.img ?? "icons/svg/mystery-man.svg";

    const html = await foundry.applications.handlebars.renderTemplate(
      "systems/insectopia/templates/chat/roll-dialog.html",
      {
        actorname: this.data.actorname,
        competence: { value: 0, label: "INSECTOPIA.label.combat.degats" },
        isAttack: false,
        introText: this.data.introText,
        charImg: this.data.charImg,
        difficulteLabels: DIFFICULTE,
        isSimple: false,
        isDegatsDialog: true,
        chitineAttaquePrefill: this.data.chitineAttaquePrefill ?? 0,
        chitineDefensePrefill: this.data.chitineDefensePrefill ?? 0,
      }
    );

    return await DialogV2.wait({
      window: { title: "Test de Dégâts" },
      content: html,
      buttons: [
        {
          action: "roll",
          icon: "fas fa-check",
          label: "Piocher",
          default: true,
          callback: async (event, button) => {
            const form = button.form;
            // Le défenseur (déjà ciblé au moment du choix du résultat
            // d'Attaque, cf. resoudreChoixAttaque) reste éligible à
            // l'échange de Blattes de chance sur ce test de Dégâts, en plus
            // de l'attaquant qui pioche.
            if (this.data.opposantActorId === undefined) {
              const cibleActor = Array.from(game.user.targets)[0]?.actor;
              if (cibleActor?.type === "intre") this.data.opposantActorId = cibleActor.id;
            }
            const chitineAttaque = parseInt(form.elements["opposantvalue"]?.value) || 0; // réutilisé comme Chitine totale attaquant
            const chitineDefense = parseInt(form.elements["difficulte"]?.value) || 0; // réutilisé comme Chitine totale défenseur
            this.data.formula = chitineAttaque.toString().concat(" - ", chitineDefense.toString());
            this.data.formulaValue = chitineAttaque - chitineDefense;
            this.data.chitineAttaque = chitineAttaque;
            this.data.chitineDefense = chitineDefense;
            await this.piocher();
            return await this.showResult();
          },
        },
        { action: "cancel", icon: "fas fa-times", label: "Annuler" },
      ],
      rejectClose: false,
    });
  }

  /**
   * Résout directement le test de Sphère de magie vs Difficulté (livre
   * p.262-276), sans dialogue générique intermédiaire : la Sphère, le Mot
   * de pouvoir et les 5 niveaux d'Influence ont déjà été choisis dans la
   * boîte de dialogue de lancer de sort (module/common/magic.js), qui a
   * placé la Difficulté totale dans this.data.difficulteSort avant
   * d'appeler cette méthode.
   */
  async lancerSort() {
    const difficulte = this.data.difficulteSort ?? 0;
    const modifier = this.data.modifier || 0;
    this.data.formulaValue = this.competence.value - difficulte + modifier;
    this.data.formula = `${this.competence.value} - ${difficulte}`.concat(
      modifier ? (modifier > 0 ? ` + ${modifier}` : ` ${modifier}`) : ""
    );

    let visibilityMode = this.data.rollMode ?? game.settings.get("core", "rollMode");
    if (game.user.isGM) {
      const visibilityChoice = game.settings.get("insectopia", "visibiliteJetsPNJ");
      if (visibilityChoice === "public") visibilityMode = "publicroll";
      else if (visibilityChoice === "private") visibilityMode = "gmroll";
      else if (visibilityChoice === "depends") visibilityMode = game.settings.get("core", "rollMode");
    }
    this.data.rollMode = visibilityMode;
    this.data.actorname = this.actor.name;
    this.data.charImg = this.actor.img;
    this.data.introText = this.data.introTextOverride ?? `${this.actor.name} lance un sort.`;

    await this.piocher();
    return this.showResult();
  }

  // --------------------------------------------------------------------
  // Tirage des blattes
  // --------------------------------------------------------------------
  async piocher() {
    const nbBase = this.evaluerBlattesATirer(this.data.formulaValue);
    this.data.nbBlattes = nbBase + (this.data.bonusBlattes || 0);
    this.data.blattesResult = [];
    this.data.blattesSorties = [];
    this.data.blattesParCouleur = { rouge: 0, verte: 0, bleue: 0, blanche: 0, noire: 0 };

    const bag = Array.from(Array(SAC_BLATTES.TAILLE).keys()).map((i) => i + 1);
    for (let i = bag.length - 1; i > 0; i--) {
      const r = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[r]] = [bag[r], bag[i]];
    }

    for (let i = 0; i < this.data.nbBlattes; i++) {
      const value = bag.pop();
      const color = this.couleur(value);
      this.data.blattesResult.push({ value, color });
      this.data.blattesSorties.push(value);
      this.data.blattesParCouleur[color] += 1;
    }

    // Modificateurs d'Initiative de l'équipement (livre de base p.239-240,
    // cf. base-actor.js#getModificateursInitiativeEquipement) : ne
    // s'appliquent qu'au tirage d'Initiative, jamais aux autres tirages
    // (Attaque, Dégâts, Sort...).
    if (this.rolltype === ROLL_TYPE.INITIATIVE && this.actor) {
      const mods = this.actor.getModificateursInitiativeEquipement();
      if (mods.couleurShift) this.decalerCouleurs(mods.couleurShift);
      // Allonge (ex : Lance perce-chitine) : cran(s) supplémentaires
      // réservés à la MEILLEURE Blatte tirée uniquement (avantage sur la
      // première attaque du tour, livre p.240 + précision Obe : +2 crans).
      if (mods.allongeBonus) this.decalerMeilleureBlatte(mods.allongeBonus);
    }
  }

  /**
   * Décale la couleur de CHAQUE Blatte tirée de `pas` crans (positif =
   * amélioration vers rouge, négatif = dégradation vers noire), borné aux
   * extrémités de l'échelle. Met à jour blattesResult et blattesParCouleur.
   */
  decalerCouleurs(pas) {
    const ordre = ORDRE_COULEURS_CROISSANT;
    this.data.blattesParCouleur = { rouge: 0, verte: 0, bleue: 0, blanche: 0, noire: 0 };
    for (const blatte of this.data.blattesResult) {
      const indexBorne = Math.min(ordre.length - 1, Math.max(0, ordre.indexOf(blatte.color) + pas));
      blatte.color = ordre[indexBorne];
      this.data.blattesParCouleur[blatte.color] += 1;
    }
  }

  /**
   * Décale uniquement la meilleure Blatte tirée (celle qui agira en
   * premier) de `pas` crans. Utilisé pour l'effet Allonge.
   */
  decalerMeilleureBlatte(pas) {
    if (!this.data.blattesResult.length) return;
    const ordre = ORDRE_COULEURS_CROISSANT;
    let meilleure = this.data.blattesResult[0];
    for (const blatte of this.data.blattesResult) {
      if (ordre.indexOf(blatte.color) > ordre.indexOf(meilleure.color)) meilleure = blatte;
    }
    this.data.blattesParCouleur[meilleure.color] -= 1;
    const indexBorne = Math.min(ordre.length - 1, Math.max(0, ordre.indexOf(meilleure.color) + pas));
    meilleure.color = ordre[indexBorne];
    this.data.blattesParCouleur[meilleure.color] += 1;
  }

  evaluerBlattesATirer(formulaValue) {
    if (formulaValue) return Math.abs(formulaValue);
    return 1;
  }

  couleur(value) {
    const r = SAC_BLATTES.REPARTITION;
    const seuilNoire = r.noire;
    const seuilBlanche = seuilNoire + r.blanche;
    const seuilBleue = seuilBlanche + r.bleue;
    const seuilVerte = seuilBleue + r.verte;
    if (value <= seuilNoire) return "noire";
    if (value <= seuilBlanche) return "blanche";
    if (value <= seuilBleue) return "bleue";
    if (value <= seuilVerte) return "verte";
    return "rouge";
  }

  /** Couleurs effectivement tirées (comptage > 0), dans l'ordre du chat. */
  couleursPresentes() {
    return ["rouge", "verte", "bleue", "blanche", "noire"].filter((c) => this.data.blattesParCouleur[c] > 0);
  }

  // --------------------------------------------------------------------
  // Affichage du résultat
  // --------------------------------------------------------------------
  async showResult() {
    // Les jets d'Attaque et de Dégâts utilisent un gabarit à part, avec
    // des boutons de choix de couleur qui déclenchent la suite de la
    // résolution (voir hooks.js).
    if (this.rolltype === ROLL_TYPE.ATTACK || this.rolltype === ROLL_TYPE.DEGATS || this.rolltype === ROLL_TYPE.SORT) {
      return this.showResultChoix();
    }

    let rerollButton = false;
    this.resultText = "Résultat final.";

    if ([ROLL_TYPE.SIMPLE, ROLL_TYPE.INITIATIVE].includes(this.rolltype)) {
      this.resultText = "";
    } else if (this.rolltype === ROLL_TYPE.CHANCE) {
      this.resultText = "";
      const modification = {};
      for (const couleur of ["noire", "blanche", "verte", "bleue", "rouge"]) {
        foundry.utils.setProperty(modification, "system.chance." + couleur, this.data.blattesParCouleur[couleur]);
      }
      await this.actor.update(modification);
    } else if (this.data.formulaValue === 1 && !this.isReroll) {
      rerollButton = true;
      this.playerCanReroll = true;
      this.resultText = "Vous pouvez choisir de remplacer cette blatte par une autre, tirée au hasard. Le second résultat devra impérativement être conservé.";
    } else if (this.data.formulaValue === -1 && !this.isReroll) {
      rerollButton = true;
      this.playerCanReroll = false;
      this.resultText = "Le Deus (ou votre adversaire) peut vous obliger à repiocher une blatte. Le second résultat devra impérativement être conservé.";
    } else if (this.data.formulaValue > 1) {
      this.resultText = "Choisissez la blatte qui vous convient le mieux parmi celles tirées.";
    } else if (this.data.formulaValue < -1) {
      this.resultText = "Le Deus (ou votre adversaire) choisit la blatte qui détermine le résultat de votre action.";
    }

    // Opposition/Difficulté avec plusieurs Blattes tirées (formulaValue > 1
    // ou < -1) : on propose des boutons de choix cliquables (comme pour
    // Attaque/Dégâts/Sort) plutôt qu'un simple tableau non actionnable.
    // Le clic ne fait qu'afficher la couleur retenue dans le chat — pas de
    // suite automatisée (pas de cible/arme connue à ce stade du jet).
    const interactiveChoice = Math.abs(this.data.formulaValue) > 1 && this.rolltype !== ROLL_TYPE.CHANCE;

    const templateData = {
      owner: this.actor?.id,
      actingCharName: this.data.actorname,
      actingCharImg: this.data.charImg,
      data: this.data,
      rerollButton,
      resultText: this.resultText,
      interactiveChoice,
    };

    const html = await foundry.applications.handlebars.renderTemplate(
      "systems/insectopia/templates/chat/roll-result.html",
      templateData
    );

    this.chat = await ChatMessage.create(await this._chatData(html));

    if (rerollButton) {
      if (this.playerCanReroll) this.chat.setFlag("world", "reRollUserId", game.user.id);
      this.chat.setFlag("world", "reRoll", templateData);
      this.chat.setFlag("world", "blatteData", {
        actorId: this.actor.id,
        rolltype: this.rolltype,
        competence: this.competence,
        data: this.data,
      });
    }

    if (interactiveChoice) {
      this.chat.setFlag("world", "choixSimpleData", { actorId: this.actor?.id });
    }

    // Blattes de chance : non applicable au tirage de Chance lui-même, ni
    // à l'Initiative (non couverte par la règle transmise par Obe ; à
    // revoir si besoin).
    if (![ROLL_TYPE.CHANCE, ROLL_TYPE.INITIATIVE].includes(this.rolltype)) {
      this.chat.setFlag("world", "chanceData", {
        chanceActorIds: [...new Set([this.actor?.id, this.data.opposantActorId].filter(Boolean))],
        blattesParCouleur: foundry.utils.duplicate(this.data.blattesParCouleur),
        mode: "simple",
        rolltype: this.rolltype,
        templateData: foundry.utils.duplicate({
          owner: templateData.owner,
          actingCharName: templateData.actingCharName,
          actingCharImg: templateData.actingCharImg,
          data: templateData.data,
          rerollButton: templateData.rerollButton,
          resultText: templateData.resultText,
          interactiveChoice: templateData.interactiveChoice,
        }),
      });
    }

    if (this.rolltype === ROLL_TYPE.INITIATIVE) return this.data;
  }

  /**
   * Affichage avec boutons de choix de couleur (Attaque / Dégâts). Le
   * joueur (ou le Deus, selon l'opposition) clique sur la couleur retenue
   * parmi celles tirées ; ce choix est géré par resoudreChoixAttaque /
   * resoudreChoixDegats (voir hooks.js pour le branchement du clic).
   */
  async showResultChoix() {
    const table =
      this.rolltype === ROLL_TYPE.ATTACK ? RESULTAT_ATTAQUE : this.rolltype === ROLL_TYPE.SORT ? RESULTAT_SORT : RESULTAT_DEGATS;
    const choix = this.couleursPresentes().map((couleur) => ({
      couleur,
      count: this.data.blattesParCouleur[couleur],
      label: table[couleur].label,
      description: table[couleur].description,
      impacts: table[couleur].impacts,
    }));

    const templateData = {
      owner: this.actor?.id,
      actingCharName: this.data.actorname,
      actingCharImg: this.data.charImg,
      data: this.data,
      isAttack: this.rolltype === ROLL_TYPE.ATTACK,
      isDegats: this.rolltype === ROLL_TYPE.DEGATS,
      isSort: this.rolltype === ROLL_TYPE.SORT,
      choix,
    };

    const html = await foundry.applications.handlebars.renderTemplate(
      "systems/insectopia/templates/chat/roll-result-choix.html",
      templateData
    );

    this.chat = await ChatMessage.create(await this._chatData(html));

    this.chat.setFlag("world", "choixData", {
      actorId: this.actor?.id,
      rolltype: this.rolltype,
      competence: this.competence,
      data: this.data,
    });

    this.chat.setFlag("world", "chanceData", {
      chanceActorIds: [...new Set([this.actor?.id, this.data.opposantActorId].filter(Boolean))],
      blattesParCouleur: foundry.utils.duplicate(this.data.blattesParCouleur),
      mode: "choix",
      rolltype: this.rolltype,
      templateData: foundry.utils.duplicate({
        owner: templateData.owner,
        actingCharName: templateData.actingCharName,
        actingCharImg: templateData.actingCharImg,
        data: templateData.data,
        isAttack: templateData.isAttack,
        isDegats: templateData.isDegats,
        isSort: templateData.isSort,
      }),
    });
  }

  async _chatData(html) {
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ alias: game.user.name, actor: this.actor?.id }),
      content: html,
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
    };

    let visibilityMode = this.data.rollMode ?? game.settings.get("core", "rollMode");
    if (this.data.isWhisper) visibilityMode = "gmroll";

    switch (visibilityMode) {
      case "gmroll":
        chatData.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
        break;
      case "blindroll":
        chatData.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
        chatData.blind = true;
        break;
      case "selfroll":
        chatData.whisper = [game.user.id];
        break;
    }
    chatData.rollMode = visibilityMode;
    return chatData;
  }

  // --------------------------------------------------------------------
  // Repioche (règle +1/-1) et Blatte de chance
  // --------------------------------------------------------------------
  async reroll(event, message) {
    this.isReroll = true;
    const newMessage = game.messages.get(message._id);

    const templateData = newMessage.getFlag("world", "reRoll");
    templateData.rerollButton = false;
    if (newMessage.getFlag("world", "reRollUserId")) newMessage.unsetFlag("world", "reRollUserId");
    newMessage.unsetFlag("world", "reRoll");
    newMessage.unsetFlag("world", "blatteData");

    await this.piocher();
    templateData.data = this.data;
    templateData.resultText = "Nouvelle pioche effectuée.";

    const html = await foundry.applications.handlebars.renderTemplate(
      "systems/insectopia/templates/chat/roll-result.html",
      templateData
    );
    await newMessage.update({ content: html });
  }

  /**
   * Échange d'une Blatte de chance (règle fournie par Obe, référence de
   * page à confirmer dans le livre de base). Chaque acteur éligible sur un
   * jet (le rôleur, et l'adversaire ciblé sur la scène le cas échéant —
   * voir chanceActorIds, calculé dans showResult/showResultChoix à partir
   * de this.actor et this.data.opposantActorId) peut, sur son propre
   * stock, remplacer une des Blattes tirées par une Blatte de chance de
   * son choix, avant que le résultat retenu ne soit choisi. La Blatte de
   * chance utilisée est défaussée (retranchée du stock de l'acteur).
   *
   * Le tirage affiché est réécrit en conséquence : la couleur remplacée
   * perd une occurrence, la couleur de la Blatte de chance en gagne une.
   * L'opération peut être répétée plusieurs fois sur le même message,
   * tant que le résultat final n'a pas été choisi (cf. exemple du livre :
   * deux Blattes rouges remplacées par une bleue et une blanche).
   *
   * @param message  Le message de chat portant le flag "chanceData".
   * @param actorId  L'acteur dont on dépense le stock de Blattes de chance
   *                 (doit figurer dans flag.chanceActorIds — le rôleur et,
   *                 le cas échéant, l'adversaire ciblé sont tous deux
   *                 éligibles, chacun sur son propre stock).
   */
  static async echangerBlatteDeChance(message, actorId) {
    const flag = message.getFlag("world", "chanceData");
    if (!flag) return;
    if (!flag.chanceActorIds?.includes(actorId)) return;

    const actor = game.actors.get(actorId);
    if (!actor) return;
    if (!(actor.isOwner || game.user.isGM)) {
      ui.notifications.warn(`Seul le joueur de ${actor.name} (ou le Deus) peut utiliser ses Blattes de chance.`);
      return;
    }

    const chance = actor.system.chance ?? {};
    const couleursChance = ["rouge", "verte", "bleue", "blanche", "noire"].filter((c) => (chance[c] || 0) > 0);
    if (!couleursChance.length) {
      ui.notifications.warn(`${actor.name} n'a plus de Blattes de chance disponibles.`);
      return;
    }
    const couleursTirees = ["rouge", "verte", "bleue", "blanche", "noire"].filter((c) => (flag.blattesParCouleur[c] || 0) > 0);
    if (!couleursTirees.length) return;

    const optionsTiree = couleursTirees
      .map((c) => `<option value="${c}">${NOM_COULEUR[c]} (${flag.blattesParCouleur[c]} tirée(s))</option>`)
      .join("");
    const optionsChance = couleursChance.map((c) => `<option value="${c}">${NOM_COULEUR[c]} (${chance[c]} en stock)</option>`).join("");

    const content = `
      <p>${actor.name} remplace une Blatte du tirage par une Blatte de chance. La Blatte de chance utilisée est défaussée.</p>
      <div class="form-group"><label>Blatte tirée à remplacer</label><select name="remplacee">${optionsTiree}</select></div>
      <div class="form-group"><label>Blatte de chance utilisée</label><select name="chance">${optionsChance}</select></div>
    `;

    const result = await DialogV2.wait({
      window: { title: "Utiliser une Blatte de chance" },
      content,
      buttons: [
        {
          action: "confirm",
          icon: "fas fa-check",
          label: "Échanger",
          default: true,
          callback: (event, button) => ({
            remplacee: button.form.elements["remplacee"].value,
            chance: button.form.elements["chance"].value,
          }),
        },
        { action: "cancel", icon: "fas fa-times", label: "Annuler" },
      ],
      rejectClose: false,
    });
    if (!result) return;

    const { remplacee, chance: couleurChance } = result;

    // Défausse de la Blatte de chance utilisée.
    const nouveauStock = foundry.utils.duplicate(actor.system.chance);
    nouveauStock[couleurChance] = Math.max(0, (nouveauStock[couleurChance] || 0) - 1);
    await actor.update({ "system.chance": nouveauStock });

    // Mise à jour du tirage affiché.
    const nouveauTirage = foundry.utils.duplicate(flag.blattesParCouleur);
    nouveauTirage[remplacee] = Math.max(0, (nouveauTirage[remplacee] || 0) - 1);
    nouveauTirage[couleurChance] = (nouveauTirage[couleurChance] || 0) + 1;

    const nouveauFlag = foundry.utils.duplicate(flag);
    nouveauFlag.blattesParCouleur = nouveauTirage;
    await message.setFlag("world", "chanceData", nouveauFlag);

    const echangeTexte = `<div class="resultText">🍀 ${actor.name} remplace une Blatte ${NOM_COULEUR[remplacee]} par une Blatte de chance ${NOM_COULEUR[couleurChance]}.</div>`;

    let nouveauBloc;
    if (flag.mode === "choix") {
      const table =
        flag.rolltype === ROLL_TYPE.ATTACK ? RESULTAT_ATTAQUE : flag.rolltype === ROLL_TYPE.SORT ? RESULTAT_SORT : RESULTAT_DEGATS;
      const choix = ["rouge", "verte", "bleue", "blanche", "noire"]
        .filter((c) => nouveauTirage[c] > 0)
        .map((couleur) => ({
          couleur,
          count: nouveauTirage[couleur],
          label: table[couleur].label,
          description: table[couleur].description,
          impacts: table[couleur].impacts,
        }));
      nouveauBloc = await foundry.applications.handlebars.renderTemplate(
        "systems/insectopia/templates/chat/roll-result-choix.html",
        {
          ...flag.templateData,
          data: { ...flag.templateData.data, blattesParCouleur: nouveauTirage },
          choix,
        }
      );
    } else {
      nouveauBloc = await foundry.applications.handlebars.renderTemplate("systems/insectopia/templates/chat/roll-result.html", {
        ...flag.templateData,
        data: { ...flag.templateData.data, blattesParCouleur: nouveauTirage },
      });
    }

    await message.update({ content: nouveauBloc.concat(echangeTexte) });
  }

  // --------------------------------------------------------------------
  // Suite de la résolution après clic sur une couleur (Attaque -> Dégâts)
  // --------------------------------------------------------------------
  /**
   * Le joueur/Deus a retenu `couleur` comme résultat de l'Attaque.
   * - échec / échec critique : rien de plus à résoudre.
   * - réussite / réussite améliorée / réussite critique : ouvre
   *   automatiquement le jet de Dégâts, avec le bonus de blattes et
   *   l'amélioration de couleur qui vont bien (livret p.29).
   */
  static async resoudreChoixAttaque(couleur, message) {
    const flagData = message.getFlag("world", "choixData");
    if (!flagData) return;
    const actor = game.actors.get(flagData.actorId);

    const bonusParCouleur = { rouge: 1, verte: 1, bleue: 0, blanche: 0, noire: 0 };
    const ameliorerParCouleur = { rouge: true, verte: false, bleue: false, blanche: false, noire: false };

    await message.update({
      content: message.content.concat(
        `<div class="resultText">Résultat retenu : <strong>${RESULTAT_ATTAQUE[couleur].label}</strong></div>`
      ),
    });

    if (["noire", "blanche"].includes(couleur)) return; // Pas de dégâts sur un échec.

    // Chitine de l'attaquant (arme équipée comprise) et, si une cible est
    // sélectionnée sur la scène, Chitine du défenseur (armures comprises).
    const chitineAttaquePrefill = actor?.getChitineAttaqueTotal(flagData.data.itemId) ?? 0;
    const cibleToken = Array.from(game.user.targets)[0];
    const chitineDefensePrefill = cibleToken?.actor?.getChitineDefenseTotal?.() ?? 0;

    const data = {
      bonusBlattes: bonusParCouleur[couleur],
      ameliorerCouleur: ameliorerParCouleur[couleur],
      chitineAttaquePrefill,
      chitineDefensePrefill,
      // Le défenseur (cible ciblée sur la scène) est éligible à l'échange
      // de Blattes de chance sur ce test de Dégâts, en plus de l'attaquant
      // qui pioche (voir chanceActorIds dans showResult/showResultChoix).
      opposantActorId: cibleToken?.actor?.type === "intre" ? cibleToken.actor.id : undefined,
    };
    const competence = { value: 0, label: "INSECTOPIA.label.combat.degats" };
    const blattes = new Blattes(actor, ROLL_TYPE.DEGATS, competence, data);

    return blattes.openDegatsDialog();
  }

  /**
   * Le joueur/Deus a retenu `couleur` comme résultat du test de Dégâts.
   * Applique l'amélioration de couleur éventuelle (réussite critique à
   * l'attaque), calcule les impacts, et — s'il y a mutilation — propose
   * de l'appliquer directement à la cible (game.user.targets).
   */
  static async resoudreChoixDegats(couleur, message) {
    const flagData = message.getFlag("world", "choixData");
    if (!flagData) return;

    let couleurFinale = couleur;
    if (flagData.data.ameliorerCouleur) {
      const index = ORDRE_COULEURS_CROISSANT.indexOf(couleur);
      couleurFinale = ORDRE_COULEURS_CROISSANT[Math.min(index + 1, ORDRE_COULEURS_CROISSANT.length - 1)];
    }

    const resultat = RESULTAT_DEGATS[couleurFinale];

    await message.update({
      content: message.content.concat(
        `<div class="resultText">Résultat retenu : <strong>${resultat.label}</strong>` +
          (couleurFinale !== couleur ? ` (améliorée depuis ${RESULTAT_DEGATS[couleur].label})` : "") +
          ` — ${resultat.impacts} impact(s)${resultat.mutilation ? ", mutilation" : ""}.</div>` +
          `<div class="degats-actions"><a class="appliquer-degats" data-impacts="${resultat.impacts}" data-mutilation="${resultat.mutilation}">` +
          `<i class="fas fa-bolt"></i> Appliquer à la cible</a></div>`
      ),
    });
  }

  /**
   * Le joueur/Deus a retenu `couleur` comme résultat du test de Sphère de
   * magie vs Difficulté (livre p.262-276).
   *  - blanche : échec simple, rien de plus à résoudre.
   *  - noire (Maladresse, p.270) : le sort se retourne contre le lanceur —
   *    test de Difficulté du sort vs Résistance, sauf sur la sphère
   *    Souillure où le lanceur gagne des points de Souillure au lieu de
   *    subir des dégâts (le livre ne précise pas de quantité pour ce cas
   *    précis ; ce système applique +1 par défaut, à ajuster à la main).
   *  - bleue/verte/rouge : réussite -> résolution de l'Effet du sort
   *    (Puissance vs compétence d'opposition laissée au choix du Deus,
   *    livre p.270). Les crans d'Influence bonus sur verte/rouge ne sont
   *    pas automatisés (v2).
   */
  static async resoudreChoixSort(couleur, message) {
    const flagData = message.getFlag("world", "choixData");
    if (!flagData) return;
    const actor = game.actors.get(flagData.actorId);

    await message.update({
      content: message.content.concat(
        `<div class="resultText">Résultat retenu : <strong>${RESULTAT_SORT[couleur].label}</strong></div>`
      ),
    });

    if (couleur === "blanche") return; // Échec simple, aucun effet.

    if (couleur === "noire") {
      if (flagData.data.sphereKey === "souillure") {
        const souillureActuelle = actor?.system.combat.souillure || 0;
        await actor.update({ "system.combat.souillure": souillureActuelle + 1 });
        ui.notifications.warn(
          `${actor.name} gagne 1 point de Souillure (Maladresse sur la sphère Souillure, livre p.270 — quantité non précisée par le livre, valeur par défaut ajustable sur la fiche).`
        );
        return;
      }
      const competence = { value: flagData.data.difficulteSort, label: "INSECTOPIA.label.combat.maladresse" };
      const blattes = new Blattes(actor, ROLL_TYPE.OPPOSITION, competence, {
        introTextOverride: `Maladresse : le sort de ${actor.name} se retourne contre lui — Difficulté du sort (${flagData.data.difficulteSort}) vs Résistance du lanceur (livre p.270).`,
      });
      return blattes.openDialog();
    }

    const competence = { value: flagData.data.niveauPuissance, label: "INSECTOPIA.label.combat.sorteffet" };
    const blattes = new Blattes(actor, ROLL_TYPE.OPPOSITION, competence, {
      introTextOverride: `Effet du sort (${flagData.data.sphereLabel} — ${flagData.data.motPouvoirLabel}) : Puissance ${flagData.data.niveauPuissance} vs compétence d'opposition au choix du Deus (livre p.270).`,
    });
    return blattes.openDialog();
  }

  /**
   * Le joueur/Deus a retenu `couleur` parmi plusieurs Blattes tirées sur un
   * jet Opposition/Difficulté simple (livret p.24-25). Contrairement aux
   * jets Attaque/Dégâts/Sort, ce choix ne déclenche aucune suite
   * automatisée : ni cible, ni arme ne sont connues à ce stade du jet. Le
   * résultat retenu est simplement affiché dans le message de chat, à
   * charge du Deus d'en tirer les conséquences (dégâts, effet, etc.) selon
   * le contexte de la scène.
   */
  static async resoudreChoixSimple(couleur, message) {
    const flagData = message.getFlag("world", "choixSimpleData");
    if (!flagData) return;

    await message.update({
      content: message.content.concat(
        `<div class="resultText">Résultat retenu : <strong>${RESULTAT_SIMPLE[couleur].label}</strong></div>`
      ),
    });
  }
}