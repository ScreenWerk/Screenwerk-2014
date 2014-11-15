var update_interval_ms = 10 * 60 * 1000 // set default update interval to 10 minutes

// Integrity check and element validation
function processElements(err, callback) {
	console.log('====== Start processElements')
	var stacksize = swElements.length
	swElements.forEach(function(swElement) {
		console.log('Processing ' + swElement.definition.keyname + ':' + swElement.id + ' - ' + swElement.displayname)
		switch (swElement.definition.keyname) {
			case 'sw-screen':
				console.log(swElement.definition.keyname)
			break
			case 'sw-screen-group':
				console.log(swElement.definition.keyname)
			break
			case 'sw-configuration':
				console.log(swElement.definition.keyname)
			break
			case 'sw-schedule':
				console.log(swElement.definition.keyname)
				if (swElement.properties.crontab.values === undefined) {
					callback('Schedule ' + swElement.id + ' has no crontab.', swElement)
					return
				}
				if (swElement.properties.cleanup.values === undefined) {
					swElement.properties.cleanup.values = [{'db_value':0}]
				}
				if (swElement.properties.ordinal.values === undefined) {
					swElement.properties.ordinal.values = [{'db_value':0}]
				}
			break
			case 'sw-layout':
				console.log(swElement.definition.keyname)
			break
			case 'sw-layout-playlist':
				console.log(swElement.definition.keyname)
				if (swElement.properties.zindex.values === undefined) {
					swElement.properties.zindex.values = [{'db_value':1}]
				}
			break
			case 'sw-playlist':
				console.log(swElement.definition.keyname)
			break
			case 'sw-playlist-media':
				console.log(swElement.definition.keyname)
			break
			case 'sw-media':
				console.log(swElement.definition.keyname)
			break
			default:
				callback('Unrecognised definition: ' + swElement.definition.keyname, swElement)
				return
		}
		console.log('Processed ' + swElement.definition.keyname + ':' + swElement.id + ' - ' + swElement.displayname)
		var meta_path = __META_DIR + swElement.id + ' ' + swElement.definition.keyname.split('sw-')[1] + '(2).json'
		fs.writeFileSync(meta_path, stringifier(swElement))

		if(-- stacksize === 0) {
			callback(null, 'No more data')
			console.log('====== Finish processElements')
		}
	})
}

