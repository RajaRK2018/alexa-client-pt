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
        alert('Your browser is not supported  for Speech Synthesis. Switch to Google Chrome. If you are already using Google Chrome, please upgrade');
    }
};

function checkCompatibilityForSpeechRecognition() {
    if(!('webkitSpeechRecognition' in window)){
        alert('Your browser is not supported for Speech Recognition. Switch to Google Chrome. If you are already using Google Chrome, please upgrade');
    }
};

checkCompatibilityForSpeechSynthesis();

checkCompatibilityForSpeechRecognition();

var table = document.getElementById("results_table");

var fileUpload = document.getElementById('fileUpload');

var voiceOptions = document.getElementById('voiceOptions');
var volumeSlider = document.getElementById('volumeSlider');
var rateSlider = document.getElementById('rateSlider');
var pitchSlider = document.getElementById('pitchSlider');
var wakeupword = document.getElementById('wakeupword');

var testBtn = document.getElementById('testBtn');
var voiceMap = [];
var intents = [];
var currIter = 1;
var intentID = 0;
var utterID = 0;
var scheduler = new Scheduler();

var time = 0;
var date =  new Date(time);
var newTime = 0;
var newDate =  new Date(newTime);
var resultStartTime = 0;
var resultEndTime = 0;
var resultEndDate = new Date(resultEndTime);
var speechEndDate = new Date(time);

var timeToSpeechStart = 0;
var timeToResultStart = 0;
var timeToNewResultStart = 0;
var timeToResultEnd = 0;
var timeToSpeechEnd = 0;
var timeToNoMatch = 0;

var resultCounter = 0;
var retry = 0;
var retrycount = 0;

var resultSet = {};

function loadVoices () {

    var voices = speechSynthesis.getVoices();
    for (var i=0; i < voices.length; i++){
        var voice = voices[i];
        var option = document.createElement('option');
        option.value = voice.name;
        option.textContent = voice.name;
        if(voice.name === "Google UK English Male"){
            option.selected = true;
        }
        voiceOptions.appendChild(option);
        //console.log("Voice " + i + " - " + voice.name);
        voiceMap[voice.name] = voice;
    };
};

window.speechSynthesis.onvoiceschanged = function(){
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

        var sheetNames = wb.SheetNames;

        var ul = document.createElement('ul');

        for (var i = 0; i < sheetNames.length; i++){
            
            var li = document.createElement('li');

            li.innerHTML = sheetNames[i];
            
            ul.appendChild(li);
            
            document.getElementById('intents').appendChild(ul);

            intents[i]=[];

            var utterances = XLSX.utils.sheet_to_json(wb.Sheets[sheetNames[i]]);            

            for (var j = 0; j < utterances.length; j++){

                intents[i].push(utterances[j]);
            }
        }   
    };

    reader.readAsArrayBuffer(f);
}

testBtn.addEventListener('click', function(){

    if(testBtn.disabled){

        console.log("Test button is disabled");

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

                iteration = document.getElementById('iteration');
                wakeupword = document.getElementById('wakeupword');

                console.log('Testing started... Iteration Count: ' + iteration.value);

                scheduler.start();
                
            }            
        }              
    }
})

function Scheduler(){    

    this.isOn = false;

    this.start = function(){
        
        if(!this.on){

            var intentName = intents[intentID][utterID].name
            var utterText = intents[intentID][utterID].utterance
            var assertiontext = intents[intentID][utterID].assertiontext.toLowerCase()
            var sla = intents[intentID][utterID].sla
            sla = parseFloat(sla) / 1000;
            sla = sla.toFixed(3);
            var intentArrLen = intents.length
            var currUtterArrLen = intents[intentID].length
            
            test(intentName, utterText, intentArrLen, assertiontext, sla, currUtterArrLen);
              
            this.isOn = true;      
        }

        else{
            console.log('An utterance is already in progress')
        }

    }
    
    this.next = function(intentArrLen, currUtterArrLen){

        utterText = '';

        if(utterID < currUtterArrLen-1){

            utterID++;

            console.log("Waiting for 2 sec before next utterance");

            setTimeout(() => {
        
                scheduler.start(); 
        
            }, 2000);            
                      
        }

        else{

            utterID = 0;

            if(intentID < intentArrLen-1){

                intentID++;

                console.log("Waiting for 2 sec before next intent");

                setTimeout(() => {
            
                    scheduler.start(); 
            
                }, 2000);   
            }
            
            else{

                if(currIter < iteration.value){

                    console.log("Iteration '" + currIter + "' completed");

                    currIter++;
                    utterID = 0;
                    intentID = 0;

                    console.log("Waiting for 2 sec before next iteration");

                    setTimeout(() => {                        
                
                        scheduler.start(); 
                
                    }, 2000);   
                }

                else{

                    testBtn.classList.remove("btn-secondary");
                    testBtn.classList.add("btn-primary");
                    testBtn.disabled = false;

                    utterID = 0;
                    intentID = 0;
                    currIter = 1;

                    console.log('Test completed for All Iterations');

                }                

            }
        }
    }    
}

var test = function (intentName, utterText, intentArrLen, assertiontext, sla, currUtterArrLen) {

    var wakeup = new SpeechSynthesisUtterance();
    wakeup.voice = voiceMap[voiceOptions.value]; 
    wakeup.volume = volumeSlider.value;
    wakeup.rate = rateSlider.value;
    wakeup.pitch = pitchSlider.value;
    wakeup.text = wakeupword.value;

    var msg = new SpeechSynthesisUtterance();
    msg.voice = voiceMap[voiceOptions.value]; 
    msg.volume = volumeSlider.value;
    msg.rate = rateSlider.value;
    msg.pitch = pitchSlider.value;
    msg.text = utterText;    

    date =  new Date(Date.now());
    console.log("Starting test for intent'" + intentName + "', Utterance '" +  utterText + "' Time: " + date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    window.speechSynthesis.speak(wakeup);

    wakeup.onend = setTimeout(() => {

            console.log("Delay after wake word");
    
            window.speechSynthesis.speak(msg);
    
    }, 1000);

    msg.onend = function (){

        time = performance.now();
        startRecognition(intentName, utterText, assertiontext, sla, intentArrLen, currUtterArrLen);

        date =  new Date(Date.now());        
        console.log("User Utterance for '"+ msg.text + "' ended. Time: " + date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));        
    }

};

var startRecognition = function (intentName, utterText, assertiontext, sla, intentArrLen, currUtterArrLen) {

    var speechRecognizer = new webkitSpeechRecognition();
    speechRecognizer.continuous = true;
    speechRecognizer.interimResults= false;
    speechRecognizer.lang = "en-IN";

    var isSpeechStart = false;
    var isResult = false;
    var isResultStop = true;    
    var isRecognizerStart = false;

    var finalTranscripts = '';
    var assertionstatus = '';
    var slaCompliance = '';
    
    var firstEventTimeout;
    var resultRecogTimeout;
    var resultPauseTimeout;

    speechRecognizer.start();
    isRecognizerStart = true;

    console.log("Click Allow if prompted for using Mic");

    firstEventTimeout = setTimeout(() => {

        if(!isSpeechStart){

            console.log("Forcefully stopping Recognition service after 10 seconds of no Speech Start event");
            speechRecognizer.stop();
        }       

    }, 10000);  

    speechRecognizer.onspeechstart = function (){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        console.log("Clearing firstEventTimeout as SpeechStart event is triggered");
        clearTimeout(firstEventTimeout);
        isSpeechStart = true;
        timeToSpeechStart = ((newTime - time) / 1000).toFixed(3);

        console.log("Speech detected at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + timeToSpeechStart + " sec since utterance completed");

        resultRecogTimeout = setTimeout(() => {

            if(!isResult){

                console.log("Forcefully stopping Recognition serrvice after 30 seconds of no Result event");
                speechRecognizer.stop();
            }   
    
        }, 30000);   
    }

    speechRecognizer.onresult = function(event){        

        if(resultCounter === 0){
            resultStartTime = performance.now();
            newDate =  new Date(Date.now());
            console.log("Clearing resultRecogTimeout as Result event is triggered");
            clearTimeout(resultRecogTimeout);
            isResult = true;
            isResultStop = false;
            timeToResultStart = ((resultStartTime - time) / 1000).toFixed(3);
            
            console.log("Initial Result Recognized for " + utterText + " at " + newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + timeToResultStart + " sec since utterance completed");
            resultCounter++;

        }
        
        else{
            newTime = performance.now();
            newDate =  new Date(Date.now());
            isResultStop = false;     
            timeToNewResultStart = ((newTime - time) / 1000).toFixed(3);               

            console.log("More Result Recognized for " + utterText + " at " + newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + timeToNewResultStart + " sec since utterance completed");
            resultCounter++;
        }       

        for(var i = event.resultIndex; i < event.results.length; i++){
            
            console.log("Clearing resultPauseTimeout as Result FOR loop started");
            clearTimeout(resultPauseTimeout);

            var transcript = event.results[i][0].transcript;
            transcript.replace("\n", "<br>");

            if(event.results[i].isFinal){

                resultEndTime = performance.now();                
                resultEndDate =  new Date(Date.now());
                timeToResultEnd = ((resultEndTime - time) / 1000).toFixed(3);
                finalTranscripts += transcript;console.log("Latest Result event for " + utterText + " completed at " + newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + timeToResultEnd + " sec since utterance completed");                
            }
            
            else{
                interimTranscripts += transcript;
            }  
            
            console.log("Device response as recognized: " + finalTranscripts);

            isResultStop = true;

            resultPauseTimeout = setTimeout(() => {

                if(isResultStop){
    
                    console.log("Forcefully stopping Recognition service after 5 seconds of no further result event");        
                    speechRecognizer.stop();

                }
        
            }, 5000);
        }        
    }

    speechRecognizer.onspeechend = function (){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        isSpeechStart = false;
        isResultStop = true;        
        timeToSpeechEnd = ((newTime - time) / 1000).toFixed(3);        

        console.log("Current speech detection stopped at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + timeToSpeechEnd + " sec since utterance completed"); 

    }

    speechRecognizer.onend = async function (){    
        
        speechEndDate =  new Date(Date.now());
        isResultStop = true;
        isRecognizerStart = false;

        console.log("Recognition service stopped at " + speechEndDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) );

        if(finalTranscripts === ''){
          
            console.log("No Recognizable speech");
            
            if(retry<2){

                retry++;
                console.log("Retry count for " + utterText + ": " + retry);
            } 
            
            else{

                console.log("Stopping Retries - Retry count: " + retry);

                retrycount = retry;
                retry = 0;
                finalTranscripts = 'Not Found';
                assertionstatus = 'Fail'
                //slaCompliance = 'NA';
                timeToSpeechStart = 'NA';
                timeToResultStart = 'NA';
                timeToResultEnd = 'NA';
            }           

        } 
        
        else{

            retrycount = retry;
            retry = 0;

            // if(timeToSpeechStart>sla){
            //     slaCompliance = 'Bad'
            // }
            // else{
            //     slaCompliance = 'Good'
            // }

            if(finalTranscripts.toLowerCase().includes(assertiontext)){
                assertionstatus = 'Pass'
            }
            else{
                assertionstatus = 'Fail'
            }

        }

        if(scheduler.isOn){
            
            if(retry === 0){

                scheduler.isOn = false;

                resultSet = {
                    intentName,
                    utterText,
                    finalTranscripts,
                    assertiontext,
                    assertionstatus,
                    sla,
                    timeToSpeechStart,
                    retrycount
                }

                const result = await saveResult(resultSet);

                console.log(result);

                console.log(Object.keys(result));

                console.log(Object.values(result));

                var rowid = result.intentName.concat(" - ", result.utterText);

                var rows = table.getElementsByTagName("tr");

                for (var r = 0; r <= rows.length; r++){

                    if(r == rows.length){

                        var row = table.insertRow(-1);

                        row.id = rowid;

                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        var cell4 = row.insertCell(3);
                        var cell5 = row.insertCell(4);
                        var cell6 = row.insertCell(5);
                        var cell7 = row.insertCell(6);
                        var cell8 = row.insertCell(7);
                        var cell9 = row.insertCell(8);
                        var cell10 = row.insertCell(9);

                        cell1.innerHTML = result.intentName;
                        cell2.innerHTML = result.utterText;
                        cell3.innerHTML = result.min;
                        cell4.innerHTML = result.avg;
                        cell5.innerHTML = result.max;
                        cell6.innerHTML = result.curr;
                        cell7.innerHTML = result.pass;
                        cell8.innerHTML = result.fail;
                        cell9.innerHTML = result.sla;
                        cell10.innerHTML = result.slaCompliance;
                        
                        break;
                    } 

                    if (rows[r].id === rowid){

                        console.log(rows[r]);

                        var cells = rows[r].getElementsByTagName("td");

                        cells[0].innerHTML = result.intentName;
                        cells[1].innerHTML = result.utterText;
                        cells[2].innerHTML = result.min;
                        cells[3].innerHTML = result.avg;
                        cells[4].innerHTML = result.max;
                        cells[5].innerHTML = result.curr;
                        cells[6].innerHTML = result.pass;
                        cells[7].innerHTML = result.fail;
                        cells[8].innerHTML = result.sla;
                        cells[9].innerHTML = result.slaCompliance;

                        break;

                    }
                }               

                console.log("Test for intent '" + intentName + "' - Utterance '" + utterText + "' completed");

                time = 0;
                newTime = 0;
                resultStartTime = 0;
                resultEndTime = 0;
                timeToSpeechStart =0;
                timeToNoMatch = 0;
                timeToResultStart = 0;
                timeToNewResultStart = 0;
                timeToResultEnd = 0;
                timeToSpeechEnd = 0;
                errorduration = 0;
                isRecognizerSt = true;
                resultCounter = 0;

                scheduler.next(intentArrLen, currUtterArrLen, test);
                
            }

            else{

                time = 0;
                newTime = 0;
                resultStartTime = 0;
                resultEndTime = 0;
                timeToSpeechStart =0;
                timeToNoMatch = 0;
                timeToResultStart = 0;
                timeToNewResultStart = 0;
                timeToResultEnd = 0;
                timeToSpeechEnd = 0;
                errorduration = 0;
                resultCounter = 0;

                test(intentName, utterText, intentArrLen, assertiontext, sla, currUtterArrLen);
            } 
        }        
    }

    speechRecognizer.onnomatch = function (){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        console.log("Clearing firstEventTimeout as No Match event is triggered");
        clearTimeout(firstEventTimeout);        
        timeToNoMatch = ((newTime - time) / 1000).toFixed(3);

        console.log("No speech detected till " + newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })  + " which is " + timeToNoMatch + " sec since utterance completed");

        if(scheduler.isOn){

            speechRecognizer.stop();            
        }
    }

    speechRecognizer.onerror = function(event){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        console.log("Clearing firstEventTimeout as Error event is triggered");
        clearTimeout(firstEventTimeout);        
        
        var completeError = event.error;
        errorduration = ((newTime - time) / 1000).toFixed(3);

        console.log("Recognition Error: " + completeError + " at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })  + " which is " + errorduration + " sec since utterance completed");

        if(scheduler.isOn){

            speechRecognizer.stop();            
        }
    }
};

var saveResult = async function (resultSet){

    const body = JSON.stringify(resultSet)
    
    console.log('Printing body')

    console.log(body)

    const response = await fetch('/test/result', {

        method: 'POST',

        body,

        headers: {
            'Content-Type': 'application/json'
            //'Content-Type': 'application/x-www-form-urlencoded'
        }
        
    });

    return await response.json();
}

