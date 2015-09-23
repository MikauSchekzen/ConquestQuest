var gameState = new Phaser.State();

gameState.create = function() {
	Object.defineProperty(this, "scenario", {get() {
		return GameManager.game.scenario.current;
	}});

	// Start scenario
	this.scenario.start();
};