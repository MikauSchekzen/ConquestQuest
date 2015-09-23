var GameManager = {
	audio: {
		volume: {
			sfx: 0.75,
			bgm: 0.5
		},
		bgm: null,

		CHANNEL_SFX: 0,
		CHANNEL_BGM: 1,

		getChannelResRef: function(channel) {
			switch(channel) {
				default:
				case this.CHANNEL_SFX:
				return "sfx";
				break;
				case this.CHANNEL_BGM:
				return "bgm";
				break;
			}
		},
		play: function(key, loop, channel) {
			// Set default parameters
			if(loop === undefined) {
				loop = false;
			}
			if(channel === undefined) {
				channel = this.CHANNEL_SFX;
			}

			// Play sound
			return game.sound.play(key, this.volume[this.getChannelResRef(channel)], loop);
		},
		playBGM: function(key) {
			return this.bgm = this.play(key, true, this.CHANNEL_BGM);
		},
		stopBGM: function() {
			if(this.bgm) {
				this.bgm.stop();
				this.bgm = null;
			}
		}
	},
	game: {
		scenario: {
			current: null
		}
	},
	loader: {
		maps: {
			total: 0,
			loaded: 0
		},
		defaultLocations: {
			tilesets: "assets/gfx/tilesets/"
		}
	}
};