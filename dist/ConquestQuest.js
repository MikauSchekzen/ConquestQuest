(function(Phaser) {
function merge(target, source) {
        
    /* Merges two (or more) objects,
       giving the last one precedence */
    
    if ( typeof target !== 'object' ) {
        target = {};
    }
    
    for (var property in source) {
        
        if ( source.hasOwnProperty(property) ) {
            
            var sourceProperty = source[ property ];
            
            if ( typeof sourceProperty === 'object' ) {
                target[ property ] = merge( target[ property ], sourceProperty );
                continue;
            }
            
            target[ property ] = sourceProperty;
            
        }
        
    }
    
    for (var a = 2, l = arguments.length; a < l; a++) {
        merge(target, arguments[a]);
    }
    
    return target;
};
"use strict";

var GameData = {
	classes: {},
	config: {
		races: {
			data: {},
			exists: function(resref) {
				if(this.data[resref]) {
					return true;
				}
				return false;
			}
		},
		items: {
			data: {},
			exists: function(resref) {
				if(this.data[resref]) {
					return true;
				}
				return false;
			}
		},
		units: {
			data: {},
			exists: function(resref) {
				if(this.data[resref]) {
					return true;
				}
				return false;
			}
		}
	},
	getLangRef: function() {
		return "en";
	},
	tile: {
		width: 32,
		height: 32
	}
};
GameData.classes.BaseItem = function(config) {
	GameData.config.items.data[config.resref] = this;
	this.config = config;
};
GameData.classes.BaseItem.prototype.constructor = GameData.classes.BaseItem;
GameData.classes.Race = function(config) {
	GameData.config.races.data[config.resref] = this;
	this.config = config;
};
GameData.classes.Race.prototype.constructor = GameData.classes.Race;
GameData.classes.BaseUnit = function(config) {
	GameData.config.units.data[config.resref] = this;
	this.config = config;
};
GameData.classes.BaseUnit.prototype.constructor = GameData.classes.BaseUnit;
GameData.classes.Item = function(resref) {
	this.resref = resref;

	// Load config data
	this.baseItem = GameData.config.items.data[this.resref];

	this.name = this.baseItem.config.text[GameData.getLangRef()].name;
	this.slot = this.baseItem.config.slot;

	// Set appearance
	this.appearance = {
		atlas: this.baseItem.config.appearance.atlas,
		frame: this.baseItem.config.appearance.frame,
		depth: this.baseItem.config.appearance.depth,
		offset: {
			x: 0,
			y: 0
		}
	};
	if(this.baseItem.config.appearance.offset) {
		this.appearance.offset.x = this.baseItem.config.appearance.offset.x;
		this.appearance.offset.y = this.baseItem.config.appearance.offset.y;
	}
};
GameData.classes.Item.prototype.constructor = GameData.classes.Item;
GameData.classes.Unit = function(resref) {
	Phaser.Group.call(this, game, 0, 0);
	game.add.existing(this);

	// Set basic data
	this.resref = resref;

	// Define properties
	Object.defineProperty(this, "raceConfig", {get() {
		return GameData.config.races.data[this.stats.race].config;
	}});
	Object.defineProperty(this, "baseUnit", {get() {
		return GameData.config.units.data[this.resref];
	}});

	// Load config data
	this.resetToBase();

	// Set appearance
	this.resetAppearance();
};
GameData.classes.Unit.prototype = Object.create(Phaser.Group.prototype);
GameData.classes.Unit.prototype.constructor = GameData.classes.Unit;

/*
	method: resetToBase
	Resets this unit to its base unit's data
*/
GameData.classes.Unit.prototype.resetToBase = function() {
	var a, obj;
	// Set race
	this.stats = {
		race: this.baseUnit.config.race
	};

	// Set base data
	this.name = this.baseUnit.config.text[GameData.getLangRef()].noun;
	this.gender = this.baseUnit.config.gender;

	// Set gear slots
	this.gear = [];
	for(a = 0;a < this.raceConfig.equipmentSlots.length;a++) {
		this.addEquipmentSlot(this.raceConfig.equipmentSlots[a]);
	}

	// Set base equipment
	for(a = 0;a < this.baseUnit.config.baseGear.length;a++) {
		obj = this.baseUnit.config.baseGear[a];
		this.equipItem(new GameData.classes.Item(obj.item));
	}

	// Set visual components
	this.gfxComponents = [];
	if(this.baseUnit.config.gfxComponents) {
		for(a = 0;a < this.baseUnit.config.gfxComponents.length;a++) {
			obj = this.baseUnit.config.gfxComponents[a];
			this.gfxComponents.push(merge({}, obj));
		}
	}
};

/*
	method: addEquipmentSlot(type)
	Adds an equipment slot to this unit
*/
GameData.classes.Unit.prototype.addEquipmentSlot = function(slotConf) {
	var gearObj = merge({}, slotConf);
	gearObj.item = null;
	this.gear.push(gearObj);
};

/*
	method: equipItem(item)
	Equips an item to an available slot, if any
*/
GameData.classes.Unit.prototype.equipItem = function(item) {
	var slot;
	slot = this.getItemSlot(item.slot);
	if(slot >= 0) {
		this.gear[slot].item = item;
	}
};

/*
	method: getItemSlot(slot_type)
	Checks for an empty slot of the specified type
	Returns -1 if no empty slot was found
*/
GameData.classes.Unit.prototype.getItemSlot = function(slot_type) {
	var a, slot;
	for(a = 0;a < this.gear.length;a++) {
		slot = this.gear[a];
		if(!slot.item && slot.type == slot_type) {
			return a;
		}
	}
	return -1;
};

/*
	method: resetAppearance
	Sets the appearance of this unit to its base unit's base appearance
*/
GameData.classes.Unit.prototype.resetAppearance = function() {
	var a, item, slot, obj, zOrderingArray = [];
	// Clear old appearance
	if(this.body) {
		this.body.destroy();
	}
	if(this.appearance && this.appearance.gear) {
		for(a = 0;a < this.appearance.gear.length;a++) {
			item = this.appearance.gear[a];
			item.destroy();
		}
	}
	if(this.appearance && this.appearance.components) {
		for(a = 0;a < this.appearance.components.length;a++) {
			item = this.appearance.components[a];
			item.destroy();
		}
	}
	// (Re-)initialize appearance
	this.appearance = {
		body: null,
		gear: [],
		components: []
	};

	// Create body
	obj = game.add.sprite(GameData.tile.width * 0.5, GameData.tile.height * 0.5, this.raceConfig.body[this.gender].atlas, this.raceConfig.body[this.gender].frame);
	obj.anchor.set(0.5);
	obj.depth = 0;
	this.appearance.body = obj;
	this.add(obj);
	zOrderingArray.push(obj);

	// Create gear
	for(a = 0;a < this.gear.length;a++) {
		slot = this.gear[a];
		if(slot.item) {
			item = game.add.sprite(
				(GameData.tile.width * 0.5) + slot.appearance.offset.x,
				(GameData.tile.height * 0.5) + slot.appearance.offset.y,
				slot.item.appearance.atlas,
				slot.item.appearance.frame
			);
			item.anchor.set(0.5);
			if(slot.appearance.mirror) {
				item.scale.x = -1;
			}
			item.depth = slot.appearance.depth;
			this.add(item);
			zOrderingArray.push(item);
			this.appearance.gear.push(item);
		}
	}

	// Create visual components
	var comp, spr;
	for(a = 0;a < this.gfxComponents.length;a++) {
		comp = this.gfxComponents[a];
		spr = game.add.sprite(
			(GameData.tile.width * 0.5) + comp.offset.x,
			(GameData.tile.height * 0.5) + comp.offset.y,
			comp.atlas,
			comp.frame
		);
		spr.anchor.set(0.5);
		spr.depth = comp.depth;
		this.add(spr);
		zOrderingArray.push(spr);
		this.appearance.components.push(spr);
	}

	// Z-ordering
	zOrderingArray.sort(function(a, b) {
		if(a.depth < b.depth) {
			return 1;
		}
		else if(a.depth > b.depth) {
			return -1;
		}
		return 0;
	});
	for(a = 0;a < zOrderingArray.length;a++) {
		this.bringToTop(zOrderingArray[a]);
	}
};
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
GameData.classes.Layer = function(map, width, height, depth) {
	// Extend Phaser.Group
	Phaser.Group.call(this, game);
	// Add to update cycle
	game.add.existing(this);

	// Set up initial data
	// Basic data
	this.data = {
		objects: [],
		width: width,
		height: height,
		map: map
	};
	this.depth = depth;

	// Fill in basic data
	var a;
	for(a = 0;a < this.width * this.height;a++) {
		this.data.objects.push(null);
	}
};
GameData.classes.Layer.prototype = Object.create(Phaser.Group.prototype);
GameData.classes.Layer.prototype.constructor = GameData.classes.Layer;

/*
	method: getDataIndex(x, y)
	Returns the index of this layer's data for the given x and y position
*/
GameData.classes.Layer.prototype.getDataIndex = function(x, y) {
	return (x % this.data.width) + Math.floor(x / this.data.width);
};

/*
	method: getObjectAt(x, y)
	Returns the object at the specified position
*/
GameData.classes.Layer.prototype.getObjectAt = function(x, y) {
	return this.data.objects[this.getDataIndex(x, y)];
};

/*
	method: placeObject(x, y, object, force)
	Places an object at the specified x and y position of the layer
	'force' specifies whether the action should still go thorugh
	 despite an object already being there on this layer,
	 calling remove() on the old object(if any)
	 Defaults to false
	Returns whether successful
*/
GameData.classes.Layer.prototype.placeObject = function(x, y, object, force) {
	// Set default parameters
	if(force === undefined) {
		force = false;
	}
	if(!object) {
		return false;
	}

	// Get old object
	var oldObj = this.getObjectAt(x, y);
	if(oldObj) {
		if(force && oldObj.remove) {
			oldObj.remove();
			oldObj = null;
		}
	}

	// Place new object
	if(!oldObj) {
		var index = this.getDataIndex(x, y);
		this.data[index] = object;
		object.x = (x * GameData.tile.width);
		object.y = (y * GameData.tile.height);
		return true;
	}
	return false;
};
GameData.classes.GUI = function(x, y) {
	Phaser.Group.call(this, game);
	game.add.existing(this);

	Object.defineProperty(this, "state", {get() {
		return game.state.getCurrentState();
	}});

	this.x = x;
	this.y = y;
};
GameData.classes.GUI.prototype = Object.create(Phaser.Group.prototype);
GameData.classes.GUI.prototype.constructor = GameData.classes.GUI;
var bootState = new Phaser.State();

/*
	method: create
	Starts the asset loading
*/
bootState.create = function() {
	// Add callback to load complete
	game.load.onFileComplete.add(function loadProgress(progress, fileKey, success, totalLoadedFiles, totalFiles) {
		if (totalLoadedFiles >= totalFiles) {
			game.load.onFileComplete.remove(loadProgress, this);
			this.loadAssets();
		}
	}, this);

	// Load asset
	game.load.json("assetSources", "assets/sources.json");

	// Start loading
	game.load.start();
};

/*
	method: loadAssets
	Loads the assets for the game
*/
bootState.loadAssets = function() {
	var sources = game.cache.getJSON("assetSources"),
		a, curList, curAsset, loadingFiles = 0;

	// Preload assets
	// Sprite atlases
	curList = sources.atlases;
	for(a = 0;a < curList.length;a++) {
		loadingFiles++;
		curAsset = curList[a];
		game.load.atlasJSONArray(curAsset.key, curAsset.url.base + curAsset.url.image, curAsset.url.base + curAsset.url.config);
	}

	// JSON files
	curList = sources.json;
	for(a = 0;a < curList.length;a++) {
		loadingFiles++;
		curAsset = curList[a];
		game.load.json(curAsset.key, curAsset.url);
	}

	// Audio
	curList = sources.audio;
	for(a = 0;a < curList.length;a++) {
		loadingFiles++;
		curAsset = curList[a];
		game.load.audio(curAsset.key, curAsset.url);
	}


	// Add callback for loading files
	if(loadingFiles > 0) {
		game.load.onFileComplete.add(function loadProgress(progress, fileKey, success, totalLoadedFiles, totalFiles) {
			if(totalLoadedFiles >= totalFiles) {
				game.load.onFileComplete.remove(loadProgress, this);
				this.parseConfigs();
			}
		}, this);
	}
	// ...or not
	else {
		this.parseConfigs();
	}
};

/*
	method: parseConfigs
	Parses the configuration files
*/
bootState.parseConfigs = function() {
	var cfg, a, data, obj;

	// Parse races
	cfg = game.cache.getJSON("configRaces");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.Race(data);
	}
	game.cache.removeJSON("configRaces");

	// Parse items
	cfg = game.cache.getJSON("configItems");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.BaseItem(data);
	}
	game.cache.removeJSON("configItems");

	// Parse units
	cfg = game.cache.getJSON("configUnits");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.BaseUnit(data);
	}
	game.cache.removeJSON("configUnits");

	// Start next state
	this.nextState();
};

/*
	method: nextState
	Starts the next state(will be menu, for now is game)
*/
bootState.nextState = function() {
	// Delete source list from cache
	game.cache.removeJSON("assetSources");

	// Go to next state
	game.load.onFileComplete.add(function parseLoad(progress, fileKey, success, totalLoadedFiles, totalFiles) {
		if(totalLoadedFiles >= totalFiles) {
			game.load.onFileComplete.remove(parseLoad, this);
			game.state.start("game");
		}
	}, this);
	game.load.json("map", "assets/maps/debug.json");
};
var gameState = new Phaser.State();

gameState.create = function() {
	var mapData = game.cache.getJSON("map");
	var map = new GameData.classes.Map(mapData);
	if(map) {
		map.spawnUnit(2, 3, "berserker");
		map.spawnUnit(3, 3, "elven_mage");
		map.spawnUnit(4, 5, "footman");
		map.spawnUnit(5, 5, "footman");
	}
};
var game = new Phaser.Game(960, 540, Phaser.AUTO, "content", null);

game.state.add("boot", bootState);
game.state.add("game", gameState);
game.state.start("boot");
var GameManager = {
	audio: {
		volume: {
			sfx: 0.75,
			bgm: 0.5
		},
		bgm: null,

		CHANNEL_SFX: 0,
		CHANNEL_BGM: 1,

		getChannelResRef: function(channel) {
			switch(channel) {
				default:
				case this.CHANNEL_SFX:
				return "sfx";
				break;
				case this.CHANNEL_BGM:
				return "bgm";
				break;
			}
		},
		play: function(key, loop, channel) {
			// Set default parameters
			if(loop === undefined) {
				loop = false;
			}
			if(channel === undefined) {
				channel = this.CHANNEL_SFX;
			}

			// Play sound
			return game.sound.play(key, this.volume[this.getChannelResRef(channel)], loop);
		},
		playBGM: function(key) {
			return this.bgm = this.play(key, true, this.CHANNEL_BGM);
		},
		stopBGM: function() {
			if(this.bgm) {
				this.bgm.stop();
				this.bgm = null;
			}
		}
	}
};
})(Phaser);