// var update_interval_ms = 10 * 60 * 1000 // set default update interval to 10 minutes

// Integrity check and element validation
console.log('Load function processElements')
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

console.log('Load function buildDom')
function buildDom(err, callback) {
	if (err) {
		console.log('buildDom err:', err)
		process.exit(0)
		return
	}

	var createDomRec = function createDomRec(eid, parent_eid) {
		var dom_element = document.createElement('div')
		var swElement = swElementsById[eid]
		// console.log(stringifier(dom_element))
		// console.log(eid)
		dom_element.id = parent_eid === undefined ? eid : parent_eid + '_' + eid
		dom_element.className = swElement.definition.keyname
		dom_element.style.display = 'none'
		// dom_element.style.border = 'dashed 1px green'
		// dom_element.style.position = 'relative'
		var unit = '%'
		dom_element.style.width = '100%'
		dom_element.style.height = '100%'
		if (swElement.properties['in-pixels'] !== undefined)
			if (swElement.properties['in-pixels'].values !== undefined)
				if (swElement.properties['in-pixels'].values[0].db_value === 1)
					unit = 'px'
		if (swElement.properties.width !== undefined)
			if (swElement.properties.width.values !== undefined) {
				dom_element.style.position = 'absolute'
				// dom_element.style.border = '2px solid red'
				dom_element.style.padding = '0px'
				dom_element.style.width = swElement.properties.width.values[0].db_value + unit
			}
		if (swElement.properties.height !== undefined)
			if (swElement.properties.height.values !== undefined) {
				dom_element.style.position = 'absolute'
				// dom_element.style.border = '2px solid red'
				dom_element.style.padding = '0px'
				dom_element.style.height = swElement.properties.height.values[0].db_value + unit
			}
		if (swElement.properties.left !== undefined)
			if (swElement.properties.left.values !== undefined) {
				dom_element.style.position = 'absolute'
				// dom_element.style.border = '2px solid red'
				dom_element.style.padding = '0px'
				dom_element.style.left = swElement.properties.left.values[0].db_value + unit
			}
		if (swElement.properties.top !== undefined)
			if (swElement.properties.top.values !== undefined) {
				dom_element.style.position = 'absolute'
				// dom_element.style.border = '2px solid red'
				dom_element.style.padding = '0px'
				dom_element.style.top = swElement.properties.top.values[0].db_value + unit
			}
		// console.log(stringifier(dom_element.style.cssText))

		dom_element.swElement = swElement
		swElement.childs.forEach(function(child_eid){
			var child_node = createDomRec(child_eid, eid)
			// console.log(stringifier(child_node))
			dom_element.appendChild(child_node)
		})
		return dom_element
	}
	console.log('Start createDomRec')
	var screen_dom_element = createDomRec(__SCREEN_ID)
	// var scrdom = document.findElementByID(__SCREEN_ID)
	// scrdom.delete()
	document.body.appendChild(screen_dom_element)
	callback(null, screen_dom_element)
	console.log('Finish createDomRec')
}