var async           = require('async')
var fs              = require('fs')
var helper          = require('./helper.js')
var gui             = global.window.nwDispatcher.requireNwGui()
// var gui             = require('nw.gui')
var path            = require('path')
var uuid            = require('node-uuid')
var events          = require('events')

var c               = require('./c.js')

var main = function getUUID(callback) {
    helper.log('Start')
    var uuids = []
    fs.readdirSync(c.__HOME_PATH).forEach(function scanHome(filename) {
        if (filename.substr(-5) === '.uuid') {
            uuids.push(filename)
        }
    })
    // helper.log('UUIDs: ' + JSON.stringify(uuids, null, 2))

    var player_window = gui.Window.get()
    player_window.on('loaded', function playerWindowLoaded() {
        window.document.body.style.cursor = 'normal'
        window.document.body.style.cursor = 'none'
        helper.log('window loaded')
        player_window.removeListener('loaded', playerWindowLoaded)
        player_window.show()
        player_window.focus()
        if (uuids.length === 1) {
            c.__SCREEN_ID = parseInt(uuids[0].slice(0,-5))
            c.__API_KEY = fs.readFileSync(path.join(c.__HOME_PATH, uuids[0]), 'utf8')
            helper.log('UUID: ' + c.__SCREEN_ID)
            helper.log('KEY: ' + c.__API_KEY)
            callback()
        } else if (uuids.length === 0) {
            // document.styleSheets[1].rules[0].style.cursor = 'normal'
            // document.body.style.cursor = 'normal'
            createUUID(function createUUID_cb(id, key) {
                // document.styleSheets[1].rules[0].style.cursor = 'none'
                // document.body.style.cursor = 'none'
                helper.log('ID: ' + id + '<br/>KEY: ' + key)
                alert('ID: ' + id + '<br/>KEY: ' + key)
                c.__SCREEN_ID = id
                c.__API_KEY = key
                run()
            })
        } else if (uuids.length > 1) {
            // document.styleSheets[1].rules[0].style.cursor = 'normal'
            // document.body.style.cursor = 'normal'
            chooseUUID(uuids, function chooseUUID_cb(eid, key) {
                c.__SCREEN_ID = parseInt(eid)
                c.__API_KEY = key
                helper.log('UUID: ' + c.__SCREEN_ID)
                helper.log('KEY: ' + c.__API_KEY)
                callback()
            })
        }
    })

    // callback()
}


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
    window.document.getElementById('chooseUUID').style.display = 'block'
    for (i=0; i<uuids.length; i++) {
        var eid = parseInt(uuids[i].slice(0,-5))

        var id_element = window.document.createElement('span')
        id_element.appendChild( window.document.createTextNode(eid) )
        id_element.setAttribute('eid', eid)
        id_element.setAttribute('key', fs.readFileSync(path.join(c.__HOME_PATH, uuids[i]), 'utf8'))
        id_element.onclick = function chooseUUID_chosen() {
            window.document.getElementById('chooseUUID').style.display = 'none'
            helper.log('chose ' + this.getAttribute('eid') + '|' + this.getAttribute('key'))
            callback(this.getAttribute('eid'), this.getAttribute('key'))
        }
        window.document.getElementById('chooseUUID').appendChild(id_element)
    }
}

module.exports = main
