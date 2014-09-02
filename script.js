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

var SCREEN_ID = Number(gui.App.argv[0])
var META_DIR = 'sw-meta'
var MEDIA_DIR = 'sw-media'


var util    = require("util")
var https   = require('https')
var events  = require('events')
var fs      = require('fs')

var sw_ele  = require('./elements')
var sw_play = require('./player')
var numlenf	= 6


fs.lstat(META_DIR, function(err, stats) {
	if (err) {
		console.log('Creating folder for ' + META_DIR + '.')
		fs.mkdir(META_DIR)
	}
	else if (!stats.isDirectory()) {
		console.log('Renaming existing file "' + META_DIR + '" to "' + META_DIR + '.bak.')
		fs.renameSync(META_DIR, META_DIR + '.bak')
		console.log('Creating folder for ' + META_DIR + '.')
		fs.mkdir(META_DIR)
    }
});
fs.lstat(MEDIA_DIR, function(err, stats) {
	if (err) {
		console.log('Creating folder for ' + MEDIA_DIR + '.')
		fs.mkdir(MEDIA_DIR)
	}
	else if (!stats.isDirectory()) {
		console.log('Renaming existing file "' + MEDIA_DIR + '" to "' + MEDIA_DIR + '.bak.')
		fs.renameSync(MEDIA_DIR, MEDIA_DIR + '.bak')
		console.log('Creating folder for ' + MEDIA_DIR + '.')
		fs.mkdir(MEDIA_DIR)
    }
});

function EntityFetcher () {
	var fetcher = this
	fetcher.process_count = Number(0)
	fetcher.process_id = Number(0)

	this.fetch = function(entity_id, relatives, controller) {
		// console.log({'eid':entity_id, 'relatives':relatives, 'controller':controller})
		var process_id = ++fetcher.process_id
		// var entity_id = entity_id
		fetcher.emit('start',
				 {'process_count': ('    + ' + (++fetcher.process_count)).slice(-numlenf),
				  'process_id': ('   +E ' + process_id).slice(-numlenf),
				  'entity': entity_id})
		var path = '/api2/entity-' + entity_id
		if (typeof controller !== 'undefined') {
			path = path + '/' + controller
		}

		var options = {
			hostname: 'piletilevi.entu.ee',
		 	port: 443,
			path: path,
			method: 'GET'
		}
		var request = https.request(options)
		request.on('response', function response_handler( response ) {
			var str = ''
			response.on('data', function chunk_sticher( chunk ) {
				str += chunk
				// console.log('CHUNK: ' + str.length + '(+' + chunk.length + ')')
			})
			response.on('end', function response_emitter() {
				var data = JSON.parse(str)
				if (typeof controller === 'undefined') {
					// var entity_id = data.result.id
					var definition = data.result.definition_keyname
					sw_elements.register({'entity_id':entity_id, 'definition':definition, 'relatives':relatives}, data.result)
					switch(definition) {
						case 'sw-screen':
							fetcher.fetch(data.result.properties['screen-group'].values[0].db_value, {'parent':entity_id})
						break;
						case 'sw-screen-group':
							fetcher.fetch(data.result.properties['configuration'].values[0].db_value, {'parent':entity_id})
						break;
						case 'sw-configuration':
							fetcher.fetch(data.result.id, {'parent':entity_id}, 'childs')
						break;
						case 'sw-schedule':
							fetcher.fetch(data.result.properties['layout'].values[0].db_value, {'parent':entity_id})
						break;
						case 'sw-layout':
							fetcher.fetch(data.result.id, {'parent':entity_id}, 'childs')
						break;
						case 'sw-layout-playlist':
							fetcher.fetch(data.result.properties['playlist'].values[0].db_value, {'parent':entity_id})
						break;
						case 'sw-playlist':
							fetcher.fetch(data.result.id, {'parent':entity_id}, 'childs')
						break;
						case 'sw-playlist-media':
							fetcher.fetch(data.result.properties['media'].values[0].db_value, {'parent':entity_id})
						break;
						case 'sw-media':
							var media_type = data.result.properties.type.values[0].value
							if (['Video','Image','Flash','Audio'].indexOf(media_type) >= 0) {
								f_fetcher.fetch(data.result.properties['file'].values[0].db_value)
						    	} else {
						    		null // Not going to fetch URL's
						    	}
						break;
					}

					// save the meta file for debugging purposes
					fs.writeFile(META_DIR + '/' + entity_id + '.' + definition + '.json'
						, stringifier(data))
				} else if (controller === 'childs') {
					for (var chdef in data.result) {
						// console.log(chdef + ' has ' + util.inspect(data.count) + ' childs.')
						for (;data.result[chdef].entities.length > 0;) {
							var child = data.result[chdef].entities.pop()
							fetcher.fetch(child.id, {'parent':entity_id})
						}
					}
				}
				fetcher.emit('end',
						 {'process_count': ('   - ' + (--fetcher.process_count)).slice(-numlenf),
						  'process_id': ('   -E ' + process_id).slice(-numlenf)})
			})
		})
		request.end()
	}
}
EntityFetcher.prototype.__proto__ = events.EventEmitter.prototype

function FileFetcher () {
	var fetcher = this
	fetcher.process_count = Number(0)
	fetcher.bytes_to_go = Number(0)
	fetcher.bytes_downloaded = Number(0)
	fetcher.process_id = Number(0)

	this.fetch = function(file_id) {
		var process_id = ++fetcher.process_id
		fetcher.emit('start',
				 {'process_count': ('   + ' + (++fetcher.process_count)).slice(-numlenf),
				  'process_id': ('   +F ' + process_id).slice(-numlenf)})
		var options = {
			hostname: 'piletilevi.entu.ee',
		 	port: 443,
			path: '/api2/file-' + file_id,
			method: 'GET'
		}
		var request = https.request(options)
		request.on('response', function response_handler( response ) {
			var filesize = response.headers['content-length']
			var filename = file_id + '.' + response.headers['content-disposition'].split('=')[1].split('"')[1]
			if (fs.existsSync(MEDIA_DIR + '/' + filename)) {
				// console.log('File ' + filename + ' allready fetched. Skipping.')
				fetcher.emit('end',
						 {'process_count': ('   - ' + (--fetcher.process_count)).slice(-numlenf),
						  'process_id': ('   -F ' + process_id).slice(-numlenf)})
				request.end()
				return
			}

			fetcher.bytes_to_go += Number(filesize)
			console.log('Start fetching ' + file_id + '. Bytes to go: ' + fetcher.bytes_to_go)
			console.log('STATUS: ' + response.statusCode);
			var headers = JSON.stringify(response.headers);
			console.log('HEADERS: ' + headers);

			var file = fs.createWriteStream(MEDIA_DIR + '/' + filename + '.download');
			response.on('data', function(chunk){
				fetcher.bytes_downloaded += chunk.length
				file.write(chunk)
			})
			response.on('end', function(){
				console.log('File ' + filename + ' fetched.')
				console.log('TOTAL:' + fetcher.bytes_downloaded + '/' + fetcher.bytes_to_go
					+ ' LEFT:' + (fetcher.bytes_to_go - fetcher.bytes_downloaded))
				file.end()
				fs.rename(MEDIA_DIR + '/' + filename + '.download', MEDIA_DIR + '/' + filename)
				fetcher.emit('end',
						 {'process_count': ('   - ' + (--fetcher.process_count)).slice(-numlenf),
						  'process_id': ('   -F ' + process_id).slice(-numlenf)})
			})
		})
		request.end()
	}
}
FileFetcher.prototype.__proto__ = events.EventEmitter.prototype

var e_fetcher = new EntityFetcher()
var f_fetcher = new FileFetcher()
var sw_elements = new sw_ele.SwElements()
var sw_player = new sw_play.SwPlayer(SCREEN_ID)

var sw_emitter = new events.EventEmitter()
var total_fetchers = 0

e_fetcher.on('start', function (data) {
	++total_fetchers
	// console.log('Fetchers engaged: ' + ('  +E ' + (total_fetchers)).slice(-numlenf) + ' ' + util.inspect(data))
})
e_fetcher.on('end', function (data) {
	--total_fetchers
	// console.log('Fetchers engaged: ' + ('  -E ' + (total_fetchers)).slice(-numlenf) + ' ' + util.inspect(data))
	// overwrite full meta file for debugging purposes
	fs.writeFile(META_DIR + '/full_meta.json', stringifier(sw_elements))
	if (total_fetchers === 0) sw_emitter.emit('silence')
})
f_fetcher.on('start', function (data) {
	++total_fetchers
	// console.log('Fetchers engaged: ' + ('  +F ' + (total_fetchers)).slice(-numlenf) + ' ' + util.inspect(data))
})
f_fetcher.on('end', function (data) {
	--total_fetchers
	// console.log('Fetchers engaged: ' + ('  -F ' + (total_fetchers)).slice(-numlenf) + ' ' + util.inspect(data))
	if (total_fetchers === 0) sw_emitter.emit('silence')
})


/*
 * Start the action
 */
document.write('foo')

console.log('Fetching meta and media for screen ' + SCREEN_ID)
e_fetcher.fetch(SCREEN_ID) // Start recursive fetching of screen's metadata and media

sw_emitter.on('silence', function() { // 'silence' event happens whenever last fetcher finishes its work
	console.log('Fetching meta and media for screen ' + SCREEN_ID + ' finished')
	console.log('Restarting player')
	sw_player.restart(sw_elements)
})





var stringifier = function(o) {
	var cache = [];
	return JSON.stringify(o, function(key, value) {
		// console.log('Key: ' + key + ', Value ' + (typeof value) )
	    if (typeof value === 'object' && value !== null) {
	        if (cache.indexOf(value) !== -1) {
	            // Circular reference found, replace key
	            return 'Circular reference to: ' + key;
	        }
	        // Store value in our collection
	        cache.push(value);
	    }
	    return value;
	}, '\t')
}

process.on('exit', function(code) {
  console.log('About to exit with code:', code);
});
// var os = require('os')
// document.write('OUR computer is: ', os.platform())
// gui.App.quit()

process.on('uncaughtException', function ( err ) {
    console.error('An uncaughtException was found, the program will end.')
    process.exit(1)
})