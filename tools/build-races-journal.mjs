// Génère un JournalEntry de référence listant les 20 races jouables
// (livre de base p.198-201), à partir des données structurées de
// module/common/data-races.js. Remplace la version "étape 1" limitée
// aux 4 races détaillées dans le kit de démarrage.
import fs from "fs";
import path from "path";

function id16() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 16; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// Import direct du fichier de données (mêmes valeurs que celles utilisées
// par IntreActor.applyRace() dans le système).
const { RACES } = await import("../module/common/data-races.js");

const pages = Object.entries(RACES).map(([key, race]) => {
  const c = race.caracteristiques;
  const html = `
<table>
  <tbody>
    <tr><td>Aile</td><td>${c.aile}</td><td>Antenne</td><td>${c.antenne}</td></tr>
    <tr><td>Esprit</td><td>${c.esprit}</td><td>Mandibule</td><td>${c.mandibule}</td></tr>
    <tr><td>Caste</td><td>${c.caste}</td><td>Chitine</td><td>${c.chitine}</td></tr>
    <tr><td>Température</td><td>${c.temperature}</td><td></td><td></td></tr>
  </tbody>
</table>
<p><strong>Capacités de race :</strong> ${race.capacites.join(", ")}</p>
${race.faiblesse ? `<p><strong>Faiblesse :</strong> ${race.faiblesse}</p>` : ""}
<p><strong>Religion :</strong> ${race.religion}</p>
<p><strong>Castes de prédilection :</strong></p>
<ul>${race.castes.map((c2) => `<li>${c2}</li>`).join("")}</ul>
${race.variante === "arak" ? "<p><em>Variante arak : Patte/Palpe/Chélicère remplacent Aile/Antenne/Mandibule, Soie remplace Mêlée (livret p.197).</em></p>" : ""}
`.trim();

  return {
    _id: id16(),
    name: race.label,
    type: "text",
    title: { show: true, level: 2 },
    text: { format: 1, content: html },
    ownership: { default: -1 },
  };
});

fs.mkdirSync("packs-src/races", { recursive: true });
const _id = id16();
const full = {
  _id,
  _key: `!journal!${_id}`,
  name: "Insectopia — Races (livre de base, données mécaniques)",
  pages: pages.map((p) => ({ ...p, _key: `!journal.pages!${_id}.${p._id}` })),
  folder: null,
  ownership: { default: 0 },
};
fs.writeFileSync(path.join("packs-src/races", "races.json"), JSON.stringify(full, null, 2));
console.log(`Journal des ${pages.length} races écrit.`);
