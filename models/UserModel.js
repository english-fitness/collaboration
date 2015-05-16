var nohm = require(__dirname+'/../node_modules/nohm/lib/nohm.js').Nohm;
var logger = require('log4js').getLogger('debug');

/**
 * Model definition of a User
 */
var userModel = module.exports = nohm.model('User', {
    idGenerator: 'increment',
    properties: {
        userId: {
            type: 'number',
            unique: true,
            index: true,
            validations: [
                ['notEmpty']
            ]
        },
        email: {
            type: 'string',
            validations: [
                ['notEmpty'],
                ['email']
            ]
        },
        firstname: {
            type: 'string',
            validations: [
                ['notEmpty']
            ]
        },
        lastname: {
            type: 'string',
            validations: [
                ['notEmpty']
            ]
        },
        gender: {
            type: 'string',
            validations: [
                ['notEmpty']
            ]
        },
        profile_picture: {
            type: 'string',
        },
        role: {
            type: 'string',
            validations: [
                ['notEmpty']
            ]
        },
    },
    methods: {

    // custom methods we define here to make handling this model easier.

    /**
     * You can specify a data array that might come from the user and an array containing the fields that should be used from used from the data.
     * Optionally you can specify a function that gets called on every field/data pair to do a dynamic check if the data should be included.
     * The principle of this might make it into core nohm at some point.
     */
    fill: function (data, fields) {
        var props = {},
            self = this;

        fields = Array.isArray(fields) ? fields : Object.keys(data);

        fields.forEach(function (i) {
            props[i] = data[i];
        });

        this.p(props);
        return props;
    },


    /**
     * This is a wrapper around fill and save.
     */
    store: function (data, callback) {
        var self = this;

        this.fill(data);
        this.save(function () {
        callback.apply(self, Array.prototype.slice.call(arguments, 0));
        });
    },
    linkBoard: function(whiteBoard, userId, unLink, callback) {
        this.find({userId:userId}, function(err,ids) {
            if (err){
            }
            else{
                this.load(ids[0], function (err, props) {
                    if (err) {
                        return err;
                    } else {

                        logger.debug(":::" + props);
                    }
                    whiteBoard.load(whiteBoard.id, function(id) {
                    });
                    if(unLink)   {
                      var self = this;
                      self.unlink(whiteBoard, 'ownedBoard');
                      whiteBoard.unlink(self, 'userOwned');
                      if (callback) callback();
              }
                    else{
                       this.link(whiteBoard, 'ownedBoard');
                       whiteBoard.link(this, 'userOwned');
                    }
                    this.save(function(err) {
                        if (err) {
                            logger.debug(err);
                        }
                        else {
                    whiteBoard.save(function(err) {});
                            logger.debug("relation is saved");
                        }
                    });
                });
            }
        });
    },
    }
});
