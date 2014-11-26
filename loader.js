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
	request.on('error', function error_handler( err ) {
		console.log('Where\'s net?', err)
		process.exit(99)
	})
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
var swElementsById = {}

function unregisterMeta(err, eidx, callback) {
	var eid = swElements[eidx].id
	console.log('UNREGISTER ' + eid)
	if (eid === __SCREEN_ID) {
		callback('Screen has no content. Everything expired?', eid)
		process.exit(99)
	}
	if (swElementsById[eid] === undefined) {
		callback('Entity absent. Already unregistered?', eid)
		return
	}
	var parent_eid = swElementsById[eid].parents[0]
	// console.log(swElementsById[eid], swElementsById[parent_eid], parent_eid)
	swElementsById[parent_eid].childs.splice(swElementsById[parent_eid].childs.indexOf(eid), 1)
	swElements.splice(eidx, 1)
	delete swElementsById[eid]
	callback()
}

// Integrity check and element validation
function registerMeta(err, metadata, callback) {
	incrementProcessCount()
	if (err) {
		console.log('registerMeta err', err)
		callback(err, metadata) //
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
				// console.log('valid-to in past:', properties)
				return false
			}
		}
	}
	var definition = metadata.definition.keyname.split('sw-')[1]

	switch (definition) {
		case 'screen':
			if (metadata.properties['published'].values === undefined) {
				metadata.properties['published'].values = [{'value':new Date(Date.parse('2004-01-01')).toJSON()}]
			}
		break
		case 'screen-group':
		break
		case 'configuration':
			if (metadata.properties['update-interval'].values === undefined) {
				metadata.properties['update-interval'].values = [{'db_value':__DEFAULT_UPDATE_INTERVAL_MINUTES}]
			}
			__UPDATE_INTERVAL_SECONDS = metadata.properties['update-interval'].values[0].db_value * 60
		break
		case 'schedule':
			if (metadata.properties.crontab.values === undefined) {
				callback('Schedule ' + metadata.id + ' has no crontab.', metadata)
				return
			}
			if (metadata.properties.cleanup.values === undefined) {
				metadata.properties.cleanup.values = [{'db_value':0}]
			}
			if (metadata.properties.ordinal.values === undefined) {
				metadata.properties.ordinal.values = [{'db_value':0}]
			}
		break
		case 'layout':
		break
		case 'layout-playlist':
			if (metadata.properties.zindex.values === undefined) {
				metadata.properties.zindex.values = [{'db_value':1}]
			}
		break
		case 'playlist':
		break
		case 'playlist-media':
			if (metadata.properties.ordinal.values === undefined) {
				metadata.properties.ordinal.values = [{'db_value':1}]
			}
			if (metadata.properties.mute.values === undefined) {
				metadata.properties.mute.values = [{'db_value':1}]
			}
			if (metadata.properties.delay.values === undefined) {
				metadata.properties.delay.values = [{'db_value':0}]
			}
		break
		case 'media':
			if (metadata.properties.type.values === undefined) {
				callback('Media ' + metadata.id + ' type not specified.', metadata)
				return
			}
			if (metadata.properties.file.values === undefined && metadata.properties.url.values === undefined)
				throw ('"URL" or "file" property must be set for ' + metadata.id)
			if (metadata.properties.file.values !== undefined) {
				metadata.properties.filepath = {'values': [{'db_value':__MEDIA_DIR + metadata.id + '_' + metadata.properties.file.values[0].db_value}]}
				loadMedia(null, metadata.id, metadata.properties.file.values[0].db_value, callback)
			}
		break
		default:
			callback('Unrecognised definition: ' + metadata.definition.keyname, metadata)
			return
	}
	swElements.push(metadata)
	swElementsById[metadata.id] = metadata
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
	loadMeta(null, null, __SCREEN_ID, __STRUCTURE, callback)
}

//
// Load metafiles.
// Fetch only if not present
function loadMeta(err, parent_eid, eid, struct_node, callback) {
	// console.log('loadMeta: ', eid, struct_node)
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
				} else if (result.error !== undefined) {
					console.log (result.error, definition + ': ' + 'Failed to load from Entu EID=' + eid + '.')
					callback(result.error, result)
					decrementProcessCount()
					return
				} else {
					fs.writeFile(meta_path, stringifier(result.result), function(err) {
						if (err) {
							console.log(definition + ': ' + util.inspect(result))
							callback(err)
							decrementProcessCount()
							return // form writeFile -> getEntity -> readFile -> loadMeta
						} else {
							loadMeta(null, parent_eid, eid, struct_node, callback)
							decrementProcessCount()
							return // form writeFile -> getEntity -> readFile -> loadMeta
						}
					})
				}
			})
		} else { // read from file succeeded
			try {
				meta_json = JSON.parse(data)
			} catch (e) {
			    console.log('WARNING: Data got corrupted while reading from ' + meta_path + '. Retrying.', e);
				loadMeta(null, parent_eid, eid, struct_node, callback)
				decrementProcessCount()
				return // form readFile -> loadMeta
			}

			if (registerMeta(null, meta_json, callback) === false) {
				console.log('Not registered ' + definition + ' ' + eid)
				decrementProcessCount()
				callback(null)
				swElementsById[parent_eid].childs.splice(swElementsById[parent_eid].childs.indexOf(eid),1)
				return // form readFile -> loadMeta
			}

			if (meta_json.childs === undefined) {
				meta_json.childs = []
				if (struct_node.reference !== undefined) {
					ref_entity_name = struct_node.reference.name
					if (meta_json.properties[ref_entity_name].values === undefined) {
						callback(new Error(struct_node.name + ' ' + eid + ' has no ' + ref_entity_name + "'s."))
						decrementProcessCount()
					}
					ref_entity_id = meta_json.properties[ref_entity_name].values[0].db_value
					registerChild(null, parent_eid, meta_json, ref_entity_id, function(err) {
						// console.log(ref_entity_id)
						loadMeta(err, eid, ref_entity_id, struct_node.reference, callback)
					})
					decrementProcessCount()
					// console.log(struct_node.reference)
				}
				else if (struct_node.child !== undefined) {
					ch_def_name = struct_node.child.name
					// console.log(struct_node.child)
					EntuLib.getChilds(eid, function(err, ch_result) {
						if (err) {
							console.log('loadMeta ' + eid + ' err:', err)
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
						if (ch_result.result['sw-'+ch_def_name].entities.length === 0) {
							callback(new Error(struct_node.name + ' ' + eid + ' has no ' + ch_def_name + "'s."))
							decrementProcessCount()
						}
						ch_result.result['sw-'+ch_def_name].entities.forEach(function(entity) {
							registerChild(null, parent_eid, meta_json, entity.id, function() {
								// console.log(entity.id)
								loadMeta(null, eid, entity.id, struct_node.child, callback)
							})
						})
						decrementProcessCount()
					})
				}
				else {
					registerChild(null, parent_eid, meta_json, null, function() {})
					decrementProcessCount()
					callback(null)
				}
			}
			else {
				meta_json.childs.forEach(function(child) {
					if (struct_node.reference !== undefined) {
						// console.log(child)
						loadMeta(null, eid, child, struct_node.reference, callback)
					}
					if (struct_node.child !== undefined) {
						// console.log(child)
						loadMeta(null, eid, child, struct_node.child, callback)
					}
				})
				decrementProcessCount()
				callback(null)
			}
		}
	})
}


function registerChild(err, parent_eid, element, child_eid, callback) {
	if (err) {
		console.log('registerChild err:', err)
		callback(err)
		// decrementProcessCount()
		return
	}
	if (element.childs === undefined)
		element.childs = []
	if (child_eid !== undefined && child_eid !== null) {
		if (element.childs.indexOf(child_eid) === -1)
			element.childs.push(child_eid)
	}
	if (element.parents === undefined)
		element.parents = []
	if (parent_eid !== undefined && parent_eid !== null) {
		if (element.parents.indexOf(parent_eid) === -1)
			element.parents.push(parent_eid)
	}
	callback(null)
}

