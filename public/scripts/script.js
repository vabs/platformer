import { drawPlayer } from "./player.js";
import { renderLeaderboard, setWinScore } from "./leaderboard.js";

// import { io } from "socket.io-client";

var socket = io();
let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let lastRender = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

import {
  TILE_SIZE,
  SPECIAL_COIN_SIZE,
  COIN_SIZE,
  COIN_IMG_SIZE,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
} from "./constants.js";
import { drawBackground, drawMap } from "./map.js";

let rightImage = new Image();
rightImage.src = "../images/playerR.png";
let leftImage = new Image();
leftImage.src = "../images/playerL.png";
let coinImg = new Image();
coinImg.src = "../images/coin.png";

const coinAudio = new Audio("coin.mp3");
coinAudio.volume = 0.3;

const specialCoinAudio = new Audio("special.mp3");
specialCoinAudio.volume = 0.3;

let map = [[]];
let players = [];
let coins = [];
let projectiles = [];
let specialStar = {};

const controls = {
  down: false,
  up: false,
  left: false,
  right: false,
  jump: false,
};

const keyMap = {
  ArrowUp: "up",
  w: "up",
  ArrowLeft: "left",
  a: "left",
  ArrowDown: "down",
  s: "down",
  ArrowRight: "right",
  d: "right",
  " ": "jump",
};

socket.on("map", (serverMap) => {
  map = serverMap;
  // console.log("map", map);
});

// const mapImage = new Image();
// socket.on("map", ({ map: serverMap, gameMap: serverGameMap }) => {
// 	map = serverMap;
// 	gameMap = serverGameMap;
// 	console.log(map);
// 	mapImage.src = gameMap.tileset.image;
// 	console.log(gameMap);
// });

socket.on("settings", (settings) => {
  setWinScore(settings.winScore);
});

socket.on("players", (serverPlayers) => {
  players = serverPlayers;
  renderLeaderboard(players, socket.id);
});

socket.on("coins", (serverCoins) => {
  coins = serverCoins;
});

socket.on("specialStar", (serverSpecialStar) => {
  console.log("special star", serverSpecialStar);
  specialStar = serverSpecialStar;
});

socket.on("playCoinSound", () => {
  coinAudio.currentTime = 0;
  coinAudio.play();
});

socket.on("playSpecialCoinSound", () => {
  specialCoinAudio.currentTime = 0;
  specialCoinAudio.play();
});

document.addEventListener("keydown", (e) => {
  e.preventDefault();
  controls[keyMap[e.key]] = true;
});

document.addEventListener("keyup", (e) => {
  controls[keyMap[e.key]] = false;
});

function update(delta) {
  socket.emit("controls", controls);
}

function getTileImageLocation(id) {
  if (!gameMap.tileset) return { x: 0, y: 0 };
  const cols = gameMap.tileset.width / TILE_SIZE;
  const rows = gameMap.tileset.height / TILE_SIZE;
  const x = ((id - 1) % cols) * TILE_SIZE;
  const y = parseInt((id - 1) / cols) * TILE_SIZE;
  return {
    x,
    y,
  };
}

function strokeStar(x, y, r, n, inset) {
  ctx.save();
  ctx.beginPath();
  ctx.translate(x, y);
  ctx.moveTo(0, 0 - r);
  for (var i = 0; i < n; i++) {
    ctx.rotate(Math.PI / n);
    ctx.lineTo(0, 0 - r * inset);
    ctx.rotate(Math.PI / n);
    ctx.lineTo(0, 0 - r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const currentPlayer = players.find((player) => player.id === socket.id);
  let cx = 0;
  let cy = 0;
  if (currentPlayer) {
    cx = currentPlayer.x + PLAYER_WIDTH / 2 - canvas.width / 2;
    cy = currentPlayer.y + PLAYER_HEIGHT / 2 - canvas.height / 2;
  }

  drawBackground(ctx, { cx, cy });

  drawMap(ctx, map, { cx, cy });

  for (let coin of coins) {
    drawCoin(ctx, coin, { cx, cy });
  }

  if (specialStar.x && specialStar.y) {
    console.log("special start", specialStar);
    ctx.fillStyle = "#07cff2";
    strokeStar(specialStar.x - cx, specialStar.y - cy, 8, 5, 4);
  }

  for (let player of players) {
    if (player.id !== socket.id) {
      drawPlayer(ctx, player, { cx, cy })(leftImage, rightImage);
    }
  }

  // draw current player last so it stays on top of others
  if (currentPlayer) {
    drawPlayer(ctx, currentPlayer, { cx, cy }, true)(leftImage, rightImage);
  }
}

function drawCoin(ctx, coin, camera) {
  ctx.drawImage(
    coinImg,
    0,
    0,
    COIN_IMG_SIZE,
    COIN_IMG_SIZE,
    coin.x - camera.cx,
    coin.y - camera.cy,
    COIN_SIZE,
    COIN_SIZE
  );
}

function loop(timestamp) {
  const delta = timestamp - lastRender;

  update(delta);
  draw();
  lastRender = timestamp;
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
