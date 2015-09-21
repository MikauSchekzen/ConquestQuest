GameData.classes.BaseItem = function(config) {
	GameData.config.items.data[config.resref] = this;
	this.config = config;
};
GameData.classes.BaseItem.prototype.constructor = GameData.classes.BaseItem;