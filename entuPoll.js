var op              = require('object-path')
var entulib         = require('./code/entulib.js')
var c               = require('./code/c.js')
var util            = require('util')
var EventEmitter    = require('events').EventEmitter



SWLookup = function() {
    EventEmitter.call(this)
}
util.inherits(SWLookup, EventEmitter)

SWLookup.prototype.poll = function(datetime) {
    this.emit('has news')
}

module.exports = SWLookup

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
