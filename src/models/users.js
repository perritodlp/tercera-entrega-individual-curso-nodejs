const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String , 
        required: true
    },
    identificationNumber: { 
        type: Number, 
        required: true 
    },
    phone: { 
        type: Number, 
        required: true 
    },
    userType: {
        type: String, 
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }    
});

const User = mongoose.model('Users', usersSchema);

module.exports = User;