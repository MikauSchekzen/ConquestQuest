GameData.classes.Item = function(resref) {
	this.resref = resref;

	// Load config data
	this.baseItem = GameData.config.items.data[this.resref];

	this.name = this.baseItem.config.text[GameData.getLangRef()].name;
	this.slot = this.baseItem.config.slot;
	this.wielder = null;

	// Set appearance
	this.appearance = {
		atlas: this.baseItem.config.appearance.atlas,
		frame: this.baseItem.config.appearance.frame,
		depth: this.baseItem.config.appearance.depth,
		offset: {
			x: 0,
			y: 0
		}
	};
	if(this.baseItem.config.appearance.offset) {
		this.appearance.offset.x = this.baseItem.config.appearance.offset.x;
		this.appearance.offset.y = this.baseItem.config.appearance.offset.y;
	}

	// Set stats
	this.stats = {
		attributes: merge({}, this.baseItem.config.attributes),
		properties: merge({}, this.baseItem.config.properties)
	}
};
GameData.classes.Item.prototype.constructor = GameData.classes.Item;