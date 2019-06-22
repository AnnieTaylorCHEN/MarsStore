const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const passport = require('passport')
const { ensureAuthenticated } = require('../config/auth')

//Sign up page
router.get('/signup', (req, res) => {
    res.render('signup.ejs')
})

router.post('/signup', (req, res) => {
    const { name, email, password, password2 } = req.body
    //validation error msg 
    let errors =[]
    if (!name || !email || !password || !password2){
        errors.push({msg: 'Please fill in all required fields.'})
    }
    if (password !== password2){
        errors.push({msg: 'Sorry, your password does not match. Try again.'})
    }
    if (password.length < 6 ){
        errors.push({msg: 'Your password must be 6 characters or more.'})
    }
    //if there is error, then render the error to provide user feedback
    if (errors.length > 0 ){
        res.render('signup', {
            errors, 
            name, 
            email, 
            password,
            password2
        })
    } else {
        //if validation passed, first see if user exists by matching email 
        User.findOne({email: email})
        .then( user => {
            if (user) {
            //if user exists, render an error message to give user feedback
            errors.push({msg:'Email already registered. Use a new email.'})
            res.render('signup', {
                errors, 
                name, 
                email, 
                password,
                password2
                })
            } else {
                //if user doesn't exist, then save user to database
                const newUser = new User({
                    name, 
                    email, 
                    password
                })
                //generate password hash 
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) =>{
                        if (err) throw err
                        //set password to hashed
                        newUser.password = hash
                        //save user
                        newUser.save()
                        .then( use => {
                            req.flash(
                                'success_msg',
                                'Signed up successfully!'
                              );
                            res.redirect('/users/login')
                        })
                        .catch(err => console.log (err))
                    })
                })
            }
        })
    }
})

//login page
router.get('/login', (req, res) => {
    res.render('login.ejs')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {                    
        successRedirect: '/users/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true 
        })
    (req, res, next)
}) 

//log out handler
router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You have successfully logged out!')
    res.redirect('/users/login')
})

//dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', {
        name: req.user.name
    })
})
module.exports = router