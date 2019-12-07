const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

const userSchema = new Schema ({
    
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique:true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid');
            }
        }
    },

    password: {
        type: String,
        required: true
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;
