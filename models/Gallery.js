const mongoose = require('mongoose');
const slugify = require('slugify');

const gallerySchema = new mongoose.Schema({
    galleryName: {
        type: String,
        required: true
    },
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    photos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Photo'
    }],
    slug: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


gallerySchema.pre('validate', function(next){
    let gallery = `${this.galleryName}_${this.createdAt}`;
    if(this.galleryName){
        this.slug = slugify(gallery, {lower: true, strict: true});
    }
    next()
})

module.exports = mongoose.model('Gallery', gallerySchema);