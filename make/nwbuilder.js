var NwBuilder = require('node-webkit-builder')
var nw = new NwBuilder({
    files: [
        '../node_modules/**',
        '../imgs/**',
        '../code/**',
        '../index.html',
        '../package.json',
        ], // use the glob format
    // platforms: ['linux'],
    buildDir: '../bin',
    platforms: ['osx32','win32','linux'],
    // version: '0.8.6',
    // version: '0.11.6',
    version: '0.12.3',
    macZip: true,
    appVersion: true,
    macIcns: '../imgs/sw.icns'
})

//Log stuff you want

nw.on('log',  console.log)

// Build returns a promise
nw.build().then(function () {
   console.log('all done!')
}).catch(function (error) {
    console.error(error)
})
