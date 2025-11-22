const express = require("express");
const bodyParser = require("body-parser");
const { createCanvas } = require("canvas");

const app = express();
app.use(bodyParser.json({ limit: "20mb" }));

// ========================================================
// =========== PARSER SWOT ULTRA-TOLÉRANT =================
// ========================================================
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

    // TITRES avec tolérance maximale
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

    // PUCE
    if (/^[-•]/.test(trimmed) && current) {
      sections[current].push(trimmed.replace(/^[-•]\s*/, ""));
    }
  }

  return sections;
}

// ========================================================
// =============== LOG DU TEXTE REÇU ======================
// ========================================================
function logReceived(swotText) {
  console.log("===========================================");
  console.log("=== TEXTE REÇU BRUT =======================");
  console.log("===========================================");
  console.log(swotText);

  console.log("\n===========================================");
  console.log("=== LISTE DES CODEPOINTS UNICODE ==========");
  console.log("===========================================");
  for (let i = 0; i < (swotText || "").length; i++) {
    const char = swotText[i];
    const cp = swotText.codePointAt(i).toString(16).padStart(4, "0");

    let display = char;
    if (char === " ") display = "[SPACE]";
    else if (char === "\n") display = "[LF]";
    else if (char === "\r") display = "[CR]";
    else if (char.trim() === "") display = `[INVISIBLE:${cp}]`;

    console.log(`${i}: '${display}' → U+${cp}`);
  }
  console.log("===========================================");
}

// ========================================================
// =============== RENDU SWOT EN PNG =======================
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

  const colors = {
    forces: "#e3f2fd",
    faiblesses: "#ffebee",
    opportunites: "#c8e6c9",
    menaces: "#fff9c4"
  };

  const { forces, faiblesses, opportunites, menaces } = parseSwot(swotText);

  function drawBox(title, textLines, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, boxWidth, boxHeight);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(title, x + 20, y + 20);

    ctx.font = "24px sans-serif";
    const lineHeight = 30;
    let yPos = y + 70;
    const maxWidth = boxWidth - 40;

    function wrap(text) {
      const words = text.split(" ");
      let line = "";

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth) {
          ctx.fillText(line, x + 20, yPos);
          yPos += lineHeight;
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        ctx.fillText(line, x + 20, yPos);
        yPos += lineHeight;
      }
    }

    for (const t of textLines) wrap("• " + t);
  }

  drawBox("Forces", forces, margin, margin, colors.forces);
  drawBox("Faiblesses", faiblesses, margin * 2 + boxWidth, margin, colors.faiblesses);
  drawBox("Opportunités", opportunites, margin, margin * 2 + boxHeight, colors.opportunites);
  drawBox("Menaces", menaces, margin * 2 + boxWidth, margin * 2 + boxHeight, colors.menaces);

  return canvas.toBuffer("image/png");
}

// ========================================================
// ===================== DEBUG MODE =======================
// ========================================================
app.post("/test-parsing", (req, res) => {
  const swotText = req.body.swotText || "";

  logReceived(swotText);

  const parsed = parseSwot(swotText);

  res.json({
    success: true,
    ...parsed
  });
});

// ========================================================
// ================== ROUTE PRINCIPALE ====================
// ========================================================
app.post("/render-swot", (req, res) => {
  try {
    const swotText = req.body.swotText;

    console.log("=========== /render-swot : TEXTE REÇU ===========");
    logReceived(swotText);
    console.log("=========== FIN TEXTE REÇU =======================");

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
