var Races = {
	create: function() {
		// Clear content
		Storage.clearContent();

		// Create race list
		var a, race, elem;
		Storage.createDbList();
		for(a = 0;a < this.raceList.length;a++) {
			race = this.raceList[a];
			elem = document.createElement("option");
			elem.value = race.resref;
			elem.innerHTML = race.text.en.plural;
			Storage.dbList.appendChild(elem);
		}

		// Create text properties
		// Create dev
		var baseElem = document.createElement("div"), elem;
		baseElem.id = "raceText";
		Storage.contentElement.appendChild(baseElem);
		// Create noun
		baseElem.innerHTML += "Noun: ";
		elem = document.createElement("input");
		elem.id = "raceText_noun";
		baseElem.appendChild(elem);
		// Create plural
		baseElem.innerHTML += "Plural: ";
		elem = document.createElement("input");
		elem.id = "raceText_plural";
		baseElem.appendChild(elem);
		// Create adjective
		baseElem.innerHTML += "Adjective: ";
		elem = document.createElement("input");
		elem.id = "raceText_adjective";
		baseElem.appendChild(elem);
	},
	currentObj: null,

	template: {
		resref: "",
		text: {
			en: {
				noun: "",
				plural: "",
				adjective: ""
			}
		},
		equipmentSlots: [

		],
		body: {
			male: {
				atlas: "",
				frame: ""
			},
			female: {
				atlas: "",
				frame: ""
			}
		}
	},

	selectRace: function(resref) {
		this.currentObj = Storage.getObjByResRef(resref);
		this.refresh();
	},

	refresh: function() {
		// Update text elements
		// Update noun
		var elem = document.getElementById("raceText_noun");
		elem.value = this.currentObj.text.en.noun;
		// Update plural
		var elem = document.getElementById("raceText_plural");
		elem.value = this.currentObj.text.en.plural;
		// Update adjective
		var elem = document.getElementById("raceText_adjective");
		elem.value = this.currentObj.text.en.adjective;
	},

	get raceList() {
		return Storage.dbObj.data;
	}
};