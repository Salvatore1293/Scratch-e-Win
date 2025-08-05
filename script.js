const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");
const backgroundImage = document.getElementById("backgroundImage");
const resetButton = document.getElementById("resetButton");
const resultMessage = document.getElementById
("resultMessage");
const WinSound = new Audio("suono/success-1-6297.mp3");
const LoseSound = new Audio("suono/fail.mp3");


let isDrawing = false;
let isPrizeRevealed = false;
let hasWon;
const alwaysWin = false; 
const brushSize = 20; // Size of the brush for scratching

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.globalCompositeOperation = "source-over"; //     Set to normal drawing mode
  ctx.fillStyle = "#999";
  ctx.fillRect(0, 0, canvas.width, canvas.height
  );

  hasWon = alwaysWin || Math.random() < 0.5; 
  backgroundImage.src = hasWon ? "img/vincita.jpg" : "img/sconfitta.jpg";
  isPrizeRevealed = false; // Reset the prize reveal state
  canvas.style.pointerEvents = "auto"; disableRestart();
  resultMessage.classList.remove("visible");
  resultMessage.classList.add("hidden");
}

function draw(x,y) {
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x,y, brushSize, 0, Math.PI * 2);
  ctx.fill();
}


function checkReveal() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let cleared = 0;

  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] === 0) cleared++;
  }
  const revealed = (cleared / (canvas.width * canvas.height)) * 100;

  if (revealed > 50 && !isPrizeRevealed) {
    isPrizeRevealed = true;
      revealPrize();
    }
  }

  
function revealPrize() {
    
  canvas.style.pointerEvents = "none";

  if (hasWon) { WinSound.play(); }
  else { LoseSound.play(); }
  resultMessage.innerHTML = hasWon ? '<i class="fas fa-gift"></i> Congratulazioni! Hai vinto!' : ' <i class="fas fa-times"></i> Ritenta!';

  resultMessage.classList.remove("hidden");
  resultMessage.classList.add("visible");
  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); enableRestart();
  }, 200);
}

function getPointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX || event.touches[0].clientX;
  const y = event.clientY || event.touches[0].clientY;
  return { x: x - rect.left, y: y - rect.top };
}

function onMove(event) {
  if (!isDrawing || isPrizeRevealed) return; // Prevent drawing if not in drawing mode or prize is revealed
  const { x, y } = getPointerPosition(event);
  draw(x, y);
  checkReveal();
} 


canvas.addEventListener("mousedown", () => 
  (isDrawing = true));

canvas.addEventListener("mouseup", () => 
  (isDrawing = false));

canvas.addEventListener("mousemove", onMove);

canvas.addEventListener("touchstart", (event) => (isDrawing = true));
canvas.addEventListener("touchend", () => (isDrawing = false));
canvas.addEventListener("touchmove", onMove);

resetButton.addEventListener("click", resizeCanvas);

window.addEventListener("resize", resizeCanvas);

window.addEventListener("load", () => { backgroundImage.complete ? resizeCanvas() : backgroundImage.onload = resizeCanvas; });

function enableRestart() {
  resetButton.classList.add("enabled");
  resetButton.disabled = false;
}

function disableRestart() {
  resetButton.classList.remove("enabled");
  resetButton.disabled = true;
}

