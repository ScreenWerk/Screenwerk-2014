var util    = require("util")

function SwPlayer(screen_id) {
	this.screen_id = screen_id
}

SwPlayer.prototype.restart = function(elements) {
	if (typeof elements !== 'undefined')
		this.elements = elements
	if (typeof elements === 'undefined'){
		throw new Error('Nothing to play with!')
	}
	console.log('Starting ScreenWerk player for screen ' + this.screen_id)
}


exports.SwPlayer = SwPlayer
