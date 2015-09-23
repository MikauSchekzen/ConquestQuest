GameData.classes.Effect = function(config) {
	// Add to database
	this.config = config;
	this.resref = this.config.resref;
	GameData.config.effects.data[this.resref] = this;
};
GameData.classes.Effect.prototype.constructor = GameData.classes.Effect;