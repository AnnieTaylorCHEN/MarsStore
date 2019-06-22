if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
//import library
const path = require('path')
const express = require('express')
const app = express()
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
require('./config/passport')(passport)

//import routes
const storeRouter = require('./routes/store')
const fansRouter = require('./routes/fans')
const contactRouter = require('./routes/contact')
const userRouter = require('./routes/users')

//set views
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))

//set body-parser
app.use(express.urlencoded({extended: true}))

//express-session
app.use(session({
    secret: '30stomars',
    resave: true,
    saveUninitialized: true
  }))

//passport set up
app.use(passport.initialize())
app.use(passport.session())

// Connect flash
app.use(flash())
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error = req.flash('error')
    next()
}) 

//set routes
app.use('/store', storeRouter)
app.use('/fans', fansRouter)
app.use('/contact', contactRouter)
app.use('/users', userRouter)

app.get('*', (req, res) => {
    res.render('404')
})

//Connecting to mongoose and mongodb
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true, dbName: 'marsstore' } )
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))
console.log(process.env.DATABASE_URL)

//port
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})