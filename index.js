// ************** REQUIREMENTS AND INTITIALIZATION *************
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const methodOverride = require('method-override'); // import method override to allow put and other requests from body
const morgan = require('morgan'); // import logging middleware
const ejsMate = require('ejs-mate'); //import ejs engine allowing for layouts rather than partials
const session = require('express-session'); // express session tool
const helmet = require('helmet'); // security mw package
const app = express(); // running app
const path = require('path');
const { q } = require('./questions');
const { tips, autoEmail } = require('./tips')
const { request } = require('http');
const jshare = require('jshare')
const { bb, radar } = require('billboard.js')
const nodemailer = require('nodemailer');
app.use('/static', express.static(path.join(__dirname, 'public'))); // serves static assets
app.set('views', path.join(__dirname, 'views')); // set view path
app.set('view engine', 'ejs'); // set view engine
app.engine('ejs', ejsMate); // add engine

// ******************* MIDDLEWARES *********************

app.use(express.urlencoded({ extended: true })); // middle ware that parses post requests payloads incoming via DOM body
app.use(methodOverride('_method')); // middle ware that allows put request to be served via DOM body
app.use(morgan('tiny')); // logging mw: console.logs request, route, response time
app.use(jshare())
app.use(express.static(path.join(__dirname, 'public'))); // serves static assets



// *************** E-mail ***************

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_ACCOUNT,
        pass: process.env.GMAIL_PASSWORD
    }
});



//************ ROUTES *******************


// HOME
app.get('/', (req, res, next) => {
    res.render('intro');
})

app.get('/questionaire', (req, res, next) => {
    res.render('questionaire', { q });
});

app.post('/questionaire', (req, res, next) => {
    results = {}
    const adder = (acum, cur) => parseInt(acum) + parseInt(cur);
    let cats = ["Strength", "Cardio", "Pain", "MentalHealth", "Stress", "Mindset", "Nutrition"]
    for (cat of cats) {
        results[cat] = Math.floor(10 * (req.body[cat].reduce(adder) / req.body[cat].length))
    }
    results["cats"] = cats
    results["tips"] = tips
    res.locals.results = results
    let message = `${req.body.email} : 
    Strength:${results["Strength"]} %
    Cardio: ${results["Cardio"]} %
    Pain: ${results["Pain"]} %
    MentalHealth: ${results["MentalHealth"]} %
    Stress: ${results["Stress"]} %
    Mindset: ${results["Mindset"]} %
    Nutrition: ${results["Nutrition"]} %
    `

    let mailOptions = {
        from: process.env.GMAIL_ACCOUNT,
        to: process.env.GMAIL_ACCOUNT,
        subject: `Apollo Protocol results for ${req.body.email}`,
        text: message
    }
    res.render('show', { results })
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("email sent")
        }
    });

    mailOptions.to = req.body.email
    mailOptions.text = autoEmail
    mailOptions.subject = "Your Apollo Protocol Results"

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("email sent")
        }
    });
})

app.all('*', (req, res, next) => {
    res.render('error');
})



// ERROR HANDLER
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Something went wrong...';
    res.status(status).render('error', { err });
});

// LISTENER
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(` visit at: 127.0.0.1:${port}`);
});
