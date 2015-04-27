var nohm = require(__dirname+'/../node_modules/nohm/lib/nohm.js').Nohm;

/**
 * Model definition of a Message
 */
var messageModel = module.exports = nohm.model('Message', {
    idGenerator: 'increment',
    properties: {
    boardId: {
        type: 'string',
        index: true,
        validations: [
        'notEmpty'
        ]
    },
    createdBy: {
        type: 'string',
        validations: [
        'notEmpty'
        ]
    },
    message: {
        type: 'string',
        validations: [
        'notEmpty'
        ]
    },
    createdTime: {
        type: 'timestamp',
        validations: [
        'notEmpty'
        ]
    }
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
    }
});
