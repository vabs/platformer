const {
	TILE_SIZE,
	PLAYER_WIDTH,
	PLAYER_HEIGHT,
	COIN_SIZE,
} = require("./constants");

const isOverlap = (rect1, rect2) => {
	return (
		rect1.x < rect2.x + rect2.width &&
		rect1.x + rect1.width > rect2.x &&
		rect1.y < rect2.y + rect2.height &&
		rect1.height + rect1.y > rect2.y
	);
};

const getBoundingRectangleFactory = (width, height) => (entity) => {
	return {
		width,
		height,
		x: entity.x,
		y: entity.y,
	};
};

const getBoundingBoxFactory = (STATIC_SIZE) => (entity) => {
	return getBoundingRectangleFactory(STATIC_SIZE, STATIC_SIZE)(entity);
};

const getPlayerBoundingBox = getBoundingRectangleFactory(
	PLAYER_WIDTH,
	PLAYER_HEIGHT,
);

const getTileBoundingBox = getBoundingRectangleFactory(TILE_SIZE, TILE_SIZE);

const isCollidingWithMap = (player, collidables) => {
	for (const collidable of collidables) {
		if (
			isOverlap(getPlayerBoundingBox(player), getTileBoundingBox(collidable))
		) {
			return true;
		}
	}
	return false;
};

const isCollidingWithCoin = (player, coin) => {
	if (
		isOverlap(
			getPlayerBoundingBox(player),
			getBoundingBoxFactory(COIN_SIZE)(coin),
		)
	) {
		return true;
	}

	return false;
};

module.exports = { isCollidingWithMap, isCollidingWithCoin };
