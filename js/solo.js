const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const box = 20;
const canvasSize = 400;

let snake = [{ x: 200, y: 200 }];
let direction = "RIGHT";

let food = randomFood();
let score = 0;

function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box
  };
}

function draw() {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#00ffcc" : "#00cc99";
    ctx.fillRect(part.x, part.y, box, box);
  });

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);
}

function update() {
  let head = { ...snake[0] };

  if (direction === "RIGHT") head.x += box;
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;

  if (head.x >= canvasSize) head.x = 0;
  if (head.x < 0) head.x = canvasSize - box;
  if (head.y >= canvasSize) head.y = 0;
  if (head.y < 0) head.y = canvasSize - box;

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = randomFood();
  } else {
    snake.pop();
  }

  snake.unshift(head);

  const scoreEl = document.getElementById("score");
  if (scoreEl) scoreEl.innerText = score;
}

function gameLoop() {
  update();
  draw();
}

setInterval(gameLoop, 120);

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});