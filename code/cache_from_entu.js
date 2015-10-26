var async           = require('async')
var fs              = require('fs')
var helper          = require('./helper.js')
var path            = require('path')
var op              = require('object-path')

var entu            = require('./entu.js')
var c               = require('./c.js')
var swmeta          = require('./swmeta.js')
var validateCache   = require('./validate_cache.js')


// var tmpmeta = op({'by_eid':{}, 'by_def':{}, 'hierarchy': {}})
var tmpmeta = op({})

var isExpired = function isExpired(valid_to_datestring) {
    if (!valid_to_datestring) return false
    var now_datestring = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    if (new Date(now_datestring).getTime() < new Date(valid_to_datestring).getTime()) {
        return true
    }
    return false
}

var relate = function relate(parent_eid, child_eid) {
    tmpmeta.set(['by_eid', String(parent_eid), 'childs', String(child_eid)], child_eid)
    tmpmeta.set(['by_eid', String(child_eid), 'parents', String(parent_eid)], parent_eid)
}

var main = function cacheFromEntu(reloadPlayerCB, callback) {
    helper.log('Start')

    var fetchScreen = function fetchScreen(callback) {
        helper.log('Fetch screen ' + c.__SCREEN_ID)
        entu.get_entity(c.__SCREEN_ID, null, null, function(err, screen_e) {
            if (err) {
                helper.log('Caching screen failed', err)
                return callback(err)
            }
            // helper.log(JSON.stringify(screen_e.get(), null, 4))
            tmpmeta.set(['by_eid', String(c.__SCREEN_ID)], screen_e.get())
            var screen_group_eid = screen_e.get(['properties', 'screen-group', 'reference'], false)
            if (!screen_group_eid) {
                var err = 'Where\'s my screen group!?'
                return callback(err)
            }
            fetchScreenGroup(screen_group_eid, function(err, not_published) {
                if (err) {
                    return callback(err)
                }
                ////==========================================//
                /// NB: main exit point for your convinience ///
                //==========================================////
                if (not_published === true) {
                    helper.log('No changes published.')
                    return callback()
                }
                validateCache(tmpmeta, c.__SCREEN_ID, function(err) {
                    if (err) {
                        helper.log(err)
                        helper.slackbot.error(err)
                        return callback(err)
                    }
                    swmeta.set('by_eid'   , tmpmeta.get('by_eid'))
                    swmeta.set('by_def'   , tmpmeta.get('by_def'))
                    swmeta.set('hierarchy', tmpmeta.get('hierarchy'))
                    fs.writeFileSync(c.__HOME_PATH + '/meta_' + c.__SCREEN_ID + '.json', JSON.stringify(swmeta.get(), null, 4))
                    helper.log('Cache saved - reload player.')
                    reloadPlayerCB(callback)
                })
            })
        })
    }

    var fetchScreenGroup = function fetchScreenGroup(screen_group_eid, callback) {
        helper.log('Fetch screen-group ' + screen_group_eid)
        entu.get_entity(screen_group_eid, null, null, function(err, screen_group_e) {
            if (err) {
                helper.log('Caching screen-group failed', err)
                return callback(err)
            }
            // helper.log(JSON.stringify(screen_group_e.get(), null, 4))
            helper.log(screen_group_e.get(['properties', 'published', 'value'], '-'), swmeta.get(['by_eid', screen_group_eid, 'properties', 'published', 'value'], '-'))
            if (screen_group_e.get(['properties', 'published', 'value']) === swmeta.get(['by_eid', screen_group_eid, 'properties', 'published', 'value'])) {
                helper.log('No changes published.')
                // NB: put back in live
                // return callback(null, true)
            }
            helper.log('Screen-group published.')

            tmpmeta.set(['by_eid', String(screen_group_eid)], screen_group_e.get())
            relate(c.__SCREEN_ID, screen_group_eid)
            var configuration_eid = screen_group_e.get(['properties', 'configuration', 'reference'], false)
            if (!configuration_eid) {
                var err = 'Screen group ' + screen_group_eid + ' missing configuration!'
                return callback(err)
            }
            fetchConfigurationAndSchedules(screen_group_eid, configuration_eid, callback)
        })
    }


    var fetchConfigurationAndSchedules = function fetchConfigurationAndSchedules(screen_group_eid, configuration_eid, callback) {
        helper.log('Fetch configuration ' + configuration_eid)
        // helper.log(JSON.stringify(swmeta.get(), null, 4))
        entu.get_entity(configuration_eid, null, null, function(err, configuration_e) {
            // helper.log('Got configuration')
            if (err) {
                helper.log('Caching configuration ' + configuration_eid + ' failed', err)
                return callback(err)
            }
            // helper.log(JSON.stringify(configuration_e.get(), null, 4))
            tmpmeta.set(['by_eid', String(configuration_eid)], configuration_e.get())
            relate(screen_group_eid, configuration_eid)
            entu.get_childs(configuration_eid, 'sw-schedule', null, null, function(err, schedule_ea) {
                // helper.log('Got schedules')
                if (err) {
                    helper.log('Reading schedules failed', err)
                    return callback(err)
                }
                // helper.log(JSON.stringify(schedule_ea.map(function(schedule_e) {return schedule_e.get()}), null, 4))
                async.eachLimit(schedule_ea, 1,
                    function scheduleIterator(schedule_e, callback) {
                        // helper.log(JSON.stringify(schedule_e.get(), null, 4))
                        var schedule_eid = schedule_e.get('id')
                        helper.log('Fetch schedule ' + schedule_eid)

                        if (isExpired(schedule_e.get(['properties', 'valid-to', 'value'], false))) {
                            helper.log('Schedule ' + schedule_eid + ' expired.')
                            return callback()
                        }

                        tmpmeta.set(['by_eid', String(schedule_eid)], schedule_e.get())
                        relate(configuration_eid, schedule_eid)
                        var layout_eid = schedule_e.get(['properties', 'layout', 'reference'], false)
                        if (!layout_eid) {
                            var err = 'Schedule ' + schedule_eid + ' missing layout!'
                            return callback(err)
                        }
                        fetchLayoutAndLayoutPlaylist(schedule_eid, layout_eid, callback)
                    },
                    function(err) {
                        if (err) {
                            helper.log('Caching schedules failed', err)
                            return callback(err)
                        }
                        callback()
                    }
                )
            })
        })
    }

    var fetchLayoutAndLayoutPlaylist = function fetchLayoutAndLayoutPlaylist(schedule_eid, layout_eid, callback) {
        helper.log('Fetch layout ' + layout_eid)
        // helper.log(JSON.stringify(swmeta.get(), null, 4))
        entu.get_entity(layout_eid, null, null, function(err, layout_e) {
            // helper.log('Got layout')
            if (err) {
                helper.log('Caching layout ' + layout_eid + ' failed', err)
                return callback(err)
            }
            // helper.log(JSON.stringify(layout_e.get(), null, 4))
            tmpmeta.set(['by_eid', String(layout_eid)], layout_e.get())
            relate(schedule_eid, layout_eid)
            entu.get_childs(layout_eid, 'sw-layout-playlist', null, null, function(err, layout_playlist_ea) {
                // helper.log('Got layout-playlists')
                if (err) {
                    helper.log('Reading layout-playlists failed', err)
                    return callback(err)
                }
                // helper.log(JSON.stringify(layout_playlist_ea.map(function(layout_playlist_e) {return layout_playlist_e.get()}), null, 4))
                async.eachLimit(layout_playlist_ea, 1,
                    function layoutPlaylistIterator(layout_playlist_e, callback) {
                        // helper.log(JSON.stringify(layout_playlist_e.get(), null, 4))
                        var layout_playlist_eid = layout_playlist_e.get('id')
                        helper.log('Fetch layout-playlist ' + layout_playlist_eid)
                        tmpmeta.set(['by_eid', String(layout_playlist_eid)], layout_playlist_e.get())
                        relate(layout_eid, layout_playlist_eid)
                        var playlist_eid = layout_playlist_e.get(['properties', 'playlist', 'reference'], false)
                        if (!playlist_eid) {
                            var err = 'Layout-playlist ' + layout_playlist_eid + ' missing playlist!'
                            return callback(err)
                        }
                        fetchPlaylistAndPlaylistMedia(layout_playlist_eid, playlist_eid, callback)
                    },
                    function(err) {
                        if (err) {
                            helper.log('Caching layout-playlists failed', err)
                            return callback(err)
                        }
                        callback() // to fetchConfigurationAndSchedules
                    }
                )
            })
        })
    }

    var fetchPlaylistAndPlaylistMedia = function fetchPlaylistAndPlaylistMedia(layout_playlist_eid, playlist_eid, callback) {
        helper.log('Fetch playlist ' + playlist_eid)
        // helper.log(JSON.stringify(swmeta.get(), null, 4))
        entu.get_entity(playlist_eid, null, null, function(err, playlist_e) {
            // helper.log('Got playlist')
            if (err) {
                helper.log('Caching playlist ' + playlist_eid + ' failed', err)
                callback(err)
                return
            }
            // helper.log(JSON.stringify(playlist_e.get(), null, 4))
            if (isExpired(playlist_e.get(['properties', 'valid-to', 'value'], false))) {
                helper.log('Playlist ' + playlist_eid + ' expired.')
                return callback()
            }

            tmpmeta.set(['by_eid', String(playlist_eid)], playlist_e.get())
            relate(layout_playlist_eid, playlist_eid)
            entu.get_childs(playlist_eid, 'sw-playlist-media', null, null, function(err, playlist_media_ea) {
                // helper.log('Got playlist-medias')
                if (err) {
                    helper.log('Reading playlist-medias failed', err)
                    return callback(err)
                }
                // helper.log(JSON.stringify(playlist_media_ea.map(function(playlist_media_e) {return playlist_media_e.get()}), null, 4))
                async.eachLimit(playlist_media_ea, 1,
                    function playlistMediaIterator(playlist_media_e, callback) {
                        // helper.log(JSON.stringify(playlist_media_e.get(), null, 4))
                        var playlist_media_eid = playlist_media_e.get('id')
                        helper.log('Fetch playlist-media ' + playlist_media_eid)

                        if (isExpired(playlist_media_e.get(['properties', 'valid-to', 'value'], false))) {
                            helper.log('Playlist-media ' + playlist_media_eid + ' expired.')
                            return callback()
                        }

                        tmpmeta.set(['by_eid', String(playlist_media_eid)], playlist_media_e.get())
                        relate(playlist_eid, playlist_media_eid)
                        var media_eid = playlist_media_e.get(['properties', 'media', 'reference'])
                        if (!media_eid) {
                            var err = 'Playlist-media ' + playlist_media_eid + ' missing media!'
                            return callback(err)
                        }
                        fetchMedia(playlist_media_eid, media_eid, callback)
                    },
                    function(err) {
                        if (err) {
                            helper.log('Caching layout-playlists failed', err)
                            return callback(err)
                        }
                        callback() // to fetchConfigurationAndSchedules
                    }
                )
            })
        })
    }

    var fetchMedia = function fetchMedia(playlist_media_eid, media_eid, callback) {
        helper.log('Fetch media ' + media_eid)
        // helper.log(JSON.stringify(swmeta.get(), null, 4))
        entu.get_entity(media_eid, null, null, function(err, media_e) {
            // helper.log('Got media')
            if (err) {
                helper.log('Caching media ' + media_eid + ' failed', err)
                return callback(err)
            }
            // helper.log(JSON.stringify(media_e.get(), null, 4))
            // helper.log(JSON.stringify(swmeta.get(['by_eid', media_eid, 'properties', 'entu-changed-at', 'value']), null, 4) + ' ?= ' + JSON.stringify(media_e.get(['properties', 'entu-changed-at', 'value']), null, 4))
            if (isExpired(media_e.get(['properties', 'valid-to', 'value'], false))) {
                helper.log('Media ' + media_eid + ' expired.')
                return callback()
            }

            tmpmeta.set(['by_eid', String(media_eid)], media_e.get())
            relate(playlist_media_eid, media_eid)
            callback() // to fetchPlaylistAndPlaylistMedia
        })
    }


    fetchScreen(function(err) {
        if (err) {
            var message = 'Caching meta failed'
            helper.log(message, err)
            helper.slackbot.error(message, JSON.stringify(err, null, 4))
            return callback(err)
        }
        callback()
    })
}

module.exports = main
