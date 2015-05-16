var nohm = require(__dirname + '/../node_modules/nohm/lib/nohm.js').Nohm;
var logger = require('log4js').getLogger('debug');

/**
 * Model definition of a Shapes
 */
var shapesModel = module.exports = nohm.model('Shapes', {
    idGenerator: 'increment',
    properties: {
        boardId: {
            type: 'string',
            index: true,
            validations: [
                'notEmpty'
            ]
        },
        shapeId: {
            type: 'string',
            unique: true,
            index: true,
            validations: [
                'notEmpty'
            ]
        },
        palette: {
            type: 'string',
            index: true,
            validations: [
                'notEmpty'
            ]
        },
        action: {
            type: 'string',
            index: true,
            validations: [
                'notEmpty'
            ]
        },
        modifiedBy: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        path: {
            type: 'string',
        },
        args: {
            type: 'json',
            validations: [
                'notEmpty'
            ]
        },
        page: {
            type: 'number',
            index: true,
        },
        type: {
            type: 'string',
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
            this.save(function (err) {
                callback.apply(self, Array.prototype.slice.call(arguments, 0));
            });
        },

        /**
         * This is a wrapper around fill and save.
         */
        delete: function (data, callback) {
            var self = this;
            this.fill(data);
            this.remove();
        },

        loadByShapeId: function(shapeId, fn) {
            this.find(
                { shapeId: shapeId},
                function (err, ids) {
                    if(ids.length != 1) {
                        var err = 'Expected 1, found ' + ids.length + 'shapes for (shapeId):' + shapeId ;
                        nohm.logError(err);
                        fn(err);
                    } else {
                        this.load(ids[0], fn);
                    }
                });
        }
    }
});
