/*jshint esversion: 6 */

require('./config/config');
const express = require('express');
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const dirNodeModules = path.join(__dirname , '../node_modules');

// Static
app.use('/css', express.static(dirNodeModules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNodeModules + '/jquery/dist'));
app.use('/js', express.static(dirNodeModules + '/popper.js/dist'));
app.use('/js', express.static(dirNodeModules + '/bootstrap/dist/js'));
app.use(express.static(path.join(__dirname + '/../public')));

app.use(bodyParser.urlencoded({extended: false}));

app.use(require('./routes/index'));

// Get Mongoose to use the global promise library
//mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/virtualeducali', {useNewUrlParser: true}, (err, resultado) => {
    if(err) {
        console.log(err);
    }
    console.log('Conectado');
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto ' + process.env.PORT);
});