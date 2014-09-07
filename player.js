var util    = require("util")
var later   = require("later")
// var gui     = require('nw.gui')


function SwPlayer(screen_id) {
	this.screen_id = screen_id
}
SwPlayer.prototype.restart = function(screen_element) {
	console.log('Starting ScreenWerk player for screen ' + this.screen_id)
	this.sw_screen = new SwScreen(screen_element)
	// window.document.body.setAttribute('style', 'width:100%; height:100%; margin:20px; padding:20px; background-color:blue; border:2px;')
	this.sw_screen.play()
}


function SwScreen(element) {
	this.id = element.id
	this.properties = element.properties
	var screen_groups = this.screen_groups = []
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwScreen'
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode(class_name + ': ' + element.id))
	dom_element.setAttribute('class', class_name)
	dom_element.setAttribute('id', element.id)
	dom_element.setAttribute('style', 'position:fixed; background-color:red;')
	dom_element.style.display = 'none'
	document.body.appendChild(dom_element)
	// console.log('New ' + class_name + ' ' + element.id + ' Style: ' + util.inspect(dom_element.style))

	for (id in element.childs) {
		screen_groups.push({'id':id, 'element':new SwScreenGroup(this, element.childs[id])})
	}
	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			screen_groups.forEach(function(screen_group){
				screen_group.element.play()
			})
		},
		stop: function() {
			if (!is_playing) {
				return
			}
			is_playing = false
			dom_element.style.display = 'none'
			console.log('stop ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			screen_groups.forEach(function(screen_group){
				screen_group.element.stop()
			})
		},
		clear: function() {
			screen_groups.forEach(function(screen_group){
				screen_group.element.clear()
			})
		},
		screen_groups: function() {
			return screen_groups
		}
	}
}


function SwScreenGroup(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	var configurations = this.configurations = []
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwScreenGroup'
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode(class_name + ': ' + element.id))
	dom_element.setAttribute('class', class_name)
	dom_element.setAttribute('id', element.id)
	dom_element.setAttribute('style', 'background-color:green;')
	dom_element.style.display = 'none'
	dom_element.style.position = 'fixed'
	document.getElementById(this.parent.id).appendChild(dom_element)
	// console.log('New ' + class_name + ' ' + element.id + ' Style: ' + util.inspect(dom_element.style))

	for (id in element.childs) {
		configurations.push({'id':id, 'element':new SwConfiguration(this, element.childs[id])})
	}
	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			configurations.forEach(function(configuration){
				configuration.element.play()
			})
		},
		stop: function() {
			if (!is_playing) {
				return
			}
			is_playing = false
			dom_element.style.display = 'none'
			console.log('stop ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			configurations.forEach(function(configuration){
				configuration.element.stop()
			})
		},
		clear: function() {
			configurations.forEach(function(configuration){
				configuration.element.clear()
			})
		},
		configurations: function() {
			return configurations
		}
	}
}


function SwConfiguration(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	var schedules = this.schedules = []
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwConfiguration'
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode(class_name + ': ' + element.id))
	dom_element.setAttribute('class', class_name)
	dom_element.setAttribute('id', element.id)
	dom_element.setAttribute('style', 'background-color:white;')
	dom_element.style.display = 'none'
	dom_element.style.position = 'fixed'
	document.getElementById(this.parent.id).appendChild(dom_element)
	// console.log('New ' + class_name + ' ' + element.id + ' Style: ' + util.inspect(dom_element.style))

	for (id in element.childs) {
		schedules.push({'id':id, 'element':new SwSchedule(this, element.childs[id])})
	}

	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			schedules.forEach(function(schedule){
				schedule.element.play()
			})
			//
			// Layouts should show up right now. Scheduled layouts will play later
			schedules.sort(function compare(a,b) {
				if (a.element.prev > b.element.prev)
					return -1
				if (a.element.prev < b.element.prev)
					return 1
				return 0
			})
			// console.log(util.inspect({'schedules: ': schedules}, {depth: 6}))
			schedules.forEach(function(schedule){
				console.log('There are ' + schedule.element.layouts().length + ' layouts to initialize for schedule: ' + schedule.id)
				schedule.element.playLayouts()
			})
		},
		stop: function() {
			if (!is_playing) {
				return
			}
			is_playing = false
			dom_element.style.display = 'none'
			console.log('stop ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			schedules.forEach(function(schedule){
				schedule.element.stop()
			})
		},
		clear: function() {
			schedules.forEach(function(schedule){
				schedule.element.clear()
			})
		},
		schedules: function() {
			return schedules
		}
	}
}


function SwSchedule(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	var timer = null
	var cleanupLayer = this.cleanupLayer = this.properties['ordinal'].values[0]
	var cleanup = this.cleanup = this.properties['cleanup'].values[0]
	var layouts = this.layouts = []
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwSchedule'
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode(class_name + ': ' + element.id))
	dom_element.setAttribute('class', class_name)
	dom_element.setAttribute('id', element.id)
	dom_element.setAttribute('style', 'background-color:yellow;')
	dom_element.style.display = 'none'
	dom_element.style.position = 'fixed'
	document.getElementById(this.parent.id).appendChild(dom_element)
	// console.log('New ' + class_name + ' ' + element.id + ' Style: ' + util.inspect(dom_element.style))

	var cronSched = this.cronSched = later.parse.cron(this.properties.crontab.values[0])
	if (this.properties['valid-from'].values !== undefined) {
		var startDate = this.properties['valid-from'].values[0]
		var startTime = (startDate.getTime());
		cronSched.schedules[0].fd_a = [startTime];
	}
	if (this.properties['valid-to'].values !== undefined) {
		var endDate = this.properties['valid-to'].values[0]
		var endTime = (endDate.getTime());
		cronSched.schedules[0].fd_b = [endTime];
	}

	for (id in element.childs) {
		layouts.push({'id':id, 'element': new SwLayout(this, element.childs[id])})
	}
	console.log('There are ' + layouts.length + ' layouts in schedule ' + element.id)
	var playLayouts = function playLayouts() {
		layouts.forEach( function(layout) {
			layout.element.play()
		})
		//
		// !NB: if schedule has cleanup = true, then stop any other schedules on same or lower layers
		if (cleanup === 1) {
			// console.log(util.inspect(parent, {depth:6}))
			parent.schedules.forEach(function(schedule){
				if (schedule.cleanupLayer <= cleanupLayer) {
					schedule.stop()
				}
			})
		}
	}
	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display + util.inspect(cronSched))

			timer = swSetInterval(playLayouts, cronSched, startDate, endDate)
		},
		stop: function() {
			if (!is_playing) {
				return
			}
			is_playing = false
			dom_element.style.display = 'none'
			console.log('stop ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			for (layout in layouts) {
				layout.element.stop()
			}
		},
		clear: function() {
			timer.clear()
			layouts.forEach(function(layout){
				layout.element.clear()
			})
		},
		layouts: function() {
			return layouts
		},
		prev: function() {
			return later.schedule(cronSched).prev(1);
		},
		playLayouts: function() {
			playLayouts()
		}
	}
}


function SwLayout(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	var layout_playlists = this.layout_playlists = []
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwLayout'
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode(class_name + ': ' + element.id))
	dom_element.setAttribute('class', class_name)
	dom_element.setAttribute('id', element.id)
	dom_element.setAttribute('style', 'background-color:gray;')
	dom_element.style.display = 'none'
	dom_element.style.position = 'fixed'
	document.getElementById(this.parent.id).appendChild(dom_element)
	// console.log('New ' + class_name + ' ' + element.id + ' Style: ' + util.inspect(dom_element.style))

	for (id in element.childs) {
		layout_playlists.push({'id' : id, 'element' : new SwLayoutPlaylist(this, element.childs[id])})
	}
	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			layout_playlists.forEach(function(layout_playlist) {
				layout_playlist.element.play()
			})
		},
		stop: function() {
			if (!is_playing) {
				return
			}
			is_playing = false
			this.timer.clear()
			dom_element.style.display = 'none'
			console.log('stop ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			layout_playlists.forEach(function(layout_playlist) {
				layout_playlist.element.stop()
			})
		},
		clear: function() {
			layout_playlists.forEach(function(layout_playlist){
				layout_playlist.element.clear()
			})
		},
		layout_playlists: function() {
			return layout_playlists
		}
	}
}


function SwLayoutPlaylist(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	var playlists = this.playlists = []
	var document = window.document
	var is_playing = false
	var class_name = 'SwLayoutPlaylist'
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode(class_name + ': ' + element.id + ' ' + this.properties.name.values[0]))
	dom_element.setAttribute('class', class_name)
	dom_element.setAttribute('id', element.id)
	var style = 'background-color:brown;'
				+ ' top:'     + ((typeof this.properties.top.values    === 'undefined') ? '0'   : this.properties.top.values[0]) + '%;'
				+ ' left:'    + ((typeof this.properties.left.values   === 'undefined') ? '0'   : this.properties.left.values[0]) + '%;'
				+ ' height:'  + ((typeof this.properties.height.values === 'undefined') ? '100' : this.properties.height.values[0]) + '%;'
				+ ' width:'   + ((typeof this.properties.width.values  === 'undefined') ? '100' : this.properties.width.values[0]) + '%;'
				+ ' z-index:' + ((typeof this.properties.zindex.values === 'undefined') ? '-1'  : this.properties.zindex.values[0]) + ';'
	// console.log(class_name + ': ' + element.id + ' ' + style)
	dom_element.setAttribute('style', style)
	dom_element.style.display = 'none'
	dom_element.style.position = 'fixed'
	document.getElementById(this.parent.id).appendChild(dom_element)
	// console.log('New ' + class_name + ' ' + element.id + ' Style: ' + util.inspect(dom_element.style))

	for (id in element.childs) {
		playlists.push({'id' : id, 'element' : new SwPlaylist(this, element.childs[id])})
	}
	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			playlists.forEach(function(playlist) {
				playlist.element.play()
			})
		},
		stop: function() {
			if (!is_playing) {
				return
			}
			is_playing = false
			dom_element.style.display = 'none'
			console.log('stop ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			playlists.forEach(function(playlist) {
				playlist.element.stop()
			})
		},
		clear: function() {
			playlists.forEach(function(playlist){
				playlist.element.clear()
			})
		},
		playlists: function() {
			return playlists
		}
	}
}


function SwPlaylist(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	var playlist_medias = this.playlist_medias = []
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwPlaylist'
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode(class_name + ': ' + element.id))
	dom_element.setAttribute('class', class_name)
	dom_element.setAttribute('id', element.id)
	dom_element.setAttribute('style', 'background-color:cyan; left:0; right:0; top:0; bottom:0;')
	dom_element.style.display = 'none'
	dom_element.style.position = 'absolute'
	document.getElementById(this.parent.id).appendChild(dom_element)
	// console.log('New ' + class_name + ' ' + element.id + ' Style: ' + util.inspect(dom_element.style))

	for (id in element.childs) {
		playlist_medias.push({'id' : id, 'element' : new SwPlaylistMedia(this, element.childs[id])})
	}
	playlist_medias.sort(function compare(a,b) {
		if (a.element.ordinal() < b.element.ordinal())
			return -1
		if (a.element.ordinal() > b.element.ordinal())
			return 1
		return 0
	})
	for (var i = 0; i < playlist_medias.length; i++) {
		playlist_medias[i].element.prev(playlist_medias[(i === 0) ? playlist_medias.length - 1 : i - 1])
		playlist_medias[i].element.next(playlist_medias[(i === playlist_medias.length - 1) ? 0 : i + 1])
	}
	i = 0
	// playlist_medias.forEach(function(playlist_media) {
	// 	console.log('AFTER sort[' + i++ + ']: playlist_media[' + playlist_media.id
	// 	 + '].ordinal: ' + playlist_media.element.ordinal()
	// 	 + ', prev:' + util.inspect(playlist_media.element.prev().id)
	// 	 + ', next:' + util.inspect(playlist_media.element.next().id)
	// 	 )
	// })
	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			playlist_medias[0].element.play()
			// playlist_medias.forEach(function(playlist_media){
			// 	playlist_media.element.play()
			// })
		},
		stop: function() {
			if (!is_playing) {
				return
			}
			is_playing = false
			dom_element.style.display = 'none'
			console.log('stop ' + class_name + ' ' + element.id + ' css.display: ' + dom_element.style.display)
			playlist_medias.forEach(function(playlist_media){
				playlist_media.element.stop()
			})
		},
		clear: function() {
			playlist_medias.forEach(function(playlist_media){
				playlist_media.element.clear()
			})
		},
		playlist_medias: function() {
			return playlist_medias
		}
	}
}


function SwPlaylistMedia(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	// this.temp_ordinal = element.properties.ordinal.values[0]
	var medias = this.medias = []
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwPlaylistMedia'
	var dom_element = document.createElement('div')
	dom_element.appendChild(document.createTextNode(class_name + ': ' + element.id))
	dom_element.setAttribute('class', class_name)
	dom_element.setAttribute('id', element.id)
	var style = 'background-color:pink;'
	dom_element.setAttribute('style', style)
	dom_element.style.display = 'none'
	dom_element.style.position = 'absolute'
	document.getElementById(this.parent.id).appendChild(dom_element)
	// console.log('New ' + class_name + ' ' + element.id + ' Style: ' + util.inspect(dom_element.style))


	for (id in element.childs) {
		medias.push({'id' : id, 'element' : new SwMedia(this, element.childs[id])})
	}

	var stop = function stop() {
		if (!is_playing) {
			return
		}
		is_playing = false
		dom_element.style.display = 'none'
		console.log('stop ' + class_name + ' ' + element.id)// + ' style: ' + util.inspect(dom_element.style))
		element.next.element.play()
		medias.forEach(function(media){
			media.element.stop()
		})
	}
	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + element.id)// + ' style: ' + util.inspect(dom_element.style))
			medias.forEach(function(media){
				media.element.play()
				// console.log('setTimeout STOP for media ' + media.id + ' at ' + util.inspect(media.element.stopDate()))
				setTimeout(media.element.stop, media.element.stopDate() - Date.now())
			})
			var stopDate = new Date()
			medias.forEach(function(media){
				stopDate = (stopDate > media.element.stopDate()) ? stopDate : media.element.stopDate()
			})
			// console.log('setTimeout STOP this ' + element.id + ' and PLAY next ' + element.next.id + ' playlist_media at ' + util.inspect(stopDate))
			// console.log(util.inspect(element.next.element))
			// setTimeout(console.log('got to PLAY ' + element.next.id), stopDate - Date.now)
			setTimeout(element.next.element.play, stopDate - Date.now())
			setTimeout(stop, stopDate - Date.now())


		},
		stop: function() {
			return stop()
		},
		clear: function() {
			medias.forEach(function(media){
				media.element.clear()
			})
		},
		medias: function() {
			return medias
		},
		ordinal: function() {
			return element.properties.ordinal.values === undefined ? 0 : element.properties.ordinal.values[0]
		},
		next: function(next) {
			if (next === undefined)
				return element.next
			else {
				element.next = next
			}
		},
		prev: function(prev) {
			if (prev === undefined)
				return element.prev
			else {
				element.prev = prev
			}
		},
		stopDate: function() {
			var stopDate = new Date()
			medias.forEach(function(media){
				stopDate = (stopDate.getTime > media.element.stopDate.getTime) ? stopDate : media.element.stopDate
			})
		}
	}
}


function SwMedia(parent, element) {
	this.parent = parent
	this.id = element.id
	this.properties = element.properties
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwMedia'
	var dom_element
	if (element.properties.type.values[0] === 'Video') {
		dom_element = document.createElement('video')
		dom_element.autoplay = true
		var source_element = document.createElement('source')
		source_element.type = 'video/webm'
		source_element.src = element.properties.filepath.values[0]
		dom_element.appendChild(source_element)
	} else {
		dom_element = document.createElement('div')
		dom_element.appendChild(document.createTextNode(class_name + ': ' + element.id))
	}


	var stopDate
	dom_element.setAttribute('class', class_name)
	dom_element.setAttribute('id', element.id)
	var style = 'background-color:purple;'
	dom_element.setAttribute('style', style)
	dom_element.style.display = 'none'
	dom_element.style.position = 'absolute'
	document.getElementById(this.parent.id).appendChild(dom_element)
	// console.log('New ' + class_name + ' ' + element.id + ' Style: ' + util.inspect(dom_element.style))

	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + element.id)// + ' style: ' + util.inspect(dom_element.style))
			stopDate = new Date(Date.now() + 60000)
		},
		stop: function() {
			if (!is_playing) {
				return
			}
			is_playing = false
			dom_element.style.display = 'none'
			console.log('stop ' + class_name + ' ' + element.id)// + ' style: ' + util.inspect(dom_element.style))
		},
		stopDate: function() {
			return stopDate
		}
		// clear: function() {}
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
	// console.log('sched: ' + sched)
	var s = later.schedule(sched)
	var t
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
	var t = swSetTimeout(scheduleTimeout, sched, startDate, endDate)
	var done = false
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
