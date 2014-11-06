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



var loading_process_count = 0
var total_download_size = 0
var bytes_downloaded = 0

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
		// console.log('Download for ' + filename + ' already in progress')
		decrementProcessCount()
		return
	}

	var writable = fs.createWriteStream(download_filename)

	// console.log ('File ' + filename + ' missing. Fetch!')

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
		console.log('Downloading:' + bytesToSize(bytes_downloaded) + ' of ' + bytesToSize(total_download_size))
		progress(loading_process_count + '| ' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded) )
		response.on('data', function(chunk){
			bytes_downloaded += chunk.length
			progress(loading_process_count + '| ' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded) )
			writable.write(chunk)
		})
		response.on('end', function() {
			console.log('Downloading:' + bytesToSize(bytes_downloaded) + ' of ' + bytesToSize(total_download_size))
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
var element_register = []
function registerMeta(err, metadata, callback) {
	if (element_register.indexOf(metadata.id) > -1)
		return true
	element_register.push(metadata.id)
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
	swElements.push(metadata)
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
	console.log('loadMeta: ', eid, struct_node)
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
			// console.log('ENOENT', meta_path, err, data)
			EntuLib.getEntity(eid, function(err, result) {
				if (err) {
					console.log(definition + ': ' + util.inspect(result), err, result)
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

		// console.log('Successfully loaded ' + definition + ' ' + eid)
		if (registerMeta(null, meta_json, callback) === false) {
			console.log('Not registered ' + definition + ' ' + eid)
			decrementProcessCount()
			callback(null)
			return
		}
		// console.log('Registered ' + definition + ' ' + eid)

		if (meta_json.childs === undefined) {
			meta_json.childs = []
			if (struct_node.reference !== undefined) {
				ref_entity_name = struct_node.reference.name
				ref_entity_id = meta_json.properties[ref_entity_name].values[0].db_value
				registerChild(null, meta_json, ref_entity_id, function(err) {
					console.log(ref_entity_id)
					loadMeta(err, ref_entity_id, struct_node.reference, callback)
				})
				decrementProcessCount()
				// console.log(struct_node.reference)
			}
			else if (struct_node.child !== undefined) {
				ch_def_name = struct_node.child.name
				// console.log(struct_node.child)
				EntuLib.getChilds(eid, function(err, ch_result) {
					if (err) {
						console.log('loadMeta err:', err)
						callback(err)
						decrementProcessCount()
						return
					}
					if (ch_result.error !== undefined) {
						console.log (definition + ': ' + 'Failed to load childs for EID=' + eid + '.')
						callback(new Error(ch_result.error))
						decrementProcessCount()
						return
					}
					// console.log(ch_def_name + ': ' + util.inspect(ch_result, {depth:null}))
					ch_result.result['sw-'+ch_def_name].entities.forEach(function(entity) {
						registerChild(null, meta_json, entity.id, function() {
							console.log(entity.id)
							loadMeta(null, entity.id, struct_node.child, callback)
						})
					})
					decrementProcessCount()
				})
			}
			else {
				decrementProcessCount()
				callback(null)
			}
		}
		else {
			meta_json.childs.forEach(function(child) {
				if (struct_node.reference !== undefined) {
					console.log(child)
					loadMeta(null, child, struct_node.reference, callback)
				}
				if (struct_node.child !== undefined) {
					console.log(child)
					loadMeta(null, child, struct_node.child, callback)
				}
			})
			decrementProcessCount()
			callback(null)
		}
	})
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}

function registerChild(err, parent, child, callback) {
	if (err) {
		console.log('registerChild err:', err)
		callback(err)
		// decrementProcessCount()
		return
	}
	if (parent.childs.indexOf(child) === -1)
		parent.childs.push(child)
	callback(null)
}

