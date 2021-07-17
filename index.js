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
    results = {}
    const adder = (acum, cur) => parseInt(acum) + parseInt(cur);
    let cats = ["Strength", "Cardio", "Mindset", "MentalHealth", "Stress", "Pain", "Nutrition"]
    results["redBorder"] = "boder-danger"
    results["blueBorder"] = "border-primary"
    results["greenBorder"] = "border-success"
    results["redText"] = "text-danger"
    results["blueText"] = "text-primary"
    results["greenText"] = "text-success"
    for (cat of cats) {
        results[cat] = req.body[cat].reduce(adder)
    }
    // TODO break this out into its own file
    let tips = [
        // strength NOTE these are ordered to sync with "cats" and are indexed with the same loop i variable
        {
            red: "Strength is more than just moving furniture. Poor strength can affect bone density, posture, and be a source of chronic pain. We specializing in building functional strength tailored to your needs.",
            blue: "You are strong. Want to be really strong? Building muscle is a science often poor planning or lack of knowledge can hamstring even the most motivated person. Our strength programming can make sure you achieve your goals."
        },
        // cardio
        {
            red: "Out of breath? Poor cardio indicates the heart and lungs are not working at the level they should. Fortitude can create a plan for catching your breath for good.",
            blue: "It appears you have good overall cardiovascular health. If you are looking to kick it up a notch. Maybe a 5k? We can help."
        },
        // Mindset
        {
            red: "It appears you might be looking at things in a sub-optimal way. Let us help you cultivate a mentality of achievement.",
            blue: "Ever wonder about the mentality of an elite athlete? How they push themselves to incredible limits. Stop wondering. Find out."
        },
        // Mental Health
        {
            red: "Looks like you may have signs of trouble with mental health. Fitness is more than just physicality. Problems with your body might be stemming from underlying issues that need to be addressed so you can live well.",
            blue: "Mental health -- check! Something on your mind? Weighing you down. It might be time to check out tackling the thing thats holding you back."
        },
        // Stress
        {
            red: "Chronic poorly managed stress can lead to a myriad of health problems, affecting sleep, heart health, and weight. We offer guidance on reducing and managing stress in your life.",
            blue: "Your current stress level looks good! Fortitude offers insight into the role stress might be playing with any injuries or chronic pain."
        },
        // Pain
        {
            red: "Chronic pain can 'spill' over into other areas of health such as sleep, and perpetuate a 'pain-guarding-pain cycle. We offer short term relief from pain as well as long term management solutions.",
            blue: "It looks like you don't have a sever pain problem. We can give insight into reducing everyday pain and modifying the patterns that create it."
        },
        // Nutrition
        {
            red: "You are what you eat. The food we consume lays the foundation for what our bodies can become. Poor diet affects every aspect of our health. Fortitude can supply you with knowledge to take control.",
            blue: "Looking to be more than just 'not overweight'? Seeking to push your phsyique to the limit. Let us help."
        }
    ]
    results["cats"] = cats
    results["tips"] = tips
    res.locals.results = results
    res.render('show2', { results })
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
