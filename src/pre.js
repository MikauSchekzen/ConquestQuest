"use strict";

var GameData = {
	classes: {},
	config: {
		races: {
			data: {},
			exists: function(resref) {
				if(this.data[resref]) {
					return true;
				}
				return false;
			}
		},
		items: {
			data: {},
			exists: function(resref) {
				if(this.data[resref]) {
					return true;
				}
				return false;
			}
		},
		units: {
			data: {},
			exists: function(resref) {
				if(this.data[resref]) {
					return true;
				}
				return false;
			}
		}
	},
	getLangRef: function() {
		return "en";
	},
	tile: {
		width: 32,
		height: 32
	}
};