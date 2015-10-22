var async           = require('async')
var fs              = require('fs')
var helper          = require('./helper.js')
var path            = require('path')
var op              = require('object-path')

var entu            = require('./entu.js')
var c               = require('./c.js')
var swmeta          = require('./swmeta.js')

var tmpmeta = op({})
var main = function cacheFromEntu(reloadPlayerCB, callback) {
    helper.log('Start')

    var cache_changed = false
    // var cache_changed = true


    var fetchScreen = function fetchScreen(callback) {
        // helper.log('Fetch screen ' + c.__SCREEN_ID)
        entu.get_entity(c.__SCREEN_ID, null, null, function(err, screen_e) {
            if (err) {
                helper.log('Caching screen failed', err)
                callback(err)
                return
            }
            // helper.log(JSON.stringify(screen_e.get(), null, 4))
            var screen_changed = !Boolean(swmeta.get(['by_eid', c.__SCREEN_ID, 'properties', 'entu-changed-at', 'value']) === screen_e.get(['properties', 'entu-changed-at', 'value']))
            helper.log('screen' + c.__SCREEN_ID + (screen_changed ? ' cached.' : ' not changed.'))
            cache_changed = Boolean(cache_changed || screen_changed)
            if (screen_changed) {
                tmpmeta.set([c.__SCREEN_ID], screen_e.get())
            }
            var screen_group_eid = screen_e.get(['properties', 'screen-group', 'reference'])
            fetchScreenGroup(screen_group_eid, callback)
        })
    }

    var fetchScreenGroup = function fetchScreenGroup(screen_group_eid, callback) {
        // helper.log('Fetch screen-group ' + screen_group_eid)
        entu.get_entity(screen_group_eid, null, null, function(err, screen_group_e) {
            if (err) {
                helper.log('Caching screen-group failed', err)
                callback(err)
                return
            }
            // helper.log(JSON.stringify(screen_group_e.get(), null, 4))
            var screen_group_changed = !Boolean(swmeta.get(['by_eid', screen_group_eid, 'properties', 'entu-changed-at', 'value']) === screen_group_e.get(['properties', 'entu-changed-at', 'value']))
            helper.log('screen_group ' + screen_group_eid + (screen_group_changed ? ' cached.' : ' not changed.'))
            cache_changed = Boolean(cache_changed || screen_group_changed)
            if (screen_group_changed) {
                tmpmeta.set([screen_group_eid], screen_group_e.get())
            }
            var configuration_eid = screen_group_e.get(['properties', 'configuration', 'reference'])
            fetchConfigurationAndSchedules(configuration_eid, callback)
        })
    }

    var fetchConfigurationAndSchedules = function fetchConfigurationAndSchedules(configuration_eid, callback) {
        // helper.log('Fetch configuration ' + configuration_eid)
        // helper.log(JSON.stringify(swmeta.get(), null, 4))
        entu.get_entity(configuration_eid, null, null, function(err, configuration_e) {
            // helper.log('Got configuration')
            if (err) {
                helper.log('Caching configuration ' + configuration_eid + ' failed', err)
                callback(err)
                return
            }
            // helper.log(JSON.stringify(configuration_e.get(), null, 4))
            var configuration_changed = !Boolean(swmeta.get(['by_eid', configuration_eid, 'properties', 'entu-changed-at', 'value']) === configuration_e.get(['properties', 'entu-changed-at', 'value']))
            helper.log('configuration ' + configuration_eid + (configuration_changed ? ' cached.' : ' not changed.'))
            cache_changed = Boolean(cache_changed || configuration_changed)
            if (configuration_changed) {
                tmpmeta.set([configuration_eid], configuration_e.get())
            }
            entu.get_childs(configuration_eid, 'sw-schedule', null, null, function(err, schedule_ea) {
                // helper.log('Got schedules')
                if (err) {
                    helper.log('Reading schedules failed', err)
                    callback(err)
                    return
                }
                // helper.log(JSON.stringify(schedule_ea.map(function(schedule_e) {return schedule_e.get()}), null, 4))
                async.eachLimit(schedule_ea, 1,
                    function scheduleIterator(schedule_e, callback) {
                        // helper.log(JSON.stringify(schedule_e.get(), null, 4))
                        var schedule_eid = schedule_e.get('id')
                        var schedule_changed = !Boolean(swmeta.get(['by_eid', schedule_eid, 'properties', 'entu-changed-at', 'value']) === schedule_e.get(['properties', 'entu-changed-at', 'value']))
                        helper.log('schedule ' + schedule_eid + (schedule_changed ? ' cached.' : ' not changed.'))
                        cache_changed = Boolean(cache_changed || schedule_changed)
                        tmpmeta.set([configuration_eid, 'schedules', String(schedule_eid)], schedule_eid)
                        if (schedule_changed) {
                            tmpmeta.set([schedule_eid], schedule_e.get())
                        }
                        var layout_eid = schedule_e.get(['properties', 'layout', 'reference'])
                        fetchLayoutAndLayoutPlaylist(layout_eid, callback)
                    },
                    function(err) {
                        if (err) {
                            helper.log('Caching schedules failed', err)
                            callback(err)
                            return
                        }

                          //==========================================//
                         // NB: main exit point for your convinience //
                        //==========================================//
                        swmeta.set('by_eid', tmpmeta.get())
                        if (cache_changed) {
                            fs.writeFileSync(c.__HOME_PATH + '/meta_' + c.__SCREEN_ID + '.json', JSON.stringify(swmeta.get(), null, 4))
                            helper.log('Cache changed - reload player.')
                            reloadPlayerCB(callback)
                        } else {
                            helper.log('Still waters.')
                            callback()
                        }
                    }
                )
            })
        })
    }

    var fetchLayoutAndLayoutPlaylist = function fetchLayoutAndLayoutPlaylist(layout_eid, callback) {
        // helper.log('Fetch layout ' + layout_eid)
        // helper.log(JSON.stringify(swmeta.get(), null, 4))
        entu.get_entity(layout_eid, null, null, function(err, layout_e) {
            // helper.log('Got layout')
            if (err) {
                helper.log('Caching layout ' + layout_eid + ' failed', err)
                callback(err)
                return
            }
            // helper.log(JSON.stringify(layout_e.get(), null, 4))
            var layout_changed = !Boolean(swmeta.get(['by_eid', layout_eid, 'properties', 'entu-changed-at', 'value']) === layout_e.get(['properties', 'entu-changed-at', 'value']))
            helper.log('layout ' + layout_eid + (layout_changed ? ' cached.' : ' not changed.'))
            cache_changed = Boolean(cache_changed || layout_changed)
            if (layout_changed) {
                tmpmeta.set([layout_eid], layout_e.get())
            }
            entu.get_childs(layout_eid, 'sw-layout-playlist', null, null, function(err, layout_playlist_ea) {
                // helper.log('Got layout-playlists')
                if (err) {
                    helper.log('Reading layout-playlists failed', err)
                    callback(err)
                    return
                }
                // helper.log(JSON.stringify(layout_playlist_ea.map(function(layout_playlist_e) {return layout_playlist_e.get()}), null, 4))
                async.eachLimit(layout_playlist_ea, 1,
                    function layoutPlaylistIterator(layout_playlist_e, callback) {
                        // helper.log(JSON.stringify(layout_playlist_e.get(), null, 4))
                        var layout_playlist_eid = layout_playlist_e.get('id')
                        var layout_playlist_changed = !Boolean(swmeta.get(['by_eid', layout_playlist_eid, 'properties', 'entu-changed-at', 'value']) === layout_playlist_e.get(['properties', 'entu-changed-at', 'value']))
                        helper.log('layout_playlist ' + layout_playlist_eid + (layout_playlist_changed ? ' cached.' : ' not changed.'))
                        cache_changed = Boolean(cache_changed || layout_playlist_changed)
                        tmpmeta.set([layout_eid, 'layout-playlists', String(layout_playlist_eid)], layout_playlist_eid)
                        if (layout_playlist_changed) {
                            tmpmeta.set([layout_playlist_eid], layout_playlist_e.get())
                        }
                        var playlist_eid = layout_playlist_e.get(['properties', 'playlist', 'reference'])
                        fetchPlaylistAndPlaylistMedia(playlist_eid, callback)
                    },
                    function(err) {
                        if (err) {
                            helper.log('Caching layout-playlists failed', err)
                            callback(err)
                            return
                        }
                        callback() // to fetchConfigurationAndSchedules
                    }
                )
            })
        })
    }

    var fetchPlaylistAndPlaylistMedia = function fetchPlaylistAndPlaylistMedia(playlist_eid, callback) {
        // helper.log('Fetch playlist ' + playlist_eid)
        // helper.log(JSON.stringify(swmeta.get(), null, 4))
        entu.get_entity(playlist_eid, null, null, function(err, playlist_e) {
            // helper.log('Got playlist')
            if (err) {
                helper.log('Caching playlist ' + playlist_eid + ' failed', err)
                callback(err)
                return
            }
            // helper.log(JSON.stringify(playlist_e.get(), null, 4))
            var playlist_changed = !Boolean(swmeta.get(['by_eid', playlist_eid, 'properties', 'entu-changed-at', 'value']) === playlist_e.get(['properties', 'entu-changed-at', 'value']))
            helper.log('playlist ' + playlist_eid + (playlist_changed ? ' cached.' : ' not changed.'))
            cache_changed = Boolean(cache_changed || playlist_changed)
            if (playlist_changed) {
                tmpmeta.set([playlist_eid], playlist_e.get())
            }
            entu.get_childs(playlist_eid, 'sw-playlist-media', null, null, function(err, playlist_media_ea) {
                // helper.log('Got playlist-medias')
                if (err) {
                    helper.log('Reading playlist-medias failed', err)
                    callback(err)
                    return
                }
                // helper.log(JSON.stringify(playlist_media_ea.map(function(playlist_media_e) {return playlist_media_e.get()}), null, 4))
                async.eachLimit(playlist_media_ea, 1,
                    function playlistMediaIterator(playlist_media_e, callback) {
                        // helper.log(JSON.stringify(playlist_media_e.get(), null, 4))
                        var playlist_media_eid = playlist_media_e.get('id')
                        var playlist_media_changed = !Boolean(swmeta.get(['by_eid', playlist_media_eid, 'properties', 'entu-changed-at', 'value']) === playlist_media_e.get(['properties', 'entu-changed-at', 'value']))
                        helper.log('playlist_media ' + playlist_media_eid + (playlist_media_changed ? ' cached.' : ' not changed.'))
                        cache_changed = Boolean(cache_changed || playlist_media_changed)
                        tmpmeta.set([playlist_eid, 'playlist-medias', String(playlist_media_eid)], playlist_media_eid)
                        if (playlist_media_changed) {
                            tmpmeta.set([playlist_media_eid], playlist_media_e.get())
                        }
                        var media_eid = playlist_media_e.get(['properties', 'media', 'reference'])
                        fetchMedia(media_eid, callback)
                    },
                    function(err) {
                        if (err) {
                            helper.log('Caching layout-playlists failed', err)
                            callback(err)
                            return
                        }
                        callback() // to fetchConfigurationAndSchedules
                    }
                )
            })
        })
    }

    var fetchMedia = function fetchMedia(media_eid, callback) {
        // helper.log('Fetch media ' + media_eid)
        // helper.log(JSON.stringify(swmeta.get(), null, 4))
        entu.get_entity(media_eid, null, null, function(err, media_e) {
            // helper.log('Got media')
            if (err) {
                helper.log('Caching media ' + media_eid + ' failed', err)
                callback(err)
                return
            }
            // helper.log(JSON.stringify(media_e.get(), null, 4))
            // helper.log(JSON.stringify(swmeta.get(['by_eid', media_eid, 'properties', 'entu-changed-at', 'value']), null, 4) + ' ?= ' + JSON.stringify(media_e.get(['properties', 'entu-changed-at', 'value']), null, 4))
            var media_changed = !Boolean(swmeta.get(['by_eid', media_eid, 'properties', 'entu-changed-at', 'value']) === media_e.get(['properties', 'entu-changed-at', 'value']))
            helper.log('media ' + media_eid + (media_changed ? ' cached.' : ' not changed.'))
            cache_changed = Boolean(cache_changed || media_changed)
            if (media_changed) {
                tmpmeta.set([media_eid], media_e.get())
            }
            callback() // to fetchPlaylistAndPlaylistMedia
        })
    }

    fetchScreen(callback)
}


module.exports = main
