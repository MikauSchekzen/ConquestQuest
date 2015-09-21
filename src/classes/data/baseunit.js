GameData.classes.BaseUnit = function(config) {
	GameData.config.units.data[config.resref] = this;
	this.config = config;
};
GameData.classes.BaseUnit.prototype.constructor = GameData.classes.BaseUnit;