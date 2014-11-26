var util   = require("util")
var events = require('events')
var fs     = require('fs')
// var helper = require('./helper')

var swEmitter = new events.EventEmitter()


var console = window.console

// var consoleStream = fs.createWriteStream('./console.log', {flags:'a'})
// var sysLogStream = fs.createWriteStream('./system.log', {flags:'a'})


function SwPlayer(err, dom_element, callback) {
	if (err) {
		console.log('SwPlayer err:', err, dom_element.swElement)
		callback(err)
	}
	// console.log('SwPlayer:', dom_element.swElement)
	if (dom_element.swElement == null) {
		callback('foo', dom_element)
		return
	}
	var is_playing = false
	var element = dom_element.swElement
	var properties = element.properties

	// TODO: Consider forEach
	if (element.definition.keyname !== 'sw-media') {
		for (var key=0; key<dom_element.childNodes.length; key++) {
			var child_node = dom_element.childNodes[key]
			// console.log(typeof child_node)
			// console.log(child_node)
			child_node.player = new SwPlayer(null, child_node, callback)
		}
	}

	return {
		play: function(err, timeout, callback) {
			if (err) {
				console.log('SwPlayer.play err:', err, element.id)
				return this
			}
			// console.log('Attempting PLAY on ' + element.definition.keyname + ' ' + element.id)
			if (properties['valid-from'] !== undefined) {
				if (properties['valid-from'].values !== undefined) {
					var vf_date = new Date(properties['valid-from'].values[0].db_value)
					if (vf_date.getTime() > Date.now()) {
						console.log('DOM id: ' + element.id + ' valid-from not reached.', properties['valid-from'].values[0].db_value)
						callback('not valid until', vf_date.getTime(), element.id)
						return this
					}
				}
			}
			if (properties['valid-to'] !== undefined) {
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now()) {
						console.log('DOM id: ' + element.id + ' valid-to expired.', properties['valid-to'].values[0].db_value)
						callback('expired', element.id)
						return this
					}
				}
			}
			if (timeout && timeout > 0) {
				var self = this
				console.log(dom_element.id + ' Scheduling PLAY on ' + element.definition.keyname + ' ' + element.id + ' in ' + msToTime(timeout))
				sw_timeouts.push(setTimeout(function() {
									self.play(null, false, callback)
								}, timeout))
				return self
			}
			console.log(dom_element.id + ' PLAY ' + element.definition.keyname + ' ', is_playing ? '(Already playing)' : '(Was stopped)')
			if (is_playing === true)
				return this
			is_playing = true
			dom_element.style.display = 'block'

			switch (element.definition.keyname) {
				case 'sw-screen':
					dom_element.childNodes[0].player.play(null, 0, function(){})
				break
				case 'sw-screen-group':
					dom_element.childNodes[0].player.play(null, 0, function(){})
				break
				case 'sw-configuration':
					var schedule_nodes = []
					for (var key=0; key<dom_element.childNodes.length; key++) {
						schedule_nodes.push(dom_element.childNodes[key])
					}

					schedule_nodes.sort(function compare(a,b) {
						if (a.swElement.laterSchedule.prev().getTime() > b.swElement.laterSchedule.prev().getTime())
							return 1
						if (a.swElement.laterSchedule.prev().getTime() < b.swElement.laterSchedule.prev().getTime())
							return -1
						return 0
					})

					schedule_nodes.forEach(function(child_node) {
						child_node.player.play(null, 0, function(){})
					})
				break
				case 'sw-schedule':
					dom_element.childNodes[0].player.play(null, 0, function(){})

					if (properties['cleanup'].values[0].db_value === 1) {
						var cleanupLayer = properties['ordinal'].values[0].db_value
						for (var key=0; key<dom_element.parentNode.childNodes.length; key++) {
							var sibling_node = dom_element.parentNode.childNodes[key]
							if (element.id === sibling_node.swElement.id) {
								continue
							}
							if (sibling_node.is_playing === false) {
								continue
							}
							// console.log(util.inspect(schedule,{depth:6}))
							var sibling_node_cleanup_layer = sibling_node.swElement.properties.ordinal.values[0].db_value
							// console.log('Schedule ' + util.inspect(element.id)
							// 	+ ' sibling_node_cleanup_layer LE cleanupLayer ' + sibling_node_cleanup_layer + ' LE ' + cleanupLayer
							// 	+ ' checking for cleanup of schedule ' + sibling_node.swElement.id)
							if (sibling_node_cleanup_layer <= cleanupLayer) {
								// console.log('|-- Schedule ' + element.id + ' cleaning up schedule ' + sibling_node.swElement.id)
								sibling_node.player.stop()
							}
						}
					}
					if (properties.duration.values !== undefined) {
						var time_from_start = Date.now() - element.laterSchedule.prev().getTime()
						var time_to_play = properties.duration.values[0].db_value * 1000 - time_from_start
						if (time_to_play < 0)
							time_to_play = 0
						// console.log(msToTime(time_from_start) + ' passed, ' + msToTime(time_to_play) + ' left.')
						this.stop(null, time_to_play, function(){})
					}
				break
				case 'sw-layout':
					for (var key=0; key<dom_element.childNodes.length; key++) {
						dom_element.childNodes[key].player.play(null, 0, function(){})
					}
				break
				case 'sw-layout-playlist':
					dom_element.childNodes[0].player.play(null, 0, function(){})
				break
				case 'sw-playlist':
					dom_element.childNodes[0].player.play(null, 0, function(){})
				break
				case 'sw-playlist-media':
					if (dom_element.childNodes.length > 0) {
						dom_element.childNodes[0].player.play(null, 0, function(){})
					}
					if (properties.duration.values !== undefined) {
						this.stop(null, Number(properties.duration.values[0].db_value) * 1000, function(){})
					}
				break
				case 'sw-media':
					var mediatype = properties.type.values === undefined ? '#NA' : properties.type.values[0].value
					if (mediatype === 'Video') {
						var media_dom_element = dom_element.childNodes[0]
						media_dom_element.play()
						if (media_dom_element.has_event_listener === undefined) {
							media_dom_element.has_event_listener = true
							media_dom_element.addEventListener('ended', function() {
								dom_element.parentNode.player.stop(null, 0, function(){})
							})
						}

					} else if (mediatype === 'Image' || mediatype === 'URL') {
					} else {
					}

				break
				default:
					callback('Unrecognised definition: ' + element.definition.keyname, swElement)
					return
			}
			return this
		},
		stop: function(err, timeout, callback) {
			if (err) {
				console.log('SwPlayer.play err:', err, element.id)
				return this
			}
			if (timeout && timeout > 0) {
				var self = this
				console.log(dom_element.id + ' Scheduling STOP on ' + element.definition.keyname + ' ' + element.id + ' in ' + msToTime(timeout))
				sw_timeouts.push(setTimeout(function() {
									self.stop(null, false, callback)
								}, timeout))
				return self
			}
			console.log(dom_element.id + ' STOP ' + element.definition.keyname, is_playing ? '(Was playing)' : '(Already stopped)')
			if (is_playing === false)
				return this
			is_playing = false
			dom_element.style.display = 'none'

			switch (element.definition.keyname) {
				case 'sw-screen':
					dom_element.childNodes[0].player.stop()
				break
				case 'sw-screen-group':
					dom_element.childNodes[0].player.stop()
				break
				case 'sw-configuration':
					for (var key=0; key<dom_element.childNodes.length; key++) {
						dom_element.childNodes[key].player.stop()
					}
				break
				case 'sw-schedule':
					dom_element.childNodes[0].player.stop()
					this.play(null, element.laterSchedule.next().getTime() - Date.now(), function(){})
				break
				case 'sw-layout':
					for (var key=0; key<dom_element.childNodes.length; key++) {
						dom_element.childNodes[key].player.stop()
					}
				break
				case 'sw-layout-playlist':
					dom_element.childNodes[0].player.stop()
				break
				case 'sw-playlist':
					for (var key=0; key<dom_element.childNodes.length; key++) {
						dom_element.childNodes[key].player.stop()
					}
				break
				case 'sw-playlist-media':
					dom_element.childNodes[0].player.stop()
				break
				case 'sw-media':
					return this
				break
				default:
					callback('Unrecognised definition: ' + element.definition.keyname, swElement)
					return this
			}
			if (element.next !== undefined ) {
				var next_eid = element.next
				var next_dom_id = dom_element.parentNode.id + '_' + next_eid
				console.log(dom_element.id + ' STOPPED, coming up:', next_dom_id)
				var delay_ms = __DEFAULT_DELAY_MS
				if (properties.delay.values !== undefined)
					delay_ms = Number(properties.delay.values[0].db_value) * 1000
				document.getElementById(next_dom_id).player.play(null, delay_ms, callback)
			}
			return this
		},
		restart: function(err, callback) {
			console.log('RESTART ' + element.id, 'Current state: ' + (is_playing ? 'playing' : 'stopped'))
			return this.stop(null, 0, function(err, data) {
				if (err) {
					console.log('SwPlayer.restart err:', err, data)
					callback(err, data)
				}
			}).play(null, 0, function(err, data) {
				if (err) {
					console.log('SwPlayer.restart err:', err, data)
					callback(err, data)
				}
			})
		},
		childs: function() {
			return dom_element.childNodes
		}
	}
}


function SwScreen(dom_element) {
	var is_playing = this.is_playing = false
	var entity = dom_element.swElement
	var element = entity
	var properties = element.properties

	return {
		play: function() {
			if (is_playing) {
				return false
			}
			console.log(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition.keyname)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			// console.log('|-- PLAY ' + entity.definition.keyname + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.play()
			}
			return true
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			// console.log(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition.keyname)
			is_playing = false
			dom_element.style.display = 'none'
			// console.log('|-- STOP ' + entity.definition.keyname + ' ' + entity.id)
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
	var element = entity
	var properties = element.properties
	// console.log(entity.definition.keyname + ' ' + entity.id + ' has ' + dom_element.childNodes.length + ' childNodes.')
	return {
		play: function() {
			if (is_playing) {
				return false
			}
			console.log(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition.keyname)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			// console.log('|-- PLAY ' + entity.definition.keyname + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.play()
			}
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			// console.log(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition.keyname)
			is_playing = false
			dom_element.style.display = 'none'
			// console.log('|-- STOP ' + entity.definition.keyname + ' ' + entity.id)
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
	var element = entity
	var properties = element.properties

	return {
		play: function() {
			if (is_playing) {
				return false
			}
			console.log(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition.keyname)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			// console.log('|-- PLAY ' + entity.definition.keyname + ' ' + entity.id)
			var schedules = []
			for (var key=0; key<dom_element.childNodes.length; key++) {
				// console.log(key + ':' + typeof dom_element.childNodes[key])
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
			// console.log(util.inspect({'schedules: ': schedules}, {depth: 6}))
			schedules.forEach( function(schedule) {
				console.log(schedule.id() + ' - ' + schedule.prev())
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
			// console.log(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition.keyname)
			is_playing = false
			dom_element.style.display = 'none'
			// console.log('|-- STOP ' + entity.definition.keyname + ' ' + entity.id)
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
	var element = entity
	var properties = element.properties

	var cleanupLayer = element.properties['ordinal'].values[0].db_value
	var cleanup = this.cleanup = element.properties['cleanup'].values[0].db_value
	var document = window.document
	var is_playing = this.is_playing = false
	console.log('New ' + entity.definition.keyname + ' ' + entity.id)

	var cronSched = this.cronSched = later.parse.cron(properties.crontab.values[0].db_value)
	if (properties['valid-from'].values !== undefined) {
		var startDate = properties['valid-from'].values[0]
		var startTime = (startDate.getTime());
		cronSched.schedules[0].fd_a = [startTime];
	}
	if (properties['valid-to'].values !== undefined) {
		var endDate = new Date(properties['valid-to'].values[0].db_value)
		var endTime = (endDate.getTime());
		cronSched.schedules[0].fd_b = [endTime];
	}
	for (var key=0; key<dom_element.childNodes.length; key++) {
		var child_node = dom_element.childNodes[key]
		child_node.player = new SwLayout(child_node)
	}
	var playLayouts = function playLayouts() {
		console.log(' DOM id: ' + dom_element.id + '. ' + entity.definition.keyname + ' attempting play on ' + dom_element.childNodes.length + ' layouts')
		for (var key=0; key<dom_element.childNodes.length; key++) {
			dom_element.childNodes[key].player.play()
		}
		//
		// !NB: if schedule has cleanup = true, then stop any other schedules on same or lower layers
		if (cleanup === 1) {
			// console.log(util.inspect(dom_element.parentNode.childNodes.length, {depth:6}))
			for (var key=0; key<dom_element.parentNode.childNodes.length; key++) {
				var sibling_node = dom_element.parentNode.childNodes[key]
				// console.log(util.inspect(sibling_node.swElement.id))
				// console.log('Schedule ' + util.inspect(entity.id))
				if (entity.id === sibling_node.swElement.id)
					continue
				// console.log(util.inspect(schedule,{depth:6}))
				sibling_node_cleanup_layer = sibling_node
					.swElement
					.element
					.properties.ordinal
					.values[0].db_value
				console.log('Schedule ' + util.inspect(entity.id)
					+ ' sibling_node_cleanup_layer LE cleanupLayer ' + sibling_node_cleanup_layer + ' LE ' + cleanupLayer
					+ ' checking for cleanup of schedule ' + sibling_node.swElement.id)
				if (sibling_node_cleanup_layer <= cleanupLayer) {
					// console.log('|-- Schedule ' + entity.id + ' cleaning up schedule ' + sibling_node.swElement.id)
					sibling_node.player.stopLayouts()
				}
			}
		}
	}
	var stopLayouts = function stopLayouts() {
		for (var key=0; key<dom_element.childNodes.length; key++) {
			dom_element.childNodes[key].player.stop()
		}
	}
	return {
		play: function() {
			if (is_playing) {
				return false
			}
			console.log(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition.keyname)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			timer = swSetInterval(playLayouts, cronSched, startDate, endDate)
			// console.log('|-- PLAY ' + entity.definition.keyname + ' ' + entity.id + ' - Scheduled for ' + later.schedule(cronSched).next(1))
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			// console.log(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition.keyname)
			is_playing = false
			dom_element.style.display = 'none'
			// console.log('|-- STOP ' + entity.definition.keyname + ' ' + entity.id)
			// console.log(util.inspect(layouts,{depth:6}))
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
	var element = entity
	var properties = element.properties

	var is_playing = this.is_playing = false
	console.log('New ' + entity.definition.keyname + ' ' + entity.id)
	return {
		play: function() {
			if (is_playing) {
				return false
			}
			console.log(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition.keyname)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			// console.log('|-- PLAY ' + entity.definition.keyname + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.play()
			}
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			// console.log(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition.keyname)
			is_playing = false
			dom_element.style.display = 'none'
			// console.log('|-- STOP ' + entity.definition.keyname + ' ' + entity.id)
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
	var element = entity
	var properties = element.properties

	var is_playing = false
	console.log('New ' + entity.definition.keyname + ' ' + entity.id)

	return {
		play: function() {
			if (is_playing) {
				return false
			}
			console.log(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition.keyname)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			// console.log('|-- PLAY ' + entity.definition.keyname + ' ' + entity.id)
			for (var key=0; key<dom_element.childNodes.length; key++) {
				dom_element.childNodes[key].player.play()
			}
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			// console.log(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition.keyname)
			is_playing = false
			dom_element.style.display = 'none'
			// console.log('|-- STOP ' + entity.definition.keyname + ' ' + entity.id)
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
	var element = entity
	var properties = element.properties

	var is_playing = this.is_playing = false
	console.log('New ' + entity.definition.keyname + ' ' + entity.id)

	return {
		play: function() {
			if (is_playing) {
				return false
			}
			console.log(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition.keyname)
			if (properties['valid-to'] !== undefined)
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now())
						return false
				}

			is_playing = true
			dom_element.style.display = 'block'
			// console.log('|-- PLAY ' + entity.definition.keyname + ' ' + entity.id)
			dom_element.childNodes[0].player.play()
		},
		stop: function() {
			if (!is_playing) {
				return false
			}
			// console.log(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition.keyname)
			is_playing = false
			dom_element.style.display = 'none'
			// console.log('|-- STOP ' + entity.definition.keyname + ' ' + entity.id)
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
	var element = entity
	var properties = element.properties
	var is_playing = this.is_playing = false

	var medias = []
	for (var key=0; key<dom_element.childNodes.length; key++) {
		var child_node = dom_element.childNodes[key]
		// console.log('key:' + key + ': ' + typeof child_node)

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
		console.log('stopping ' + entity.id)
		// window.alert('ended event for ' + entity.id)
		stop()
		if (entity.next !== undefined) {
			swEmitter.emit('requested' + entity.next)
			console.log('ended event for ' + entity.id, 'Next in playlist: ' + entity.next)
		}
	})
	swEmitter.on('requested' + entity.id, function() {
		console.log('requested event for ' + entity.id + ' delay ' + delay_ms)
		sw_timeouts.push(window.setTimeout(play, delay_ms))

	})

	var play = function play() {
		if (is_playing) {
			console.log(' DOM id: ' + dom_element.id + '. Already PLAYing ' + entity.definition.keyname)
			return false
		}
		console.log(' DOM id: ' + dom_element.id + '. Attempting PLAY ' + entity.definition.keyname)
		if (properties['valid-from'] !== undefined) {
			if (properties['valid-from'].values !== undefined) {
				var vt_date = new Date(properties['valid-from'].values[0].db_value)
				if (vt_date.getTime() > Date.now()) {
					if (entity.next !== undefined) {
						swEmitter.emit('requested' + entity.next)
					}
					return
				}
			}
		}
		if (properties['valid-to'] !== undefined) {
			if (properties['valid-to'].values !== undefined) {
				var vt_date = new Date(properties['valid-to'].values[0].db_value)
				if (vt_date.getTime() < Date.now()) {
					if (entity.next !== undefined) {
						swEmitter.emit('requested' + entity.next)
					}
					return
				}
			}
		}

		is_playing = true
		dom_element.style.display = 'block'
		// console.log('|-- PLAY ' + entity.definition.keyname + ' ' + entity.id)
		// console.log(util.inspect({'medias':medias, 'medias[0].mediatype()':medias[0].mediatype()}, {depth:null}))


		medias.forEach( function(media) {
			if (media.play() === 'can not play') {
				if (entity.next !== undefined) {
					swEmitter.emit('requested' + entity.next)
				}
				return
			}
		})
	}
	var stop = function stop() {
		if (!is_playing) {
			return false
		}
		// console.log(' DOM id: ' + dom_element.id + '. Attempting STOP ' + entity.definition.keyname)
		is_playing = false
		dom_element.style.display = 'none'
		// console.log('|-- STOP ' + entity.definition.keyname + ' ' + entity.id)
		// console.log('entity: ' + util.inspect(entity, {depth:5}))
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
	var element = entity
	var properties = element.properties

	var is_playing = this.is_playing = false
	var mediatype = properties.type.values === undefined ? '#NA' : properties.type.values[0].value
	var media_dom_element = {}

	if (mediatype === 'Video') {
		// var p = document.createElement('P')
		// p.appendChild(document.createTextNode('VIDEO ' + entity.definition.keyname + ': ' + entity.id))
		// p.style.float = 'left'
		// p.style.color = 'gray'
		// dom_element.appendChild(p)
		media_dom_element = document.createElement('VIDEO')
		var filename = properties.file.values[0].value
		var mimetype = 'video/' + filename.split('.')[filename.split('.').length-1]
		media_dom_element.type = mimetype
		console.log(mimetype)
		media_dom_element.src = properties.filepath.values[0].db_value
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
		// console.log(util.inspect(properties.filepath.values[0]))
		media_dom_element.src = properties.filepath.values[0].db_value
		dom_element.appendChild(media_dom_element)

	} else if (mediatype === 'URL') {
		media_dom_element = document.createElement('IFRAME')
		// console.log(util.inspect(properties.filepath.values[0]))
		media_dom_element.src = properties.url.values[0].db_value
		media_dom_element.width = '100%'
		media_dom_element.height = '100%'
		media_dom_element.scrolling = 'no'
		dom_element.appendChild(media_dom_element)
		var ifrst = media_dom_element.contentWindow.document.body.style
		ifrst.overflow = 'hidden'
	} else {
		dom_element.appendChild(document.createTextNode(mediatype + ' ' + entity.definition.keyname + ': ' + entity.id))
	}

	console.log('New ' + entity.definition.keyname + ' ' + entity.id) // + ' Style: ' + util.inspect(entity.dom_element.style))

	return {
		play: function() {
			// ctrw.show(dom_element.id)
			if (is_playing) {
				return
			}
			console.log(' DOM id: ' + dom_element.id + '. Attempting PLAY')
			if (properties['valid-from'] !== undefined) {
				if (properties['valid-from'].values !== undefined) {
					var vt_date = new Date(properties['valid-from'].values[0].db_value)
					if (vt_date.getTime() > Date.now()) {
						return 'can not play'
					}
				}
			}
			if (properties['valid-to'] !== undefined) {
				if (properties['valid-to'].values !== undefined) {
					var vt_date = new Date(properties['valid-to'].values[0].db_value)
					if (vt_date.getTime() < Date.now()) {
						return 'can not play'
					}
				}
			}

			is_playing = true
			dom_element.style.display = 'block'
			// console.log('|-- PLAY ' + entity.definition.keyname + ' ' + entity.id)
			if (mediatype === 'Video') {
				if (media_dom_element.play === undefined) {
					console.log(util.inspect(media_dom_element,{depth:1}))
					console.log('No play() function!!! for ' + dom_element.id + ' - aborting.')
					throw ('\n\nThere is no play() method available for media ' + dom_element.id + ' (check your data at /api2/entity-' + entity.id + ')\nIt may as well be fault of ffmpegsumo library distributed with chromium.')
				} else
					media_dom_element.play()
				// console.log(util.inspect(dom_element.childNodes[0]))
				// dom_element.play()
			} else if (mediatype === 'URL') {
				// media_dom_element.play()
				// console.log(util.inspect(dom_element.childNodes[0]))
				// dom_element.play()
			}
			if (duration_ms !== undefined) {
				// console.log(' DOM id: ' + dom_element.id + '. duration_ms ' + duration_ms)
				sw_timeouts.push(window.setTimeout(function() {swEmitter.emit('ended' + dom_element.id.split('_')[0])}, duration_ms))
			}
		},
		stop: function() {
			// ctrw.hide(dom_element.id)
			if (!is_playing) {
				return false
			}
			// console.log(' DOM id: ' + dom_element.id + '. Attempting STOP')
			is_playing = false
			dom_element.style.display = 'none'
			// console.log('|-- STOP ' + entity.definition.keyname + ' ' + entity.id)// + ' style: ' + util.inspect(dom_element.style))
			if (mediatype === 'Video') {
				media_dom_element.pause()
				// console.log('|-- Video ' + entity.definition.keyname + ' ' + entity.id)// + ' style: ' + util.inspect(dom_element.style))
				if (media_dom_element.readyState > 0) {
					media_dom_element.currentTime = 0
					// console.log('|-- readyState ' + media_dom_element.readyState + ' ' + entity.id)// + ' style: ' + util.inspect(dom_element.style))
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
	// console.log('Timeout set for: ' + util.inspect({'fn':fn, 'sched':sched}, {depth:null}))
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
