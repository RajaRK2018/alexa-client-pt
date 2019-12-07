const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resultSchema = new Schema ({
    
    id: {
        type: string,
        required: true
    },
    
    scenario: {
        type: String,
        required: true
    },

    startTime: {
        type: Date,
        required: true
    },

    endTime: {
        type: Date,
        required: true
    },

    runState: {
        type: String,
        required: true
    },

    resultSet: [{
        intentName: {
            type: String,
            required: true
        },

        utterText: {
            type: String,
            required: true
        },

        min: {
            type: Number,
            required: true
        },

        avg: {
            type: Number,
            required: true
        },

        max: {
            type: Number,
            required: true
        },

        curr: {
            type: Number,
            required: true
        },

        pass: {
            type: String,
            required: true
        },

        fail: {
            type: String,
            required: true
        },

        sla: {
            type: Number,
            required: true
        },

        slaCompliance: {
            type: String,
            required: true
        },

        resultData: [{

            intentName: {
                type: String,
                required: true
            },

            utterText: {
                type: String,
                required: true
            },

            finalTranscripts: {
                type: String,
                required: true
            },

            assertiontext: {
                type: String,
                required: true
            },

            assertionstatus: {
                type: String,
                required: true
            },

            sla: {
                type: Number,
                required: true
            },

            timeToSpeechStart: {
                type: Number,
                required: true
            },

            retrycount: {
                type: Number,
                required: true
            }
        }]
    }]
})

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;