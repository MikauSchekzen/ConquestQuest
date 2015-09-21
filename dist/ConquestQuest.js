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
			data: []
		},
		items: {
			data: []
		},
		units: {
			data: []
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
	this.resref = resref;

	// Define properties
	Object.defineProperty(this, "raceConfig", {get() {
		return GameData.config.races.data[this.stats.race].config;
	}});

	// Load config data
	this.baseUnit = GameData.config.units.data[this.resref];
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
	// (Re-)initialize appearance
	this.appearance = {
		body: null,
		gear: []
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
	game.state.start("game");
};
var gameState = new Phaser.State();

gameState.create = function() {
	var unit = new GameData.classes.Unit("footman");

	var unit2 = new GameData.classes.Unit("berserker");
	unit2.x = 64;
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