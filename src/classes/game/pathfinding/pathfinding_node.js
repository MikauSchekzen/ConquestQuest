GameData.classes.Pathfinding_Node = function(x, y, unit, map, parentNode) {
	// Set base data
	this.x = x;
	this.y = y;
	this.unit = unit;
	this.map = map;

	// Set costs
	this.baseCost = 0;
	this.terrainCost = this.unit.getMoveCost(this.map, this.x, this.y);
	this.manhattanCost = 0;
	this.pathCost = 0;

	// Set additional data
	this.steps = 0;
	this.parent = null;
	if(parentNode) {
		this.setParent(parentNode);
	}

	// Is on the open list
	this.open = true;

	// Define properties
	Object.defineProperties(this, {
		"mixedCost": {
			get() {
				if(this.terrainCost === -1) {
					return -1;
				}
				return this.baseCost + this.terrainCost + this.manhattanCost;
			}
		},
		"finalCost": {
			get() {
				if(this.terrainCost === -1) {
					return -1;
				}
				return this.baseCost + this.terrainCost + this.manhattanCost + this.pathCost;
			}
		}
	});
};
GameData.classes.Pathfinding_Node.prototype.constructor = GameData.classes.Pathfinding_Node;

/*
	method: setParent(node)
	Sets this node's parent to another node, recalculating some things
*/
GameData.classes.Pathfinding_Node.prototype.setParent = function(node) {
	this.parent = node;

	// Add to step count
	this.steps = this.parent.steps + 1;

	// Recalculate base cost
	this.baseCost = this.parent.baseCost + this.terrainCost;
	// if(this.x == this.parent.x || this.y == this.parent.y) {
	// 	this.baseCost = this.parent.baseCost + GameData.pathfinding.baseCosts.orthogonal;
	// }
};