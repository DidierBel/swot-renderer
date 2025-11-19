const express = require("express");
const bodyParser = require("body-parser");
const { createCanvas } = require("canvas");

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

// -------------------------------------
// 🔥 PARSEUR SWOT ULTRA ROBUSTE
// -------------------------------------
function parseSwot(raw) {
  const sections = {
    forces: [],
    faiblesses: [],
    opportunites: [],
    menaces: []
  };

  // Normalisation très importante
  const text = raw
    .replace(/\r/g, "")
    .replace(/\u2019/g, "'")
    .replace(/–/g, "-")
    .trim();

  // Extraction via blocs
  const regex = /(\d\.\s*(Forces|Faiblesses|Opportunités|Opportunites|Menaces))([\s\S]*?)(?=\n\d\.|$)/gi;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const title = match[2].toLowerCase();
    const block = match[3];

    const lines = block
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.startsWith("-"))
      .map(l => l.replace(/^-+\s*/, "").trim());

    if (title.includes("force")) sections.forces = lines;
    if (title.includes("faiblesse")) sections.faiblesses = lines;
    if (title.includes("opportun")) sections.opportunites = lines;
    if (title.includes("menace")) sections.menaces = lines;
  }

  return sections;
}

// -------------------------------------
// 🎨 DESSIN
// -------------------------------------
function drawSwotImage(swotText) {
  const { forces, faiblesses, opportunites, menaces } = parseSwot(swotText);

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
    opportunites: "#e8f5e9",
    menaces: "#fffde7"
  };

  function drawBox(title, lines, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, boxWidth, boxHeight);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    ctx.fillStyle = "#000";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(title, x + 20, y + 20);

    ctx.font = "24px sans-serif";
    const lineHeight = 32;
    let yCursor = y + 80;
    const maxWidth = boxWidth - 40;

    for (const line of lines) {
      let current = "";
      for (const word of line.split(" ")) {
        const test = current ? current + " " + word : word;
        if (ctx.measureText(test).width > maxWidth) {
          ctx.fillText("• " + current, x + 20, yCursor);
          yCursor += lineHeight;
          current = word;
        } else {
          current = test;
        }
      }
      if (current) {
        ctx.fillText("• " + current, x + 20, yCursor);
        yCursor += lineHeight;
      }
    }
  }

  drawBox("Forces", forces, margin, margin, colors.forces);
  drawBox("Faiblesses", faiblesses, margin * 2 + boxWidth, margin, colors.faiblesses);
  drawBox("Opportunités", opportunites, margin, margin * 2 + boxHeight, colors.opportunites);
  drawBox("Menaces", menaces, margin * 2 + boxWidth, margin * 2 + boxHeight, colors.menaces);

  return canvas.toBuffer("image/png");
}

app.post("/render-swot", (req, res) => {
  try {
    const swotText = req.body.swotText;

    if (!swotText) {
      return res.status(400).json({ error: "swotText manquant" });
    }

    const png = drawSwotImage(swotText);
    return res.json({
      success: true,
      png_base64: png.toString("base64")
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(8080, () =>
  console.log("🚀 SWOT Renderer running on port 8080")
);
