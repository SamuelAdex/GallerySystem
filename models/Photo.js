const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    filename:{
        type: String,
        required: true
    },
    filetype:{
        type: String,
        required: true
    },
    filesize: {
        type: String,
        required: true
    },
    filepath:{
        type: String,
        required: true
    },
    gallery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Photo', photoSchema);