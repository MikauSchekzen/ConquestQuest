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