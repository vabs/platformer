var socket = io();
let canvas = document.getElementById("canvas");
const leaderBoardEl = document.getElementById("leaderboard");
const height = window.innerHeight;
const width = window.innerWidth;
canvas.height = height;
canvas.width = width;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "red";
let lastRender = 0;
const PLAYER_SIZE = 15;
const TILE_SIZE = 32;
const COIN_SIZE = 6;

const coinAudio = new Audio("coin.mp3");
coinAudio.volume = 0.3;

let map = [[]];
let players = [];
let coins = [];

function drawLeaderboard() {
	leaderBoardEl.innerHTML = "";
	const sortedScores = [...players].sort((p1, p2) => p2.score - p1.score);
	for (const player of sortedScores) {
		const scoreEl = document.createElement("div");
		scoreEl.innerText = `${player.name} -- ${player.score}`;
		leaderBoardEl.append(scoreEl);
	}
}

setInterval(() => {
	drawLeaderboard();
}, 2000);
drawLeaderboard();

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
	console.log("map", map);
});

socket.on("players", (serverPlayers) => {
	players = serverPlayers;
});

socket.on("coins", (serverCoins) => {
	coins = serverCoins;
});

socket.on("playCoinSound", () => {
	coinAudio.currentTime = 0;
	coinAudio.play();
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

function draw() {
	ctx.clearRect(0, 0, width, height);

	const currentPlayer = players.find((player) => player.id === socket.id);
	let cx = 0;
	let cy = 0;
	if (currentPlayer) {
		cx = currentPlayer.x - canvas.width / 2 + 251;
		cy = currentPlayer.y - canvas.height / 2;
	}

	ctx.fillStyle = "#000000";
	for (let row = 0; row < map.length; row++) {
		for (let col = 0; col < map[row].length; col++) {
			if (map[row][col] === 1) {
				ctx.fillRect(
					col * TILE_SIZE - cx,
					row * TILE_SIZE - cy,
					TILE_SIZE,
					TILE_SIZE,
				);
			}
		}
	}

	for (let coin of coins) {
		ctx.fillStyle = "#FF0000";
		ctx.fillRect(coin.x - cx, coin.y - cy, COIN_SIZE, COIN_SIZE);
	}

	for (let player of players) {
		if (player.id === socket.id) {
			ctx.fillStyle = "#ff0000";
			ctx.fillRect(
				player.x - cx - 1,
				player.y - cy - 1,
				PLAYER_SIZE + 2,
				PLAYER_SIZE + 2,
			);
		}

		ctx.fillStyle = player.color;
		ctx.fillRect(player.x - cx, player.y - cy, PLAYER_SIZE, PLAYER_SIZE);
		ctx.fillStyle = "#000000";
		ctx.fillText(player.name, player.x - 10 - cx, player.y - 10 - cy);
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
