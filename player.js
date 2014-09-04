var util    = require("util")
var later   = require("later")
// var gui     = require('nw.gui')
// later.date.localTime();


function SwPlayer(screen_id) {
	// console.log(util.inspect(document.width))
	// window.open('popup.html')

	this.screen_id = screen_id
	// this.document = document
}


SwPlayer.prototype.restart = function(screen_element) {
	if (typeof screen_element !== 'undefined')
		this.elements = screen_element
	if (typeof screen_element === 'undefined'){
		throw new Error('Nothing to play with!')
	}
	console.log('Starting ScreenWerk player for screen ' + this.screen_id)
	this.sw_screen = new SwScreen(this.elements)
	window.document.body.setAttribute('style', 'width:100%; height:100%; margin:20px; padding:20px; background-color:blue; border:2px')
	this.sw_screen.play()
}

function SwScreen(element) {
	this.id = element.id
	this.screen_groups = {}
	for (id in element.childs) {
		this.screen_groups[id] = new SwScreenGroup(this, element.childs[id])
		// console.log('Added to screen_groups ' + id)
	}
}
SwScreen.prototype.play = function() {
	var document = window.document
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode('SwScreen: ' + this.id))
	dom_element.setAttribute('class', 'SwScreen')
	dom_element.setAttribute('id', this.id)
	dom_element.setAttribute('style', 'left:0px; top:0px; width:100%; height:100%; position:fixed; background-color:red;')
	document.body.appendChild(dom_element)
	for (id in this.screen_groups) {
		this.screen_groups[id].play()
	}
}


function SwScreenGroup(parent, element) {
	this.parent = parent
	this.id = element.id
	this.configurations = {}
	for (id in element.childs) {
		this.configurations[id] = new SwConfiguration(this, element.childs[id])
		// console.log('Added to configurations ' + id)
	}
}
SwScreenGroup.prototype.play = function() {
	var document = window.document
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode('SwScreenGroup: ' + this.id))
	dom_element.setAttribute('class', 'SwScreenGroup')
	dom_element.setAttribute('id', this.id)
	dom_element.setAttribute('style', 'padding:2px; background-color:green;')
	document.getElementById(this.parent.id).appendChild(dom_element)
	for (id in this.configurations) {
		this.configurations[id].play()
	}
}


function SwConfiguration(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	this.schedules = {}
	for (id in element.childs) {
		this.schedules[id] = new SwSchedule(this, element.childs[id])
	}
}
SwConfiguration.prototype.play = function() {
	var document = window.document
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode('SwConfiguration: ' + this.id))
	dom_element.setAttribute('class', 'SwConfiguration')
	dom_element.setAttribute('id', this.id)
	dom_element.setAttribute('style', 'padding:2px; background-color:white;')
	document.getElementById(this.parent.id).appendChild(dom_element)
	//
	// !NB: if multiple schedules are configured to exact same time, then start just one of them
	var current_schedule_events = {}
	for (id in this.schedules) {
		if (!is_current(this.schedules[id]))
			continue
		var cronSched = later.parse.cron(this.schedules[id].properties.crontab.values[0])
		var prev = new Date(later.schedule(cronSched).prev(1, new Date()))
		current_schedule_events[prev] = id
	}
	var keys = Object.keys(current_schedule_events)
	keys.reverse()
	current_schedule_event = this.schedules[current_schedule_events[keys[0]]]
	console.log('current_schedule_event: ' + current_schedule_event)
	console.log(util.inspect(current_schedule_events))
	dom_element.appendChild(document.createTextNode(' Currently playing schedule : ' + current_schedule_events[keys[0]] + ' started at ' + keys[0]))
	current_schedule_event.play()
}

function SwSchedule(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	this.layouts = {}
	for (id in element.childs) {
		this.layouts[id] = new SwLayout(this, element.childs[id])
	}
}
SwSchedule.prototype.prev_event_time = function() {
	// if this.properties['valid-from'].values[0]
}
SwSchedule.prototype.next_event_time = function() {
	null
}
SwSchedule.prototype.play = function() {
	var document = window.document
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode('SwSchedule: ' + this.id))
	dom_element.setAttribute('class', 'SwSchedule')
	dom_element.setAttribute('id', this.id)
	dom_element.setAttribute('style', 'padding:2px; background-color:yellow;')
	document.getElementById(this.parent.id).appendChild(dom_element)
	for (id in this.layouts) {
		this.layouts[id].play()
	}
}

function SwLayout(parent, element) {
	this.parent = parent
	this.id = element.id
	this.layout_playlists = {}
	for (id in element.childs) {
		this.layout_playlists[id] = new SwLayoutPlaylist(this, element.childs[id])
		// console.log('Added to layout_playlists ' + id)
	}
}
SwLayout.prototype.play = function() {
	var document = window.document
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode('SwLayout: ' + this.id))
	dom_element.setAttribute('class', 'SwLayout')
	dom_element.setAttribute('id', this.id)
	dom_element.setAttribute('style', 'padding:2px; background-color:gray;')
	document.getElementById(this.parent.id).appendChild(dom_element)
	for (id in this.layout_playlists) {
		this.layout_playlists[id].play()
	}
}

function SwLayoutPlaylist(parent, element) {
	this.parent = parent
	this.id = element.id
	this.playlists = {}
	for (id in element.childs) {
		this.playlists[id] = new SwPlaylist(this, element.childs[id])
		// console.log('Added to playlists ' + id)
	}
}
SwLayoutPlaylist.prototype.play = function() {
	var document = window.document
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode('SwLayoutPlaylist: ' + this.id))
	dom_element.setAttribute('class', 'SwLayoutPlaylist')
	dom_element.setAttribute('id', this.id)
	dom_element.setAttribute('style', 'padding:2px; background-color:brown;')
	document.getElementById(this.parent.id).appendChild(dom_element)
	for (id in this.playlists) {
		this.playlists[id].play()
	}
}

function SwPlaylist(parent, element) {
	this.parent = parent
	this.id = element.id
	this.playlist_medias = {}
	for (id in element.childs) {
		this.playlist_medias[id] = new SwPlaylistMedia(this, element.childs[id])
		// console.log('Added to playlist_medias ' + id)
	}
}
SwPlaylist.prototype.play = function() {
	var document = window.document
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode('SwPlaylist: ' + this.id))
	dom_element.setAttribute('class', 'SwPlaylist')
	dom_element.setAttribute('id', this.id)
	dom_element.setAttribute('style', 'padding:2px; background-color:cyan;')
	document.getElementById(this.parent.id).appendChild(dom_element)
	for (id in this.playlist_medias) {
		this.playlist_medias[id].play()
	}
}

function SwPlaylistMedia(parent, element) {
	this.parent = parent
	this.id = element.id
	this.medias = {}
	for (id in element.childs) {
		this.medias[id] = new SwMedia(this, element.childs[id])
		// console.log('Added to medias ' + id)
	}
}
SwPlaylistMedia.prototype.play = function() {
	var document = window.document
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode('SwPlaylistMedia: ' + this.id))
	dom_element.setAttribute('class', 'SwPlaylistMedia')
	dom_element.setAttribute('id', this.id)
	dom_element.setAttribute('style', 'padding:2px; background-color:pink;')
	document.getElementById(this.parent.id).appendChild(dom_element)
	for (id in this.medias) {
		this.medias[id].play()
	}
}

function SwMedia(parent, element) {
	this.parent = parent
	this.id = element.id
	// console.log('Hooray!')
}
SwMedia.prototype.play = function() {
	var document = window.document
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode('SwMedia: ' + this.id))
	dom_element.setAttribute('class', 'SwMedia')
	dom_element.setAttribute('id', this.id)
	dom_element.setAttribute('style', 'padding:2px; background-color:purple;')
	document.getElementById(this.parent.id).appendChild(dom_element)
}

var is_current = function(element) {
	var now = new Date()
	var from_date = now
	var to_date = now
	// console.log('now[' + element.id + ']: ' + util.inspect(now))
	if (typeof element.properties['valid-from'].values !== 'undefined'){
		console.log(typeof element.properties['valid-from'].values)
		from_date = new Date(element.properties['valid-from'].values[0])
	}
	// console.log('from_date[' + element.id + ']: ' + util.inspect(from_date))
	if (now < from_date)
		return false

	if (typeof element.properties['valid-to'].values !== 'undefined')
		to_date = new Date(element.properties['valid-to'].values[0])
	// console.log('to_date[' + element.id + ']: ' + util.inspect(to_date))
	if (now > to_date)
		return false

	// console.log(util.inspect(true))
	return true
}

exports.SwPlayer = SwPlayer
