GameData.classes.Tile_Wall = function(tileset, tileX, tileY) {
	GameData.classes.Tile.call(this, tileset, tileX, tileY);
};
GameData.classes.Tile_Wall.prototype = Object.create(GameData.classes.Tile.prototype);
GameData.classes.Tile_Wall.prototype.constructor = GameData.classes.Tile_Wall;