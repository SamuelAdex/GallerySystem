const mongoose = require('mongoose');


let userSchema = new mongoose.Schema({
    googleId:{
        type: String
    },
    displayName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    role: {
        type: String,
        default: "user",
        required: true
    },
    gallery: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Gallery'
    }],
    photo: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Photo'
    }],
    password: {
        type: String
    },
    image: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);