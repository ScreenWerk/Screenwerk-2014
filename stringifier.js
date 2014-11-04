var stringifier = function stringifier(o) {
    var cache = [];
    return JSON.stringify(o, function(key, value) {
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

module.exports = stringifier
