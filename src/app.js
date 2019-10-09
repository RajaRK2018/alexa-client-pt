const path = require('path');
const excel = require('../public/js/excel.js')
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

const publicDir = path.join(__dirname, '../public');
const viewDir = path.join(__dirname, '../templates/views')

app.set('view engine', 'hbs');
app.set('views', viewDir)
app.use(express.static(publicDir));
app.use(bodyParser.urlencoded({ extended: true }));

const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'alexa-client-pt-db'

app.get('', (req, res) => {
    res.render('index')
})


app.get('/test', (req, res) => {

    if(!req.query.intent){
        return res.send(
            'Error: Please provide an intent name'
        )
    }

    const intent = req.query.intent
    const utteranceArray = excel.getUtteranceArray(intent);
    res.send(utteranceArray)
})

/*

mongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {

    if(error){
        return console.log('Unable to connect to database')
    }

    const db = client.db(databaseName)

    db.collection('users').insertMany(
        [
            {
                name: 'Ilavenilam',
                role: 'User'
            },
            {
                name: 'Vignesh',
                role: 'User'
            }
        ], (error, result) => {

        if(error){
            return console.log('Unable to insert user. Error: ' + error);
        }

        console.log(result.ops)
        
    })

})

*/

//git config core.autocrlf true


app.listen(port, () => {
    console.log('server is up on the port ' + port)
})