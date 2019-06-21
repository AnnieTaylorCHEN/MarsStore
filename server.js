if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
//import library
const path = require('path')
const express = require('express')
const app = express()

//import routes
const storeRouter = require('./routes/store')
const fansRouter = require('./routes/fans')
const contactRouter = require('./routes/contact')
const loginRouter = require('./routes/login')

//set views
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended: true}))

//set routes
app.use('/store', storeRouter)
app.use('/fans', fansRouter)
app.use('/contact', contactRouter)
app.use('/login', loginRouter)

//Connecting to mongoose and mongodb
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true, dbName: 'marsstore' } )
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))
console.log(process.env.DATABASE_URL)

//port
const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})