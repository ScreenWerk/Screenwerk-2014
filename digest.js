// 1. Core modules
var path            = require('path')
var fs              = require('fs')


// 2. Public modules from npm
var later           = require("later")


// 3. Own modules
var stringifier     = require('./stringifier.js')
var c               = require('./c.js')
var loader          = require('./loader.js')


var document = window.document
// var update_interval_ms = 10 * 60 * 1000 // set default update interval to 10 minutes

console.log('Load function processElements')
function processElements(err, callback) {
    if (err) {
        console.log('processElements err:', err)
        process.exit(0)
        return
    }
    // console.log(loader.swElements.length)
    console.log('====== Start processElements')
    var stacksize = loader.swElements.length
    loader.swElements.forEach(function(swElement) {
        // console.log('Processing ' + swElement.definition.keyname + ':' + swElement.id + ' - ' + swElement.displayname)
        switch (swElement.definition.keyname) {
            case 'sw-screen':
            break
            case 'sw-screen-group':
            break
            case 'sw-configuration':
            break
            case 'sw-schedule':
                var sched = later.parse.cron(swElement.properties.crontab.values[0].db_value)
                if (swElement.properties['valid-from'].values !== undefined) {
                    var startDate = swElement.properties['valid-from'].values[0].db_value
                    var startTime = (startDate.getTime())
                    sched.schedules[0].fd_a = [startTime]
                }
                if (swElement.properties['valid-to'].values !== undefined) {
                    var endDate = new Date(swElement.properties['valid-to'].values[0].db_value)
                    var endTime = (endDate.getTime())
                    sched.schedules[0].fd_b = [endTime]
                }
                swElement.laterSchedule = later.schedule(sched)
            break
            case 'sw-layout':
            break
            case 'sw-layout-playlist':
            break
            case 'sw-playlist':
                var loop = false
                // If any of parent LayoutPlaylist's has loop == true, then loop the playlist
                swElement.parents.forEach(function(parent_eid) {
                    if (loader.swElementsById[parent_eid].properties.loop.values !== undefined)
                        if (loader.swElementsById[parent_eid].properties.loop.values[0].db_value === 1)
                            loop = true
                })
                // Sort playlist-medias by ordinal
                swElement.childs.sort(function compare(a,b) {
                    return loader.swElementsById[a].properties.ordinal.values[0].db_value - loader.swElementsById[b].properties.ordinal.values[0].db_value
                })
                if (swElement.properties.animate !== undefined && swElement.properties.animate.values !== undefined) {
                    for (var i = 0; i < swElement.childs.length; i++) {
                        loader.swElementsById[swElement.childs[i]].animate = {
                            "begin": swElement.properties.animate.values[0].begin,
                            "end": swElement.properties.animate.values[0].end
                        }
                    }

                }
                for (var i = 0; i < swElement.childs.length; i++) {
                    if (i === 0) {
                        if (loop) {
                            loader.swElementsById[swElement.childs[0]].prev = swElement.childs[swElement.childs.length - 1]
                        }
                        loader.swElementsById[swElement.childs[i]].next = swElement.childs[i + 1]
                    }
                    if (i === swElement.childs.length - 1) {
                        loader.swElementsById[swElement.childs[i]].prev = swElement.childs[i - 1]
                        if (loop) {
                            loader.swElementsById[swElement.childs[i]].next = swElement.childs[0]
                        }
                    }
                    if (i > 0 && i < swElement.childs.length - 1) {
                        loader.swElementsById[swElement.childs[i]].prev = swElement.childs[i - 1]
                        loader.swElementsById[swElement.childs[i]].next = swElement.childs[i + 1]
                    }
                }
            break
            case 'sw-playlist-media':
            break
            case 'sw-media':
                if (swElement.properties['valid-from'].values !== undefined) {
                    var db_value = swElement.properties['valid-from'].values[0].db_value
                    var parentSwElement = loader.swElementsById[swElement.parents[0]]
                    if (parentSwElement.properties['valid-from'].values === undefined) {
                        parentSwElement.properties['valid-from'].values = [{"db_value":db_value}]
                    } else {
                        var parent_db_value = parentSwElement.properties['valid-from'].values[0].db_value
                        parentSwElement.properties['valid-from'].values[0].db_value = Math.max(parent_db_value, db_value)
                    }
                }
                if (swElement.properties['valid-to'].values !== undefined) {
                    var db_value = swElement.properties['valid-to'].values[0].db_value
                    var parentSwElement = loader.swElementsById[swElement.parents[0]]
                    if (parentSwElement.properties['valid-to'].values === undefined) {
                        parentSwElement.properties['valid-to'].values = [{"db_value":db_value}]
                    } else {
                        var parent_db_value = parentSwElement.properties['valid-to'].values[0].db_value
                        parentSwElement.properties['valid-to'].values[0].db_value = Math.min(parent_db_value, db_value)
                    }
                }

            break
            default:
                callback('Unrecognised definition: ' + swElement.definition.keyname, swElement)
                return
        }
        // console.log('Processed ' + swElement.definition.keyname + ':' + swElement.id + ' - ' + swElement.displayname)
        var meta_path = path.resolve(c.__META_DIR, swElement.id + ' ' + swElement.definition.keyname.split('sw-')[1] + '.json')
        fs.writeFileSync(meta_path, stringifier(swElement))

        if(-- stacksize === 0) {
            console.log('====== Finish processElements')
            callback(null, 'No more data')
        }
    })
}

console.log('Load function buildDom')
function buildDom(err, callback) {
    if (err) {
        console.log('buildDom err:', err)
        process.exit(0)
        return
    }

    var createDomRec = function createDomRec(eid, parent_dom_id) {
        // console.log(eid, parent_dom_id)
        var dom_element = document.createElement('div')
        var swElement = loader.swElementsById[eid]
        if (swElement === undefined) {
            console.log('Error: Missing element eid=' + eid, util.inspect(loader.swElementsById, {'depth':null}))
            callback('Error: Missing element eid=' + eid)
            return
        }
        var parentSwElement = loader.swElementsById[swElement.parents[0]]
        // console.log(stringifier(dom_element))
        // console.log(eid)
        dom_element.id = parent_dom_id === undefined ? eid : parent_dom_id + '_' + eid
        dom_element.className = swElement.definition.keyname
        dom_element.style.display = 'none'
        // dom_element.style.border = 'dashed 1px green'
        // dom_element.style.position = 'relative'
        var unit = '%'
        dom_element.style.width = '100%'
        dom_element.style.height = '100%'
        dom_element.style['z-index'] = '1'
        if (swElement.properties['zindex'] !== undefined)
            if (swElement.properties['zindex'].values !== undefined)
                dom_element.style['z-index'] = swElement.properties['zindex'].values[0].db_value
        if (swElement.properties['in-pixels'] !== undefined)
            if (swElement.properties['in-pixels'].values !== undefined)
                if (swElement.properties['in-pixels'].values[0].db_value === 1)
                    unit = 'px'
        if (swElement.properties.width !== undefined)
            if (swElement.properties.width.values !== undefined) {
                dom_element.style.position = 'absolute'
                // dom_element.style.border = '2px solid red'
                dom_element.style.padding = '0px'
                dom_element.style.width = swElement.properties.width.values[0].db_value + unit
            }
        if (swElement.properties.height !== undefined)
            if (swElement.properties.height.values !== undefined) {
                dom_element.style.position = 'absolute'
                // dom_element.style.border = '2px solid red'
                dom_element.style.padding = '0px'
                dom_element.style.height = swElement.properties.height.values[0].db_value + unit
            }
        if (swElement.properties.left !== undefined)
            if (swElement.properties.left.values !== undefined) {
                dom_element.style.position = 'absolute'
                // dom_element.style.border = '2px solid red'
                dom_element.style.padding = '0px'
                dom_element.style.left = swElement.properties.left.values[0].db_value + unit
            }
        if (swElement.properties.top !== undefined)
            if (swElement.properties.top.values !== undefined) {
                dom_element.style.position = 'absolute'
                // dom_element.style.border = '2px solid red'
                dom_element.style.padding = '0px'
                dom_element.style.top = swElement.properties.top.values[0].db_value + unit
            }
        // console.log(stringifier(dom_element.style.cssText))

        dom_element.swElement = swElement
        swElement.childs.forEach(function(child_eid){
            var child_node = createDomRec(child_eid, dom_element.id)
            console.log(stringifier(child_eid))
            dom_element.appendChild(child_node)
        })

        if (swElement.definition.keyname !== 'sw-media')
            return dom_element
        // We are here because we have media!
        var mediatype = swElement.properties.type.values === undefined ? '#NA' : swElement.properties.type.values[0].value
        var media_dom_element = {}

        if (mediatype === 'Video') {
            media_dom_element = document.createElement('VIDEO')
            var filename = swElement.properties.file.values[0].value
            var mimetype = 'video/' + filename.split('.')[filename.split('.').length-1]
            media_dom_element.type = mimetype
            // console.log(mimetype)
            media_dom_element.src = swElement.properties.filepath.values[0].db_value
            media_dom_element.overflow = 'hidden'
            dom_element.appendChild(media_dom_element)
            media_dom_element.autoplay = false
            media_dom_element.controls = c.__DEBUG_MODE
            media_dom_element.muted = parentSwElement.properties.mute.values[0].db_value === 1

        } else if (mediatype === 'Flash') {
            media_dom_element = document.createElement('EMBED')
            // console.log(util.inspect(swElement.properties.filepath.values[0]))
            media_dom_element.src = swElement.properties.filepath.values[0].db_value
            media_dom_element.type = 'application/x-shockwave-flash'
            // media_dom_element.type = 'application/vnd.adobe.flash-movie'
            dom_element.appendChild(media_dom_element)

        } else if (mediatype === 'Image') {
            media_dom_element = document.createElement('IMG')
            // console.log(util.inspect(swElement.properties.filepath.values[0]))
            media_dom_element.src = swElement.properties.filepath.values[0].db_value
            dom_element.appendChild(media_dom_element)

        } else if (mediatype === 'URL') {
            media_dom_element = document.createElement('IFRAME')
            // console.log(util.inspect(swElement.properties.filepath.values[0]))
            media_dom_element.src = swElement.properties.url.values[0].db_value
            media_dom_element.width = '100%'
            media_dom_element.height = '100%'
            media_dom_element.scrolling = 'no'
            dom_element.appendChild(media_dom_element)
            // var ifrst = media_dom_element.contentWindow.document.body.style
            // ifrst.overflow = 'hidden'
        } else {
            dom_element.appendChild(document.createTextNode(mediatype + ' ' + entity.definition.keyname + ': ' + entity.id))
        }
        return dom_element
    }
    console.log('Start createDomRec')
    var screen_dom_element = createDomRec(c.__SCREEN_ID)
    // var scrdom = document.findElementByID(c.__SCREEN_ID)
    // scrdom.delete()
    document.body.appendChild(screen_dom_element)
    callback(null, screen_dom_element)
    console.log('Finish createDomRec')
}


module.exports.processElements = processElements
module.exports.buildDom = buildDom