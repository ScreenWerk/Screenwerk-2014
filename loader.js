// 1. core modules
var assert  	= require('assert')
var util    	= require('util')
var fs      	= require('fs')
var https   	= require('https')
var my_crypto  	= require('crypto')
var path    	= require('path')


// 2. public modules from npm
var os      = require('os-utils')


// 3. Own modules
var helper      = require('./helper.js')
var EntuLib     = require('./entulib.js')
var stringifier = require('./stringifier.js')
var c           = require('./c.js')

console.log('initialize EntuLib with ' + c.__SCREEN_ID + '|' + c.__API_KEY + '|' + c.__HOSTNAME)
var EntuLib = new EntuLib(c.__SCREEN_ID, c.__API_KEY, c.__HOSTNAME)


function loadMedia(err, entity_id, file_value, callback) {
	var file_id = file_value.db_value
	var file_md5 = file_value.md5
	console.log('loadMedia ',file_value)
	helper.incrementProcessCount()
	if (err) {
		console.log('loadMedia err', err)
		callback(err)
		helper.decrementProcessCount()
		return
	}
	var filename = path.resolve(c.__MEDIA_DIR, entity_id + '_' + file_id)
	var download_filename = filename + '.download'

	// console.log ('Looking for ' + filename)
	if (fs.existsSync(filename)) {
		helper.decrementProcessCount()
		callback(null)
		return
	}

	// console.log ('Looking for ' + download_filename)
	if (fs.existsSync(download_filename)) {
		// console.log('Download for ' + filename + ' already in progress')
		helper.decrementProcessCount()
		return
	}

	var writable = fs.createWriteStream(download_filename)

	// console.log ('File ' + filename + ' missing. Fetch!')

	// TODO:
	// implement file fetcher for EntuLib
	// - with option to pass writable stream
	// - and returning callback with file path
	var options = {
		hostname: c.__HOSTNAME,
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
		var md5sum = my_crypto.createHash('md5')
		console.log(util.inspect(md5sum))

		helper.total_download_size += Number(filesize)
		console.log (helper.total_download_size, Number(filesize))
		console.log('Downloading:' + bytesToSize(helper.bytes_downloaded) + ' of ' + bytesToSize(helper.total_download_size))
		progress(loading_process_count + '| ' + bytesToSize(helper.total_download_size) + ' - ' + bytesToSize(helper.bytes_downloaded) + ' = ' + bytesToSize(helper.total_download_size - helper.bytes_downloaded) )
		response.on('data', function(chunk){
			md5sum.update(chunk)
			console.log(util.inspect(md5sum))
			helper.bytes_downloaded += chunk.length
			progress(loading_process_count + '| ' + bytesToSize(helper.total_download_size) + ' - ' + bytesToSize(helper.bytes_downloaded) + ' = ' + bytesToSize(helper.total_download_size - helper.bytes_downloaded) )
			writable.write(chunk)
		})
		response.on('end', function() {
			progress(loading_process_count + '| ' + bytesToSize(helper.total_download_size) + ' - ' + bytesToSize(helper.bytes_downloaded) + ' = ' + bytesToSize(helper.total_download_size - helper.bytes_downloaded) )
			writable.end()
			// MD5 check
			var my_md5 = md5sum.digest('hex')
			console.log(util.inspect(md5sum))
			if (file_md5 === my_md5) {
				console.log('Downloaded media to ' + filename + ' MD5: ' + my_md5)
				try {
					fs.rename(download_filename, filename)
				} catch (e) {
				    console.log('CRITICAL: Messed up with parallel downloading of ' + filename + '. Cleanup and relaunch, please. Closing down.', e)
					process.exit(99)
				}
				helper.decrementProcessCount()
				callback(null)
			} else {
				fs.unlinkSync(download_filename)
				helper.decrementProcessCount()
				console.log('Downloaded media ' + filename + ' checksum fail. Got ' + my_md5 + ', expected ' + file_md5 + '. Trying again...')
				loadMedia(null, entity_id, file_value, callback)
			}
		})
	})
	request.end()
}


var swElements = []
var swElementsById = {}
module.exports.swElements = swElements
module.exports.swElementsById = swElementsById

function unregisterMeta(err, eidx, callback) {
	var eid = swElements[eidx].id
	console.log('UNREGISTER ' + eid)
	if (eid === c.__SCREEN_ID) {
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
module.exports.unregisterMeta = unregisterMeta


// Integrity check and element validation
function registerMeta(err, metadata, callback) {
	helper.incrementProcessCount()
	if (err) {
		console.log('registerMeta err', err)
		callback(err, metadata) //
		helper.decrementProcessCount()
		return false
	}
	var properties = metadata.properties
	// if (properties['valid-to'] !== undefined) {
	// 	if (properties['valid-to'].values !== undefined) {
	// 		var vt_date = new Date(properties['valid-to'].values[0].db_value)
	// 		var now = Date.now()
	// 		if (vt_date.getTime() < now) {
	// 			helper.decrementProcessCount()
	// 			// console.log('valid-to in past:', properties)
	// 			return false
	// 		}
	// 	}
	// }
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
				metadata.properties['update-interval'].values = [{'db_value':c.__DEFAULT_UPDATE_INTERVAL_MINUTES}]
			}
			c.__UPDATE_INTERVAL_SECONDS = metadata.properties['update-interval'].values[0].db_value * 60
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
				metadata.properties.filepath = {'values': [{'db_value': path.resolve(c.__MEDIA_DIR, metadata.id + '_' + metadata.properties.file.values[0].db_value)}]}
				loadMedia(null, metadata.id, metadata.properties.file.values[0], callback)
			}
		break
		default:
			callback('Unrecognised definition: ' + metadata.definition.keyname, metadata)
			return
	}
	swElements.push(metadata)
	swElementsById[metadata.id] = metadata
	helper.decrementProcessCount()
	return true
}

function reloadMeta(err, callback) {
	if (err) {
		console.log('reloadMeta err', err)
		callback(err)
		return
	}
	fs.readdirSync(c.__META_DIR).forEach(function(meta_fileName) {
		var result = fs.unlinkSync(path.resolve(c.__META_DIR, meta_fileName))
		if (result instanceof Error) {
		    console.log("Can't unlink " + path.resolve(c.__META_DIR, meta_fileName, result))
		}
    })
	loadMeta(null, null, c.__SCREEN_ID, c.__STRUCTURE, callback)
}
module.exports.reloadMeta = reloadMeta


//
// Load metafiles.
// Fetch only if not present
function loadMeta(err, parent_eid, eid, struct_node, callback) {
	// console.log('loadMeta: ', eid, struct_node)
	helper.incrementProcessCount()
	if (err) {
		console.log('loadMeta err', err)
		callback(err)
		helper.decrementProcessCount()
		return
	}
	var definition = struct_node.name
	var meta_path = path.resolve(c.__META_DIR, eid + ' ' + definition + '.json')
	var meta_json = ''

	fs.readFile(meta_path, function(err, data) {
		if (err) {
			// console.log('ENOENT', meta_path, err, data)
			EntuLib.getEntity(eid, function(err, result) {
				if (err) {
					console.log(definition + ': ' + util.inspect(result), err, result)
					callback(err)
					helper.decrementProcessCount()
					return
				} else if (result.error !== undefined) {
					console.log (result.error, definition + ': ' + 'Failed to load from Entu EID=' + eid + '.')
					callback(result.error, result)
					helper.decrementProcessCount()
					return
				} else {
					var properties = result.result.properties
					if (properties.animate !== undefined && properties.animate.values !== undefined) {
						var animation_eid = properties.animate.values[0].db_value
						EntuLib.getEntity(animation_eid, function(err, animate_result) {
							if (err) {
								console.log(definition + ': ' + util.inspect(animate_result), err, animate_result)
								callback(err)
								helper.decrementProcessCount()
								return
							} else if (animate_result.error !== undefined) {
								console.log (animate_result.error, definition + ': ' + 'Failed to load from Entu EID=' + eid + '.')
								callback(animate_result.error, animate_result)
								helper.decrementProcessCount()
								return
							} else {
								var animate_properties = animate_result.result.properties
								properties.animate.values[0].begin = animate_properties.begin.values[0].db_value
								properties.animate.values[0].end = animate_properties.end.values[0].db_value
								fs.writeFile(meta_path, stringifier(result.result), function(err) {
									if (err) {
										console.log(definition + ': ' + util.inspect(result))
										callback(err)
										helper.decrementProcessCount()
										return // form writeFile -> getEntity -> getEntity -> readFile -> loadMeta
									} else {
										console.log('calling back', parent_eid, eid, struct_node, callback)
										loadMeta(null, parent_eid, eid, struct_node, callback)
										helper.decrementProcessCount()
										return // form writeFile -> getEntity -> getEntity -> readFile -> loadMeta
									}
								})
							}
						})
					} else {
						fs.writeFile(meta_path, stringifier(result.result), function(err) {
							if (err) {
								console.log(definition + ': ' + util.inspect(result))
								callback(err)
								helper.decrementProcessCount()
								return // form writeFile -> getEntity -> readFile -> loadMeta
							} else {
								loadMeta(null, parent_eid, eid, struct_node, callback)
								helper.decrementProcessCount()
								return // form writeFile -> getEntity -> readFile -> loadMeta
							}
						})
					}
				}
			})
		} else { // read from file succeeded
			try {
				meta_json = JSON.parse(data)
			} catch (e) {
			    console.log('WARNING: Data got corrupted while reading from ' + meta_path + '. Retrying.', e)
				loadMeta(null, parent_eid, eid, struct_node, callback)
				helper.decrementProcessCount()
				return // form readFile -> loadMeta
			}

			if (registerMeta(null, meta_json, callback) === false) {
				console.log('Not registered ' + definition + ' ' + eid)
				helper.decrementProcessCount()
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
						helper.decrementProcessCount()
					}
					// console.log(ref_entity_name, meta_json)
					ref_entity_id = meta_json.properties[ref_entity_name].values[0].db_value
					registerChild(null, parent_eid, meta_json, ref_entity_id, function(err) {
						// console.log(ref_entity_id)
						loadMeta(err, eid, ref_entity_id, struct_node.reference, callback)
					})
					helper.decrementProcessCount()
					// console.log(struct_node.reference)
				}
				else if (struct_node.child !== undefined) {
					var ch_def_name = struct_node.child.name
					EntuLib.getChilds(eid, function(err, ch_result) {
						if (err) {
							console.log('loadMeta ' + eid + ' err:', err)
							callback(err)
							helper.decrementProcessCount()
							return
						}
						if (ch_result.error !== undefined) {
							console.log (definition + ': ' + 'Failed to load childs for EID=' + eid + '.')
							callback(new Error(ch_result.error))
							helper.decrementProcessCount()
							return
						}
						if (!ch_result.result['sw-'+ch_def_name]) {
							var err = definition + ' ' + eid + ': Missing expected elements of ' + ch_def_name + '.'
							console.log(err + util.inspect(ch_result.result, {depth:null}))
							callback(err)
							return
						}
						if (ch_result.result['sw-'+ch_def_name].entities.length === 0) {
							callback(new Error(struct_node.name + ' ' + eid + ' has no ' + ch_def_name + "'s."))
							helper.decrementProcessCount()
						}
						ch_result.result['sw-'+ch_def_name].entities.forEach(function(entity) {
							registerChild(null, parent_eid, meta_json, entity.id, function() {
								// console.log(entity.id)
								loadMeta(null, eid, entity.id, struct_node.child, callback)
							})
						})
						helper.decrementProcessCount()
					})
				}
				else {
					registerChild(null, parent_eid, meta_json, null, function() {})
					helper.decrementProcessCount()
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
				helper.decrementProcessCount()
				callback(null)
			}
		}
	})
}
module.exports.loadMeta = loadMeta


function registerChild(err, parent_eid, element, child_eid, callback) {
	if (err) {
		console.log('registerChild err:', err)
		callback(err)
		// helper.decrementProcessCount()
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

