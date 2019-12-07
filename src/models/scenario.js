const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var Script = require('./script.js');

const scenarioSchema = new Schema ({

    iteration: {
        type: Number,
        required: true
    },

    voice: {
        type: String,
        required: true
    },

    volume: {
        type: Number,
        required: true
    },

    rate: {
        type: Number,
        required: true
    },

    pitch: {
        type: Number,
        required: true
    },

    scripts: [{

        script: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Script'

        }
    }],

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

const Scenario = mongoose.model('Scenario', scenarioSchema);

module.exports = Scenario;