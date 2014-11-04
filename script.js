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


// Beware: we'll go quite eventful from now on
var swEmitter = new events.EventEmitter()

swEmitter.on('update-init', function(interval_ms) {
	setTimeout(swUpdate, interval_ms);
})

swEmitter.on('reload-init', function(interval_ms) {
	setTimeout(swReload, interval_ms);
})


var loading_process_count = 0
var total_download_size = 0
var bytes_downloaded = 0
progress(loading_process_count + '| ' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded) )

function loadMedia(err, entity_id, file_id, callback) {
	incrementProcessCount()
	if (err) {
		console.log('loadMedia err', err)
		callback(err)
		decrementProcessCount()
		return
	}
	var filename = __MEDIA_DIR + entity_id + '_' + file_id
	var download_filename = filename + '.download'

	// console.log ('Looking for ' + filename)
	if (fs.existsSync(filename)) {
		decrementProcessCount()
		callback(null)
		return
	}

	// console.log ('Looking for ' + download_filename)
	if (fs.existsSync(download_filename)) {
		console.log('Download for ' + filename + ' already in progress')
		decrementProcessCount()
		return
	}

	var writable = fs.createWriteStream(download_filename)

	console.log ('File ' + filename + ' missing. Fetch!')
	// TODO:
	// implement file fetcher for EntuLib
	// - with option to pass writable stream
	// - and returning callback with file path
	var options = {
		hostname: __HOSTNAME,
	 	port: 443,
		path: '/api2/file-' + file_id,
		method: 'GET'
	}
	var request = https.request(options)
	request.on('response', function response_handler( response ) {
		var filesize = response.headers['content-length']

		total_download_size += Number(filesize)
		console.log ('DOWNLOAD:' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded))
		progress(loading_process_count + '| ' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded) )
		response.on('data', function(chunk){
			bytes_downloaded += chunk.length
			progress(loading_process_count + '| ' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded) )
			writable.write(chunk)
		})
		response.on('end', function() {
			console.log ('DOWNLOAD:' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded))
			progress(loading_process_count + '| ' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded) )
			writable.end()
			try {
				fs.rename(download_filename, filename)
			} catch (e) {
			    console.log('CRITICAL: Messed up with parallel downloading of ' + filename + '. Cleanup and relaunch, please. Closing down.', e);
				process.exit(99)
			}
			decrementProcessCount()
			callback(null)
		})
	})
	request.end()
}

var swElements = []
function registerMeta(err, metadata, callback) {
	incrementProcessCount()
	if (err) {
		console.log('registerMeta err', err)
		callback(err)
		decrementProcessCount()
		return false
	}
	var properties = metadata.properties
	if (properties['valid-to'] !== undefined) {
		if (properties['valid-to'].values !== undefined) {
			var vt_date = new Date(properties['valid-to'].values[0].db_value)
			var now = Date.now()
			if (vt_date.getTime() < now) {
				decrementProcessCount()
				return false
			}
		}
	}
	var definition = metadata.definition.keyname.split('sw-')[1]
	if (definition === 'media') {
		var file_id = metadata.properties.file.values[0].db_value
		loadMedia(null, metadata.id, file_id, callback)
	}
	swElements.push({'id':metadata.id, 'definition':definition, 'element':metadata, 'parents':[], 'childs':[]})
	decrementProcessCount()
	return true
}

function reloadMeta(err, callback) {
	if (err) {
		console.log('reloadMeta err', err)
		callback(err)
		return
	}
	fs.readdirSync(__META_DIR).forEach(function(meta_fileName) {
		var result = fs.unlinkSync(__META_DIR + meta_fileName)
		if (result instanceof Error) {
		    console.log("Can't unlink " + __META_DIR + meta_fileName, result)
		}
    })
	loadMeta(null, __SCREEN_ID, __STRUCTURE, startPlayer)
}

function loadMeta(err, eid, struct_node, callback) {
	incrementProcessCount()
	if (err) {
		console.log('loadMeta err', err)
		callback(err)
		decrementProcessCount()
		return
	}
	var definition = struct_node.name
	var meta_path = __META_DIR + eid + ' ' + definition + '.json'
	var meta_json = ''
	fs.readFile(meta_path, function(err, data) {
		if (err) {
			// console.log('ENOENT', err)
			EntuLib.getEntity(eid, function(err, result) {
				if (err) {
					console.log(definition + ': ' + util.inspect(result), err)
					callback(err)
					decrementProcessCount()
					return
				}
				if (result.error !== undefined) {
					console.log (definition + ': ' + 'Failed to load from Entu EID=' + eid + '.')
					callback(new Error(result.error))
					decrementProcessCount()
					return
				}
				fs.writeFile(meta_path, stringifier(result.result), function(err) {
					if (err) {
						console.log(definition + ': ' + util.inspect(result))
						callback(err)
						decrementProcessCount()
						return
					}
				})
				loadMeta(null, eid, struct_node, callback)
				decrementProcessCount()
			})
			return
		}

		try {
			meta_json = JSON.parse(data)
		} catch (e) {
		    console.log('WARNING: Data got corrupted while reading from ' + meta_path + '. Retrying.', e);
			loadMeta(null, eid, struct_node, callback)
			decrementProcessCount()
			return
		}

		console.log('Successfully loaded ' + definition + ' ' + eid)
		if (registerMeta(null, meta_json, callback) === false) {
			console.log('Not registered ' + definition + ' ' + eid)
			decrementProcessCount()
			callback(null)
			return
		}
		console.log('Registered ' + definition + ' ' + eid)


		if (struct_node.reference !== undefined) {
			ref_def_name = struct_node.reference.name
			ref_def_id = meta_json.properties[ref_def_name].values[0].db_value
			loadMeta(null, ref_def_id, struct_node.reference, callback)
			decrementProcessCount()
			// console.log(struct_node.reference)
		}
		else if (struct_node.child !== undefined) {
			ch_def_name = struct_node.child.name
			// console.log(struct_node.child)
			EntuLib.getChilds(eid, function(err, result) {
				if (err) {
					console.log(definition + ': ' + util.inspect(result), err)
					callback(err)
					decrementProcessCount()
					return
				}
				if (result.error !== undefined) {
					console.log (definition + ': ' + 'Failed to load childs for EID=' + eid + '.')
					callback(new Error(result.error))
					decrementProcessCount()
					return
				}
				// console.log(ch_def_name + ': ' + util.inspect(result, {depth:null}))
				result.result['sw-'+ch_def_name].entities.forEach(function(entity) {
					loadMeta(null, entity.id, struct_node.child, callback)
				})
				decrementProcessCount()
			})
		}
		else {
			decrementProcessCount()
			callback(null)
		}
	})
}

function startPlayer(err, eid) {
	if (err) {
		console.log(err)
		return
	}
	if (loading_process_count > 0) {
		console.log('Waiting for loaders to calm down. Active processes: ' + loading_process_count)
		return
	}
	console.log('Reached stable state. Terminating in three.')
	// console.log(stringifier(swElements))
	setTimeout(function() {
		process.exit(0)
	}, 3000);
}

setTimeout(function() {
	loadMeta(null, __SCREEN_ID, __STRUCTURE, startPlayer)
	// reloadMeta(null, __SCREEN_ID, __STRUCTURE, startPlayer)
}, 10);


var swUpdate = function swUpdate() {
	null
}

