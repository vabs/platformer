import { PLAYER_HEIGHT, PLAYER_WIDTH } from "./constants.js";

export const drawPlayer = (ctx, player, camera) => (leftImage, rightImage) => {
	ctx.drawImage(
		player.facingRight ? rightImage : leftImage,
		0,
		0,
		PLAYER_WIDTH,
		PLAYER_HEIGHT,
		player.x - camera.cx,
		player.y - camera.cy,
		PLAYER_WIDTH,
		PLAYER_HEIGHT,
	);
	ctx.fillStyle = "#000000";
	ctx.fillText(
		player.name,
		player.x - 10 - camera.cx,
		player.y - 10 - camera.cy,
	);
};
