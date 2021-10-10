const {Router} = require('express');
const {ensureAuth, ensureGuest} = require('../Config/auth')
const User = require('../models/User')
const Gallery = require('../models/Gallery')
const Photo = require('../models/Photo')
const multer = require('multer');

let router = Router();
let errors = [];
router.get('/dashboard', ensureAuth, async (req, res, next)=>{
    const galleries = await Gallery.find({user: req.user.id})
    res.render('Gallery/dashboard', {user: req.user.displayName, errors, galleries: galleries})
})

router.get('/create_gallery', ensureAuth, async (req, res, next)=>{
    const galleries = await Gallery.find({user: req.user.id})
    res.render('Gallery/create_gallery', {user: req.user, permission: req.isAuthenticated(), errors, galleries: galleries})
})

router.get('/galleries', (req, res, next)=>{
    Gallery.find().populate('user')
    .sort({createdAt: 'desc'})
    .then((galleries)=>{
        res.render('gallery/galleries', {permission: req.isAuthenticated(), user: req.user, galleries})
    })
    .catch((error)=>{
        console.error(`Error:: PostImage === ${error}`)
        res.status(404).send(`404, Page Not Found ${error}`)
    })
})

router.get('/photos', async(req, res, next)=>{
    try {
        const photos = await Photo.find()
        res.render('gallery/photos', {permission: req.isAuthenticated(), photos: photos, user: req.user})
    } catch (error) {
        console.error(error);
        res.send("404, Page Not Found!!!");
    }    
})

router.get('/gallery/:slug', ensureAuth, async (req, res)=>{    
    try {
        const gallery = await Gallery.findOne({slug: req.params.slug}).populate('photos')
        const user_gallery = await Gallery.find({user: req.user.id});
        const photo = new Photo();
        const photos = await Photo.find()
        res.render('gallery/gallery', {photos: photos, photo: photo, gallery: gallery, permission: req.isAuthenticated(), galleries: user_gallery, user: req.user, errors})
        
    } catch (error) {
        console.error(`Error:: PostImage === ${error}`)
        res.send(`404, Page Not Found ${error}`) 
    }    
})


//Create_Gallery POST Request
router.post('/createGallery', async (req, res)=>{
    const {galleryName} = req.body;
    if(galleryName == ""){
        req.flash("error_msg", "Field Can't be Empty!!!")
        res.redirect('/gallery/create_gallery')
    }else{
        try {
            
            req.body.user = req.user.id
            await Gallery.create(req.body)
            req.flash('success_msg', `${galleryName} Gallery Created Successfully!!!`)
            res.redirect('/gallery/create_gallery')
            console.log(req.Gallery)
        } catch (error) {
            console.error(`Error:: PostImage === ${error}`)
            res.send(`404, Page Not Found ${error}`) 
        }
    }
})

/* Update Gallery */
router.put('/editGallery/:id', (req, res, next)=>{
    const id = req.params.id
    Gallery.findByIdAndUpdate({_id: id})
    .then(gallery =>{
        gallery.galleryName = req.body.galleryName
        gallery.save()
        .then(gall =>{
            req.flash('success_msg', 'Gallery Updated Successfully!!')
            res.redirect(`/gallery/create_gallery`)
        })
        .catch(error =>{
            console.log(`Error: ${error}`)
            res.status(404).send('404, Page Not Found')
        })
    })
    .catch(error =>{
        console.log(`Error: ${error}`)
        res.status(404).send('404, Page Not Found')
    })
})

/* Delete Gallery */
router.delete('/delGallery/:id', (req, res, next)=>{
    const id = req.params.id
    Gallery.findOneAndDelete({_id: id}).populate('photos')
    .then(gallery =>{
        gallery.photos.forEach(image=>{
            fs.unlink('./public/uploads/' + image.filename, (err)=>{
                if(err) throw err
            })
            image.delete()
            .then(img=>{
                req.flash('success_msg', 'Gallery Deleted Successfully!!')
                res.redirect('/gallery/create_gallery')
            })
            .catch(error =>{
                console.error(`Error:: ${error}`)
                res.status(404).send('404, Page Not Found')
            })
        })
    })
    .catch(error =>{
        console.error(`Error:: ${error}`)
        res.status(404).send('404, Page Not Found')
    })
})


module.exports = router;