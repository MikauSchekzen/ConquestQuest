GameData.classes.Race = function(config) {
	GameData.config.races.data[config.resref] = this;
	this.config = config;
};
GameData.classes.Race.prototype.constructor = GameData.classes.Race;