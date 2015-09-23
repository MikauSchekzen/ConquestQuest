GameData.classes.Layer = function(map, width, height, depth) {
	// Extend Phaser.Sprite
	Phaser.Sprite.call(this, game);
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
GameData.classes.Layer.prototype = Object.create(Phaser.Sprite.prototype);
GameData.classes.Layer.prototype.constructor = GameData.classes.Layer;

/*
	method: clear
	Clears this layer of all its objects
*/
GameData.classes.Layer.prototype.Clear = function() {
	var obj;
	// Clear
	while(this.data.objects[0]) {
		obj = this.data.objects.splice(0, 1);
		obj.destroy();
	}

	// Refill with base stuff
	while(this.data.objects.length < this.width * this.height) {
		this.data.objects.push(null);
	}
};

/*
	method: getDataIndex(x, y)
	Returns the index of this layer's data for the given x and y position
*/
GameData.classes.Layer.prototype.getDataIndex = function(x, y) {
	return (x % this.data.width) + Math.floor(y * this.data.width);
};

/*
	method: getDataPos(index)
	Returns an object containing the x and y position(in tiles) of the given index
*/
GameData.classes.Layer.prototype.getDataPos = function(index) {
	return {
		x: (index % this.data.width),
		y: Math.floor(index / this.data.width)
	};
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
		this.data.objects[index] = object;
		object.x = (x * GameData.tile.width);
		object.y = (y * GameData.tile.height);
		object.map = this.data.map;
		object.layerDataIndex = index;
		this.addChild(object);
		return true;
	}
	return false;
};

/*
	method: moveObject(obj, x, y)
	Moves the specified object to the given x and y positions
*/
GameData.classes.Layer.prototype.moveObject = function(obj, x, y) {
	var prevIndex = obj.layerDataIndex,
		newIndex = this.getDataIndex(x, y);
	if(this.data.objects[newIndex] === null) {
		this.swapObjects(prevIndex, newIndex);
	}
};

/*
	method: swapObjects(firstIndex, secondIndex)
	Swaps the objects at the specified indexes, also adjusting their x and y values
*/
GameData.classes.Layer.prototype.swapObjects = function(firstIndex, secondIndex) {
	// Swap array items
	this.data.objects[firstIndex] = this.data.objects.splice(secondIndex, 1, this.data.objects[firstIndex])[0];

	// Adjust first object
	var posObj = this.getDataPos(secondIndex),
	    obj = this.data.objects[secondIndex];
	obj.x = (posObj.x * GameData.tile.width);
	obj.y = (posObj.y * GameData.tile.height);

	// Adjust second object
	var posObj = this.getDataPos(firstIndex),
	    obj = this.data.objects[firstIndex];
	obj.x = (posObj.x * GameData.tile.width);
	obj.y = (posObj.y * GameData.tile.height);
};