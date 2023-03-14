import { TILE_SIZE, DEBUG } from "./constants.js";

const bgImage = new Image();
bgImage.src = "../images/bg.png";

const tileImage = new Image();
tileImage.src = "../images/tilesheet.png";

export function drawBackground(ctx, camera) {
  ctx.drawImage(
    bgImage,
    0,
    0,
    bgImage.width,
    bgImage.height,
    0 - camera.cx / 20 - 50,
    0 - camera.cy / 20 - 50,
    bgImage.width,
    bgImage.height
  );
}

export function drawMap(ctx, map, camera) {
  let left = true;
  // ctx.fillStyle = "#0a0a0a";
  const thickness = 1;
  for (let row = 0; row < map.length; row++) {
    left = true;
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 1) {
        drawTile(ctx, { x: row, y: col }, camera, left);
        left = false;
      } else if (DEBUG) {
        ctx.fillStyle = "#000";
        ctx.fillRect(
          col * TILE_SIZE - camera.cx - thickness,
          row * TILE_SIZE - camera.cy - thickness,
          TILE_SIZE + thickness * 2,
          TILE_SIZE + thickness * 2
        );
        ctx.fillStyle = "#FFF";
        ctx.fillRect(
          col * TILE_SIZE - camera.cx,
          row * TILE_SIZE - camera.cy,
          TILE_SIZE,
          TILE_SIZE
        );
      }
    }
  }
}

export function drawTile(ctx, tileLocation, camera, imageLeft) {
  ctx.drawImage(
    tileImage,
    imageLeft ? 510 : 768,
    0,
    TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE * tileLocation.y - camera.cx,
    TILE_SIZE * tileLocation.x - camera.cy,
    TILE_SIZE,
    TILE_SIZE
  );
}
