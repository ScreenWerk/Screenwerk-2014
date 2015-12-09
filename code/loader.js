// 1. Core modules
var fs              = require('fs')
var path            = require('path')
// var url             = require('url')
// var https           = require('https')
// var uuid            = require('node-uuid')
var my_crypto       = require('crypto')


// 2. Public modules from npm
var request       = require('request')
// var https           = require('follow-redirects').https


// 3. Own modules
var entulib         = require('../code/entulib.js')
var stringifier     = require('../code/stringifier.js')
var c               = require('../code/c.js')
var helper          = require('../code/helper.js')

var document = window.document

var loading_process_count = 0
var total_download_size = 0
var bytes_downloaded = 0
function decrementProcessCount() {
    -- loading_process_count
    // console.log('loading_process_count: ' + loading_process_count)
    progress(loading_process_count + '| ' + helper.bytesToSize(total_download_size) + ' - '
    + helper.bytesToSize(bytes_downloaded) + ' = ' + helper.bytesToSize(total_download_size - bytes_downloaded) )
}
function incrementProcessCount() {
    ++ loading_process_count
    // console.log('loading_process_count: ' + loading_process_count)
    progress(loading_process_count + '| ' + helper.bytesToSize(total_download_size) + ' - '
    + helper.bytesToSize(bytes_downloaded) + ' = ' + helper.bytesToSize(total_download_size - bytes_downloaded) )
}
function countLoadingProcesses() {
    return loading_process_count
}

function progress(message) {
    if (document.body !== null) {
        var progress_DOM = document.getElementById('progress')
        if (progress_DOM === null) {
            progress_DOM = document.createElement('pre')
            progress_DOM.id = 'progress'
            document.body.appendChild(progress_DOM)
        }
        progress_DOM.textContent = c.__VERSION + '\n' + message
        document.getElementById('progress').style.display = 'block'
    }
}


function loadMedia(err, entity_id, file_value, loadMediaCallback) {
    var file_id = file_value.db_value
    // var file_md5 = file_value.md5
    // console.log('loadMedia ',file_value)
    incrementProcessCount()
    if (err) {
        console.log('loadMedia err', err)
        loadMediaCallback(err)
        decrementProcessCount()
        return
    }
    var filename = path.resolve(c.__MEDIA_DIR, entity_id + '_' + file_id)
    var download_filename = filename + '.download'

    if (fs.existsSync(filename)) {
        decrementProcessCount()
        loadMediaCallback(null)
        return
    }
    if (fs.existsSync(download_filename)) {
        // console.log('Download for ' + filename + ' already in progress')
        decrementProcessCount()
        return
    }

    var fetch_uri = 'https://' + c.__HOSTNAME + '/api2/file-' + file_id
    request
        .get(fetch_uri)
        .on('error', function(err) {
            console.log(err)
        })
        .on('response', function response_handler( response ) {
            var filesize = response.headers['content-length']
            var md5sum = my_crypto.createHash('md5')

            total_download_size += Number(filesize)
            // console.log('Downloading:' + helper.bytesToSize(bytes_downloaded) + ' of ' + helper.bytesToSize(total_download_size))
            progress(loading_process_count + '| ' + helper.bytesToSize(total_download_size) + ' - '
            + helper.bytesToSize(bytes_downloaded) + ' = ' + helper.bytesToSize(total_download_size - bytes_downloaded) )
            response.on('data', function(chunk) {
                md5sum.update(chunk)
                bytes_downloaded += chunk.length
                progress(loading_process_count + '| ' + helper.bytesToSize(total_download_size) + ' - '
                + helper.bytesToSize(bytes_downloaded) + ' = ' + helper.bytesToSize(total_download_size - bytes_downloaded) )
            })
            response.on('end', function() {
                progress(loading_process_count + '| ' + helper.bytesToSize(total_download_size) + ' - '
                + helper.bytesToSize(bytes_downloaded) + ' = ' + helper.bytesToSize(total_download_size - bytes_downloaded) )
                // MD5 check
                var my_md5 = md5sum.digest('hex')
                // MD5 check is disabled for now as we can't get MD5's from Amazon
                if (response.statusCode === 200) {
                    console.log('Downloaded media to ' + filename + ' MD5: ' + my_md5)
                    try {
                        fs.rename(download_filename, filename)
                    } catch (e) {
                        console.log('CRITICAL: Messed up with parallel downloading of ' + filename + '. Cleanup and relaunch, please. Closing down.', e)
                        process.exit(99)
                    }
                    decrementProcessCount()
                    loadMediaCallback(null)
                } else {
                    fs.unlinkSync(download_filename)
                    decrementProcessCount()
                    console.log('Downloading media ' + filename + ' Response statusCode: ' + response.statusCode + ', message: '
                    + response.statusMessage + '. Trying again...')
                    loadMedia(null, entity_id, file_value, loadMediaCallback)
                }
            })
        })
        .pipe(fs.createWriteStream(download_filename))
}


var swElements = []
var swElementsById = {}

// function unregisterMeta(err, eidx, callback) {
//     var eid = swElements[eidx].id
//     console.log('UNREGISTER ' + eid)
//     if (eid === c.__SCREEN_ID) {
//         callback('Screen has no content. Everything expired?', eid)
//         process.exit(99)
//     }
//     if (swElementsById[eid] === undefined) {
//         callback('Entity absent. Already unregistered?', eid)
//         return
//     }
//     var parent_eid = swElementsById[eid].parents[0]
//     // console.log(swElementsById[eid], swElementsById[parent_eid], parent_eid)
//     swElementsById[parent_eid].childs.splice(swElementsById[parent_eid].childs.indexOf(eid), 1)
//     swElements.splice(eidx, 1)
//     delete swElementsById[eid]
//     callback()
// }

// Integrity check and element validation
function registerMeta(err, metadata, callback) {
    incrementProcessCount()
    if (err) {
        console.log('registerMeta err', err)
        callback(err, metadata) //
        decrementProcessCount()
        return false
    }
    // console.log('registerMeta ', metadata.id)
    // var properties = metadata.properties
    // if (properties['valid-to'] !== undefined) {
    //  if (properties['valid-to'].values !== undefined) {
    //      var vt_date = new Date(properties['valid-to'].values[0].db_value)
    //      var now = Date.now()
    //      if (vt_date.getTime() < now) {
    //          decrementProcessCount()
    //          // console.log('valid-to in past:', properties)
    //          return false
    //      }
    //  }
    // }
    var definition = metadata.definition.keyname.split('sw-')[1]

    switch (definition) {
        case 'screen':
            if (metadata.properties.published.values === undefined) {
                metadata.properties.published.values = [{'value':new Date(Date.parse('2004-01-01')).toJSON()}]
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
            if (metadata.properties.file.values === undefined
                && metadata.properties.url.values === undefined) {
                    throw ('\'URL\' or \'file\' property must be set for ' + metadata.id)
            }
            if (metadata.properties.file.values !== undefined) {
                metadata.properties.filepath = {'values': [{'db_value': path.resolve(c.__MEDIA_DIR, metadata.id + '_'
                + metadata.properties.file.values[0].db_value)}]}
                loadMedia(null, metadata.id, metadata.properties.file.values[0], callback)
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
    fs.readdirSync(c.__META_DIR).forEach(function(meta_fileName) {
        var result = fs.unlinkSync(path.resolve(c.__META_DIR, meta_fileName))
        if (result instanceof Error) {
            console.log('Can\'t unlink ' + path.resolve(c.__META_DIR, meta_fileName, result))
        }
    })
    loadMeta(null, null, c.__SCREEN_ID, c.__STRUCTURE, callback)
}

//
// Load metafiles.
// Fetch only if not present
function loadMeta(err, parent_eid, eid, struct_node, callback) {
    var EntuLib = entulib(c.__SCREEN_ID, c.__API_KEY, c.__HOSTNAME)
    // console.log('initialize EntuLib with ' + c.__SCREEN_ID + '|' + c.__API_KEY + '|' + c.__HOSTNAME)
    // console.log('loadMeta: ', eid, struct_node)
    incrementProcessCount()
    if (err) {
        console.log('loadMeta err', err)
        callback(err)
        decrementProcessCount()
        return
    }
    var definition = struct_node.name
    var meta_path = path.resolve(c.__META_DIR, eid + ' ' + definition + '.json')
    var meta_json = ''

    fs.readFile(meta_path, function(err, data) {
        if (err) {
            EntuLib.getEntity(eid, function(err, result) {
                if (err) {
                    console.log(definition + ': ' + (result), err, result)
                    callback(err)
                    decrementProcessCount()
                    return
                } else if (result.error !== undefined) {
                    console.log (result.error, definition + ': ' + 'Failed to load from Entu EID=' + eid + '.')
                    callback(result.error, result)
                    decrementProcessCount()
                    return
                } else {
                    var properties = result.result.properties
                    if (properties.animate !== undefined && properties.animate.values !== undefined) {
                        var animation_eid = properties.animate.values[0].db_value
                        EntuLib.getEntity(animation_eid, function(err, animate_result) {
                            if (err) {
                                console.log(definition + ': ' + (animate_result), err, animate_result)
                                callback(err)
                                decrementProcessCount()
                                return
                            } else if (animate_result.error !== undefined) {
                                console.log (animate_result.error, definition + ': ' + 'Failed to load from Entu EID=' + eid + '.')
                                callback(animate_result.error, animate_result)
                                decrementProcessCount()
                                return
                            } else {
                                var animate_properties = animate_result.result.properties
                                properties.animate.values[0].begin = animate_properties.begin.values[0].db_value
                                properties.animate.values[0].end = animate_properties.end.values[0].db_value
                                fs.writeFile(meta_path, stringifier(result.result), function(err) {
                                    if (err) {
                                        console.log(definition + ': ' + (result))
                                        callback(err)
                                        decrementProcessCount()
                                        return // form writeFile -> getEntity -> getEntity -> readFile -> loadMeta
                                    } else {
                                        // console.log('calling back', parent_eid, eid, struct_node, callback)
                                        loadMeta(null, parent_eid, eid, struct_node, callback)
                                        decrementProcessCount()
                                        return // form writeFile -> getEntity -> getEntity -> readFile -> loadMeta
                                    }
                                })
                            }
                        })
                    } else {
                        fs.writeFile(meta_path, stringifier(result.result), function(err) {
                            if (err) {
                                console.log(definition + ': ' + (result))
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
                }
            })
        } else { // read from file succeeded
            try {
                meta_json = JSON.parse(data)
            } catch (e) {
                console.log('WARNING: Data got corrupted while reading from ' + meta_path + '. Retrying.')
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
                    var ref_entity_name = struct_node.reference.name
                    if (meta_json.properties[ref_entity_name].values === undefined) {
                        callback(new Error(struct_node.name + ' ' + eid + ' has no ' + ref_entity_name + '\'s.'))
                        decrementProcessCount()
                    }
                    // console.log(ref_entity_name, meta_json)
                    var ref_entity_id = meta_json.properties[ref_entity_name].values[0].db_value
                    registerChild(null, parent_eid, meta_json, ref_entity_id, function(err) {
                        // console.log(ref_entity_id)
                        loadMeta(err, eid, ref_entity_id, struct_node.reference, callback)
                    })
                    decrementProcessCount()
                    // console.log(struct_node.reference)
                }
                else if (struct_node.child !== undefined) {
                    var ch_def_name = struct_node.child.name
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
                        if (!ch_result.result['sw-'+ch_def_name]) {
                            err = definition + ' ' + eid + ': Missing expected elements of ' + ch_def_name + '.'
                            console.log(err + (ch_result.result, {depth:null}))
                            callback(err)
                            return
                        }
                        if (ch_result.result['sw-'+ch_def_name].entities.length === 0) {
                            callback(new Error(struct_node.name + ' ' + eid + ' has no ' + ch_def_name + '\'s.'))
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
        // decrementProcessCount()
        return callback(err)
    }
    if (element.childs === undefined) {
        element.childs = []
    }
    if (child_eid !== undefined && child_eid !== null && element.childs.indexOf(child_eid) === -1) {
        element.childs.push(child_eid)
    }
    if (element.parents === undefined) {
        element.parents = []
    }
    if (parent_eid !== undefined && parent_eid !== null && element.parents.indexOf(parent_eid) === -1) {
        element.parents.push(parent_eid)
    }
    callback(null)
}

module.exports.countLoadingProcesses = countLoadingProcesses
// module.exports.total_download_size = total_download_size
// module.exports.bytes_downloaded = bytes_downloaded
// module.exports.decrementProcessCount = decrementProcessCount
// module.exports.incrementProcessCount = incrementProcessCount
module.exports.loadMeta = loadMeta
module.exports.reloadMeta = reloadMeta
module.exports.swElements = swElements
module.exports.swElementsById = swElementsById
