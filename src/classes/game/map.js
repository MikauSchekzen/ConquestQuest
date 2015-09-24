GameData.classes.Map = function(baseMap, name) {
	// Extend Phaser.Sprite
	Phaser.Sprite.call(this, game, 0, 0);

	// Check if can exist with given data
	if(!baseMap) {
		return this.destroy();
	}

	// Add to update cycle
	game.add.existing(this);

	// Set basic data
	this.baseMap = baseMap;
	this.name = name;
	this.map = {
		width: this.baseMap.width,
		height: this.baseMap.height,
		layers: {
			units: new GameData.classes.Layer(this, this.baseMap.width, this.baseMap.height, -50),
			markers: new GameData.classes.Layer(this, this.baseMap.width, this.baseMap.height, -40),
			walls: new GameData.classes.Layer(this, this.baseMap.width, this.baseMap.height, -30),
			features: new GameData.classes.Layer(this, this.baseMap.width, this.baseMap.height, -25),
			floors: new GameData.classes.Layer(this, this.baseMap.width, this.baseMap.height, -20)
		},
		tilesets: [],
		tilesetGIDRefs: {}
	};

	// Set up game object lists
	this.gameObjects = {
		units: []
	};

	// Define properties
	Object.defineProperties(this, {
		"scenario": {
			get() {
				return GameManager.game.scenario.current;
			}
		}
	});

	// Create a visual group for all the things directly on the map(units, buildings, tile layers, etc)
	this.visualGroup = game.add.group();
	this.visualGroup.scale.set(1);
	var a;
	for(a in this.map.layers) {
		this.visualGroup.add(this.map.layers[a]);
	}
	this.addChild(this.visualGroup);

	// Create tilesets
	this.createTilesets();

	// Add input handlers
	this.inputEnabled = true;
	this.events.onInputDown.add(function() {
		this.inputClick(game.input.activePointer);
	}, this);
};
GameData.classes.Map.prototype = Object.create(Phaser.Sprite.prototype);
GameData.classes.Map.prototype.constructor = GameData.classes.Map;

/*
	method: parseBaseMap
	Parses the base map, creating the base contents of the layers
*/
GameData.classes.Map.prototype.parseBaseMap = function() {
	var a, b, c, gid, basegid, obj, layer, ts, pos, tsPos, plr;
	for(a = 0;a < this.baseMap.layers.length;a++) {
		layer = this.baseMap.layers[a];
		// Parse tile layer
		if(layer.type === "tilelayer") {
			for(b = 0;b < layer.data.length;b++) {
				gid = layer.data[b];
				if(gid > 0) {
					ts = this.map.tilesetGIDRefs[gid];
					basegid = gid - ts.config.firstgid;
					switch(layer.name) {
						// Create a floor tile
						case "floor":
						case "floors":
							pos = this.map.layers.floors.getDataPos(b);
							tsPos = ts.getDataPos(basegid);
							obj = new GameData.classes.Tile_Floor(ts, tsPos.x, tsPos.y);
							this.map.layers.floors.placeObject(pos.x, pos.y, obj);
							break;
						// Create a wall tile
						case "wall":
						case "walls":
							pos = this.map.layers.walls.getDataPos(b);
							tsPos = ts.getDataPos(basegid);
							obj = new GameData.classes.Tile_Wall(ts, tsPos.x, tsPos.y);
							this.map.layers.walls.placeObject(pos.x, pos.y, obj);
							break;
					}
				}
			}
		}
		// Parse object layer
		if(layer.type === "objectgroup") {
			for(b = 0;b < layer.objects.length;b++) {
				obj = layer.objects[b];
				switch(layer.name) {
					// Create units
					case "units":
						plr = this.scenario.getPlayerByResRef(obj.properties.owner);
						if(plr) {
							this.spawnUnit(Math.floor(obj.x / GameData.tile.width), Math.floor(obj.y / GameData.tile.height), obj.name, plr);
						}
						else {
							console.log("Couldn't spawn unit at map startup: no valid owner found");
						}
						break;
				}
			}
		}
	}

	// Update z-order
	this.zOrder();
};

/*
	method: createTilesets
	Creates the map's tilesets
*/
GameData.classes.Map.prototype.createTilesets = function() {
	// Start loading
	var a, b, obj, ts, url, filename;
	for(a = 0;a < this.baseMap.tilesets.length;a++) {
		// Create tileset
		obj = this.baseMap.tilesets[a];
		ts = new GameData.classes.Tileset(this, obj);
		// Add tileset to this map's tileset list
		this.map.tilesets.push(ts);
		for(b = ts.config.firstgid;b < ts.config.firstgid + ts.config.tilecount;b++) {
			this.map.tilesetGIDRefs[b] = ts;
		}
	}
};

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
	// Order the visual group
	for(a in this.map.layers) {
		layer = this.map.layers[a];
		zGroup.push(layer);
	}
	// Sort according to depth
	zGroup.sort(function(a, b) {
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
		this.visualGroup.bringToTop(layer);
	}
};

/*
	method: spawnUnit(x, y, type)
	Spawns a unit of the given type at the specified coordinates
	Returns the unit that was created, or null if unsuccessful
*/
GameData.classes.Map.prototype.spawnUnit = function(x, y, type, owner) {
	if(!GameData.config.units.exists(type)) {
		return null;
	}
	var unit = new GameData.classes.Unit(type, owner);
	var canPlace = this.map.layers.units.placeObject(x, y, unit);
	if(!canPlace) {
		unit.destroy();
		return null;
	}
	this.gameObjects.units.push(unit);
	return unit;
};

/*
	method: getUnitLayer
	Returns this map's unit layer
*/
GameData.classes.Map.prototype.getUnitLayer = function() {
	return this.map.layers.units;
};

/*
	method: getMarkerLayer
	Returns this map's marker layer
*/
GameData.classes.Map.prototype.getMarkerLayer = function() {
	return this.map.layers.markers;
};

/*
	method: getWallLayer
	Returns this map's wall layer
*/
GameData.classes.Map.prototype.getWallLayer = function() {
	return this.map.layers.walls;
};

/*
	method: getFeatureLayer
	Returns this map's feature layer
*/
GameData.classes.Map.prototype.getFeatureLayer = function() {
	return this.map.layers.features;
};

/*
	method: getFloorLayer
	Returns this map's floor layer
*/
GameData.classes.Map.prototype.getFloorLayer = function() {
	return this.map.layers.floors;
};

/*
	method: inputClick(pointer)
	Adds an input handler for clicking
*/
GameData.classes.Map.prototype.inputClick = function(pointer) {
	var tilePos = GameData.tile.toTilePos(pointer.x, pointer.y);

	// Get unit at position
	var obj;
	obj = this.getUnitLayer().getObjectAt(tilePos.x, tilePos.y);
	if(obj) {
		obj.onClick();
	}
};

/*
	method: getMoveCost(x, y)
	Returns the calculated move cost of the specified tile
	Returns -1 if a wall is there(impassable)
*/
GameData.classes.Map.prototype.getMoveCost = function(x, y) {
	var value = 1;

	// Get wall layer
	var obj = this.getWallLayer().getObjectAt(x, y);
	if(obj) {
		return -1;
	}

	// Get floor layer
	obj = this.getFloorLayer().getObjectAt(x, y);
	if(obj && obj.moveCost) {
		value += obj.moveCost;
	}

	// Get feature layer
	obj = this.getFeatureLayer().getObjectAt(x, y);
	if(obj && obj.moveCost) {
		value += obj.moveCost;
	}

	return value;
};

/*
	method: getDistanceBetweenTiles(x1, y1, x2, y2)
	Returns the manhattan distance between two tiles
*/
GameData.classes.Map.prototype.getDistanceBetweenTiles = function(x1, y1, x2, y2) {
	return Math.abs(x2 - x1) + Math.abs(y2 - y1);
};

/*
	method: getUnitList(originUnit, filters)
	Returns a filtered list of all the units in the scenario.
	The filters object may include the following:
	noAllied: true or false (defaults false); Filters out allied units
	noOwned: true or false (defaults false); Filters out owned units
	noHostile: true or false (defaults to false); Filters out hostile units
	noNeutral: true or false (defaults to false); Filters out neutral units
	noUnknown: true or false (defaults to false); Filters out units with an unknown opinion
*/
GameData.classes.Map.prototype.getUnitList = function(originUnit, filters) {
	var result = [];
	// Preset data
	if(filters === undefined) {
		filters = {};
	}
	if(!filters.noAllied) {filters.noAllied = false;}
	if(!filters.noOwned) {filters.noOwned = false;}
	if(!filters.noHostile) {filters.noHostile = false;}
	if(!filters.noNeutral) {filters.noNeutral = false;}
	if(!filters.noUnkown) {filters.noUnkown = false;}

	// Search
	var a, unit, opinion, doAdd;
	for(a = 0;a < this.gameObjects.units.length;a++) {
		unit = this.gameObjects.units[a];
		if(unit !== originUnit) {
			doAdd = true;
			opinion = originUnit.getOpinion(unit);

			// Check hostile
			if(opinion == GameData.opinion.HOSTILE && filters.noHostile) {
				doAdd = false;
			}

			// Check allied
			if(opinion == GameData.opinion.ALLIED && filters.noAllied) {
				doAdd = false;
			}

			// Check neutral
			if(opinion == GameData.opinion.NEUTRAL && filters.noNeutral) {
				doAdd = false;
			}

			// Check unknown
			if(opinion == GameData.opinion.UNKNOWN && filters.noUnknown) {
				doAdd = false;
			}

			// Check owned
			if(opinion == GameData.opinion.SAME_OWNER && filters.noOwned) {
				doAdd = false;
			}

			// Append result
			if(doAdd) {
				result.push(unit);
			}
		}
	}

	// Return results
	return result;
};