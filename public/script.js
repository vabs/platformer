var socket = io();
let canvas = document.getElementById("canvas");
const height = window.innerHeight;
const width = window.innerWidth;
canvas.height = height;
canvas.width = width;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "red";
let lastRender = 0;
const PLAYER_SIZE = 15;
const TILE_SIZE = 32;

let map = [[]];
let players = [];

const controls = {
	down: false,
	up: false,
	left: false,
	right: false,
};

const keyMap = {
	w: "up",
	a: "left",
	s: "down",
	d: "right",
};

socket.on("map", (serverMap) => {
	map = serverMap;
	console.log("map", map);
});

socket.on("players", (serverPlayers) => {
	players = serverPlayers;
});

document.addEventListener("keydown", (e) => {
	controls[keyMap[e.key]] = true;
});

document.addEventListener("keyup", (e) => {
	controls[keyMap[e.key]] = false;
});

function update(delta) {
	socket.emit("controls", controls);
}

function draw() {
	ctx.clearRect(0, 0, width, height);

	ctx.fillStyle = "#000000";
	for (let row = 0; row < map.length; row++) {
		for (let col = 0; col < map[row].length; col++) {
			if (map[row][col] === 1) {
				ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}
	}

	for (let player of players) {
		ctx.fillStyle = "#00FF00";
		ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
	}
}

function loop(timestamp) {
	const delta = timestamp - lastRender;

	update(delta);
	draw();
	lastRender = timestamp;
	window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
