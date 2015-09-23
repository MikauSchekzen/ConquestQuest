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
		},
		tilesets: {
			data: {},
			exists: function(resref) {
				if(this.data[resref]) {
					return true;
				}
				return false;
			}
		},
		abilities: {
			data: {},
			exists: function(resref) {
				if(this.data[resref]) {
					return true;
				}
				return false;
			}
		},
		effects: {
			data: {},
			exists: function(resref) {
				if(this.data[resref]) {
					return true;
				}
				return false;
			}
		},
		factions: {
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
		height: 32,
		toTilePos: function(x, y) {
			return {
				x: Math.floor(x / this.width),
				y: Math.floor(y / this.height)
			};
		},
		toWorldPos: function(x, y) {
			return {
				x: (x * this.width),
				y: (y * this.height)
			};
		}
	},
	pathfinding: {
		baseCosts: {
			orthogonal: 10,
			diagonal: 14
		}
	},
	scenario: {
		prefixes: {
			maps: "map_",
			settings: "setting_"
		}
	},
	templates: {
		unitAttributes: {
			strength: 10,
			dexterity: 10,
			agility: 10,
			constitution: 10,
			intelligence: 10,
			wisdom: 10
		},
		unitVitals: {
			maxhp: 1,
			hp: 1,
			maxmp: 1,
			mp: 1
		}
	}
};
GameData.classes.Effect = function(config) {
	// Add to database
	this.config = config;
	this.resref = this.config.resref;
	GameData.config.effects.data[this.resref] = this;
};
GameData.classes.Effect.prototype.constructor = GameData.classes.Effect;
GameData.classes.Ability = function(config) {
	// Add to database
	this.config = config;
	this.resref = this.config.resref;
	GameData.config.abilities.data[this.resref] = this;

	// Adjust effect references
	var a, effect;
	if(this.config.effects) {
		for(a = 0;a < this.config.effects.length;a++) {
			effect = this.config.effects[a];
			effect.effect = GameData.config.effects.data[effect.effect];
		}
	}
};
GameData.classes.Ability.prototype.constructor = GameData.classes.Ability;
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
	// Add to database
	this.config = config;
	this.resref = this.config.resref;
	GameData.config.units.data[this.config.resref] = this;

	// Define properties
	Object.defineProperties(this, {
		"factions": {
			get() {
				return this.config.factions;
			}
		}
	});

	// Add this unit to the appropriate factions
	var a, obj;
	for(a = 0;a < this.factions.length;a++) {
		obj = GameData.config.factions.data[this.factions[a]];
		obj.trainableUnits.list.push(this);
		obj.trainableUnits.resrefs[this.resref] = this;
	}
};
GameData.classes.BaseUnit.prototype.constructor = GameData.classes.BaseUnit;
GameData.classes.Faction = function(config) {
	// Add to database
	this.config = config;
	this.resref = this.config.resref;
	GameData.config.factions.data[this.resref] = this;

	// Define base properties
	

	// Initialize trainable unit list
	this.trainableUnits = {
		list: [],
		resrefs: {}
	};
};
GameData.classes.Faction.prototype.constructor = GameData.classes.Faction;
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
GameData.classes.Scenario = function() {
	// Set up basic data
	this.maps = [];
	this.players = {
		list: [],
		resrefs: {}
	};
	// Set up turn order
	this.turn = 0;
	this.actingPlayer = null;
	this.selectedUnit = null;
};
GameData.classes.Scenario.prototype.constructor = GameData.classes.Scenario;

/*
	method: start
	Starts the scenario gameplay
	Called when the scenario is fully loaded
*/
GameData.classes.Scenario.prototype.start = function() {
	// Start the first player's turn
	this.startPlayerTurn(this.getPlayerByIndex(0));
};

/*
	method: addMap(map)
	Adds a map to this scenario's map list
*/
GameData.classes.Scenario.prototype.addMap = function(map) {
	this.maps.push(map);
};

/*
	method: addPlayer(player)
	Adds a player to the scenario's player list
*/
GameData.classes.Scenario.prototype.addPlayer = function(player, resref) {
	this.players.list.push(player);
	this.players.resrefs[resref] = player;
	this.evaluatePlayers();
};

/*
	method: getPlayerIndex(player)
	Returns the index of the given player
*/
GameData.classes.Scenario.prototype.getPlayerIndex = function(player) {
	var a, plr;
	for(a = 0;a < this.players.list.length;a++) {
		plr = this.players.list[a];
		if(plr === player) {
			return a;
		}
	}
	return -1;
};

/*
	method: getPlayerByResRef(resref)
	Returns the player by its resource reference(resref)
*/
GameData.classes.Scenario.prototype.getPlayerByResRef = function(resref) {
	if(this.players.resrefs[resref]) {
		return this.players.resrefs[resref];
	}
	return null;
};

/*
	method: getPlayerByIndex(index)
	Returns the player by its index in the scenario
*/
GameData.classes.Scenario.prototype.getPlayerByIndex = function(index) {
	if(index < 0 || index > this.players.list.length) {
		return null;
	}
	return this.players.list[index];
};

/*
	method: removePlayer(index, remainingUnitCallback)
	Removes the player from the scenario
	Alternatively runs a callback function on all the players' remaining
	 units.
*/
GameData.classes.Scenario.prototype.removePlayer = function(player, remainingUnitCallback) {
	// Get index
	var plrIndex = -1, a;
	for(a = 0;a < this.players.list.length && plrIndex === -1;a++) {
		if(this.players.list[a] === player) {
			plrIndex = a;
		}
	}

	// Run callback on the players' units first
	var a, unit;
	if(remainingUnitCallback) {
		for(a = 0;a < plr.units.list.length;a++) {
			unit = plr.units.list[a];
			if(unit) {
				remainingUnitCallback.call(unit);
			}
		}
	}

	// Remove player from list
	this.players.list.splice(plrIndex, 1);
	this.evaluatePlayers();
	return true;
};

/*
	method: setupPlayers(plrObj)
	Initializes the players for this map
*/
GameData.classes.Scenario.prototype.setupPlayers = function(plrObj) {
	var a, obj;
	// Add players
	for(a = 0;a < plrObj.data.length;a++) {
		obj = plrObj.data[a];
		this.addPlayer(new GameData.classes.Player(obj.faction), obj.resref);
	}
};

/*
	method: evaluatePlayers
	Internal method to (re)evaluate the players, and acts appropriately
	This will give the player new indexes for the scenario, for example
*/
GameData.classes.Scenario.prototype.evaluatePlayers = function() {
	var a, plr;
	for(a = 0;a < this.players.list.length;a++) {
		plr = this.players.list[a];
		plr.index = a;
	}
};

/*
	method: startPlayerTurn(player)
	Internal method to start the given player's turn.
	Mostly used on Scenario.setupPlayers or Scenario.endTurn
*/
GameData.classes.Scenario.prototype.startPlayerTurn = function(player) {
	this.actingPlayer = player;
	player.acting = true;
	player.startTurn();
};

/*
	method: getActivePlayer
	Returns the currently acting player
*/
GameData.classes.Scenario.prototype.getActivePlayer = function() {
	return this.actingPlayer;
};
GameData.classes.Pathfinding_Node = function(x, y, parentNode) {
	this.x = x;
	this.y = y;
	this.parent = parentNode;
	this.baseCost = 0;
	this.terrainCost = 0;
	this.manhattanCost = 0;

	Object.defineProperties(this, {
		"finalCost": {
			get() {
				if(this.terrainCost === -1) {
					return -1;
				}
				return this.baseCost + this.terrainCost + this.manhattanCost;
			}
		}
	});
};
GameData.classes.Pathfinding_Node.prototype.constructor = GameData.classes.Pathfinding_Node;
GameData.classes.Pathfinder = function(currentX, currentY, targetX, targetY, unit, potentialPlaces) {
	this.unit = unit;
	this.map = this.unit.map;
	this.range = (this.unit.actionPoints);

	this.potentialPlaces = null;
	if(potentialPlaces) {
		this.potentialPlaces = potentialPlaces;
	}

	// Initialize nodes
	// this.nodes = [];
	// var a, placePos;
	// for(a = 0;a < this.map.map.width * this.map.map.height;a++) {
	// 	placePos = {
	// 		x: (a % this.map.map.width),
	// 		y: Math.floor(a / this.map.map.width)
	// 	};
	// 	this.addNode(placePos.x, placePos.y);
	// }
	this.open = [];
	this.closed = [];
	this.originNode = null;
	this.target = {
		x: targetX,
		y: targetY
	};
	this.foundTarget = false;

	this.startSearch(currentX, currentY);
};
GameData.classes.Pathfinder.prototype.constructor = GameData.classes.Pathfinder;

GameData.classes.Pathfinder.prototype.addNode = function(list, x, y, parent) {
	if(x < 0 || x > this.map.width ||
		y < 0 || y > this.map.height) {
		return null;
	}
	if(parent === undefined) {
		parent = null;
	}

	var obj = new GameData.classes.Pathfinding_Node(x, y, parent);

	// Set movement cost
	if(parent) {
		// Set base cost
		obj.baseCost = GameData.pathfinding.baseCosts.orthogonal;
		if(parent.x != obj.x && parent.y != obj.y) {
			obj.baseCost = GameData.pathfinding.baseCosts.diagonal;
		}
		// Set terrain cost
		obj.terrainCost = this.map.getMoveCost(x, y);
		// Set manhattan cost
		obj.manhattanCost = this.getDistanceBetween(
			{
				x: this.originNode.x,
				y: this.originNode.y
			}, {
				x: this.target.x,
				y: this.target.y
			}) * 10;
	}

	// Add to list
	list.push(obj);
	return obj;
};

GameData.classes.Pathfinder.prototype.addToClosed = function(node) {
	var openIndex = this.getNodeIndex(this.open, node.x, node.y);
	if(openIndex >= 0) {
		this.closed.push(node);
		this.open.splice(openIndex, 1);
		// Add to potential places
		if(this.potentialPlaces) {
			var a, getNode, canPlace = true;
			for(a = 0;a < this.potentialPlaces.length && canPlace;a++) {
				getNode = this.potentialPlaces[a];
				if(getNode.x == node.x && getNode.y == node.y) {
					canPlace = false;
				}
			}
			if(canPlace) {
				this.potentialPlaces.push(node);
			}
		}
	}
};

GameData.classes.Pathfinder.prototype.getDistanceBetween = function(first, second) {
	return Math.abs(second.x - first.x) + Math.abs(second.y - first.y);
};

/*
	method: getNode(list, x, y)
	Returns the node at the specified coordinates on the specified list
*/
GameData.classes.Pathfinder.prototype.getNode = function(list, x, y) {
	var a, node;
	for(a = 0;a < list.length;a++) {
		node = list[a];
		if(node.x == x && node.y == y) {
			return node;
		}
	}
	return null;
};

GameData.classes.Pathfinder.prototype.getNodeIndex = function(list, x, y) {
	var a, node;
	for(a = 0;a < list.length;a++) {
		node = list[a];
		if(node.x == x && node.y == y) {
			return a;
		}
	}
	return -1;
};

GameData.classes.Pathfinder.prototype.startSearch = function(originX, originY) {
	var node = this.addNode(this.open, originX, originY);
	this.originNode = node;
	this.addAdjacentNodes(node);
	this.addToClosed(node);

	node = this.getCheapestNode(this.open);
	if(node) {
		this.continueSearch(node);
	}
};

GameData.classes.Pathfinder.prototype.continueSearch = function(newNode) {
	this.addAdjacentNodes(newNode);
	this.addToClosed(newNode);
	// Check for end
	if(newNode.x == this.target.x && newNode.y == this.target.y) {
		this.endSearch(newNode);
		return true;
	}

	// Continue the search
	var adjNodes = this.getAdjacentNodes(newNode);
	var a, node = null;
	for(a = 0;a < adjNodes.length && !node;a++) {
		if(adjNodes[a].baseCost < newNode.baseCost) {
			node = adjNodes[a];
		}
	}

	if(node) {
		node.parent = newNode;
		this.continueSearch(node);
	}
	else if(adjNodes.length > 0) {
		node = this.getCheapestNode(adjNodes);
		this.continueSearch(node);
	}
	return false;
};

GameData.classes.Pathfinder.prototype.endSearch = function(endNode) {
	this.foundTarget = true;
};

GameData.classes.Pathfinder.prototype.addAdjacentNodes = function(centerNode) {
	var a, b, tempPos;
	for(a = -1;a <= 1;a++) {
		for(b = -1;b <= 1;b++) {
			tempPos = {
				x: centerNode.x + a,
				y: centerNode.y + b
			};
			if((tempPos.x >= this.originNode.x - this.range && tempPos.x <= this.originNode.x + this.range &&
				tempPos.y >= this.originNode.y - this.range && tempPos.y <= this.originNode.y + this.range) &&
				!this.getNode(this.open, tempPos.x, tempPos.y) && !this.getNode(this.closed, tempPos.x, tempPos.y)) {
				// Still check to see if the terrain cost of the new square would be -1(i.e. a wall)
				if(this.map.getMoveCost(tempPos.x, tempPos.y) >= 0) {
					this.addNode(this.open, tempPos.x, tempPos.y, centerNode);
				}
			}
		}
	}
};

GameData.classes.Pathfinder.prototype.getAdjacentNodes = function(centerNode) {
	var result = [], a, node;
	for(a = 0;a < this.open.length;a++) {
		node = this.open[a];
		if(node !== centerNode &&
			node.x >= centerNode.x-1 && node.x <= centerNode.x+1 &&
			node.y >= centerNode.y-1 && node.y <= centerNode.y-1) {
			result.push(node);
		}
	}
	return result;
};

GameData.classes.Pathfinder.prototype.getCheapestNode = function(list) {
	list.sort(function(a, b) {
		if(a.finalCost < b.finalCost) {
			return -1;
		}
		if(a.finalCost > b.finalCost) {
			return 1;
		}
		return 0;
	});
	return list[0];
};
GameData.classes.Player = function(faction) {
	this.units = {
		list: []
	},
	this.baseFaction = faction;
	this.index = 0;
	this.visible = true;
	this.acting = true;
};
GameData.classes.Player.prototype.constructor = GameData.classes.Player;

/*
	method: addUnit(unit)
	Adds an existing unit under this player's ownership
	WARNING: Does not remove it from another player's ownership, if any
*/
GameData.classes.Player.prototype.addUnit = function(unit) {
	this.units.list.push(unit);
};

/*
	method: startTurn
	Starts this player's turn
*/
GameData.classes.Player.prototype.startTurn = function() {
	// Renew this player's units' action points
	var a, unit;
	for(a = 0;a < this.units.list.length;a++) {
		unit = this.units.list[a];
		unit.actionPoints = unit.maxActionPoints;
	}
};
GameData.classes.Item = function(resref) {
	this.resref = resref;

	// Load config data
	this.baseItem = GameData.config.items.data[this.resref];

	this.name = this.baseItem.config.text[GameData.getLangRef()].name;
	this.slot = this.baseItem.config.slot;
	this.wielder = null;

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

	// Set stats
	this.stats = {
		attributes: merge({}, this.baseItem.config.attributes),
		properties: merge({}, this.baseItem.config.properties)
	}
};
GameData.classes.Item.prototype.constructor = GameData.classes.Item;
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
GameData.classes.Tile_Floor = function(tileset, tileX, tileY) {
	GameData.classes.Tile.call(this, tileset, tileX, tileY);
};
GameData.classes.Tile_Floor.prototype = Object.create(GameData.classes.Tile.prototype);
GameData.classes.Tile_Floor.prototype.constructor = GameData.classes.Tile_Floor;
GameData.classes.Tile_Wall = function(tileset, tileX, tileY) {
	GameData.classes.Tile.call(this, tileset, tileX, tileY);
};
GameData.classes.Tile_Wall.prototype = Object.create(GameData.classes.Tile.prototype);
GameData.classes.Tile_Wall.prototype.constructor = GameData.classes.Tile_Wall;
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
GameData.classes.Layer = function(map, width, height, depth) {
	// Extend Phaser.Sprite
	Phaser.Sprite.call(this, game);
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
GameData.classes.Layer.prototype = Object.create(Phaser.Sprite.prototype);
GameData.classes.Layer.prototype.constructor = GameData.classes.Layer;

/*
	method: clear
	Clears this layer of all its objects
*/
GameData.classes.Layer.prototype.Clear = function() {
	var obj;
	// Clear
	while(this.data.objects[0]) {
		obj = this.data.objects.splice(0, 1);
		obj.destroy();
	}

	// Refill with base stuff
	while(this.data.objects.length < this.width * this.height) {
		this.data.objects.push(null);
	}
};

/*
	method: getDataIndex(x, y)
	Returns the index of this layer's data for the given x and y position
*/
GameData.classes.Layer.prototype.getDataIndex = function(x, y) {
	return (x % this.data.width) + Math.floor(y * this.data.width);
};

/*
	method: getDataPos(index)
	Returns an object containing the x and y position(in tiles) of the given index
*/
GameData.classes.Layer.prototype.getDataPos = function(index) {
	return {
		x: (index % this.data.width),
		y: Math.floor(index / this.data.width)
	};
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
		this.data.objects[index] = object;
		object.x = (x * GameData.tile.width);
		object.y = (y * GameData.tile.height);
		object.map = this.data.map;
		object.layerDataIndex = index;
		this.addChild(object);
		return true;
	}
	return false;
};

/*
	method: moveObject(obj, x, y)
	Moves the specified object to the given x and y positions
*/
GameData.classes.Layer.prototype.moveObject = function(obj, x, y) {
	var prevIndex = obj.layerDataIndex,
		newIndex = this.getDataIndex(x, y);
	if(this.data.objects[newIndex] === null) {
		this.swapObjects(prevIndex, newIndex);
	}
};

/*
	method: swapObjects(firstIndex, secondIndex)
	Swaps the objects at the specified indexes, also adjusting their x and y values
*/
GameData.classes.Layer.prototype.swapObjects = function(firstIndex, secondIndex) {
	// Swap array items
	this.data.objects[firstIndex] = this.data.objects.splice(secondIndex, 1, this.data.objects[firstIndex])[0];

	// Adjust first object
	var posObj = this.getDataPos(secondIndex),
	    obj = this.data.objects[secondIndex];
	obj.x = (posObj.x * GameData.tile.width);
	obj.y = (posObj.y * GameData.tile.height);

	// Adjust second object
	var posObj = this.getDataPos(firstIndex),
	    obj = this.data.objects[firstIndex];
	obj.x = (posObj.x * GameData.tile.width);
	obj.y = (posObj.y * GameData.tile.height);
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
	// Images
	curList = sources.images;
	for(a = 0;a < curList.length;a++) {
		loadingFiles++;
		curAsset = curList[a];
		game.load.image(curAsset.key, curAsset.url);
	}

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

	// Parse factions
	cfg = game.cache.getJSON("configFactions");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.Faction(data);
	}
	game.cache.removeJSON("configFactions");

	// Parse units
	cfg = game.cache.getJSON("configUnits");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.BaseUnit(data);
	}
	game.cache.removeJSON("configUnits");

	// Parse effects
	cfg = game.cache.getJSON("configEffects");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.Effect(data);
	}
	game.cache.removeJSON("configEffects");

	// Parse abilities
	cfg = game.cache.getJSON("configAbilities");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.Ability(data);
	}
	game.cache.removeJSON("configAbilities");

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
	game.state.start("scenarioLoader", true, false, "assets/campaigns/test/scenario01");
};
var scenarioLoaderState = new Phaser.State();

scenarioLoaderState.init = function(scenarioFolder) {
	// Set up base stuff
	this.scenarioFolder = scenarioFolder + "/";
	this.mapsFolder = this.scenarioFolder + "maps/";
	this.settingsFolder = this.scenarioFolder + "config/";

	// Create scenario
	GameManager.game.scenario.current = new GameData.classes.Scenario();
	Object.defineProperty(this, "scenario", {get() {
		return GameManager.game.scenario.current;
	}});

	// Set up file list(to keep track of loaded files' keys)
	this.fileList = {
		maps: [],
		settings: []
	};
};

scenarioLoaderState.create = function() {
	this.loadFileList();
};

/*
	method: loadFileList
	Starts the loading of this scenario's file list, the base of the whole scenario
*/
scenarioLoaderState.loadFileList = function() {
	// Add callback
	game.load.onFileComplete.add(function loadProgress(progress, fileKey, success, totalLoadedFiles, totalFiles) {
		if(totalLoadedFiles >= totalFiles) {
			game.load.onFileComplete.remove(loadProgress, this);
			this.loadFiles();
		}
	}, this);

	// Load file
	game.load.json("scenario_fileList", this.scenarioFolder + "files.json");
	game.load.start();
}

/*
	method: loadFiles
	Starts the loading of the files that were on the scenario's file list
*/
scenarioLoaderState.loadFiles = function() {
	var a, curFile, curList, baseList = game.cache.getJSON("scenario_fileList"), key;

	// Load maps
	curList = baseList.maps;
	for(a = 0;a < curList.length;a++) {
		curFile = curList[a];
		key = GameData.scenario.prefixes.maps + curFile.key;
		this.fileList.maps.push(key);
		game.load.json(key, this.mapsFolder + curFile.filename + ".json");
	}

	// Load settings
	curList = baseList.settings;
	for(a = 0;a < curList.length;a++) {
		curFile = curList[a];
		key = GameData.scenario.prefixes.settings + curFile.key;
		this.fileList.settings.push({resref: key, type: curFile.type});
		game.load.json(key, this.settingsFolder + curFile.filename);
	}

	// Add callback
	game.load.onFileComplete.add(function loadProgress(progress, fileKey, success, totalLoadedFiles, totalFiles) {
		if(totalLoadedFiles >= totalFiles) {
			game.load.onFileComplete.remove(loadProgress, this);
			this.loadExtraFiles();
		}
	}, this);
};

/*
	method: loadExtraFiles
	Checks the files of this scenario's immediate file list, and loads additional stuff(like tilesets)
*/
scenarioLoaderState.loadExtraFiles = function() {
	var a, curObj, curList, tempKey;
	// Parse maps
	var map, b, ts, url;
	curList = this.fileList.maps;
	for(a = 0;a < curList.length;a++) {
		curObj = game.cache.getJSON(curList[a]);
		tempKey = curList[a].substring(GameData.scenario.prefixes.maps.length);
		map = new GameData.classes.Map(curObj, tempKey);
		this.scenario.addMap(map);
		// Load map's tilesets
		for(b = 0;b < map.map.tilesets.length;b++) {
			ts = map.map.tilesets[b];
			url = GameManager.loader.defaultLocations.tilesets + ts.config.image.match(/.*[\\\/]([\w]+\.[\w]+)/)[1];
			game.load.image(ts.resref, url);
		}
	}

	// Parse settings
	curList = this.fileList.settings;
	for(a = 0;a < curList.length;a++) {
		curObj = game.cache.getJSON(curList[a].resref);
		switch(curList[a].type) {
			case "playerList":
				this.scenario.setupPlayers(curObj);
				break;
		}
	}

	// Set callback
	game.load.onFileComplete.add(function loadProgress(progress, fileKey, success, totalLoadedFiles, totalFiles) {
		if(totalLoadedFiles >= totalFiles) {
			game.load.onFileComplete.remove(loadProgress, this);
			this.parseFiles();
		}
	}, this);
};

/*
	method: parseFiles
	Parses the scenario's files (like maps)
*/
scenarioLoaderState.parseFiles = function() {
	var a;
	// Parse maps
	var map;
	for(a = 0;a < this.scenario.maps.length;a++) {
		map = this.scenario.maps[a];
		map.parseBaseMap();
	}

	// Start the scenario
	this.startScenario();
};

/*
	method: startScenario
	Starts the scenario
*/
scenarioLoaderState.startScenario = function() {
	game.state.start("game", false, false);
};
var gameState = new Phaser.State();

gameState.create = function() {
	Object.defineProperty(this, "scenario", {get() {
		return GameManager.game.scenario.current;
	}});

	// Start scenario
	this.scenario.start();
};
var game = new Phaser.Game(960, 540, Phaser.AUTO, "content", null);

game.state.add("boot", bootState);
game.state.add("scenarioLoader", scenarioLoaderState);
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
	},
	game: {
		scenario: {
			current: null
		}
	},
	loader: {
		maps: {
			total: 0,
			loaded: 0
		},
		defaultLocations: {
			tilesets: "assets/gfx/tilesets/"
		}
	}
};
})(Phaser);