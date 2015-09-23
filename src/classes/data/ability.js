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