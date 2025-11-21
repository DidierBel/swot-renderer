const express = require("express");
const bodyParser = require("body-parser");
const { createCanvas } = require("canvas");

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

// ====== PARSER MINIMAL (on ne le corrige pas tant que le log n'est pas récupéré) ======
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

    // Test simple — on verra après
    if (/1\./.test(trimmed) && /force/i.test(trimmed)) current = "forces";
    if (/2\./.test(trimmed) && /faibless/i.test(trimmed)) current = "faiblesses";
    if (/3\./.test(trimmed) && /opportun/i.test(trimmed)) current = "opportunites";
    if (/4\./.test(trimmed) && /menace/i.test(trimmed)) current = "menaces";

    if (trimmed.startsWith("-") && current) {
      sections[current].push(trimmed.replace(/^-\s*/, ""));
    }
  }

  return sections;
}

// ====== LOG ULTRA DÉTAILLÉ (clé du debugging) ======
function logReceived(swotText) {
  console.log("===========================================");
  console.log("=== TEXTE REÇU BRUT (affichage direct) ===");
  console.log("===========================================");
  console.log(swotText);

  console.log("\n===========================================");
  console.log("=== CODEPOINTS UNICODE (caractère par caractère) ===");
  console.log("===========================================\n");

  for (let i = 0; i < swotText.length; i++) {
    const char = swotText[i];
    const cp = swotText.codePointAt(i).toString(16).padStart(4, "0");

    // On affiche caractères invisibles lisiblement
    let display = char;
    if (char === " ") display = "[SPACE]";
    if (char === "\t") display = "[TAB]";
    if (char === "\n") display = "[LF]";
    if (char === "\r") display = "[CR]";
    if (char.trim() === "") display = `[INVISIBLE:${cp}]`;

    console.log(`${i}: '${display}' → U+${cp}`);
  }

  console.log("\n=== FIN DU LOG UNICODE ===\n");
}

// ====== RENDU PNG INCHANGÉ ======
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

// ====== ROUTE DEBUG (affiche EXACTEMENT ce que tu envoies) ======
app.post("/test-parsing", (req, res) => {
  const swotText = req.body.swotText || "";

  // LOG DÉTAILLÉ
  logReceived(swotText);

  const sections = parseSwot(swotText);
  res.json({ success: true, ...sections });
});

// ====== ROUTE PRINCIPALE ======
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
