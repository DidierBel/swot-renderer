// ======================
// BMC RENDERER FINAL
// Compatible avec ton JSON EXACT
// ======================

const { createCanvas, registerFont } = require("canvas");
const path = require("path");

// Charger Brush Script MT
try {
  registerFont(path.join(__dirname, "fonts", "BrushScriptMT.ttf"), {
    family: "Brush Script MT",
  });
  console.log("Police Brush Script MT chargée (BMC)");
} catch (e) {
  console.warn("⚠️ Impossible de charger Brush Script MT (BMC) – fallback.");
}

// ----------------------
// Helpers : rectangle arrondi
// ----------------------
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

// ----------------------
// Icônes
// ----------------------
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
      break;

    case "activities":
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case "resources":
      ctx.strokeRect(cx - 20, cy - 15, 40, 30);
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
      ctx.strokeRect(cx - 30, cy - 20, 50, 30);
      break;

    case "channels":
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy);
      ctx.lineTo(cx + 20, cy - 10);
      ctx.lineTo(cx + 20, cy + 10);
      ctx.closePath();
      ctx.stroke();
      break;

    case "segments":
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 12, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case "costs":
      ctx.beginPath();
      ctx.arc(cx, cy, 20, Math.PI * 0.2, Math.PI * 1.25);
      ctx.stroke();
      break;

    case "revenues":
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx - 20, cy + 15);
      ctx.lineTo(cx + 20, cy + 15);
      ctx.closePath();
      ctx.stroke();
      break;
  }

  ctx.restore();
}

// ----------------------
// Helper : dessiner un bloc BMC
// ----------------------
function drawBlock(ctx, x, y, w, h, title, values, iconType) {
  ctx.save();

  // Cadre
  ctx.strokeStyle = "#CCCCCC";
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 18);
  ctx.stroke();

  // Titre
  ctx.fillStyle = "#000";
  ctx.font = 'bold 38px "Brush Script MT", cursive';
  ctx.fillText(title, x + 20, y + 20);

  // Icône
  drawIcon(ctx, iconType, x + w - 60, y + 45);

  // Texte
  ctx.font = '26px "Brush Script MT", cursive';

  if (!Array.isArray(values)) values = [];

  const textX = x + 20;
  let cursorY = y + 90;
  const maxWidth = w - 40;
  const lineHeight = 34;

  for (const item of values) {
    const line = "• " + item;
    const words = line.split(" ");
    let curr = "";

    for (const w2 of words) {
      const test = curr ? curr + " " + w2 : w2;
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(curr, textX, cursorY);
        cursorY += lineHeight;
        curr = w2;
      } else {
        curr = test;
      }
    }

    if (curr) {
      ctx.fillText(curr, textX, cursorY);
      cursorY += lineHeight;
    }
  }

  ctx.restore();
}

// ----------------------
// Rendu principal
// ----------------------
function drawBmcImage(bmc) {
  const width = 3000;
  const height = 2000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  const marginX = 80;
  const marginY = 80;
  const innerWidth = width - marginX * 2;
  const innerHeight = height - marginY * 2;

  const colWidth = innerWidth / 5;
  const blockHeight = innerHeight / 3;

  const topY = marginY;
  const midY = marginY + blockHeight;
  const bottomY = marginY + blockHeight * 2;

  // Colonnes
  const col0 = marginX;
  const col1 = marginX + colWidth;
  const col2 = marginX + 2 * colWidth;
  const col3 = marginX + 3 * colWidth;
  const col4 = marginX + 4 * colWidth;

  // Blocs hauts (2 hauteurs ou 1+1)
  drawBlock(ctx, col0, topY, colWidth, blockHeight * 2, "Partenaires clés", bmc.partenairesCles, "partners");
  drawBlock(ctx, col1, topY, colWidth, blockHeight, "Activités clés", bmc.activitesCles, "activities");
  drawBlock(ctx, col1, midY, colWidth, blockHeight, "Ressources clés", bmc.ressourcesCles, "resources");
  drawBlock(ctx, col2, topY, colWidth, blockHeight * 2, "Proposition de valeur", bmc.propositionValeur, "value");
  drawBlock(ctx, col3, topY, colWidth, blockHeight, "Relation client", bmc.relationClient, "relations");
  drawBlock(ctx, col3, midY, colWidth, blockHeight, "Canaux", bmc.canaux, "channels");
  drawBlock(ctx, col4, topY, colWidth, blockHeight * 2, "Segments de clientèle", bmc.segments, "segments");

  // Bas : 2,5 colonnes + 2,5 colonnes
  const bottomWidthHalf = colWidth * 2.5;

  drawBlock(ctx, col0, bottomY, bottomWidthHalf, blockHeight, "Structure de coûts", bmc.structureCouts, "costs");
  drawBlock(ctx, col0 + bottomWidthHalf, bottomY, bottomWidthHalf, blockHeight, "Sources de revenus", bmc.sourcesRevenus, "revenues");

  return canvas.toBuffer("image/png");
}

module.exports = { drawBmcImage };
