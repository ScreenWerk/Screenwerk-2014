var bytesToSize = function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes == 0) return '0'
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    var decimals = Math.max(0, i-1)
    return (bytes / Math.pow(1024, i)).toFixed(decimals) + ' ' + sizes[i]
}

var msToTime = function msToTime(ms) {
    if (ms === 0) {
        return '0'
    }
    var decimals = 0
    var unit = ''
    var amount = 0
    if (ms < 1000 * 60) {
        decimals = 1
        unit = 'sec'
        amount = ms / 1000
    } else if (ms < 1000 * 60 * 60) {
        decimals = 1
        unit = 'min'
        amount = ms / 1000
    } else if (ms < 1000 * 60 * 60 * 24) {
        decimals = 1
        unit = 'h'
        amount = ms / 1000
    } else if (ms < 1000 * 60 * 60 * 24 * 7) {
        decimals = 2
        unit = 'd'
        amount = ms / 1000
    } else {
        decimals = 2
        unit = 'w'
        amount = ms / 1000 / 60 / 60 / 24 / 7
    }
    return amount.toFixed(decimals) + ' ' + unit
}

module.exports.bytesToSize = bytesToSize
module.exports.msToTime = msToTime
