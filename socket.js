const { Server } = require("socket.io");
const { isCollidingWithMap } = require("./collison");
const {
	TILE_SIZE,
	GRAVITY,
	TICK_RATE,
	CONTROLS,
	PLAYER_SPEED,
} = require("./constants");

let io;
let players = [];
let playerSocketMap = {};
let controlsMap = {};

const map = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
	[0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

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
}

function connect(server) {
	io = new Server(server);
	io.on("connection", (socket) => {
		console.log("a user connected");
		sendMap(socket);
		const player = {
			x: 100,
			y: 100,
			vx: 0,
			vy: 0,
			id: socket.id,
		};
		playerSocketMap[socket.id] = player;
		players.push(player);

		socket.on("disconnect", () => {
			console.log("a user disconnected");
			const playerLeft = playerSocketMap[socket.id];
			delete playerSocketMap[socket.id];
			players = players.filter((player) => player.id !== socket.id);
			socket.emit("players");
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

const tick = (delta) => {
	for (let player of players) {
		const playerControls = controlsMap[player.id] ?? {};

		if (playerControls[CONTROLS.RIGHT]) {
			player.x += PLAYER_SPEED;
			if (isColliding(player)) {
				player.x -= PLAYER_SPEED;
			}
		} else if (playerControls[CONTROLS.LEFT]) {
			player.x -= PLAYER_SPEED;
			if (isColliding(player)) {
				player.x += PLAYER_SPEED;
			}
		}

		player.vy += GRAVITY * delta;
		player.y += player.vy;

		if (isColliding(player)) {
			player.y -= player.vy;
			player.vy = 0;
		}
	}

	io.emit("players", players);
};

function update() {
	let lastUpdate = Date.now();
	setInterval(() => {
		tick(Date.now() - lastUpdate);
		lastUpdate = Date.now();
	}, 1000 / TICK_RATE);
}

module.exports = { connect, update };
