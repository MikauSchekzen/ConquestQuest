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