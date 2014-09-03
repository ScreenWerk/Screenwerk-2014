var util    = require("util")
// var gui     = require('nw.gui')


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
	dom_element.setAttribute('style', 'padding-left:2px; background-color:red;')
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
	dom_element.setAttribute('style', 'padding-left:2px; background-color:green;')
	document.getElementById(this.parent.id).appendChild(dom_element)
	for (id in this.configurations) {
		this.configurations[id].play()
	}
}


function SwConfiguration(parent, element) {
	this.parent = parent
	this.id = element.id
	this.schedules = {}
	for (id in element.childs) {
		this.schedules[id] = new SwSchedule(this, element.childs[id])
		// console.log('Added to schedules ' + id)
	}
}
SwConfiguration.prototype.play = function() {
	var document = window.document
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode('SwConfiguration: ' + this.id))
	dom_element.setAttribute('class', 'SwConfiguration')
	dom_element.setAttribute('id', this.id)
	dom_element.setAttribute('style', 'padding-left:2px; background-color:white;')
	document.getElementById(this.parent.id).appendChild(dom_element)
	for (id in this.schedules) {
		this.schedules[id].play()
	}
}

function SwSchedule(parent, element) {
	this.parent = parent
	this.id = element.id
	this.layouts = {}
	for (id in element.childs) {
		this.layouts[id] = new SwLayout(this, element.childs[id])
		// console.log('Added to layouts ' + id)
	}
}
SwSchedule.prototype.play = function() {
	var document = window.document
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode('SwSchedule: ' + this.id))
	dom_element.setAttribute('class', 'SwSchedule')
	dom_element.setAttribute('id', this.id)
	dom_element.setAttribute('style', 'padding-left:2px; background-color:yellow;')
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
	dom_element.setAttribute('style', 'padding-left:2px; background-color:gray;')
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
	dom_element.setAttribute('style', 'padding-left:2px; background-color:brown;')
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
	dom_element.setAttribute('style', 'padding-left:2px; background-color:cyan;')
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
	dom_element.setAttribute('style', 'padding-left:2px; background-color:pink;')
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
	dom_element.setAttribute('style', 'padding-left:2px; background-color:purple;')
	document.getElementById(this.parent.id).appendChild(dom_element)
}

exports.SwPlayer = SwPlayer
