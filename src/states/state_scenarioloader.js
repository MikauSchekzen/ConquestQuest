var scenarioLoaderState = new Phaser.State();

scenarioLoaderState.init = function(scenarioFolder) {
	// Set up base stuff
	this.scenarioFolder = scenarioFolder + "/";
	this.mapsFolder = this.scenarioFolder + "maps/";
	this.settingsFolder = this.scenarioFolder + "config/";

	// Create scenario
	GameManager.game.scenario.current = new GameData.classes.Scenario();
	Object.defineProperty(this, "scenario", {get() {
		return GameManager.game.scenario.current;
	}});

	// Set up file list(to keep track of loaded files' keys)
	this.fileList = {
		maps: [],
		settings: []
	};
};

scenarioLoaderState.create = function() {
	this.loadFileList();
};

/*
	method: loadFileList
	Starts the loading of this scenario's file list, the base of the whole scenario
*/
scenarioLoaderState.loadFileList = function() {
	// Add callback
	game.load.onFileComplete.add(function loadProgress(progress, fileKey, success, totalLoadedFiles, totalFiles) {
		if(totalLoadedFiles >= totalFiles) {
			game.load.onFileComplete.remove(loadProgress, this);
			this.loadFiles();
		}
	}, this);

	// Load file
	game.load.json("scenario_fileList", this.scenarioFolder + "files.json");
	game.load.start();
}

/*
	method: loadFiles
	Starts the loading of the files that were on the scenario's file list
*/
scenarioLoaderState.loadFiles = function() {
	var a, curFile, curList, baseList = game.cache.getJSON("scenario_fileList"), key;

	// Load maps
	curList = baseList.maps;
	for(a = 0;a < curList.length;a++) {
		curFile = curList[a];
		key = GameData.scenario.prefixes.maps + curFile.key;
		this.fileList.maps.push(key);
		game.load.json(key, this.mapsFolder + curFile.filename + ".json");
	}

	// Load settings
	curList = baseList.settings;
	for(a = 0;a < curList.length;a++) {
		curFile = curList[a];
		key = GameData.scenario.prefixes.settings + curFile.key;
		this.fileList.settings.push({resref: key, type: curFile.type});
		game.load.json(key, this.settingsFolder + curFile.filename);
	}

	// Add callback
	game.load.onFileComplete.add(function loadProgress(progress, fileKey, success, totalLoadedFiles, totalFiles) {
		if(totalLoadedFiles >= totalFiles) {
			game.load.onFileComplete.remove(loadProgress, this);
			this.loadExtraFiles();
		}
	}, this);
};

/*
	method: loadExtraFiles
	Checks the files of this scenario's immediate file list, and loads additional stuff(like tilesets)
*/
scenarioLoaderState.loadExtraFiles = function() {
	var a, curObj, curList, tempKey;
	// Parse maps
	var map, b, ts, url;
	curList = this.fileList.maps;
	for(a = 0;a < curList.length;a++) {
		curObj = game.cache.getJSON(curList[a]);
		tempKey = curList[a].substring(GameData.scenario.prefixes.maps.length);
		map = new GameData.classes.Map(curObj, tempKey);
		this.scenario.addMap(map);
		// Load map's tilesets
		for(b = 0;b < map.map.tilesets.length;b++) {
			ts = map.map.tilesets[b];
			url = GameManager.loader.defaultLocations.tilesets + ts.config.image.match(/.*[\\\/]([\w]+\.[\w]+)/)[1];
			game.load.image(ts.resref, url);
		}
	}

	// Parse settings
	curList = this.fileList.settings;
	for(a = 0;a < curList.length;a++) {
		curObj = game.cache.getJSON(curList[a].resref);
		switch(curList[a].type) {
			case "playerList":
				this.scenario.setupPlayers(curObj);
				break;
		}
	}

	// Set callback
	game.load.onFileComplete.add(function loadProgress(progress, fileKey, success, totalLoadedFiles, totalFiles) {
		if(totalLoadedFiles >= totalFiles) {
			game.load.onFileComplete.remove(loadProgress, this);
			this.parseFiles();
		}
	}, this);
};

/*
	method: parseFiles
	Parses the scenario's files (like maps)
*/
scenarioLoaderState.parseFiles = function() {
	var a;
	// Parse maps
	var map;
	for(a = 0;a < this.scenario.maps.length;a++) {
		map = this.scenario.maps[a];
		map.parseBaseMap();
	}

	// Start the scenario
	this.startScenario();
};

/*
	method: startScenario
	Starts the scenario
*/
scenarioLoaderState.startScenario = function() {
	game.state.start("game", false, false);
};