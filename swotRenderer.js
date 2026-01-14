const { createCanvas } = require("canvas");

// ========================================================
// =========== PARSER SWOT CORRIGÉ & ROBUSTE ==============
// ========================================================
function parseSwot(rawText) {
  let txt = (rawText || "")
    .replace(/^[=\s]+/, "")
    .replace(/\r/g, "");

  const lines = txt.split("\n");

  const sections = {
    forces: [],
    faiblesses: [],
    opportunites: [],
    menaces: []
  };

  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^1\.\s*forces?\s*[:\-]?/i.test(trimmed)) {
      current = "forces"; continue;
    }
    if (/^2\.\s*faiblesses?\s*[:\-]?/i.test(trimmed)) {
      current = "faiblesses"; continue;
    }
    if (
      /^3\.\s*opportunités?\s*[:\-]?/i.test(trimmed) ||
      /^3\.\s*opportunites?\s*[:\-]?/i.test(trimmed)
    ) {
      current = "opportunites"; continue;
    }
    if (/^4\.\s*menaces?\s*[:\-]?/i.test(trimmed)) {
      current = "menaces"; continue;
    }

    if (/^\s*[-•]/.test(trimmed) && current) {
      sections[current].push(
        trimmed.replace(/^\s*[-•]\s*/, "")
      );
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
// ================= RENDU DE L’IMAGE SWOT ================
// ========================================================
function drawSwotImage(swotText) {
  const width = 2000;
  const height = 2000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const margin = 80;
  const boxWidth = (width - margin * 3) / 2;
  const boxHeight = (height - margin * 3) / 2;

  // 🎨 COULEURS
  const colors = {
    forces: "#00e091",
    faiblesses: "#ffd800",
    opportunites: "#a998ee",
    menaces: "#FF5E4D"
  };

  const radius = 35;

  const { forces, faiblesses, opportunites, menaces } = parseSwot(swotText || "");

  function drawBox(title, textLines, x, y, color) {
    // Fond arrondi
    ctx.fillStyle = color;
    roundRect(ctx, x, y, boxWidth, boxHeight, radius);
    ctx.fill();

    // Bordure
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    roundRect(ctx, x, y, boxWidth, boxHeight, radius);
    ctx.stroke();

    // Titre
    ctx.fillStyle = "#000";
    ctx.font = "bold 40px Arial";
    ctx.textBaseline = "top";
    ctx.fillText(title, x + 24, y + 24);

    // Texte
    ctx.font = "30px Arial";
    const lineHeight = 42;

    // Deux interlignes après le titre
    let cursorY = y + 24 + 40 + (lineHeight * 2);

    const maxWidth = boxWidth - 70;
    const bulletX = x + 32;
    const textX = x + 60;

    function wrapBulletLine(text) {
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

    // Liste à puces
    for (const line of textLines) {
      ctx.fillText("•", bulletX, cursorY);
      wrapBulletLine(line);
    }
  }

  drawBox("Forces", forces, margin, margin, colors.forces);
  drawBox("Faiblesses", faiblesses, margin * 2 + boxWidth, margin, colors.faiblesses);
  drawBox("Opportunités", opportunites, margin, margin * 2 + boxHeight, colors.opportunites);
  drawBox("Menaces", menaces, margin * 2 + boxWidth, margin * 2 + boxHeight, colors.menaces);

  return canvas.toBuffer("image/png");
}

module.exports = {
  parseSwot,
  drawSwotImage
};

