if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const express = require('express')
const app = express()
const fs = require('fs')
const stripe = require('stripe')(stripeSecretKey)

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))


app.get('/store', (req, res) => {
    fs.readFile('items.json', (error, data) => {
        if (error){
            res.status(500).end()
        } else {
            res.render('store.ejs', {
               stripePublicKey: stripePublicKey,
               items: JSON.parse(data)
            })
        }
    })
})

app.post('/purchase', (req, res) => {
    fs.readFile('items.json', (error, data) => {
        if (error){
            res.status(500).end()
        } else {
            const itemsJson = JSON.parse(data)
            const itemsArray = itemsJson.music.concat(itemsJson.merch)
            let total = 0
            req.body.items.forEach((item) => {
                const itemJson = itemsArray.find((i) => i.id == item.id)
                 total = total + itemJson.price * item.quantity   
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
        }
    })
})

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

app.listen(3000)