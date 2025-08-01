const canvas = document.getElementById("scratch-canvas");
const ctx = canvas.getContext("2d");
const bg = document.getElementById("background-image");
const restartBtn = document.getElementById("restart-btn");
const resultMessage = document.getElementById("result-message");
const winSound = new Audio("suono/success-1-6297.mp3");

let isDrawing = false;
let prizeRevealed = false;
const brushRadius = 20;
const alwaysWin = false;
let won;

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#999";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  won = alwaysWin || Math.random() < 0.5;
  bg.src = won ? "img/vincita.jpg" : "img/sconfitta.jpg";
  prizeRevealed = false;
  canvas.style.pointerEvents = "auto";

  disableRestartButton();
  resultMessage.classList.add("hidden"); // Nasconde il messaggio
}

function drawScratch(x, y) {
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, brushRadius, 0, 2 * Math.PI);
  ctx.fill();
}

function checkReveal() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let cleared = 0;
  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] === 0) cleared++;
  }

  const percent = (cleared / (canvas.width * canvas.height)) * 100;
  if (percent > 50 && !prizeRevealed) {
    prizeRevealed = true;
    revealPrize();
  }
}

function revealPrize() {
  canvas.style.pointerEvents = "none";
  if (won) winSound.play();

  resultMessage.textContent = won ? "🎉 Hai vinto!" : "😞 Ritenta!";
  resultMessage.classList.remove("hidden");

  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    enableRestartButton();
  }, 100);
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function handleMove(e) {
  if (!isDrawing) return;
  e.preventDefault();
  const { x, y } = getPos(e);
  drawScratch(x, y);
  checkReveal();
}

canvas.addEventListener("mousedown", () => (isDrawing = true));
canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mousemove", handleMove);

canvas.addEventListener("touchstart", () => (isDrawing = true));
canvas.addEventListener("touchend", () => (isDrawing = false));
canvas.addEventListener("touchmove", handleMove);

restartBtn.addEventListener("click", () => {
  resizeCanvas();
});

window.addEventListener("load", () => {
  bg.complete ? resizeCanvas() : (bg.onload = resizeCanvas);
});
window.addEventListener("resize", resizeCanvas);

function enableRestartButton() {
  restartBtn.classList.add("enabled");
  restartBtn.disabled = false;
}
function disableRestartButton() {
  restartBtn.classList.remove("enabled");
  restartBtn.disabled = true;
}

function isOverScratchCard(leftPos) {
  const cardRect = document
    .querySelector(".scratch-card")
    .getBoundingClientRect();
  return leftPos > cardRect.left && leftPos < cardRect.right;
}

function createItem(classe, container, immagini) {
  let left = Math.random() * window.innerWidth;
  if (isOverScratchCard(left)) return;

  const item = document.createElement("div");
  item.className = classe;
  item.style.backgroundImage = `url(${
    immagini[Math.floor(Math.random() * immagini.length)]
  })`;
  item.style.left = left + "px";
  item.style.animationDuration = 2 + Math.random() * 3 + "s";
  document.querySelector(container).appendChild(item);
  setTimeout(() => item.remove(), 5000);
}

setInterval(() => createItem("item", ".falling-items", ["img/soldi.png"]), 500);
setInterval(
  () =>
    createItem("falling-item", ".falling-background", [
      "img/soldi.png",
      "img/regalo.png",
    ]),
  400
);
