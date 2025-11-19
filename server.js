const express = require("express");
const bodyParser = require("body-parser");
const { createCanvas } = require("canvas");

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

// --- Nouvelle fonction robuste pour parser le texte SWOT ---
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

    // Détection des titres de section
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

    // Puces de la section courante
    if (trimmed.startsWith("-") && current) {
      sections[current].push(trimmed.replace(/^-\s*/, ""));
    }
  }

  return sections;
}

function drawSwotImage(swotText) {
  const width = 2000;
  const height = 2000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fond blanc
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Layout
  const margin = 80;
  const boxWidth = (width - margin * 3) / 2;
  const boxHeight = (height - margin * 3) / 2;

  const colors = {
    forces: "#e3f2fd",
    faiblesses: "#ffebee",
    opportunites: "#e8f5e9",
    menaces: "#fffde7"
  };

  // Récupérer les sections à partir du texte
  const { forces, faiblesses, opportunites, menaces } = parseSwot(swotText || "");

  function drawBox(title, textLines, x, y, color) {
    // Fond
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
    const maxTextWidth = boxWidth - 40;

    function drawWrappedLine(line) {
      const words = line.split(" ");
      let currentLine = "";

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? currentLine + " " + words[i] : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth) {
          ctx.fillText(currentLine, x + 20, cursorY);
          cursorY += lineHeight;
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        ctx.fillText(currentLine, x + 20, cursorY);
        cursorY += lineHeight;
      }
    }

    for (const l of textLines) {
      drawWrappedLine("• " + l.trim());
    }
  }

  // Dessiner les 4 cases
  drawBox("Forces", forces, margin, margin, colors.forces);
  drawBox("Faiblesses", faiblesses, margin * 2 + boxWidth, margin, colors.faiblesses);
  drawBox("Opportunités", opportunites, margin, margin * 2 + boxHeight, colors.opportunites);
  drawBox("Menaces", menaces, margin * 2 + boxWidth, margin * 2 + boxHeight, colors.menaces);

  return canvas.toBuffer("image/png");
}
// Route de debug pour voir ce que parseSwot() comprend
app.post("/debug-swot", (req, res) => {
  try {
    const swotText = req.body.swotText || "";
    const parsed = parseSwot(swotText);

    return res.json({
      success: true,
      forces: parsed.forces,
      faiblesses: parsed.faiblesses,
      opportunites: parsed.opportunites,
      menaces: parsed.menaces,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Erreur dans /debug-swot",
      details: err.message,
    });
  }
});

app.post("/render-swot", (req, res) => {
  try {
    const swotText = req.body.swotText;
    if (!swotText) {
      return res
        .status(400)
        .json({ error: "Champ 'swotText' manquant dans le body" });
    }

    const pngBuffer = drawSwotImage(swotText);
    const b64 = pngBuffer.toString("base64");

    return res.json({
      success: true,
      png_base64: b64
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur lors du rendu SWOT", details: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 SWOT Renderer running on port ${PORT}`);
});
