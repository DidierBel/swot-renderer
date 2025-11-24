const express = require("express");
const bodyParser = require("body-parser");

// Import des 2 modules Renderer
const { drawSwotImage } = require("./swotRenderer");
const { drawBmcImage } = require("./bmcRenderer");

const app = express();
app.use(bodyParser.json({ limit: "20mb" }));

// ========================================================
// 🔵 ROUTE SWOT (synchrone – ne change pas)
// ========================================================
app.post("/render-swot", (req, res) => {
  try {
    const swotText = req.body.swotText;
    if (!swotText)
      return res.status(400).json({ error: "swotText manquant" });

    const png = drawSwotImage(swotText);
    const b64 = png.toString("base64");

    res.json({ success: true, png_base64: b64 });

  } catch (err) {
    console.error("Erreur SWOT:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 🟣 ROUTE BMC (⚠️ maintenant ASYNC)
// ========================================================
app.post("/render-bmc", async (req, res) => {
  try {
    const bmc = req.body.bmc;
    if (!bmc)
      return res.status(400).json({ error: "bmc manquant" });

    // drawBmcImage est ASYNCHRONE → on attend le Buffer PNG
    const png = await drawBmcImage(bmc);
    const b64 = png.toString("base64");

    res.json({ success: true, png_base64: b64 });

  } catch (err) {
    console.error("Erreur BMC:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log("🚀 Renderer (SWOT + BMC) ready on port", PORT)
);
