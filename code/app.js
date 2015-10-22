/*
 * Screenwerk main executable. Arguments:
 *
 * argv[0]          Screen's Entu ID
 *
 */

var async           = require('async')
var events          = require('events')
var fs              = require('fs')
var https           = require('https')
// var gui             = global.window.nwDispatcher.requireNwGui()
var gui             = require('nw.gui')
var op              = require('object-path')
var path            = require('path')
var uuid            = require('node-uuid')

var stringifier     = require('./code/stringifier.js')
var c               = require('./code/c.js')
var configuration   = require('./code/configuration.json')
var swmeta          = require('./code/swmeta.js')


c.__VERSION = gui.App.manifest.version
c.__APPLICATION_NAME = gui.App.manifest.name
c.__HOME_PATH = path.resolve(process.env.HOME ? process.env.HOME : process.env.HOMEPATH, gui.App.manifest.name)
if (!fs.existsSync(c.__HOME_PATH)) {
    fs.mkdirSync(c.__HOME_PATH)
}
configuration_path = path.resolve(c.__HOME_PATH, 'configuration.json')
try {
    configuration = require(configuration_path)
} catch (exception) {
    fs.writeFileSync(configuration_path, JSON.stringify(configuration, null, 4))
    var message = ' Default configuration saved to \n'
        + configuration_path + '.\n'
        + ' Please put Your SCREEN_ID.uuid file in\n' + c.__HOME_PATH
        + 'and restart Screenwerk.\n'
    window.alert(message)
    gui.Shell.openItem(c.__HOME_PATH)
    process.exit(0)
}

var routine_timeout


c.__DEBUG_MODE = configuration.debug
c.__SCREEN = configuration.run_on_screen
c.__RELAUNCH_THRESHOLD = configuration.relaunch

c.__HOSTNAME = 'piletilevi.entu.ee'
c.__API_URL = 'https://' + c.__HOSTNAME + '/api2'
c.__META_DIR = path.resolve(c.__HOME_PATH, 'sw-meta')
if (!fs.existsSync(c.__META_DIR)) {
    fs.mkdirSync(c.__META_DIR)
}
c.__MEDIA_DIR = path.resolve(c.__HOME_PATH, 'sw-media')
if (!fs.existsSync(c.__MEDIA_DIR)) {
    fs.mkdirSync(c.__MEDIA_DIR)
}
c.__LOG_DIR = path.resolve(c.__HOME_PATH, 'sw-log')
if (!fs.existsSync(c.__LOG_DIR)) {
    fs.mkdirSync(c.__LOG_DIR)
}

c.__DEFAULT_UPDATE_INTERVAL_MINUTES = 0.5

var helper          = require('./code/helper.js')
helper.log('= ' + c.__APPLICATION_NAME + ' v.' + c.__VERSION + ' ==================================')


var getUUID = require('./code/get_uuid')
var readFromCache = require('./code/read_from_cache')
var cacheFromEntu = require('./code/cache_from_entu')
var reloadPlayer  = require('./code/reload_player')


getUUID(function() {
    readFromCache(reloadPlayer, function() {
        cacheFromEntu(reloadPlayer, function(error) {
            if(error) {
                helper.log('Reload failed.', error)
                process.exit(1)
            }
            // helper.log(JSON.stringify(swmeta.get(), null, 4))
            setTimeout(function () {
                routine()
            }, c.__DEFAULT_UPDATE_INTERVAL_MINUTES * 60 * 1000)
        })
    })
})

var routine = function routine() {
    helper.log('Routine check for news from earth.')
    cacheFromEntu(reloadPlayer, function callback() {
        setTimeout(function () {
            routine()
        }, c.__DEFAULT_UPDATE_INTERVAL_MINUTES * 60 * 1000)
    })
}




var player_window = gui.Window.get()
if (c.__DEBUG_MODE) {
    helper.log ( 'launching in debug mode')
    player_window.moveTo(0,30)
    player_window.isFullscreen = false
    player_window.showDevTools()
} else {
    helper.log ( 'launching in fullscreen mode')
    player_window.moveTo(window.screen.width * (c.__SCREEN - 1) + 1, 30)
    player_window.isFullscreen = true
}
var nativeMenuBar = new gui.Menu({ type: "menubar" })
try {
    nativeMenuBar.createMacBuiltin(gui.App.manifest.name + ' ' + c.__VERSION)
    player_window.menu = nativeMenuBar
} catch (ex) {
    // helper.log(ex.message)
}


// // React to messages received from master
// process.on('message', function(msg) {
//     switch(msg.type) {
//         case 'hello':
//             console.log('master welcomed me :)')
//             var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
//             helper.slackbot.postMessageToChannel('test', datestring + ': Master said "hello"', {as_user: true})
//         break
//         case 'message':
//             console.log('Got message: "' + msg.message + '"')
//         break
//         case 'reload':
//             cacheFromEntu(reloadPlayer, function() {
//                 helper.log('All systems are go.')
//                 clearTimeout(routine_timeout)
//                 routine_timeout = setTimeout(function () {
//                     routine()
//                 }, c.__DEFAULT_UPDATE_INTERVAL_MINUTES * 60 * 1000)
//             })
//         break
//     }
// })


var uuids = []
fs.readdirSync(c.__HOME_PATH).forEach(function scanHome(filename) {
    if (filename.substr(-5) === '.uuid') {
        uuids.push(filename)
    }
})

var createUUID = function createUUID(callback) {
    document.getElementById('createUUID').style.display = 'block'
    window.document.getElementById('createUUID_id').focus()
    window.document.getElementById('createUUID_key').value = uuid.v1()
    window.document.getElementById('createUUID_submit').onclick = function createUUID_submit() {
        var id = window.document.getElementById('createUUID_id').value
        var key = window.document.getElementById('createUUID_key').value
        window.document.getElementById('createUUID').style.display = 'none'
        callback(id, key)
    }
}
var chooseUUID = function chooseUUID(uuids, callback) {
    if (typeof(gui.App.argv[0] === 'string')) {
        if (Number(gui.App.argv[0]) > 0) {
            callback(Number(gui.App.argv[0]))
            return
        }
    }
    Number(gui.App.argv.shift())
    document.getElementById('chooseUUID').style.display = 'block'
    uuids.forEach(function(id) {
        id = id.slice(0,-5)
        var id_element = document.createElement('span')
        id_element.appendChild( document.createTextNode(id) )
        id_element.onclick = function chooseUUID_chosen() {
            window.document.getElementById('chooseUUID').style.display = 'none'
            callback(id)
        }
        document.getElementById('chooseUUID').appendChild(id_element)
    })
}
