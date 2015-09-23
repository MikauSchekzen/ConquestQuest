GameData.classes.Pathfinding_Node = function(x, y, parentNode) {
	this.x = x;
	this.y = y;
	this.parent = parentNode;
	this.baseCost = 0;
	this.terrainCost = 0;
	this.manhattanCost = 0;

	Object.defineProperties(this, {
		"finalCost": {
			get() {
				if(this.terrainCost === -1) {
					return -1;
				}
				return this.baseCost + this.terrainCost + this.manhattanCost;
			}
		}
	});
};
GameData.classes.Pathfinding_Node.prototype.constructor = GameData.classes.Pathfinding_Node;