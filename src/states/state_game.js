var gameState = new Phaser.State();

gameState.create = function() {
	var unit = new GameData.classes.Unit("footman");

	var unit2 = new GameData.classes.Unit("berserker");
	unit2.x = 64;
};