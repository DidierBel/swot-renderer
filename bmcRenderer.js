// Génération d'un Business Model Canvas en 9 blocs avec pictos line-art

const { createCanvas, registerFont } = require("canvas");
const path = require("path");

// ==============================================
//   POLICE Brush Script MT (optionnel)
// ==============================================
try {
  registerFont(path.join(__dirname, "fonts", "BrushScriptMT.ttf"), {
    family: "Brush Script MT",
  });
  console.log("Police Brush Script MT chargée (BMC)");
} catch (e) {
  console.warn("⚠️ Impossible de charger Brush Script MT (BMC) – fallback.");
}

// ==============================================
//   HELPERS : RECTANGLE ARRONDI
// ==============================================
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

// ==============================================
//   HELPERS : PICTOGRAMMES LINE-ART
// ==============================================
function drawIcon(ctx, type, cx, cy) {
  ctx.save();
  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  switch (type) {
    case "partners": {
      // Deux mains qui se serrent
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
    }
    case "activities": {
      // Engrenage simple
      const r = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        const x1 = cx + (r + 2) * Math.cos(angle);
        const y1 = cy + (r + 2) * Math.sin(angle);
        const x2 = cx + (r + 10) * Math.cos(angle);
        const y2 = cy + (r + 10) * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      break;
    }
    case "resources": {
      // Boîte / cube
      ctx.beginPath();
      ctx.rect(cx - 25, cy - 18, 50, 30);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 25, cy - 18);
      ctx.lineTo(cx, cy - 32);
      ctx.lineTo(cx + 25, cy - 18);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 25, cy - 18);
      ctx.lineTo(cx + 25, cy + 12);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy - 32);
      ctx.stroke();
      break;
    }
    case "value": {
      // Diamant
      ctx.beginPath();
      ctx.moveTo(cx, cy - 25);
      ctx.lineTo(cx + 25, cy);
      ctx.lineTo(cx, cy + 25);
      ctx.lineTo(cx - 25, cy);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 5);
      ctx.lineTo(cx + 15, cy - 5);
      ctx.stroke();
      break;
    }
    case "relations": {
      // Deux bulles de dialogue
      ctx.beginPath();
      ctx.roundRect?.(cx - 30, cy - 20, 40, 25, 6) || ctx.rect(cx - 30, cy - 20, 40, 25);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 5);
      ctx.lineTo(cx - 5, cy + 10);
      ctx.lineTo(cx, cy + 5);
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect?.(cx + 5, cy - 10, 30, 20, 6) || ctx.rect(cx + 5, cy - 10, 30, 20);
      ctx.stroke();
      break;
    }
    case "channels": {
      // Mégaphone
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy);
      ctx.lineTo(cx - 5, cy - 10);
      ctx.lineTo(cx + 15, cy - 5);
      ctx.lineTo(cx + 15, cy + 5);
      ctx.lineTo(cx - 5, cy + 10);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 20, cy);
      ctx.lineTo(cx - 25, cy + 12);
      ctx.stroke();
      break;
    }
    case "segments": {
      // 3 silhouettes
      const r = 8;
      const offset = 15;
      for (let i = -1; i <= 1; i++) {
        const x = cx + i * offset;
        ctx.beginPath();
        ctx.arc(x, cy - 8, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, cy + r);
        ctx.lineTo(x, cy + r + 14);
        ctx.stroke();
      }
      break;
    }
    case "costs": {
      // Symbole € stylisé
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
    }
    case "revenues": {
      // Sac d'argent simplifié
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx - 15, cy - 5);
      ctx.lineTo(cx - 20, cy + 15);
      ctx.lineTo(cx + 20, cy + 15);
      ctx.lineTo(cx + 15, cy - 5);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 8);
      ctx.lineTo(cx + 8, cy - 8);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx, cy - 28);
      ctx.stroke();
      break;
    }
    default:
      break;
  }

  ctx.restore();
}

// ==============================================
//   RENDU DU BMC
// ==============================================
function drawBmcImage(bmc = {}) {
  const width = 3000;
  const height = 2000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fond
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Grille
  const marginX = 80;
  const marginY = 80;
  const innerWidth = width - marginX * 2;
  const innerHeight = height - marginY * 2;

  // 5 colonnes, 3 hauteurs (2 pour le haut, 1 pour le bas)
  const colWidth = innerWidth / 5;
  const blockHeight = innerHeight / 3;

  const topY = marginY;
  const midY = marginY + blockHeight;
  const bottomY = marginY + 2 * blockHeight;

  const lineColor = "#CCCCCC";

  // Styles texte
  const titleFont = 'bold 38px "Brush Script MT", cursive, sans-serif';
  const textFont = '26px "Brush Script MT", cursive, sans-serif';
  const lineHeight = 34;

  function drawBlock(x, y, w, h, title, content, iconType) {
    // Contour
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    roundRect(ctx, x, y, w, h, 18);
    ctx.stroke();
    ctx.restore();

    // Titre
    ctx.fillStyle = "#000000";
    ctx.font = titleFont;
    ctx.textBaseline = "top";
    ctx.fillText(title, x + 18, y + 18);

    // Icône (en haut à droite)
    drawIcon(ctx, iconType, x + w - 60, y + 45);

    // Texte
    ctx.font = textFont;

    const textX = x + 20;
    let cursorY = y + 18 + 40 + lineHeight; // titre + 1 interligne
    const maxWidth = w - 40;

    if (!content) return;

    const lines = content.split(/\r?\n/).filter(l => l.trim() !== "");

    function drawWrapped(line, isBulleted) {
      const prefix = isBulleted ? "• " : "";
      const words = (prefix + line.trim()).split(" ");
      let current = "";

      for (const w of words) {
        const test = current ? current + " " + w : w;
        if (ctx.measureText(test).width > maxWidth) {
          ctx.fillText(current, textX, cursorY);
          cursorY += lineHeight;
          current = w;
        } else {
          current = test;
        }
      }
      if (current) {
        ctx.fillText(current, textX, cursorY);
        cursorY += lineHeight;
      }
    }

    for (const raw of lines) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const isBullet = /^[-•]/.test(trimmed);
      const text = trimmed.replace(/^[-•]\s*/, "");
      drawWrapped(text, isBullet);
    }
  }

  // ------------------------------------------------------
  //  Layout défini par toi :
  //  Col 0: Partenaires clés (2 hauteurs)
  //  Col 1: Activités clés (haut) / Ressources clés (bas)
  //  Col 2: Proposition de valeur (2 hauteurs)
  //  Col 3: Relation client (haut) / Canaux (bas)
  //  Col 4: Segments de clientèle (2 hauteurs)
  //
  //  Bas : Structure de coûts (2,5 colonnes) + Sources de revenus (2,5 colonnes)
  // ------------------------------------------------------

  // Colonnes X
  const col0 = marginX;
  const col1 = marginX + colWidth;
  const col2 = marginX + 2 * colWidth;
  const col3 = marginX + 3 * colWidth;
  const col4 = marginX + 4 * colWidth;

  // Haut (double hauteur)
  drawBlock(
    col0,
    topY,
    colWidth,
    blockHeight * 2,
    "Partenaires clés",
    bmc.partenaires_cles || "",
    "partners"
  );

  drawBlock(
    col1,
    topY,
    colWidth,
    blockHeight,
    "Activités clés",
    bmc.activites_cles || "",
    "activities"
  );

  drawBlock(
    col1,
    midY,
    colWidth,
    blockHeight,
    "Ressources clés",
    bmc.ressources_cles || "",
    "resources"
  );

  drawBlock(
    col2,
    topY,
    colWidth,
    blockHeight * 2,
    "Proposition de valeur",
    bmc.proposition_valeur || "",
    "value"
  );

  drawBlock(
    col3,
    topY,
    colWidth,
    blockHeight,
    "Relation client",
    bmc.relation_client || "",
    "relations"
  );

  drawBlock(
    col3,
    midY,
    colWidth,
    blockHeight,
    "Canaux",
    bmc.canaux || "",
    "channels"
  );

  drawBlock(
    col4,
    topY,
    colWidth,
    blockHeight * 2,
    "Segments de clientèle",
    bmc.segments_clientele || "",
    "segments"
  );

  // Bas : 2,5 colonnes + 2,5 colonnes
  const bottomWidthHalf = colWidth * 2.5;

  drawBlock(
    marginX,
    bottomY,
    bottomWidthHalf,
    blockHeight,
    "Structure de coûts",
    bmc.structure_couts || "",
    "costs"
  );

  drawBlock(
    marginX + bottomWidthHalf,
    bottomY,
    bottomWidthHalf,
    blockHeight,
    "Sources de revenus",
    bmc.sources_revenus || "",
    "revenues"
  );

  return canvas.toBuffer("image/png");
}

module.exports = {
  drawBmcImage,
