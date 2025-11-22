const express = require("express");
const bodyParser = require("body-parser");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");

const app = express();
app.use(bodyParser.json({ limit: "20mb" }));

// ========================================================
// == CHARGEMENT DE LA POLICE STXINGKAI (avec fallback) ===
// ========================================================
try {
  registerFont(path.join(__dirname, "fonts", "STXingkai.ttf"), {
    family: "STXingkai"
  });
  console.log("Police STXingkai chargée");
} catch (e) {
  console.warn("⚠️ Impossible de charger STXingkai – fallback activé");
}

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

    if (/^1\.\s*forces?/i.test(trimmed)) {
      current = "forces"; continue;
    }
    if (/^2\.\s*faiblesses?/i.test(trimmed)) {
      current = "faiblesses"; continue;
    }
    if (/^3\.\s*opportun/i.test(trimmed)) {
      current = "opportunites"; continue;
    }
    if (/^4\.\s*menaces?/i.test(trimmed)) {
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
// ================= RENDU DE L’IMAGE =====================
// ========================================================
function drawSwotImage(swotText) {
  const width = 2000;
  const height = 2000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fond
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const margin = 80;
  const boxWidth = (width - margin * 3) / 2;
  const boxHeight = (height - margin * 3) / 2;

  const colors = {
    forces: "#e3f2fd",
    faiblesses: "#ffebee",
    opportunites: "#c8e6c9",
    menaces: "#fff9c4"
  };

  const r = 35; // rayon des coins arrondis

  const { forces, faiblesses, opportunites, menaces } = parseSwot(swotText || "");

  function drawBox(title, textLines, x, y, color) {
    // --- Fond arrondi ---
    ctx.fillStyle = color;
    roundRect(ctx, x, y, boxWidth, boxHeight, r);
    ctx.fill();

    // --- Bordure arrondie ---
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    roundRect(ctx, x, y, boxWidth, boxHeight, r);
    ctx.stroke();

    // --- Titre ---
    ctx.fillStyle = "#000";
    ctx.font = "bold 38px STXingkai, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(title, x + 20, y + 20);

    // --- Texte ---
    ctx.font = "28px STXingkai, sans-serif";
    const lineHeight = 40;
    let cursorY = y + 120;  // 🔥 2 interlignes sous le titre

    const maxWidth = boxWidth - 60;

    // Gestion fine des retours à la ligne
    function wrapBulletLine(text) {
      const words = text.split(" ");
      let cur = "";
      let first = true;

      words.forEach((w) => {
        const test = cur ? cur + " " + w : w;
        if (ctx.measureText(test).width > maxWidth) {
          ctx.fillText(cur, x + 60, cursorY); // 🔥 alignement sous la 1ère ligne du texte (x + 60)
          cursorY += lineHeight;
          cur = w;
        } else {
          cur = test;
        }
      });

      if (cur) {
        ctx.fillText(cur, x + 60, cursorY);
        cursorY += lineHeight;
      }
    }

    // Dessin des bullet points
    textLines.forEach((line) => {
      // Puce alignée
      ctx.fillText("•", x + 30, cursorY);
      wrapBulletLine(line);
    });
  }

  drawBox("Forces", forces, margin, margin, colors.forces);
  drawBox("Faiblesses", faiblesses, margin * 2 + boxWidth, margin, colors.faiblesses);
  drawBox("Opportunités", opportunites, margin, margin * 2 + boxHeight, colors.opportunites);
  drawBox("Menaces", menaces, margin * 2 + boxWidth, margin * 2 + boxHeight, colors.menaces);

  return canvas.toBuffer("image/png");
}

// ========================================================
// ================= ROUTE DE DEBUG =======================
// ========================================================
app.post("/test-parsing", (req, res) => {
  res.json({
    success: true,
    ...parseSwot(req.body.swotText || "")
  });
});

// ========================================================
// ================= ROUTE PRINCIPALE =====================
// ========================================================
app.post("/render-swot", (req, res) => {
  try {
    if (!req.body.swotText) {
      return res.status(400).json({ error: "swotText manquant" });
    }

    const png = drawSwotImage(req.body.swotText);
    res.json({ success: true, png_base64: png.toString("base64") });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 SWOT Renderer ready on port", PORT));
