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

console.log ( "\n===================================")
console.log ( os.platform(), 'SYSTEM')

__HOSTNAME = 'piletilevi.entu.ee'
__SCREEN_ID = Number(gui.App.argv[0])
__LOG_DIR = 'sw-log/'
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

__API_KEY = ''
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

console.log ( 'launching in fullscreen mode')
var player_window = gui.Window.get()
// player_window.isFullscreen = true


// Make sure folders for metadata, media and logs are in place
var a = [__META_DIR, __MEDIA_DIR, __LOG_DIR]
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


// Beware: we'll go quite eventful from now on
var swEmitter = new events.EventEmitter()

swEmitter.on('update-init', function(callback) {
	loadMeta(null, __SCREEN_ID, __STRUCTURE, callback)
	// reloadMeta(null, __SCREEN_ID, __STRUCTURE, callback)
})

swEmitter.on('restart-init', function(interval_ms) {
	// setTimeout(swReload, interval_ms);
})


progress(loading_process_count + '| ' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded) )

function startPlayer(err, eid) {
	if (err) {
		console.log('startPlayer err:', err)
		setTimeout(function() {
			process.exit(0)
		}, 300)
		return
	}
	if (loading_process_count > 0) {
		console.log('Waiting for loaders to calm down. Active processes: ' + loading_process_count)
		return
	}
	console.log('Reached stable state. Terminating in three.')
	fs.writeFileSync('elements.json', stringifier(swElements))
	swElements.forEach(function(swElement) {
		var meta_path = __META_DIR + swElement.id + ' ' + swElement.definition.keyname.split('sw-')[1] + '.json'
		fs.writeFileSync(meta_path, stringifier(swElement))
	})


	// console.log(stringifier(swElements))
	setTimeout(function() {
		process.exit(0)
	}, 6000)
}

// Start the action here! (in a sec)
swEmitter.emit('update-init', startPlayer)

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
			console.log('Shouldnt happen!')
			console.log('   ...always does...')
			writer.once('drain', function() {writer.write(buffer)})
		}
		writer.close()
		function addScreenshot() {
			console.log('Saving screenshot')
			EntuLib.addFile(__SCREEN_ID, 'sw-screen-photo', screenshot_path, function(err, data) {
				if (err) {
					console.log('captureScreenshot err:', util.inspect(err), util.inspect(data))
				}
				console.log(util.inspect(data))
			})
		}
		EntuLib.getEntity(__SCREEN_ID, function(err, entity) {
			if (err) {
				console.log('captureScreenshot err:', util.inspect(err), util.inspect(entity))
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
						console.log(util.inspect(item), util.inspect(data))
						if(-- stacksize === 0) {
							addScreenshot()
						}
					})
				})

			}
		})
	}, { format : 'jpeg', datatype : 'buffer'})
	// setTimeout(function() { callback(null, callback) }, 2222)
}
setTimeout(function() {
	captureScreenshot(null, captureScreenshot)
}, 2222)
