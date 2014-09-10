/*
 * Screenwerk main executable. Arguments:
 *
 * argv[0]        Screen's Entu ID
 *
 */

var gui    = require('nw.gui')
var assert = require('assert')

assert.equal(typeof(gui.App.argv[0]), 'string'
			, "Screen ID should be passed as first argument.")
assert.ok(Number(gui.App.argv[0]) > 0
			, "Screen ID must be number greater than zero.")


window.constants = function constants() {
	return {
		SCREEN_ID:   function() { return Number(gui.App.argv[0]) },
		META_DIR:    function() { return 'sw-meta' },
		MEDIA_DIR:   function() { return 'sw-media' }
	}
}


var util    = require("util")
var fs      = require('fs')
var https   = require('https')
var events  = require('events')
var swEmitter = new events.EventEmitter()
var sw_ele  = require('./elements')
var sw_play = require('./player')
// var numlenf	= 6


fs.lstat(constants().META_DIR(), function(err, stats) {
	if (err) {
		console.log('Creating folder for ' + constants().META_DIR() + '.')
		fs.mkdir(constants().META_DIR())
	}
	else if (!stats.isDirectory()) {
		console.log('Renaming existing file "' + constants().META_DIR() + '" to "' + constants().META_DIR() + '.bak.')
		fs.renameSync(constants().META_DIR(), constants().META_DIR() + '.bak')
		console.log('Creating folder for ' + constants().META_DIR() + '.')
		fs.mkdir(constants().META_DIR())
    }
})
fs.lstat(constants().MEDIA_DIR(), function(err, stats) {
	if (err) {
		console.log('Creating folder for ' + constants().MEDIA_DIR() + '.')
		fs.mkdir(constants().MEDIA_DIR())
	}
	else if (!stats.isDirectory()) {
		console.log('Renaming existantsng file "' + consta.MEDIA_DIR() + '" to "' + consta.MEDIA_DIR() + '.bak.')
		fs.renameSync(constants().MEDIA_DIR(), constants().MEDIA_DIR() + '.bak')
		console.log('Creating folder for ' + constants().MEDIA_DIR() + '.')
		fs.mkdir(constants().MEDIA_DIR())
    }
})

// console.log(constants().META_DIR() + '/' + constants().SCREEN_ID() + '.sw-screen.json')

var swLoader = function swLoader(screenEid) {
	var swElements = []
	var loadersEngaged = 0
	swLoadScreen(constants().SCREEN_ID())

	swEmitter.on('loader-start', function(data) {
		console.log('Start loading ' + util.inspect(data))
		loadersEngaged++
	})
	swEmitter.on('loader-stop', function(data) {
		console.log('Stop loading ' + util.inspect(data))
		loadersEngaged--
	})

	function swFetch(callback, options) {
		var path = '/api2/entity-' + options.eid
		console.log('swFetch: ' + util.inspect(options))
		var request = https.request({ hostname: 'piletilevi.entu.ee', port: 443, path: path, method: 'GET' })
		// console.log('request: ' + util.inspect(request))
		request.on('response', function response_handler( response ) {
			// console.log('request: ' + util.inspect(request))
			// console.log('response: ' + util.inspect(response))
			var str = ''
			response.on('data', function chunk_sticher( chunk ) {
				str += chunk
				// console.log('CHUNK: ' + str.length + '(+' + chunk.length + ')')
			})
			response.on('end', function response_emitter() {
				var result = JSON.parse(str).result

				var filename = constants().META_DIR() + '/' + options.eid + '.' + options.sw_def + '.json'
				if (options.sw_child_def === undefined) {
					console.log('fswrite')
					fs.writeFileSync(filename, stringifier(result))
					callback(options.eid)
				} else {
					result.properties[options.sw_child_def] = {}
					result.properties[options.sw_child_def].values = []
					var child_request = https.request({ hostname: 'piletilevi.entu.ee', port: 443, path: path + '/childs', method: 'GET' })
					// console.log('request: ' + util.inspect(child_request))
					child_request.on('response', function child_response_handler( child_response ) {
						console.log('response')
						// console.log('response: ' + util.inspect(child_response))
						var child_str = ''
						child_response.on('data', function child_chunk_sticher( child_chunk ) {
							child_str += child_chunk
							// console.log('child_CHUNK: ' + child_str.length + '(+' + chunk.length + ')')
						})
						child_response.on('end', function child_response_emitter() {
							var child_result = JSON.parse(child_str).result
							console.log(child_result)
							child_result['sw-' + options.sw_child_def].entities.forEach( function (child) {
								// console.log(util.inspect(child))
								result.properties[options.sw_child_def].values.push({'db_value':child.id})
							})
							console.log(util.inspect(result.properties[options.sw_child_def].values))
							console.log('fswrite with childs')
							// console.log('fswrite with childs: ' + stringifier(result))
							fs.writeFileSync(filename, stringifier(result))
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
		var sw_child_def = 'screen-group'
		swEmitter.emit('loader-start', {sw_def:screen_eid})
		var filename = constants().META_DIR() + '/' + screen_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(util.inspect(err))
					swFetch(swLoadScreen, {'eid':screen_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			swSet(swElement)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadScreengroup(chval.db_value)
			})
		})
		swEmitter.emit('loader-stop', {sw_def:screen_eid})
	}
	function swLoadScreengroup(screengroup_eid) {
		var sw_def = 'screen-group'
		var sw_child_def = 'configuration'
		swEmitter.emit('loader-start', {sw_def:screengroup_eid})
		var filename = constants().META_DIR() + '/' + screengroup_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(util.inspect(err))
					swFetch(swLoadScreengroup, {'eid':screengroup_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			swSet(swElement)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadConfiguration(chval.db_value)
			})
		})
		swEmitter.emit('loader-stop', {sw_def:screengroup_eid})
	}
	function swLoadConfiguration(configuration_eid) {
		var sw_def = 'configuration'
		var sw_child_def = 'schedule'
		swEmitter.emit('loader-start', {sw_def:configuration_eid})
		var filename = constants().META_DIR() + '/' + configuration_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(util.inspect(err))
					swFetch(swLoadConfiguration, {'eid':configuration_eid, 'sw_def':sw_def, 'sw_child_def':sw_child_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			// console.log(util.inspect({'element':swElement.properties[sw_child_def].values}))
			swSet(swElement)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadSchedule(chval.db_value)
			})
		})
		swEmitter.emit('loader-stop', {sw_def:configuration_eid})
	}
	function swLoadSchedule(schedule_eid) {
		var sw_def = 'schedule'
		var sw_child_def = 'layout'
		swEmitter.emit('loader-start', {sw_def:schedule_eid})
		var filename = constants().META_DIR() + '/' + schedule_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(util.inspect(err))
					swFetch(swLoadSchedule, {'eid':schedule_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			swSet(swElement)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadLayout(chval.db_value)
			})
		})
		swEmitter.emit('loader-stop', {sw_def:schedule_eid})
	}
	function swLoadLayout(layout_eid) {
		var sw_def = 'layout'
		var sw_child_def = 'layout-playlist'
		swEmitter.emit('loader-start', {sw_def:layout_eid})
		var filename = constants().META_DIR() + '/' + layout_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(util.inspect(err))
					swFetch(swLoadLayout, {'eid':layout_eid, 'sw_def':sw_def, 'sw_child_def':sw_child_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			// console.log(util.inspect({'element':swElement.properties[sw_child_def]}))
			swSet(swElement)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadLayoutPlaylist(chval.db_value)
			})
		})
		swEmitter.emit('loader-stop', {sw_def:layout_eid})
	}
	function swLoadLayoutPlaylist(layout_playlist_eid) {
		var sw_def = 'layout-playlist'
		var sw_child_def = 'playlist'
		swEmitter.emit('loader-start', {sw_def:layout_playlist_eid})
		var filename = constants().META_DIR() + '/' + layout_playlist_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(util.inspect(err))
					swFetch(swLoadLayoutPlaylist, {'eid':layout_playlist_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			swSet(swElement)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadPlaylist(chval.db_value)
			})
		})
		swEmitter.emit('loader-stop', {sw_def:layout_playlist_eid})
	}
	function swLoadPlaylist(playlist_eid) {
		var sw_def = 'playlist'
		var sw_child_def = 'playlist-media'
		swEmitter.emit('loader-start', {sw_def:playlist_eid})
		var filename = constants().META_DIR() + '/' + playlist_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(util.inspect(err))
					swFetch(swLoadPlaylist, {'eid':playlist_eid, 'sw_def':sw_def, 'sw_child_def':sw_child_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			// console.log(util.inspect({'element':swElement.properties[sw_child_def]}))
			swSet(swElement)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadPlaylistMedia(chval.db_value)
			})
		})
		swEmitter.emit('loader-stop', {sw_def:playlist_eid})
	}
	function swLoadPlaylistMedia(playlist_media_eid) {
		var sw_def = 'playlist-media'
		var sw_child_def = 'media'
		swEmitter.emit('loader-start', {sw_def:playlist_media_eid})
		var filename = constants().META_DIR() + '/' + playlist_media_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(util.inspect(err))
					swFetch(swLoadPlaylistMedia, {'eid':playlist_media_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			swSet(swElement)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadMedia(chval.db_value)
			})
		})
		swEmitter.emit('loader-stop', {sw_def:playlist_media_eid})
	}
	function swLoadMedia(media_eid) {
		var sw_def = 'media'
		swEmitter.emit('loader-start', {sw_def:media_eid})
		var filename = constants().META_DIR() + '/' + media_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(util.inspect(err))
					swFetch(swLoadMedia, {'eid':media_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			swSet(swElement)
		})
		swEmitter.emit('loader-stop', {sw_def:media_eid})
	}

	function swExists(eid) {
		return true
	}
	function swGet(eid) {
		swElements.forEach(function(swElement) {
			if (swElement.id === eid) {
				return swElement
			}
		})
	}
	function swSet(swElement) {
		// console.log(util.inspect({'element':swElement}))
		swElements.push({'id':swElement.id, 'element':swElement})
	}
}

var l = new swLoader()



// gui.App.quit()

// function EntityFetcher () {
// 	var fetcher = this
// 	fetcher.process_count = Number(0)
// 	fetcher.process_id = Number(0)

// 	this.fetch = function(entity_id, relatives, controller) {
// 		// console.log(util.inspect({'eid':entity_id, 'relatives':relatives, 'controller':controller}))
// 		var process_id = ++fetcher.process_id
// 		// var entity_id = entity_id
// 		fetcher.emit('start',
// 				 {'process_count': ('    + ' + (++fetcher.process_count)).slice(-numlenf),
// 				  'process_id': ('   +E ' + process_id).slice(-numlenf),
// 				  'entity': entity_id})
// 		var path = '/api2/entity-' + entity_id
// 		if (typeof controller !== 'undefined') {
// 			path = path + '/' + controller
// 		}

// 		var options = {
// 			hostname: 'piletilevi.entu.ee',
// 		 	port: 443,
// 			path: path,
// 			method: 'GET'
// 		}
// 		var request = https.request(options)
// 		request.on('response', function response_handler( response ) {
// 			var str = ''
// 			response.on('data', function chunk_sticher( chunk ) {
// 				str += chunk
// 				// console.log('CHUNK: ' + str.length + '(+' + chunk.length + ')')
// 			})
// 			response.on('end', function response_emitter() {
// 				var data = JSON.parse(str)
// 				if (typeof controller === 'undefined') {
// 					// var entity_id = data.result.id
// 					var definition = data.result.definition_keyname
// 					// console.log(util.inspect({'entity_id':entity_id}))
// 					sw_elements.register({'entity_id':entity_id, 'definition':definition, 'relatives':relatives}, data.result)
// 					switch(definition) {
// 						case 'sw-screen':
// 							fetcher.fetch(data.result.properties['screen-group'].values[0].db_value, {'parent':entity_id})
// 						break;
// 						case 'sw-screen-group':
// 							fetcher.fetch(data.result.properties['configuration'].values[0].db_value, {'parent':entity_id})
// 						break;
// 						case 'sw-configuration':
// 							fetcher.fetch(data.result.id, {'parent':entity_id}, 'childs')
// 						break;
// 						case 'sw-schedule':
// 							fetcher.fetch(data.result.properties['layout'].values[0].db_value, {'parent':entity_id})
// 						break;
// 						case 'sw-layout':
// 							fetcher.fetch(data.result.id, {'parent':entity_id}, 'childs')
// 						break;
// 						case 'sw-layout-playlist':
// 							fetcher.fetch(data.result.properties['playlist'].values[0].db_value, {'parent':entity_id})
// 						break;
// 						case 'sw-playlist':
// 							fetcher.fetch(data.result.id, {'parent':entity_id}, 'childs')
// 						break;
// 						case 'sw-playlist-media':
// 							fetcher.fetch(data.result.properties['media'].values[0].db_value, {'parent':entity_id})
// 						break;
// 						case 'sw-media':
// 							var media_type = data.result.properties.type.values[0].value
// 							if (['Video','Image','Flash','Audio'].indexOf(media_type) >= 0) {
// 								f_fetcher.fetch(entity_id, data.result.properties['file'].values[0].db_value)
// 						    	} else {
// 						    		null // Not going to fetch URL's
// 						    	}
// 						break;
// 					}

// 					// save the meta file for debugging purposes
// 					fs.writeFile(META_DIR + '/' + entity_id + '.' + definition + '.json'
// 						, stringifier(data))
// 				} else if (controller === 'childs') {
// 					for (var chdef in data.result) {
// 						// console.log(chdef + ' has ' + util.inspect(data.count) + ' childs.')
// 						for (;data.result[chdef].entities.length > 0;) {
// 							var child = data.result[chdef].entities.pop()
// 							// console.log(util.inspect({'child.id':child.id}))
// 							fetcher.fetch(child.id, {'parent':entity_id})
// 						}
// 					}
// 				}
// 				fetcher.emit('end',
// 						 {'process_count': ('   - ' + (--fetcher.process_count)).slice(-numlenf),
// 						  'process_id': ('   -E ' + process_id).slice(-numlenf)})
// 			})
// 		})
// 		request.end()
// 	}
// }
// EntityFetcher.prototype.__proto__ = events.EventEmitter.prototype

// function FileFetcher () {
// 	var fetcher = this
// 	fetcher.process_count = Number(0)
// 	fetcher.bytes_to_go = Number(0)
// 	fetcher.bytes_downloaded = Number(0)
// 	fetcher.process_id = Number(0)
// 	var fetching = []

// 	this.fetch = function(entity_id, file_id) {
// 		var filename = entity_id
// 		if (fetching.indexOf(entity_id) >= 0) {
// 			console.log('File ' + MEDIA_DIR + '/' + entity_id + ' allready fetching. Skipping.')
// 			return
// 		}
// 		if (fs.existsSync(MEDIA_DIR + '/' + entity_id)) {
// 			// console.log('File ' + MEDIA_DIR + '/' + entity_id + ' allready fetched. Skipping.')
// 			return
// 		}
// 		fetching.push(entity_id)
// 		console.log('File ' + MEDIA_DIR + '/' + entity_id + ' missing. Fetch!')
// 		var process_id = ++fetcher.process_id
// 		fetcher.emit('start',
// 				 {'process_count': ('   + ' + (++fetcher.process_count)).slice(-numlenf),
// 				  'process_id': ('   +F ' + process_id).slice(-numlenf)})
// 		var options = {
// 			hostname: 'piletilevi.entu.ee',
// 		 	port: 443,
// 			path: '/api2/file-' + file_id,
// 			method: 'GET'
// 		}
// 		var request = https.request(options)
// 		request.on('response', function response_handler( response ) {
// 			var filesize = response.headers['content-length']
// 			if (typeof response.headers['content-disposition'] === 'undefined') {
// 				var headers = JSON.stringify(response.headers);
// 				console.log('Missing content-disposition in HEADERS: ' + headers);
// 				fetcher.emit('end',
// 						 {'process_count': ('   - ' + (--fetcher.process_count)).slice(-numlenf),
// 						  'process_id': ('   -F ' + process_id).slice(-numlenf)})
// 				fetcher.fetch(entity_id, file_id)
// 				request.end()
// 				return
// 			}

// 			// var filename = entity_id + '.' + response.headers['content-disposition'].split('=')[1].split('"')[1]
// 			if (fs.existsSync(MEDIA_DIR + '/' + filename)) {
// 				// console.log('File ' + MEDIA_DIR + '/' + filename + ' allready fetched. Skipping.')
// 				fetcher.emit('end',
// 						 {'process_count': ('   - ' + (--fetcher.process_count)).slice(-numlenf),
// 						  'process_id': ('   -F ' + process_id).slice(-numlenf)})
// 				request.end()
// 				return
// 			}

// 			fetcher.bytes_to_go += Number(filesize)
// 			console.log('Start fetching ' + entity_id + '. Bytes to go: ' + fetcher.bytes_to_go)
// 			// console.log('STATUS: ' + response.statusCode);

// 			var file = fs.createWriteStream(MEDIA_DIR + '/' + filename + '.download');
// 			response.on('data', function(chunk){
// 				fetcher.bytes_downloaded += chunk.length
// 				file.write(chunk)
// 			})
// 			response.on('end', function(){
// 				console.log('File ' + filename + ' fetched.')
// 				console.log('TOTAL:' + fetcher.bytes_downloaded + '/' + fetcher.bytes_to_go
// 					+ ' LEFT:' + (fetcher.bytes_to_go - fetcher.bytes_downloaded))
// 				file.end()
// 				fs.rename(MEDIA_DIR + '/' + filename + '.download', MEDIA_DIR + '/' + filename)
// 				fetcher.emit('end',
// 						 {'process_count': ('   - ' + (--fetcher.process_count)).slice(-numlenf),
// 						  'process_id': ('   -F ' + process_id).slice(-numlenf)})
// 			})
// 		})
// 		request.end()
// 	}
// }
// FileFetcher.prototype.__proto__ = events.EventEmitter.prototype

// var e_fetcher = new EntityFetcher()
// var f_fetcher = new FileFetcher()
// var sw_elements = new sw_ele.SwElements()
// var sw_player = new sw_play.SwPlayer(SCREEN_ID)

// var sw_emitter = new events.EventEmitter()
// var total_fetchers = 0

// e_fetcher.on('start', function (data) {
// 	++total_fetchers
// 	// console.log('Fetchers engaged: ' + ('  +E ' + (total_fetchers)).slice(-numlenf) + ' ' + util.inspect(data))
// })
// e_fetcher.on('end', function (data) {
// 	--total_fetchers
// 	// console.log('Fetchers engaged: ' + ('  -E ' + (total_fetchers)).slice(-numlenf) + ' ' + util.inspect(data))
// 	// overwrite full meta file for debugging purposes
// 	fs.writeFile(META_DIR + '/full_meta.json', stringifier(sw_elements))
// 	if (total_fetchers === 0) sw_emitter.emit('silence')
// })
// f_fetcher.on('start', function (data) {
// 	++total_fetchers
// 	// console.log('Fetchers engaged: ' + ('  +F ' + (total_fetchers)).slice(-numlenf) + ' ' + util.inspect(data))
// })
// f_fetcher.on('end', function (data) {
// 	--total_fetchers
// 	// console.log('Fetchers engaged: ' + ('  -F ' + (total_fetchers)).slice(-numlenf) + ' ' + util.inspect(data))
// 	if (total_fetchers === 0) sw_emitter.emit('silence')
// })


// /*
//  * Start the action
//  */
// // document.write('foo')


// console.log('Fetching meta and media for screen ' + SCREEN_ID)


// e_fetcher.fetch(SCREEN_ID) // Start recursive fetching of screen's metadata and media

// sw_emitter.on('silence', function() { // 'silence' event happens whenever last fetcher finishes its work
// 	console.log('Fetching meta and media for screen ' + SCREEN_ID + ' finished')
// 	console.log('Restarting player')
// 	sw_player.restart(sw_elements.by_eid[SCREEN_ID])
// 	fs.writeFile(META_DIR + '/full_meta.json', stringifier(sw_elements.by_eid[SCREEN_ID]))
// 	fs.writeFile(META_DIR + '/SwPlayer.json', stringifier(sw_player.sw_screen))
// })





var stringifier = function(o) {
	var cache = [];
	return JSON.stringify(o, function(key, value) {
		// console.log('Key: ' + key + ', Value ' + (typeof value) )
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

// process.on('exit', function(code) {
//   console.log('About to exit with code:', code)
// })
// // var os = require('os')
// // document.write('OUR computer is: ', os.platform())
// // gui.App.quit()

// // process.on('uncaughtException', function ( err ) {
// //     console.error('An uncaughtException was found, the program will end.')
// //     process.exit(1)
// // })

