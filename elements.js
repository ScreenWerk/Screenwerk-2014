var util    = require("util")

function SwElements() {
	this.by_eid = {}
}

SwElements.prototype.register = function(eid, definition, data) {
	console.log('Registering ' + definition + ' eid ' + eid)
	var element = {}
	element.definition = definition
	element.properties = {}

	for (var property in data.properties) {
		element.properties[property] = {}
		if (typeof data.properties[property].values === 'undefined') {
			console.log(util.inspect(data.properties[property]))
			continue
		}
		// if (data.properties[property].values.length > 1) {
		// }
		var values = data.properties[property].values
		console.log ('Found ' + values.length + ' values to ' + property)
		// values.splice(- data.properties[property].multiplicity)
		element.properties[property].values = []
		var multiplicity = data.properties[property].multiplicity
		console.log ('Max ' + multiplicity + ' values for ' + property)
		var i = 0
		for (var key in values) {
			if (i === multiplicity)
				break
			element.properties[property].values[i] = values[key].db_value
			i++
		}
		console.log ('Added ' + element.properties[property].values.length + ' values to ' + property)
	}

	switch(definition) {
		case 'sw-screen':
			element.data = new SwScreen(data)
		break;
		case 'sw-screen-group':
			element.data = new SwScreenGroup(data)
		break;
		case 'sw-configuration':
			element.data = new SwConfiguration(data)
		break;
		case 'sw-schedule':
			element.data = new SwSchedule(data)
		break;
		case 'sw-layout':
			element.data = new SwLayout(data)
		break;
		case 'sw-layout-playlist':
			element.data = new SwLayoutPlaylist(data)
		break;
		case 'sw-playlist':
			element.data = new SwPlaylist(data)
		break;
		case 'sw-playlist-media':
			element.data = new SwPlaylistMedia(data)
		break;
		case 'sw-media':
			element.data = new SwMedia(data)
		break;
	}

	this.by_eid[eid] = element
}



SwElements.prototype.relate = function(relationship, left_eid, right_eid) {
	switch(relationship) {
		case 'parent-child':
			this.by_eid[left_eid].childs[right_eid] = this.by_eid[right_eid]
			this.by_eid[right_eid].parents[left_eid] = this.by_eid[left_eid]
		break
		case 'previous-next':
			this.by_eid[left_eid].next = this.by_eid[right_eid]
			this.by_eid[right_eid].previous = this.by_eid[left_eid]
		break
	}
}


function SwScreen(data) {
	this.data = data
}



function SwScreenGroup(data) {
	this.data = data
}



function SwConfiguration(data) {
	this.data = data
}



function SwSchedule(data) {
	this.data = data
}



function SwLayout(data) {
	this.data = data
}



function SwLayoutPlaylist(data) {
	this.data = data
}



function SwPlaylist(data) {
	this.data = data
}



function SwPlaylistMedia(data) {
	this.data = data
}



function SwMedia(data) {
	this.data = data
}



exports.SwElements = SwElements;
exports.SwScreen = SwScreen;
exports.SwScreenGroup = SwScreenGroup;
exports.SwConfiguration = SwConfiguration;
exports.SwSchedule = SwSchedule;
exports.SwLayout = SwLayout;
exports.SwLayoutPlaylist = SwLayoutPlaylist;
exports.SwPlaylist = SwPlaylist;
exports.SwPlaylistMedia = SwPlaylistMedia;
exports.SwMedia = SwMedia;
