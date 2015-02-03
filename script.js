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
var EntuLib     = require('./entulib.js')
var stringifier = require('./stringifier.js')


domain.on('error', function(err){
	console.log(err)
})


assert.equal(typeof(gui.App.argv[0]), 'string'
			, "Screen ID should be passed as first argument.")
assert.ok(Number(gui.App.argv[0]) > 0
			, "Screen ID must be number greater than zero.")

__VERSION = gui.App.manifest.version

console.log ( "= ScreenWerk v." + __VERSION + " ==================================")
console.log ( os.platform(), 'SYSTEM')

__HOSTNAME = 'piletilevi.entu.ee'
__SCREEN_ID = Number(gui.App.argv.shift())
__META_DIR = 'sw-meta/'
__MEDIA_DIR = 'sw-media/'
__STRUCTURE = {"name":"screen","reference":{"name":"screen-group","reference":{"name":"configuration","child":{"name":"schedule","reference":{"name":"layout","child":{"name":"layout-playlist","reference":{"name":"playlist","child":{"name":"playlist-media","reference":{"name":"media"}}}}}}}}}
__HIERARCHY = {'child_of': {}, 'parent_of': {}}
function recurseHierarchy(structure, parent_name) {
	if (parent_name) {
		__HIERARCHY.child_of[parent_name] = structure.name
		__HIERARCHY.parent_of[structure.name] = parent_name
	}
	if (structure.child !== undefined)
		recurseHierarchy(structure.child, structure.name)
	else if (structure.reference !== undefined)
		recurseHierarchy(structure.reference, structure.name)
}
recurseHierarchy(__STRUCTURE)
__DEFAULT_UPDATE_INTERVAL_MINUTES = 10
__UPDATE_INTERVAL_SECONDS = __DEFAULT_UPDATE_INTERVAL_MINUTES * 60
__DEFAULT_DELAY_MS = 0
__DEBUG_MODE = false
__SCREEN = 1

while (gui.App.argv.length > 0) {
	var arg = gui.App.argv.shift()
	if (arg === 'debug') {
		__DEBUG_MODE = true
	} else if (arg.substring(0,7) === 'screen=') {
		__SCREEN = Number(arg.substring(7))
	}
}

__API_KEY = ''
// window.alert(util.inspect(process.env))
var uuid_path = __SCREEN_ID + '.uuid'
if (fs.existsSync(uuid_path)) {
	__API_KEY = fs.readFileSync(uuid_path)
	console.log ( 'Read key: ' + __API_KEY, 'INFO')
} else {
	__API_KEY = uuid.v1()
	fs.writeFileSync(uuid_path, __API_KEY)
	console.log ( 'Created key for screen: ' + __SCREEN_ID + '(' + uuid_path + '). Now register this key in Entu: ' + __API_KEY)
	process.exit(0)
}


// console.log('initialize EntuLib with ' + __SCREEN_ID + '|' + __API_KEY + '|' + __HOSTNAME)
var EntuLib = new EntuLib(__SCREEN_ID, __API_KEY, __HOSTNAME)

var player_window = gui.Window.get()
if (__DEBUG_MODE) {
	console.log ( 'launching in debug mode')
	player_window.moveTo(0,30)
	player_window.isFullscreen = false
	player_window.showDevTools()
} else {
	console.log ( 'launching in fullscreen mode')
	player_window.moveTo(window.screen.width * (__SCREEN - 1) + 1, 30)
	player_window.isFullscreen = true
}
var nativeMenuBar = new gui.Menu({ type: "menubar" })
try {
  nativeMenuBar.createMacBuiltin(gui.App.manifest.name + ' ' + __VERSION)
  player_window.menu = nativeMenuBar
} catch (ex) {
  console.log(ex.message)
}


// Make sure folders for metadata, media and logs are in place
var a = [__META_DIR, __MEDIA_DIR]
a.forEach(function(foldername) {
	fs.lstat(foldername, function(err, stats) {
		if (err) {
			console.log ('Creating folder for ' + foldername)
			fs.mkdir(foldername)
		}
		else if (!stats.isDirectory()) {
			console.log ('Renaming existing file "' + foldername + '" to "' + foldername + '.bak')
			fs.renameSync(foldername, foldername + '.bak')
			console.log ('Creating folder for ' + foldername)
			fs.mkdir(foldername)
		}
	})
})


// Cleanup unfinished downloads if any
fs.stat(__MEDIA_DIR, function(err, stats) {
	if (err) {
		if (err.code === 'ENOENT') {
			console.log(__MEDIA_DIR + ' will be OK in a sec')
		} else {
			console.log(__MEDIA_DIR + ' err', err)
			return
		}
	}
	else if (stats.isDirectory()) {
		fs.readdirSync(__MEDIA_DIR).forEach(function(download_filename) {
			if (download_filename.split('.').pop() !== 'download')
				return
			console.log("Unlink " + __MEDIA_DIR + download_filename)
			var result = fs.unlinkSync(__MEDIA_DIR + download_filename)
			if (result instanceof Error) {
				console.log("Can't unlink " + __MEDIA_DIR + download_filename, result)
			}
		})
	}
})


// Read existing screen meta, if local data available
var meta_path = __META_DIR + __SCREEN_ID + ' ' + 'screen.json'
var local_published = new Date(Date.parse('2004-01-01'))
var remote_published = new Date(Date.parse('2004-01-01'))
var meta_obj = {}
var data
try {
	meta_obj = JSON.parse(fs.readFileSync(meta_path, 'utf-8'))
	local_published = new Date(Date.parse(meta_obj.properties.published.values[0].value))
	console.log('Local published: ', local_published.toJSON())
} catch (e) {
	local_published = false
}

// Register timeouts that need to be cleared on player restart
var timeout_counter = 0
var sw_timeouts = []
function clearSwTimeouts() {
	console.log('Clearing ' + sw_timeouts.length + ' sw_timeouts.', 'Timeouts set total: ' + timeout_counter)
	swLog('Clearing ' + sw_timeouts.length + ' sw_timeouts. Timeouts set total: ' + timeout_counter)
	while (sw_timeouts.length > 0) {
		clearTimeout(sw_timeouts.pop())
	}
}

var tcIncr = function() {
	timeout_counter ++
	if (timeout_counter > 4300) {
		// document.location.reload(true)
		// window.location.reload(3)
		console.log("=====================================")
		console.log("== RELAUNCHING! =====================")
		console.log("=====================================")

		//Restart node-webkit app
		var child_process = require("child_process")

		//Start new app
		var child = child_process.spawn(process.execPath, ['./', __SCREEN_ID, 'screen='+__SCREEN], {detached: true})

		//Don't wait for it
		child.unref()

		//Quit current
		player_window.hide() // hide window to prevent black display
		process.exit(1)  // quit node-webkit app
	}
}

// Fetch publishing time for screen, if Entu is reachable
//   and start the show
EntuLib.getEntity(__SCREEN_ID, function(err, result) {
	if (err) {
		remote_published = false
		console.log('Can\'t reach Entu', err, result)
		if (local_published) {
			console.log('Trying to play with local content.')
			loadMeta(null, null, __SCREEN_ID, __STRUCTURE, startDigester)
			return
		} else {
			console.log('Remote and local both unreachable. Terminating.')
			process.exit(99)
		}
	}
	else if (result.error !== undefined) {
		remote_published = false
		console.log (result.error, 'Failed to load screen from Entu.')
		if (local_published) {
			console.log('Trying to play with local content.')
			loadMeta(null, null, __SCREEN_ID, __STRUCTURE, startDigester)
			return
		} else {
			console.log('Remote and local both unreachable. Terminating.')
			process.exit(99)
		}
	} else {
		remote_published = new Date(Date.parse(result.result.properties.published.values[0].value))
		console.log('Remote published: ', remote_published.toJSON())
	}

	if (local_published &&
	    local_published.toJSON() === remote_published.toJSON()) {
		console.log('Trying to play with local content.')
		loadMeta(null, null, __SCREEN_ID, __STRUCTURE, startDigester)
	}
	else {
		console.log('Remove local content. Fetch new from Entu!')
		clearSwTimeouts()
		local_published = new Date(Date.parse(remote_published.toJSON()))
		reloadMeta(null, startDigester)
	}
})

// var swEmitter = new events.EventEmitter()


progress(loading_process_count + '| ' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded) )

function startDigester(err, data) {
	if (err) {
		console.log('startDigester err:', err, data)
		timeout_counter ++
		setTimeout(function() {
			process.exit(0)
		}, 300)
		return
	}
	if (loading_process_count > 0) {
		// console.log('Waiting for loaders to calm down. Active processes: ' + loading_process_count)
		return
	}
	console.log('Reached stable state. Flushing metadata and starting preprocessing elements.')
	fs.writeFileSync('elements.debug.json', stringifier(swElementsById))

	var doTimeout = function() {
		timeout_counter ++
		setTimeout(function() {
			// console.log('RRRRRRRRRRR: Pinging Entu for news.')
			EntuLib.getEntity(__SCREEN_ID, function(err, result) {
				if (err) {
					console.log('Can\'t reach Entu', err, result)
				}
				else if (result.error !== undefined) {
					console.log ('Failed to load from Entu.', result)
				} else {
					remote_published = new Date(Date.parse(result.result.properties.published.values[0].value))
					// console.log('Remote published: ', remote_published.toJSON())
				}

				if (remote_published
					&& local_published.toJSON() !== remote_published.toJSON()
					&& (new Date()).toJSON() > remote_published.toJSON()
					) {
					console.log('Remove local content. Fetch new from Entu!')
					clearSwTimeouts()
					local_published = new Date(Date.parse(remote_published.toJSON()))
					reloadMeta(null, startDigester)
				} else {
					doTimeout()
					// loadMeta(null, null, __SCREEN_ID, __STRUCTURE, startDigester)
				}
			})
		}, 1000 * __UPDATE_INTERVAL_SECONDS)
		// console.log('RRRRRRRRRRR: Check for news scheduled in ' + __UPDATE_INTERVAL_SECONDS + ' seconds.')
	}
	doTimeout()

	function flushMeta(err) {
		if (err) {
			console.log('flushMeta err:', err)
			process.exit(99)
		}
		var stacksize = swElements.length
		swElements.every(function(swElement, idx) {
			if (swElement.definition.keyname !== 'sw-media' && swElement.childs.length === 0) {
				console.log('Unregister empty element ' + swElement.id)
				unregisterMeta(null, idx, function(err, data) {
					if (err) {
						console.log('flushMeta err:', err, data)
					}
					flushMeta(null)
				})
				return false
			}
			var meta_path = __META_DIR + swElement.id + ' ' + swElement.definition.keyname.split('sw-')[1] + '.json'
			fs.writeFileSync(meta_path, stringifier(swElement))
			if(-- stacksize === 0) {
				console.log('====== Metadata flushed')
				processElements(null, startDOM)
			}
			return true
		})
	}
	flushMeta(null)
}


var screen_dom_element
function startDOM(err, options) {
	if (err) {
		console.log('startDOM err:', err, options)
		process.exit(99)
	}
	if (screen_dom_element)
		document.body.removeChild(screen_dom_element)
	console.log('====== Start startDOM')
	buildDom(null, function(err, dom_element) {
		screen_dom_element = dom_element
		console.log('DOM rebuilt')
	})
	console.log('====== Finish startDOM', options)
	clearSwTimeouts()
	screen_dom_element.player = new SwPlayer(null, screen_dom_element, function(err, data) {
		console.log('startDOM err:', err, util.inspect(data))
		process.exit(99)
	})
	screen_dom_element.player.restart(null, function(err, data) {
		if (err) {
			console.log('startDOM err:', err, data)
			callback(er, data)
		}
	})
	// setTimeout(function() {
	// 	process.exit(0)
	// }, 300)
	return
}


// Begin capturing screenshots
function captureScreenshot(err, callback) {
	if (err) {
		console.log('captureScreenshot err:', err)
		return
	}
	var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
	var screenshot_path = __LOG_DIR + 'screencapture ' + datestring + '.jpeg'
	var writer = fs.createWriteStream(screenshot_path)
	player_window.capturePage(function(buffer) {
		if (writer.write(buffer) === false) {
			// console.log('Shouldnt happen!   ...always does...')
			writer.once('drain', function() {writer.write(buffer)})
		}
		writer.close()
		function addScreenshot() {
			// console.log('Saving screenshot')
			EntuLib.addFile(__SCREEN_ID, 'sw-screen-photo', screenshot_path, function(err, data) {
				if (err) {
					console.log('captureScreenshot err:', util.inspect(err), util.inspect(data))
				}
				// console.log(util.inspect(data))
			})
		}
		EntuLib.getEntity(__SCREEN_ID, function(err, entity) {
			if (err) {
				if (err.code === 'ENOTFOUND') {
					// console.log('Not connected')
				} else {
					console.log('captureScreenshot err:', util.inspect(err), util.inspect(entity))
				}
				return
			}
			if (entity.result.properties.photo.values === undefined) {
				addScreenshot()
			} else {
				var stack = entity.result.properties.photo.values
				// console.log(stack)
				var stacksize = stack.length
				stack.forEach(function(item) {
					EntuLib.removeProperty(__SCREEN_ID, 'sw-screen-photo', item.id, function(err, data) {
						if (err) {
							console.log('captureScreenshot err:', util.inspect(item), util.inspect(err), util.inspect(data))
						}
						// console.log(util.inspect(item), util.inspect(data))
						if(-- stacksize === 0) {
							addScreenshot()
						}
					})
				})

			}
		})
	}, { format : 'jpeg', datatype : 'buffer'})
	timeout_counter ++
	setTimeout(function() { callback(null, callback) }, 30*1000)
}
// timeout_counter ++
// setTimeout(function() {
// 	captureScreenshot(null, captureScreenshot)
// }, 1*1000)
