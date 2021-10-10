const express = require("express");
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors');
const dotenv = require('dotenv')
const flash = require("connect-flash")
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')

//Load config files
dotenv.config({path: './Config/config.env'})

//Passport Config
require('./Config/passport')(passport)
require('./Config/passport1')(passport)

//Mongoose Connection
mongoose.connect('mongodb://localhost:27017/gallery_system', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
})
.then(result => console.log("Database Connected Successfully!!!"))
.catch((err) => console.log(`Database Error:: ${err}`))

mongoose.set('useFindAndModify', false)


//Express Initialize
let app = express();
if(process.env.NODE_ENV === "development"){
    app.use(morgan('dev'))
}

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride('_method'))

//Sessions
app.use(session({
    secret: "jhdf667e681873",
    resave: false,
    saveUninitialized: false
}));
//Passport Middle
app.use(passport.initialize())
app.use(passport.session())

//Connect Flash
app.use(flash())
//Global Variable
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
});

app.use(cors());

const indexRouter = require('./routes/index')
app.use('/', indexRouter)

const authRouter = require('./routes/auth')
app.use('/auth', authRouter)

const adminRouter = require('./routes/admin')
app.use('/admin', adminRouter)

const userRouter = require('./routes/user')
app.use('/user', userRouter)

const galleryRouter = require('./routes/gallery')
app.use('/gallery', galleryRouter)

const photoRouter = require('./routes/photo')
app.use('/photo', photoRouter)



//Listening to express Server
let port = process.env.PORT || 4000;
app.listen(port, ()=>{
    console.log(`Running On Port ${port}...`)
})