const express = require("express");
const bodyParser = require("body-parser");
const { createCanvas } = require("canvas");

const app = express();
app.use(bodyParser.json({ limit: "20mb" }));

// ========================================================
// =========== PARSER SWOT CORRIGÉ & ROBUSTE ==============
// ========================================================
function parseSwot(rawText) {
  // 1) Normalisation de base
  // - swotText peut être undefined
  // - certains inputs commencent par "=1. Forces :"
  let txt = (rawText || "")
    .replace(/^[=\s]+/, "")   // 🔥 enlève les "=" et espaces en tout début de texte
    .replace(/\r/g, "");      // uniformise les retours à la ligne

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

    // Titres de sections (tolérants avec ":", "-", etc.)
    if (/^1\.\s*forces?\s*[:\-]?/i.test(trimmed)) {
      current = "forces";
      continue;
    }
    if (/^2\.\s*faiblesses?\s*[:\-]?/i.test(trimmed)) {
      current = "faiblesses";
      continue;
    }
    if (
      /^3\.\s*opportunités?\s*[:\-]?/i.test(trimmed) ||
      /^3\.\s*opportunites?\s*[:\-]?/i.test(trimmed)
    ) {
      current = "opportunites";
      continue;
    }
    if (/^4\.\s*menaces?\s*[:\-]?/i.test(trimmed)) {
      current = "menaces";
      continue;
    }

    // Puces (lignes commençant par "-" ou "•")
    if (/^\s*[-•]/.test(trimmed) && current) {
      sections[current].push(
        trimmed.replace(/^\s*[-•]\s*/, "")
      );
    }
  }

  return sections;
}

// ========================================================
// =============== RENDU SWOT EN PNG ======================
// ========================================================
function drawSwotImage(swotText) {
  const width = 2000;
  const height = 2000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fond blanc
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

  const { forces, faiblesses, opportunites, menaces } = parseSwot(swotText || "");

  function drawBox(title, textLines, x, y, color) {
    // Fond de la case
    ctx.fillStyle = color;
    ctx.fillRect(x, y, boxWidth, boxHeight);

    // Bordure
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    // Titre
    ctx.fillStyle = "#000000";
    ctx.font = "bold 32px sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(title, x + 20, y + 20);

    // Texte
    ctx.font = "24px sans-serif";
    const lineHeight = 30;
    let cursorY = y + 70;
    const maxWidth = boxWidth - 40;

    function wrap(line) {
      const words = line.split(" ");
      let currentLine = "";

      for (const w of words) {
        const test = currentLine ? currentLine + " " + w : w;
        if (ctx.measureText(test).width > maxWidth) {
          ctx.fillText(currentLine, x + 20, cursorY);
          cursorY += lineHeight;
          currentLine = w;
        } else {
          currentLine = test;
        }
      }

      if (currentLine) {
        ctx.fillText(currentLine, x + 20, cursorY);
        cursorY += lineHeight;
      }
    }

    for (const t of textLines) {
      wrap("• " + t);
    }
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
  const swotText = req.body.swotText || "";
  const parsed = parseSwot(swotText);

  res.json({
    success: true,
    ...parsed
  });
});

// ========================================================
// ================= ROUTE PRINCIPALE =====================
// ========================================================
app.post("/render-swot", (req, res) => {
  try {
    const swotText = req.body.swotText;

    if (!swotText) {
      return res.status(400).json({ error: "swotText manquant" });
    }

    const png = drawSwotImage(swotText);
    const b64 = png.toString("base64");

    res.json({ success: true, png_base64: b64 });
  } catch (e) {
    console.error("Erreur render-swot :", e);
    res.status(500).json({ error: e.message });
  }
});

// ========================================================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 SWOT Renderer ready on port", PORT));
