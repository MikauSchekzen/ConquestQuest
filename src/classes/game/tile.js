GameData.classes.Tile = function(tileset, tileX, tileY) {
	// Extend Phaser.Image
	Phaser.Image.call(this, game, 0, 0);

	// Apply parameters
	this.tileset = tileset;
	this.setTextureFromTileset(tileX, tileY, this.tileset);
};
GameData.classes.Tile.prototype = Object.create(Phaser.Image.prototype);
GameData.classes.Tile.prototype.constructor = GameData.classes.Tile;

/*
	method: setTextureFromTileset(x, y, tilesetKey)
	Sets the tile's appearance from a tileset
*/
GameData.classes.Tile.prototype.setTextureFromTileset = function(x, y, tileset) {
	// Load the appropriate texture
	this.loadTexture(tileset.key);

	// Crop appropriately
	this.crop(tileset.getTileRect(x, y));
};