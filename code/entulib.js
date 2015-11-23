var https   = require('https')
var crypto = require('crypto')
var querystring = require('querystring')
var fs       = require('fs')
var request = require('request')


function EntuLib(entu_user_id, entu_user_key, entu_url) {

    var POLICY_EXPIRATION_MINUTES = 15
    var API_VERSION = '/api2/'
    // var returned_data = false

    //
    // Possible values for entu_query =
    //             Fetch entity by id | {}
    //                  Create entity | { 'definition': entitydefinition, ('entitydefinition-propertydefinition':value) }
    //      Search and fetch entities | { 'definition': entitydefinition, 'query': query, 'limit': limit }
    //       PUT properties to entity | { ('entitydefinition-propertydefinition':value) }
    //
    function __create_policy(entu_query) {
        // var conditions = []
        entu_query = entu_query === undefined ? {} : entu_query
        var conditions = Object.keys(entu_query).map(function(v) { return entu_query[v] })
        var expiration_time = new Date()
        expiration_time.setMinutes(expiration_time.getMinutes() + POLICY_EXPIRATION_MINUTES)
        var policy = JSON.stringify({ 'expiration': expiration_time.toISOString(), 'conditions': conditions })
        entu_query.policy = new Buffer(new Buffer(policy).toString('utf8')).toString('base64')
        var signature = crypto.createHmac('sha1', entu_user_key).update(entu_query.policy).digest().toString('base64')
        entu_query.user = entu_user_id
        entu_query.signature = signature
        return querystring.stringify(entu_query)
    }

    function __submit_it(path, method, data, callback) {
        var options = {
            hostname: entu_url,
            path: path,
            port: 443,
            method: method
        }
        if (data !== undefined) {
            data = data.toString()
            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            }
        }
        var buffer = ''
        var request = https.request(options)
        request.on('response', function response_handler(response) {
            response.on('data', function chunk_sticher(chunk) {
                buffer += chunk
            })
            response.on('end', function response_emitter() {
                var str = buffer.toString()
                try {
                    // var returned_data = JSON.parse(str)
                    callback(null, JSON.parse(str))
                }
                catch (err) {
                    console.log('EntuLib err: ', err)
                    callback(err, str)
                    return
                }
            })
        })
        request.on('error', function (e) {
            callback(e)
            return
        })
        if (data !== undefined) {
            // console.log(typeof data + ' . ' + (data))
            request.write(data)
        }
        request.end()
    }

    return {
        getEntity: function (entity_id, callback) {
            var data = __create_policy()
            var path = API_VERSION + 'entity-' + entity_id + '?' + data
            __submit_it(path, 'GET', undefined, callback)
        },
        // definition = property's dataproperty name
        findEntity: function (definition, query, limit, callback) {
            var entu_query = {
                'definition': definition,
                'query': query,
                'limit': limit
            }
            var data = __create_policy(entu_query)
            var path = API_VERSION + 'entity?' + data
            __submit_it(path, 'GET', undefined, callback)
        },
        // Return childs of entity
        getChilds: function (entity_id, callback) {
            var data = __create_policy()
            var path = API_VERSION + 'entity-' + entity_id + '/childs?' + data
            __submit_it(path, 'GET', undefined, callback)
        },
        // Return entity's referrals
        getReferrals: function (entity_id, callback) {
            var data = __create_policy()
            var path = API_VERSION + 'entity-' + entity_id + '/referrals?' + data
            __submit_it(path, 'GET', undefined, callback)
        },
        // definition = property's dataproperty name
        createEntity: function (parent_id, definition, properties, callback) {
            var entu_query = {}
            entu_query.definition = definition
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    entu_query[definition + '-' + key] = properties[key]
                }
            }
            var data = __create_policy(entu_query)
            var path = API_VERSION + 'entity-' + parent_id
            __submit_it(path, 'POST', data, callback)
        },
        // definition = property's dataproperty name
        addProperties: function (entity_id, definition, properties, callback) {
            var entu_query = {}
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    entu_query[definition + '-' + key] = properties[key]
                }
            }
            var data = __create_policy(entu_query)
            var path = API_VERSION + 'entity-' + entity_id
            __submit_it(path, 'PUT', data, callback)
        },
        // definition = property's dataproperty name
        removeProperty: function (entity_id, property_definition, property_id, callback) {
            var entu_query = {}
            entu_query[property_definition + '.' + property_id] = ''
            var data = __create_policy(entu_query)
            var path = API_VERSION + 'entity-' + entity_id
            __submit_it(path, 'PUT', data, callback)
        },
        // property_definition in form of entity_keyname + "-" + property_keyname
        // as for entity with definition "person" and property with definition "photo"
        // property_definition = "person-photo"
        addFile: function (entity_id, property_definition, filename, filetype, filesize, filepath, callback) {

            var entu_query = {
                'entity': entity_id,
                'property': property_definition,
                'filename': filename,
                'filetype': filetype,
                'filesize': filesize
            }
            var data = __create_policy(entu_query)
            var path = API_VERSION + 'file/s3'
            __submit_it(path, 'POST', data, function addFileCB(err, data) {
                if (err) {
                    console.log('addFileCB: Can\'t reach Entu on ' + path)
                    console.log(err)
                    console.log(data)
                    process.exit(99)
                }

                var formData
                try {
                    formData = data.result.s3.data
                } catch (err) {
                    console.log('EntuLib err: ', entu_query, data)
                    console.log('EntuLib err: ', err)
                    // callback(err, str)
                    // return
                }
                // formData = data.result.s3.data
                formData['file'] = fs.createReadStream(filepath)

                request.post({url: data.result.s3.url, formData: formData}, function optionalCallback(err) {
                    if (err) {
                        callback(err, 'Upload failed!')
                    }
                    callback(null, 'Upload successful!')
                })
            })
        }
    }
}

module.exports = EntuLib


// Sample usage

// var print_result = function print_result(data) {
//     console.log(stringifier(data))
// }

// var stringifier = function stringifier(o) {
//     var cache = [];
//     return JSON.stringify(o, function(key, value) {
//         if (typeof value === 'object' && value !== null) {
//             if (cache.indexOf(value) !== -1) {
//                 // Circular reference found, replace key
//                 return 'Circular reference to: ' + key
//             }
//             // Store value in our collection
//             cache.push(value)
//         }
//         return value
//     }, '\t')
// }

// var entu_user_id = 1001
// var entu_user_key = 'Write your Entu key here'
// var entu_url = 'yourdomain.entu.ee'
// var EntuLib = new EntuLib(entu_user_id, entu_user_key, entu_url)
// EntuLib.getEntity(print_result, 684)
// EntuLib.getChilds(print_result, 684)
// EntuLib.getReferrals(print_result, 684)
// EntuLib.findEntity(print_result, 'person', 'test', 10)
// EntuLib.createEntity(print_result, 610, 'person', {'forename':'test3','surname':'test3'})
// EntuLib.addProperties(print_result, 684, 'person', {'email':'foo@bar','user':'zaza@google'})
// EntuLib.addFile(print_result, 684, 'person-photo', '/Users/michelek/Dropbox/Screenshots/penrose_bw.png')
