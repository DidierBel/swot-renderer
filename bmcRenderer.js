// Génération du Business Model Canvas (BMC)
// 9 blocs, icons line art, Brush Script, layout personnalisé

const { createCanvas, registerFont } = require("canvas");
const path = require("path");

// Charger Brush Script MT
try {
  registerFont(path.join(__dirname, "fonts", "BrushScriptMT.ttf"), {
    family: "Brush Script MT",
  });
  console.log("Police Brush Script MT chargée (BMC)");
} catch (e) {
  console.warn("⚠️ Brush Script MT introuvable — fallback");
}

// =====================================================================================
// HELPERS
// =====================================================================================

// Rectangle arrondi
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}


// =====================================================================================
//  ICONES LINE ART
// =====================================================================================
function drawIcon(ctx, type, cx, cy) {

  ctx.save();
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  switch (type) {
    case "partners":
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy + 10);
      ctx.lineTo(cx - 10, cy - 10);
      ctx.lineTo(cx + 10, cy + 10);
      ctx.lineTo(cx + 35, cy - 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx - 25, cy - 25, 10, 0, Math.PI * 2);
      ctx.arc(cx + 25, cy - 25, 10, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case "activities": {
      const r = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        ctx.beginPath();
        ctx.moveTo(cx + (r + 2) * Math.cos(angle), cy + (r + 2) * Math.sin(angle));
        ctx.lineTo(cx + (r + 10) * Math.cos(angle), cy + (r + 10) * Math.sin(angle));
        ctx.stroke();
      }
      break;
    }

    case "resources":
      ctx.beginPath();
      ctx.rect(cx - 25, cy - 18, 50, 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 25, cy - 18);
      ctx.lineTo(cx, cy - 32);
      ctx.lineTo(cx + 25, cy - 18);
      ctx.stroke();
      break;

    case "value":
      ctx.beginPath();
      ctx.moveTo(cx, cy - 25);
      ctx.lineTo(cx + 25, cy);
      ctx.lineTo(cx, cy + 25);
      ctx.lineTo(cx - 25, cy);
      ctx.closePath();
      ctx.stroke();
      break;

    case "relations":
      ctx.beginPath();
      ctx.rect(cx - 30, cy - 20, 40, 25);
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(cx + 5, cy - 10, 30, 20);
      ctx.stroke();
      break;

    case "channels":
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy);
      ctx.lineTo(cx - 5, cy - 10);
      ctx.lineTo(cx + 15, cy - 5);
      ctx.lineTo(cx + 15, cy + 5);
      ctx.lineTo(cx - 5, cy + 10);
      ctx.closePath();
      ctx.stroke();
      break;

    case "segments":
      for (let i = -1; i <= 1; i++) {
        const x = cx + i * 18;
        ctx.beginPath();
        ctx.arc(x, cy - 8, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, cy + 1);
        ctx.lineTo(x, cy + 16);
        ctx.stroke();
      }
      break;

    case "costs":
      ctx.beginPath();
      ctx.arc(cx + 5, cy, 20, 0.3, Math.PI * 1.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 10);
      ctx.lineTo(cx + 10, cy - 10);
      ctx.moveTo(cx - 12, cy + 10);
      ctx.lineTo(cx + 8, cy + 10);
      ctx.stroke();
      break;

    case "revenues":
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx - 18, cy + 12);
      ctx.lineTo(cx + 18, cy + 12);
      ctx.closePath();
      ctx.stroke();
      break;
  }

  ctx.restore();
}


// =====================================================================================
//   RENDERER PRINCIPAL BMC
// =====================================================================================
function drawBmcImage(bmc = {}) {

  // 🔥 Harmonisation des clés : accepte snake_case ET camelCase
  const data = {
    proposition_valeur: bmc.proposition_valeur || bmc.propositionValeur || "",
    segments_clientele: bmc.segments_clientele || bmc.segments || "",
    canaux: bmc.canaux || "",
    relation_client: bmc.relation_client || bmc.relationClient || "",
    sources_revenus: bmc.sources_revenus || bmc.sourcesRevenus || "",
    activites_cles: bmc.activites_cles || bmc.activitesCles || "",
    ressources_cles: bmc.ressources_cles || bmc.ressourcesCles || "",
    partenaires_cles: bmc.partenaires_cles || bmc.partenairesCles || "",
    structure_couts: bmc.structure_couts || bmc.structureCouts || ""
  };

  const width = 3000;
  const height = 2000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // GRID
  const marginX = 80;
  const marginY = 80;
  const innerWidth = width - marginX * 2;
  const innerHeight = height - marginY * 2;

  const colWidth = innerWidth / 5;
  const blockHeight = innerHeight / 3;

  const topY = marginY;
  const midY = marginY + blockHeight;
  const bottomY = marginY + 2 * blockHeight;

  const titleFont = 'bold 42px "Brush Script MT"';
  const textFont = '28px "Brush Script MT"';
  const lineHeight = 40;

  const lineColor = "#CCCCCC";

  function drawBlock(x, y, w, h, title, content, iconType) {
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    roundRect(ctx, x, y, w, h, 22);
    ctx.stroke();
    ctx.restore();

    ctx.font = titleFont;
    ctx.fillStyle = "#000";
    ctx.fillText(title, x + 20, y + 20);

    drawIcon(ctx, iconType, x + w - 60, y + 45);

    ctx.font = textFont;
    const textX = x + 25;
    let cursorY = y + 120;
    const maxWidth = w - 50;

    if (!content) return;
    const lines = Array.isArray(content) ? content : content.split("\n");

    for (let raw of lines) {
      raw = raw.trim();
      if (!raw) continue;

      const isBullet = /^[-•]/.test(raw);
      const clean = raw.replace(/^[-•]\s*/, "");

      let words = clean.split(" ");
      let current = (isBullet ? "• " : "");

      for (const w of words) {
        const test = current + w + " ";
        if (ctx.measureText(test).width > maxWidth) {
          ctx.fillText(current, textX, cursorY);
          cursorY += lineHeight;
          current = (isBullet ? "• " : "") + w + " ";
        } else {
          current += w + " ";
        }
      }
      ctx.fillText(current, textX, cursorY);
      cursorY += lineHeight;
    }
  }

  // LAYOUT EXACT demandé
  const col0 = marginX;
  const col1 = marginX + colWidth;
  const col2 = marginX + 2 * colWidth;
  const col3 = marginX + 3 * colWidth;
  const col4 = marginX + 4 * colWidth;

  drawBlock(col0, topY, colWidth, blockHeight * 2, "Partenaires Clés", data.partenaires_cles, "partners");

  drawBlock(col1, topY, colWidth, blockHeight, "Activités Clés", data.activites_cles, "activities");

  drawBlock(col1, midY, colWidth, blockHeight, "Ressources Clés", data.ressources_cles, "resources");

  drawBlock(col2, topY, colWidth, blockHeight * 2, "Proposition de Valeur", data.proposition_valeur, "value");

  drawBlock(col3, topY, colWidth, blockHeight, "Relation Client", data.relation_client, "relations");

  drawBlock(col3, midY, colWidth, blockHeight, "Canaux", data.canaux, "channels");

  drawBlock(col4, topY, colWidth, blockHeight * 2, "Segments de Clientèle", data.segments_clientele, "segments");

  // Bas : 2,5 colonnes + 2,5 colonnes
  const halfWidth = colWidth * 2.5;
  drawBlock(marginX, bottomY, halfWidth, blockHeight, "Structure de Coûts", data.structure_couts, "costs");
  drawBlock(marginX + halfWidth, bottomY, halfWidth, blockHeight, "Sources de Revenus", data.sources_revenus, "revenues");

  return canvas.toBuffer("image/png");
}


module.exports = { drawBmcImage };
