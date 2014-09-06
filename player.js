var util    = require("util")
var later   = require("later")
// var gui     = require('nw.gui')


function SwPlayer(screen_id) {
	this.screen_id = screen_id
}


SwPlayer.prototype.restart = function(screen_element) {
	if (typeof screen_element !== 'undefined')
		this.elements = screen_element
	if (typeof screen_element === 'undefined'){
		throw new Error('Nothing to play with!')
	}
	console.log('Starting ScreenWerk player for screen ' + this.screen_id)
	this.sw_screen = new SwScreen(this.elements)
	window.document.body.setAttribute('style', 'width:100%; height:100%; margin:20px; padding:20px; background-color:blue; border:2px;')
	this.sw_screen.play()
}

function SwScreen(element) {
	this.id = element.id
	this.properties = element.properties
	this.screen_groups = {}
	var document = window.document
	var class_name = 'SwScreen'
	this.dom_element = document.createElement('div')
	this.dom_element.appendChild(document.createTextNode(class_name + ': ' + this.id))
	this.dom_element.setAttribute('class', class_name)
	this.dom_element.setAttribute('id', this.id)
	this.dom_element.setAttribute('style', 'left:0px; top:0px; width:100%; height:100%; position:fixed; background-color:red;')
	this.dom_element.style.display = 'none'
	document.body.appendChild(this.dom_element)
	console.log('New screen ' + this.id)

	for (id in element.childs) {
		this.screen_groups[id] = new SwScreenGroup(this, element.childs[id])
	}
}
SwScreen.prototype.play = function() {
	this.dom_element.style.display = 'block'
	for (id in this.screen_groups) {
		this.screen_groups[id].play()
	}
}
SwScreen.prototype.stop = function() {
	this.dom_element.style.display = 'none'
	for (id in this.screen_groups) {
		this.screen_groups[id].stop()
	}
}


function SwScreenGroup(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	this.configurations = {}
	var document = window.document
	var class_name = 'SwScreenGroup'
	this.dom_element = document.createElement('div')
	this.dom_element.appendChild(document.createTextNode(class_name + ': ' + this.id))
	this.dom_element.setAttribute('class', class_name)
	this.dom_element.setAttribute('id', this.id)
	this.dom_element.setAttribute('style', 'left:0px; top:0px; width:100%; height:100%; padding:2px; background-color:green;')
	this.dom_element.style.display = 'none'
	this.dom_element.style.opacity = 0.8
	this.dom_element.style.position = 'fixed'
	document.getElementById(this.parent.id).appendChild(this.dom_element)
	for (id in element.childs) {
		this.configurations[id] = new SwConfiguration(this, element.childs[id])
		// console.log('Added to configurations ' + id)
	}
}
SwScreenGroup.prototype.play = function() {
	this.dom_element.style.display = 'block'
	for (id in this.configurations) {
		this.configurations[id].play()
	}
}
SwScreenGroup.prototype.stop = function() {
	this.dom_element.style.display = 'none'
	for (id in this.configurations) {
		this.configurations[id].stop()
	}
}


function SwConfiguration(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	this.schedules = {}
	var document = window.document
	var class_name = 'SwConfiguration'
	this.dom_element = document.createElement('div')
	this.dom_element.appendChild(document.createTextNode(class_name + ': ' + this.id))
	this.dom_element.setAttribute('class', class_name)
	this.dom_element.setAttribute('id', this.id)
	this.dom_element.setAttribute('style', 'left:0px; top:0px; width:100%; height:100%; padding:2px; background-color:white;')
	this.dom_element.style.display = 'none'
	this.dom_element.style.opacity = 0.8
	this.dom_element.style.position = 'fixed'
	document.getElementById(this.parent.id).appendChild(this.dom_element)
	for (id in element.childs) {
		this.schedules[id] = new SwSchedule(this, element.childs[id])
	}
}
SwConfiguration.prototype.play = function() {
	this.dom_element.style.display = 'block'
	for (sch_id in this.schedules) {
		this.schedules[sch_id].play()
	}
}
SwConfiguration.prototype.stop = function() {
	this.dom_element.style.display = 'none'
	for (id in this.schedules) {
		this.schedules[id].stop()
	}
}


function SwSchedule(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	this.cleanupLayer = this.properties['ordinal'].values[0]
	this.cleanup = this.properties['cleanup'].values[0]
	this.layouts = {}
	var document = window.document
	var class_name = 'SwSchedule'
	this.dom_element = document.createElement('div')
	this.dom_element.appendChild(document.createTextNode(class_name + ': ' + this.id))
	this.dom_element.setAttribute('class', class_name)
	this.dom_element.setAttribute('id', this.id)
	this.dom_element.setAttribute('style', 'left:0px; top:0px; width:100%; height:100%; padding:2px; background-color:yellow;')
	this.dom_element.style.display = 'none'
	this.dom_element.style.opacity = 0.8
	this.dom_element.style.position = 'fixed'
	document.getElementById(this.parent.id).appendChild(this.dom_element)

	this.cronSched = later.parse.cron(this.properties.crontab.values[0])
	if (this.properties['valid-from'].values !== undefined)
		this.startDate = this.properties['valid-from'].values[0]
	if (this.properties['valid-to'].values !== undefined)
		this.endDate = this.properties['valid-to'].values[0]

	for (id in element.childs) {
		this.layouts[id] = new SwLayout(this, element.childs[id])
	}
}
SwSchedule.prototype.play = function() {
	this.dom_element.style.display = 'block'
	for (id in this.layouts) {
		// console.log('Setting timer for layout ' + id + ' with function ' + util.inspect(this.layouts[id].play))
		this.layouts[id].timer = swSetInterval(this.layouts[id].play, this.cronSched, this.startDate, this.endDate)
	}
	//
	// !NB: if schedule has cleanup = true, then stop any other schedules on same or lower layers
	if (this.cleanup === 1)
		for (id in this.parent.schedules)
			if (this.parent.schedules[id].cleanupLayer <= this.cleanupLayer)
				this.parent.schedules[id].stop()
}
SwSchedule.prototype.stop = function() {
	this.dom_element.style.display = 'none'
	for (id in this.layouts) {
		this.layouts[id].stop()
	}
}

function SwLayout(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	this.layout_playlists = {}
	var document = window.document
	var class_name = 'SwLayout'
	this.dom_element = document.createElement('div')
	this.dom_element.appendChild(document.createTextNode(class_name + ': ' + this.id))
	this.dom_element.setAttribute('class', class_name)
	this.dom_element.setAttribute('id', this.id)
	this.dom_element.setAttribute('style', 'left:0px; top:0px; width:100%; height:100%; padding:2px; background-color:gray;')
	this.dom_element.style.display = 'none'
	this.dom_element.style.opacity = 0.8
	this.dom_element.style.position = 'fixed'
	document.getElementById(this.parent.id).appendChild(this.dom_element)
	for (id in element.childs) {
		this.layout_playlists[id] = new SwLayoutPlaylist(this, element.childs[id])
	}
}
SwLayout.prototype.play = function() {
	this.dom_element.style.display = 'block'
	for (id in this.layout_playlists) {
		this.layout_playlists[id].play()
	}
}
SwLayout.prototype.stop = function() {
	this.timer.clear()
	this.dom_element.style.display = 'none'
	for (id in this.layout_playlists) {
		this.layout_playlists[id].stop()
	}
}

function SwLayoutPlaylist(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	this.playlists = {}
	var document = window.document
	var class_name = 'SwLayoutPlaylist'
	this.dom_element = document.createElement('div')
	this.dom_element.appendChild(document.createTextNode(class_name + ': ' + this.id + ' ' + this.properties.name.values[0]))
	this.dom_element.setAttribute('class', class_name)
	this.dom_element.setAttribute('id', this.id)
	var style = 'padding:2px; background-color:brown;'
				+ ' top:'     + ((typeof this.properties.top.values    === 'undefined') ? '0'   : this.properties.top.values[0]) + '%;'
				+ ' left:'    + ((typeof this.properties.left.values   === 'undefined') ? '0'   : this.properties.left.values[0]) + '%;'
				+ ' height:'  + ((typeof this.properties.height.values === 'undefined') ? '100' : this.properties.height.values[0]) + '%;'
				+ ' width:'   + ((typeof this.properties.width.values  === 'undefined') ? '100' : this.properties.width.values[0]) + '%;'
				+ ' z-index:' + ((typeof this.properties.zindex.values === 'undefined') ? '-1'  : this.properties.zindex.values[0]) + ';'
	console.log(class_name + ': ' + this.id + ' ' + style)
	this.dom_element.setAttribute('style', style)
	this.dom_element.style.display = 'none'
	this.dom_element.style.opacity = 0.8
	this.dom_element.style.position = 'fixed'
	document.getElementById(this.parent.id).appendChild(this.dom_element)
	for (id in element.childs) {
		this.playlists[id] = new SwPlaylist(this, element.childs[id])
	}
}
SwLayoutPlaylist.prototype.play = function() {
	this.dom_element.style.display = 'block'
	for (id in this.playlists) {
		this.playlists[id].play()
	}
}
SwLayoutPlaylist.prototype.stop = function() {
	this.dom_element.style.display = 'none'
	for (id in this.playlists) {
		this.playlists[id].stop()
	}
}

function SwPlaylist(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	this.playlist_medias = {}
	var document = window.document
	var class_name = 'SwPlaylist'
	this.dom_element = document.createElement('div')
	this.dom_element.appendChild(document.createTextNode(class_name + ': ' + this.id))
	this.dom_element.setAttribute('class', class_name)
	this.dom_element.setAttribute('id', this.id)
	this.dom_element.setAttribute('style', 'padding:2px; background-color:cyan; width=100%; height=100%;')
	this.dom_element.style.display = 'none'
	this.dom_element.style.opacity = 0.8
	this.dom_element.style.position = 'relative'
	document.getElementById(this.parent.id).appendChild(this.dom_element)
	for (id in element.childs) {
		this.playlist_medias[id] = new SwPlaylistMedia(this, element.childs[id])
	}
}
SwPlaylist.prototype.play = function() {
	this.dom_element.style.display = 'block'
	for (id in this.playlist_medias) {
		this.playlist_medias[id].play()
	}
}
SwPlaylist.prototype.stop = function() {
	this.dom_element.style.display = 'none'
	for (id in this.playlist_medias) {
		this.playlist_medias[id].stop()
	}
}

function SwPlaylistMedia(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	this.medias = {}
	var document = window.document
	var class_name = 'SwPlaylistMedia'
	this.dom_element = document.createElement('div')
	this.dom_element.appendChild(document.createTextNode(class_name + ': ' + this.id))
	this.dom_element.setAttribute('class', class_name)
	this.dom_element.setAttribute('id', this.id)
	this.dom_element.setAttribute('style', 'padding:2px; background-color:pink;')
	this.dom_element.style.display = 'none'
	this.dom_element.style.opacity = 0.8
	this.dom_element.style.position = 'relative'
	document.getElementById(this.parent.id).appendChild(this.dom_element)
	for (id in element.childs) {
		this.medias[id] = new SwMedia(this, element.childs[id])
	}
}
SwPlaylistMedia.prototype.play = function() {
	this.dom_element.style.display = 'block'
	for (id in this.medias) {
		this.medias[id].play()
	}
}
SwPlaylistMedia.prototype.stop = function() {
	this.dom_element.style.display = 'none'
	for (id in this.medias) {
		this.medias[id].stop()
	}
}

function SwMedia(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	var document = window.document
	var class_name = 'SwMedia'
	this.dom_element = document.createElement('div')
	this.dom_element.appendChild(document.createTextNode(class_name + ': ' + this.id))
	this.dom_element.setAttribute('class', class_name)
	this.dom_element.setAttribute('id', this.id)
	this.dom_element.setAttribute('style', 'padding:2px; background-color:purple;')
	this.dom_element.style.display = 'none'
	this.dom_element.style.opacity = 0.8
	this.dom_element.style.position = 'relative'
	document.getElementById(this.parent.id).appendChild(this.dom_element)
}
SwMedia.prototype.play = function() {
	this.dom_element.style.display = 'block'
}
SwPlaylistMedia.prototype.stop = function() {
	this.dom_element.style.display = 'none'
}

// Return values:
// if 'valid-to' has expired: false
// if 'valid-from' in future: new Date('valid-from')
// else:                      true
var is_current = function(element) {
	var now = new Date()
	var from_date = now
	var to_date = now

	if (typeof element.properties['valid-to'].values !== 'undefined') {
		to_date = new Date(element.properties['valid-to'].values[0])
	}
	if (now > to_date)
		return false

	if (typeof element.properties['valid-from'].values !== 'undefined') {
		from_date = new Date(element.properties['valid-from'].values[0])
	}
	if (now < from_date)
		return from_date

	return true
}

var RemoveByClassName = function(class_name) {
	var elements = window.document.getElementsByClassName(class_name); //
	while(elements.length > 0) {
		console.dir({'removing': elements[0].getAttribute('id')})
		elements[0].parentNode.removeChild(elements[0]);
	}
}

var swSetTimeout = function(fn, sched, startDate, endDate) {
	if (endDate !== undefined ? endDate < Date.now() : false) {
		return {
			clear: function() {
				return
			}
		}
	}
	var s = later.schedule(sched), t
	if (startDate !== undefined ? startDate > Date.now() : false) {
		t = setTimeout(scheduleTimeout, startDate - Date.now())
		return {
			clear: function() {
				clearTimeout(t)
			}
		}
	}
	scheduleTimeout()
	function scheduleTimeout() {
		var now = Date.now(), next = s.next(2, now), diff = next[0].getTime() - now
		if (diff < 1e3) {
			diff = next[1].getTime() - now
		}
		if (diff < 2147483647) {
			t = setTimeout(fn, diff)
		} else {
			t = setTimeout(scheduleTimeout, 2147483647)
		}
	}
	return {
		clear: function() {
			clearTimeout(t)
		}
	}
}
var swSetInterval = function(fn, sched, startDate, endDate) {
	// console.log('Setting interval for function ' + util.inspect(fn))
	var t = swSetTimeout(scheduleTimeout, sched, startDate, endDate), done = false
	function scheduleTimeout() {
		if (!done) {
			fn()
			t = swSetTimeout(scheduleTimeout, sched, startDate, endDate)
		}
	}
	return {
		clear: function() {
			done = true
			t.clear()
		}
	}
}

exports.SwPlayer = SwPlayer
