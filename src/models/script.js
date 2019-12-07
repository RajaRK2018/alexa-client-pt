const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scriptSchema = new Schema({

    scriptName: {
        type: String,
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    intents: [{

        intentName: {
            type: String,
            required: true
        },

        utterances: [{
            
            utterText: {
                type: String,
                required: true
            },
        
            assertiontext: {
                type: String,
                required: true
            },
        
            sla: {
                type: Number,
                required: true
            },
        
            wakeWord: {
                type: String
            } 
        }]

    }]

})

const Script = mongoose.model('Script', scriptSchema);

module.exports = Script;