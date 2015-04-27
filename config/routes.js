var path = require('path');
module.exports = function(app, passport, config){

    var ConnectRoles = require('connect-roles'),
        roles = new ConnectRoles({failureHandler: function (req, res, action) {
                if(req.params['boardId']) {
                    res.redirect(config['baseUrl'] + 'login/' + req.params['boardId']);
                } else {
                    res.status(403).send('Forbidden!');
                }
            }
        });

    app.use(roles.middleware());

    var routes = require('./../routes').init(config);

    roles.use('anonymous', function(req, action) {
        if(!req.isAuthenticated()) return true;
    });

    roles.use('user', function(req, action) {
        if(req.isAuthenticated()) return true;
    });

    // test users can access all pages
    roles.use(function (req) {
        if (req.isAuthenticated() && req.user.role === 'role_test') {
            return true;
        }
    });

    app.get("/", roles.is('anonymous'), routes.index);
    app.post("/logintest"
        ,passport.authenticate('local',{
            successRedirect : config['baseUrl'],
            failureRedirect : config['baseUrl'],
        })
    );
    app.get("/login/:boardId", function(req, res, next) {
        passport.authenticate('php',{
            successRedirect : config['baseUrl'] + "boards/"+req.params.boardId,
            failureRedirect : '/',
        })(req, res, next);
    });

    app.get('/logout', function(req, res, next){
        req.logout();
        res.redirect('/');
    });

    app.get('/401', roles.is('anonymous'), function(req, res, next){
        var file = path.resolve(__dirname + '/../views/401.html');
        res.status(401);
        res.sendfile(file);
    });

    app.post('/boards', roles.is('tester'), routes.boards.create);
    app.post('/boards/createtab', roles.is('user'), routes.boards.createTab);
    app.post('/boards/removetab', roles.is('user'), routes.boards.removeTab);
    app.post('/boards/update', roles.is('tester'), routes.boards.update);
    app.post('/remove', roles.is('tester'), routes.boards.remove);
    app.post('/upload', roles.is('user'), routes.upload);
    app.post('/removefile', roles.is('user'), routes.removeFile);
    app.get('/listuploaded', roles.is('user'), routes.listUploaded);
    app.get('/boards/:boardId', roles.is('user'), routes.boards.show);
    app.get('/api/create', routes.api.create);
    app.get('/api/update', routes.api.update);
    app.get('/api/remove', routes.api.remove);
    app.get('*', function(req, res){
         var file = path.resolve(__dirname + '/../views/404.html');
        res.status(404);
        res.sendfile(file);
    });
}