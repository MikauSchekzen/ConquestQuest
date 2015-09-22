GameData.classes.Map = function(baseMap) {
	// Extend Phaser.Group
	Phaser.Group.call(this, game);

	// Check if can exist with given data
	if(!baseMap) {
		return this.destroy();
	}

	// Add to update cycle
	game.add.existing(this);

	// Set basic data
	this.baseMap = baseMap;
	this.map = {
		width: this.baseMap.width,
		height: this.baseMap.height,
		layers: {
			units: new GameData.classes.Layer(this, this.baseMap.width, this.baseMap.height, -50)
		}
	};

	// Define properties
	Object.defineProperty(this, "state", {get() {
		return game.state.getCurrentState();
	}});

	// Create a visual group for all the things directly on the map(units, buildings, tile layers, etc)
	this.visualGroup = game.add.group();
	this.visualGroup.scale.set(2);
};
GameData.classes.Map.prototype = Object.create(Phaser.Group.prototype);
GameData.classes.Map.prototype.constructor = GameData.classes.Map;

/*
	method: update
	Called every frame
*/
GameData.classes.Map.prototype.update = function() {
	// Apply Z-ordering
	this.zOrder();
};

/*
	method: zOrder
	Applies z-ordering of the layers
*/
GameData.classes.Map.prototype.zOrder = function() {
	var a, layer, zGroup = [];
	for(a in this.map.layers) {
		layer = this.map.layers[a];
		zGroup.push(layer);
	}
	// Sort according to depth
	layer.sort(function(a, b) {
		if(a.depth < b.depth) {
			return 1;
		}
		else if(a.depth > b.depth) {
			return -1;
		}
		return 0;
	});
	for(a = 0;a < zGroup.length;a++) {
		layer = zGroup[a];
		this.bringToTop(layer);
	}
};

/*
	method: spawnUnit(x, y, type)
	Spawns a unit of the given type at the specified coordinates
	Returns the unit that was created, or null if unsuccessful
*/
GameData.classes.Map.prototype.spawnUnit = function(x, y, type) {
	if(!GameData.config.units.exists(type)) {
		return null;
	}
	var unit = new GameData.classes.Unit(type);
	var canPlace = this.map.layers.units.placeObject(x, y, unit);
	if(!canPlace) {
		unit.destroy();
		return null;
	}
	return unit;
};