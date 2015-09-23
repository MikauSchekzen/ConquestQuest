GameData.classes.Tile_Marker = function(tileX, tileY, type, map) {
	// Extend Phaser.Sprite
	Phaser.Sprite.call(this, game, 0, 0);
	game.add.existing(this);

	// Set basic properties
	this.tile = {
		x: tileX,
		y: tileY
	};
	this.map = map;

	// Auto-apply
	switch(type) {
		case "movement":
			this.setTileImage("tilesetMarkers", 0, 0);
			break;
	}

	// Auto-place on map's marker layer
	this.map.getMarkerLayer().placeObject(this.tile.x, this.tile.y, this);
};
GameData.classes.Tile_Marker.prototype = Object.create(Phaser.Sprite.prototype);
GameData.classes.Tile_Marker.prototype.constructor = GameData.classes.Tile_Marker;

/*
	method: setTileImage(imageKey, tileX, tileY)
	Sets this tile's image, and crops appropriately
*/
GameData.classes.Tile_Marker.prototype.setTileImage = function(imageKey, tileX, tileY) {
	this.loadTexture(imageKey);
	var properties = {
		margin: 2,
		spacing: 4
	};
	var image = game.cache.getImage(imageKey);
	var cropping = new Phaser.Rectangle(
		properties.margin + (tileX * (GameData.tile.width + properties.spacing)),
		properties.margin + (tileY * (GameData.tile.height + properties.spacing)),
		GameData.tile.width,
		GameData.tile.height
	);
	this.crop(cropping);
};