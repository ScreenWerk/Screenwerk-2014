/*
 * Screenwerk main executable. Arguments:
 *
 * argv[0]        Screen's Entu ID
 *
 */

// 1. core modules
var gui     = require('nw.gui')
var assert  = require('assert')
var util    = require('util')
var fs      = require('fs')
var https   = require('https')
var events  = require('events')
var uuid    = require('node-uuid')
var domain  = require('domain').create()


// 2. public modules from npm
var os      = require('os-utils')


// 3. Own modules
var EntuLib     = require('./entulib/entulib.js')
var stringifier = require('./stringifier.js')


domain.on('error', function(err){
    console.log(err)
})


assert.equal(typeof(gui.App.argv[0]), 'string'
			, "Screen ID should be passed as first argument.")
assert.ok(Number(gui.App.argv[0]) > 0
			, "Screen ID must be number greater than zero.")

console.log ( '\n===================================')
console.log ( os.platform(), 'SYSTEM')

// __API_KEY = ''
__HOSTNAME = 'piletilevi.entu.ee'
__SCREEN_ID = Number(gui.App.argv[0])
__LOG_DIR = 'sw-log'
__META_DIR = 'sw-meta'
__MEDIA_DIR = 'sw-media'
__HIERARCHY = {
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

var uuid_path = __SCREEN_ID + '.uuid'
if (fs.existsSync(uuid_path)) {
	__API_KEY = fs.readFileSync(uuid_path)
	console.log ( 'Read key: ' + __API_KEY, 'INFO')
} else {
	__API_KEY = uuid.v1()
	fs.writeFileSync(uuid_path, __API_KEY)
	console.log ( 'Created key for screen: ' + __SCREEN_ID + '. Now register this key in Entu: ' + __API_KEY)
	process.exit(0)
}

console.log('initialize EntuLib with ' + __SCREEN_ID + '|' + __API_KEY + '|' + __HOSTNAME)
var EntuLib = new EntuLib(__SCREEN_ID, __API_KEY, __HOSTNAME)

// var shortcut_Q = new gui.Shortcut({key : "Ctrl+Alt+A"});
// gui.App.registerGlobalHotKey(shortcut_Q);
// shortcut_Q.on('active', function() {
//   console.log("Global desktop keyboard shortcut_Q: " + this.key + " active.");
// })
// shortcut_Q.on('failed', function(msg) {
//   console.log(msg);
// })
// // gui.App.unregisterGlobalHotKey(shortcut_Q);



// // Test if we managed to authenticate
// EntuLib.getEntity(__SCREEN_ID, function (result) {
// 	if (result.error !== undefined) {
// 		console.log(util.inspect(result, {depth:null}))
// 		console.log ( 'Failed to access screen ' + __SCREEN_ID + ' in Entu. Terminating')
// 		console.log ( 'Failed to access screen ' + __SCREEN_ID + ' in Entu. Terminating', 'SYSTEM')
// 		throw new Error(result.error)
// 	}
// 	// console.log('getEntity: ' + util.inspect(result,{depth:null}))
// })

process.on('uncaughtExceptionXXX', function myCleanup(e) {
	console.log('Uncaught Exception...')
	console.log(e.stack)

	var logs = console.log ( 'Exit initiated').end()

	throw new Error(e)
	// var files_to_upload = 0
	// for (var key in logs) {
	// 	files_to_upload ++
	// 	console.log('Uploading ' + logs[key])
	// 	EntuLib.addFile(__SCREEN_ID, 'sw-screen-log', logs[key], function(response) {
	// 		if (response.error !== undefined) {
	// 			console.log('Screenlog uploaded failed for ' + logs[key] + ': ' + response.error)
	// 		} else {
	// 			console.log('Screenlog ' + logs[key] + ' uploaded.')
	// 		}
	// 		files_to_upload --
	// 		process.emit('logsubmit')
	// 	})
	// }
	// process.on('logsubmit', function() {
	// 	if (files_to_upload === 0)
	// 		process.exit(99)
	// })
})


var systemLoad = function systemLoad() {
	os.cpuUsage(function(v){
	    console.log (  os.processUptime() + 'sec | CPU Usage : ' + Math.round(v*100)/1 + '% | Mem free: ' + Math.round(os.freemem()) + '/' + Math.round(os.totalmem()) + 'M', 'SYSTEM' )
	})
	setTimeout(systemLoad, 10000)
}
systemLoad()


console.log ( 'launching in fullscreen mode')
var player_window = gui.Window.get()
player_window.isFullscreen = true



// Make sure folders for metadata, media and logs are in place
var a = [__META_DIR, __MEDIA_DIR, __LOG_DIR]
a.forEach(function(foldername) {
	fs.lstat(foldername, function(err, stats) {
		if (err) {
			console.log ('Creating folder for ' + foldername + '.')
			fs.mkdir(foldername)
		}
		else if (!stats.isDirectory()) {
			console.log ('Renaming existing file "' + foldername + '" to "' + foldername + '.bak.')
			fs.renameSync(foldername, foldername + '.bak')
			console.log ('Creating folder for ' + foldername + '.')
			fs.mkdir(foldername)
	    }
	})
})


var swEmitter = new events.EventEmitter()
var sw_player = new SwPlayer(__SCREEN_ID)
var sw_player_is_playing = false

var loadersEngaged = []
var fetchersEngaged = []
var bytes_to_go = bytes_downloaded = 0
var update_interval_ms = 10 * 60 * 1000 // set default update interval to 10 minutes

swEmitter.on('loader-start', function(data) {
	if (loadersEngaged.indexOf(data.I) === -1) {
		loadersEngaged.push(data.I)
		console.log (fetchersEngaged.length + loadersEngaged.length + ' +  Start loading ' + util.inspect(data))
	} else {
		console.log (fetchersEngaged.length + loadersEngaged.length + ' ~ Resume loading ' + util.inspect(data))
	}
})
swEmitter.on('loader-stop', function(data) {
	if (loadersEngaged.indexOf(data.I) === -1)
		return
	loadersEngaged.splice(loadersEngaged.indexOf(data.I),1)
	console.log ( (fetchersEngaged.length + loadersEngaged.length) + ' -   Stop loading ' + util.inspect(data))
	if (fetchersEngaged.length + loadersEngaged.length + fetchersEngaged.length + loadersEngaged.length === 0)
		swEmitter.emit('init-ready')
})
swEmitter.on('fetcher-start', function(data) {
	if (fetchersEngaged.indexOf(data.I) === -1) {
		fetchersEngaged.push(data.I)
		console.log (fetchersEngaged.length + loadersEngaged.length + ' +  Start fetching ' + util.inspect(data))
	} else {
		throw ('Programming error: Duplicate fetcher tried to launch for ' + data.I)
	}
})
swEmitter.on('fetcher-stop', function(data) {
	if (fetchersEngaged.indexOf(data.I) === -1)
		throw ('Programming error: Fetcher should not exist ' + data.I)
	fetchersEngaged.splice(fetchersEngaged.indexOf(data.I),1)
	console.log ((fetchersEngaged.length + loadersEngaged.length) + ' -   Stop fetching ' + util.inspect(data))
	if (fetchersEngaged.length + loadersEngaged.length + fetchersEngaged.length + loadersEngaged.length === 0)
		swEmitter.emit('init-ready')
})

swEmitter.on('init-ready', function() { // if publishing date has been changed
	// ToDo:
	// - clear metadata on disk
	fs.readdirSync(__META_DIR).forEach(function(meta_fileName) {
        fs.unlinkSync(meta_fileName)
    })
	// - download new metadata and media
	// - if publishing time in past, restart player immediately
	// - if publishing time in future, shcedule restart to that exact moment

	if (sw_player_is_playing)
		return

	// 1st iteration:
	// - initialize dom_elements array for each element
	// - join elements with parent-child references
	sw_loader.swElements().forEach(function(el) {
		element = el.element
		sw_def = el.definition
		if (__HIERARCHY().child_of[sw_def] !== undefined) {
			sw_child_def = __HIERARCHY().child_of[sw_def]
			if (element.properties[sw_child_def].values !== undefined) {
				element.properties[sw_child_def].values.forEach(function(value) {
					child = sw_loader.swElements()[sw_loader.indexOfElement(value.db_value)]
					// child might be undefined if it had its 'valid-to' property set to past date.
					if (child === undefined)
						return false
					el.childs.push(child)
					child.parents.push(el)
				})
			}
		}
		// Validators, default values
		switch (sw_def) {
			case 'screen':
			break
			case 'screen-group':
			break
			case 'configuration':
			break
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
			break
			case 'layout':
			break
			case 'layout-playlist':
				if (element.properties.zindex.values === undefined) {
					element.properties.zindex.values = [{'db_value':1}]
				}
			break
			case 'playlist':
				var loop = false
				// If any of parent LayoutPlaylist's has loop == true, then loop the playlist
				el.parents.forEach(function(parent) {
					if (parent.element.properties.loop.values !== undefined)
						if (parent.element.properties.loop.values[0].db_value === 1)
							loop = true
				})

				var plms = el.childs
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

			break
			case 'playlist-media':
			break
			case 'media':
					// element.properties.type.values[0] = data.properties.type.values[0].value
				if (element.properties.file.values === undefined && element.properties.url.values === undefined)
					throw ('"URL" or "file" property must be set for ' + element.id)
				if (element.properties.file.values !== undefined)
					element.properties.filepath = {'values': [{'db_value':__MEDIA_DIR() + '/' + el.id + '_' + element.properties.file.values[0].db_value}]}
			break
		}
	})


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

		dom_element.swElement = el
		el.childs.forEach(function(child){
			dom_element.appendChild(createDomRec(child, el.id))
		})
		return dom_element
	}
	var screen_dom_element = createDomRec(sw_loader.swElements()[0])
	document.body.appendChild(screen_dom_element)
	var filename = __META_DIR + '/elements.json'

	if (sw_player.restart(screen_dom_element))
		sw_player_is_playing = true
})

var swLoader = function swLoader() {
	var swElements = []
	swLoadScreen(null, __SCREEN_ID)

	function swMediaFetch(err, entity_id, file_id) {
		if (fetchersEngaged.indexOf(entity_id + '_' + file_id) !== -1) {
			console.log ('Fetcher allready started for ' + util.inspect(fetchersEngaged[fetchersEngaged.indexOf(entity_id + '_' + file_id)]))
			return
		}
		var filename = __MEDIA_DIR + '/' + entity_id + '_' + file_id
		if (fs.existsSync(filename)) {
			return
		}
		var element = swElements[indexOfElement(entity_id)].element
		swEmitter.emit('fetcher-start', {'D':element.definition.keyname,'I':entity_id + '_' + file_id})
		console.log ('File ' + filename + ' missing. Fetch!')
		var options = {
			hostname: __HOSTNAME,
		 	port: 443,
			path: '/api2/file-' + file_id,
			method: 'GET'
		}
		var request = https.request(options)
		request.on('response', function response_handler( response ) {
			var filesize = response.headers['content-length']

			bytes_to_go += Number(filesize)
			console.log ('Start fetching media for ' + entity_id + '. Bytes to go: ' + bytes_to_go)

			var file = fs.createWriteStream(filename + '.download');
			response.on('data', function(chunk){
				bytes_downloaded += chunk.length
				progress(bytesToSize(bytes_to_go) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(bytes_to_go - bytes_downloaded) )
				file.write(chunk)
			})
			response.on('end', function() {
				console.log ('Media for ' + entity_id + ' (' + element.properties.file.values[0].value + ') fetched.')
				console.log ('TOTAL:' + bytes_downloaded + '/' + bytes_to_go
					+ ' LEFT:' + (bytes_to_go - bytes_downloaded))
				file.end()
				fs.rename(filename + '.download', filename)
				swEmitter.emit('fetcher-stop', {'D':options.sw_def,'I':entity_id + '_' + file_id})
			})
		})
		request.end()
	}

	function swMetaFetch(err, options, callback) {
		if (fetchersEngaged.indexOf(options.eid) !== -1) {
			// console.log ('Fetcher allready started for ' + util.inspect(fetchersEngaged[fetchersEngaged.indexOf(options.eid)]))
			return
		}
		swEmitter.emit('fetcher-start', {'D':options.sw_def,'I':options.eid})

		EntuLib.getEntity(options.eid, function(err, result) {
			if (err) {
				console.log(util.inspect(result), err)
			}
			if (result.error !== undefined) {
				console.log ('Failed to load ' + options.sw_def + ' from Entu EID=' + options.eid + '. Terminating')
				callback(new Error(result.error))
				return
			}

			result = result.result
			console.log(util.inspect(options, {depth:null}))
			console.log(util.inspect(result, {depth:null}))
			//
			// Remove extra property values. Keep only 'multiplicity' most recent ones
			// Behavior of multiplicity might change in future releases of Entu.
			for (var key in result.properties) {
				if (result.properties[key].values === undefined)
					continue
				if (result.properties[key].multiplicity > 0) {
					while (result.properties[key].values.length > result.properties[key].multiplicity) {
						result.properties[key].values.shift()
					}
				}
			}
			console.log(util.inspect(options, {depth:null}))
			var filename = options.filename
			if (options.sw_child_def === undefined) {
				fs.writeFileSync(filename, stringifier(result))
				swEmitter.emit('fetcher-stop', {'D':options.sw_def,'I':options.eid})
				return callback(null, options.eid)
			} else {
				result.properties[options.sw_child_def] = {}
				result.properties[options.sw_child_def].values = []

				EntuLib.getChilds(options.eid, function(err, child_result) {
					child_result = child_result.result
					console.log(util.inspect(child_result, {depth:null}))
					if (child_result.properties === undefined) {
						child_result.properties = {}
						child_result.properties[options.sw_child_def] = {'values': []}
					}
					// console.log(util.inspect(child_result.properties[options.sw_child_def], {depth:null}))
					child_result['sw-' + options.sw_child_def].entities.forEach( function (child) {
						child_result.properties[options.sw_child_def].values.push({'db_value':child.id})
					})
					fs.writeFileSync(filename, stringifier(child_result))
					swEmitter.emit('fetcher-stop', {'D':options.sw_def,'I':options.eid})
					return callback(null, options.eid)
				})
			}
		})
	}

	function swPollScreen(err, screen_eid) {
		var sw_def = 'screen'
		var filename = __META_DIR + '/poll_' + screen_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) { throw err }
			var current_screen = swElements[indexOfElement(screen_eid)].element
			var new_screen = JSON.parse(data)
			var current_published = new Date(current_screen.properties.published.values[0].value)
			var new_published = new Date(new_screen.properties.published.values[0].value)
			if (current_published.toJSON() != new_published.toJSON()) {
				progress (current_published.toString() + ' <> ' + new_published.toString() + '. Update in ' + (update_interval_ms / 1000 / 60) + ' minutes')
				return true
			} else {
				progress (current_published.toString() + ' === ' + new_published.toString() + '. Update in ' + (update_interval_ms / 1000 / 60) + ' minutes')
				return false
			}
		})
	}

	function swLoadScreen(err, screen_eid) {
		var sw_def = 'screen'
		var sw_child_def = __HIERARCHY.child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':screen_eid})
		var filename = __META_DIR + '/' + screen_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log ( filename + ' not present. Fetching from Entu.')
					swMetaFetch(null, {'eid':screen_eid, 'sw_def':sw_def, 'filename':filename}, swLoadScreen)
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.definition_keyname !== 'sw-screen') {
				var message_url = 'https://' + __HOSTNAME + '/entity/' + swElement.definition_keyname + '/' + swElement.id
				var message = 'Wrong startup parameters: This is a ' + swElement.definition_keyname + ', not a SCREEN at\n  ' + message_url
				console.log(message)
				error(message, message_url)
				return false
			}
			if (swElement.properties[sw_child_def] === undefined)
				throw ('Configuration error: Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Configuration error: Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadScreengroup(null, chval.db_value)
			})
			swSet(swElement)
			// jElements.register({'entity_id':entity_id, 'definition':definition, 'relatives':{parent:undefined}}, data.result)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':screen_eid})
		})
	}

	function swLoadScreengroup(err, screengroup_eid) {
		var sw_def = 'screen-group'
		var sw_child_def = __HIERARCHY.child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':screengroup_eid})
		var filename = __META_DIR + '/' + screengroup_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log ( filename + ' not present. Fetching from Entu.')
					swMetaFetch(null, {'eid':screengroup_eid, 'sw_def':sw_def, 'filename':filename}, swLoadScreengroup)
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadConfiguration(null, chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':screengroup_eid})
		})
	}

	function swLoadConfiguration(err, configuration_eid) {
		var sw_def = 'configuration'
		var sw_child_def = __HIERARCHY.child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':configuration_eid})
		var filename = __META_DIR + '/' + configuration_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log ( filename + ' not present. Fetching from Entu.')
					swMetaFetch(null, {'eid':configuration_eid, 'sw_def':sw_def, 'sw_child_def':sw_child_def, 'filename':filename}, swLoadConfiguration)
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			console.log(util.inspect(swElement, {depth:null}))
			if (swElement.properties['update-interval'].values !== undefined)
				update_interval_ms = 1000 * 60 * swElement.properties['update-interval'].values[0].db_value

			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadSchedule(null, chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':configuration_eid})
		})
	}

	function swLoadSchedule(err, schedule_eid) {
		var sw_def = 'schedule'
		var sw_child_def = __HIERARCHY.child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':schedule_eid})
		var filename = __META_DIR + '/' + schedule_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log ( filename + ' not present. Fetching from Entu.')
					swMetaFetch(null, {'eid':schedule_eid, 'sw_def':sw_def, 'filename':filename}, swLoadSchedule)
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadLayout(null, chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':schedule_eid})
		})
	}

	function swLoadLayout(err, layout_eid) {
		var sw_def = 'layout'
		var sw_child_def = __HIERARCHY.child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':layout_eid})
		var filename = __META_DIR + '/' + layout_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log ( filename + ' not present. Fetching from Entu.')
					swMetaFetch(null, {'eid':layout_eid, 'sw_def':sw_def, 'sw_child_def':sw_child_def, 'filename':filename}, swLoadLayout)
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadLayoutPlaylist(null, chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':layout_eid})
		})
	}

	function swLoadLayoutPlaylist(err, layout_playlist_eid) {
		var sw_def = 'layout-playlist'
		var sw_child_def = __HIERARCHY.child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':layout_playlist_eid})
		var filename = __META_DIR + '/' + layout_playlist_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log ( filename + ' not present. Fetching from Entu.')
					swMetaFetch(null, {'eid':layout_playlist_eid, 'sw_def':sw_def, 'filename':filename}, swLoadLayoutPlaylist)
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadPlaylist(null, chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':layout_playlist_eid})
		})
	}

	function swLoadPlaylist(err, playlist_eid) {
		var sw_def = 'playlist'
		var sw_child_def = __HIERARCHY.child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':playlist_eid})
		var filename = __META_DIR + '/' + playlist_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log ( filename + ' not present. Fetching from Entu.')
					swMetaFetch(null, {'eid':playlist_eid, 'sw_def':sw_def, 'sw_child_def':sw_child_def, 'filename':filename}, swLoadPlaylist)
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadPlaylistMedia(null, chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':playlist_eid})
		})
	}

	function swLoadPlaylistMedia(err, playlist_media_eid) {
		var sw_def = 'playlist-media'
		var sw_child_def = __HIERARCHY.child_of[sw_def]
		swEmitter.emit('loader-start', {'D':sw_def,'I':playlist_media_eid})
		var filename = __META_DIR + '/' + playlist_media_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log ( filename + ' not present. Fetching from Entu.')
					swMetaFetch(null, {'eid':playlist_media_eid, 'sw_def':sw_def, 'filename':filename}, swLoadPlaylistMedia)
					return
				} else throw err
			}
			var swElement = JSON.parse(data)
			if (swElement.properties[sw_child_def].values === undefined)
				throw ('Expected property ' + sw_child_def + ' is missing for entity ' + swElement.id)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadMedia(null, chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':playlist_media_eid})
		})
	}

	function swLoadMedia(err, media_eid) {
		var sw_def = 'media'
		swEmitter.emit('loader-start', {'D':sw_def,'I':media_eid})
		var filename = __META_DIR + '/' + media_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log ( filename + ' not present. Fetching from Entu.')
					swMetaFetch(null, {'eid':media_eid, 'sw_def':sw_def, 'filename':filename}, swLoadMedia)
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
				// console.log ( eid)
				callback(null, swElement)
			}
		})
	}
	function swSet(swElement) {
		var properties = swElement.properties
		if (properties['valid-to'] !== undefined) {
			if (properties['valid-to'].values !== undefined) {
				var vt_date = new Date(properties['valid-to'].values[0].db_value)
				var now = Date.now()
				if (vt_date.getTime() < now) {
					return false
				}
			}
		}
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
		},
		swPollScreen: function (err, screen_eid) {
			var sw_def = 'screen'
			var filename = __META_DIR + '/poll_' + screen_eid + '.' + sw_def + '.json'
			return swMetaFetch(null, {'eid':screen_eid, 'sw_def':sw_def, 'filename':filename}, swPollScreen)
		},
		reload: function () {
			swElements = []
			swLoadScreen(null, __SCREEN_ID)
		}
	}
}

/*
 * Start the action
 */
console.log('GO!')
var sw_loader = new swLoader()



