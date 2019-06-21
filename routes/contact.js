const express = require('express')
const router = express.Router()

const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2

//Contact page
router.get('/', (req, res) => {
    res.render('contact.ejs')
})

router.post('/send', (req, res) => {

    const sendEmail = async () => {

        const oauth2Client = new OAuth2(
            process.env.GOOGLE_CLIENT_ID,// ClientID
            process.env.GOOGLE_CLIENT_SECRET, // Client Secret
            "https://developers.google.com/oauthplayground" // Redirect URL
    )
    //     const GMAIL_SCOPES = [
    //     'https://mail.google.com/',
    //     'https://www.googleapis.com/auth/gmail.modify',
    //     'https://www.googleapis.com/auth/gmail.compose',
    //     'https://www.googleapis.com/auth/gmail.send',
    //   ]

    //   const url = oauth2Client.generateAuthUrl({
    //     access_type: 'offline',
    //     scope: GMAIL_SCOPES,
    //   })

    //   const code = '4/bgFIpdWIOJDe_FspTnABMjMxdJoL6Q6_I60XA1gErI7J3IaVnsBEI3T_gtCQBoYD25X0zDsy2E51Vxxa05cd0C8'

    //   const getToken = async () => {
    //     const { tokens } = await oauth2Client.getToken(code)
    //     console.info(tokens)
    //   }
     
    //   getToken()

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
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: process.env.GMAIL_ADDRESS,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                accessToken: process.env.GOOGLE_ACCESS_TOKEN,
                expires: Number.parseInt(process.env.GOOGLE_TOKEN_EXPIRE, 10)
            }
        })

        // setup email data with unicode symbols
        let mailOptions = {
        from: '"Mars Store Customer Support" <hiamynmax@gmail.com>', // sender address
        to: req.body.email, // list of receivers
        subject: 'We got your message, will get back to you soon! - Mars Store', // Subject line
        html: output // html body
        }

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error)
            }
            console.log("Message sent: %s", info.messageId)
        })
    }

    sendEmail()

    res.render('contact.ejs', { Msg:'Email has been sent!'} )
})

module.exports = router