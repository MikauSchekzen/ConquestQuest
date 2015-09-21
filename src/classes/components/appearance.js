GameData.classes.Appearance = function(config) {
	GameData.config.appearances.data[config.resref] = this;
	this.resref = config.resref;

	// Set up prime data
	this.body = config.body;
};
GameData.classes.Appearance.prototype.constructor = GameData.classes.Appearance;

/*
	method: makeSprite
	Generates a sprite for this appearance based on its configuration
*/
GameData.classes.Appearance.prototype.makeSprite = function() {
	var bmd = game.add.bitmapData(32, 32);
	bmd.smoothed = false;
	var tempSpr;
	// Place body base
	tempSpr = game.make.sprite(16, 16, this.body.atlas, this.body.frame);
	tempSpr.anchor.set(0.25);
	bmd.draw(tempSpr);

	// Generate a proper texture
	bmd.generateTexture(this.spriteResRef);
	bmd.destroy();
};