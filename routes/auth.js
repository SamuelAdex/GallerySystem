const { Router } = require('express')
const passport = require('passport')
const {ensureAuth, ensureGuest} = require('../Config/auth')


let router = Router();

//Auth with Google
//Get /auth/google/callback
router.get('/google', passport.authenticate('google', {scope: ['profile']}));

//Auth Callback
//Get /auth/google/callback
router.get('/google/callback', passport.authenticate('google', {failureRedirect: '/login'}), (req, res)=>{
    req.flash('success_msg', 'User Logged In Successfully!!!')
    res.redirect('/gallery/create_gallery')
});

//Logout Get route
router.get('/logout', (req, res, next)=>{
    req.logout()
    req.flash('success_msg', 'User Logged Out Successfully!!!')
    res.redirect('/user/login')
});

module.exports = router