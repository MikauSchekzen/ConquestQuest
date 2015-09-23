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