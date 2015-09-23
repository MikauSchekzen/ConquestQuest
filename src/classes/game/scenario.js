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