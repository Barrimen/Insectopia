/**
 * IntreItem
 * ---------------------------------------------------------------------
 * Trois types d'Item pour l'instant : arme, armure, capacite.
 * - arme    : modificateurAttaque (précision) + modificateurDegats
 *             (ajouté à la Chitine de l'attaquant pour le test de Dégâts),
 *             liée à une compétence de combat (melee/tir/predateur).
 * - armure  : bonusChitine (résistance, ajouté à la Chitine du défenseur)
 *             + malusEncombrement (soustrait à l'Activité/Initiative).
 * - capacite : capacité spéciale de race ou de caste (livret p.27-28).
 *              Peut porter un bonus simple à une caractéristique ou une
 *              compétence (ex : Antennes ramifiées => +1 Antenne), lu
 *              automatiquement par IntreActor.getCapaciteBonus().
 */
export default class IntreItem extends Item {
  estArme() {
    return this.type === "arme";
  }
  estArmure() {
    return this.type === "armure";
  }
  estCapacite() {
    return this.type === "capacite";
  }
}
