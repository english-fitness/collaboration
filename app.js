/**
 * Module dependencies.
 */
application = (function () {
    var SECRET = 'daykem11';

    var express = require('express'),
        bodyParser = require('body-parser')
        session = require('express-session'),
        cookieParser = require('cookie-parser'),
        errorhandler = require('errorhandler'),
        passport = require("passport"),
        passportSocketIo = require("passport.socketio"),
        busboy = require('connect-busboy'),
        fs = require('fs'),
        log4js = require('log4js'),
        _ = require('underscore');


    var collaboration = require('./server/collaboration');

    var env = process.env.NODE_ENV || 'development',
        config = require('./config/config')[env];

    var redisClient = require("redis").createClient(config['db']['port'], config['db']['host']),
        RedisStore = require ( 'connect-redis' ) ( session ),
        sessionStore = new RedisStore ({client: redisClient});

    if (config['db']['pw']){
        redisClient.auth(config['db']['pw']);
    }

    var app = module.exports = express();

    var server = require('http').createServer(app);
    var io = require('socket.io').listen(server);


    log4js.configure("./config/log4js.json");


    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    // Register ejs to handle html files
    app.engine('html', require('ejs').renderFile);
    app.use(cookieParser());
    app.use(session({
        store: sessionStore,
        secret: SECRET,
        maxAge: 60000 * 60 * 12, // 12 hours
    }));


    app.use(function(req, res, next) {
        if (req.url.slice(-4).toLowerCase() == 'pdfx') {
            req.url = req.url.slice(0, -1);
        }
        next();
    });

    app.use(express.static(__dirname + '/public'));

    app.use(bodyParser());
    app.use(log4js.connectLogger(log4js.getLogger('access')));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(busboy({ fileHwm: 4 * 1024 * 1024, highWaterMark: 4 * 1024 * 1024 }));

    app.use(errorhandler(config['expressErrorHandlerOptions']));
    process.on('uncaughtException', function (err) {
        var logger = log4js.getLogger('error');
        logger.fatal(err.stack);
        process.exit(1)
    });

    server.listen(config['port']);
    io.set('logger', log4js.getLogger('socket'))
    io.set('log level', log4js.levels.WARN);
    io.set('authorization', passportSocketIo.authorize({
        cookieParser: cookieParser,
        secret: SECRET,
        store: sessionStore,
        passport: passport,
        success: collaboration.onAuthorizeSuccess,
        fail: collaboration.onAuthorizeFail,
    }));

    console.log(config['app']['name'] + " server listening on port " + config['port']);

    collaboration.collaborate(io, config);

    // get built css and js files
    if(config['optimized']) {
         var files = fs.readdirSync('./public/built/');
        _(files).each(function(file) {
            if(file.indexOf('.js') > -1){
                if (file.indexOf('hangouts') > -1){
                    config['hangouts-js'] = file;
                } else if (file.indexOf('main') > -1) {
                    config['main-js'] = file;
                }
            }
            else if(file.indexOf('.css') > -1) config['css'] = file
        });
    }

    require('./config/database')(redisClient, app);
    require('./config/routes')(app, passport, config);
    require('./config/passport')(passport, config);

}).call(this);
