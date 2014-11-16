// var update_interval_ms = 10 * 60 * 1000 // set default update interval to 10 minutes

// Integrity check and element validation
function processElements(err, callback) {
	if (err) {
		console.log('processElements err:', err)
		process.exit(0)
		return
	}
	// console.log(swElements.length)
	console.log('====== Start processElements')
	var stacksize = swElements.length
	swElements.forEach(function(swElement) {
		// console.log('Processing ' + swElement.definition.keyname + ':' + swElement.id + ' - ' + swElement.displayname)
		switch (swElement.definition.keyname) {
			case 'sw-screen':
				// console.log(swElement.definition.keyname)
			break
			case 'sw-screen-group':
				// console.log(swElement.definition.keyname)
			break
			case 'sw-configuration':
				// console.log(swElement.definition.keyname)
			break
			case 'sw-schedule':
				// console.log(swElement.definition.keyname)
			break
			case 'sw-layout':
				// console.log(swElement.definition.keyname)
			break
			case 'sw-layout-playlist':
				// console.log(swElement.definition.keyname)
			break
			case 'sw-playlist':
				// console.log(swElement.definition.keyname)
				var loop = false
				// If any of parent LayoutPlaylist's has loop == true, then loop the playlist
				swElement.parents.forEach(function(parent_eid) {
					if (swElementsById[parent_eid].properties.loop.values !== undefined)
						if (swElementsById[parent_eid].properties.loop.values[0].db_value === 1)
							loop = true
				})
				// Sort playlist-medias by ordinal
				swElement.childs.sort(function compare(a,b) {
					return swElementsById[a].properties.ordinal.values[0].db_value - swElementsById[b].properties.ordinal.values[0].db_value
				})
				for (var i = 0; i < swElement.childs.length; i++) {
					if (i === 0) {
						if (loop) {
							swElementsById[swElement.childs[0]].prev = swElement.childs[swElement.childs.length - 1]
						}
						swElementsById[swElement.childs[i]].next = swElement.childs[i + 1]
					}
					if (i === swElement.childs.length - 1) {
						swElementsById[swElement.childs[i]].prev = swElement.childs[i - 1]
						if (loop) {
							swElementsById[swElement.childs[i]].next = swElement.childs[0]
						}
					}
					if (i > 0 && i < swElement.childs.length - 1) {
						swElementsById[swElement.childs[i]].prev = swElement.childs[i - 1]
						swElementsById[swElement.childs[i]].next = swElement.childs[i + 1]
					}
				}
			break
			case 'sw-playlist-media':
				// console.log(swElement.definition.keyname)
			break
			case 'sw-media':
				// console.log(swElement.definition.keyname)
			break
			default:
				callback('Unrecognised definition: ' + swElement.definition.keyname, swElement)
				return
		}
		// console.log('Processed ' + swElement.definition.keyname + ':' + swElement.id + ' - ' + swElement.displayname)
		var meta_path = __META_DIR + swElement.id + ' ' + swElement.definition.keyname.split('sw-')[1] + '.json'
		fs.writeFileSync(meta_path, stringifier(swElement))

		if(-- stacksize === 0) {
			console.log('====== Finish processElements')
			callback(null, 'No more data')
		}
	})
}

