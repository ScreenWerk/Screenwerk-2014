var util   = require("util")
var later  = require("later")
var events = require('events')
var fs     = require('fs')
// var helper = require('./helper')

var swEmitter = new events.EventEmitter()


var console = window.console

// var consoleStream = fs.createWriteStream('./console.log', {flags:'a'})
// var sysLogStream = fs.createWriteStream('./system.log', {flags:'a'})


function SwPlayer(screen_id) {
	return {
		restart: function(screen_dom_element) {
			window.swLog('Starting ScreenWerk player for screen ' + screen_id)
			screen_dom_element.player = new SwScreen(screen_dom_element)
			return screen_dom_element.player.play()
		}
	}
}


function SwScreen(dom_element) {
	var is_playing = this.is_playing = false
	var entity = dom_element.swElement
	var element = dom_element.swElement.element
	var properties = dom_element.swElement.element.properties

	// window.swLog(entity.definition + ' ' + entity.id + ' has ' + dom_element.childNodes.length + ' childNodes.')
	for (var key=0; key<dom_element.childNodes.length; key++) {
		var child_node = dom_element.childNodes[key]
		child_node.player = new SwScreenGroup(child_node)
	}
	return {
		play: function() {
			if (is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			window.swLog('|-- PLAY ' + entity.definition + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.play()
			}
			return true
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition)
			is_playing = false
			dom_element.style.display = 'none'
			window.swLog('|-- STOP ' + entity.definition + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.stop()
			}
		},
		clear: function() {
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.clear()
			}
		}
	}
}


function SwScreenGroup(dom_element) {
	var is_playing = this.is_playing = false
	var entity = dom_element.swElement
	var element = dom_element.swElement.element
	var properties = dom_element.swElement.element.properties
	// window.swLog(entity.definition + ' ' + entity.id + ' has ' + dom_element.childNodes.length + ' childNodes.')
	for (var key=0; key<dom_element.childNodes.length; key++) {
		var child_node = dom_element.childNodes[key]
		child_node.player = new SwConfiguration(child_node)
	}
	return {
		play: function() {
			if (is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			window.swLog('|-- PLAY ' + entity.definition + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.play()
			}
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition)
			is_playing = false
			dom_element.style.display = 'none'
			window.swLog('|-- STOP ' + entity.definition + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.stop()
			}
		},
		clear: function() {
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.clear()
			}
		}
	}
}


function SwConfiguration(dom_element) {
	var is_playing = this.is_playing = false
	var entity = dom_element.swElement
	var element = dom_element.swElement.element
	var properties = dom_element.swElement.element.properties

	window.swLog('New ' + entity.definition + ' ' + entity.id) // + ' Style: ' + util.inspect(entity.dom_element.style))
	// window.swLog(entity.definition + ' ' + entity.id + ' has ' + dom_element.childNodes.length + ' childNodes.')
	for (var key=0; key<dom_element.childNodes.length; key++) {
		var child_node = dom_element.childNodes[key]
		child_node.player = new SwSchedule(child_node)
	}

	return {
		play: function() {
			if (is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			window.swLog('|-- PLAY ' + entity.definition + ' ' + entity.id)
			var schedules = []
			for (var key=0; key<dom_element.childNodes.length; key++) {
				// window.swLog(key + ':' + typeof dom_element.childNodes[key])
				schedules.push(dom_element.childNodes[key].player)
			}
			//
			// Layouts should show up right now. Scheduled layouts will play later
			schedules.sort(function compare(a,b) {
				if (a.prev().getTime() > b.prev().getTime())
					return 1
				if (a.prev().getTime() < b.prev().getTime())
					return -1
				return 0
			})
			// window.swLog(util.inspect({'schedules: ': schedules}, {depth: 6}))
			schedules.forEach( function(schedule) {
				window.swLog(schedule.id() + ' - ' + schedule.prev())
			})
			schedules.forEach( function(schedule) {
				schedule.playLayouts() // Start playing current content immediately
				schedule.play()        // Continue with schedules according to crontab
			})
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition)
			is_playing = false
			dom_element.style.display = 'none'
			window.swLog('|-- STOP ' + entity.definition + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.stop()
			}
		},
		clear: function() {
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.clear()
			}
		}
	}
}


function SwSchedule(dom_element) {
	var entity = dom_element.swElement
	var element = dom_element.swElement.element
	var properties = dom_element.swElement.element.properties

	var cleanupLayer = element.properties['ordinal'].values[0].db_value
	var cleanup = this.cleanup = element.properties['cleanup'].values[0].db_value
	var document = window.document
	var is_playing = this.is_playing = false
	window.swLog('New ' + entity.definition + ' ' + entity.id)
	window.swLog('|-- ' + util.inspect({'cleanup':cleanup, 'cleanupLayer':cleanupLayer}))

	// window.swLog(util.inspect(entity.element.properties.crontab.values[0]))
	var cronSched = this.cronSched = later.parse.cron(entity.element.properties.crontab.values[0].db_value)
	// window.swLog(util.inspect(cronSched))
	if (entity.element.properties['valid-from'].values !== undefined) {
		var startDate = entity.element.properties['valid-from'].values[0]
		var startTime = (startDate.getTime());
		cronSched.schedules[0].fd_a = [startTime];
	}
	if (entity.element.properties['valid-to'].values !== undefined) {
		var endDate = new Date(entity.element.properties['valid-to'].values[0].db_value)
		var endTime = (endDate.getTime());
		cronSched.schedules[0].fd_b = [endTime];
	}
	// window.swLog(entity.definition + ' ' + entity.id + ' has ' + dom_element.childNodes.length + ' childNodes.')
	for (var key=0; key<dom_element.childNodes.length; key++) {
		var child_node = dom_element.childNodes[key]
		child_node.player = new SwLayout(child_node)
	}
	// window.swLog('There are ' + layouts.length + ' layouts in schedule ' + entity.id)
	var playLayouts = function playLayouts() {
		window.swLog(' DOM id: ' + dom_element.id + '. ' + entity.definition + ' attempting play on ' + dom_element.childNodes.length + ' layouts')
		for (var key=0; key<dom_element.childNodes.length; key++) {
			dom_element.childNodes[key].player.play()
		}
		//
		// !NB: if schedule has cleanup = true, then stop any other schedules on same or lower layers
		if (cleanup === 1) {
			// window.swLog(util.inspect(dom_element.parentNode.childNodes.length, {depth:6}))
			for (var key=0; key<dom_element.parentNode.childNodes.length; key++) {
				var sibling_node = dom_element.parentNode.childNodes[key]
				// window.swLog(util.inspect(sibling_node.swElement.id))
				// window.swLog('Schedule ' + util.inspect(entity.id))
				if (entity.id === sibling_node.swElement.id)
					continue
				// window.swLog(util.inspect(schedule,{depth:6}))
				sibling_node_cleanup_layer = sibling_node
					.swElement
					.element
					.properties.ordinal
					.values[0].db_value
				window.swLog('Schedule ' + util.inspect(entity.id)
					+ ' sibling_node_cleanup_layer LE cleanupLayer ' + sibling_node_cleanup_layer + ' LE ' + cleanupLayer
					+ ' checking for cleanup of schedule ' + sibling_node.swElement.id)
				if (sibling_node_cleanup_layer <= cleanupLayer) {
					window.swLog('|-- Schedule ' + entity.id + ' cleaning up schedule ' + sibling_node.swElement.id)
					sibling_node.player.stopLayouts()
				}
			}
		}
	}
	var stopLayouts = function stopLayouts() {
		window.swLog(' DOM id: ' + dom_element.id + '. ' + entity.definition + ' attempting stop on ' + dom_element.childNodes.length + ' layouts')
		for (var key=0; key<dom_element.childNodes.length; key++) {
			dom_element.childNodes[key].player.stop()
		}
	}
	return {
		play: function() {
			if (is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			timer = swSetInterval(playLayouts, cronSched, startDate, endDate)
			window.swLog('|-- PLAY ' + entity.definition + ' ' + entity.id + ' - Scheduled for ' + later.schedule(cronSched).next(1))
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition)
			is_playing = false
			dom_element.style.display = 'none'
			window.swLog('|-- STOP ' + entity.definition + ' ' + entity.id)
			// window.swLog(util.inspect(layouts,{depth:6}))
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.stop()
			}
		},
		clear: function() {
			timer.clear()
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.clear()
			}
		},
		cleanupLayer: function() {
			return cleanupLayer
		},
		prev: function() {
			return later.schedule(cronSched).prev(1);
		},
		playLayouts: function() {
			playLayouts()
		},
		stopLayouts: function() {
			stopLayouts()
		},
		id: function() {
			return entity.id
		}
	}
}


function SwLayout(dom_element) {
	var entity = dom_element.swElement
	var element = dom_element.swElement.element
	var properties = dom_element.swElement.element.properties

	var is_playing = this.is_playing = false
	window.swLog('New ' + entity.definition + ' ' + entity.id)
	for (var key=0; key<dom_element.childNodes.length; key++) {
		var child_node = dom_element.childNodes[key]
		child_node.player = new SwLayoutPlaylist(child_node)
	}
	return {
		play: function() {
			if (is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			window.swLog('|-- PLAY ' + entity.definition + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.play()
			}
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition)
			is_playing = false
			dom_element.style.display = 'none'
			window.swLog('|-- STOP ' + entity.definition + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.stop()
			}
		},
		clear: function() {
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.clear()
			}
		}
	}
}


function SwLayoutPlaylist(dom_element) {
	var entity = dom_element.swElement
	var element = dom_element.swElement.element
	var properties = dom_element.swElement.element.properties

	var is_playing = false
	window.swLog('New ' + entity.definition + ' ' + entity.id)
	for (var key=0; key<dom_element.childNodes.length; key++) {
		var child_node = dom_element.childNodes[key]
		child_node.player = new SwPlaylist(child_node)
	}

	return {
		play: function() {
			if (is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			window.swLog('|-- PLAY ' + entity.definition + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.play()
			}
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition)
			is_playing = false
			dom_element.style.display = 'none'
			window.swLog('|-- STOP ' + entity.definition + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.stop()
			}
		},
		clear: function() {
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.clear()
			}
		}
	}
}


function SwPlaylist(dom_element) {
	var entity = dom_element.swElement
	var element = dom_element.swElement.element
	var properties = dom_element.swElement.element.properties

	var is_playing = this.is_playing = false
	window.swLog('New ' + entity.definition + ' ' + entity.id)
	for (var key=0; key<dom_element.childNodes.length; key++) {
		var child_node = dom_element.childNodes[key]
		child_node.player = new SwPlaylistMedia(child_node)
	}

	return {
		play: function() {
			if (is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			window.swLog('|-- PLAY ' + entity.definition + ' ' + entity.id)
			dom_element.childNodes[0].player.play()
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition)
			is_playing = false
			dom_element.style.display = 'none'
			window.swLog('|-- STOP ' + entity.definition + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.stop()
			}
		},
		clear: function() {
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.clear()
			}
		}
	}
}


function SwPlaylistMedia(dom_element) {
	var document = window.document
	var entity = dom_element.swElement
	var element = dom_element.swElement.element
	var properties = dom_element.swElement.element.properties
	var is_playing = this.is_playing = false
	window.swLog('New ' + entity.definition + ' ' + entity.id) // + ' Style: ' + util.inspect(entity.dom_element.style))
	// window.swLog('New ' + entity.definition + ' ' + entity.id + ' Style: ' + util.inspect(dom_element.style))

	// window.swLog(entity.definition + ' ' + entity.id + ' has ' + dom_element.childNodes.length + ' childNodes.')
	var medias = []
	for (var key=0; key<dom_element.childNodes.length; key++) {
		var child_node = dom_element.childNodes[key]
		// window.swLog('key:' + key + ': ' + typeof child_node)

		var muted = false
		if (properties.mute.values !== undefined) {
			if (properties.mute.values[0].db_value == 1) {
				muted = true
			}
		}

		var duration_ms = undefined
		if (properties.duration.values !== undefined)
			duration_ms = Number(properties.duration.values[0].db_value) * 1000

		var delay_ms = 0
		if (properties.delay.values !== undefined)
			delay_ms = Number(properties.delay.values[0].db_value) * 1000

		child_node.player = new SwMedia(child_node, muted, duration_ms)
		medias.push(child_node.player)
	}

	swEmitter.on('ended' + entity.id, function() {
		window.swLog('ended event for ' + entity.id)
		// window.alert('ended event for ' + entity.id)
		stop()
		if (entity.next !== undefined)
			swEmitter.emit('requested' + entity.next.id)
	})
	swEmitter.on('requested' + entity.id, function() {
		window.swLog('requested event for ' + entity.id + ' delay ' + delay_ms)
		window.setTimeout(play, delay_ms)

	})

	var play = function play() {
		if (is_playing) {
			return false
		}
		window.swLog(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition)
		if (properties['valid-to'] !== undefined)
			if (properties['valid-to'].values !== undefined) {
				var vt_date = new Date(properties['valid-to'].values[0].db_value)
				if (vt_date.getTime() < Date.now()) {
					if (entity.next !== undefined) false
						swEmitter.emit('requested' + entity.next.id)
					return
				}
			}

		is_playing = true
		dom_element.style.display = 'block'
		window.swLog('|-- PLAY ' + entity.definition + ' ' + entity.id)
		// window.swLog(util.inspect({'medias':medias, 'medias[0].mediatype()':medias[0].mediatype()}, {depth:null}))


		medias.forEach( function(media) {
			media.play()
		})
		// var media_dom_element = medias[0].play()
		// window.swLog(util.inspect(media_dom_element.style))
		// if (medias[0].mediatype() === 'Video') {
		// 	// window.swLog(util.inspect(media_dom_element))
		// 	media_dom_element.addEventListener('ended', function() {
		// 		window.alert(util.inspect(element.next.element))
		// 		element.next.element.play()
		// 	})
		// }
	}
	var stop = function stop() {
		if (!is_playing) {
			return false
		}
		window.swLog(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition)
		is_playing = false
		dom_element.style.display = 'none'
		window.swLog('|-- STOP ' + entity.definition + ' ' + entity.id)
		// window.swLog('entity: ' + util.inspect(entity, {depth:5}))
		medias.forEach( function(media) {
			media.stop()
		})
	}
	return {
		play: function() {
			return play()
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


//
function SwMedia(dom_element, muted, duration_ms) {
	var document = window.document
	var entity = dom_element.swElement
	var element = dom_element.swElement.element
	var properties = dom_element.swElement.element.properties

	var is_playing = this.is_playing = false
	// window.swLog(util.inspect(entity.element.properties.type.values))
	var mediatype = entity.element.properties.type.values === undefined ? '#NA' : entity.element.properties.type.values[0].value
	var media_dom_element = {}

	if (mediatype === 'Video') {
		// var p = document.createElement('P')
		// p.appendChild(document.createTextNode('VIDEO ' + entity.definition + ': ' + entity.id))
		// p.style.float = 'left'
		// p.style.color = 'gray'
		// dom_element.appendChild(p)
		media_dom_element = document.createElement('VIDEO')
		var filename = entity.element.properties.file.values[0].value
		var mimetype = 'video/' + filename.split('.')[filename.split('.').length-1]
		media_dom_element.type = mimetype
		window.swLog(mimetype)
		media_dom_element.src = entity.element.properties.filepath.values[0].db_value
		media_dom_element.overflow = 'hidden'
		dom_element.appendChild(media_dom_element)
		media_dom_element.autoplay = false
		media_dom_element.controls = false
		media_dom_element.muted = muted
		// media_dom_element.addEventListener('pause', function() {
		// 	// media_dom_element.currentTime = 0
		// })
		media_dom_element.addEventListener('ended', function() {
			swEmitter.emit('ended' + dom_element.id.split('_')[0])
			// window.alert('ended')
			// media_dom_element.currentTime = 0
		})

	} else if (mediatype === 'Image') {
		media_dom_element = document.createElement('IMG')
		// window.swLog(util.inspect(entity.element.properties.filepath.values[0]))
		media_dom_element.src = entity.element.properties.filepath.values[0].db_value
		dom_element.appendChild(media_dom_element)

	} else if (mediatype === 'URL') {
		media_dom_element = document.createElement('IFRAME')
		// window.swLog(util.inspect(entity.element.properties.filepath.values[0]))
		media_dom_element.src = entity.element.properties.url.values[0].db_value
		media_dom_element.width = '100%'
		media_dom_element.height = '100%'
		media_dom_element.scrolling = 'no'
		dom_element.appendChild(media_dom_element)
		var ifrst = media_dom_element.contentWindow.document.body.style
		ifrst.overflow = 'hidden'
	} else {
		dom_element.appendChild(document.createTextNode(mediatype + ' ' + entity.definition + ': ' + entity.id))
	}

	window.swLog('New ' + entity.definition + ' ' + entity.id) // + ' Style: ' + util.inspect(entity.dom_element.style))

	return {
		play: function() {
			// ctrw.show(dom_element.id)
			if (is_playing) {
				return dom_element
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting PLAY')
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return dom_element
				}

			is_playing = true
			dom_element.style.display = 'block'
			window.swLog('|-- PLAY ' + entity.definition + ' ' + entity.id)
			if (mediatype === 'Video') {
				if (media_dom_element.play === undefined) {
					window.swLog(util.inspect(media_dom_element,{depth:1}))
					window.swLog('No play() function!!! for ' + dom_element.id + ' - aborting.')
					throw ('\n\nThere is no play() method available for media ' + dom_element.id + ' (check your data at /api2/entity-' + entity.id + ')\nIt may as well be fault of ffmpegsumo library distributed with chromium.')
				} else
					media_dom_element.play()
				// window.swLog(util.inspect(dom_element.childNodes[0]))
				// dom_element.play()
			} else if (mediatype === 'URL') {
				// media_dom_element.play()
				// window.swLog(util.inspect(dom_element.childNodes[0]))
				// dom_element.play()
			}
			if (duration_ms !== undefined) {
				// window.swLog(' DOM id: ' + dom_element.id + '. duration_ms ' + duration_ms)
				window.setTimeout(function() {swEmitter.emit('ended' + dom_element.id.split('_')[0])}, duration_ms)
			}
		},
		stop: function() {
			// ctrw.hide(dom_element.id)
			if (!is_playing) {
				return false
			}
			window.swLog(' DOM id: ' + dom_element.id + '. Attempting STOP')
			is_playing = false
			dom_element.style.display = 'none'
			window.swLog('|-- STOP ' + entity.definition + ' ' + entity.id)// + ' style: ' + util.inspect(dom_element.style))
			if (mediatype === 'Video') {
				media_dom_element.pause()
				window.swLog('|-- Video ' + entity.definition + ' ' + entity.id)// + ' style: ' + util.inspect(dom_element.style))
				if (media_dom_element.readyState > 0) {
					media_dom_element.currentTime = 0
					window.swLog('|-- readyState ' + media_dom_element.readyState + ' ' + entity.id)// + ' style: ' + util.inspect(dom_element.style))
				}
			}
		},
		mediatype: function() {
			return mediatype
		},
		mediaDomElement: function() {
			return media_dom_element
		}

		// clear: function() {}
	}
}
// SwMedia.prototype.__proto__ = events.EventEmitter.prototype


var swSetTimeout = function(fn, sched, startDate, endDate) {
	if (endDate !== undefined ? endDate < Date.now() : false) {
		return {
			clear: function() {
				return
			}
		}
	}
	// window.swLog('Timeout set for: ' + util.inspect({'fn':fn, 'sched':sched}, {depth:null}))
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
	// window.swLog('Setting interval for function ' + util.inspect(fn))
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
