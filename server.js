const express = require("express");
const bodyParser = require("body-parser");
const { createCanvas } = require("canvas");

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

// ====== UTILITAIRE : NORMALISATION POUR MATCH ROBUSTE ======
function normalize(str = "") {
  return str
    .normalize("NFD")                    // décompose les accents
    .replace(/[\u0300-\u036f]/g, "")     // enlève les accents
    .toLowerCase()                       // minuscule
    .replace(/\s+/g, " ")                // espaces multiples -> 1 espace
    .trim();
}

// ==== PARSING ULTRA-ROBUSTE DES 4 SECTIONS ====
function parseSwot(rawText) {
  const lines = (rawText || "").split(/\r?\n/);

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

    const norm = normalize(trimmed);

    // --- Détection des titres de sections ---
    // On détecte simplement : numéro + mot-clé, peu importe le reste
    if (norm.startsWith("1. ") && norm.includes("forces")) {
      current = "forces";
      continue;
    }
    if (norm.startsWith("2. ") && norm.includes("faiblesses")) {
      current = "faiblesses";
      continue;
    }
    if (norm.startsWith("3. ") && (norm.includes("opportunites") || norm.includes("opportunite"))) {
      current = "opportunites";
      continue;
    }
    if (norm.startsWith("4. ") && norm.includes("menaces")) {
      current = "menaces";
      continue;
    }

    // --- Puces (lignes commençant par - ou •) ---
    if (/^\s*[-•]/.test(trimmed) && current) {
      const cleaned = trimmed.replace(/^\s*[-•]\s*/, "");
      sections[current].push(cleaned);
    }
  }

  return sections;
}

// ==== RENDU SWOT EN PNG ====
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

  const colors = {
    forces: "#e3f2fd",
    faiblesses: "#ffebee",
    opportunites: "#03A333",
    menaces: "#fffde7"
  };

  const { forces, faiblesses, opportunites, menaces } = parseSwot(swotText || "");

  function drawBox(title, textLines, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, boxWidth, boxHeight);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 32px sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(title, x + 20, y + 20);

    ctx.font = "24px sans-serif";
    const lineHeight = 30;
    let cursorY = y + 70;
    const maxWidth = boxWidth - 40;

    function wrap(line) {
      const words = line.split(" ");
      let current = "";
      for (const w of words) {
        const test = current ? current + " " + w : w;
        if (ctx.measureText(test).width > maxWidth) {
          ctx.fillText(current, x + 20, cursorY);
          cursorY += lineHeight;
          current = w;
        } else {
          current = test;
        }
      }
      if (current) {
        ctx.fillText(current, x + 20, cursorY);
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

// ==== ROUTE DE DEBUG POUR TESTER LE PARSING ====
app.post("/test-parsing", (req, res) => {
  const swotText = req.body.swotText || "";
  const sections = parseSwot(swotText);
  res.json({ success: true, ...sections });
});

// ==== ROUTE PRINCIPALE ====
app.post("/render-swot", (req, res) => {
  try {
    const swotText = req.body.swotText;
    if (!swotText) return res.status(400).json({ error: "swotText manquant" });

    const png = drawSwotImage(swotText);
    const b64 = png.toString("base64");

    res.json({ success: true, png_base64: b64 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 SWOT Renderer ready on port", PORT));
