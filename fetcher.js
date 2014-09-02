// var fs      = require('fs')
// var assert  = require('assert')
// var util    = require("util")
// var https   = require('https')
// var events  = require('events')

// var META_DIR   = 'sw-meta'
// var MEDIA_DIR  = 'sw-media'
// var numlenf	   = 6

// function SwFetcher(sw_elements) {
//     events.EventEmitter.call(this);
// 	this.sw_elements          = sw_elements
// 	this.process_count        = 0
// 	this.process_id_increment = 0
// 	this.bytes_to_go          = 0
// 	this.bytes_downloaded     = 0

// 	fs.lstat(META_DIR, function(err, stats) {
// 		if (err) {
// 			console.log('Creating folder for ' + META_DIR + '.')
// 			fs.mkdir(META_DIR)
// 		}
// 		else if (!stats.isDirectory()) {
// 			console.log('Renaming existing file "' + META_DIR + '" to "' + META_DIR + '.bak.')
// 			fs.renameSync(META_DIR, META_DIR + '.bak')
// 			console.log('Creating folder for ' + META_DIR + '.')
// 			fs.mkdir(META_DIR)
// 	    }
// 	});
// 	fs.lstat(MEDIA_DIR, function(err, stats) {
// 		if (err) {
// 			console.log('Creating folder for ' + MEDIA_DIR + '.')
// 			fs.mkdir(MEDIA_DIR)
// 		}
// 		else if (!stats.isDirectory()) {
// 			console.log('Renaming existing file "' + MEDIA_DIR + '" to "' + MEDIA_DIR + '.bak.')
// 			fs.renameSync(MEDIA_DIR, MEDIA_DIR + '.bak')
// 			console.log('Creating folder for ' + MEDIA_DIR + '.')
// 			fs.mkdir(MEDIA_DIR)
// 	    }
// 	});
// 	this.emit('silence')

// 	this.FetchEntity = function(sw_fetcher, entity_id, relatives, controller) {

// 		console.log({'eid':entity_id, 'relatives':relatives, 'controller':controller})
// 		var process_id = 'entity_fetcher_' + (++this.process_id_increment) // make a private copy from more global variable
// 		console.log({'count':this.process_count})
// 		this.process_count ++
// 		console.log({'count':this.process_count})
// 		sw_fetcher.emit('start', {'process_count': this.process_count, 'process_id': process_id, 'entity': entity_id})

// 		var sw_elements  = sw_fetcher.sw_elements
// 		var fetch_entity = sw_fetcher.FetchEntity
// 		var fetch_file   = sw_fetcher.FetchFile

// 		var path = '/api2/entity-' + entity_id
// 		if (typeof controller !== 'undefined')
// 			path = path + '/' + controller

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
// 					sw_elements.register({'entity_id':entity_id, 'definition':definition, 'relatives':relatives}, data.result)
// 					console.log(util.inspect(data.result.properties['screen-group'].values[0]))
// 					switch(definition) {
// 						case 'sw-screen':
// 							fetch_entity(data.result.properties['screen-group'].values[0].db_value, {'parent':entity_id})
// 						break;
// 						case 'sw-screen-group':
// 							fetch_entity(data.result.properties['configuration'].values[0].db_value, {'parent':entity_id})
// 						break;
// 						case 'sw-configuration':
// 							fetch_entity(data.result.id, {'parent':entity_id}, 'childs')
// 						break;
// 						case 'sw-schedule':
// 							fetch_entity(data.result.properties['layout'].values[0].db_value, {'parent':entity_id})
// 						break;
// 						case 'sw-layout':
// 							fetch_entity(data.result.id, {'parent':entity_id}, 'childs')
// 						break;
// 						case 'sw-layout-playlist':
// 							fetch_entity(data.result.properties['playlist'].values[0].db_value, {'parent':entity_id})
// 						break;
// 						case 'sw-playlist':
// 							fetch_entity(data.result.id, {'parent':entity_id}, 'childs')
// 						break;
// 						case 'sw-playlist-media':
// 							fetch_entity(data.result.properties['media'].values[0].db_value, {'parent':entity_id})
// 						break;
// 						case 'sw-media':
// 							var media_type = data.result.properties.type.values[0].value
// 							if (['Video','Image','Flash','Audio'].indexOf(media_type) >= 0) {
// 								fetch_file(data.result.properties['file'].values[0].db_value)
// 						    	} else {
// 						    		null // Not going to fetch URL's
// 						    	}
// 						break;
// 					}

// 					// save the meta file for debugging purposes
// 					fs.writeFile(META_DIR + '/' + entity_id + '.' + definition + '.json', stringifier(data))
// 				} else if (controller === 'childs') {
// 					for (var chdef in data.result) {
// 						// console.log(chdef + ' has ' + util.inspect(data.count) + ' childs.')
// 						for (;data.result[chdef].entities.length > 0;) {
// 							var child = data.result[chdef].entities.pop()
// 							this.fetch(child.id, {'parent':entity_id})
// 						}
// 					}
// 				}
// 				this.process_count--
// 				this.emit('end', {'process_count': this.process_count, 'process_id': process_id})
// 			})
// 		})
// 		request.end()
// 	}


// 	this.FetchFile = function(file_id) {
// 		var process_id = 'file_fetcher_' + (++this.process_id_increment) // make a private copy from more global variable
// 		this.process_count ++
// 		this.emit('start', {'process_count': this.process_count, 'process_id': process_id, 'file': file_id})

// 		var options = {
// 			hostname: 'piletilevi.entu.ee',
// 		 	port: 443,
// 			path: '/api2/file-' + file_id,
// 			method: 'GET'
// 		}
// 		var request = https.request(options)
// 		request.on('response', function response_handler( response ) {
// 			var filesize = response.headers['content-length']
// 			var filename = file_id + '.' + response.headers['content-disposition'].split('=')[1].split('"')[1]
// 			if (fs.existsSync(MEDIA_DIR + '/' + filename)) {
// 				// console.log('File ' + filename + ' allready fetched. Skipping.')
// 				this.process_count --
// 				this.emit('end', {'process_count': this.process_count, 'process_id': process_id})
// 				request.end()
// 				return
// 			}

// 			this.bytes_to_go += Number(filesize)
// 			console.log('Start fetching ' + file_id + '. Bytes to go: ' + this.bytes_to_go)
// 			console.log('STATUS: ' + response.statusCode);
// 			var headers = JSON.stringify(response.headers);
// 			console.log('HEADERS: ' + headers);

// 			var file_stream = fs.createWriteStream(MEDIA_DIR + '/' + filename + '.download');
// 			response.on('data', function(chunk){
// 				this.bytes_downloaded += chunk.length
// 				file_stream.write(chunk)
// 			})
// 			response.on('end', function(){
// 				console.log('File ' + filename + ' fetched.')
// 				console.log('TOTAL:' + this.bytes_downloaded + '/' + this.bytes_to_go
// 					+ ' LEFT:' + (this.bytes_to_go - this.bytes_downloaded))
// 				file_stream.end()
// 				fs.rename(MEDIA_DIR + '/' + filename + '.download', MEDIA_DIR + '/' + filename)
// 				this.emit('end', {'process_count': --this.process_count, 'process_id': process_id})
// 			})
// 		})
// 		request.end()
// 	}

// }
// util.inherits(SwFetcher, events.EventEmitter);
// // SwFetcher.prototype.__proto__ = events.EventEmitter.prototype





// var stringifier = function(o) {
// 	var cache = [];
// 	return JSON.stringify(o, function(key, value) {
// 		// console.log('Key: ' + key + ', Value ' + (typeof value) )
// 	    if (typeof value === 'object' && value !== null) {
// 	        if (cache.indexOf(value) !== -1) {
// 	            // Circular reference found, replace key
// 	            return 'Circular reference to: ' + key;
// 	        }
// 	        // Store value in our collection
// 	        cache.push(value);
// 	    }
// 	    return value;
// 	}, '\t')
// }

// exports.SwFetcher = SwFetcher
