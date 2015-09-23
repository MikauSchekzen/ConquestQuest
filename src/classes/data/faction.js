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