const express = require("express");
const bodyParser = require("body-parser");
const { createCanvas } = require("canvas");

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

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
    opportunites: "#e8f5e9",
    menaces: "#fffde7"
  };

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

  const raw = swotText || "";

  function extractSection(labelRegex) {
    const regex = new RegExp(labelRegex + "[\\s\\S]*?(?=\\n\\n[1-4]\\.\\s|$)", "i");
    const match = raw.match(regex);
    if (!match) return [];

    const block = match[0];

    return block
      .split("\n")
      .filter((l) => l.trim().startsWith("-"))
      .map((l) => l.replace(/^-\s*/, "").trim());
  }

  const forces = extractSection("1\\.\\s*Forces");
  const faiblesses = extractSection("2\\.\\s*Faiblesses");
  const opportunites = extractSection("3\\.\\s*Opportunités");
  const menaces = extractSection("4\\.\\s*Menaces");

  drawBox("Forces", forces, margin, margin, colors.forces);
  drawBox(
    "Faiblesses",
    faiblesses,
    margin * 2 + boxWidth,
    margin,
    colors.faiblesses
  );
  drawBox(
    "Opportunités",
    opportunites,
    margin,
    margin * 2 + boxHeight,
    colors.opportunites
  );
  drawBox(
    "Menaces",
    menaces,
    margin * 2 + boxWidth,
    margin * 2 + boxHeight,
    colors.menaces
  );

  return canvas.toBuffer("image/png");
}

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
