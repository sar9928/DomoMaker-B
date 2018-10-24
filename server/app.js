// import libraries
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURL = process.env.MONGODB_URI || 'mongodb://heroku_svvw34c8:4uutpc0rtl3e1he4bvvaqc9e8i@ds241493.mlab.com:41493/heroku_svvw34c8';

mongoose.connect(dbURL, (err) => {
    if(err) {
        console.log('Could not connect to database');
        throw err;
    }
});

// pull in our routes
const router = require('./router.js');
const app = express();
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.use(compression());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(session({
    key: 'sessionid',
    secret: 'Domo Arigato',
    resave: true,
    saveUninitialized: true,
}));
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.use(cookieParser());

router(app);

app.listen(port, (err) => {
    if(err) {
        throw err;
    }
    console.log(`Listening on port ${port}`);
});








