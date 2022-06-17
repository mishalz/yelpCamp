if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}


const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi')
const app = express()
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const localStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')

//for storing our sessions in mongo
const mongoDBSession = require('connect-mongo')

//<--------- routes --------->
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/review')
const userRoutes = require('./routes/users')

//<----- requiring models ----->
const Campground = require('./models/campground')
const Review = require('./models/review')
const User = require('./models/user')

//<----- mongo connection ----->
const DbUrl = process.env.CLOUD_DATABASE_URL || 'mongodb://127.0.0.1:27017/yelp-camp'
//cloudDbUrl
async function main() {
    await mongoose.connect(DbUrl, {
        useNewUrlParser: true, //have removed UseCreateIndex: true
        useUnifiedTopology: true
    })
    console.log('connection successful')

}
main().catch(err => console.log(err));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];



//<-------- middlewares ------->
const { urlencoded } = require('express')
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dnfym5uci/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],

        },
    })
);

const secret = process.env.CLOUDINARY_SECRET || 'secretfornow'
const store = new mongoDBSession({
    mongoUrl: DbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR!", e)
})

const configOpt = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(configOpt))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


//<-------- our routes -------->
app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")

    next()
})
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'something went wrong'
    res.status(statusCode).render('error', { err })
})

//<----- server listening ----->
app.listen(8000, () => {
    console.log('listening on port 8000')
})

