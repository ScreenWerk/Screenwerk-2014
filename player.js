var util    = require("util")
var later   = require("later")
// var gui     = require('nw.gui')


function  SwPlayer(screen_id) {
	this.screen_id = screen_id
}
SwPlayer.prototype.restart = function(screen_entity) {
	console.log('Starting ScreenWerk player for screen ' + this.screen_id)
	screen_entity.player = new SwScreen(screen_entity)
	screen_entity.player.play()
}


function SwScreen(entity) {
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwScreen'
	entity.dom_element = document.createElement('div')
	// console.log(util.inspect(entity.dom_element))
	entity.dom_element.appendChild(document.createTextNode(class_name + ': ' + entity.id))
	entity.dom_element.setAttribute('class', class_name)
	entity.dom_element.setAttribute('id', entity.id)
	entity.dom_element.setAttribute('style', 'position:fixed; background-color:red;')
	entity.dom_element.style.display = 'none'
	document.body.appendChild(entity.dom_element)
	// console.log('New ' + class_name + ' ' + entity.id + ' Style: ' + util.inspect(dom_element.style))

	entity.element.childs.forEach(function(child_entity) {
		// console.log(util.inspect(child_entity.element.parents[0]))
		child_entity.player = new SwScreenGroup(child_entity)
	})
	// console.log(util.inspect(entity))
	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
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
			console.log('stop ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
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


function SwScreenGroup(entity) {
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwScreenGroup'
	entity.dom_element = document.createElement('div')
	entity.dom_element.appendChild(document.createTextNode(class_name + ': ' + entity.id))
	entity.dom_element.setAttribute('class', class_name)
	entity.dom_element.setAttribute('id', entity.id)
	entity.dom_element.setAttribute('style', 'background-color:green;')
	entity.dom_element.style.display = 'none'
	entity.dom_element.style.position = 'fixed'

	entity.element.parents.forEach(function(parent_entity) {
		parent_entity.dom_element.appendChild(entity.dom_element)
	})
	entity.element.childs.forEach(function(child_entity) {
		child_entity.player = new SwConfiguration(child_entity)
	})
	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
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
			console.log('stop ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
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


function SwConfiguration(entity) {
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwConfiguration'
	entity.dom_element = document.createElement('div')
	entity.dom_element.appendChild(document.createTextNode(class_name + ': ' + entity.id))
	entity.dom_element.setAttribute('class', class_name)
	entity.dom_element.setAttribute('id', entity.id)
	entity.dom_element.setAttribute('style', 'background-color:white;')
	entity.dom_element.style.display = 'none'
	entity.dom_element.style.position = 'fixed'
	console.log('New ' + class_name + ' ' + entity.id) // + ' Style: ' + util.inspect(entity.dom_element.style))

	entity.element.parents.forEach(function(parent_entity) {
		parent_entity.dom_element.appendChild(entity.dom_element)
	})
	entity.element.childs.forEach(function(child_entity) {
		child_entity.player = new SwSchedule(child_entity)
	})

	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
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
			console.log('stop ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
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


function SwSchedule(entity) {
	var timer = null
	var element = entity.element
	var cleanupLayer = element.properties['ordinal'].values[0]
	var cleanup = this.cleanup = element.properties['cleanup'].values[0]
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwSchedule'
	entity.dom_element = document.createElement('div')
	entity.dom_element.appendChild(document.createTextNode(class_name + ': ' + entity.id))
	entity.dom_element.setAttribute('class', class_name)
	entity.dom_element.setAttribute('id', entity.id)
	entity.dom_element.setAttribute('style', 'background-color:yellow;')
	entity.dom_element.style.display = 'none'
	entity.dom_element.style.position = 'fixed'
	console.log('New ' + class_name + ' ' + entity.id) // + ' Style: ' + util.inspect(entity.dom_element.style))

	// console.log(util.inspect(entity.element.properties.crontab.values[0]))
	var cronSched = this.cronSched = later.parse.cron(entity.element.properties.crontab.values[0].db_value)
	// console.log(util.inspect(cronSched))
	if (entity.element.properties['valid-from'].values !== undefined) {
		var startDate = entity.element.properties['valid-from'].values[0]
		var startTime = (startDate.getTime());
		cronSched.schedules[0].fd_a = [startTime];
	}
	if (entity.element.properties['valid-to'].values !== undefined) {
		var endDate = entity.element.properties['valid-to'].values[0]
		var endTime = (endDate.getTime());
		cronSched.schedules[0].fd_b = [endTime];
	}

	entity.element.parents.forEach(function(parent_entity) {
		parent_entity.dom_element.appendChild(entity.dom_element)
	})
	entity.element.childs.forEach(function(child_entity) {
		child_entity.player = new SwLayout(child_entity)
	})
	// console.log('There are ' + layouts.length + ' layouts in schedule ' + entity.id)
	var playLayouts = function playLayouts() {
		layouts.forEach( function(layout) {
			layout.element.play()
		})
		//
		// !NB: if schedule has cleanup = true, then stop any other schedules on same or lower layers
		if (cleanup === 1) {
			// console.log(util.inspect(parent, {depth:6}))
			parent.schedules.forEach(function(schedule){
				// console.log(util.inspect(schedule,{depth:6}))
				console.log('Schedule ' + util.inspect(entity.id) + ' cleanupLayer ' + cleanupLayer + ' checking for cleanup of schedule ' + util.inspect(schedule.id) + ' schedule.cleanupLayer ' + schedule.element.cleanupLayer())
				if (schedule.element.cleanupLayer() <= cleanupLayer) {
					if (entity.id != schedule.id) {
						console.log('Schedule ' + entity.id + ' cleaning up schedule ' + schedule.id)
						schedule.element.stop()
					}
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
			console.log('play ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display + util.inspect(cronSched))

			timer = swSetInterval(playLayouts, cronSched, startDate, endDate)
		},
		stop: function() {
			if (!is_playing) {
				return
			}
			is_playing = false
			dom_element.style.display = 'none'
			console.log('stop ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
			// console.log(util.inspect(layouts,{depth:6}))
			layouts.forEach(function(layout){
				// console.log(util.inspect(layout,{depth:6}))
				layout.element.stop()
			})
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
		cleanupLayer: function() {
			return cleanupLayer
		},
		prev: function() {
			return later.schedule(cronSched).prev(1);
		},
		playLayouts: function() {
			playLayouts()
		}
	}
}


function SwLayout(entity) {
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwLayout'
	entity.dom_element = document.createElement('div')
	entity.dom_element.appendChild(document.createTextNode(class_name + ': ' + entity.id))
	entity.dom_element.setAttribute('class', class_name)
	entity.dom_element.setAttribute('id', entity.id)
	entity.dom_element.setAttribute('style', 'background-color:gray;')
	entity.dom_element.style.display = 'none'
	entity.dom_element.style.position = 'fixed'
	console.log('New ' + class_name + ' ' + entity.id) // + ' Style: ' + util.inspect(entity.dom_element.style))
	// console.log('New ' + class_name + ' ' + entity.id + ' Style: ' + util.inspect(dom_element.style))

	entity.element.parents.forEach(function(parent_entity) {
		parent_entity.dom_element.appendChild(entity.dom_element)
	})
	entity.element.childs.forEach(function(child_entity) {
		child_entity.player = new SwLayoutPlaylist(child_entity)
	})
	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
			layout_playlists.forEach(function(layout_playlist) {
				layout_playlist.element.play()
			})
		},
		stop: function() {
			if (!is_playing) {
				return
			}
			is_playing = false
			// this.timer.clear()
			dom_element.style.display = 'none'
			console.log('stop ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
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


function SwLayoutPlaylist(entity) {
	var document = window.document
	var is_playing = false
	var class_name = 'SwLayoutPlaylist'
	entity.dom_element = document.createElement('div')
	entity.dom_element.appendChild(document.createTextNode(class_name + ': ' + entity.id + ' ' + entity.element.properties.name.values[0]))
	entity.dom_element.setAttribute('class', class_name)
	entity.dom_element.setAttribute('id', entity.id)
	var style = 'background-color:brown;'
				+ ' top:'     + ((typeof entity.element.properties.top.values    === 'undefined') ? '0'   : entity.element.properties.top.values[0]) + '%;'
				+ ' left:'    + ((typeof entity.element.properties.left.values   === 'undefined') ? '0'   : entity.element.properties.left.values[0]) + '%;'
				+ ' height:'  + ((typeof entity.element.properties.height.values === 'undefined') ? '100' : entity.element.properties.height.values[0]) + '%;'
				+ ' width:'   + ((typeof entity.element.properties.width.values  === 'undefined') ? '100' : entity.element.properties.width.values[0]) + '%;'
				+ ' z-index:' + ((typeof entity.element.properties.zindex.values === 'undefined') ? '-1'  : entity.element.properties.zindex.values[0]) + ';'
	// console.log(class_name + ': ' + entity.id + ' ' + style)
	entity.dom_element.setAttribute('style', style)
	entity.dom_element.style.display = 'none'
	entity.dom_element.style.position = 'fixed'
	console.log('New ' + class_name + ' ' + entity.id) // + ' Style: ' + util.inspect(entity.dom_element.style))
	// console.log('New ' + class_name + ' ' + entity.id + ' Style: ' + util.inspect(dom_element.style))

	entity.element.parents.forEach(function(parent_entity) {
		parent_entity.dom_element.appendChild(entity.dom_element)
	})
	entity.element.childs.forEach(function(child_entity) {
		child_entity.player = new SwPlaylist(child_entity)
	})
	return {
		play: function() {
			if (is_playing) {
				return
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
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
			console.log('stop ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
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


function SwPlaylist(entity) {
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwPlaylist'
	entity.dom_element = document.createElement('div')
	entity.dom_element.appendChild(document.createTextNode(class_name + ': ' + entity.id))
	entity.dom_element.setAttribute('class', class_name)
	entity.dom_element.setAttribute('id', entity.id)
	entity.dom_element.setAttribute('style', 'background-color:cyan; left:0; right:0; top:0; bottom:0;')
	entity.dom_element.style.display = 'none'
	entity.dom_element.style.position = 'absolute'
	console.log('New ' + class_name + ' ' + entity.id) // + ' Style: ' + util.inspect(entity.dom_element.style))
	// console.log('New ' + class_name + ' ' + entity.id + ' Style: ' + util.inspect(dom_element.style))

	entity.element.parents.forEach(function(parent_entity) {
		parent_entity.dom_element.appendChild(entity.dom_element)
	})
	entity.element.childs.forEach(function(child_entity) {
		child_entity.player = new SwPlaylistMedia(child_entity)
	})

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
			console.log('play ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
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
			console.log('stop ' + class_name + ' ' + entity.id + ' css.display: ' + dom_element.style.display)
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


function SwPlaylistMedia(entity) {
	// this.temp_ordinal = element.properties.ordinal.values[0]
	var medias = this.medias = []
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwPlaylistMedia'
	entity.dom_element = document.createElement('div')
	entity.dom_element.appendChild(document.createTextNode(class_name + ': ' + entity.id))
	entity.dom_element.setAttribute('class', class_name)
	entity.dom_element.setAttribute('id', entity.id)
	var style = 'background-color:pink;'
	entity.dom_element.setAttribute('style', style)
	entity.dom_element.style.display = 'none'
	entity.dom_element.style.position = 'absolute'
	console.log('New ' + class_name + ' ' + entity.id) // + ' Style: ' + util.inspect(entity.dom_element.style))
	// console.log('New ' + class_name + ' ' + entity.id + ' Style: ' + util.inspect(dom_element.style))


	entity.element.parents.forEach(function(parent_entity) {
		parent_entity.dom_element.appendChild(entity.dom_element)
	})
	entity.element.childs.forEach(function(child_entity) {
		child_entity.player = new SwMedia(child_entity)
	})

	var stop = function stop() {
		if (!is_playing) {
			return
		}
		is_playing = false
		entity.dom_element.style.display = 'none'
		console.log('stop ' + class_name + ' ' + entity.id)// + ' style: ' + util.inspect(dom_element.style))
		if (element.next !== undefined)
			element.next.element.play()
		medias.forEach(function(media) {
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
			console.log('play ' + class_name + ' ' + entity.id)// + ' style: ' + util.inspect(dom_element.style))
			console.log(util.inspect({'medias[0].element.mediatype()':medias[0].element.mediatype()}))

			var media_dom_element = medias[0].element.play()
			console.log(util.inspect(media_dom_element.style))
			if (medias[0].element.mediatype() === 'Video') {
				// console.log(util.inspect(media_dom_element))
				media_dom_element.addEventListener('pause', function() {
					window.alert(util.inspect(element.next.element))
					element.next.element.play()
				})
			}

			// console.log('setTimeout STOP this ' + entity.id + ' and PLAY next ' + element.next.id + ' playlist_media at ' + util.inspect(stopDate))
			// console.log(util.inspect(element.next.element))
			// setTimeout(console.log('got to PLAY ' + element.next.id), stopDate - Date.now)
			// setTimeout(element.next.element.play, stopDate - Date.now())
			// setTimeout(stop, stopDate - Date.now())
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


function SwMedia(entity) {
	var mediatype = entity.element.properties.type.values[0]
	var document = window.document
	var is_playing = this.is_playing = false
	var class_name = 'SwMedia'
	if (mediatype === 'Video') {
		entity.dom_element = document.createElement('video')
		entity.dom_element.autoplay = false
		entity.dom_element.controls = true
		entity.dom_element.preload = 'auto'
		entity.dom_element.width = '100'
		entity.dom_element.height = '100'
		var source_element = document.createElement('source')
		source_element.type = 'video/webm'
		source_element.src = entity.element.properties.filepath.values[0]
		entity.dom_element.appendChild(source_element)
		// entity.dom_element.addEventListener('pause', function() {
		// 	entity.dom_element.currentTime = 0
		// })
		// entity.dom_element.addEventListener('ended', function() {
		// 	entity.dom_element.currentTime = 0
		// })
	} else {
		entity.dom_element = document.createElement('div')
		entity.dom_element.appendChild(document.createTextNode(class_name + ': ' + entity.id))
	}


	var stopDate
	entity.dom_element.setAttribute('class', class_name)
	entity.dom_element.setAttribute('id', entity.id)
	var style = 'background-color:purple;'
	entity.dom_element.setAttribute('style', style)
	entity.dom_element.style.display = 'none'
	entity.dom_element.style.position = 'absolute'

	entity.element.parents.forEach(function(parent_entity) {
		console.log(util.inspect(parent_entity))
		parent_entity.dom_element.appendChild(entity.dom_element)
	})
	// document.getElementById(this.parent.id).appendChild(entity.dom_element)
	console.log('New ' + class_name + ' ' + entity.id) // + ' Style: ' + util.inspect(entity.dom_element.style))
	// console.log('New ' + class_name + ' ' + entity.id + ' Style: ' + util.inspect(dom_element.style))

	return {
		play: function() {
			if (is_playing) {
				return dom_element
			}
			is_playing = true
			dom_element.style.display = 'block'
			console.log('play ' + class_name + ' ' + entity.id + ' style: ' + util.inspect(dom_element.style))
			if (mediatype === 'Video') {
				dom_element.play()
			}
			return dom_element
		},
		stop: function() {
			if (!is_playing) {
				return
			}
			is_playing = false
			dom_element.style.display = 'none'
			console.log('stop ' + class_name + ' ' + entity.id)// + ' style: ' + util.inspect(dom_element.style))
			if (mediatype === 'Video') {
				dom_element.pause()
			}
		},
		stopDate: function() {
			return stopDate
		},
		mediatype: function() {
			return mediatype
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
