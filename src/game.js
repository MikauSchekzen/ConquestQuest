var game = new Phaser.Game(960, 540, Phaser.AUTO, "content", null);

game.state.add("boot", bootState);
game.state.add("scenarioLoader", scenarioLoaderState);
game.state.add("game", gameState);
game.state.start("boot");