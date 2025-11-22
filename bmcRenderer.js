const { createCanvas, registerFont } = require("canvas");
const path = require("path");

// Charger la police Brush Script MT
try {
  registerFont(path.join(__dirname, "fonts", "BrushScriptMT.ttf"), { family: "Brush Script MT" });
  console.log("Police Brush Script MT chargée pour BMC");
} catch (e) {
  console.warn("⚠️ Impossible de charger Brush Script MT pour le BMC.");
}


// ---------------------
// ICONES SIMPLIFIÉES
// ---------------------
function drawIcon(ctx, type, x, y) {

  ctx.strokeStyle = "#444";
  ctx.lineWidth = 3;

  ctx.beginPath();

  switch (type) {

    case "partenaires":
      ctx.rect(x, y, 30, 30);
      ctx.moveTo(x, y + 30);
      ctx.lineTo(x + 30, y);
      break;

    case "activites":
      ctx.moveTo(x, y);
      ctx.lineTo(x + 30, y + 30);
      ctx.moveTo(x + 30, y);
      ctx.lineTo(x, y + 30);
      break;

    case "ressources":
      ctx.arc(x + 15, y + 15, 15, 0, Math.PI * 2);
      break;

    case "proposition":
      ctx.rect(x, y + 10, 30, 20);
      ctx.moveTo(x, y + 10);
      ctx.lineTo(x + 30, y + 30);
      break;

    case "relation":
      ctx.moveTo(x, y + 15);
      ctx.lineTo(x + 30, y + 15);
      ctx.moveTo(x + 15, y);
      ctx.lineTo(x + 15, y + 30);
      break;

    case "canaux":
      ctx.moveTo(x, y + 30);
      ctx.lineTo(x + 30, y);
      ctx.lineTo(x + 15, y + 20);
      ctx.lineTo(x, y + 30);
      break;

    case "segments":
      ctx.rect(x, y, 30, 30);
      ctx.moveTo(x + 15, y);
      ctx.lineTo(x + 15, y + 30);
      break;

    case "couts":
      ctx.arc(x + 15, y + 15, 12, 0, Math.PI * 2);
      ctx.moveTo(x + 8, y + 15);
      ctx.lineTo(x + 22, y + 15);
      break;

    case "revenus":
      ctx.moveTo(x + 15, y);
      ctx.lineTo(x + 15, y + 30);
      ctx.lineTo(x + 5, y + 20);
      ctx.moveTo(x + 15, y + 30);
      ctx.lineTo(x + 25, y + 20);
      break;
  }

  ctx.stroke();
}


// ---------------------
// ECRITURE WRAP
// ---------------------
function wrapText(ctx, textArray, x, y, maxWidth, lineHeight) {
  for (const line of textArray) {
    const words = line.split(" ");
    let current = "";

    for (const w of words) {
      const testLine = current ? current + " " + w : w;
      if (ctx.measureText(testLine).width > maxWidth) {
        ctx.fillText(current, x, y);
        y += lineHeight;
        current = w;
      } else {
        current = testLine;
      }
    }

    ctx.fillText(current, x, y);
    y += lineHeight;
  }
}



// ---------------------
// BMC RENDERER PRINCIPAL
// ---------------------
function drawBmcImage(bmc) {

  const width = 2400;
  const height = 1600;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 3;

  const margin = 40;
  const colWidth = (width - margin * 4) / 3;
  const rowHeight = (height - margin * 4) / 3;

  // FUNCTIONS FOR CELL
  function drawCell(title, icon, textArray, col, row, colspan = 1, rowspan = 1) {

    const x = margin + col * (colWidth + margin);
    const y = margin + row * (rowHeight + margin);

    const w = colWidth * colspan + margin * (colspan - 1);
    const h = rowHeight * rowspan + margin * (rowspan - 1);

    // BOX
    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // TITLE
    ctx.font = "bold 42px 'Brush Script MT'";
    ctx.fillStyle = "#000";
    ctx.fillText(title, x + 20, y + 20);

    // ICON
    drawIcon(ctx, icon, x + w - 60, y + 20);

    // CONTENT
    ctx.font = "32px 'Brush Script MT'";
    wrapText(ctx, textArray, x + 35, y + 100, w - 70, 40);
  }

  // GRID LAYOUT
  drawCell("Partenaires Clés", "partenaires", bmc.partenairesCles, 0, 0, 1, 2);
  drawCell("Activités Clés", "activites", bmc.activitesCles, 1, 0);
  drawCell("Ressources Clés", "ressources", bmc.ressourcesCles, 1, 1);
  drawCell("Proposition de Valeur", "proposition", bmc.propositionValeur, 2, 0, 1, 2);

  drawCell("Relation Client", "relation", bmc.relationClient, 3, 0);
  drawCell("Canaux", "canaux", bmc.canaux, 3, 1);

  drawCell("Segments Clientèle", "segments", bmc.segments, 4, 0, 1, 2);

  drawCell("Structure de Coûts", "couts", bmc.structureCouts, 0, 2, 2, 1);
  drawCell("Sources de Revenus", "revenus", bmc.sourcesRevenus, 2, 2, 2, 1);

  return canvas.toBuffer("image/png");
}


module.exports = { drawBmcImage };
