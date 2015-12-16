var SlackBot = require('slackbots')

var c = require('./c.js')

var slackbot_settings = {
    token: 'xoxb-12801543831-Bx3UtMRBeDoTMj3eX8d9HsIk',
    // name: 'noise'
}
var slackbot = new SlackBot(slackbot_settings)


function restart() {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: +:smiling_imp: going down and then coming up again', {as_user: true})
    // document.location.reload(true)
    // window.location.reload(3)
    console.log('=====================================')
    console.log('== RELAUNCHING! =====================')
    console.log('=====================================')

    setTimeout(function () {
        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: (cant rise without falling)', {as_user: true})
        console.log('bye')
        //Restart node-webkit app
        var child_process = require('child_process')

        //Start new app
        var child = child_process.spawn(process.execPath, ['./', c.__SCREEN_ID], {detached: true})

        //Don't wait for it
        child.unref()

        //Quit current
        // player_window.hide() // hide window to prevent black display
        process.exit(0) // quit node-webkit app
    }, 500)
}


slackbot.on('start', function() {
    // slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Joining to chatter.', {as_user: true})
    // slackbot.postMessageToUser('michelek', 'hello bro!')
    // slackbot.postMessageToGroup('some-private-group', 'hello group chat!')
})

slackbot.chatter = function(message, callback) {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: ' + message, {as_user: true}, callback)
}

slackbot.error = function(message, callback) {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: ' + message, {as_user: true}, callback)
}

slackbot.on('message', function(message) {
    if (message.type !== 'message' || !Boolean(message.text)) {
        // console.log('Message type ' + message.type + '".')
        return
    }
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')

    switch (message.text.toLowerCase()) {
        case c.__SCREEN_ID:
            slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Yes, ma\'am!', {as_user: true})
            break
        case 'hello':
        case 'hi':
            slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Checking in.', {as_user: true})
            break
        case 'version':
        case 'ver':
            slackbot.postMessageToChannel('test', datestring + ':' + c.__SCREEN_ID + ' *' + c.__VERSION + '*', {as_user: true})
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
                        + '*: I have ' + def + ' ' + ref_id + '.', {as_user: true})
                        break
                    case 'log':
                        slackbot.postMessageToChannel('test', datestring + ':*' + c.__SCREEN_ID + '*: Here\'s my log.', {as_user: true})
                        break
                    case 'restart':
                        restart()
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

module.exports = slackbot
