// ✅ IMPORTS
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// ✅ SETUP
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

// ✅ GAME DATA
let players = {};
let food = { x: 200, y: 200 };

// 🧠 COLLISION FUNCTION
function isCollision(head, snake) {
  return snake.some(part => part.x === head.x && part.y === head.y);
}

// ✅ SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  players[socket.id] = {
    id: socket.id,
    snake: [{ x: 100, y: 100 }],
    direction: "RIGHT",
    color: "#" + Math.floor(Math.random()*16777215).toString(16),
    score: 0
  };

  socket.emit("init", { players, food });

  socket.on("move", (dir) => {
    if (players[socket.id]) {
      players[socket.id].direction = dir;
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
  });
});

// 🔁 GAME LOOP (FINAL)
setInterval(() => {

  for (let id in players) {
    let p = players[id];
    let head = { ...p.snake[0] };

    // 🎮 movement
    if (p.direction === "RIGHT") head.x += 10;
    if (p.direction === "LEFT") head.x -= 10;
    if (p.direction === "UP") head.y -= 10;
    if (p.direction === "DOWN") head.y += 10;

    // 🌍 wall wrap
    if (head.x > 400) head.x = 0;
    if (head.x < 0) head.x = 400;
    if (head.y > 400) head.y = 0;
    if (head.y < 0) head.y = 400;

    // 💥 SELF COLLISION
    if (isCollision(head, p.snake)) {
      delete players[id];
      continue;
    }

    // 💥 COLLISION WITH OTHER PLAYERS
    let died = false;
    for (let otherId in players) {
      if (otherId !== id) {
        if (isCollision(head, players[otherId].snake)) {
          delete players[id];
          died = true;
          break;
        }
      }
    }

    if (died || !players[id]) continue;

    // 🐍 move snake
    p.snake.unshift(head);

    // 🍎 FOOD
    if (head.x === food.x && head.y === food.y) {
      p.score++;
      food = {
        x: Math.floor(Math.random()*40)*10,
        y: Math.floor(Math.random()*40)*10
      };
    } else {
      p.snake.pop();
    }
  }

  // 🏆 WINNER SYSTEM
  const ids = Object.keys(players);

  if (ids.length === 1 && ids.length !== 0) {
    io.emit("winner", players[ids[0]]);
    players = {}; // reset game
  }

  // 🔄 SEND STATE
  io.emit("state", { players, food });

}, 120);

// ✅ START SERVER
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});