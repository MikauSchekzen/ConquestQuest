GameData.classes.Tile_Floor = function(tileset, tileX, tileY) {
	GameData.classes.Tile.call(this, tileset, tileX, tileY);
};
GameData.classes.Tile_Floor.prototype = Object.create(GameData.classes.Tile.prototype);
GameData.classes.Tile_Floor.prototype.constructor = GameData.classes.Tile_Floor;