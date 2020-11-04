const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const express = require("express");
const RegFactory = require('./regNumbers');

const pg = require("pg");
const Pool = pg.Pool;

const connectionString = process.env.DATABASE_URL || 'postgresql://sim:pg123@localhost:5432/registration';

const pool = new Pool({
    connectionString
});

// create my app
const app = express();
// const RegFactory = require('./greetingsRoutes');

const registration = RegFactory(pool);



// view engine setup
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// initialise session middleware - flash-express depends on it
app.use(session({
    secret: 'this is my long string that is used for session in http',
    resave: false,
    saveUninitialized: true
}));

// initialise the flash middleware
app.use(flash());


// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // for parsing application/json
app.use(bodyParser.json())

//this will make server instance to find css in the public folder
app.use(express.static('public'))


app.get("/", async function(req, res) {

    res.render("index");
});

app.post("/reg_numbers", async function(req, res) {
    var name = req.body.name
    let checkDuplicate = await registration.check(name)

    if (checkDuplicate !== 0) {
        req.flash('success', 'This registration is already entered')
        var reg = await registration.getReg();
    } else if (name.startsWith('CY ') || name.startsWith('CA ') || name.startsWith('CL ')) {
        await registration.setReg(name);
        reg = await registration.getReg();
    } else if (!name.startsWith('CY ') || !name.startsWith('CA ') || !name.startsWith('CL ')) {
        req.flash('error', 'Please enter a valid registration')
    }



    res.render("index", {
        reg_number: reg
    });
});

app.get("/reg_numbers", async function(req, res) {
    let towns = req.query.towns

    let allReg = await registration.filteringTown(towns);

    res.render("index", {
        reg_number: allReg
    });
});


app.get("/clear", async function(req, res) {
    await registration.clearRegNo()
    res.redirect("/")
});


//telling the server what port to listen on
let PORT = process.env.PORT || 2030;

// when a server listen it uses port number: 3011
app.listen(PORT, function() {
    console.log('App starting on port:', PORT);

});