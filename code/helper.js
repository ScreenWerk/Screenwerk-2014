var fs              = require('fs')
var path            = require('path')
var c               = require('../code/c.js')
var swmeta          = require('../code/swmeta.js')
var gui             = global.window.nwDispatcher.requireNwGui()




var SlackBot = require('slackbots')
var slackbot_settings = {
    token: 'xoxb-12801543831-Bx3UtMRBeDoTMj3eX8d9HsIk',
    // name: 'noise'
}
var slackbot = new SlackBot(slackbot_settings)




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
        amount = ms / 1000 / 60
    } else if (ms < 1000 * 60 * 60 * 24) {
        decimals = 1
        unit = 'h'
        amount = ms / 1000 / 60 / 60
    } else if (ms < 1000 * 60 * 60 * 24 * 7) {
        decimals = 2
        unit = 'd'
        amount = ms / 1000 / 60 / 60 / 24
    } else {
        decimals = 2
        unit = 'w'
        amount = ms / 1000 / 60 / 60 / 24 / 7
    }
    return amount.toFixed(decimals) + ' ' + unit
}

var dates = {
    convert:function(d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp)
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        )
    },
    compare:function(a,b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        )
    },
    inRange:function(d,start,end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
       return (
            isFinite(d=this.convert(d).valueOf()) &&
            isFinite(start=this.convert(start).valueOf()) &&
            isFinite(end=this.convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        )
    }
}

var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '').split(' ')[0]
var log_path = c.__DEBUG_MODE ? path.join(path.dirname(), 'debug.log') : path.resolve(c.__LOG_DIR, datestring + '.log')
var logStream = fs.createWriteStream(log_path, {flags:'w'})
datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
logStream.write('\n\nStart logging at ' + datestring + '\n------------------------------------\n')
// TODO: Make it rotating
var log = function log() {
    if (!logStream) {
    }
    datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    var arr = [], p, i = 0
    for (p in arguments) arr[i++] = arguments[p]
    var stack = new Error().stack.split(' at ')[2].trim().replace(/\/.*\//,'')
    var line = stack[1] + ':' + stack[2] + ':' + stack[3]
    var output = datestring + ' @' + stack + ': ' + arr.join(', ') + '\n'
    // slackbot.postMessageToChannel('test', output, {as_user: true})
    logStream.write(output)
}



slackbot.on('start', function() {
    // slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Joining to chatter.', {as_user: true})
    // slackbot.postMessageToUser('michelek', 'hello bro!')
    // slackbot.postMessageToGroup('some-private-group', 'hello group chat!')
})

slackbot.chatter = function(message, callback) {
    slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: ' + message, {as_user: true}, callback)
}

slackbot.on('message', function(message) {
    if (message.type !== 'message' || !Boolean(message.text)) {
        // console.log('Message type ' + message.type + '".')
        return
    }
    datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')

    switch (message.text.toLowerCase()) {
        case c.__SCREEN_ID:
            slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Yes, ma\'am!', {as_user: true})
            break
        case 'check in':
            slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Checking in.', {as_user: true})
            break
        case 'version':
            slackbot.postMessageToChannel('test', datestring + ':' + c.__SCREEN_ID + ' *' + c.__VERSION + '*: Checking in.', {as_user: true})
            break
        default:
            params = message.text.toLowerCase().split(' ')
            if (def = swmeta.get(['by_eid', params[0], 'definition'], false)) {
                ref_id = params.shift()
                var command = params.join(' ')
                switch (command) {
                    case '':
                        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: I have ' + def + ' ' + ref_id + '.', {as_user: true})
                        break
                    case 'screenshot':
                    case 'ss':
                        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Shooting right away, ma\'am!', {as_user: true})
                        gui.window.capturePage(function() {
                            slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Here\'s my screen.', {as_user: true})
                        }, { format : "png", datatype : "raw" })
                        break
                    case 'shutup':
                    case 'shut down':
                        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: I have ' + def + ' ' + ref_id + ', but not going to shut down just like that!', {as_user: true})
                        break
                    case 'ver':
                    case 'version':
                        slackbot.postMessageToChannel('test', datestring + ':' + c.__SCREEN_ID + ' *' + c.__VERSION + '*: I have ' + def + ' ' + ref_id + '.', {as_user: true})
                        break
                    case 'log':
                        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Here\'s my log.', {as_user: true})
                        break
                    case 'restart':
                        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Restarting right now.', {as_user: true})
                        // //Restart node-webkit app
                        // var child_process = require("child_process");
                        // //Start new app
                        // var child = child_process.spawn(process.execPath, [], {detached: true});
                        // //Don't wait for it
                        // child.unref();
                        // //Quit current
                        // // gui.window.hide(); // hide window to prevent black display
                        // gui.app.quit();  // quit node-webkit app
                        break
                }
            } else if (params[0] === 'version' && params[1] === c.__VERSION) {
                slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: I\'m running on ' + c.__VERSION + '.', {as_user: true})
            }
    }
})


module.exports.bytesToSize = bytesToSize
module.exports.msToTime = msToTime
module.exports.dates = dates
module.exports.log = log
module.exports.slackbot = slackbot
