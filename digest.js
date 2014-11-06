function processElements(err, callback) {
	var stacksize = swElements.length
	swElements.forEach(function(swElement) {
		console.log('Processing ' + swElement.definition.keyname + ':' + swElement.id + ' - ' + swElement.displayname)
		if(-- stacksize === 0) {
			callback(new Error ('Finish'), 'No more data')
		}
	})
}

