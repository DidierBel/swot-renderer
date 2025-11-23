// ======================
// BMC RENDERER – VERSION STABLE (synchronisée)
// Aucune image externe → PNG garanti valide
// ======================

const { createCanvas, registerFont } = require("canvas");
const path = require("path");

// ======================
// Charger Brush Script MT (ta version stable)
// ======================
try {
  registerFont(path.join(__dirname, "fonts", "BrushScriptMT.ttf"), {
    family: "Brush Script MT",
  });
  console.log("Police Brush Script MT chargée (BMC)");
} catch (e) {
  console.warn("⚠️ Impossible de charger Brush Script MT (BMC) – fallback.");
}

// ======================
// Helpers : rectangle arrondi
// ======================
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

// ======================
// Icônes stylisées (Canvas-only)
// → jamais de fichiers externes = jamais de PNG corrompu
// ======================
function drawIcon(ctx, type, cx, cy) {
  ctx.save();
  ctx.strokeStyle = "#7A2B2B"; // joli bordeaux
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  switch (type) {
    case "partners": // poignée de main
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy + 4);
      ctx.lineTo(cx - 6, cy - 8);
      ctx.lineTo(cx + 6, cy + 4);
      ctx.lineTo(cx + 22, cy - 8);
      ctx.stroke();
      break;

    case "activities": // engrenage
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI * 2) / 6;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16);
        ctx.lineTo(cx + Math.cos(a) * 24, cy + Math.sin(a) * 24);
        ctx.stroke();
      }
      break;

    case "resources": // cube isométrique
      ctx.beginPath();
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx + 18, cy - 4);
      ctx.lineTo(cx + 18, cy + 14);
      ctx.lineTo(cx, cy + 4);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx - 18, cy - 4);
      ctx.lineTo(cx - 18, cy + 14);
      ctx.lineTo(cx, cy + 4);
      ctx.stroke();
      break;

    case "value": // diamant
      ctx.beginPath();
      ctx.moveTo(cx, cy - 18);
      ctx.lineTo(cx + 18, cy);
      ctx.lineTo(cx, cy + 18);
      ctx.lineTo(cx - 18, cy);
      ctx.closePath();
      ctx.stroke();
      break;

    case "relations": // bulles
      roundRect(ctx, cx - 30, cy - 16, 40, 24, 6);
      ctx.stroke();
      roundRect(ctx, cx - 4, cy - 8, 32, 20, 6);
      ctx.stroke();
      break;

    case "channels": // camion livraison
      ctx.beginPath();
      ctx.rect(cx - 20, cy - 8, 30, 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 10, cy + 10, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 10, cy + 10, 6, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case "segments": // silhouettes
      for (let i = -1; i <= 1; i++) {
        const x = cx + i * 16;
        ctx.beginPath();
        ctx.arc(x, cy - 6, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, cy + 4);
        ctx.lineTo(x, cy + 16);
        ctx.stroke();
      }
      break;

    case "costs": // €
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0.2, Math.PI * 1.25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 10);
      ctx.lineTo(cx + 8, cy - 10);
      ctx.moveTo(cx - 12, cy + 10);
      ctx.lineTo(cx + 8, cy + 10);
      ctx.stroke();
      break;

    case "revenues": // étiquette prix
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 10);
      ctx.lineTo(cx + 18, cy - 10);
      ctx.lineTo(cx + 18, cy + 10);
      ctx.lineTo(cx - 18, cy + 10);
      ctx.closePath();
      ctx.stroke();
      break;
  }

  ctx.restore();
}

// ======================
// drawBlock — hanging indent propre
// ======================
function drawBlock(ctx, x, y, w, h, title, values, iconType) {
  ctx.save();

  // Contour
  ctx.strokeStyle = "#CCCCCC";
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 20);
  ctx.stroke();

  // Titre
  ctx.fillStyle = "#000";
  ctx.font = 'bold 36px "Brush Script MT"';
  ctx.fillText(title, x + 20, y + 20);

  // Icône
  drawIcon(ctx, iconType, x + w - 60, y + 40);

  // Texte
  ctx.font = '26px "Brush Script MT"';

  if (!Array.isArray(values)) values = [];

  const bulletX = x + 20;
  const textX = x + 50;
  const maxWidth = w - 60;
  const lineHeight = 34;
  let cursorY = y + 90;

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

// ======================
// Renderer principal
// ======================
function drawBmcImage(bmc) {
  const width = 3000;
  const height = 2000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fond
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  const M = 80;
  const innerW = width - M * 2;
  const innerH = height - M * 2;

  const colW = innerW / 5;
  const blockH = innerH / 3;

  const top = M;
  const mid = M + blockH;
  const bot = M + blockH * 2;

  const c0 = M;
  const c1 = M + colW;
  const c2 = M + colW * 2;
  const c3 = M + colW * 3;
  const c4 = M + colW * 4;

  drawBlock(ctx, c0, top, colW, blockH * 2, "Partenaires clés", bmc.partenairesCles, "partners");
  drawBlock(ctx, c1, top, colW, blockH, "Activités clés", bmc.activitesCles, "activities");
  drawBlock(ctx, c1, mid, colW, blockH, "Ressources clés", bmc.ressourcesCles, "resources");
  drawBlock(ctx, c2, top, colW, blockH * 2, "Proposition de valeur", bmc.propositionValeur, "value");
  drawBlock(ctx, c3, top, colW, blockH, "Relation client", bmc.relationClient, "relations");
  drawBlock(ctx, c3, mid, colW, blockH, "Canaux", bmc.canaux, "channels");
  drawBlock(ctx, c4, top, colW, blockH * 2, "Segments de clientèle", bmc.segments, "segments");

  const half = colW * 2.5;

  drawBlock(ctx, c0, bot, half, blockH, "Structure de coûts", bmc.structureCouts, "costs");
  drawBlock(ctx, c0 + half, bot, half, blockH, "Sources de revenus", bmc.sourcesRevenus, "revenues");

  return canvas.toBuffer("image/png");
}

module.exports = { drawBmcImage };
