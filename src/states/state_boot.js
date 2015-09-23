var bootState = new Phaser.State();

/*
	method: create
	Starts the asset loading
*/
bootState.create = function() {
	// Add callback to load complete
	game.load.onFileComplete.add(function loadProgress(progress, fileKey, success, totalLoadedFiles, totalFiles) {
		if (totalLoadedFiles >= totalFiles) {
			game.load.onFileComplete.remove(loadProgress, this);
			this.loadAssets();
		}
	}, this);

	// Load asset
	game.load.json("assetSources", "assets/sources.json");

	// Start loading
	game.load.start();
};

/*
	method: loadAssets
	Loads the assets for the game
*/
bootState.loadAssets = function() {
	var sources = game.cache.getJSON("assetSources"),
		a, curList, curAsset, loadingFiles = 0;

	// Preload assets
	// Images
	curList = sources.images;
	for(a = 0;a < curList.length;a++) {
		loadingFiles++;
		curAsset = curList[a];
		game.load.image(curAsset.key, curAsset.url);
	}

	// Sprite atlases
	curList = sources.atlases;
	for(a = 0;a < curList.length;a++) {
		loadingFiles++;
		curAsset = curList[a];
		game.load.atlasJSONArray(curAsset.key, curAsset.url.base + curAsset.url.image, curAsset.url.base + curAsset.url.config);
	}

	// JSON files
	curList = sources.json;
	for(a = 0;a < curList.length;a++) {
		loadingFiles++;
		curAsset = curList[a];
		game.load.json(curAsset.key, curAsset.url);
	}

	// Audio
	curList = sources.audio;
	for(a = 0;a < curList.length;a++) {
		loadingFiles++;
		curAsset = curList[a];
		game.load.audio(curAsset.key, curAsset.url);
	}


	// Add callback for loading files
	if(loadingFiles > 0) {
		game.load.onFileComplete.add(function loadProgress(progress, fileKey, success, totalLoadedFiles, totalFiles) {
			if(totalLoadedFiles >= totalFiles) {
				game.load.onFileComplete.remove(loadProgress, this);
				this.parseConfigs();
			}
		}, this);
	}
	// ...or not
	else {
		this.parseConfigs();
	}
};

/*
	method: parseConfigs
	Parses the configuration files
*/
bootState.parseConfigs = function() {
	var cfg, a, data, obj;

	// Parse races
	cfg = game.cache.getJSON("configRaces");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.Race(data);
	}
	game.cache.removeJSON("configRaces");

	// Parse items
	cfg = game.cache.getJSON("configItems");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.BaseItem(data);
	}
	game.cache.removeJSON("configItems");

	// Parse factions
	cfg = game.cache.getJSON("configFactions");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.Faction(data);
	}
	game.cache.removeJSON("configFactions");

	// Parse units
	cfg = game.cache.getJSON("configUnits");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.BaseUnit(data);
	}
	game.cache.removeJSON("configUnits");

	// Parse effects
	cfg = game.cache.getJSON("configEffects");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.Effect(data);
	}
	game.cache.removeJSON("configEffects");

	// Parse abilities
	cfg = game.cache.getJSON("configAbilities");
	for(a = 0;a < cfg.data.length;a++) {
		data = cfg.data[a];
		obj = new GameData.classes.Ability(data);
	}
	game.cache.removeJSON("configAbilities");

	// Start next state
	this.nextState();
};

/*
	method: nextState
	Starts the next state(will be menu, for now is game)
*/
bootState.nextState = function() {
	// Delete source list from cache
	game.cache.removeJSON("assetSources");

	// Go to next state
	game.state.start("scenarioLoader", true, false, "assets/campaigns/test/scenario01");
};