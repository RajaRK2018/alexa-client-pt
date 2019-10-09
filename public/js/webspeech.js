/* Set the width of the sidebar to 250px (show it) */
function openNav() {
    document.getElementById("mySidepanel").style.width = "250px";
}
  
 /* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
}

function checkCompatibilityForSpeechSynthesis() {
    if(!('speechSynthesis' in window)){
        console.log('Your browser is not supported  for Speech Synthesis. If Google Chrome, please upgrade');
    }
};

function checkCompatibilityForSpeechRecognition() {
    if(!('webkitSpeechRecognition' in window)){
        console.log('Your browser is not supported for Speech Recognition. If Google Chrome, please upgrade');
    }
};

checkCompatibilityForSpeechSynthesis();

checkCompatibilityForSpeechRecognition();

var voiceOptions = document.getElementById('voiceOptions');
var testBtn = document.getElementById('testBtn');
var fileUpload = document.getElementById('fileUpload');
var voiceMap = [];
var scheduler = new Scheduler();

var time = 0;
var date =  new Date(time);
var newTime = 0;
var newDate =  new Date(newTime);
var detectduration = 0;           
var completeduration = 0;
var endduration = 0;

function loadVoices () {

    var voices = speechSynthesis.getVoices();
    for (var i=0; i < voices.length; i++){
        var voice = voices[i];
        var option = document.createElement('option');
        option.value = voice.name;
        option.innerhtml = voice.name;
        voiceOptions.appendChild(option);
        //console.log("Voice " + i + " - " + voice.name);
        voiceMap[voice.name] = voice;
    };
};

window.speechSynthesis.onvoiceschanged = function(e){
    loadVoices();
};

fileUpload.addEventListener('change', handleFile, false);

function handleFile() {

    var files = fileUpload.files;
    var f = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

        var data = new Uint8Array(e.target.result);
        
        var wb = XLSX.read(data, {type: 'array'});

        var intents = wb.SheetNames;

        var ul = document.createElement('ul');

        for (var i = 0; i < intents.length; i++){

            console.log('Intent ' + i + ': ' + intents[i]);
            
            var li = document.createElement('li');

            li.innerHTML= intents[i];
            
            ul.appendChild(li);
            
            document.getElementById('intents').appendChild(ul);

            // var utterances = XLSX.utils.sheet_to_json(wb.Sheets[intents[i]]);

            // for (var j = 0; j < utterances.length; j++){

            //     console.log('Utterance ' + j + ' for ' + intents[i] + ': ' + utterances[j].utterance);

            // }
        }   
    };

    reader.readAsArrayBuffer(f);
}

testBtn.addEventListener('click', function(){

    if(testBtn.disabled){

        console.log("test button is disabled");

    }

    else{

        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;

        if (!regex.test(fileUpload.value.toLowerCase())) {

            alert("Please upload a valid Excel file.");

        }

        else {

            if(!scheduler.isOn){

                testBtn.classList.remove("btn-primary");
                testBtn.classList.add("btn-secondary");
                testBtn.disabled = true;
    
                scheduler.start(test);
                
            }            
        }              
    }
})

function Scheduler(){

    var intentID = 0;
    var utterID = 0;    

    this.isOn = false;

    this.start = function(callback){
        
        if(!this.on){

            getTestParams(intentID, utterID, function(intentName, utterText, intentArrLen, currUtterArrLen){
            
                callback(intentName, utterText, intentArrLen, currUtterArrLen, startRecognition);          
                
            })   
              
            this.isOn = true;      
        }

        else{
            console.log('Current utterance is still in progress')
        }

    }
    
    this.next = function(intentArrLen, currUtterArrLen, nextIter){

        this.isOn = false;
        utterText = '';
        console.log('Test completed for current Utterance');
        if(utterID < currUtterArrLen-1){
            utterID++;
            scheduler.start(nextIter);            
        }

        else{
            // testBtn.classList.remove("btn-secondary");
            // testBtn.classList.add("btn-primary");
            // testBtn.disabled = false;

            console.log('Test completed for current Intent');

            utterID = 0;

            if(intentID < intentArrLen-1){
                intentID++;
                scheduler.start(nextIter);            
            }
            
            else{

                testBtn.classList.remove("btn-secondary");
                testBtn.classList.add("btn-primary");
                testBtn.disabled = false;

                console.log('Test completed for All Intents');

            }
        }
    }    
}

function getTestParams(intentID, utterID, callback) {

    var files = fileUpload.files;
    var f = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

        var data = new Uint8Array(e.target.result);
        
        var wb = XLSX.read(data, {type: 'array'});

        var intents = wb.SheetNames;
        
        var utterances = XLSX.utils.sheet_to_json(wb.Sheets[intents[intentID]]);

        console.log(intents[intentID], utterances[utterID].utterance, intents.length, utterances.length);

        callback(intents[intentID], utterances[utterID].utterance, intents.length, utterances.length);

    }

    reader.readAsArrayBuffer(f);
}

/*
var utterFind = function (i, j, k, callback){

    fetch('/test?intent=' + i).then((response) => {
        
        response.json().then((data) => {
            
            if(data.error){
                return data.error;
            }
            else{
                callback(j, data[k].utterance, data.length);
            }

        })
    })
}

*/

var test = function (intentName, utterText, intentArrLen, currUtterArrLen, callback) {

    var msg = new SpeechSynthesisUtterance();
    msg.voice = voiceMap[voiceOptions.value]; 
    msg.volume = 1;
    msg.rate = 1;
    msg.pitch = 0.8;
    msg.text = utterText;   

    console.log("Listen to the speech now");
    
    time = Date.now();
    date =  new Date(time);
    window.speechSynthesis.speak(msg);

    console.log('Intent ' + intentName + ', Utterance Text ' + msg.text +' - Start Time: ' + date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    msg.onend = function (event){

        time = Date.now();
        date =  new Date(time);
        
        console.log("User Utterance ended / Speech Recognition started at "+ date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

        callback(intentName, utterText, intentArrLen, currUtterArrLen);
    }

};

var startRecognition = function (intentName, utterText, intentArrLen, currUtterArrLen) {

    var speechRecognizer = new webkitSpeechRecognition();
    speechRecognizer.continuous = true;
    speechRecognizer.interimResults= false;
    speechRecognizer.lang = "en-US";

    var finalTranscripts = '';

    speechRecognizer.start();

    console.log("Click Allow if prompted for using Mic");

    speechRecognizer.onspeechstart = function (event){

        newTime = Date.now();
        newDate =  new Date(newTime);
        detectduration = newTime - time;

        console.log("The Alexa/User speech detected at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + detectduration + " ms since recognition service started");
    }

    speechRecognizer.onaudiostart = function (event){

        newTime = Date.now();
        newDate =  new Date(newTime);
        detectduration = newTime - time;

        console.log("The Alexa/User audio started at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + detectduration + " ms since recognition service started");
    }

    speechRecognizer.onaudioend = function (event){

        newTime = Date.now();
        newDate =  new Date(newTime);
        detectduration = newTime - time;

        console.log("The Alexa/User audio ended at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + detectduration + " ms since recognition service started");
    }


    speechRecognizer.onspeechend = function (event){

        newTime = Date.now();
        newDate =  new Date(newTime);
        endduration = newTime - time;

        console.log("No more detection as of "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + endduration + " ms since recognition service started");

        speechRecognizer.abort();
        console.log("Speech Recognition intentionally aborted");

        if(!speechRecognizer.onend){
            speechRecognizer.onend();
        }
    }                  

    speechRecognizer.onresult = function(event){

        newTime = Date.now();
        newDate =  new Date(newTime);
        completeduration = newTime - time;

        console.log("The Alexa/User response completed at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })  + " which is " + completeduration + " ms since recognition service started");
        
        for(var i=event.resultIndex; i<event.results.length;i++){
            var transcript = event.results[i][0].transcript;
            transcript.replace("\n", "<br>");
            if(event.results[i].isFinal){
                finalTranscripts += transcript;
            }
            else{
                interimTranscripts += transcript;
            }

            console.log("Alexa's response as recognized: " + finalTranscripts);

            speechRecognizer.continuous = false;

            speechRecognizer.abort();

            console.log("Speech Recognition intentionally aborted");

            var table = document.getElementById("results_table");

            var row = table.insertRow(-1);

            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);

            cell1.innerHTML = intentName;
            cell2.innerHTML = utterText;
            cell3.innerHTML = finalTranscripts;
            cell4.innerHTML = detectduration;
            cell5.innerHTML = completeduration ;

        }

        if(!speechRecognizer.onend){
            speechRecognizer.onend();
        }

    }

    speechRecognizer.onend = function (event){

        newTime = Date.now();
        newDate =  new Date(newTime);
        console.log("Recognition service stopped at " + newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) );

        if(scheduler.isOn){

            scheduler.next(intentArrLen, currUtterArrLen, test);
              
        }
        
    }

    speechRecognizer.onnomatch = function (event){

        newTime = Date.now();
        newDate =  new Date(newTime);
        nodetectduration = newTime - time;

         console.log("No speech detected till "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })  + " which is " + nodetectduration + " ms since recognition service started");

        speechRecognizer.abort();

        console.log("Speech Recognition intentionally aborted");

        if(!speechRecognizer.onend){
            speechRecognizer.onend();
        }

    }

    speechRecognizer.onerror = function(event){

        newTime = Date.now();
        newDate =  new Date(newTime);
        
        var completeError = event.error;
        errorduration = newTime - time;

        console.log("Recognition Error: " + completeError + " at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })  + " which is " + errorduration + " ms since recognition service started");

        speechRecognizer.abort();

        console.log("Speech Recognition intentionally aborted");

        newTime = 0;
        errorduration = 0; 

    }
};

