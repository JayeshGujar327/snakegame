const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let players = {};
let food = randomFood();
let gameStarted = false;

// 🍎 FOOD
function randomFood() {
  return {
    x: Math.floor(Math.random() * 40) * 10,
    y: Math.floor(Math.random() * 40) * 10
  };
}

// 🧠 COLLISION CHECK
function isCollision(head, snake) {
  return snake.some(p => p.x === head.x && p.y === head.y);
}

// ✅ CONNECTION
io.on("connection", (socket) => {
  console.log("Player:", socket.id);

  players[socket.id] = {
    id: socket.id,
    snake: [{ x: Math.floor(Math.random()*300), y: Math.floor(Math.random()*300) }],
    direction: "RIGHT",
    color: "#" + Math.floor(Math.random()*16777215).toString(16),
    score: 0,
    alive: true
  };

  io.emit("state", { players, food });

  socket.on("move", (dir) => {
    let p = players[socket.id];
    if (!p || !p.alive) return;

    if (dir === "UP" && p.direction !== "DOWN") p.direction = dir;
    if (dir === "DOWN" && p.direction !== "UP") p.direction = dir;
    if (dir === "LEFT" && p.direction !== "RIGHT") p.direction = dir;
    if (dir === "RIGHT" && p.direction !== "LEFT") p.direction = dir;
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });
});

/* 🎮 GAME LOOP */
setInterval(() => {
  let ids = Object.keys(players);

  if (ids.length < 2) {
    gameStarted = false;
    io.emit("state", { players, food });
    return;
  }

  gameStarted = true;

  for (let id of ids) {
    let p = players[id];
    if (!p || !p.alive) continue;

    let head = { ...p.snake[0] };

    // movement
    if (p.direction === "RIGHT") head.x += 10;
    if (p.direction === "LEFT") head.x -= 10;
    if (p.direction === "UP") head.y -= 10;
    if (p.direction === "DOWN") head.y += 10;

    // wrap
    if (head.x >= 400) head.x = 0;
    if (head.x < 0) head.x = 390;
    if (head.y >= 400) head.y = 0;
    if (head.y < 0) head.y = 390;

    // ❌ SELF COLLISION
    if (isCollision(head, p.snake)) {
      p.alive = false;
      io.emit("message", `💥 Player ${id.slice(0,4)} hit itself!`);
      continue;
    }

    // ❌ COLLISION WITH OTHER PLAYERS
    for (let otherId in players) {
      if (otherId !== id) {
        if (isCollision(head, players[otherId].snake)) {
          p.alive = false;
          io.emit("message", `⚔️ Player ${id.slice(0,4)} crashed into ${otherId.slice(0,4)}!`);
        }
      }
    }

    if (!p.alive) continue;

    p.snake.unshift(head);

    // 🍎 FOOD
    if (head.x === food.x && head.y === food.y) {
      p.score++;
      food = randomFood();
    } else {
      p.snake.pop();
    }
  }

  let alivePlayers = Object.values(players).filter(p => p.alive);

  // 🏆 WINNER
  if (gameStarted && alivePlayers.length === 1) {
    const winner = alivePlayers[0];

    io.emit("winner", {
      id: winner.id,
      score: winner.score,
      color: winner.color
    });

    // reset after delay
    setTimeout(() => {
      players = {};
      food = randomFood();
      gameStarted = false;
    }, 3000);

    return;
  }

  io.emit("state", { players, food });

}, 120);

server.listen(3000, () => {
  console.log("Server running http://localhost:3000");
});