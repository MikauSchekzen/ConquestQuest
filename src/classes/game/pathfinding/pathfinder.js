GameData.classes.Pathfinder = function(currentX, currentY, unit, options) {
	// Check parameters
	if(options === undefined) {
		options = {};
	}

	// Set stuff
	this.unit = unit;
	this.map = this.unit.map;

	// Set options
	// Set range
	this.range = {min: -1, max: -1};
	if(options.maxRange) {
		this.range.max = options.maxRange;
	}
	if(options.minRange) {
		this.range.min = options.minRange;
	}

	// Initialize paths
	this.paths = [];

	// Initialize additional data
	this.origin = {
		x: currentX,
		y: currentY
	};
};
GameData.classes.Pathfinder.prototype.constructor = GameData.classes.Pathfinder;

GameData.classes.Pathfinder.prototype.addPath = function(targetX, targetY, maxRange) {
	// Only if the target square is even accessible
	if(this.unit.canAccessTile(this.map, targetX, targetY)) {
		var path = new GameData.classes.Pathfinder_Path({x: targetX, y: targetY}, this, maxRange);
		this.paths.push(path);
	}
};

/*
	method: getDistanceBetween(first, second)
	Returns the (manhattan) distance between two nodes
*/
GameData.classes.Pathfinder.prototype.getDistanceBetween = function(first, second) {
	return Math.abs(second.x - first.x) + Math.abs(second.y - first.y);
};

/*
	method: getConsolidatedNodes
	Returns a list of all the uniquely-positioned nodes (in the closed list of their path)
*/
GameData.classes.Pathfinder.prototype.getConsolidatedNodes = function() {
	var list = [], a, b, c, matched, path, node, checkNode;
	for(a = 0;a < this.paths.length;a++) {
		path = this.paths[a];
		for(b = 0;b < path.closed.length;b++) {
			node = path.closed[b];
			matched = false;
			for(c = 0;c < list.length && !matched;c++) {
				checkNode = list[c];
				if(checkNode.x == node.x && checkNode.y == node.y) {
					matched = true;
				}
			}
			if(!matched) {
				list.push(node);
			}
		}
	}
	return list;
};

/*
	method: getPotentialSquares(minRange, maxRange)
	Returns a list of the potential squares, considering minRange and maxRange
*/
GameData.classes.Pathfinder.prototype.getPotentialSquares = function() {
	var a, b;
	for(a = 0;a < this.map.width;a++) {
		for(b = 0;b < this.map.height;b++) {
			this.addPath(a, b, this.range.max);
		}
	}
};