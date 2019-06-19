if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const path = require('path')
const express = require('express')
const app = express()
const fs = require('fs')
const stripe = require('stripe')(stripeSecretKey)
const nodemailer = require('nodemailer')
const Product = require('./models/products')

const port = process.env.PORT || 3000

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended: true}))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true, dbName: 'marsstore' } )
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))
console.log(process.env.DATABASE_URL)

//Store page
app.get('/store', async (req, res) => {
    let items
    try {
        if(!req.query.category) {
            items = await Product.find({})
        } else {
            items = await Product.find({category: req.query.category})
        }

        if(req.query.sortBy) {
            let sort ={}
            const sortByArray = req.query.sortBy.split(':')
            sort[sortByArray[0]] =[sortByArray[1]]
            items = await Product.find().sort(sort).exec()
        }

        res.render('store.ejs', { 
            stripePublicKey: stripePublicKey,
            items: items })
    } catch {
        items = []
    }
})


app.get('/purchase', async (req, res) => {
    let items
    try {
        items = await Product.find()
    } catch {
        items = []
    }
    res.render('cart.ejs',  { 
        stripePublicKey: stripePublicKey,
        items: items })
})

app.post('/purchase', async (req, res) => {

    let items
    try {
        items = await Product.find()
    } catch {
        items = []
    }
    let total = 0
    req.body.items.forEach((item) => {
            const itemFromDatabase = items.find((i) => i.id == item.id)
            total = total + itemFromDatabase.price * item.quantity   
        })
        
        stripe.charges.create({
            amount: total,
            source: req.body.stripeTokenId,
            currency: 'usd'
        }).then(() => {
            console.log('charge successful')
            res.json({message:'successfully purchased items'})
        }).catch(()=> {
            console.log('charge fail')
            res.status(500).end()
        })
})

//fans page
app.get('/fans', (req, res) =>{
    fs.readFile('fans.json', (error, data) =>{
        if (error){
            res.status(500).end()
        } else {
            res.render('fans.ejs', {fans: JSON.parse(data)})
        } 
    })
})

app.post('/fans', (req, res) => {
    fs.readFile('fans.json', (error, data)=>{
        if (error) {
            res.status(500).end()
        } else{
            const fansObj = JSON.parse(data)
            fansObj.comments.push(req.body)
            fs.writeFile('fans.json', JSON.stringify(fansObj), (error) =>{
                if (error){
                    console.log(error)
                } else{
                    console.log('write successfully!')
                }
            })
        }
    })
})

//Contact page
app.get('/contact', (req, res) => {
    res.render('contact.ejs')
})

app.post('/send', (req, res) => {
    const output = `
    <h2>Hello, we have received your contact request, and we will get back to you quickly!</h2>
    <h2>Yours, <h2>
    <h2>Mars Store</h2>
    <hr />
    <h3>Contact Details From You</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `
   // create reusable transporter object with the default SMTP transport
   let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'hiamynmax@gmail.com', // generated ethereal user
            pass: process.env.NODEMAILERPW  // generated ethereal password
        },
        // tls:{
        // rejectUnauthorized:false
        // }
     })

    // setup email data with unicode symbols
    let mailOptions = {
    from: '"Mars Store Customer Support" <hiamynmax@gmail.com>', // sender address
    to: req.body.email, // list of receivers
    subject: 'We receive your request - Mars Store', // Subject line
    html: output // html body
    }

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error)
    }
    console.log("Message sent: %s", info.messageId)
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    res.render('contact.ejs', { Msg:'Email has been sent!'} )
})

})


//port
app.listen(port, ()=>{
    console.log('Server is up on port ' + port)
})