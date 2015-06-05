var NwBuilder = require('node-webkit-builder')
var nw = new NwBuilder({
    files: [
        '../Screenwerk/node_modules/**',
        '../Screenwerk/imgs/**',
        '../Screenwerk/code/**',
        '../Screenwerk/index.html',
        '../Screenwerk/package.json',
        ], // use the glob format
    platforms: ['linux'],
    buildDir: '../Screenwerk/bin',
    cacheDir: '../nwbuilder/cache',
    // platforms: ['osx32','win32','linux'],
    version: '0.8.6',
    // version: '0.11.6',
    macZip: true,
    appVersion: true,
    macIcns: '../Screenwerk/imgs/sw.icns'
})

//Log stuff you want

nw.on('log',  console.log)

// Build returns a promise
nw.build().then(function () {
   console.log('all done!')
}).catch(function (error) {
    console.error(error)
})
