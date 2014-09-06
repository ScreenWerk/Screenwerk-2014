var util    = require("util")

function SwElements() {
	this.by_eid = {}
}

SwElements.prototype.register = function(options, data) {
	var eid = options.entity_id
	var definition = options.definition
	console.log('Registering ' + util.inspect(options))
	var element = {'id': eid}
	element.definition = definition
	element.properties = {}
	element.parents = {}
	element.childs = {}

	for (var property in data.properties) {
		element.properties[property] = {}
		if (typeof data.properties[property].values === 'undefined') {
			// console.log(util.inspect(data.properties[property]))
			continue
		}
		var values = data.properties[property].values
		element.properties[property].values = []
		var multiplicity = data.properties[property].multiplicity
		var i = 0
		for (var key in values) { // register only up to 'multiplicity' latest values
			if (i === multiplicity)
				break
			element.properties[property].values[i] = values[values.length - key - 1].db_value
			i++
		}
	}
	// element.data = data
	// Validators
	switch (definition) {
		case 'sw-screen':
			// element.data = new SwScreen(data)
		break;
		case 'sw-screen-group':
			// element.data = new SwScreenGroup(data)
		break;
		case 'sw-configuration':
			// element.data = new SwConfiguration(data)
		break;
		case 'sw-schedule':
			if (element.properties.crontab.values === undefined) {
				console.error('Schedule ' + element.id + ' without crontab. rescheduling to midnight, February 30, Sunday')
				element.properties.crontab.values = ['0 0 30 2 0'] // Midnight, February 30, Sunday
			}
			if (element.properties.cleanup.values === undefined) {
				element.properties.cleanup.values = ['0']
			}
			if (element.properties.ordinal.values === undefined) {
				element.properties.ordinal.values = ['0']
			}
		break;
		case 'sw-layout':
			// element.data = new SwLayout(data)
		break;
		case 'sw-layout-playlist':
			// element.data = new SwLayoutPlaylist(data)
		break;
		case 'sw-playlist':
			// element.data = new SwPlaylist(data)
		break;
		case 'sw-playlist-media':
			// element.data = new SwPlaylistMedia(data)
		break;
		case 'sw-media':
			// element.data = new SwMedia(data)
		break;
	}

	this.by_eid[eid] = element
	if (typeof options.relatives !== 'undefined') {
		// console.log(util.inspect(options.relatives))
		for (relative in options.relatives) {
			var relative_eid = options.relatives[relative]
			// console.log(relative)
			var tick = 0
			var max_ticks = 10000000
			while (typeof this.by_eid[relative_eid] === 'undefined' && tick < max_ticks)
				tick++
			if (tick > 0)
				console.log('Waited ' + tick + ' ticks for entity ' + relative_eid + ' to appear')
			if (typeof this.by_eid[relative_eid] !== 'undefined')
				this.relate(relative, relative_eid, eid)
			else
				console.log('Entity ' + relative_eid + ' didnot appeared in time.')
		}
	}
}



SwElements.prototype.relate = function(relationship, left_eid, right_eid) {
	switch(relationship) {
		case 'parent':
			this.by_eid[right_eid].parents[left_eid] = this.by_eid[left_eid]
			this.by_eid[left_eid].childs[right_eid] = this.by_eid[right_eid]
		break
		case 'previous':
			console.log('prev: ' + left_eid + ', next: ' + right_eid)
			this.by_eid[right_eid].previous = this.by_eid[left_eid]
			this.by_eid[left_eid].next = this.by_eid[right_eid]
		break
	}
}



exports.SwElements = SwElements