module.exports = {
    ensureAuth: function(req, res, next){
        if(req.isAuthenticated()){
            return next()
        }else{
            res.redirect('/user/login')
        }
    },

    ensureGuest: function(req, res, next){
        if(req.isAuthenticated()){
            res.redirect('/gallery/create_gallery')
        }else{
            return next()
        }
    }
}