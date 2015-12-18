// var os          = require('os')
var SlackBot    = require('slackbots')

var c = require('./c.js')

var slackbot_settings = {
    token: 'xoxb-12801543831-Bx3UtMRBeDoTMj3eX8d9HsIk',
    // name: 'noise'
}
var slackbot = new SlackBot(slackbot_settings)

var isWin = /^win/.test(process.platform);


function restart() {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: :sunrise: down. then up again', {as_user: true})
    console.log('=====================================')
    console.log('== RELAUNCHING! =====================')
    console.log('=====================================')

    var child_process = require('child_process')

    if (process.platform === 'darwin') {
        child_process.exec('nwjs .', function (err, stdout, stderr) {
            if (err !== null) { throw err }
            console.log('stdout: ' + stdout)
            console.log('stderr: ' + stderr)
        })
        setTimeout(function () {
            process.exit(0)
        }, 1500)
    } else {
        var child = child_process.spawn(process.execPath, ['./', c.__SCREEN_ID], {detached: true})
        child.unref()

        setTimeout(function () {
            process.exit(0)
        }, 1500)
    }
}


function upgrade() {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: :arrow_double_up: to latest release', {as_user: true})
    console.log('== UPGRADING! =======================')

    var child_process = require('child_process')

    if (!isWin) {
        child_process.exec('. launcher.sh', function (err, stdout, stderr) {
            if (err !== null) { throw err }
            console.log('stdout: ' + stdout)
            console.log('stderr: ' + stderr)
        })
        setTimeout(function () { process.exit(0) }, 1500)
    } else {
        console.log('== win32: running launcher.bat')
        child_process.execFile('launcher.bat')
        setTimeout(function () {
            process.exit(0)
        }, 100)
        // slackbot.on('message', function(message) {
        //     if ((message.text.indexOf(':*' + c.__SCREEN_ID + '*: :up:') > -1)) {
        //         console.log('New instance started. Shutting down.')
        //         process.exit(0)
        //     }
        // })
    }
}

function latest() {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: :warning: installing latest build', {as_user: true})
    console.log('== UPGRADING! =======================')

    var child_process = require('child_process')

    if (!isWin) {
        child_process.exec('. latest.sh', function (err, stdout, stderr) {
            if (err !== null) { throw err }
            console.log('stdout: ' + stdout)
            console.log('stderr: ' + stderr)
        })
        setTimeout(function () {
            process.exit(0)
        }, 1500)
    } else {
        console.log('== win32: running latest.bat')
        child_process.execFile('latest.bat')
        setTimeout(function () {
            process.exit(0)
        }, 1500)
        // slackbot.on('message', function(message) {
        //     if ((message.text.indexOf(':*' + c.__SCREEN_ID + '*: :up:') > -1)) {
        //         console.log('New instance started. Shutting down.')
        //         process.exit(0)
        //     }
        // })
    }
}


slackbot.on('start', function() {
    // slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Joining to chatter.', {as_user: true})
    // slackbot.postMessageToUser('michelek', 'hello bro!')
    // slackbot.postMessageToGroup('some-private-group', 'hello group chat!')
})

slackbot.chatter = function(message) {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: ' + message, {as_user: true})
}

slackbot.error = function(message) {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: ' + message, {as_user: true})
}

slackbot.on('message', function(message) {
    if (message.type !== 'message' || !Boolean(message.text)) {
        // console.log('Message type ' + message.type + '".')
        return
    }
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')

    switch (message.text.toLowerCase()) {
        case c.__SCREEN_ID:
            slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '|' + c.__SCREEN_NAME + '*', {as_user: true})
            break
        case 'hello':
        case 'hi':
            slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Checking in.', {as_user: true})
            break
        case 'version':
        case 'ver':
            slackbot.postMessageToChannel('test', datestring + ':' + c.__SCREEN_ID + ' *' + c.__VERSION + '* _' + process.platform + '_ ' + c.__SCREEN_NAME + '', {as_user: true})
            break
        default:
            var params = message.text.toLowerCase().split(' ')
            var swElementsById = require('./loader.js').swElementsById
            if (Object.keys(swElementsById).indexOf(params[0]) !== -1) {
                var def = swElementsById[params[0]].definition.keyname
                var ref_id = params.shift()
                var command = params.join(' ')
                switch (command) {
                    case '':
                        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: I have ' + def + ' ' + ref_id + '.', {as_user: true})
                        break
                    case 'screenshot':
                    case 'ss':
                        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Shooting right away, ma\'am!', {as_user: true})
                        setTimeout(function () {
                            slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID
                            + '*: ... second thoughts. I have the screenshot but alas - dont know how to post it', {as_user: true})
                        }, 1800);
                        // gui.window.capturePage(function() {
                        //     slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Here\'s my screen.', {as_user: true})
                        // }, { format : "png", datatype : "raw" })
                        break
                    case 'shutup':
                    case 'shut down':
                        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: I have ' + def + ' ' + ref_id
                        + ', but not going to shut down just like that!', {as_user: true})
                        break
                    case 'ver':
                    case 'version':
                        slackbot.postMessageToChannel('test', datestring + ':' + c.__SCREEN_ID + ' *' + c.__VERSION
                        + '* _' + process.platform + '_: I have ' + def + ' ' + ref_id + '.', {as_user: true})
                        break
                    case 'log':
                        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Here\'s my log.', {as_user: true})
                        break
                    case 'restart':
                        restart()
                        break
                    case 'upgrade':
                        upgrade()
                        break
                    case 'latest':
                        latest()
                        break
                }
            } else if (params[0] === 'version' && params[1] === c.__VERSION) {
                slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: I\'m running on ' + c.__VERSION + '.', {as_user: true})
            }
    }
})

module.exports = slackbot
