import { PLAYER_HEIGHT, PLAYER_WIDTH } from "./constants.js";

// match --moonlight and --ghost-glow in style.css
const NAME_COLOR = "#e6f1fb";
const NAME_COLOR_SELF = "#9fe3ff";

export const drawPlayer = (ctx, player, camera, isCurrentPlayer = false) => (leftImage, rightImage) => {
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
	ctx.save();
	ctx.font = '600 13px "Grandstander", system-ui, sans-serif';
	ctx.textAlign = "center";
	const nameX = player.x + PLAYER_WIDTH / 2 - camera.cx;
	const nameY = player.y - 8 - camera.cy;
	// dark outline keeps names readable over both the moon and the night sky
	ctx.lineWidth = 3;
	ctx.lineJoin = "round";
	ctx.strokeStyle = "rgba(5, 10, 14, 0.85)";
	ctx.strokeText(player.name, nameX, nameY);
	ctx.fillStyle = isCurrentPlayer ? NAME_COLOR_SELF : NAME_COLOR;
	ctx.fillText(player.name, nameX, nameY);
	ctx.restore();
};
