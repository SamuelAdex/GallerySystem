const {Router} = require('express');
const {ensureAuth, ensureGuest} = require('../Config/auth')
const User = require('../models/User')
const Gallery = require('../models/Gallery')
const Photo = require('../models/Photo')
const multer = require('multer');
const fs = require('fs')

//Initialize Multer
//Setup Multer
let Storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './public/uploads')
    },
    filename: (req, file, cb)=>{        
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
    },    
});


const filefilter = (req, file, cb)=>{
    if(file.mimetype === "image/png" || file.mimetype === 'image/jpg' || file.mimetype === 'image/svg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }else{
        cb(null, false)
    }
}


const upload = multer({storage: Storage, filefilter: filefilter})

let router = Router();


const errors = [];


/* POST Request for Photo Upload */
router.post('/uploads/:slug', upload.single('images'), ensureAuth, async (req, res, next)=>{

    Gallery.findOne({slug: req.params.slug})
    .then(gallery =>{
        const photo = new Photo({
            user: req.user.id,
            filename: req.file.filename,
            filepath: req.file.path,
            filetype: req.file.mimetype,
            filesize: fileSizeFormatter(req.file.size, 2),
            gallery: gallery
        })
        gallery.photos.push(photo)
        gallery.save()
        .then(result =>{
            photo.save()
            .then(files =>{
                req.flash("success_msg", "Image Uploaded Sucessfully")
                res.redirect(`/gallery/gallery/${gallery.slug}`)
            })
            .catch((error)=>{
                console.error(`Error:: PostImage === ${error}`)
                res.status(404).send(`404, Page Not Found ${error}`)
            })
        })
        .catch((error)=>{
            console.error(`Error:: PostImage === ${error}`)
            res.status(404).send(`404, Page Not Found ${error}`)
        })
    })
    .catch((error)=>{
        console.error(`Error:: PostImage === ${error}`)
        res.status(404).send(`404, Page Not Found ${error}`)
    })
    /* const filesArray = [];
    req.files.forEach((element)=>{
        const file = {
            fileName: element.filename,
            filePath: element.path,
            fileType: element.mimetype,
            fileSize: fileSizeFormatter(element.size, 2)
        }

        filesArray.push(file)
    });
    Gallery.findOne({slug: req.params.slug})
    .then(gallery =>{
        const multipleFiles = new Photo({
            user: req.user.id,
            image_url: filesArray,
            gallery: gallery
        })
        gallery.photos.push(multipleFiles)
        gallery.save()
        .then((result)=>{
            multipleFiles.save()
            .then((files)=>{
                req.flash("success_msg", "Image Uploaded Sucessfully")
                res.redirect(`/gallery/gallery/${gallery.slug}`)
            })
            .catch((error)=>{
                console.error(`Error:: PostImage === ${error}`)
                res.status(404).send(`404, Page Not Found ${error}`)
            })
        })
        .catch((error)=>{
            console.error(`Error:: PostImage === ${error}`)
            res.status(404).send(`404, Page Not Found ${error}`)
        })
    })
    .catch((error)=>{
        console.error(`Error:: PostImage === ${error}`)
        res.status(404).send(`404, Page Not Found ${error}`)
    })         */
});


/* DELETE Request For Image */
router.delete('/delete/:id', ensureAuth, (req, res, next)=>{
    Photo.findOne({_id: req.params.id})
    .then((photo)=>{
        Gallery.findOneAndUpdate({photos: req.params.id}, {$pull: {photos: req.params.id}})
        .then((gallery)=>{
            fs.unlink('./public/uploads/' + photo.filename, (err)=>{
                if(err) throw err;
            })
            photo.delete()
            .then((result)=>{
                req.flash('error_msg', 'Image Deleted Successfully!!')
                res.redirect(`/gallery/gallery/${gallery.slug}`)
            })
        })
        .catch((error) =>{
            console.log(`Error:: ${error}`)
            res.status(404).send(`404, Page Not Found ${error}`)
        })
    })
    .catch((error) =>{
        console.log(`Error:: ${error}`)
        res.status(404).send(`404, Page Not Found ${error}`)
    })
})


/* File Size Formatter */
const fileSizeFormatter = (bytes, decimal)=>{
    if(bytes === 0){
        return '0 bytes';
    }
    const dm = decimal || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'YB', 'ZB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + '-' + sizes[index];
}

module.exports = router;