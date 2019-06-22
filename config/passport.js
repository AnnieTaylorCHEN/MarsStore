const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = require('../models/user')

const passportConfig = (passport) => {
    passport.use(
        new LocalStrategy({
            usernameField: 'email'
        }, (email, password, done) => {
            //match user
            User.findOne({email: email})
            .then( user => {
                if (!user) {
                    return done(null, false, { message: 'That email is not registered'})
                }
                //match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err
                    if (isMatch) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: 'Password not matched'})
                    }
                })
            })
            .catch(err => console.log(err))
        })
    )

    passport.serializeUser( (user, done) => {
        done(null, user.id)
      })
      
    passport.deserializeUser((id, done) => {
        User.findById(id, function(err, user) {
          done(err, user)
        })
      })
}

module.exports = passportConfig