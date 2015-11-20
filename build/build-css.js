({
    preserveLicenseComments: false,
    optimize: "uglify2",
    uglify2: {
        compress : {
            global_defs : {
                DEBUG : false
            }
        },
        mangle : true
    },
    optimizeCss: "standard",
    cssIn: "../public/stylesheets/main.css",
    out: "../public/built/main.css"
})