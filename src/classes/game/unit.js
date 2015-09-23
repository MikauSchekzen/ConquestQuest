GameData.classes.Unit = function(resref, player) {
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

	// Append to player
	player.addUnit(this);

	// Define stats properties
	Object.defineProperties(this, {
		"ap": {
			get() {
				// Get base stat
				var value = this.getAttribute("strength", true);
				// Get temporary bonuses
				// From items
				var a, item;
				for(a = 0;a < this.gear.length;a++) {
					item = this.gear[a].item;
					if(item && item.stats.properties.ap) {
						value += item.stats.properties.ap;
					}
				}
				// Return result
				return Math.max(0, value);
			}
		},
		"sp": {
			get() {
				// Get base stat
				var value = this.getAttribute("intelligence", true);
				// Get temporary bonuses
				// From items
				var a, item;
				for(a = 0;a < this.gear.length;a++) {
					item = this.gear[a].item;
					if(item && item.stats.properties.sp) {
						value += item.stats.properties.sp;
					}
				}
				// Return result
				return Math.max(0, value);
			}
		},
		"armor": {
			get() {
				// Get base armor
				var value = 0;
				// Get temporary bonuses
				// From items
				var a, item;
				for(a = 0;a < this.gear.length;a++) {
					item.this.gear[a].item;
					if(item &&  item.stats.properties.armor) {
						value += item.stats.properties.armor;
					}
				}
				// Return result
				return Math.max(0, value);
			}
		},
		"maxActionPoints": {
			get() {
				// Get base action points
				var value = this.getAttribute("agility", true);
				// Get temporary bonuses
				// From items
				var a, item;
				for(a = 0;a < this.gear.length;a++) {
					item = this.gear[a].item;
					if(item && item.stats.properties.actionPoints) {
						value += item.stats.properties.actionPoints;
					}
				}
				// Return result
				return value;
			}
		},
		"scenario": {
			get() {
				return GameManager.game.scenario.current;
			}
		},
		"tilePos": {
			get() {
				return {
					x: Math.floor(this.x / GameData.tile.width),
					y: Math.floor(this.y / GameData.tile.height)
				};
			}
		}
	});

	// Set extra stats
	this.actionPoints = 0;
	this.selected = false;

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
		race: this.baseUnit.config.race,
		attributes: {},
		vitals: {}
	};

	// Set base data
	this.name = this.baseUnit.config.text[GameData.getLangRef()].noun;
	this.gender = this.baseUnit.config.gender;
	// Set attributes
	merge(this.stats.attributes, GameData.templates.unitAttributes);
	// Adjust attributes by race
	for(a in this.raceConfig.attributes) {
		this.stats.attributes[a] += this.raceConfig.attributes[a];
	}
	// Adjust attributes by base unit
	for(a in this.baseUnit.config.attributes) {
		this.stats.attributes[a] += this.baseUnit.config.attributes[a];
	}

	// Set vitals
	merge(this.stats.vitals, GameData.templates.unitVitals);

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

	this.adjustVitals();
};

/*
	method: adjustVitals
*/
GameData.classes.Unit.prototype.adjustVitals = function() {
	var prevVitals = merge({}, this.stats.vitals);
	// Change the maximum values
	this.stats.vitals.maxhp = this.baseUnit.config.vitals.maxhp + this.getAttribute("constitution", true);
	this.stats.vitals.maxmp = this.baseUnit.config.vitals.maxmp + this.getAttribute("wisdom", true);
	// Adjust the current values
	this.stats.vitals.hp = Math.max(1, this.stats.vitals.hp + (this.stats.vitals.maxhp - prevVitals.maxhp));
	this.stats.vitals.mp = Math.max(0, this.stats.vitals.mp + (this.stats.vitals.maxmp - prevVitals.maxmp));
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
		item.wielder = this;
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
	getAttribute(name, includeTemp)
	Returns the value of the given attribute
	If 'includeTemp' is true, it will return the sum of
	 the attribute
	 Otherwise, it will return the base value
*/
GameData.classes.Unit.prototype.getAttribute = function(attrName, includeTemp) {
	if(includeTemp === undefined) {
		includeTemp = true;
	}

	// Get base
	var value = this.stats.attributes[attrName];

	// Get temporary bonuses
	var a, item;
	for(a = 0;a < this.gear.length;a++) {
		item = this.gear[a].item;
		if(item && item.stats.attributes[attrName]) {
			value += item.stats.attributes[attrName];
		}
	}

	// Return result
	return value;
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

/*
	method: ownedByPlayer(player)
	Returns true if this object is owned by the given player
*/
GameData.classes.Unit.prototype.ownedByPlayer = function(player) {
	var a, unit;
	for(a = 0;a < player.units.list.length;a++) {
		unit = player.units.list[a];
		if(unit === this) {
			return true;
		}
	}
	return false;
};

/*
	method: move(x, y)
	Moves the unit to the specified x and y position(in tiles)
*/
GameData.classes.Unit.prototype.move = function(x, y) {
	var placeObj = this.map.getUnitLayer().getObjectAt(x, y);
	if(!placeObj) {
		this.map.getUnitLayer().moveObject(this, x, y);
	}
};

/*
	method: onClick
	Fired when the client clicks on this unit
*/
GameData.classes.Unit.prototype.onClick = function() {
	var activePlayer = this.scenario.getActivePlayer();
	if(this.ownedByPlayer(activePlayer)) {
		if(this.selected) {
			this.deselect();
		}
		else {
			this.select();
		}
	}
};

/*
	method: select
	Selects this unit
*/
GameData.classes.Unit.prototype.select = function() {
	this.selected = true;
	this.scenario.selectedUnit = this;

	// Set up pathfinder
	var paths = [], a, halfRange = Math.ceil(this.actionPoints * 0.5), pathfinder, potentialSpaces = [];
	// Get rectangle borders
	// H-borders
	for(a = -halfRange;a < halfRange;a++) {
		paths.push(new GameData.classes.Pathfinder(this.tilePos.x, this.tilePos.y, this.tilePos.x + a, this.tilePos.y - halfRange, this, potentialSpaces));
		paths.push(new GameData.classes.Pathfinder(this.tilePos.x, this.tilePos.y, this.tilePos.x + a, this.tilePos.y + halfRange, this, potentialSpaces));
		paths.push(new GameData.classes.Pathfinder(this.tilePos.x, this.tilePos.y, this.tilePos.x - halfRange, this.tilePos.y + a, this, potentialSpaces));
		paths.push(new GameData.classes.Pathfinder(this.tilePos.x, this.tilePos.y, this.tilePos.x + halfRange, this.tilePos.y + a, this, potentialSpaces));
	}
	// Place movement markers
	var node, layer;
	for(a = 0;a < potentialSpaces.length;a++) {
		node = potentialSpaces[a];
		new GameData.classes.Tile_Marker(node.x, node.y, "movement", this.map);
	}
};

/*
	method: deselect
	Deselects this unit
*/
GameData.classes.Unit.prototype.deselect = function() {
	this.selected = false;
	this.scenario.selectedUnit = null;
};