var gui             = require('nw.gui')
var fs              = require('fs')
var uuid            = require('node-uuid')
var op              = require('object-path')
var path            = require('path')
var raven           = require('raven')


// 3. Own modules
var entulib         = require('./code/entulib.js')
var stringifier     = require('./code/stringifier.js')
var c               = require('./code/c.js')
var configuration   = require('./code/configuration.json')


c.__VERSION = gui.App.manifest.version
c.__APPLICATION_NAME = gui.App.manifest.name
c.slackChannels = {
    'chat': 'test',
    'log': 'logs',
    'warning': 'alerts',
    'error': 'alerts',
    'debug': 'test'
}

c.homePath = path.join((process.env.HOMEDRIVE + process.env.HOMEPATH) || process.env.HOME, c.__APPLICATION_NAME)
var singletonLock = path.join(c.homePath, 'singleton.txt')
fs.readFile(singletonLock, function(err, pid) {
    if (err) { return fs.writeFileSync(singletonLock, process.pid) }
    if (Number(pid) !== Number(process.pid) ) {
        try { process.kill(pid) }
        catch (e) { }
        finally { fs.writeFileSync(singletonLock, process.pid) }
    }
})

c.flagFile = path.join(c.homePath, 'shutting_down')
c.__LOG_DIR = path.resolve(c.homePath, 'sw-log')
c.__META_DIR = path.resolve(c.homePath, 'sw-meta')
c.__MEDIA_DIR = path.resolve(c.homePath, 'sw-media')
if (!fs.existsSync(c.__LOG_DIR)) { fs.mkdirSync(c.__LOG_DIR) }
if (!fs.existsSync(c.__META_DIR)) { fs.mkdirSync(c.__META_DIR) }
if (!fs.existsSync(c.__MEDIA_DIR)) { fs.mkdirSync(c.__MEDIA_DIR) }


var ravenClient = new raven.Client(
    'https://9281b52c946e42f2bb199ac62165a003:1d69b0f053964c899f9ab4f1fff6e34b@app.getsentry.com/60050',
    { 'release': c.__VERSION }
)
ravenClient.patchGlobal()

c.log = {}
c.log.messages = []
c.log.infoFile = path.resolve(c.__LOG_DIR, 'info.log')
c.log.warningFile = path.resolve(c.__LOG_DIR, 'warning.log')
c.log.errorFile = path.resolve(c.__LOG_DIR, 'error.log')
c.log.append = function(message, channel) {
    var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
    c.log.messages.push({ts:datestring, ch:channel, msg:message})
    if (channel === 'warning') {
        fs.appendFile(c.log.warningFile, datestring + ' ' + channel + ' ' + message + '\n')
        return
    }
    fs.appendFile(c.log.infoFile, datestring + ' ' + channel + ' ' + message + '\n')
    if (channel === 'error') {
        fs.appendFile(c.log.errorFile, datestring + ' ' + channel + ' ' + message + '\n' + (new Error()).stack + '\n')
        if (slackbots && c.__SCREEN_ID) { slackbots.chatter(message + '\n' + (new Error()).stack, 'error') }
        else { console.log('timeouting'); setTimeout(function () { c.log.append(message, channel) }, 1000) }
    }
}
c.log.info = function(message) { c.log.append(message, 'info') }
c.log.error = function(message) { c.log.append(message, 'error') }
c.log.warning = function(message) { c.log.append(message, 'warning') }
c.log.setPrefix = function(prx) {
    c.log.append('info', 'Setting logfile prefix to "' + prx + '".')
    c.log.infoFile = path.resolve(c.__LOG_DIR, prx + '_' + 'info.log')
    c.log.warningFile = path.resolve(c.__LOG_DIR, prx + '_' + 'warning.log')
    c.log.errorFile = path.resolve(c.__LOG_DIR, prx + '_' + 'error.log')
}

// c.log.error('test the errorz')

var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
c.log.info('\n\n## Start logging at ' + datestring + '= ' + c.__APPLICATION_NAME + ' v.' + c.__VERSION + ' ##\n')

var slackbots       = require('./code/slackbots.js')
var player          = require('./code/player.js')
var digest          = require('./code/digest.js')
var loader          = require('./code/loader.js')


c.restart = function() {
    fs.open(c.flagFile, 'w', function(err, fd) {
        fs.watchFile(c.flagFile, function (curr, prev) {
            c.log.info(c.flagFile, curr, prev)
            if (curr.ino === 0) { process.exit(0) }
        })
        child_process.exec('nwjs .')
    })
}

c.terminate = function(message) {
    c.log.error(message)
    window.alert(message)
    gui.Shell.openItem(c.homePath)
    process.exit(1)
}

configuration_path = path.resolve(c.homePath, 'configuration.json')
try {
    configuration = require(configuration_path)
} catch (exception) {
    fs.writeFileSync(configuration_path, JSON.stringify(configuration, null, 4))
    c.terminate('Default configuration saved to \n'
        + configuration_path + '.\n'
        + 'Please put Your SCREEN_ID.uuid file in\n' + c.homePath)
}
c.__DEBUG_MODE = configuration.debug
c.__SCREEN = configuration.run_on_screen
c.__HOSTNAME = 'piletilevi.entu.ee'


c.__STRUCTURE = {'name':'screen','reference':{
    'name':'screen-group','reference':{
        'name':'configuration','child':{
            'name':'schedule','reference':{
                'name':'layout','child':{
                    'name':'layout-playlist','reference':{
                        'name':'playlist','child':{
                            'name':'playlist-media','reference':{
                                'name':'media'}}}}}}}}}
c.__HIERARCHY = {'child_of': {}, 'parent_of': {}}
function recurseHierarchy(structure, parent_name) {
    if (parent_name) {
        c.__HIERARCHY.child_of[parent_name] = structure.name
        c.__HIERARCHY.parent_of[structure.name] = parent_name
    }
    if (structure.child !== undefined) { recurseHierarchy(structure.child, structure.name) }
    else if (structure.reference !== undefined) { recurseHierarchy(structure.reference, structure.name) }
}
recurseHierarchy(c.__STRUCTURE)
c.__DEFAULT_UPDATE_INTERVAL_MINUTES = 10
c.__UPDATE_INTERVAL_SECONDS = c.__DEFAULT_UPDATE_INTERVAL_MINUTES * 60
c.__DEFAULT_DELAY_MS = 0


function createUUID(callback) {
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
function chooseUUID(uuids, callback) {
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

var EntuLib, local_published, remote_published

//
// Main function to start the loader and then player
// Essential configuration has been successfully loaded
//
function run() {
    // slackbots.chatter(':up:')

    if (!c.__SCREEN_ID) {
        c.terminate('Missing screen ID, blame programmer.\nExiting.')
    }

    c.log.setPrefix(c.__SCREEN_ID)

    var uuid_path = path.resolve(c.homePath, c.__SCREEN_ID + '.uuid')
    if (fs.existsSync(uuid_path)) {
        c.__API_KEY = fs.readFileSync(uuid_path)
        c.__KEY_ID = fs.statSync(uuid_path).ino
        c.log.info ( 'Read key: ' + c.__API_KEY, 'INFO' )
    } else {
        if (!c.__API_KEY) {
            c.terminate('Missing API key, blame programmer.\nExiting.')
        }
        fs.writeFileSync(uuid_path, c.__API_KEY)
    }


    // c.log.info('initialize EntuLib with ' + c.__SCREEN_ID + '|' + c.__API_KEY + '|' + c.__HOSTNAME)
    EntuLib = entulib(c.__SCREEN_ID, c.__API_KEY, c.__HOSTNAME)




    // Cleanup unfinished downloads if any
    fs.stat(c.__MEDIA_DIR, function(err, stats) {
        if (err) {
            if (err.code === 'ENOENT') {
                c.log.info(c.__MEDIA_DIR + ' will be OK in a sec')
            } else {
                c.log.info(c.__MEDIA_DIR + ' err', err)
                return
            }
        }
        else if (stats.isDirectory()) {
            fs.readdirSync(c.__MEDIA_DIR).forEach(function(download_filename) {
                if (download_filename.split('.').pop() !== 'download') { return }
                c.log.info('Unlink ' + path.resolve(c.__MEDIA_DIR, download_filename))
                var result = fs.unlinkSync(path.resolve(c.__MEDIA_DIR, download_filename))
                if (result instanceof Error) {
                    c.log.info('Can\'t unlink ' + path.resolve(c.__MEDIA_DIR, download_filename), result)
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
        c.log.info('Local published: ' + local_published.toJSON())
    } catch (e) {
        local_published = false
    }


    // Fetch publishing time for screen, if Entu is reachable
    //   and start the show
    EntuLib.getEntity(c.__SCREEN_ID, function getEntityCB(err, result) {
        if (err) {
            remote_published = false
            c.log.info('Can\'t reach Entu', err, result)
            if (local_published) {
                c.log.info('Trying to play with local content.')
                loader.loadMeta(null, null, c.__SCREEN_ID, c.__STRUCTURE, startDigester)
                return
            } else {
                c.log.info('Remote and local both unreachable. Terminating.')
                process.exit(99)
            }
        }
        else if (result.error !== undefined) {
            remote_published = false
            c.log.info (result.error, 'Failed to load screen ' + c.__SCREEN_ID + ' from Entu.')
            if (local_published) {
                c.log.info('Trying to play with local content.')
                loader.loadMeta(null, null, c.__SCREEN_ID, c.__STRUCTURE, startDigester)
                return
            } else {
                c.log.info('Remote and local both unreachable. Terminating.')
                process.exit(99)
            }
        } else {
            // alert('Result: ' + (result.result.properties.published))
            remote_published = new Date(Date.parse(result.result.properties.published.values[0].value))
            c.__SCREEN_NAME = op.get(result, ['result', 'properties', 'name', 'values', 0, 'value'])
            c.log.info(c.__SCREEN_NAME)

            slackbots.chatter(':up: ' + c.__SCREEN_NAME)
            fs.unlink(c.flagFile, function(err) {
                if (err) {}
            })
        }

        if (local_published &&
            local_published.toJSON() === remote_published.toJSON()) {
            // c.log.info('Trying to play with local content.')
            loader.loadMeta(null, null, c.__SCREEN_ID, c.__STRUCTURE, startDigester)
        }
        else {
            // c.log.info('Remove local content. Fetch new from Entu!')
            player.clearSwTimeouts()
            local_published = new Date(Date.parse(remote_published.toJSON()))
            loader.reloadMeta(null, startDigester)
        }
    })


}


c.player_window = gui.Window.get()
if (c.__DEBUG_MODE) {
    c.log.info ( 'launching in debug mode')
    c.player_window.moveTo(0,30)
    c.player_window.isFullscreen = false
    c.player_window.showDevTools()
} else {
    c.log.info ( 'launching in fullscreen mode')
    c.player_window.moveTo(window.screen.width * (c.__SCREEN - 1) + 1, 30)
    c.player_window.isFullscreen = true
}
var nativeMenuBar = new gui.Menu({ type: 'menubar' })
try {
    nativeMenuBar.createMacBuiltin(gui.App.manifest.name + ' ' + c.__VERSION)
    c.player_window.menu = nativeMenuBar
} catch (ex) {
    // c.log.info(ex.message)
}


var uuids = []
fs.readdirSync(c.homePath).forEach(function scanHome(filename) {
    if (filename.substr(-5) === '.uuid') {
        uuids.push(filename)
    }
})

var first_load = true
c.player_window.on('loaded', function playerWindowLoaded() {
    document.body.style.cursor = 'normal'
    document.body.style.cursor = 'none'
    // c.log.info('window loaded')
    // c.player_window.removeListener('loaded', playerWindowLoaded)
    if (!first_load) {
        return
    }
    first_load = false
    c.player_window.show()
    c.player_window.focus()
    if (uuids.length === 1) {
        c.__SCREEN_ID = uuids[0].slice(0,-5)
        run()
    } else if (uuids.length === 0) {
        // document.styleSheets[1].rules[0].style.cursor = 'normal'
        // document.body.style.cursor = 'normal'
        createUUID(function createUUID_cb(id, key) {
            // document.styleSheets[1].rules[0].style.cursor = 'none'
            // document.body.style.cursor = 'none'
            alert('ID: ' + id + '<br/>KEY: ' + key)
            c.__SCREEN_ID = id
            c.__API_KEY = key
            run()
        })
    } else if (uuids.length > 1) {
        // document.styleSheets[1].rules[0].style.cursor = 'normal'
        // document.body.style.cursor = 'normal'
        chooseUUID(uuids, function chooseUUID_cb(id) {
            // document.styleSheets[1].rules[0].style.cursor = 'none'
            // document.body.style.cursor = 'none'
            c.__SCREEN_ID = id
            run()
        })
    }
})




function startDigester(err, data) {
    if (err) {
        c.log.info('startDigester err:', err, data)
        // player.tcIncr()
        setTimeout(function() {
            process.exit(0)
        }, 300)
        return
    }
    // c.log.info('loader.countLoadingProcesses(): ' + loader.countLoadingProcesses())
    if (loader.countLoadingProcesses() > 0) {
        // c.log.info('Waiting for loaders to calm down. Active processes: ' + loader.countLoadingProcesses())
        return
    }
    window.c.log.info('Reached stable state. Flushing metadata and starting preprocessing elements.')
    fs.writeFileSync('elements.debug.json', stringifier(loader.swElementsById))


    // var doTimeout = function() {
    //     player.tcIncr()
    //     CheckInToEntu(null, 'last-update', function CheckInCB(err, interval, sw_screen) {
    //         if (err) {
    //             c.log.info(err)
    //         }
    //         // c.log.info('"Last updated" registered with interval ' + helper.msToTime(interval) + ' ' + interval)
    //         var color = 'green'
    //         if (1000 * c.__UPDATE_INTERVAL_SECONDS / interval < 0.9) {
    //             color = 'orange'
    //         } else if (1000 * c.__UPDATE_INTERVAL_SECONDS / interval < 0.3) {
    //             color = 'red'
    //         }
    //
    //         if (sw_screen.result.properties['health'].values !== undefined) {
    //             sw_screen.result.properties['health'].values.forEach(function(item) {
    //                 EntuLib.removeProperty(c.__SCREEN_ID, 'sw-screen-' + 'health', item.id, function(err, sw_screen) {
    //                     if (err) {
    //                         c.log.info('RegisterHealth err:', (item), (err), (sw_screen))
    //                     }
    //                 })
    //             })
    //         }
    //
    //         var options = {'health': '<span style="color:' + color + ';">' + helper.msToTime(interval) + '</span>'}
    //         EntuLib.addProperties(c.__SCREEN_ID, 'sw-screen', options, function(err, data) {
    //             if (err) {
    //                 c.log.info('RegisterHealth err:', (err))
    //             }
    //         })
    //     })
    //     setTimeout(function() {
    //         // c.log.info('RRRRRRRRRRR: Pinging Entu for news.')
    //         EntuLib.getEntity(c.__SCREEN_ID, function(err, result) {
    //             if (err) {
    //                 c.log.info('Can\'t reach Entu', err, result)
    //             }
    //             else if (result.error !== undefined) {
    //                 c.log.info ('Failed to load from Entu.', result)
    //             } else {
    //                 remote_published = new Date(Date.parse(result.result.properties.published.values[0].value))
    //                 // c.log.info('Remote published: ', remote_published.toJSON())
    //             }
    //
    //             if (remote_published
    //                 && local_published.toJSON() !== remote_published.toJSON()
    //                 && (new Date()).toJSON() > remote_published.toJSON()
    //                 ) {
    //                 c.log.info('Remove local content. Fetch new from Entu!')
    //                 player.clearSwTimeouts()
    //                 local_published = new Date(Date.parse(remote_published.toJSON()))
    //                 loader.reloadMeta(null, startDigester)
    //             } else {
    //                 doTimeout()
    //                 // loader.loadMeta(null, null, c.__SCREEN_ID, c.__STRUCTURE, startDigester)
    //             }
    //         })
    //     }, 1000 * c.__UPDATE_INTERVAL_SECONDS)
    //     // c.log.info('RRRRRRRRRRR: Check for news scheduled in ' + c.__UPDATE_INTERVAL_SECONDS + ' seconds.')
    // }
    // doTimeout()


    function flushMeta(err) {
        if (err) {
            c.log.info('flushMeta err:', err)
            process.exit(99)
        }
        var stacksize = loader.swElements.length
        loader.swElements.every(function(swElement, idx) {
            if (swElement.definition.keyname !== 'sw-media' && swElement.childs.length === 0) {
                c.log.info('Unregister empty element ' + swElement.id)
                unregisterMeta(null, idx, function(err, data) {
                    if (err) {
                        c.log.info('flushMeta err:', err, data)
                    }
                    flushMeta(null)
                })
                return false
            }
            var meta_path = path.resolve(c.__META_DIR, swElement.id + ' ' + swElement.definition.keyname.split('sw-')[1] + '.json')
            fs.writeFileSync(meta_path, stringifier(swElement))
            if(-- stacksize === 0) {
                c.log.info('====== Metadata flushed')
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
        c.log.info('startDOM err:', err, options)
        process.exit(99)
    }
    if (screen_dom_element) { document.body.removeChild(screen_dom_element) }
    c.log.info('====== Start startDOM')
    digest.buildDom(null, function(err, dom_element) {
        screen_dom_element = dom_element
        c.log.info('DOM rebuilt')
    })
    c.log.info('====== Finish startDOM', options)
    player.clearSwTimeouts()
    screen_dom_element.player = new player.SwPlayer(null, screen_dom_element, function(err, data) {
        c.log.info('startDOM err:', err, (data))
        process.exit(99)
    })
    screen_dom_element.player.restart(null, function(err, data) {
        if (err) {
            c.log.error('startDOM err:', err, data)
            c.log.error(err)
            callback(err, data)
        }
    })
    // setTimeout(function() {
    //  process.exit(0)
    // }, 300)
    return
}
