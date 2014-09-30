/*
 * Screenwerk main executable. Arguments:
 *
 * argv[0]        Screen's Entu ID
 *
 */

var gui    = require('nw.gui')
var assert = require('assert')
var util    = require("util")
var fs      = require('fs')

var os  = require('os-utils')

var https   = require('https')
var events  = require('events')
var sw_play = require('./player')


assert.equal(typeof(gui.App.argv[0]), 'string'
			, "Screen ID should be passed as first argument.")
assert.ok(Number(gui.App.argv[0]) > 0
			, "Screen ID must be number greater than zero.")

var consoleStream = fs.createWriteStream('./console.log', {flags:'a'})
var sysLogStream = fs.createWriteStream('./system.log', {flags:'a'})
var swLog = function swLog(message, scope) {
	console.log(message)
	if (scope === undefined)
		scope = 'INFO'
	now = new Date()
	if (scope === 'SYSTEM')
		sysLogStream.write(now.toString().slice(0,24) + ': ' + message + '\n')
	else
		consoleStream.write(now.toString().slice(0,24) + ' ' + scope + ': ' + message + '\n')
}


swLog('\n\n===================================')


swLog(os.platform(), 'SYSTEM')

var systemLoad = function systemLoad() {
	os.cpuUsage(function(v){
	    swLog( os.processUptime() + 'sec | CPU Usage : ' + Math.round(v*100)/1 + '% | Mem free: ' + Math.round(os.freemem()) + '/' + Math.round(os.totalmem()) + 'M', 'SYSTEM' )
	})
	setTimeout(systemLoad, 10000)
}
systemLoad()

var player_window = gui.Window.get()
player_window.window.moveTo(201,1)
player_window.isFullscreen = false
if (gui.App.argv.length > 1) {
	swLog('launching in fullscreen mode')
	player_window.isFullscreen = true
}

window.monitor_window = gui.Window.get(window.open('monitor.html'))
// window.monitor_window = gui.Window.get(window.open(''))
var mon_win = window.monitor_window.window
mon_win.moveTo(1,1)
mon_win.resizeTo(200,450)
mon_win.toolbar = false
mon_win.show = false
mon_win.show_in_taskbar = false
mon_win.icon = 'imgs/sw-p512.png'
var mon_win_body = mon_win.document.body
mon_win_body.style.margin = '0px'
mon_win_body.style.padding = '0px'

window.monitor_window.on('minimize', function() {
	window.gui.App.quit()
})
window.monitor_window.on('close', function() {
	window.gui.App.quit()
})

var monitor_start = function monitor_start() {
	var quit_button = window.monitor_window.window.document.getElementById('quit')
	if (quit_button === null)
		throw ("NULL!")
	if (quit_button.onclick === undefined)
		throw ("undefined is not a funCTION!")

	quit_button.onclick = function() {
		window.gui.App.quit()
	}
}

setTimeout(monitor_start, 5000)



window.constants = function constants() {
	return {
		SCREEN_ID:   function() { return Number(gui.App.argv[0]) },
		META_DIR:    function() { return 'sw-meta' },
		MEDIA_DIR:   function() { return 'sw-media' },
		HIERARCHY:   function() { return {
			'child_of': {
				'screen':'screen-group',
				'screen-group':'configuration',
				'configuration':'schedule',
				'schedule':'layout',
				'layout':'layout-playlist',
				'layout-playlist':'playlist',
				'playlist':'playlist-media',
				'playlist-media':'media'},
			'parent_of': {
				'screen-group':'screen',
				'configuration':'screen-group',
				'schedule':'configuration',
				'layout':'schedule',
				'layout-playlist':'layout',
				'playlist':'layout-playlist',
				'playlist-media':'playlist',
				'media':'playlist-media'}
			}
		}
	}
}


// var numlenf	= 6


fs.lstat(constants().META_DIR(), function(err, stats) {
	if (err) {
		swLog('Creating folder for ' + constants().META_DIR() + '.')
		fs.mkdir(constants().META_DIR())
	}
	else if (!stats.isDirectory()) {
		swLog('Renaming existing file "' + constants().META_DIR() + '" to "' + constants().META_DIR() + '.bak.')
		fs.renameSync(constants().META_DIR(), constants().META_DIR() + '.bak')
		swLog('Creating folder for ' + constants().META_DIR() + '.')
		fs.mkdir(constants().META_DIR())
    }
})
fs.lstat(constants().MEDIA_DIR(), function(err, stats) {
	if (err) {
		swLog('Creating folder for ' + constants().MEDIA_DIR() + '.')
		fs.mkdir(constants().MEDIA_DIR())
	}
	else if (!stats.isDirectory()) {
		swLog('Renaming existantsng file "' + consta.MEDIA_DIR() + '" to "' + consta.MEDIA_DIR() + '.bak.')
		fs.renameSync(constants().MEDIA_DIR(), constants().MEDIA_DIR() + '.bak')
		swLog('Creating folder for ' + constants().MEDIA_DIR() + '.')
		fs.mkdir(constants().MEDIA_DIR())
    }
})

var swEmitter = new events.EventEmitter()
var sw_player = new sw_play.SwPlayer(constants().SCREEN_ID())

var loadersEngaged = []
var fetchersEngaged = []
var bytes_to_go = bytes_downloaded = 0

swEmitter.on('loader-start', function(data) {
	if (loadersEngaged.indexOf(data.I) === -1) {
		loadersEngaged.push(data.I)
		swLog(fetchersEngaged.length + loadersEngaged.length + ' +  Start loading ' + util.inspect(data))
	} else {
		swLog(fetchersEngaged.length + loadersEngaged.length + ' ~ Resume loading ' + util.inspect(data))
	}
})
swEmitter.on('loader-stop', function(data) {
	if (loadersEngaged.indexOf(data.I) === -1)
		return
	loadersEngaged.splice(loadersEngaged.indexOf(data.I),1)
	swLog((fetchersEngaged.length + loadersEngaged.length) + ' -   Stop loading ' + util.inspect(data))
	if (fetchersEngaged.length + loadersEngaged.length + fetchersEngaged.length + loadersEngaged.length === 0)
		swEmitter.emit('init-ready')
})
swEmitter.on('fetcher-start', function(data) {
	if (fetchersEngaged.indexOf(data.I) === -1) {
		fetchersEngaged.push(data.I)
		swLog(fetchersEngaged.length + loadersEngaged.length + ' +  Start fetching ' + util.inspect(data))
	} else {
		throw ('Duplicate fetcher tried to launch for ' + data.I)
	}
})
swEmitter.on('fetcher-stop', function(data) {
	if (fetchersEngaged.indexOf(data.I) === -1)
		throw ('Fetcher should not exist ' + data.I)
	fetchersEngaged.splice(fetchersEngaged.indexOf(data.I),1)
	swLog((fetchersEngaged.length + loadersEngaged.length) + ' -   Stop fetching ' + util.inspect(data))
	if (fetchersEngaged.length + loadersEngaged.length + fetchersEngaged.length + loadersEngaged.length === 0)
		swEmitter.emit('init-ready')
})

swEmitter.on('init-ready', function() {
	var sw_def, sw_child_def
	var child = {}
	var element = {}
	// 1st iteration:
	// - initialize dom_elements array for each element
	// - join elements with parent-child references
	l.swElements().forEach(function(el) {
		// el.dom_elements = []
		element = el.element
		sw_def = el.definition
		// swLog(el.id + ':' + sw_def)
		if (constants().HIERARCHY().child_of[sw_def] !== undefined) {
			sw_child_def = constants().HIERARCHY().child_of[sw_def]
			// swLog(sw_child_def)
			if (element.properties[sw_child_def].values !== undefined) {
				element.properties[sw_child_def].values.forEach(function(value) {
					child = l.swElements()[l.indexOfElement(value.db_value)]
					el.childs.push(child)
					child.parents.push(el)
				})
			}
		}
		// Validators, default values
		switch (sw_def) {
			case 'screen':
			break;
			case 'screen-group':
			break;
			case 'configuration':
			break;
			case 'schedule':
				if (element.properties.crontab.values === undefined) {
					throw ('Schedule ' + element.id + ' has no crontab.')
					// console.error('Schedule ' + element.id + ' without crontab. rescheduling to midnight, February 30, Sunday')
					// element.properties.crontab.values = [{'db_value':'0 0 30 2 0'}] // Midnight, February 30, Sunday
				}
				if (element.properties.cleanup.values === undefined) {
					element.properties.cleanup.values = [{'db_value':0}]
				}
				if (element.properties.ordinal.values === undefined) {
					element.properties.ordinal.values = [{'db_value':0}]
				}
			break;
			case 'layout':
			break;
			case 'layout-playlist':
				if (element.properties.zindex.values === undefined) {
					element.properties.zindex.values = [{'db_value':1}]
				}
			break;
			case 'playlist':
				var plms = el.childs
				var loop = false
				el.parents.forEach(function(parent) {
					if (parent.element.properties.loop.values !== undefined)
						if (parent.element.properties.loop.values[0].db_value === 1)
							loop = true
				})

				plms.sort(function compare(a,b) {
					if (a.element.properties.ordinal.values[0].db_value < b.element.properties.ordinal.values[0].db_value)
						return -1
					if (a.element.properties.ordinal.values[0].db_value > b.element.properties.ordinal.values[0].db_value)
						return 1
					return 0
				})
				for (var i = 0; i < plms.length; i++) {
					if (i === 0) {
						if (loop) {
							plms[0].prev = plms[plms.length - 1]
						}
						plms[i].next = plms[i + 1]
					}
					if (i === plms.length - 1) {
						plms[i].prev = plms[i - 1]
						if (loop) {
							plms[i].next = plms[0]
						}
					}
					if (i > 0 && i < plms.length - 1) {
						plms[i].prev = plms[i - 1]
						plms[i].next = plms[i + 1]
					}
				}

			break;
			case 'playlist-media':
			break;
			case 'media':
					// element.properties.type.values[0] = data.properties.type.values[0].value
				if (element.properties.file.values === undefined && element.properties.url.values === undefined)
					throw ('"URL" or "file" property must be set for ' + element.id)
				if (element.properties.file.values !== undefined)
					element.properties.filepath = {'values': [{'db_value':constants().MEDIA_DIR() + '/' + el.id + '_' + element.properties.file.values[0].db_value}]}
			break;
		}
	})

	// var swDomRec = function swDomRec(el) {
	// 	sw_def = el.definition
	// 	if (constants().HIERARCHY().child_of[sw_def] !== undefined) {
	// 		sw_child_def = constants().HIERARCHY().child_of[sw_def]
	// 		if (element.properties[sw_child_def].values !== undefined) {
	// 			element.properties[sw_child_def].values.forEach(function(value) {
	// 				child = l.swElements()[l.indexOfElement(value.db_value)]
	// 				el.childs.push(child)
	// 				child.parents.push(el)
	// 			})
	// 		}

	// }
	// var swDom = swDomRec(l.swElements()[0])

	// 2nd iteration:
	// - create <div> element for every unique child and join them into DOM
	var createDomRec = function createDomRec(el, parent_eid) {
		var dom_element = document.createElement('div')
		dom_element.id = parent_eid === undefined ? el.id : parent_eid + '_' + el.id
		dom_element.className = el.definition
		dom_element.style.display = 'none'
		// dom_element.style.border = 'dashed 1px green'
		// dom_element.style.position = 'relative'
		var unit = '%'
		dom_element.style.width = '100%'
		dom_element.style.height = '100%'
		if (el.element.properties['in-pixels'] !== undefined)
			if (el.element.properties['in-pixels'].values !== undefined)
				if (el.element.properties['in-pixels'].values[0].db_value === 1)
					unit = 'px'
		if (el.element.properties.width !== undefined)
			if (el.element.properties.width.values !== undefined) {
				dom_element.style.position = 'absolute'
				// dom_element.style.border = '2px solid red'
				dom_element.style.padding = '0px'
				dom_element.style.width = el.element.properties.width.values[0].db_value + unit
			}
		if (el.element.properties.height !== undefined)
			if (el.element.properties.height.values !== undefined) {
				dom_element.style.position = 'absolute'
				// dom_element.style.border = '2px solid red'
				dom_element.style.padding = '0px'
				dom_element.style.height = el.element.properties.height.values[0].db_value + unit
			}
		if (el.element.properties.left !== undefined)
			if (el.element.properties.left.values !== undefined) {
				dom_element.style.position = 'absolute'
				// dom_element.style.border = '2px solid red'
				dom_element.style.padding = '0px'
				dom_element.style.left = el.element.properties.left.values[0].db_value + unit
			}
		if (el.element.properties.top !== undefined)
			if (el.element.properties.top.values !== undefined) {
				dom_element.style.position = 'absolute'
				// dom_element.style.border = '2px solid red'
				dom_element.style.padding = '0px'
				dom_element.style.top = el.element.properties.top.values[0].db_value + unit
			}

		// var para_element = document.createElement('p')
		// // para_element.style.float = 'none'
		// para_element.style.zindex = 1000
		// para_element.style.float = 'right'
		// para_element.appendChild(document.createTextNode(el.definition + ': ' + el.id))
		// dom_element.appendChild(para_element)
		dom_element.swElement = el
		// el.element.dom_element = dom_element
		// el.dom_elements.push(dom_element)
		el.childs.forEach(function(child){
			dom_element.appendChild(createDomRec(child, el.id))
		})
		return dom_element
	}
	var screen_dom_element = createDomRec(l.swElements()[0])
	document.body.appendChild(screen_dom_element)
	var filename = constants().META_DIR() + '/elements.json'
	// fs.writeFileSync(filename, stringifier(screen_dom_element))

	sw_player.restart(screen_dom_element)

	// gui.App.quit()
})
// swLog(constants().META_DIR() + '/' + constants().SCREEN_ID() + '.sw-screen.json')

var swLoader = function swLoader(screenEid) {
	var swElements = []
	swLoadScreen(constants().SCREEN_ID())

	function swMediaFetch(entity_id, file_id) {
		if (fetchersEngaged.indexOf(entity_id + '_' + file_id) !== -1) {
			swLog('Fetcher allready started for ' + util.inspect(fetchersEngaged[fetchersEngaged.indexOf(entity_id + '_' + file_id)]))
			return
		}
		var filename = constants().MEDIA_DIR() + '/' + entity_id + '_' + file_id
		if (fs.existsSync(filename)) {
			return
		}
		// indexOfElement(entity_id)
		var element = swElements[indexOfElement(entity_id)].element
		swEmitter.emit('fetcher-start', {'D':element.definition.keyname,'I':entity_id + '_' + file_id})
		swLog('File ' + filename + ' missing. Fetch!')
		var options = {
			hostname: 'piletilevi.entu.ee',
		 	port: 443,
			path: '/api2/file-' + file_id,
			method: 'GET'
		}
		var request = https.request(options)
		request.on('response', function response_handler( response ) {
			var filesize = response.headers['content-length']

			bytes_to_go += Number(filesize)
			swLog('Start fetching media for ' + entity_id + '. Bytes to go: ' + bytes_to_go)
			// swLog('STATUS: ' + response.statusCode);

			var file = fs.createWriteStream(filename + '.download');
			response.on('data', function(chunk){
				bytes_downloaded += chunk.length
				file.write(chunk)
			})
			response.on('end', function() {
				swLog('Media for ' + entity_id + ' (' + element.properties.file.values[0].value + ') fetched.')
				swLog('TOTAL:' + bytes_downloaded + '/' + bytes_to_go
					+ ' LEFT:' + (bytes_to_go - bytes_downloaded))
				file.end()
				fs.rename(filename + '.download', filename)
				swEmitter.emit('fetcher-stop', {'D':options.sw_def,'I':entity_id + '_' + file_id})
			})
		})
		request.end()
	}

	function swMetaFetch(callback, options) {
		if (fetchersEngaged.indexOf(options.eid) !== -1) {
			swLog('Fetcher allready started for ' + util.inspect(fetchersEngaged[fetchersEngaged.indexOf(options.eid)]))
			return
		}
		swEmitter.emit('fetcher-start', {'D':options.sw_def,'I':options.eid})
		var path = '/api2/entity-' + options.eid
		// swLog(path)
		var request = https.request({
			hostname: 'piletilevi.entu.ee', port: 443, path: path, method: 'GET'})
		request.on('response', function response_handler( response ) {
			var str = ''
			response.on('data', function chunk_sticher( chunk ) {
				str += chunk
				// swLog('CHUNK: ' + str.length + '(+' + chunk.length + ')')
			})
			response.on('end', function response_emitter() {
				var obj = JSON.parse(str)
				// swLog(util.inspect(obj))
				if (obj.error !== undefined) {
					swLog(path + ' responded with error: ' + obj.error)
					throw(path + ' responded with error: ' + obj.error)
				}
				var result = obj.result
				//
				// Remove extra property values. Keep only 'multiplicity' most recent ones
				for (var key in result.properties) {
					if (result.properties[key].values === undefined)
						continue
					if (result.properties[key].multiplicity > 0) {
						while (result.properties[key].values.length > result.properties[key].multiplicity) {
							result.properties[key].values.shift()
						}
					}
				}
				var filename = constants().META_DIR() + '/' + options.eid + '.' + options.sw_def + '.json'
				if (options.sw_child_def === undefined) {
					fs.writeFileSync(filename, stringifier(result))
					swEmitter.emit('fetcher-stop', {'D':options.sw_def,'I':options.eid})
					callback(options.eid)
				} else {
					result.properties[options.sw_child_def] = {}
					result.properties[options.sw_child_def].values = []
					var child_request = https.request({
						hostname: 'piletilevi.entu.ee', port: 443, path: path + '/childs', method: 'GET'})
					// swLog('request: ' + util.inspect(child_request))
					child_request.on('response', function child_response_handler( child_response ) {
						// swLog('response: ' + util.inspect(child_response))
						var child_str = ''
						child_response.on('data', function child_chunk_sticher( child_chunk ) {
							child_str += child_chunk
						})
						child_response.on('end', function child_response_emitter() {
							var child_result = JSON.parse(child_str).result
							child_result['sw-' + options.sw_child_def].entities.forEach( function (child) {
								result.properties[options.sw_child_def].values.push({'db_value':child.id})
							})
							fs.writeFileSync(filename, stringifier(result))
							swEmitter.emit('fetcher-stop', {'D':options.sw_def,'I':options.eid})
							callback(options.eid)
						})
					})
					child_request.end()
				}
			})
		})
		request.end()
	}


	function swLoadScreen(screen_eid) {
		var sw_def = 'screen'
		var sw_child_def = constants().HIERARCHY().child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':screen_eid})
		var filename = constants().META_DIR() + '/' + screen_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					swLog(filename + ' not present. Fetching from Entu.')
					swMetaFetch(swLoadScreen, {'eid':screen_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.definition_keyname !== 'sw-screen')
				throw ('Sorry, this is a ' + swElement.definition_keyname + ', not a SCREEN at entity ' + swElement.id)
			if (swElement.properties[sw_child_def] === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadScreengroup(chval.db_value)
			})
			swSet(swElement)
			// jElements.register({'entity_id':entity_id, 'definition':definition, 'relatives':{parent:undefined}}, data.result)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':screen_eid})
		})
	}
	function swLoadScreengroup(screengroup_eid) {
		var sw_def = 'screen-group'
		var sw_child_def = constants().HIERARCHY().child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':screengroup_eid})
		var filename = constants().META_DIR() + '/' + screengroup_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					swLog(filename + ' not present. Fetching from Entu.')
					swMetaFetch(swLoadScreengroup, {'eid':screengroup_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadConfiguration(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':screengroup_eid})
		})
	}
	function swLoadConfiguration(configuration_eid) {
		var sw_def = 'configuration'
		var sw_child_def = constants().HIERARCHY().child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':configuration_eid})
		var filename = constants().META_DIR() + '/' + configuration_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					swLog(filename + ' not present. Fetching from Entu.')
					swMetaFetch(swLoadConfiguration, {'eid':configuration_eid, 'sw_def':sw_def, 'sw_child_def':sw_child_def})
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadSchedule(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':configuration_eid})
		})
	}
	function swLoadSchedule(schedule_eid) {
		var sw_def = 'schedule'
		var sw_child_def = constants().HIERARCHY().child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':schedule_eid})
		var filename = constants().META_DIR() + '/' + schedule_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					swLog(filename + ' not present. Fetching from Entu.')
					swMetaFetch(swLoadSchedule, {'eid':schedule_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadLayout(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':schedule_eid})
		})
	}
	function swLoadLayout(layout_eid) {
		var sw_def = 'layout'
		var sw_child_def = constants().HIERARCHY().child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':layout_eid})
		var filename = constants().META_DIR() + '/' + layout_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					swLog(filename + ' not present. Fetching from Entu.')
					swMetaFetch(swLoadLayout, {'eid':layout_eid, 'sw_def':sw_def, 'sw_child_def':sw_child_def})
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			// swLog(util.inspect({'element':swElement.properties[sw_child_def]}))
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadLayoutPlaylist(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':layout_eid})
		})
	}
	function swLoadLayoutPlaylist(layout_playlist_eid) {
		var sw_def = 'layout-playlist'
		var sw_child_def = constants().HIERARCHY().child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':layout_playlist_eid})
		var filename = constants().META_DIR() + '/' + layout_playlist_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					swLog(filename + ' not present. Fetching from Entu.')
					swMetaFetch(swLoadLayoutPlaylist, {'eid':layout_playlist_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadPlaylist(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':layout_playlist_eid})
		})
	}
	function swLoadPlaylist(playlist_eid) {
		var sw_def = 'playlist'
		var sw_child_def = constants().HIERARCHY().child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':playlist_eid})
		var filename = constants().META_DIR() + '/' + playlist_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					swLog(filename + ' not present. Fetching from Entu.')
					swMetaFetch(swLoadPlaylist, {'eid':playlist_eid, 'sw_def':sw_def, 'sw_child_def':sw_child_def})
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			// swLog(util.inspect({'element':swElement.properties[sw_child_def]}))
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadPlaylistMedia(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':playlist_eid})
		})
	}
	function swLoadPlaylistMedia(playlist_media_eid) {
		var sw_def = 'playlist-media'
		var sw_child_def = constants().HIERARCHY().child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':playlist_media_eid})
		var filename = constants().META_DIR() + '/' + playlist_media_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					swLog(filename + ' not present. Fetching from Entu.')
					swMetaFetch(swLoadPlaylistMedia, {'eid':playlist_media_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)

			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadMedia(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':playlist_media_eid})
		})
	}
	function swLoadMedia(media_eid) {
		var sw_def = 'media'
		swEmitter.emit('loader-start', {'D':sw_def,'I':media_eid})
		var filename = constants().META_DIR() + '/' + media_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					swLog(filename + ' not present. Fetching from Entu.')
					swMetaFetch(swLoadMedia, {'eid':media_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swExists(swElement.id)) {
				swEmitter.emit('loader-stop', {'D':sw_def,'I':media_eid})
			} else {
				swSet(swElement)
				if (swElement.properties.file.values === undefined) {
					// It must be URL - not going to fetch and store this kind of media
				} else {
					swMediaFetch(media_eid, swElement.properties.file.values[0].db_value)
				}
				swEmitter.emit('loader-stop', {'D':sw_def,'I':media_eid})
			}
		})
	}

	function swExists(eid) {
		for (e in swElements) {
			if (swElements[e].id === eid) {
				return true
			}
		}
		return false
	}
	function swGet(callback, eid) {
		swElements.forEach(function(swElement) {
			if (swElement.id === eid) {
				swLog(eid)
				callback(swElement)
			}
		})
	}
	function swSet(swElement) {
		// if (indexOfElement(swElement.id) !== undefined)
		swElements.push({'id':swElement.id, 'definition':swElement.definition.keyname.split('sw-')[1], 'element':swElement, 'parents':[], 'childs':[]})
	}
	function indexOfElement(eid) {
		for (e in swElements) {
			if (swElements[e].id === eid) {
				return e
			}
		}
	}

	return {
		swElements: function () {
			return swElements
		},
		indexOfElement: function (eid) {
			return indexOfElement(eid)
		}
	}
}

/*
 * Start the action
 */
var l = new swLoader()



var stringifier = function(o) {
	var cache = [];
	return JSON.stringify(o, function(key, value) {
	    if (typeof value === 'object' && value !== null) {
	        if (cache.indexOf(value) !== -1) {
	            // Circular reference found, replace key
	            return 'Circular reference to: ' + key
	        }
	        // Store value in our collection
	        cache.push(value)
	    }
	    return value
	}, '\t')
}
