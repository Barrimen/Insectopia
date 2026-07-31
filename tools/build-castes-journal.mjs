// Génère un JournalEntry de référence pour les 5 castes et leurs métiers
// (livre de base p.204), à partir de module/common/data-castes.js.
import fs from "fs";
import path from "path";

function id16() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 16; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

const { CASTES } = await import("../module/common/data-castes.js");
const { COMPETENCES_CASTE } = await import("../module/common/data-competences-caste.js");

const pages = Object.entries(CASTES).map(([key, caste]) => {
  const metiersHtml = Object.values(caste.metiers)
    .map((m) => `<li><strong>${m.label}</strong> : ${m.competences.join(", ")}</li>`)
    .join("");
  const html = `
<p><strong>Bonus de caste :</strong> ${caste.bonus}</p>
<p><strong>Capacités de caste :</strong> ${caste.capacites}</p>
<p><strong>Métiers et compétences de départ :</strong></p>
<ul>${metiersHtml}</ul>
`.trim();

  return {
    _id: id16(),
    name: caste.label,
    type: "text",
    title: { show: true, level: 2 },
    text: { format: 1, content: html },
    ownership: { default: -1 },
  };
});

// Page récapitulative des 26 compétences de caste (livre de base p.229-236).
const competencesHtml = COMPETENCES_CASTE.map((c) => `<p><strong>${c.nom}</strong> — ${c.description}</p>`).join("");
pages.push({
  _id: id16(),
  name: "Compétences de caste (récapitulatif)",
  type: "text",
  title: { show: true, level: 2 },
  text: {
    format: 1,
    content: `<p>Le personnage possède autant de compétences de caste que sa valeur en Caste (livret p.205). Voici les 26 compétences disponibles :</p>${competencesHtml}`,
  },
  ownership: { default: -1 },
});

fs.mkdirSync("packs-src/castes", { recursive: true });
const _id = id16();
const full = {
  _id,
  _key: `!journal!${_id}`,
  name: "Insectopia — Castes et métiers (livre de base p.204)",
  pages: pages.map((p) => ({ ...p, _key: `!journal.pages!${_id}.${p._id}` })),
  folder: null,
  ownership: { default: 0 },
};
fs.writeFileSync(path.join("packs-src/castes", "castes.json"), JSON.stringify(full, null, 2));
console.log(`Journal des ${pages.length} castes écrit.`);
