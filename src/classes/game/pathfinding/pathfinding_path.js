GameData.classes.Pathfinder_Path = function(toObj, owner, maxRange) {
	if(maxRange === undefined) {
		maxRange = -1;
	}
	this.maxRange = maxRange;
	// Set basic data
	this.owner = owner;
	this.originNode = null;
	this.finalNode = null;
	this.finished = false;
	this.greedy = false;

	this.target = {
		x: toObj.x,
		y: toObj.y
	};

	// Create lists: open, closed and nodes
	// nodes will contain ALL the nodes
	this.open = [];
	this.closed = [];
	var arr;
	this.nodes = [];
	while(this.nodes.length < this.owner.map.width) {
		arr = [];
		while(arr.length < this.owner.map.height) {
			arr.push(null);
		}
		this.nodes.push(arr);
	}

	// Start the search
	this.startSearch();
};
GameData.classes.Pathfinder_Path.prototype.constructor = GameData.classes.Pathfinder_Path;

/*
	method: addNode
	Adds a node to this path
*/
GameData.classes.Pathfinder_Path.prototype.addNode = function(list, x, y, parent) {
	// Determine parameters
	if(parent === undefined) {
		parent = null;
	}

	// Only if within range
	if((parent && this.maxRange !== -1 && parent.steps < this.maxRange) || this.maxRange === -1 || !parent) {
		var obj = new GameData.classes.Pathfinding_Node(x, y, this.owner.unit, this.owner.unit.map, parent);

		// Set movement cost
		if(parent) {
			// Set manhattan cost
			obj.manhattanCost = this.owner.getDistanceBetween(
				{
					x: obj.x,
					y: obj.y
				}, {
					x: this.target.x,
					y: this.target.y
				});
		}

		// Add to list
		list.push(obj);
		this.nodes[x][y] = obj;
		return obj;
	}
	return null;
};

/*
	method: addToClosed
	Transfers a node from the open list to the closed list
*/
GameData.classes.Pathfinder_Path.prototype.addToClosed = function(node) {
	var openIndex = this.getNodeIndex(this.open, node.x, node.y);
	if(openIndex >= 0) {
		this.closed.push(node);
		this.open.splice(openIndex, 1);
		node.open = false;
	}
};

/*
	method: addToOpen
	Like addToClosed, except it goes the other way around
*/
GameData.classes.Pathfinder_Path.prototype.addToOpen = function(node) {
	var closedIndex = this.getNodeIndex(this.closed, node.x, node.y);
	if(closedIndex >= 0) {
		this.open.push(node);
		this.closed.splice(closedIndex, 1);
		node.open = true;
	}
};

/*
	method: getListNode(list, x, y)
	Returns the node at the specified coordinates on the specified list
*/
GameData.classes.Pathfinder_Path.prototype.getListNode = function(list, x, y) {
	var a, node;
	for(a = 0;a < list.length;a++) {
		node = list[a];
		if(node.x == x && node.y == y) {
			return node;
		}
	}
	return null;
};

/*
	method: getNode(x, y)
	Gets the node at the specified coordinates of the map
	Returns null if no node exists there (yet)
*/
GameData.classes.Pathfinder_Path.prototype.getNode = function(x, y) {
	return this.nodes[x][y];
};

/*
	method: getNodeIndex(list, x, y)
	Returns the index of the node in the specified list, or -1
	if no node was found on that list
*/
GameData.classes.Pathfinder_Path.prototype.getNodeIndex = function(list, x, y) {
	var a, node;
	for(a = 0;a < list.length;a++) {
		node = list[a];
		if(node.x == x && node.y == y) {
			return a;
		}
	}
	return -1;
};

/*
	method: startSearch
	Starts a search from this path's origin
*/
GameData.classes.Pathfinder_Path.prototype.startSearch = function() {
	var node = this.addNode(this.open, this.owner.origin.x, this.owner.origin.y);
	this.originNode = node;
	this.addAdjacentNodes(node);
	this.addToClosed(node);

	node = this.getCheapestNode(this.open);
	if(node) {
		this.continueSearch(node);
	}
	else {
		this.endSearch(node);
	}
};

/*
	method: continueSearch(newNode)
	Continues the search for the target, starting at newNode
*/
GameData.classes.Pathfinder_Path.prototype.continueSearch = function(newNode) {
	this.addAdjacentNodes(newNode);
	this.addToClosed(newNode);
	// Check for end
	if(newNode.x == this.target.x && newNode.y == this.target.y) {
		this.endSearch(newNode);
		return true;
	}

	// Continue the search
	var adjNodes = this.getAdjacentNodes(newNode);
	var a, node = newNode;
	// Get lowest base cost node
	for(a = 0;a < adjNodes.length;a++) {
		if(adjNodes[a].baseCost < newNode.baseCost) {
			node = adjNodes[a];
		}
	}

	// if(node !== newNode) {
	// 	// node.setParent(newNode);
	// 	this.continueSearch(node);
	// }
	if(adjNodes.length > 0) {
		node = this.getCheapestNode(adjNodes);
		this.continueSearch(node);
	}
	else {
		if(this.greedy) {
			return true;
		}
		else if(newNode.parent) {
			// Go back one step and try again
			var prevNode = newNode.parent;
			this.addToOpen(prevNode);
			this.continueSearch(prevNode);
		}
		else {
			this.endSearch(this.originNode);
		}
	}
	return false;
};

/*
	method: endSearch(endNode)
	Marks the end of the search, and the final node
*/
GameData.classes.Pathfinder_Path.prototype.endSearch = function(endNode) {
	this.finished = true;
	this.finalNode = endNode;
};

/*
	method: addAdjacentNodes(centerNode)
	Adds adjacent nodes to the center node
*/
GameData.classes.Pathfinder_Path.prototype.addAdjacentNodes = function(centerNode) {
	var a, b, tempPos;
	for(a = -1;a <= 1;a++) {
		for(b = -1;b <= 1;b++) {
			tempPos = {
				x: centerNode.x + a,
				y: centerNode.y + b
			};
			if(tempPos.x >= 0 && tempPos.x < this.nodes.length &&
				tempPos.y >= 0 && tempPos.y < this.nodes[0].length) {
				if(!this.getNode(tempPos.x, tempPos.y)) {
					// Still check to see if the terrain cost of the new square would be -1(i.e. a wall)
					if(this.owner.map.getMoveCost(tempPos.x, tempPos.y) >= 0) {
						this.addNode(this.open, tempPos.x, tempPos.y, centerNode);
					}
				}
			}
		}
	}
};

/*
	method: getAdjacentNodes(centerNode)
	Returns an array containing the nodes on the open list and
	adjacent to centerNode
*/
GameData.classes.Pathfinder_Path.prototype.getAdjacentNodes = function(centerNode) {
	var result = [], a, node;
	for(a = 0;a < this.open.length;a++) {
		node = this.open[a];
		if(node !== centerNode &&
			node.x >= centerNode.x-1 && node.x <= centerNode.x+1 &&
			node.y >= centerNode.y-1 && node.y <= centerNode.y+1) {
			result.push(node);
		}
	}
	return result;
};

/*
	method: getCheapestNode(list)
	Returns the cheapest node on the specified list
*/
GameData.classes.Pathfinder_Path.prototype.getCheapestNode = function(list) {
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