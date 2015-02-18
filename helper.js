// 1. core modules
var path    = require('path')
var fs      = require('fs')


// 3. Own modules
var stringifier = require('./stringifier.js')
var c           = require('./c.js')

var document = window.document

var log_streams_are_closed = false
var message_q = []
var swLog = window.swLog = function swLog(message, scope) {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    var c_stream_path = path.resolve(c.__LOG_DIR, './Console ' + datestring + '.log')
    var s_stream_path = path.resolve(c.__LOG_DIR, './System ' + datestring + '.log')
    var consoleStream = fs.createWriteStream(c_stream_path, {flags:'a'})
    var sysLogStream = fs.createWriteStream(s_stream_path, {flags:'a'})
    console.log(message)
    if (log_streams_are_closed) {
        console.log('Log files are closed already.')
        return { end: function() {return false}}
    }
    if (scope === undefined)
        scope = 'INFO'
    now = new Date()
    message_q.push(scope + ' ' + message)
    if (document.body !== null) {
        var console_DOM = document.getElementById('console')
        if (console_DOM === null) {
            console_DOM = document.createElement('pre')
            console_DOM.id = 'console'
            document.body.appendChild(console_DOM)
        }
        console_DOM.textContent = message_q.join('\n') + '\n' + console_DOM.textContent
        message_q = []
    }
    if (scope === 'SYSTEM')
        sysLogStream.write(now.toString().slice(0,24) + ': ' + message + '\n')
    else
        consoleStream.write(now.toString().slice(0,24) + ' ' + scope + ': ' + message + '\n')

    return {
        end: function() {
            log_streams_are_closed = true
            sysLogStream.end()
            consoleStream.end()
            return {'c_stream_path': c_stream_path, 's_stream_path': s_stream_path}
        }
    }
}
module.exports.swLog = swLog


var progress = window.progress = function progress(message) {
    if (document.body !== null) {
        var progress_DOM = document.getElementById('progress')
        if (progress_DOM === null) {
            progress_DOM = document.createElement('pre')
            progress_DOM.id = 'progress'
            document.body.appendChild(progress_DOM)
        }
        console.log(c.__VERSION + '\n' + message)
        progress_DOM.textContent = c.__VERSION + '\n' + message
        document.getElementById('progress').style.display = 'block'
    }
}
module.exports.progress = progress

var loading_process_count = 0
var total_download_size = 0
var bytes_downloaded = 0
var decrementProcessCount = function decrementProcessCount() {
    -- loading_process_count
    progress(loading_process_count + '| ' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded) )
}
var incrementProcessCount = function decrementProcessCount() {
    ++ loading_process_count
    progress(loading_process_count + '| ' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded) )
}
module.exports.decrementProcessCount = decrementProcessCount
module.exports.incrementProcessCount = incrementProcessCount
module.exports.loading_process_count = loading_process_count
module.exports.total_download_size = total_download_size
module.exports.bytes_downloaded = bytes_downloaded


var bytesToSize = function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes == 0) return '0'
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    var decimals = Math.max(0, i-1)
    return (bytes / Math.pow(1024, i)).toFixed(decimals) + ' ' + sizes[i]
}
module.exports.bytesToSize = bytesToSize


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
module.exports.msToTime = msToTime

