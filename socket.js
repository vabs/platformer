const { Server } = require("socket.io");
const { isCollidingWithMap, isCollidingWithCoin } = require("./collison");
const {
  TILE_SIZE,
  GRAVITY,
  TICK_RATE,
  CONTROLS,
  PLAYER_SPEED,
  JUMP_SPEED,
  END_GAME_SCORE,
  PLAYER_STARTING_X,
  PLAYER_STARTING_Y,
} = require("./constants");
const randomName = require("random-name");
const { gameMap } = require("./map");

let io;
let coins = [];
let players = [];
let playerSocketMap = {};
let socketMap = {};
let controlsMap = {};
let canJump = {};
const ipMap = {};

const map = gameMap[1];

const collidingTiles = [];
for (let row = 0; row < map.length; row++) {
  for (let col = 0; col < map[row].length; col++) {
    if (map[row][col] === 1) {
      collidingTiles.push({
        y: row * TILE_SIZE,
        x: col * TILE_SIZE,
      });
    }
  }
}

function sendMap(socketConnection) {
  socketConnection.emit("map", map);
  // socketConnection.emit("map", { map, gameMap });
}

function connect(server) {
  io = new Server(server);
  io.on("connection", (socket) => {
    console.log("a user connected");
    const ipAddress =
      socket.handshake.headers["x-forwarded-for"] ??
      socket.handshake.headers["x-real-ip"] ??
      socket.client.conn.remoteAddress;

    // console.log("ip", ipAddress);
    // if (ipMap[ipAddress]) {
    // 	console.log("here??");
    // 	delete ipMap[ipAddress];
    // 	socket.disconnect();
    // 	return;
    // }

    ipMap[ipAddress] = (ipMap[ipAddress] ?? 0) + 1;

    sendMap(socket);
    // tick() resets the game once a score goes past END_GAME_SCORE
    socket.emit("settings", { winScore: END_GAME_SCORE + 1 });
    const player = {
      x: PLAYER_STARTING_X,
      y: PLAYER_STARTING_Y,
      vx: 0,
      vy: 0,
      score: 0,
      facingRight: false,
      name: randomName.first(),
      color: `#${Math.floor(Math.random() * (0xffffff + 1)).toString(16)}`,
      id: socket.id,
    };
    socketMap[socket.id] = socket;
    playerSocketMap[socket.id] = player;
    players.push(player);

    socket.on("disconnect", () => {
      console.log("a user disconnected");
      delete playerSocketMap[socket.id];
      delete socketMap[socket.id];
      delete controlsMap[socket.id];
      delete canJump[socket.id];
      ipMap[ipAddress]--;
      if (ipMap[ipAddress] <= 0) {
        delete ipMap[ipAddress];
      }
      players = players.filter((player) => player.id !== socket.id);
    });

    socket.on("controls", (controls) => {
      controlsMap[socket.id] = controls;
    });
  });
  return io;
}

const isColliding = (player) => {
  return isCollidingWithMap(player, collidingTiles);
};

const spawnCoins = () => {
  const row = Math.floor(Math.random() * map.length);
  const col = Math.floor(Math.random() * map[0].length);
  if (map[row][col] === 0) {
    coins.push({
      x: col * TILE_SIZE,
      y: row * TILE_SIZE,
    });
  }
};

const spawnSpecialCoins = () => {
  const randomX = Math.floor(Math.random() * map.length);
  const randomY = Math.floor(Math.random() * map[0].length);
  if (map[randomY][randomX] === 0) {
    console.log(randomX, randomY);
    coins.push({
      x: randomX * TILE_SIZE,
      y: randomY * TILE_SIZE,
    });
  }
};

const respawnPlayer = (player) => {
  player.x = PLAYER_STARTING_X;
  player.y = PLAYER_STARTING_Y;
  player.vx = 0;
  player.vy = 0;
  canJump[player.id] = false;
};

const resetGame = () => {
  for (const player of players) {
    player.score = 0;
    respawnPlayer(player);
  }
  coins = [];
};

const tick = (delta) => {
  for (let player of players) {
    const playerControls = controlsMap[player.id] ?? {};

    for (let i = coins.length - 1; i >= 0; i--) {
      if (coins[i] && isCollidingWithCoin(player, coins[i])) {
        player.score++;
        coins.splice(i, 1);
        socketMap[player.id].emit("playCoinSound");
        if (player.score > END_GAME_SCORE) {
          resetGame();
        }
      }
    }

    if (playerControls[CONTROLS.RIGHT]) {
      player.facingRight = true;
      player.x += PLAYER_SPEED;
      if (isColliding(player)) {
        player.x -= PLAYER_SPEED;
      }
    } else if (playerControls[CONTROLS.LEFT]) {
      player.facingRight = false;
      player.x -= PLAYER_SPEED;
      if (isColliding(player)) {
        player.x += PLAYER_SPEED;
      }
    }

    player.vy += GRAVITY * delta;
    player.y += player.vy;

    if (isColliding(player)) {
      if (player.vy > 0) {
        canJump[player.id] = true;
      }
      player.y -= player.vy;
      player.vy = 0;
    }

    if (playerControls[CONTROLS.JUMP] && canJump[player.id]) {
      player.vy += JUMP_SPEED;
      canJump[player.id] = false;
    }

    if (player.y > map.length * TILE_SIZE * 2) {
      respawnPlayer(player);
      player.score = 0;
    }
  }

  io.emit("players", players);
  io.emit("coins", coins);
};

function update() {
  let lastUpdate = Date.now();
  setInterval(() => {
    tick(Date.now() - lastUpdate);
    lastUpdate = Date.now();
  }, 1000 / TICK_RATE);
  setInterval(() => {
    spawnCoins();
  }, 3000);
}

module.exports = { connect, update };
