// ======================
// BMC RENDERER – async + icônes PNG + hanging indent
// ======================

const { createCanvas, registerFont, loadImage } = require("canvas");
const path = require("path");

// ======================
// Police Brush Script MT (comme ta SWOT)
// ======================
try {
  registerFont(path.join(__dirname, "fonts", "BrushScriptMT.ttf"), {
    family: "Brush Script MT",
  });
  console.log("Police Brush Script MT chargée (BMC)");
} catch (e) {
  console.warn("⚠️ Impossible de charger Brush Script MT (BMC) – fallback.");
}

// ======================
// Cache d'icônes PNG
// ======================
let iconsCache = null;
let iconsPromise = null;

async function loadIcons() {
  if (iconsCache) return iconsCache;
  if (!iconsPromise) {
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

    iconsPromise = (async () => {
      const result = {};
      for (const key of Object.keys(files)) {
        const filePath = path.join(__dirname, "icons", files[key]);
        result[key] = await loadImage(filePath);
      }
      iconsCache = result;
      return result;
    })();
  }
  return iconsPromise;
}

// ======================
// Helper : rectangle arrondi
// ======================
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

// ======================
// Dessin d’un bloc avec icône + hanging indent
// ======================
function drawBlock(ctx, icons, x, y, w, h, title, values, iconName) {
  ctx.save();

  // Cadre
  ctx.strokeStyle = "#CCCCCC";
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 20);
  ctx.stroke();

  // Titre
  ctx.fillStyle = "#000";
  ctx.font = 'bold 36px "Brush Script MT"';
  ctx.fillText(title, x + 20, y + 20);

  // Icône PNG (50x50 environ)
  const icon = icons[iconName];
  if (icon) {
    ctx.drawImage(icon, x + w - 70, y + 20, 48, 48);
  }

  // Texte
  ctx.font = '26px "Brush Script MT"';

  if (!Array.isArray(values)) values = [];

  const bullet = "• ";
  const bulletWidth = ctx.measureText(bullet).width;

  const bulletX = x + 20;
  const textX = bulletX + bulletWidth + 6; // hanging indent ici
  const maxWidth = w - 40;
  const lineHeight = 34;
  let cursorY = y + 90;

  for (const item of values) {
    // on commence la ligne avec la puce
    let current = "";
    let currentX = textX;

    // dessiner la puce une seule fois au début
    ctx.fillText(bullet, bulletX, cursorY);

    const words = item.split(" ");

    for (const word of words) {
      const test = current ? current + " " + word : word;
      if (ctx.measureText(test).width > maxWidth - (textX - bulletX)) {
        // écrire la ligne actuelle
        ctx.fillText(current, currentX, cursorY);
        cursorY += lineHeight;
        current = word;
        // lignes suivantes : sans puces, indentées
        currentX = textX;
      } else {
        current = test;
      }
    }

    if (current) {
      ctx.fillText(current, currentX, cursorY);
      cursorY += lineHeight;
    }
  }

  ctx.restore();
}

// ======================
// Fonction principale async
// ======================
async function drawBmcImage(bmc) {
  const icons = await loadIcons();

  const width = 3000;
  const height = 2000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fond
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const marginX = 80;
  const marginY = 80;
  const innerWidth = width - marginX * 2;
  const innerHeight = height - marginY * 2;

  const colWidth = innerWidth / 5;
  const blockHeight = innerHeight / 3;

  const topY = marginY;
  const midY = marginY + blockHeight;
  const bottomY = marginY + 2 * blockHeight;

  const col0 = marginX;
  const col1 = marginX + colWidth;
  const col2 = marginX + 2 * colWidth;
  const col3 = marginX + 3 * colWidth;
  const col4 = marginX + 4 * colWidth;

  // Blocs du haut
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

  // Retourne un Buffer PNG valide
  return canvas.toBuffer("image/png");
}

module.exports = { drawBmcImage };
