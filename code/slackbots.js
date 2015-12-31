var path        = require('path')
var fs          = require('fs')
var op          = require('object-path')
var request     = require('request')
var SlackBot    = require('slackbots')
var SlackUp     = require('node-slack-upload')


// TODO: Token for 'noise' has to be read from Entu screen
var token = 'xoxb-12801543831-Bx3UtMRBeDoTMj3eX8d9HsIk'

// TODO: Token for 'alerts' webhook has to be read from Entu customer
var token = 'xoxb-12801543831-Bx3UtMRBeDoTMj3eX8d9HsIk'

var c = require('./c.js')
var isConnected = false

var jt = function() {
    var jt = require('./gintonic.json')
    return jt[Math.floor(Math.random()*jt.length)]
}


var slackbot_settings = {
    token: token,
    // name: 'noise'
}
try {
    var slackbot = new SlackBot(slackbot_settings)
} catch (err) {
    c.log.error('Failed to init slackbot.')
    c.log.error(err)
    c.restart()
}


slackbot.chatter = function(message, channel) {
    if (!channel) { channel = 'chat' }
    if (!isConnected) {
        c.log.info('Postponing chat message to ' + channel + ': ' + message)
        // setTimeout(function () { slackbot.chatter(message, channel) }, 1000)
        return
    }
    // c.log.info('XXXXXXX', channel, message)
    // var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    datestring = ''
    slackbot.postMessageToChannel(c.slackChannels[channel], datestring + ' *' + c.__SCREEN_ID + '* ' + message, {as_user: true})
}



function captureScreenshot() {
    c.log.info('Start ss')
    c.player_window.capturePage(function(buffer) {
        c.log.info('Got ss')
        var datestring = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '')
        var screenshotPath = path.join(c.__LOG_DIR, c.__SCREEN_ID + '_' + datestring + '.png')

        fs.open(screenshotPath, 'w', function(err, fd) {
            if (err) { throw err }
            fs.write(fd, buffer, 0, buffer.length, 0, function(err, written, buffer) {
                c.log.info('Written: ' + written)
                c.log.info('Buffer size: ' + buffer.length)

                var params_o = {
                    filetype: 'post',
                    filename: c.__SCREEN_ID + '.png',
                    title: c.__SCREEN_ID + '.png',
                    channels: '%23logs',
                    username: 'noise',
                    as_user: 'true',
                    filetype: 'image'
                }
                var params_a = []
                for (var key in params_o) {
                    params_a.push(key + '=' + params_o[key])
                }
                var params = params_a.join('&')
                var endpoint = 'https://slack.com/api/files.upload?token=' + token + '&' + params

                var req = request.post({url: endpoint, strictSSL: true, json: true}, function (err, response, body) {
                    if (err) {
                        return c.log.error(err)
                    }
                    if (response.statusCode >= 300) {
                        c.log.error('Response status code >= 300')
                        return c.log.error(response)
                    }
                    if (!body.ok) {
                        return c.log.error(JSON.stringify(body, null, 4))
                    }
                })
                req.on('response', function(response) {
                    c.log.info('Appended ' + screenshotPath)
                })
                c.log.info('Appending ' + screenshotPath)
                req.form().append('file', fs.createReadStream(screenshotPath))
            })
        })

        // var writer = fs.createWriteStream(screenshotPath)
        // if (writer.write(buffer) === false) {
        //     writer.once('drain', function() {writer.write(buffer)})
        // }
        // writer.close()

    }, {
        format : 'png',
        datatype : 'buffer'
    })
}


var logWebhook = 'https://hooks.slack.com/services/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'
slackbot.uploadLog = function uploadLog() {

    var params_o = {
        filetype: 'post',
        filename: c.__SCREEN_ID + '.log',
        title: c.__SCREEN_ID + '.log',
        initialComment: 'foo',
        channels: '%23logs',
        username: 'noise',
        as_user: 'true'
    }
    var params_a = []
    for (var key in params_o) {
        params_a.push(key + '=' + params_o[key])
    }
    var params = params_a.join('&')
    var endpoint = 'https://slack.com/api/files.upload?token=' + token + '&' + params

    var req = request.post({url: endpoint, strictSSL: true, json: true}, function (err, response, body) {
        if (err) {
            return c.log.error(err)
        }
        if (response.statusCode >= 300) {
            c.log.error('Response status code >= 300')
            return c.log.error(response)
        }
        if (!body.ok) {
            return c.log.error(JSON.stringify(body, null, 4))
        }
    })
    req.on('response', function(response) {
        c.log.info('### ' + response.statusCode)
        c.log.info('### ' + response.headers['content-type'])
    })
    req.form().append('file', fs.createReadStream(c.log.all))

}


function restart(launcherCommand) {
    if (!launcherCommand) {
        launcherCommand = 'nwjs .'
    }
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    slackbot.chatter(':sunrise: down. then up again')
    c.log.info('== RELAUNCHING! =====================')

    var child_process = require('child_process')

    child_process.exec(launcherCommand)
}

function mambojambo() {
    slackbot.chatter(jt())
    setTimeout(function () {
        slackbot.chatter('... and ' + jt())
    }, 1500)
}

function upgrade(upgradeType) {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')

    var scriptName = 'launcher'
    if (upgradeType === 'latest release') {
        slackbot.chatter(':arrow_double_up: to latest release')
    } else if (upgradeType === 'latest build') {
        scriptName = 'latest'
        slackbot.chatter(':warning: installing latest build')
    } else {
        return mambojambo()
    }

    if (c.isWin) {
        slackbot.chatter(':information_source: launching new instance on windows')
        restart(path.resolve(__dirname, '..', scriptName + '.bat'))
    } else {
        slackbot.chatter(':information_source: launching new instance on linux')
        restart('. ' + path.resolve(__dirname, '..', scriptName + '.sh'))
    }
}


slackbot.on('start', function() {
    c.log.info('Slackbot: Started')
})

slackbot.on('open', function() {
    isConnected = true
    // slackbot.chatter(':+1: connected')
    console.log('Slackbot: Socket opened')
    // c.log.info('Slackbot: Socket opened')
    // slackbot.chatter('X ' + c.__SCREEN_ID + ' hello, ' + slackbot.getUsers()._value.members.map(function(member) { return '@' + member.name }).join(' and '))
})

var connTo
slackbot.on('close', function() {
    slackbot.chatter(':-1: Socket closed', 'spam')
    c.log.info('Slackbot: Socket closed')
    isConnected = false
    clearTimeout(connTo)
    connTo = setTimeout(function () {
        slackbot.connect()
        slackbot.login()
    }, 5 * 60 * 1000)
})

slackbot.on('message', function(message) {
    if (message.type !== 'message' || !Boolean(message.text)) {
        return
    }
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')

    switch (message.text.toLowerCase()) {
        case c.__SCREEN_ID:
            slackbot.chatter('*' + c.__SCREEN_NAME + '*')
            break
        case 'hello':
        case 'hi':
            slackbot.chatter('Checking in.')
            break
        case 'version':
        case 'ver':
            slackbot.chatter('*' + c.__VERSION + '* _' + process.platform + '_ ' + c.__SCREEN_NAME)
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
                        slackbot.chatter('I have ' + def + ' ' + ref_id + '.')
                        break
                    case 'screenshot':
                    case 'ss':
                        captureScreenshot()
                        break
                    case 'shutup':
                    case 'shut down':
                        mambojambo()
                        break
                    case 'ver':
                    case 'version':
                        slackbot.chatter('*' + c.__VERSION + '* _' + process.platform + '_: I have ' + def + ' ' + ref_id + '.')
                        break
                    case 'log':
                        slackbot.uploadLog()
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
                slackbot.chatter('I\'m running on ' + c.__VERSION + '.')
            }
    }
})

module.exports = slackbot
