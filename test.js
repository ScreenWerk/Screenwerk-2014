var EntuLib     = require('./entulib/entulib.js')
var fs       = require('fs')
var util       = require('util')
var https       = require('https')
var crypto = require('crypto')
var querystring = require('querystring')


var entu_user_key = '0a5848b0-6022-11e4-8e34-b5dc0dc3af45'
var entu_user_id = 2426
var entu_url = 'piletilevi.entu.ee'

var __create_policy = function __create_policy(entu_query) {
    var conditions = []
    var entu_query = entu_query === undefined ? {} : entu_query
    var conditions = Object.keys(entu_query).map(function(v) { return entu_query[v] })
    var expiration_time = new Date()
    expiration_time.setMinutes(expiration_time.getMinutes() + 15)
    var policy = { 'expiration': expiration_time.toISOString(), 'conditions': conditions }
    policy = JSON.stringify(policy)
    encoded_policy = new Buffer(new Buffer(policy).toString('utf8')).toString('base64')
    var signature = crypto.createHmac('sha1', entu_user_key).update(encoded_policy).digest().toString('base64')
    entu_query.policy = encoded_policy
    entu_query.user = entu_user_id
    entu_query.signature = signature
    return querystring.stringify(entu_query)
}

var __submit_it = function __submit_it(path, method, data, callback) {
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
            var returned_data = JSON.parse(str)
            callback(returned_data)
        })
    })
    if (data !== undefined) {
        // console.log(typeof data + ' . ' + util.inspect(data))
        request.write(data)
    }
    request.end()
}

var addFile = function addFile (entity_id, property_definition, abspath, callback) {
    if (!fs.existsSync(abspath))
        callback({'Error':'No such file','Path':abspath})
    var entu_query = {
        'filename': abspath,
        'entity': entity_id,
        'property': property_definition
    }
    var data = __create_policy(entu_query)
    var path = '/api2/file?' + data
    file_contents = fs.readFileSync(abspath)
    __submit_it(path, 'POST', file_contents, callback)
}


// -----------
var EntuLib = new EntuLib(entu_user_id, entu_user_key, entu_url)

EntuLib.getEntity(entu_user_id, function (result) {
    if (result.error !== undefined) {
        console.log(util.inspect(result, {depth:null}))
        console.log('Failed to access screen ' + entu_user_id + ' in Entu. Terminating')
        throw new Error(result.error)
    }
    console.log('Success on getEntity: ' + util.inspect(result))
})

EntuLib.getReferrals(entu_user_id, function (result) {
    if (result.error !== undefined) {
        console.log(util.inspect(result, {depth:null}))
        console.log('Failed to access screen ' + entu_user_id + ' in Entu. Terminating')
        throw new Error(result.error)
    }
    console.log('Success on getReferrals: ' + util.inspect(result))
})

EntuLib.addFile(entu_user_id, 'sw-screen-log', './test.js', function(response) {
    if (response.error !== undefined) {
        console.log('EntuLib: Upload failed: ' + response.error)
    } else {
        console.log('EntuLib: uploaded.')
    }
})

// EntuLib.addProperties(print_result, 684, 'person', {'email':'foo@bar','user':'zaza@google'})
EntuLib.addProperties(entu_user_id, 'sw-screen', {'key':'foo@bar','name':'zaza@google'}, function(response) {
    if (response.error !== undefined) {
        console.log('Add property failed: ' + response.error)
    } else {
        console.log('Added property.')
    }
})


addFile(entu_user_id, 'sw-screen-log', './test.js', function(response) {
    if (response.error !== undefined) {
        console.log('Upload failed: ' + response.error)
    } else {
        console.log('Uploaded.')
    }
})

