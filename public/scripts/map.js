import { TILE_SIZE, DEBUG } from "./constants.js";

const bgImage = new Image();
bgImage.src = "../images/bg.png";

const tileImage = new Image();
tileImage.src = "../images/tilesheet.png";

// background scrolls 1px for every PARALLAX_FACTOR px the camera moves
const PARALLAX_FACTOR = 20;
// extra image kept off-screen on each side so parallax has room to scroll
const PARALLAX_MARGIN = 80;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function drawBackground(ctx, camera) {
  if (!bgImage.naturalWidth) return;

  const { width, height } = ctx.canvas;
  // scale like CSS background-size: cover, plus the parallax margin
  const scale = Math.max(
    (width + PARALLAX_MARGIN * 2) / bgImage.naturalWidth,
    (height + PARALLAX_MARGIN * 2) / bgImage.naturalHeight
  );
  const drawWidth = bgImage.naturalWidth * scale;
  const drawHeight = bgImage.naturalHeight * scale;
  const maxOffsetX = drawWidth - width;
  const maxOffsetY = drawHeight - height;
  // clamp so an image edge never scrolls into view
  const offsetX = clamp(maxOffsetX / 2 + camera.cx / PARALLAX_FACTOR, 0, maxOffsetX);
  const offsetY = clamp(maxOffsetY / 2 + camera.cy / PARALLAX_FACTOR, 0, maxOffsetY);

  ctx.drawImage(bgImage, -offsetX, -offsetY, drawWidth, drawHeight);
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
