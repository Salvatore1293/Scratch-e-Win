const canvas = document.getElementById("scratch-canvas");
const ctx = canvas.getContext("2d");
const bgImage = document.getElementById("background-image");
const restartBtn = document.getElementById("restart-btn");
const resultMsg = document.getElementById("result-message");
const winSound = new Audio("suono/success-1-6297.mp3");

let isDrawing = false;
let isPrizeRevealed = false;
let hasWon;
const brushSize = 20;
const alwaysWin = false;

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#999";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  hasWon = alwaysWin || Math.random() < 0.5;
  bgImage.src = hasWon ? "img/vincita.jpg" : "img/sconfitta.jpg";
  isPrizeRevealed = false;

  canvas.style.pointerEvents = "auto";
  disableRestart();
  resultMsg.classList.add("hidden");
}

function draw(x, y) {
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, brushSize, 0, Math.PI * 2);
  ctx.fill();
}

function checkRevealProgress() {
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let cleared = 0;

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 0) cleared++;
  }

  const revealed = (cleared / (canvas.width * canvas.height)) * 100;

  if (revealed > 50 && !isPrizeRevealed) {
    isPrizeRevealed = true;
    revealPrize();
  }
}

function revealPrize() {
  canvas.style.pointerEvents = "none";

  if (hasWon) winSound.play();

  resultMsg.innerHTML = hasWon
    ? '<i class="fas fa-gift"></i> Hai vinto!'
    : '<i class="fas fa-times-circle"></i> Ritenta!';
  resultMsg.classList.remove("hidden");

  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    enableRestart();
  }, 100);
}

function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX || e.touches[0].clientX;
  const y = e.clientY || e.touches[0].clientY;
  return { x: x - rect.left, y: y - rect.top };
}

function onMove(e) {
  if (!isDrawing) return;
  e.preventDefault();
  const { x, y } = getPointerPos(e);
  draw(x, y);
  checkRevealProgress();
}

// Interazioni
canvas.addEventListener("mousedown", () => (isDrawing = true));
canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mousemove", onMove);

canvas.addEventListener("touchstart", () => (isDrawing = true));
canvas.addEventListener("touchend", () => (isDrawing = false));
canvas.addEventListener("touchmove", onMove);

restartBtn.addEventListener("click", resizeCanvas);

window.addEventListener("load", () => {
  bgImage.complete ? resizeCanvas() : (bgImage.onload = resizeCanvas);
});
window.addEventListener("resize", resizeCanvas);

function enableRestart() {
  restartBtn.classList.add("enabled");
  restartBtn.disabled = false;
}

function disableRestart() {
  restartBtn.classList.remove("enabled");
  restartBtn.disabled = true;
}

// Effetti decorativi (soldi e regali)
function isOutsideScratchCard(x) {
  const rect = document.querySelector(".scratch-card").getBoundingClientRect();
  return x < rect.left || x > rect.right;
}

function createFallingItem(cls, container, images) {
  const x = Math.random() * window.innerWidth;
  if (!isOutsideScratchCard(x)) return;

  const el = document.createElement("div");
  el.className = cls;
  el.style.left = `${x}px`;
  el.style.backgroundImage = `url(${
    images[Math.floor(Math.random() * images.length)]
  })`;
  el.style.animationDuration = `${2 + Math.random() * 3}s`;

  document.querySelector(container).appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

setInterval(
  () => createFallingItem("item", ".falling-items", ["img/soldi.png"]),
  500
);
setInterval(
  () =>
    createFallingItem("falling-item", ".falling-background", [
      "img/soldi.png",
      "img/regalo.png",
    ]),
  400
);
