var async           = require('async')
var fs              = require('fs')
var helper          = require('./helper.js')
var path            = require('path')
var op              = require('object-path')

var c               = require('./c.js')
var swmeta          = require('./swmeta.js')

var main = function readFromCache(reloadPlayerCB, callback) {
    helper.log('Start')

    fs.readFile(c.__HOME_PATH + '/meta.json', 'utf8', function(err, data) {
        if (err) {
            helper.log('err', err)
            return callback()
        }

        data = JSON.parse(data)
        // helper.log(JSON.stringify(data, null, 2))

        if (op.get(data, 'by_eid', false) === false) {
            helper.log('missing by_eid')
            return callback()
        }
        helper.log('setting by_eid')
        swmeta.set('by_eid', op.get(data, 'by_eid', false))
        reloadPlayerCB(callback)
    })
}

module.exports = main
