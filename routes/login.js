const express = require('express')
const router = express.Router()

//login page
router.get('/', (req, res) => {
    res.render('login.ejs')
})

module.exports = router