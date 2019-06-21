const fs = require('fs')
const express = require('express')
const router = express.Router()

//fans page
router.get('/', (req, res) =>{
    fs.readFile('fans.json', (error, data) =>{
        if (error){
            res.status(500).end()
        } else {
            res.render('fans.ejs', {fans: JSON.parse(data)})
        } 
    })
})

router.post('/', (req, res) => {
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

module.exports = router