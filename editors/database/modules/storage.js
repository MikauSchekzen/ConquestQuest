var Storage = {
	dbObj: null,

	get contentElement() {
		return document.getElementById("content");
	},
	get dbList() {
		var elem = document.getElementById("dbList");
		if(elem) {
			return elem;
		}
		return null;
	},

	createDbList: function() {
		var elem = document.createElement("select");
		elem.id = "dbList";
		elem.size = 15;
		elem.addEventListener("change", function() {
			Storage.selectDbListElem();
		});
		this.contentElement.appendChild(elem);

		// Add default element
		var newElem = document.createElement("option");
		newElem.value = "";
		newElem.innerHTML = "----------";
		newElem.disabled = true;
		newElem.selected = true;
		newElem.style.display = "none";
		elem.appendChild(newElem);
	},

	selectDbListElem: function() {
		var baseElem = this.dbList;
		switch(Sidebar.currentPage) {
			case Sidebar.RACES:
			Races.selectRace(baseElem.value);
			break;
		}
	},
	getObjByResRef: function(resref) {
		var a, obj;
		for(a = 0;a < this.dbObj.data.length;a++) {
			obj = this.dbObj.data[a];
			if(obj.resref == resref) {
				return obj;
			}
		}
		return null;
	},

	clearContent: function() {
		var elem = document.getElementById("content");
		if(elem) {
			while(elem.firstChild) {
				elem.removeChild(elem.firstChild);
			}
		}
	}
};