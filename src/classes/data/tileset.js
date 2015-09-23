GameData.classes.Tileset = function(map, source) {
	// Destroy if primary constructor data is incorrect
	if(!source || !map) {
		return this.destroy();
	}

	// Set basic data
	this.config = merge({}, source);
	this.map = map;

	// Define properties
	Object.defineProperties(this, {
		"spacing": {
			get() {
				return this.config.spacing;
			}
		},
		"margin": {
			get() {
				return this.config.margin;
			}
		},
		"key": {
			get() {
				return this.resref;
			}
		},
		"resref": {
			get() {
				return this.map.name + "_" + this.config.name;
			}
		}
	});

	// Add to database
	GameData.config.tilesets.data[this.resref] = this;
};
GameData.classes.Tileset.prototype.constructor = GameData.classes.Tileset;

/*
	method: getDataPos(index)
	Returns an object with 'x' and 'y' properties of the given index/gid
*/
GameData.classes.Tileset.prototype.getDataPos = function(index) {
	var obj = {
		x: (index % Math.ceil(this.config.imagewidth / (GameData.tile.width + this.spacing))),
		y: Math.floor(index / Math.ceil(this.config.imagewidth / (GameData.tile.width + this.spacing)))
	};
	return obj;
};

/*
	method: getTileRect(x, y)
	Returns a Phaser.Rectangle containg data for the cropping of the given tile
*/
GameData.classes.Tileset.prototype.getTileRect = function(x, y) {
	var tempPos = {
		x: this.margin + ((GameData.tile.width + this.spacing) * x),
		y: this.margin + ((GameData.tile.height + this.spacing) * y)
	};
	return new Phaser.Rectangle(tempPos.x, tempPos.y, GameData.tile.width, GameData.tile.height);
};