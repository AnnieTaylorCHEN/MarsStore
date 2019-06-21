const express = require('express')
const Product = require('../models/products')
const router = express.Router()
router.use(express.json())

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const stripe = require('stripe')(stripeSecretKey)

//Store page
router.get('/', async (req, res) => {
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

router.post('/purchase', async (req, res) => {

    let items
    try {
        items = await Product.find()
    } catch {
        items = []
    }
    let total = 0
    req.body.items.forEach((item) => {
            const itemFromDatabase = items.find((i) => i.id == item.id)
            total = total + Math.round(itemFromDatabase.price * 100) * item.quantity   
        })
        
        stripe.charges.create({
            amount: total,
            source: req.body.stripeTokenId,
            currency: 'usd'
        }).then(() => {
            console.log('charge successful')
            res.json({message:'Thank you for your purchase!'})
        }).catch((error)=> {
            console.log('charge fail' + error)
            res.status(500).end()
        })
})

module.exports = router