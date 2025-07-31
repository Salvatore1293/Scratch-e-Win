//  Seleziona elementi del DOM
const canvas = document.getElementById("scratch-canvas"); // Canvas dove avviene il gratta e vinci
const ctx = canvas.getContext("2d"); 
const bg = document.getElementById("background-image"); // Immagine di sfondo (premio o perdita)
const restartBtn = document.getElementById("restart-btn"); // Bottone per ricominciare
const winSound = new Audio("suono/success-1-6297.mp3"); // Suono che parte se si vince

//  Variabili di stato
let isDrawing = false; // Tiene traccia se si sta grattando
let prizeRevealed = false; // Indica se il premio è stato rivelato
const brushRadius = 20; // Raggio del pennello che gratta
const alwaysWin = false; // Forza la vincita se true
let won; // Determina l'esito della partita

//  Inizializza e ridimensiona canvas
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.globalCompositeOperation = "source-over"; // Modalità normale di disegno
  ctx.fillStyle = "#999"; // Colore grigio iniziale
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Riempie il canvas

  won = alwaysWin || Math.random() < 0.5; // 50% di possibilità di vincita
  bg.src = won ? "img/vincita.jpg" : "img/sconfitta.jpg"; 
  prizeRevealed = false;
  canvas.style.pointerEvents = "auto";

  disableRestartButton(); // Disattiva bottone finché non finisce la partita
}

//  Disegna un cerchio trasparente per grattare
function drawScratch(x, y) {
  ctx.globalCompositeOperation = "destination-out"; // Cancella pixel invece di disegnarli
  ctx.beginPath();
  ctx.arc(x, y, brushRadius, 0, 2 * Math.PI);
  ctx.fill();
}

// Verifica se abbastanza area è stata grattata
function checkReveal() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let cleared = 0;
  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] === 0) cleared++; // Conta i pixel trasparenti
  }

  const percent = (cleared / (canvas.width * canvas.height)) * 100; // Percentuale area grattata
  if (percent > 50 && !prizeRevealed) {
    prizeRevealed = true;
    revealPrize(); // Se più del 50% è grattato, mostra il premio
  }
}

// Mostra vincita o perdita
function revealPrize() {
  canvas.style.pointerEvents = "none"; // Blocca interazione
  if (won) winSound.play(); // Suona se hai vinto

  setTimeout(() => {
    alert(won ? "🎉 Hai vinto!" : "😞 Ritenta!"); // Mostra messaggio
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Pulisce il canvas
    enableRestartButton(); // Attiva il bottone per ricominciare
  }, 100);
}

// Ottieni coordinate del tocco o click
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

// 🖐️ Gestione del movimento durante il disegno
function handleMove(e) {
  if (!isDrawing) return;
  e.preventDefault(); // Evita scroll su mobile
  const { x, y } = getPos(e);
  drawScratch(x, y);
  checkReveal();
}

// 🖱️ Eventi per mouse
canvas.addEventListener("mousedown", () => (isDrawing = true));
canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mousemove", handleMove);

// 📱 Eventi per touch su dispositivi mobili
canvas.addEventListener("touchstart", () => (isDrawing = true));
canvas.addEventListener("touchend", () => (isDrawing = false));
canvas.addEventListener("touchmove", handleMove);

// 🔁 Bottone per ricominciare
restartBtn.addEventListener("click", () => {
  resizeCanvas();
});

// 🧩 Inizializzazione al caricamento e resize
window.addEventListener("load", () => {
  bg.complete ? resizeCanvas() : (bg.onload = resizeCanvas);
});
window.addEventListener("resize", resizeCanvas);

// ✅ Gestione bottone attivo/inattivo
function enableRestartButton() {
  restartBtn.classList.add("enabled");
  restartBtn.disabled = false;
}
function disableRestartButton() {
  restartBtn.classList.remove("enabled");
  restartBtn.disabled = true;
}

// ⛔ Evita che oggetti cadano sopra la scratch card
function isOverScratchCard(leftPos) {
  const cardRect = document
    .querySelector(".scratch-card")
    .getBoundingClientRect();
  return leftPos > cardRect.left && leftPos < cardRect.right;
}

// 🎁 Crea elementi animati (soldi o regali)
function createItem(classe, container, immagini) {
  let left = Math.random() * window.innerWidth;
  if (isOverScratchCard(left)) return; // Salta se sopra la card

  const item = document.createElement("div");
  item.className = classe;
  item.style.backgroundImage = `url(${
    immagini[Math.floor(Math.random() * immagini.length)]
  })`;
  item.style.left = left + "px";
  item.style.animationDuration = 2 + Math.random() * 3 + "s";
  document.querySelector(container).appendChild(item);
  setTimeout(() => item.remove(), 5000); // Rimuove dopo 5s
}

// ⏱️ Avvia le animazioni a intervalli
setInterval(() => createItem("item", ".falling-items", ["img/soldi.png"]), 500);
setInterval(
  () =>
    createItem("falling-item", ".falling-background", [
      "img/soldi.png",
      "img/regalo.png",
    ]),
  400
);
