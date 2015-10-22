var async           = require('async')
var fs              = require('fs')
var helper          = require('./helper.js')
var path            = require('path')

var main = function reloadPlayer(callback) {
    helper.log('Start')
    callback()
}

module.exports = main
