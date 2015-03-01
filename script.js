/*
 * Screenwerk main executable. Arguments:
 *
 * argv[0]          Screen's Entu ID
 *
 */

// 1. Core modules
var gui             = require('nw.gui')
var assert          = require('assert')
var util            = require('util')
var fs              = require('fs')
var https           = require('https')
var events          = require('events')
var uuid            = require('node-uuid')
var path            = require('path')


// 2. Public modules from npm
var os              = require('os-utils')


// 3. Own modules
var entulib         = require('./entulib.js')
var player          = require('./player.js')
var stringifier     = require('./stringifier.js')
var c               = require('./c.js')
var configuration   = require('./configuration.json')
var helper          = require('./helper.js')
var loader          = require('./loader.js')
var digest          = require('./digest.js')

c.__VERSION = gui.App.manifest.version
c.__APPLICATION_NAME = gui.App.manifest.name


var home_path = ''
if (process.env.HOME !== undefined) {
    home_path = process.env.HOME
} else if (process.env.HOMEPATH !== undefined) {
    home_path = process.env.HOMEDRIVE + process.env.HOMEPATH
}
home_path = path.resolve(home_path, gui.App.manifest.name)
if (!fs.existsSync(home_path)) {
    fs.mkdirSync(home_path)
}
configuration_path = path.resolve(home_path, 'configuration.json')
function exitWithMessage(message) {
    window.alert(message)
    gui.Shell.openItem(home_path)
    process.exit(1)
}
try {
    configuration = require(configuration_path)
} catch (exception) {
    fs.writeFileSync(configuration_path, JSON.stringify(configuration, null, 4))
    exitWithMessage('Default configuration saved to \n'
        + configuration_path + '.\n'
        + 'Please put Your SCREEN_ID.uuid file in\n' + home_path)
}

c.__HOSTNAME = 'piletilevi.entu.ee'
c.__META_DIR = path.resolve(home_path, 'sw-meta')
if (!fs.existsSync(c.__META_DIR)) {
    fs.mkdirSync(c.__META_DIR)
}
c.__MEDIA_DIR = path.resolve(home_path, 'sw-media')
if (!fs.existsSync(c.__MEDIA_DIR)) {
    fs.mkdirSync(c.__MEDIA_DIR)
}
c.__LOG_DIR = path.resolve(home_path, 'sw-log')
if (!fs.existsSync(c.__LOG_DIR)) {
    fs.mkdirSync(c.__LOG_DIR)
}
var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '').split(' ')[0]
var log_path = path.resolve(c.__LOG_DIR, datestring + '.log')
var logStream = fs.createWriteStream(log_path, {flags:'a'})
datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
logStream.write('\n\nStart logging at ' + datestring + '\n------------------------------------\n')
console.log = function() {
    datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    var arr = [], p, i = 0
    for (p in arguments) arr[i++] = arguments[p]
    var stack = new Error().stack.split(' at ')[2].trim().replace(/\/.*\//,'')
    var line = stack[1] + ':' + stack[2] + ':' + stack[3]
    var output = datestring + ': ' + arr.join(', ') + ' @' + stack + '\n'
    logStream.write(output)
    process.stdout.write(output)
}


console.log ( '= ' + c.__APPLICATION_NAME + ' v.' + c.__VERSION + ' ==================================')
console.log ( os.platform() )


c.__STRUCTURE = {"name":"screen","reference":{"name":"screen-group","reference":{"name":"configuration","child":{"name":"schedule","reference":{"name":"layout","child":{"name":"layout-playlist","reference":{"name":"playlist","child":{"name":"playlist-media","reference":{"name":"media"}}}}}}}}}
c.__HIERARCHY = {'child_of': {}, 'parent_of': {}}
function recurseHierarchy(structure, parent_name) {
    if (parent_name) {
        c.__HIERARCHY.child_of[parent_name] = structure.name
        c.__HIERARCHY.parent_of[structure.name] = parent_name
    }
    if (structure.child !== undefined)
        recurseHierarchy(structure.child, structure.name)
    else if (structure.reference !== undefined)
        recurseHierarchy(structure.reference, structure.name)
}
recurseHierarchy(c.__STRUCTURE)
c.__DEFAULT_UPDATE_INTERVAL_MINUTES = 10
c.__UPDATE_INTERVAL_SECONDS = c.__DEFAULT_UPDATE_INTERVAL_MINUTES * 60
c.__DEFAULT_DELAY_MS = 0
c.__DEBUG_MODE = configuration.debug
c.__SCREEN = configuration.run_on_screen
c.__RELAUNCH_THRESHOLD = configuration.relaunch




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
    window.alert('Choose!!!')
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

var EntuLib,  local_published, remote_published

//
// Main funcion to start the loader and then player
// Essential configuration has been successfully loaded
//
var run = function run() {

    if (!c.__SCREEN_ID) {
        exitWithMessage('Missing screen ID, blame programmer.\nExiting.')
    }

    var uuid_path = path.resolve(home_path, c.__SCREEN_ID + '.uuid')
    if (fs.existsSync(uuid_path)) {
        c.__API_KEY = fs.readFileSync(uuid_path)
        console.log ( 'Read key: ' + c.__API_KEY, 'INFO')
    } else {
        if (!c.__API_KEY) {
            exitWithMessage('Missing API key, blame programmer.\nExiting.')
        }
        fs.writeFileSync(uuid_path, c.__API_KEY)
    }


    // console.log('initialize EntuLib with ' + c.__SCREEN_ID + '|' + c.__API_KEY + '|' + c.__HOSTNAME)
    EntuLib = entulib(c.__SCREEN_ID, c.__API_KEY, c.__HOSTNAME)




    // Cleanup unfinished downloads if any
    fs.stat(c.__MEDIA_DIR, function(err, stats) {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(c.__MEDIA_DIR + ' will be OK in a sec')
            } else {
                console.log(c.__MEDIA_DIR + ' err', err)
                return
            }
        }
        else if (stats.isDirectory()) {
            fs.readdirSync(c.__MEDIA_DIR).forEach(function(download_filename) {
                if (download_filename.split('.').pop() !== 'download')
                    return
                console.log("Unlink " + path.resolve(c.__MEDIA_DIR, download_filename))
                var result = fs.unlinkSync(path.resolve(c.__MEDIA_DIR, download_filename))
                if (result instanceof Error) {
                    console.log("Can't unlink " + path.resolve(c.__MEDIA_DIR, download_filename), result)
                }
            })
        }
    })


    // Read existing screen meta, if local data available
    var meta_path = path.resolve(c.__META_DIR, c.__SCREEN_ID + ' ' + 'screen.json')
    local_published = new Date(Date.parse('2004-01-01'))
    remote_published = new Date(Date.parse('2004-01-01'))
    var meta_obj = {}
    // var data
    try {
        meta_obj = JSON.parse(fs.readFileSync(meta_path, 'utf-8'))
        local_published = new Date(Date.parse(meta_obj.properties.published.values[0].value))
        console.log('Local published: ' + local_published.toJSON())
    } catch (e) {
        local_published = false
    }


    // Fetch publishing time for screen, if Entu is reachable
    //   and start the show
    EntuLib.getEntity(c.__SCREEN_ID, function getEntityCB(err, result) {
        if (err) {
            remote_published = false
            console.log('Can\'t reach Entu', err, result)
            if (local_published) {
                console.log('Trying to play with local content.')
                loader.loadMeta(null, null, c.__SCREEN_ID, c.__STRUCTURE, startDigester)
                return
            } else {
                console.log('Remote and local both unreachable. Terminating.')
                process.exit(99)
            }
        }
        else if (result.error !== undefined) {
            remote_published = false
            console.log (result.error, 'Failed to load screen ' + c.__SCREEN_ID + ' from Entu.')
            if (local_published) {
                console.log('Trying to play with local content.')
                loader.loadMeta(null, null, c.__SCREEN_ID, c.__STRUCTURE, startDigester)
                return
            } else {
                console.log('Remote and local both unreachable. Terminating.')
                process.exit(99)
            }
        } else {
            // alert('Result: ' + util.inspect(result.result.properties.published))
            remote_published = new Date(Date.parse(result.result.properties.published.values[0].value))
            console.log('Remote published: ' + remote_published.toJSON())
        }

        if (local_published &&
            local_published.toJSON() === remote_published.toJSON()) {
            console.log('Trying to play with local content.')
            loader.loadMeta(null, null, c.__SCREEN_ID, c.__STRUCTURE, startDigester)
        }
        else {
            console.log('Remove local content. Fetch new from Entu!')
            player.clearSwTimeouts()
            local_published = new Date(Date.parse(remote_published.toJSON()))
            loader.reloadMeta(null, startDigester)
        }
    })


}


var player_window = gui.Window.get()
if (c.__DEBUG_MODE) {
    console.log ( 'launching in debug mode')
    player_window.moveTo(0,30)
    player_window.isFullscreen = false
    player_window.showDevTools()
} else {
    console.log ( 'launching in fullscreen mode')
    player_window.moveTo(window.screen.width * (c.__SCREEN - 1) + 1, 30)
    player_window.isFullscreen = true
}
var nativeMenuBar = new gui.Menu({ type: "menubar" })
try {
    nativeMenuBar.createMacBuiltin(gui.App.manifest.name + ' ' + c.__VERSION)
    player_window.menu = nativeMenuBar
} catch (ex) {
    console.log(ex.message)
}


var uuids = []
fs.readdirSync(home_path).forEach(function scanHome(filename) {
    if (filename.substr(-5) === '.uuid') {
        uuids.push(filename)
    }
})

player_window.on('loaded', function playerWindowLoaded() {
    player_window.removeListener('loaded', playerWindowLoaded)
    player_window.focus()
    if (uuids.length === 1) {
        c.__SCREEN_ID = uuids[0].slice(0,-5)
        run()
    } else if (uuids.length === 0) {
        document.styleSheets[1].rules[0].style.cursor = 'normal'
        createUUID(function createUUID_cb(id, key) {
            document.styleSheets[1].rules[0].style.cursor = 'none'
            alert('ID: ' + id + '<br/>KEY: ' + key)
            c.__SCREEN_ID = id
            c.__API_KEY = key
            run()
        })
    } else if (uuids.length > 1) {
        document.styleSheets[1].rules[0].style.cursor = 'normal'
        chooseUUID(uuids, function chooseUUID_cb(id) {
            document.styleSheets[1].rules[0].style.cursor = 'none'
            c.__SCREEN_ID = id
            run()
        })
    }
})




function startDigester(err, data) {
    if (err) {
        console.log('startDigester err:', err, data)
        player.tcIncr()
        setTimeout(function() {
            process.exit(0)
        }, 300)
        return
    }
    // console.log('loader.countLoadingProcesses(): ' + loader.countLoadingProcesses())
    if (loader.countLoadingProcesses() > 0) {
        // console.log('Waiting for loaders to calm down. Active processes: ' + loader.countLoadingProcesses())
        return
    }
    console.log('Reached stable state. Flushing metadata and starting preprocessing elements.')
    fs.writeFileSync('elements.debug.json', stringifier(loader.swElementsById))

    var doTimeout = function() {
        player.tcIncr()
        setTimeout(function() {
            // console.log('RRRRRRRRRRR: Pinging Entu for news.')
            EntuLib.getEntity(c.__SCREEN_ID, function(err, result) {
                if (err) {
                    console.log('Can\'t reach Entu', err, result)
                }
                else if (result.error !== undefined) {
                    console.log ('Failed to load from Entu.', result)
                } else {
                    remote_published = new Date(Date.parse(result.result.properties.published.values[0].value))
                    // console.log('Remote published: ', remote_published.toJSON())
                }

                if (remote_published
                    && local_published.toJSON() !== remote_published.toJSON()
                    && (new Date()).toJSON() > remote_published.toJSON()
                    ) {
                    console.log('Remove local content. Fetch new from Entu!')
                    player.clearSwTimeouts()
                    local_published = new Date(Date.parse(remote_published.toJSON()))
                    loader.reloadMeta(null, startDigester)
                } else {
                    doTimeout()
                    // loader.loadMeta(null, null, c.__SCREEN_ID, c.__STRUCTURE, startDigester)
                }
            })
        }, 1000 * c.__UPDATE_INTERVAL_SECONDS)
        // console.log('RRRRRRRRRRR: Check for news scheduled in ' + c.__UPDATE_INTERVAL_SECONDS + ' seconds.')
    }
    doTimeout()

    function flushMeta(err) {
        if (err) {
            console.log('flushMeta err:', err)
            process.exit(99)
        }
        var stacksize = loader.swElements.length
        loader.swElements.every(function(swElement, idx) {
            if (swElement.definition.keyname !== 'sw-media' && swElement.childs.length === 0) {
                console.log('Unregister empty element ' + swElement.id)
                unregisterMeta(null, idx, function(err, data) {
                    if (err) {
                        console.log('flushMeta err:', err, data)
                    }
                    flushMeta(null)
                })
                return false
            }
            var meta_path = path.resolve(c.__META_DIR, swElement.id + ' ' + swElement.definition.keyname.split('sw-')[1] + '.json')
            fs.writeFileSync(meta_path, stringifier(swElement))
            if(-- stacksize === 0) {
                console.log('====== Metadata flushed')
                digest.processElements(null, startDOM)
            }
            return true
        })
    }
    flushMeta(null)
}


var screen_dom_element
function startDOM(err, options) {
    if (err) {
        console.log('startDOM err:', err, options)
        process.exit(99)
    }
    if (screen_dom_element)
        document.body.removeChild(screen_dom_element)
    console.log('====== Start startDOM')
    digest.buildDom(null, function(err, dom_element) {
        screen_dom_element = dom_element
        console.log('DOM rebuilt')
    })
    console.log('====== Finish startDOM', options)
    player.clearSwTimeouts()
    screen_dom_element.player = new player.SwPlayer(null, screen_dom_element, function(err, data) {
        console.log('startDOM err:', err, util.inspect(data))
        process.exit(99)
    })
    screen_dom_element.player.restart(null, function(err, data) {
        if (err) {
            console.log('startDOM err:', err, data)
            callback(er, data)
        }
    })
    // setTimeout(function() {
    //  process.exit(0)
    // }, 300)
    return
}


// Begin capturing screenshots
function captureScreenshot(err, callback) {
    if (err) {
        console.log('captureScreenshot err:', err)
        return
    }
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    var screenshot_path = c.__LOG_DIR + 'screencapture ' + datestring + '.jpeg'
    var writer = fs.createWriteStream(screenshot_path)
    player_window.capturePage(function(buffer) {
        if (writer.write(buffer) === false) {
            // console.log('Shouldnt happen!   ...always does...')
            writer.once('drain', function() {writer.write(buffer)})
        }
        writer.close()
        function addScreenshot() {
            // console.log('Saving screenshot')
            EntuLib.addFile(c.__SCREEN_ID, 'sw-screen-photo', screenshot_path, function(err, data) {
                if (err) {
                    console.log('captureScreenshot err:', util.inspect(err), util.inspect(data))
                }
                // console.log(util.inspect(data))
            })
        }
        EntuLib.getEntity(c.__SCREEN_ID, function(err, entity) {
            if (err) {
                if (err.code === 'ENOTFOUND') {
                    // console.log('Not connected')
                } else {
                    console.log('captureScreenshot err:', util.inspect(err), util.inspect(entity))
                }
                return
            }
            if (entity.result.properties.photo.values === undefined) {
                addScreenshot()
            } else {
                var stack = entity.result.properties.photo.values
                // console.log(stack)
                var stacksize = stack.length
                stack.forEach(function(item) {
                    EntuLib.removeProperty(c.__SCREEN_ID, 'sw-screen-photo', item.id, function(err, data) {
                        if (err) {
                            console.log('captureScreenshot err:', util.inspect(item), util.inspect(err), util.inspect(data))
                        }
                        // console.log(util.inspect(item), util.inspect(data))
                        if(-- stacksize === 0) {
                            addScreenshot()
                        }
                    })
                })

            }
        })
    }, { format : 'jpeg', datatype : 'buffer'})
    player.tcIncr()
    setTimeout(function() { callback(null, callback) }, 30*1000)
}
// player.tcIncr()
// setTimeout(function() {
//  captureScreenshot(null, captureScreenshot)
// }, 1*1000)
