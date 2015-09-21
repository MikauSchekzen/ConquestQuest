GameData.classes.GUI = function(x, y) {
	Phaser.Group.call(this, game);
	game.add.existing(this);

	Object.defineProperty(this, "state", {get() {
		return game.state.getCurrentState();
	}});

	this.x = x;
	this.y = y;
};
GameData.classes.GUI.prototype = Object.create(Phaser.Group.prototype);
GameData.classes.GUI.prototype.constructor = GameData.classes.GUI;