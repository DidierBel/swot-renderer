module.exports.drawBmcImage = function (bmc) {
  // Ici viendra le rendu du BMC
  // Pour le moment on renvoie un PNG vide

  const { createCanvas } = require("canvas");
  const canvas = createCanvas(2000, 2000);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 2000, 2000);

  ctx.fillStyle = "#000";
  ctx.font = "bold 60px sans-serif";
  ctx.fillText("BMC Renderer prêt 🚀", 200, 300);

  return canvas.toBuffer("image/png");
};
