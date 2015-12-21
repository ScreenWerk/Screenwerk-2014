var path        = require('path')
var fs          = require('fs')
var op          = require('object-path')
var request     = require('request')
var SlackBot    = require('slackbots')
var SlackUp     = require('node-slack-upload')

var token = 'xoxb-12801543831-Bx3UtMRBeDoTMj3eX8d9HsIk'

var c = require('./c.js')

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
    c.logStream.write('Slackbot initialized.')
} catch (err) {
    c.logStream.write('Failed to init slackbot.')
    c.logStream.write('E:' + JSON.stringify(err))
}

var isWin = /^win/.test(process.platform);
var flagFile = path.join((process.env.HOMEDRIVE + process.env.HOMEPATH) || process.env.HOME, 'shutting_down')


slackbot.chatter = function(message, channel) {
    if (!channel) { channel = c.channels.chat }
    // console.log('XXXXXXX', channel, message)
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    datestring = ''
    slackbot.postMessageToChannel(channel, datestring + ':*' + c.__SCREEN_ID + '*: ' + message, {as_user: true})
}

slackbot.error = function(message) {
    slackbot.chatter(message, c.channels.error)
}



// curl -X POST --data-urlencode 'payload={"text": "This is posted to <# test> and comes from *TEST screen*.", "channel": "#test", "username": "swplayer 75", "icon_emoji": ":monkey_face:"}' https://hooks.slack.com/services/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
var logWebhook = 'https://hooks.slack.com/services/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'
function uploadLog() {
    var logStream = fs.createReadStream(c.log_path)

    var params_o = {
        filetype: 'post',
        filename: c.__SCREEN_ID + '.log',
        title: c.__SCREEN_ID + '.log',
        initialComment: 'foo',
        channels: '%23test,%23logs',
        username: 'noise',
        filetype: 'log',
        // content: 'testin faili sisu',
        as_user: 'true'
    }
    var params_a = []
    for (var key in params_o) {
        params_a.push(key + '=' + params_o[key])
    }
    var params = params_a.join('&')
    // var endpoint = 'https://slack.com/api/files.upload?token=' + 'xoxp-12801926784-12801926800-17067950499-84e198e606' + '&' + params
    var endpoint = 'https://slack.com/api/files.upload?token=' + token + '&' + params
    console.log('### ', endpoint)
	var req = request.post({url: endpoint, strictSSL: true, json: true}, function (err, response, body) {
	// var req = request.post(endpoint, function (err, response, body) {
		console.log('### ', response.headers['content-type'])
        if (err) {
            console.log('## ', err)
			return
		}
		if (response.statusCode >= 300) {
            console.log('## ', response)
			return
		}
        slackbot.chatter(c.log_path)
        slackbot.chatter(JSON.stringify(body, null, 4))
		// body = JSON.parse(body)
		if (!body.ok) {
            slackbot.chatter(body.error)
            console.log('## ', body.error)
			return
		}
        // console.log('### ', JSON.stringify(body, null, 4))
        // slackbot.postMessageToChannel('logs', datestring + ':*' + c.__SCREEN_ID + '*: :notebook: ' + body.file.permalink_public, {as_user: true})
	})
    req.on('response', function(response) {
        console.log('### ', response.statusCode) // 200
        console.log('### ', response.headers['content-type']) // 'image/png'
    })
	if (logStream) {
		var form = req.form()
		form.append('file', logStream)
	}
}

function restart() {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    slackbot.chatter(':sunrise: down. then up again')
    console.log('== RELAUNCHING! =====================')

    var child_process = require('child_process')

    fs.open(flagFile, 'w', function(err, fd) {
        fs.watchFile(flagFile, function (curr, prev) {
            console.log(flagFile, curr, prev)
            if (curr.ino === 0) { process.exit(0) }
        })
        child_process.exec('nwjs .')
    })
}

function mambojambo() {
    slackbot.chatter('mambojambo')
    setTimeout(function () {
        slackbot.chatter(jt())
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

slackbot.on('message', function(message) {
    console.log('Message type ' + message.type + '".')
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
                        mambojambo()
                        // gui.window.capturePage(function() {
                        //     slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Here\'s my screen.', {as_user: true})
                        // }, { format : "png", datatype : "raw" })
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
                        uploadLog()
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
