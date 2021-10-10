const { Router } = require('express');
const {ensureAuth, ensureGuest} = require('../Config/auth')
const User = require('../models/User')
const bcrypt = require('bcryptjs');
const passport = require('passport');


let router = Router()

router.get('/login', ensureGuest, (req, res, next)=>{
    res.render('login', {errors})
});
router.get('/register', ensureGuest, (req, res, next)=>{
    res.render('register', {errors})
})

router.get('/profile/:id', (req, res, next)=>{
    const id = req.params.id
    User.findOne({_id: id})
    .then(user =>{
        res.render('gallery/profile', {errors, user})
    }).catch(err => console.log(errors));
})

//Register POST Request
const errors = [];
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
                           res.redirect('/user/login')
                       })
                       .catch(err => console.log(errors));
               }))

           }
       })
    }
})

/* Update User Profile */
router.put('/update/:id', ensureAuth, (req, res, next)=>{
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


//Login Route
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/gallery/create_gallery',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

module.exports = router;