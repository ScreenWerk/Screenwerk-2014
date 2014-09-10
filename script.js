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

var loadersEngaged = []
var fetchersEngaged = []

swEmitter.on('loader-start', function(data) {
	if (loadersEngaged.indexOf(data.I) === -1) {
		loadersEngaged.push(data.I)
		console.log(loadersEngaged.length + ' +  Start loading ' + util.inspect(data))
	} else {
		console.log(loadersEngaged.length + ' + Resume loading ' + util.inspect(data))
	}
})
swEmitter.on('loader-stop', function(data) {
	if (loadersEngaged.indexOf(data.I) === -1)
		return
	loadersEngaged.splice(loadersEngaged.indexOf(data.I),1)
	console.log((loadersEngaged.length) + ' -   Stop loading ' + util.inspect(data))
	if (loadersEngaged.length + fetchersEngaged.length === 0)
		swEmitter.emit('init-ready')
})
swEmitter.on('fetcher-start', function(data) {
	if (fetchersEngaged.indexOf(data.I) === -1) {
		fetchersEngaged.push(data.I)
		console.log(fetchersEngaged.length + ' +  Start fetching ' + util.inspect(data))
	} else {
		throw ('Duplicate fetcher tried to launch for ' + data.I)
	}
})
swEmitter.on('fetcher-stop', function(data) {
	if (fetchersEngaged.indexOf(data.I) === -1)
		throw ('Fetcher should not exist ' + data.I)
	fetchersEngaged.splice(fetchersEngaged.indexOf(data.I),1)
	console.log((fetchersEngaged.length) + ' -   Stop fetching ' + util.inspect(data))
	if (loadersEngaged.length + fetchersEngaged.length === 0)
		swEmitter.emit('init-ready')
})

swEmitter.on('init-ready', function() {
	var filename = constants().META_DIR() + '/elements.json'
	console.log(util.inspect(l.swElements()))
	fs.writeFileSync(filename, stringifier(l.swElements()))

})
// console.log(constants().META_DIR() + '/' + constants().SCREEN_ID() + '.sw-screen.json')

var swLoader = function swLoader(screenEid) {
	var swElements = []
	swLoadScreen(constants().SCREEN_ID())

	function swFetch(callback, options) {
		if (fetchersEngaged.indexOf(options.eid) !== -1) {
			console.log('Fetcher allready started for ' + util.inspect(fetchersEngaged[fetchersEngaged.indexOf(options.eid)]))
			return
		}
		swEmitter.emit('fetcher-start', {'D':options.sw_def,'I':options.eid})
		var path = '/api2/entity-' + options.eid
		var request = https.request({
			hostname: 'piletilevi.entu.ee', port: 443, path: path, method: 'GET'})
		request.on('response', function response_handler( response ) {
			var str = ''
			response.on('data', function chunk_sticher( chunk ) {
				str += chunk
				// console.log('CHUNK: ' + str.length + '(+' + chunk.length + ')')
			})
			response.on('end', function response_emitter() {
				var result = JSON.parse(str).result
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
					// console.log('request: ' + util.inspect(child_request))
					child_request.on('response', function child_response_handler( child_response ) {
						// console.log('response: ' + util.inspect(child_response))
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
		var sw_child_def = 'screen-group'
		swEmitter.emit('loader-start', {'D':sw_def,'I':screen_eid})
		var filename = constants().META_DIR() + '/' + screen_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(filename + ' not present. Fetching from Entu.')
					swFetch(swLoadScreen, {'eid':screen_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadScreengroup(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':screen_eid})
		})
	}
	function swLoadScreengroup(screengroup_eid) {
		var sw_def = 'screen-group'
		var sw_child_def = 'configuration'
		swEmitter.emit('loader-start', {'D':sw_def,'I':screengroup_eid})
		var filename = constants().META_DIR() + '/' + screengroup_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(filename + ' not present. Fetching from Entu.')
					swFetch(swLoadScreengroup, {'eid':screengroup_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadConfiguration(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':screengroup_eid})
		})
	}
	function swLoadConfiguration(configuration_eid) {
		var sw_def = 'configuration'
		var sw_child_def = 'schedule'
		swEmitter.emit('loader-start', {'D':sw_def,'I':configuration_eid})
		var filename = constants().META_DIR() + '/' + configuration_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(filename + ' not present. Fetching from Entu.')
					swFetch(swLoadConfiguration, {'eid':configuration_eid, 'sw_def':sw_def, 'sw_child_def':sw_child_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			// console.log(util.inspect({'element':swElement.properties[sw_child_def].values}))
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadSchedule(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':configuration_eid})
		})
	}
	function swLoadSchedule(schedule_eid) {
		var sw_def = 'schedule'
		var sw_child_def = 'layout'
		swEmitter.emit('loader-start', {'D':sw_def,'I':schedule_eid})
		var filename = constants().META_DIR() + '/' + schedule_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(filename + ' not present. Fetching from Entu.')
					swFetch(swLoadSchedule, {'eid':schedule_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadLayout(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':schedule_eid})
		})
	}
	function swLoadLayout(layout_eid) {
		var sw_def = 'layout'
		var sw_child_def = 'layout-playlist'
		swEmitter.emit('loader-start', {'D':sw_def,'I':layout_eid})
		var filename = constants().META_DIR() + '/' + layout_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(filename + ' not present. Fetching from Entu.')
					swFetch(swLoadLayout, {'eid':layout_eid, 'sw_def':sw_def, 'sw_child_def':sw_child_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			// console.log(util.inspect({'element':swElement.properties[sw_child_def]}))
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadLayoutPlaylist(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':layout_eid})
		})
	}
	function swLoadLayoutPlaylist(layout_playlist_eid) {
		var sw_def = 'layout-playlist'
		var sw_child_def = 'playlist'
		swEmitter.emit('loader-start', {'D':sw_def,'I':layout_playlist_eid})
		var filename = constants().META_DIR() + '/' + layout_playlist_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(filename + ' not present. Fetching from Entu.')
					swFetch(swLoadLayoutPlaylist, {'eid':layout_playlist_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadPlaylist(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':layout_playlist_eid})
		})
	}
	function swLoadPlaylist(playlist_eid) {
		var sw_def = 'playlist'
		var sw_child_def = 'playlist-media'
		swEmitter.emit('loader-start', {'D':sw_def,'I':playlist_eid})
		var filename = constants().META_DIR() + '/' + playlist_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(filename + ' not present. Fetching from Entu.')
					swFetch(swLoadPlaylist, {'eid':playlist_eid, 'sw_def':sw_def, 'sw_child_def':sw_child_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			// console.log(util.inspect({'element':swElement.properties[sw_child_def]}))
			swElement.properties[sw_child_def].values.forEach(function(chval) {
				swLoadPlaylistMedia(chval.db_value)
			})
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':playlist_eid})
		})
	}
	function swLoadPlaylistMedia(playlist_media_eid) {
		var sw_def = 'playlist-media'
		var sw_child_def = 'media'
		swEmitter.emit('loader-start', {'D':sw_def,'I':playlist_media_eid})
		var filename = constants().META_DIR() + '/' + playlist_media_eid + '.' + sw_def + '.json'
		fs.readFile( filename, {'encoding': 'utf8'}, function(err, data) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log(filename + ' not present. Fetching from Entu.')
					swFetch(swLoadPlaylistMedia, {'eid':playlist_media_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
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
					console.log(filename + ' not present. Fetching from Entu.')
					swFetch(swLoadMedia, {'eid':media_eid, 'sw_def':sw_def})
					return
				} else throw err
			}
			swElement = JSON.parse(data)
			swSet(swElement)
			swEmitter.emit('loader-stop', {'D':sw_def,'I':media_eid})
		})
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

	return {
		swElements: function () {
			return swElements
		}
	}
}

var l = new swLoader()



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

