const socket = io();
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

const box = 10;

let players = {};
let food = { x: 0, y: 0 };

/* STATE */
socket.on("state", (data) => {
  players = data.players || {};
  food = data.food || food;
  draw();
});

/* DRAW */
function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // players
  for (let id in players) {
    let p = players[id];
    if (!p.alive) continue;

    p.snake.forEach((part, i) => {
      ctx.fillStyle = i === 0 ? "#00ffcc" : p.color;
      ctx.fillRect(part.x, part.y, box, box);
    });
  }
}

/* CONTROLS */
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") socket.emit("move", "UP");
  if (e.key === "ArrowDown") socket.emit("move", "DOWN");
  if (e.key === "ArrowLeft") socket.emit("move", "LEFT");
  if (e.key === "ArrowRight") socket.emit("move", "RIGHT");
});

/* 💥 MESSAGE DISPLAY */
socket.on("message", (msg) => {
  showMessage(msg);
});

function showMessage(text) {
  const div = document.createElement("div");

  div.innerText = text;
  div.style.position = "fixed";
  div.style.top = "20px";
  div.style.left = "50%";
  div.style.transform = "translateX(-50%)";
  div.style.background = "#000";
  div.style.color = "#00ffcc";
  div.style.padding = "10px 20px";
  div.style.borderRadius = "10px";
  div.style.zIndex = "9999";

  document.body.appendChild(div);

  setTimeout(() => div.remove(), 2000);
}

/* 🏆 WINNER */
socket.on("winner", (player) => {
  showWinner(player);
});

function showWinner(player) {
  if (document.getElementById("winner")) return;

  const div = document.createElement("div");
  div.id = "winner";

  div.innerHTML = `
  <div style="
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.9);
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    color:white;
    z-index:9999;
  ">
    <h1 style="color:${player.color}">🏆 WINNER</h1>
    <p>Player: ${player.id.slice(0,4)}</p>
    <p>Score: ${player.score}</p>

    <button onclick="location.reload()" style="
      margin-top:20px;
      padding:12px 25px;
      border:none;
      border-radius:10px;
      background:#00ffcc;
      cursor:pointer;
    ">Restart</button>
  </div>
  `;

  document.body.appendChild(div);
}