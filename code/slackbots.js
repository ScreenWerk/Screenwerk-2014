var path        = require('path')
var fs          = require('fs')
var SlackBot    = require('slackbots')

var c = require('./c.js')

var slackbot_settings = {
    token: 'xoxb-12801543831-Bx3UtMRBeDoTMj3eX8d9HsIk',
    // name: 'noise'
}
try {
    var slackbot = new SlackBot(slackbot_settings)
    c.logStream.write('Slackbot initialized.')
} catch (err) {
    c.logStream.write('Failed to init slackbot.')
    c.logStream.write('E:' + JSON.stringify(err))
}

var isWin = /^win/.test(process.platform);
var flagFile = path.join((process.env.HOMEDRIVE + process.env.HOMEPATH) || process.env.HOME, 'shutting_down')


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


function upgrade(upgradeType) {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')

    var scriptName = 'launcher'
    if (upgradeType === 'latest release') {
        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: :arrow_double_up: to latest release', {as_user: true})
    } else if (upgradeType === 'latest build') {
        scriptName = 'latest'
        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: :warning: installing latest build', {as_user: true})
    } else {
        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: mambojambo', {as_user: true})
        setTimeout(function () {
            slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: and Jina ēbaṁ ṭanika, too', {as_user: true})
        }, 1500)
        return
    }

    var child_process = require('child_process')

    fs.open(flagFile, 'w', function(err, fd) {
        fs.watchFile(flagFile, function (curr, prev) {
            console.log(flagFile, curr, prev)
            if (curr.ino === 0) { process.exit(0) }
        })
        if (isWin) {
            child_process.execFile(scriptName + '.bat')
        } else {
            child_process.exec('. ' + scriptName + '.sh', function (err, stdout, stderr) {
                if (err !== null) { throw err }
                console.log('stdout: ' + stdout)
                console.log('stderr: ' + stderr)
            })
        }
    })

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
                        upgrade('latest release')
                        break
                    case 'latest':
                        upgrade('latest build')
                        break
                }
            } else if (params[0] === 'version' && params[1] === c.__VERSION) {
                slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: I\'m running on ' + c.__VERSION + '.', {as_user: true})
            }
    }
})

module.exports = slackbot
