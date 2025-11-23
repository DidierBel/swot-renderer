// ======================
// BMC RENDERER — Version finale (Poppins + PNG icons + hanging indent)
// ======================

const { createCanvas, registerFont, loadImage } = require("canvas");
const path = require("path");

// ----------------------
// Charger la police POPPINS
// ----------------------
try {
  registerFont(path.join(__dirname, "fonts", "Poppins-Regular.ttf"), {
    family: "Poppins",
  });
  registerFont(path.join(__dirname, "fonts", "Poppins-Bold.ttf"), {
    family: "Poppins",
    weight: "bold",
  });
  console.log("Police Poppins chargée");
} catch (e) {
  console.warn("⚠️ Impossible de charger Poppins – fallback system.");
}

// ----------------------
// Charger les icônes PNG
// ----------------------
async function loadIcons() {
  const files = {
    partners: "key_partnerships.png",
    activities: "key_activities.png",
    value: "value_proposition.png",
    relations: "customer_relationships.png",
    segments: "customer_segments.png",
    resources: "key_resources.png",
    channels: "channels.png",
    costs: "cost_structure.png",
    revenues: "revenue_streams.png",
  };

  const icons = {};
  for (const key in files) {
    icons[key] = await loadImage(
      path.join(__dirname, "icons", files[key])
    );
  }
  return icons;
}

// ----------------------
// Helper: rectangle arrondi
// ----------------------
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ----------------------
// Bloc BMC avec Hanging Indent
// ----------------------
function drawBlock(ctx, icons, x, y, w, h, title, values, iconName) {
  ctx.save();

  // Cadre
  ctx.strokeStyle = "#CCCCCC";
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 18);
  ctx.stroke();

  // Titre
  ctx.fillStyle = "#000";
  ctx.font = 'bold 34px "Poppins"';
  ctx.fillText(title, x + 20, y + 20);

  // Icône (50x50)
  const icon = icons[iconName];
  if (icon) ctx.drawImage(icon, x + w - 70, y + 20, 48, 48);

  // Texte
  ctx.font = '26px "Poppins"';
  if (!Array.isArray(values)) values = [];

  const bullet = "• ";
  const bulletWidth = ctx.measureText(bullet).width;
  const textX = x + 20;
  const indentX = textX + bulletWidth + 10;
  let cursorY = y + 90;
  const maxWidth = w - 40;
  const lineHeight = 34;

  for (const item of values) {
    const words = item.split(" ");
    let curr = bullet;
    let currX = textX;

    for (const word of words) {
      const test = curr + word + " ";
      if (ctx.measureText(test).width > maxWidth) {
        // Affiche ligne
        ctx.fillText(curr, currX, cursorY);
        cursorY += lineHeight;

        // Nouvelle ligne indentée
        curr = word + " ";
        currX = indentX;
      } else {
        curr += word + " ";
      }
    }

    // Dernière ligne
    ctx.fillText(curr.trim(), currX, cursorY);
    cursorY += lineHeight;
  }

  ctx.restore();
}

// ----------------------
// Rendu principal
// ----------------------
async function drawBmcImage(bmc) {
  const icons = await loadIcons();

  const width = 3000;
  const height = 2000;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  const marginX = 80;
  const marginY = 80;
  const innerWidth = width - marginX * 2;
  const innerHeight = height - marginY * 2;

  const colWidth = innerWidth / 5;
  const blockHeight = innerHeight / 3;

  const topY = marginY;
  const midY = marginY + blockHeight;
  const bottomY = marginY + blockHeight * 2;

  const col0 = marginX;
  const col1 = marginX + colWidth;
  const col2 = marginX + 2 * colWidth;
  const col3 = marginX + 3 * colWidth;
  const col4 = marginX + 4 * colWidth;

  // Colonnes supérieures
  drawBlock(ctx, icons, col0, topY, colWidth, blockHeight * 2, "Partenaires clés", bmc.partenairesCles, "partners");
  drawBlock(ctx, icons, col1, topY, colWidth, blockHeight, "Activités clés", bmc.activitesCles, "activities");
  drawBlock(ctx, icons, col1, midY, colWidth, blockHeight, "Ressources clés", bmc.ressourcesCles, "resources");
  drawBlock(ctx, icons, col2, topY, colWidth, blockHeight * 2, "Proposition de valeur", bmc.propositionValeur, "value");
  drawBlock(ctx, icons, col3, topY, colWidth, blockHeight, "Relation client", bmc.relationClient, "relations");
  drawBlock(ctx, icons, col3, midY, colWidth, blockHeight, "Canaux", bmc.canaux, "channels");
  drawBlock(ctx, icons, col4, topY, colWidth, blockHeight * 2, "Segments de clientèle", bmc.segments, "segments");

  // Ligne du bas
  const bottomWidthHalf = colWidth * 2.5;

  drawBlock(ctx, icons, col0, bottomY, bottomWidthHalf, blockHeight, "Structure de coûts", bmc.structureCouts, "costs");
  drawBlock(ctx, icons, col0 + bottomWidthHalf, bottomY, bottomWidthHalf, blockHeight, "Sources de revenus", bmc.sourcesRevenus, "revenues");

  return canvas.toBuffer("image/png");
}

module.exports = { drawBmcImage };
