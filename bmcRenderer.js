// ============================================================================
//  Business Model Canvas Renderer (Layout 9 blocs + pictos line-art)
// ============================================================================

const { createCanvas, registerFont } = require("canvas");
const path = require("path");

// ============================================================================
//  CHARGEMENT DE LA POLICE Brush Script MT
// ============================================================================
try {
  registerFont(path.join(__dirname, "fonts", "BrushScriptMT.ttf"), {
    family: "Brush Script MT",
  });
  console.log("Police Brush Script MT chargée (BMC)");
} catch (e) {
  console.warn("⚠️ Impossible de charger Brush Script MT – fallback.");
}

// ============================================================================
//  RECTANGLE ARRONDI
// ============================================================================
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

// ============================================================================
//  PICTOGRAMMES LINE-ART
// ============================================================================
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
    case "resources": {
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
      ctx.beginPath();
      ctx.moveTo(cx, cy - 25);
      ctx.lineTo(cx + 25, cy);
      ctx.lineTo(cx, cy + 25);
      ctx.lineTo(cx - 25, cy);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case "relations": {
      ctx.beginPath();
      ctx.rect(cx - 30, cy - 20, 40, 25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 5);
      ctx.lineTo(cx - 5, cy + 10);
      ctx.lineTo(cx, cy + 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(cx + 5, cy - 10, 30, 20);
      ctx.stroke();
      break;
    }
    case "channels": {
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy);
      ctx.lineTo(cx - 5, cy - 10);
      ctx.lineTo(cx + 15, cy - 5);
      ctx.lineTo(cx + 15, cy + 5);
      ctx.lineTo(cx - 5, cy + 10);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case "segments": {
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
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx - 15, cy - 5);
      ctx.lineTo(cx - 20, cy + 15);
      ctx.lineTo(cx + 20, cy + 15);
      ctx.lineTo(cx + 15, cy - 5);
      ctx.closePath();
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

// ============================================================================
//  RENDU DU BMC
// ============================================================================
function drawBmcImage(bmc = {}) {
  const width = 3000;
  const height = 2000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fond
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // ESPACEMENT
  const marginX = 80;
  const marginY = 80;
  const innerWidth = width - marginX * 2;
  const innerHeight = height - marginY * 2;

  const colWidth = innerWidth / 5;
  const blockHeight = innerHeight / 3;

  const topY = marginY;
  const midY = marginY + blockHeight;
  const bottomY = marginY + 2 * blockHeight;

  const lineColor = "#CCCCCC";

  // STYLES
  const titleFont = 'bold 38px "Brush Script MT", cursive, sans-serif';
  const textFont = '26px "Brush Script MT", cursive, sans-serif';
  const lineHeight = 34;

  // ========================================================
  //  🔥 MAPPING → correspond EXACTEMENT à ton JSON n8n
  // ========================================================
  const partenaires    = bmc.partenairesCles     || "";
  const activites      = bmc.activitesCles       || "";
  const ressources     = bmc.ressourcesCles      || "";
  const proposition    = bmc.propositionValeur   || "";
  const relationClient = bmc.relationClient      || "";
  const canaux         = bmc.canaux              || "";
  const segments       = bmc.segments            || "";
  const structure      = bmc.structureCouts      || "";
  const revenus        = bmc.sourcesRevenus      || "";

  // ========================================================
  //  Fonction de dessin de bloc
  // ========================================================
  function drawBlock(x, y, w, h, title, content, iconType) {
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    roundRect(ctx, x, y, w, h, 18);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#000";
    ctx.font = titleFont;
    ctx.textBaseline = "top";
    ctx.fillText(title, x + 18, y + 18);

    drawIcon(ctx, iconType, x + w - 60, y + 45);

    ctx.font = textFont;
    const textX = x + 20;
    let cursorY = y + 18 + 40 + lineHeight;

    if (!content) return;

    const lines = Array.isArray(content)
      ? content
      : content.split(/\r?\n/);

    const maxWidth = w - 40;

    function wrap(line, isBullet) {
      const words = (isBullet ? "• " : "" + line).split(" ");
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

    for (let raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      const bullet = /^[-•]/.test(line);
      const text = line.replace(/^[-•]\s*/, "");
      wrap(text, bullet);
    }
  }

  // ========================================================
  //  ⬛ LAYOUT EXACT demandé
  // ========================================================
  const col0 = marginX;
  const col1 = marginX + colWidth;
  const col2 = marginX + colWidth * 2;
  const col3 = marginX + colWidth * 3;
  const col4 = marginX + colWidth * 4;

  // Haut
  drawBlock(col0, topY, colWidth, blockHeight * 2, "Partenaires clés", partenaires, "partners");
  drawBlock(col1, topY, colWidth, blockHeight, "Activités clés", activites, "activities");
  drawBlock(col1, midY, colWidth, blockHeight, "Ressources clés", ressources, "resources");
  drawBlock(col2, topY, colWidth, blockHeight * 2, "Proposition de valeur", proposition, "value");
  drawBlock(col3, topY, colWidth, blockHeight, "Relation client", relationClient, "relations");
  drawBlock(col3, midY, colWidth, blockHeight, "Canaux", canaux, "channels");
  drawBlock(col4, topY, colWidth, blockHeight * 2, "Segments de clientèle", segments, "segments");

  // Bas (2,5 colonnes)
  const widthHalf = colWidth * 2.5;
  drawBlock(marginX, bottomY, widthHalf, blockHeight, "Structure de coûts", structure, "costs");
  drawBlock(marginX + widthHalf, bottomY, widthHalf, blockHeight, "Sources de revenus", revenus, "revenues");

  return canvas.toBuffer("image/png");
}

module.exports = { drawBmcImage };
