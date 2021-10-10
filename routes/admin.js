const {Router} = require('express');
const {ensureAuth, ensureGuest} = require('../Config/auth')
const User = require('../models/User')
const Gallery = require('../models/Gallery')
const Photo = require('../models/Photo')
const multer = require('multer');
const bcrypt = require('bcryptjs');
const cryptr = require('cryptr')
const fs = require('fs')


let router = Router()

let errors = [];
router.get('/login', (req, res, next)=>{
    res.render('admin/adminLog', {errors})
})

router.post('/login', (req, res, next)=>{
    const {email, password} = req.body;
    if(!email || !password){
        errors.push({msg: "Cannot Leave Fields Empty!!!"})
    }

    if(errors.length > 0){
        res.render('admin/adminLog', {errors, email, password})
    }else{
        if(email === "admin123@gmail.com" && password === "admin12345"){
            req.flash('success_msg', 'Admin Logged In Successfully!!!')
            res.redirect('/admin/dashboard')
        }else{
            res.status(404).send('404, Page Not Found!!!')
        }
    }
})


router.get('/dashboard', (req, res, next)=>{
    User.find()
    .then(user =>{
        Gallery.find()
        .then(gallery =>{
            Photo.find()
            .then(photo =>{
                res.render('admin/dashboard', {errors, user, gallery, photo})
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
})


router.get('/users', (req, res, next)=>{
    User.find().sort({createdAt: 'desc'})
    .then(users =>{
        res.render('admin/users', {errors, users})
    })
    .catch((error)=>{
        console.error(`Error:: PostImage === ${error}`)
        res.status(404).send(`404, Page Not Found ${error}`)
    })
})

/* All Galleries */
router.get('/galleries', async (req, res, next)=>{
    try {
        const galleries = await Gallery.find().populate('user').sort({createdAt: 'desc'})
        res.render('admin/galleries', {errors, galleries})
    } catch (error) {
        console.error(`Error:: PostImage === ${error}`)
        res.status(404).send(`404, Page Not Found ${error}`)
    }
    
})


/* Add New User */
router.post('/register', (req, res, next)=>{
    const {firstName, lastName, email, displayName, password, password1} = req.body;

    //Validation of Registration Form
    if(firstName=="" || lastName=="" || email == "" || displayName=="" || password=="" || password1==""){
        errors.push({msg: "Fields can't be Empty!!!"});
    }

    if(password !== password1){
        errors.push({msg: "Password don't match!!!"})
    }

    if(password.length < 6){
        errors.push({msg: "Password must not be less than 8 characters!!!"})
    }


    if(errors.length > 0){
        res.render('register', {errors, displayName, firstName, lastName, password, password1});
        console.log(errors)
    }else{
       //Validation passed
       User.findOne({email: email})
       .then(user =>{
           if(user){
               req.flash("error_msg", "Email Already Registered");
               res.render('register', {
                   errors,
                   displayName,
                   firstName,
                   lastName,
                   email,
                   password,
                   password1
               })
           }else{
               const newUser = new User({
                   displayName: displayName,
                   firstName: firstName,
                   lastName: lastName,
                   email: email,
                   password: password
               });
               
               //Hash Password
               bcrypt.genSalt(10, (err, salt)=> bcrypt.hash(newUser.password, salt, (err, hash)=>{
                   if(err) throw err;
                   //Set password to hashed
                   newUser.password = hash;
                   //Save User
                   newUser.save()
                       .then(user => {
                           req.flash("success_msg", "You are now Registered")
                           res.redirect('/admin/users')
                       })
                       .catch(err => console.log(errors));
               }))

           }
       })
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
            res.redirect('/admin/galleries')
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
            fs.unlink('./public/uploads/'+ image.filename, (err)=>{
                if(err) throw err
            })
            image.delete()
            .then(img=>{
                req.flash('success_msg', 'Gallery Deleted Successfully!!')
                res.redirect('/admin/galleries')
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


router.put('/editUser/:id', (req, res, next)=>{
    const id = req.params.id;
    User.findOneAndUpdate({_id: id})
    .then(user =>{
        if(req.body.password){
            user.firstName = req.body.firstName
            user.lastName = req.body.lastName
            user.email = req.body.email
            user.displayName = req.body.displayName
            user.password = req.body.password
            //Hash Password
            bcrypt.genSalt(10, (err, salt)=> bcrypt.hash(user.password, salt, (err, hash)=>{
                if(err) throw err;
                //Set password to hashed
                user.password = hash;
                //Save User
                user.save()
                .then(users => {
                    req.flash("success_msg", "Profile Updated Successfully!!!")
                    res.redirect('/admin/users')
                })
                .catch(err => console.log(errors));
            })) 
        }else{
            user.firstName = req.body.firstName
            user.lastName = req.body.lastName
            user.email = req.body.email
            user.displayName = req.body.displayName
            
            user.save()  
            .then(users =>{
                req.flash("success_msg", "Profile Updated Successfully!!!")
                res.redirect('/admin/users')
            })
        }
    })
    .catch((error)=>{
        console.error(`Error:: PostImage === ${error}`)
        res.status(404).send(`404, Page Not Found ${error}`)
    })
})

/* DElete User */
router.delete('/delUser/:id', (req, res, next)=>{
    const id = req.params.id;
    User.findOne({_id: id}).populate('galleries')
    .then(user =>{
        if(user.gallery > 0){
            user.gallery.forEach(gall =>{
                gall.remove()            
            })
        }

        user.delete()
        .then(del =>{
            req.flash("success_msg", "User Deleted Successfully!!!")
            res.redirect('/admin/users')
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

module.exports = router;