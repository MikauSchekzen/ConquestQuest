var gameState = new Phaser.State();

gameState.create = function() {
	var mapData = game.cache.getJSON("map");
	var map = new GameData.classes.Map(mapData);
	if(map) {
		map.spawnUnit(2, 3, "berserker");
		map.spawnUnit(3, 3, "elven_mage");
		map.spawnUnit(4, 5, "footman");
		map.spawnUnit(5, 5, "footman");
	}
};