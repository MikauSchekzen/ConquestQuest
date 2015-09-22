GameData.classes.Layer = function(map, width, height, depth) {
	// Extend Phaser.Group
	Phaser.Group.call(this, game);
	// Add to update cycle
	game.add.existing(this);

	// Set up initial data
	// Basic data
	this.data = {
		objects: [],
		width: width,
		height: height,
		map: map
	};
	this.depth = depth;

	// Fill in basic data
	var a;
	for(a = 0;a < this.width * this.height;a++) {
		this.data.objects.push(null);
	}
};
GameData.classes.Layer.prototype = Object.create(Phaser.Group.prototype);
GameData.classes.Layer.prototype.constructor = GameData.classes.Layer;

/*
	method: getDataIndex(x, y)
	Returns the index of this layer's data for the given x and y position
*/
GameData.classes.Layer.prototype.getDataIndex = function(x, y) {
	return (x % this.data.width) + Math.floor(x / this.data.width);
};

/*
	method: getObjectAt(x, y)
	Returns the object at the specified position
*/
GameData.classes.Layer.prototype.getObjectAt = function(x, y) {
	return this.data.objects[this.getDataIndex(x, y)];
};

/*
	method: placeObject(x, y, object, force)
	Places an object at the specified x and y position of the layer
	'force' specifies whether the action should still go thorugh
	 despite an object already being there on this layer,
	 calling remove() on the old object(if any)
	 Defaults to false
	Returns whether successful
*/
GameData.classes.Layer.prototype.placeObject = function(x, y, object, force) {
	// Set default parameters
	if(force === undefined) {
		force = false;
	}
	if(!object) {
		return false;
	}

	// Get old object
	var oldObj = this.getObjectAt(x, y);
	if(oldObj) {
		if(force && oldObj.remove) {
			oldObj.remove();
			oldObj = null;
		}
	}

	// Place new object
	if(!oldObj) {
		var index = this.getDataIndex(x, y);
		this.data[index] = object;
		object.x = (x * GameData.tile.width);
		object.y = (y * GameData.tile.height);
		return true;
	}
	return false;
};