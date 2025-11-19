const express = require("express");
const bodyParser = require("body-parser");
const { createCanvas } = require("canvas");

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

// ----------------------------
// 🔍 DEBUG : Inspecter le texte reçu
// ----------------------------
app.post("/debug-raw", (req, res) => {
  const raw = req.body.swotText || "";

  return res.json({
    success: true,
    rawText: raw,
    rawChars: raw.split("").map(c => c.charCodeAt(0)),
    preview: raw.slice(0, 500)
  });
});

// ----------------------------
// 🧠 Parse SWOT avancé + tolérant
// ----------------------------
function parseSwot(rawText) {
  const lines = (rawText || "")
    .replace(/\r/g, "")
    .replace(/\u200B|\u200C|\u200D|\uFEFF/g, "") // ZERO WIDTH fixes
    .split("\n");

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

    // Détection titres
    if (/^1\.\s*Forces/i.test(trimmed)) {
      current = "forces";
      continue;
    }
    if (/^2\.\s*Faiblesses/i.test(trimmed)) {
      current = "faiblesses";
      continue;
    }
    if (/^3\.\s*Opportunités/i.test(trimmed) || /^3\.\s*Opportunites/i.test(trimmed)) {
      current = "opportunites";
      continue;
    }
    if (/^4\.\s*Menaces/i.test(trimmed)) {
      current = "menaces";
      continue;
    }

    // Ajout des puces
    if (trimmed.startsWith("-") && current) {
      sections[current].push(trimmed.replace(/^-\s*/, ""));
    }
  }

  return sections;
}

// ----------------------------
// 🎨 Génération image SWOT
// ----------------------------
function drawSwotImage(swotText) {
  const width = 2000;
  const height = 2000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // fond blanc
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const margin = 80;
  const boxWidth = (width - margin * 3) / 2;
  const boxHeight = (height - margin * 3) / 2;

  const colors = {
    forces: "#e3f2fd",
    faiblesses: "#ffebee",
    opportunites: "#e8f5e9",
    menaces: "#fffde7"
  };

  const { forces, faiblesses, opportunites, menaces } = parseSwot(swotText);

  console.log("📌 Parsed SWOT:", { forces, faiblesses, opportunites, menaces });

  function drawBox(title, textLines, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, boxWidth, boxHeight);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    ctx.fillStyle = "#000";
    ctx.font = "bold 34px sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(title, x + 20, y + 20);

    ctx.font = "24px sans-serif";

    const lineHeight = 30;
    let cursorY = y + 80;
    const maxWidth = boxWidth - 40;

    const wrap = (text) => {
      const words = text.split(" ");
      let line = "";

      for (let w of words) {
        const testLine = line ? line + " " + w : w;
        if (ctx.measureText(testLine).width > maxWidth) {
          ctx.fillText(line, x + 20, cursorY);
          cursorY += lineHeight;
          line = w;
        } else {
          line = testLine;
        }
      }

      if (line) {
        ctx.fillText(line, x + 20, cursorY);
        cursorY += lineHeight;
      }
    };

    textLines.forEach(t => wrap("• " + t));
  }

  drawBox("Forces", forces, margin, margin, colors.forces);
  drawBox("Faiblesses", faiblesses, margin * 2 + boxWidth, margin, colors.faiblesses);
  drawBox("Opportunités", opportunites, margin, margin * 2 + boxHeight, colors.opportunites);
  drawBox("Menaces", menaces, margin * 2 + boxWidth, margin * 2 + boxHeight, colors.menaces);

  return canvas.toBuffer("image/png");
}

// ----------------------------
// 🖼 Route principale
// ----------------------------
app.post("/render-swot", (req, res) => {
  try {
    const swotText = req.body.swotText;

    if (!swotText) {
      return res.status(400).json({ error: "Champ 'swotText' manquant" });
    }

    const png = drawSwotImage(swotText);
    const b64 = png.toString("base64");

    res.json({
      success: true,
      png_base64: b64
    });

  } catch (err) {
    console.error("🔥 ERREUR:", err);
    res.status(500).json({ error: "Erreur serveur SWOT", details: err.message });
  }
});

// ----------------------------
// 🚀 Lancement serveur
// ----------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 SWOT Renderer running on http://localhost:${PORT}`);
});

