const path = require('path');
const excel = require('../public/js/excel.js')

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const hbs = require('hbs');

const publicDir = path.join(__dirname, '../public');
const viewDir = path.join(__dirname, '../templates/views')

app.set('view engine', 'hbs');
app.set('views', viewDir)
app.use(express.static(publicDir));

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
    const utteranceArray = excel.readIntent(intent);
    res.send(utteranceArray)
})

//git config core.autocrlf true


app.listen(port, () => {
    console.log('server is up on the port' + port)
})