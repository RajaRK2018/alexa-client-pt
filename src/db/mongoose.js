const mongoose = require('mongoose')
const validator = require('validator')

mongoose.connect('mongodb://127.0.0.1:27017/users',{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true    
})

const User = mongoose.model('User',{
    name: {
        type: String,
        required: true
    },

    role: {
        type: String
    },

    email: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid');
            }
        }
    }
})

const me = new User({
    name: 'Kali',
    role: 'User',
    email: 'email@email.com'
})

me.save().then(() => {
    console.log(me)
}).catch((error) => {
    console.log('Error: ' + error)
})