var Sidebar = {
	open: function(elem) {
		if(this.currentPage != elem) {
			switch(elem) {
				case this.RACES:
				this.loadJSON("../../config/races.json", function(response) {
					if(Storage) {
						Storage.dbObj = JSON.parse(response);
						this.openRaces();
					}
				}, this);
				break;
			}
		}
	},

	currentPage: -1,
	get currentDbObj() {
		if(Storage) {
			return Storage.dbObj;
		}
		return null;
	},
	RACES: 0,

	clearContent: function() {
		var elem = document.getElementById("content");
		if(elem) {
			while(elem.firstChild) {
				elem.removeChild(elem.firstChild);
			}
		}
	},
	openRaces: function() {
		console.log(this.currentDbObj);
	},

	loadJSON: function(source, callback, callbackContext) {
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open("GET", source, true);
		xobj.onreadystatechange = function() {
			if(xobj.readyState === 4) {
				callback.call(callbackContext, xobj.responseText);
			}
		};
		xobj.send(null);
	}
}