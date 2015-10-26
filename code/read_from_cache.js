var async           = require('async')
var fs              = require('fs')
var helper          = require('./helper.js')
var path            = require('path')
var op              = require('object-path')

var c               = require('./c.js')
var swmeta          = require('./swmeta.js')
var validateCache   = require('./validate_cache.js')

var main = function readFromCache(reloadPlayerCB, callback) {
    helper.log('Start')

    var meta_file = c.__HOME_PATH + '/meta_' + c.__SCREEN_ID + '.json'
    fs.readFile(meta_file, 'utf8', function(err, data) {
        if (err) {
            helper.log('Can\'t read ' + meta_file, err)
            return callback('Can\'t read ' + meta_file)
        }

        data = JSON.parse(data)
        // helper.log(JSON.stringify(data, null, 2))

        if (op.get(data, ['by_eid', c.__SCREEN_ID], false) === false) {
            helper.log(meta_file + ' has taken structural damage!')
            return callback(meta_file + ' has taken structural damage!')
        }
        swmeta.set('by_eid', op.get(data, ['by_eid'], false))
        helper.log('Local cache from ' + c.__HOME_PATH + '/meta_' + c.__SCREEN_ID + '.json found and read.', JSON.stringify(swmeta.get(['by_eid', c.__SCREEN_ID])))

        validateCache(swmeta, c.__SCREEN_ID, function(err) {
            // helper.log('After validation', JSON.stringify(swmeta.get(['by_eid', c.__SCREEN_ID]), null, 4)
            if (err) {
                helper.log(err)
                // helper.slackbot.chatter(err)
                return callback(err)
            }
            reloadPlayerCB(callback)
        })
    })
}

module.exports = main
