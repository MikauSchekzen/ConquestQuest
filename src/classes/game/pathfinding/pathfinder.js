GameData.classes.Pathfinder = function(currentX, currentY, targetX, targetY, unit, potentialPlaces) {
	this.unit = unit;
	this.map = this.unit.map;
	this.range = (this.unit.actionPoints);

	this.potentialPlaces = null;
	if(potentialPlaces) {
		this.potentialPlaces = potentialPlaces;
	}

	// Initialize nodes
	// this.nodes = [];
	// var a, placePos;
	// for(a = 0;a < this.map.map.width * this.map.map.height;a++) {
	// 	placePos = {
	// 		x: (a % this.map.map.width),
	// 		y: Math.floor(a / this.map.map.width)
	// 	};
	// 	this.addNode(placePos.x, placePos.y);
	// }
	this.open = [];
	this.closed = [];
	this.originNode = null;
	this.target = {
		x: targetX,
		y: targetY
	};
	this.foundTarget = false;

	this.startSearch(currentX, currentY);
};
GameData.classes.Pathfinder.prototype.constructor = GameData.classes.Pathfinder;

GameData.classes.Pathfinder.prototype.addNode = function(list, x, y, parent) {
	if(x < 0 || x > this.map.width ||
		y < 0 || y > this.map.height) {
		return null;
	}
	if(parent === undefined) {
		parent = null;
	}

	var obj = new GameData.classes.Pathfinding_Node(x, y, parent);

	// Set movement cost
	if(parent) {
		// Set base cost
		obj.baseCost = GameData.pathfinding.baseCosts.orthogonal;
		if(parent.x != obj.x && parent.y != obj.y) {
			obj.baseCost = GameData.pathfinding.baseCosts.diagonal;
		}
		// Set terrain cost
		obj.terrainCost = this.map.getMoveCost(x, y);
		// Set manhattan cost
		obj.manhattanCost = this.getDistanceBetween(
			{
				x: this.originNode.x,
				y: this.originNode.y
			}, {
				x: this.target.x,
				y: this.target.y
			}) * 10;
	}

	// Add to list
	list.push(obj);
	return obj;
};

GameData.classes.Pathfinder.prototype.addToClosed = function(node) {
	var openIndex = this.getNodeIndex(this.open, node.x, node.y);
	if(openIndex >= 0) {
		this.closed.push(node);
		this.open.splice(openIndex, 1);
		// Add to potential places
		if(this.potentialPlaces) {
			var a, getNode, canPlace = true;
			for(a = 0;a < this.potentialPlaces.length && canPlace;a++) {
				getNode = this.potentialPlaces[a];
				if(getNode.x == node.x && getNode.y == node.y) {
					canPlace = false;
				}
			}
			if(canPlace) {
				this.potentialPlaces.push(node);
			}
		}
	}
};

GameData.classes.Pathfinder.prototype.getDistanceBetween = function(first, second) {
	return Math.abs(second.x - first.x) + Math.abs(second.y - first.y);
};

/*
	method: getNode(list, x, y)
	Returns the node at the specified coordinates on the specified list
*/
GameData.classes.Pathfinder.prototype.getNode = function(list, x, y) {
	var a, node;
	for(a = 0;a < list.length;a++) {
		node = list[a];
		if(node.x == x && node.y == y) {
			return node;
		}
	}
	return null;
};

GameData.classes.Pathfinder.prototype.getNodeIndex = function(list, x, y) {
	var a, node;
	for(a = 0;a < list.length;a++) {
		node = list[a];
		if(node.x == x && node.y == y) {
			return a;
		}
	}
	return -1;
};

GameData.classes.Pathfinder.prototype.startSearch = function(originX, originY) {
	var node = this.addNode(this.open, originX, originY);
	this.originNode = node;
	this.addAdjacentNodes(node);
	this.addToClosed(node);

	node = this.getCheapestNode(this.open);
	if(node) {
		this.continueSearch(node);
	}
};

GameData.classes.Pathfinder.prototype.continueSearch = function(newNode) {
	this.addAdjacentNodes(newNode);
	this.addToClosed(newNode);
	// Check for end
	if(newNode.x == this.target.x && newNode.y == this.target.y) {
		this.endSearch(newNode);
		return true;
	}

	// Continue the search
	var adjNodes = this.getAdjacentNodes(newNode);
	var a, node = null;
	for(a = 0;a < adjNodes.length && !node;a++) {
		if(adjNodes[a].baseCost < newNode.baseCost) {
			node = adjNodes[a];
		}
	}

	if(node) {
		node.parent = newNode;
		this.continueSearch(node);
	}
	else if(adjNodes.length > 0) {
		node = this.getCheapestNode(adjNodes);
		this.continueSearch(node);
	}
	return false;
};

GameData.classes.Pathfinder.prototype.endSearch = function(endNode) {
	this.foundTarget = true;
};

GameData.classes.Pathfinder.prototype.addAdjacentNodes = function(centerNode) {
	var a, b, tempPos;
	for(a = -1;a <= 1;a++) {
		for(b = -1;b <= 1;b++) {
			tempPos = {
				x: centerNode.x + a,
				y: centerNode.y + b
			};
			if((tempPos.x >= this.originNode.x - this.range && tempPos.x <= this.originNode.x + this.range &&
				tempPos.y >= this.originNode.y - this.range && tempPos.y <= this.originNode.y + this.range) &&
				!this.getNode(this.open, tempPos.x, tempPos.y) && !this.getNode(this.closed, tempPos.x, tempPos.y)) {
				// Still check to see if the terrain cost of the new square would be -1(i.e. a wall)
				if(this.map.getMoveCost(tempPos.x, tempPos.y) >= 0) {
					this.addNode(this.open, tempPos.x, tempPos.y, centerNode);
				}
			}
		}
	}
};

GameData.classes.Pathfinder.prototype.getAdjacentNodes = function(centerNode) {
	var result = [], a, node;
	for(a = 0;a < this.open.length;a++) {
		node = this.open[a];
		if(node !== centerNode &&
			node.x >= centerNode.x-1 && node.x <= centerNode.x+1 &&
			node.y >= centerNode.y-1 && node.y <= centerNode.y-1) {
			result.push(node);
		}
	}
	return result;
};

GameData.classes.Pathfinder.prototype.getCheapestNode = function(list) {
	list.sort(function(a, b) {
		if(a.finalCost < b.finalCost) {
			return -1;
		}
		if(a.finalCost > b.finalCost) {
			return 1;
		}
		return 0;
	});
	return list[0];
};