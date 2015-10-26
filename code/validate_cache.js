var async           = require('async')
var helper          = require('./helper.js')
var op              = require('object-path')


var main = function main(meta, root_eid, callback) {
    helper.log('Before validation', JSON.stringify(meta.get(['by_eid', root_eid]), null, 4))
    // helper.log('Start')
    if (!root_eid) {
        return callback('Can\'t validate without root entity ID.')
    }
    var timed_definitions = ['sw-schedule', 'sw-playlist', 'sw-playlist-media', 'sw-media']

    var series_fa = []

    series_fa.push(function removeExpired(callback) {
        var unrelate = function unrelate(eid1, eid2, callback) {
            if (eid2) {
                meta.del(['by_eid', eid1, 'childs', String(eid2)])
                meta.del(['by_eid', eid1, 'parents', String(eid2)])
                meta.del(['by_eid', eid2, 'childs', String(eid1)])
                meta.del(['by_eid', eid2, 'parents', String(eid1)])
            } else {
                Object.keys(meta.get(['by_eid', eid1, 'childs'], [])).forEach(function(child_eid) {
                    meta.del(['by_eid', child_eid, 'parents', String(eid1)])
                    meta.del(['by_eid', child_eid, 'parents', String(eid1)])
                })
                Object.keys(meta.get(['by_eid', eid1, 'parents'], [])).forEach(function(parent_eid) {
                    meta.del(['by_eid', parent_eid, 'childs', String(eid1)])
                    meta.del(['by_eid', parent_eid, 'childs', String(eid1)])
                })
                meta.del(['by_eid', eid1, 'parents'])
                meta.del(['by_eid', eid1, 'childs'])
            }
            if (callback) {
                callback()
            }
        }
        var uncache = function uncache(eid, callback) {
            unrelate(eid, null, function() {
                meta.del(['by_eid', eid])
                callback()
            })
        }
        var isExpired = function isExpired(valid_to_datestring) {
            if (!valid_to_datestring) return false
            var now_datestring = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
            if (new Date(now_datestring).getTime() < new Date(valid_to_datestring).getTime()) {
                return true
            }
            return false
        }

        async.forEachOf(meta.get(['by_eid'], {}), function(entity, eid, callback) {
            if (timed_definitions.indexOf(meta.get(['by_eid', eid, 'definition'])) > -1
            && isExpired(meta.get(['by_eid', eid, 'properties', 'valid-to', 'value']))) {
                return uncache(eid, callback)
            }
            callback()
        }, function (err) {
            if (err) {
                return callback(err)
            }
            callback()
        })
    })
    series_fa.push(function setAllInvalid(callback) {
        Object.keys(meta.get('by_eid')).forEach(function(eid) {
            meta.set(['by_eid', String(eid), 'is_valid'], false)
        })
        callback(null)
    })
    series_fa.push(function addDefinitionDimension(callback) {
        Object.keys(meta.get('by_eid')).forEach(function(eid) {
            var def = meta.get(['by_eid', eid, 'definition'])
            meta.set(['by_def', def, String(eid)], meta.get(['by_eid', eid]))
        })
        callback(null)
    })
    series_fa.push(function addHierarchyDimension(callback) {
        var childsRec = function childsRec(item, callback) {
            helper.log(item.id, JSON.stringify(Object.keys(meta.get(['by_eid', item.id, 'childs'], {}))))
            async.each(Object.keys(meta.get(['by_eid', item.id, 'childs'], {})), function iterator(eid, callback) {
                var child = {
                    id: eid,
                    definition: meta.get(['by_eid', eid, 'definition']),
                    childs:[]
                }
                // helper.log(JSON.stringify(child))
                item.childs.push(child)
                childsRec(child, callback)
            }, function final(err) {
                if (err) {
                    helper.log('Error:', err)
                    return callback(err)
                }
                callback()
            })
        }
        var root = {
            id: root_eid,
            definition: meta.get(['by_eid', root_eid, 'definition']),
            childs: []
        }
        // helper.log(JSON.stringify(root))
        childsRec(root, function final(err) {
            if (err) {
                helper.log('Error:', err)
                return callback(err)
            }
            meta.set(['hierarchy'], root)
            callback()
        })
    })
    series_fa.push(function markValid(callback) {
        var _markValid = function _markValid(eid, callback) {
            meta.set(['by_eid', String(eid), 'is_valid'], true)
            async.each(Object.keys(meta.get(['by_eid', eid, 'parents'], {})), function (eid, callback) {
                helper.log('if valid ' + eid + ': ' + meta.get(['by_eid', String(eid), 'is_valid']))
                if (meta.get(['by_eid', String(eid), 'is_valid'])) {
                    helper.log(eid + ' already valid.')
                    return callback()
                }
                helper.log('Lets mark valid ' + eid)
                _markValid(eid, callback)
            }, function final(err) {
                if (err) {
                    helper.log('Error:', err)
                    return callback(err)
                }
                callback()
            })
        }
        // helper.log(JSON.stringify(meta.get(), null, 4))
        async.each(meta.get('by_eid'), function iterator(item, callback) {
            if (item.definition !== 'sw-media') return callback()
            _markValid(item.id, callback)
        }, function final(err) {
            if (err) {
                helper.log('Error:', err)
                return callback(err)
            }
            callback()
        })
    })
    series_fa.push(function markExpiration(callback) {
        Object.keys(meta.get(['by_eid'], {})).forEach(function(eid) {
            if (timed_definitions.indexOf(meta.get(['by_eid', eid, 'definition'])) > -1) {
                if (valid_to = meta.get(['by_eid', eid, 'properties', 'valid-to', 'value'], false)) {
                    Object.keys(meta.get(['by_eid', eid, parents])).forEach(function(parent_eid) {
                        if (meta.get(['by_eid', parent_eid, 'expires_at'], false) === false
                        || new Date(valid_to).getTime() < new Date(meta.get(['by_eid', parent_eid, 'expires_at']).getTime())) {
                            meta.set(['by_eid', String(parent_eid), 'expires_at'], valid_to)
                        }
                    })
                }
            }
        })
        callback()
    })

    async.series(series_fa, function (err) {
        if (err) {
            return callback(err)
        }
        helper.log('After validation', JSON.stringify(meta.get(['by_eid', root_eid]), null, 4))
        // helper.log('cache validated', JSON.stringify(meta.get(), null, 4))
        callback()
    })
}

module.exports = main
