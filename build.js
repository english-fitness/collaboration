({
    baseUrl: './public/javascripts/storm',
    name: '../main',
    out: './public/built/main.js',
    mainConfigFile: "./public/javascripts/main.js",
    generateSourceMaps: false,
  	preserveLicenseComments: false,
    optimize: "uglify2",
    uglify2: {
	    compress : {
            global_defs : {
                DEBUG : false
            }
        },
        mangle : true
  	}
})