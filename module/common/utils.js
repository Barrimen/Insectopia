/**
 * Foundry peut re-sérialiser un champ template.json déclaré comme tableau
 * (ex: system.caracteristiques.caste.competences: []) en objet à clés
 * numériques ("0", "1"...) selon la façon dont un .update() a été
 * construit. asArray() normalise à la lecture, et réécrire le résultat
 * via .update() répare la donnée de façon permanente (voir base-actor.js
 * applyCaste(), module/actor/sheet/intre-sheet.js, module/common/magic.js).
 */
export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}
