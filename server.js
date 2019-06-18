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
const Product = require('./models/products')

const port = process.env.PORT || 3000

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended: true}))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true } )
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))


//Sorting by names: A to Z, Z to A
//?SortBy=name:asc A to Z, ?SortBy=name:desc Z to A
//Sorting by price: low to high, high to low
//?SortBy=price:asc low to high, ?SortBy=price:desc high to low
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

app.listen(port, ()=>{
    console.log('Server is up on port ' + port)
})