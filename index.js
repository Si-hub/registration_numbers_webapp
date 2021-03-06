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
    var reg = await registration.getReg();
    res.render("index", {
        reg_number: reg
    });
});

app.post("/reg_numbers", async function(req, res) {

    var name = req.body.name
    name = name.toUpperCase()
    let checkDuplicate = await registration.check(name)

    if (name.length < 11) {

        // await registration.setReg(name);
        // await registration.getReg();


        var reg = await registration.getReg();
        if (checkDuplicate !== 0) {
            req.flash('success', 'This registration is already entered!')
            reg;
        } else if (!name) {
            req.flash('error', 'Please enter the registration number above!')
                // await registration.setReg(name);
            reg;
        } else if (name.startsWith('CY ') || name.startsWith('CA ') || name.startsWith('CL ')) {
            await registration.setReg(name);
            reg;

        } else if (!name.startsWith('CY ') || !name.startsWith('CA ') || !name.startsWith('CL ')) {
            req.flash('error', 'Enter a Registration as required: CA 123456/CA 123-456')
            reg;
        }
    } else {
        req.flash('error', 'The regNo is too long, Enter reg between 0 to 10 characters')
        reg;
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
    req.flash('success', 'The Database has been successfully reseted!')
    res.redirect("/")
});


//telling the server what port to listen on
let PORT = process.env.PORT || 2030;

// when a server listen it uses port number: 3011
app.listen(PORT, function() {
    console.log('App starting on port:', PORT);

});