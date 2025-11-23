// ======================
// BMC RENDERER – VERSION AMÉLIORÉE
// Icônes stylisés + hanging indent
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
// Icônes stylisés, plus jolis
// ----------------------
function drawIcon(ctx, type, cx, cy) {
  ctx.save();
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  switch (type) {
    case "partners":
      // poignée de main stylisée
      ctx.beginPath();
      ctx.moveTo(cx - 28, cy + 6);
      ctx.lineTo(cx - 8, cy - 8);
      ctx.lineTo(cx + 8, cy + 6);
      ctx.lineTo(cx + 28, cy - 8);
      ctx.stroke();
      break;

    case "activities":
      // engrenage très simple
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI * 2) / 6;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18);
        ctx.lineTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26);
        ctx.stroke();
      }
      break;

    case "resources":
      // cube isométrique stylisé
      ctx.beginPath();
      ctx.moveTo(cx, cy - 18);
      ctx.lineTo(cx + 22, cy - 6);
      ctx.lineTo(cx + 22, cy + 18);
      ctx.lineTo(cx, cy + 6);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 18);
      ctx.lineTo(cx - 22, cy - 6);
      ctx.lineTo(cx - 22, cy + 18);
      ctx.lineTo(cx, cy + 6);
      ctx.stroke();
      break;

    case "value":
      // diamant / valeur
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx + 22, cy);
      ctx.lineTo(cx, cy + 20);
      ctx.lineTo(cx - 22, cy);
      ctx.closePath();
      ctx.stroke();
      break;

    case "relations":
      // deux bulles de dialogue arrondies
      ctx.beginPath();
      roundRect(ctx, cx - 35, cy - 20, 45, 28, 8);
      ctx.stroke();
      ctx.beginPath();
      roundRect(ctx, cx + -5, cy - 10, 35, 22, 8);
      ctx.stroke();
      break;

    case "channels":
      // haut-parleur
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 10);
      ctx.lineTo(cx + 8, cy - 4);
      ctx.lineTo(cx + 8, cy + 4);
      ctx.lineTo(cx - 20, cy + 10);
      ctx.closePath();
      ctx.stroke();
      break;

    case "segments":
      // trois silhouettes minimalistes
      for (let i = -1; i <= 1; i++) {
        const x = cx + i * 18;
        ctx.beginPath();
        ctx.arc(x, cy - 8, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, cy + 2);
        ctx.lineTo(x, cy + 16);
        ctx.stroke();
      }
      break;

    case "costs":
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0.3, Math.PI * 1.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 12);
      ctx.lineTo(cx + 12, cy - 12);
      ctx.moveTo(cx - 12, cy + 12);
      ctx.lineTo(cx + 10, cy + 12);
      ctx.stroke();
      break;

    case "revenues":
      ctx.beginPath();
      ctx.moveTo(cx, cy - 22);
      ctx.lineTo(cx - 18, cy + 14);
      ctx.lineTo(cx + 18, cy + 14);
      ctx.closePath();
      ctx.stroke();
      break;
  }

  ctx.restore();
}


// ----------------------
// drawBlock : maintenant avec hanging indent
// ----------------------
function drawBlock(ctx, x, y, w, h, title, values, iconType) {
  ctx.save();

  // bloc
  ctx.strokeStyle = "#CCCCCC";
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 20);
  ctx.stroke();

  // titre
  ctx.fillStyle = "#000";
  ctx.font = 'bold 40px "Brush Script MT", cursive';
  ctx.fillText(title, x + 20, y + 20);

  // icône
  drawIcon(ctx, iconType, x + w - 60, y + 45);

  // texte
  ctx.font = '28px "Brush Script MT", cursive';

  if (!Array.isArray(values)) values = [];

  const bulletX = x + 20;
  const textX = x + 50;      // texte aligné ici (hanging indent)
  const maxWidth = w - 60;
  const lineHeight = 36;
  let cursorY = y + 95;

  // rendre les puces jolies + indent correct
  for (const item of values) {
    ctx.fillText("•", bulletX, cursorY);

    const words = item.split(" ");
    let current = "";

    for (const word of words) {
      const test = current ? current + " " + word : word;
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(current, textX, cursorY);
        cursorY += lineHeight;
        current = word;
      } else {
        current = test;
      }
    }

    ctx.fillText(current, textX, cursorY);
    cursorY += lineHeight;
  }

  ctx.restore();
}


// ----------------------
// Rendu principal du BMC
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
  const bottomY = marginY + 2 * blockHeight;

  const col0 = marginX;
  const col1 = marginX + colWidth;
  const col2 = marginX + 2 * colWidth;
  const col3 = marginX + 3 * colWidth;
  const col4 = marginX + 4 * colWidth;

  drawBlock(ctx, col0, topY, colWidth, blockHeight * 2, "Partenaires clés", bmc.partenairesCles, "partners");
  drawBlock(ctx, col1, topY, colWidth, blockHeight, "Activités clés", bmc.activitesCles, "activities");
  drawBlock(ctx, col1, midY, colWidth, blockHeight, "Ressources clés", bmc.ressourcesCles, "resources");
  drawBlock(ctx, col2, topY, colWidth, blockHeight * 2, "Proposition de valeur", bmc.propositionValeur, "value");
  drawBlock(ctx, col3, topY, colWidth, blockHeight, "Relation client", bmc.relationClient, "relations");
  drawBlock(ctx, col3, midY, colWidth, blockHeight, "Canaux", bmc.canaux, "channels");
  drawBlock(ctx, col4, topY, colWidth, blockHeight * 2, "Segments de clientèle", bmc.segments, "segments");

  const bottomWidthHalf = colWidth * 2.5;

  drawBlock(ctx, col0, bottomY, bottomWidthHalf, blockHeight, "Structure de coûts", bmc.structureCouts, "costs");
  drawBlock(ctx, col0 + bottomWidthHalf, bottomY, bottomWidthHalf, blockHeight, "Sources de revenus", bmc.sourcesRevenus, "revenues");

  return canvas.toBuffer("image/png");
}

module.exports = { drawBmcImage };
