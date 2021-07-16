// ************** REQUIREMENTS AND INTITIALIZATION *************

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
const { request } = require('http');
const jshare = require('jshare')
const { bb, radar } = require('billboard.js')
app.use(express.static(path.join(__dirname, 'public'))); // serves static assets
app.set('views', path.join(__dirname, 'views')); // set view path
app.set('view engine', 'ejs'); // set view engine
app.engine('ejs', ejsMate); // add engine

// ******************* MIDDLEWARES *********************

app.use(express.urlencoded({ extended: true })); // middle ware that parses post requests payloads incoming via DOM body
app.use(methodOverride('_method')); // middle ware that allows put request to be served via DOM body
app.use(morgan('tiny')); // logging mw: console.logs request, route, response time
app.use(jshare())
app.use(express.static(path.join(__dirname, 'public'))); // serves static assets


//************ ROUTES *******************


// HOME
app.get('/', (req, res, next) => {
    res.render('questionaire', { q });
});

app.post('/', (req, res, next) => {
    console.log(req.body)
    results = {}
    const adder = (acum, cur) => parseInt(acum) + parseInt(cur);
    let cats = ["strength", "cardio", "mindset", "mentalHealth", "stress", "pain", "nutrition"]
    results["redBorder"] = "boder-danger"
    results["blueBorder"] = "border-primary"
    results["greenBorder"] = "border-success"
    results["redText"] = "text-danger"
    results["blueText"] = "text-primary"
    results["greenText"] = "text-success"
    for (cat of cats) {
        results[cat] = req.body[cat].reduce(adder)
    }
    results["cats"] = cats
    res.locals.results = results
    console.log(results)
    res.render('show2', { results })
})



// // ERROR HANDLER
// app.use((err, req, res, next) => {
//     const { status = 500 } = err;
//     if (!err.message) err.message = 'Something went wrong...';
//     res.status(status).render('error', { err });
// });

// LISTENER
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(` visit at: 127.0.0.1:${port}`);
});
