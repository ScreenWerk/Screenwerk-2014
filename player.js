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
					var current_class = dom_element.className
					dom_element.className = current_class + " zoomInRight animated"
					setTimeout(function() {
						dom_element.className = current_class
					}, 1000)
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
						try {
							media_dom_element.play()
						} catch (e) {
						    console.log('WARNING: Media DOM element has no play() function.', e)
						    process.exit(99)
						}
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

			switch (element.definition.keyname) {
				case 'sw-screen':
					dom_element.style.display = 'none'
					dom_element.childNodes[0].player.stop()
				break
				case 'sw-screen-group':
					dom_element.style.display = 'none'
					dom_element.childNodes[0].player.stop()
				break
				case 'sw-configuration':
					dom_element.style.display = 'none'
					for (var key=0; key<dom_element.childNodes.length; key++) {
						dom_element.childNodes[key].player.stop()
					}
				break
				case 'sw-schedule':
					dom_element.style.display = 'none'
					dom_element.childNodes[0].player.stop()
					this.play(null, element.laterSchedule.next().getTime() - Date.now(), function(){})
				break
				case 'sw-layout':
					dom_element.style.display = 'none'
					for (var key=0; key<dom_element.childNodes.length; key++) {
						dom_element.childNodes[key].player.stop()
					}
				break
				case 'sw-layout-playlist':
					dom_element.style.display = 'none'
					dom_element.childNodes[0].player.stop()
				break
				case 'sw-playlist':
					dom_element.style.display = 'none'
					for (var key=0; key<dom_element.childNodes.length; key++) {
						dom_element.childNodes[key].player.stop()
					}
				break
				case 'sw-playlist-media':
					var current_class = dom_element.className
					dom_element.className = current_class + " zoomOutLeft animated"
					setTimeout(function() {
						dom_element.style.display = 'none'
						dom_element.className = current_class
					}, 1000)
					dom_element.childNodes[0].player.stop()
				break
				case 'sw-media':
					setTimeout(function() {
						dom_element.style.display = 'none'
					}, 1000)
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
			document.getElementById('progress').style.display = 'none'
			return this.stop(null, 0, function(err, data) {
				if (err) {
					console.log('SwPlayer.restart err:', err, data)
					callback(err, data)
				}
			}).play(null, 1000, function(err, data) {
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

