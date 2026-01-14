// matrixRenderer.js
const { createCanvas } = require("canvas");

// ========================================================
// ======= PARSER MATRICE EISENHOWER (robuste) ============
// Attendu (comme ton node n8n):
// 1. À faire:
// - ...
// 2. À planifier:
// - ...
// 3. À déléguer:
// - ...
// 4. À abandonner:
// - ...
// ========================================================
function parseMatrix(rawText) {
  let txt = (rawText || "")
    .replace(/^[=\s]+/, "")
    .replace(/\r/g, "");

  const lines = txt.split("\n");

  const sections = {
    faire: [],
    planifier: [],
    deleguer: [],
    abandonner: []
  };

  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 1. À faire
    if (/^1\.\s*(à\s*faire|a\s*faire|faire)\s*[:\-]?/i.test(trimmed)) {
      current = "faire"; 
      continue;
    }

    // 2. À planifier
    if (/^2\.\s*(à\s*planifier|a\s*planifier|planifier)\s*[:\-]?/i.test(trimmed)) {
      current = "planifier";
      continue;
    }

    // 3. À déléguer
    if (/^3\.\s*(à\s*d[ée]l[ée]guer|a\s*d[ée]l[ée]guer|d[ée]l[ée]guer|deleguer)\s*[:\-]?/i.test(trimmed)) {
      current = "deleguer";
      continue;
    }

    // 4. À abandonner
    if (/^4\.\s*(à\s*abandonner|a\s*abandonner|abandonner)\s*[:\-]?/i.test(trimmed)) {
      current = "abandonner";
      continue;
    }

    // puces
    if (/^\s*[-•]/.test(trimmed) && current) {
      sections[current].push(trimmed.replace(/^\s*[-•]\s*/, ""));
    }
  }

  return sections;
}

// ========================================================
// =============== OUTIL : RECTANGLE ARRONDI ==============
// ========================================================
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

// ========================================================
// ============ RENDU IMAGE MATRICE EISENHOWER ============
// Style visuel inspiré de l'image Asana :
// - Titre centré
// - axes "Urgent / Non urgent" + "Important / Non important"
// - 4 quadrants colorés avec texte en blanc
// ========================================================
function drawMatrixImage(matrixText) {
  const width = 2000;
  const height = 2000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#f3f3f3";
  ctx.fillRect(0, 0, width, height);

  // Layout
  const margin = 120;
  const titleH = 180;
  const axisLabelSpace = 120;

  const gridX = margin + axisLabelSpace;
  const gridY = margin + titleH;
  const gridW = width - margin * 2 - axisLabelSpace;
  const gridH = height - margin * 2 - titleH;

  const halfW = gridW / 2;
  const halfH = gridH / 2;

  const radius = 22;

  // Colors proches de l’exemple
  const colors = {
    faire: "#4f9b7a",       // vert
    planifier: "#f19a82",   // orange/saumon
    deleguer: "#4c73c8",    // bleu
    abandonner: "#f06f6c"   // rouge
  };

  // Parse text
  const { faire, planifier, deleguer, abandonner } = parseMatrix(matrixText || "");

  // --------------------------------------------------------
  // Titre
  // --------------------------------------------------------
  ctx.fillStyle = "#111";
  ctx.font = "bold 64px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Matrice Importance / Urgence", width / 2, margin + 60);

  // --------------------------------------------------------
  // Labels axes (haut)
  // --------------------------------------------------------
  ctx.font = "bold 44px Arial";
  ctx.fillStyle = "#111";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Urgent (col gauche)
  ctx.fillText("Urgent", gridX + halfW / 2, gridY - 60);
  // Non urgent (col droite)
  ctx.fillText("Non urgent", gridX + halfW + halfW / 2, gridY - 60);

  // Labels axe vertical (rotation)
  ctx.save();
  ctx.translate(margin + 50, gridY + halfH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Important", 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(margin + 50, gridY + halfH + halfH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Non important", 0, 0);
  ctx.restore();

  // --------------------------------------------------------
  // Séparateurs (croix centrale + bord)
  // --------------------------------------------------------
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 4;

  // Bordure globale
  ctx.strokeRect(gridX, gridY, gridW, gridH);

  // Vertical middle
  ctx.beginPath();
  ctx.moveTo(gridX + halfW, gridY);
  ctx.lineTo(gridX + halfW, gridY + gridH);
  ctx.stroke();

  // Horizontal middle
  ctx.beginPath();
  ctx.moveTo(gridX, gridY + halfH);
  ctx.lineTo(gridX + gridW, gridY + halfH);
  ctx.stroke();

  // --------------------------------------------------------
  // Helper : dessiner un quadrant
  // --------------------------------------------------------
  function drawQuadrant(title, lines, x, y, color) {
    // Fond arrondi
    ctx.fillStyle = color;
    roundRect(ctx, x, y, halfW, halfH, radius);
    ctx.fill();

    // (optionnel) petite transparence pour laisser voir les lignes de séparation :
    // on évite pour rester simple.

    // Texte
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // Titre quadrant
    ctx.font = "bold 48px Arial";
    ctx.fillText(title, x + 48, y + 48);

    // Items
    ctx.font = "36px Arial";
    const lineHeight = 50;

    let cursorY = y + 48 + 70;
    const maxWidth = halfW - 110;
    const bulletX = x + 52;
    const textX = x + 90;

    function wrapLine(text) {
      const words = text.split(" ");
      let currentLine = "";

      for (const word of words) {
        const test = currentLine ? currentLine + " " + word : word;
        if (ctx.measureText(test).width > maxWidth) {
          ctx.fillText(currentLine, textX, cursorY);
          cursorY += lineHeight;
          currentLine = word;
        } else {
          currentLine = test;
        }
      }

      if (currentLine) {
        ctx.fillText(currentLine, textX, cursorY);
        cursorY += lineHeight;
      }
    }

    for (const line of lines) {
      // stop si on dépasse trop (évite de sortir du carré)
      if (cursorY > y + halfH - 70) break;

      ctx.fillText("•", bulletX, cursorY);
      wrapLine(line);
    }
  }

  // --------------------------------------------------------
  // Quadrants (ordre Eisenhower)
  // Top-left: Important & Urgent => À faire
  // Top-right: Important & Non urgent => À planifier
  // Bottom-left: Non important & Urgent => À déléguer
  // Bottom-right: Non important & Non urgent => À abandonner
  // --------------------------------------------------------
  drawQuadrant("À faire", faire, gridX, gridY, colors.faire);
  drawQuadrant("À planifier", planifier, gridX + halfW, gridY, colors.planifier);
  drawQuadrant("À déléguer", deleguer, gridX, gridY + halfH, colors.deleguer);
  drawQuadrant("À abandonner", abandonner, gridX + halfW, gridY + halfH, colors.abandonner);

  // Redessiner les séparateurs au-dessus des quadrants (pour être sûr qu’ils restent visibles)
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 4;

  ctx.strokeRect(gridX, gridY, gridW, gridH);

  ctx.beginPath();
  ctx.moveTo(gridX + halfW, gridY);
  ctx.lineTo(gridX + halfW, gridY + gridH);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(gridX, gridY + halfH);
  ctx.lineTo(gridX + gridW, gridY + halfH);
  ctx.stroke();

  return canvas.toBuffer("image/png");
}

module.exports = {
  parseMatrix,
  drawMatrixImage
};
