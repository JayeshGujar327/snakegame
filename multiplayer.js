const socket = io();
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const box = 20;

let players = {};
let food = { x: 200, y: 200 };

/* INIT */
socket.on("init", (data) => {
  players = data.players;
  food = data.food;
});

/* STATE UPDATE */
socket.on("state", (data) => {
  players = data.players;
  food = data.food;
  draw();
});

/* DRAW */
function draw() {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // players
  for (let id in players) {
    let p = players[id];

    ctx.fillStyle = p.color;

    p.snake.forEach((part, index) => {
      ctx.fillRect(part.x, part.y, box, box);
    });
  }

  updatePlayerList();
}

/* PLAYER LIST UI */
function updatePlayerList() {
  const el = document.getElementById("players");
  el.innerHTML = "";

  for (let id in players) {
    let p = players[id];

    let div = document.createElement("div");
    div.innerText = `Score: ${p.score}`;
    el.appendChild(div);
  }
}

/* CONTROLS */
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") socket.emit("move", "UP");
  if (e.key === "ArrowDown") socket.emit("move", "DOWN");
  if (e.key === "ArrowLeft") socket.emit("move", "LEFT");
  if (e.key === "ArrowRight") socket.emit("move", "RIGHT");
});
// 🏆 WINNER POPUP
socket.on("winner", (player) => {
  showWinner(player);
});

function showWinner(player) {
  const div = document.createElement("div");

  div.innerHTML = `
    <div style="
      position:fixed;
      top:0;
      left:0;
      width:100%;
      height:100%;
      background:rgba(0,0,0,0.8);
      display:flex;
      justify-content:center;
      align-items:center;
      flex-direction:column;
      color:white;
      font-size:30px;
      z-index:999;
    ">
      <h1>🏆 WINNER</h1>
      <p>Score: ${player.score}</p>
      <button onclick="location.reload()" style="
        padding:15px;
        border:none;
        border-radius:10px;
        background:#00ffcc;
        cursor:pointer;
      ">Restart Game</button>
    </div>
  `;

  document.body.appendChild(div);
}