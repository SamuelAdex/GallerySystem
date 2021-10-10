const {Router} = require("express");

let router = Router();

router.get('/', (req, res, next)=>{
    res.render('index', {permission: req.isAuthenticated()})
});

module.exports = router