const path = require('path');
const express = require('express');
const hbs = require('hbs');
// const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

const publicDir = path.join(__dirname, '../public');
const viewDir = path.join(__dirname, '../templates/views')

app.set('view engine', 'hbs');
app.set('views', viewDir)
app.use(express.static(publicDir));

// const mongodb = require('mongodb');
// const mongoClient = mongodb.MongoClient;
// const connectionURL = 'mongodb://127.0.0.1:27017';
// const databaseName = 'alexa-client-pt-db'

var results = []

app.get('', (req, res) => {
    res.render('index')
})

app.post('/test/result', (req, res) => {

    var result;
    var filteredResult;
    const filterKeys = ['intentName', 'utterText', 'min', 'avg', 'max', 'curr', 'pass', 'fail', 'sla', 'slaCompliance'];
    var min;
    var avg;
    var max;
    var curr;
    var pass = 0;
    var fail = 0;
    var slaCompliance;

    req.body.timeToSpeechStart = parseFloat(req.body.timeToSpeechStart);
    req.body.sla = parseFloat(req.body.sla);

    const createResult = () => {

        if(req.body.assertionstatus === 'Pass'){
            pass = 1;        
        } else{
            fail = 1;
        }
    
        if(req.body.timeToSpeechStart > req.body.sla){
            slaCompliance = 'Bad'
        }
        else{
            slaCompliance = 'Good'
        }
        
        result = {
            intentName: req.body.intentName,
            utterText: req.body.utterText,
            min: req.body.timeToSpeechStart,
            avg: req.body.timeToSpeechStart,
            max: req.body.timeToSpeechStart,
            curr: req.body.timeToSpeechStart,
            pass: pass,
            fail: fail,
            sla: req.body.sla,
            slaCompliance,
            resultData: [req.body]
        }

        results.push(result);

        var index = results.length - 1;

        filteredResult = Object.keys(results[0])
            .filter(key => filterKeys.includes(key))
            .reduce((obj, key) => {
                obj[key] = results[index][key];
                return obj;
            }, {})
    }

    if(results.length === 0){

        console.log('Creating first ever result object')
        createResult();
    }

    else{

        var i;

        for(i=0; i <= results.length; i++){

            if(i == results.length){

                console.log('Creation new result object for the utterance');
                createResult();
                break;
            } 

            if (results[i].intentName === req.body.intentName && results[i].utterText === req.body.utterText){
                
                console.log('Pushing data into existing array');
                results[i].resultData.push(req.body);

                console.log('prinitng result [i] data afterr pushing');
                console.log(results[i].resultData);
    
                const passResultData = results[i].resultData.filter((resultData) => {
                    return resultData.assertionstatus === 'Pass';
                })

                console.log('printing pass result data');
                console.log(passResultData);
    
                results[i].min = passResultData.reduce((min, current) => {           
                    return Math.min(min, current.timeToSpeechStart)
                }, passResultData[0].timeToSpeechStart);
    
                results[i].avg = passResultData.reduce((sum, current) => {                  
                    return (sum + current.timeToSpeechStart)
                }, 0) / passResultData.length     
                
                results[i].avg = Math.round(results[i].avg * 1000) / 1000;
    
                results[i].max = passResultData.reduce((max, current) => {                  
                    return Math.max(max, current.timeToSpeechStart)
                }, passResultData[0].timeToSpeechStart);
    
                results[i].curr = req.body.timeToSpeechStart;
                results[i].pass = passResultData.length;
                results[i].fail = results[i].resultData.length - passResultData.length;
    
                if(results[i].avg > req.body.sla){
                    results[i].slaCompliance = 'Bad'
                }
                else{
                    results[i].slaCompliance = 'Good'
                }
    
                filteredResult = Object.keys(results[i])
                    .filter(key => filterKeys.includes(key))
                    .reduce((obj, key) => {
                        obj[key] = results[i][key];
                        return obj;
                }, {})
    
                break;        
            } 
        }        
    }

    console.log('prinitng results towards');
    console.log(results);

    console.log('final filtered result');
    console.log(filteredResult);

    res.send(filteredResult);
})


app.listen(port, () => {
    console.log('server is up on the port ' + port)
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

