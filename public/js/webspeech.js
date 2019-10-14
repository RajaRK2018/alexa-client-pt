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

var fileUpload = document.getElementById('fileUpload');

var voiceOptions = document.getElementById('voiceOptions');
var volumeSlider = document.getElementById('volumeSlider');
var rateSlider = document.getElementById('rateSlider');
var pitchSlider = document.getElementById('pitchSlider');
var wakeupword = document.getElementById('wakeupword');

var testBtn = document.getElementById('testBtn');
var voiceMap = [];
var intents = [];
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
        option.textContent = voice.name;
        if(voice.name === "Google UK English Male"){
            option.selected = true;
        }
        voiceOptions.appendChild(option);
        //console.log("Voice " + i + " - " + voice.name);
        voiceMap[voice.name] = voice;
    };
};

window.speechSynthesis.onvoiceschanged = function(e){
    loadVoices();
};

function sleep(ms){
    return new Promise(resolve => setTimeout (resolve, ms));
}

async function wait(ms, callback){

    console.log('Waiting for ' + ms + ' milliseconds for some recognition event to happen');
    await sleep(ms);    

    for (var i = 0; i < 5; i++){
        if(i === 3){
            await sleep(ms);
        }
    }

    console.log('Calling End event since no other event happened');
    
    callback();
}

async function pause(ms){

    //console.log('Waiting for ' + ms + ' sec');
    await sleep(ms);    

    for (var i = 0; i < 5; i++){
        if(i === 3){
            await sleep(ms);
        }
    }
}

async function thinktime(ms){

    console.log('Waiting for ' + ms + ' milliseconds before next utterance');
    await sleep(ms);    

    for (var i = 0; i < 5; i++){
        if(i === 3){
            await sleep(ms);
        }
    }
}

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

                // console.log(intents[i][j].name)
                // console.log(intents[i][j].utterance)
                // console.log(intents[i][j].response)
                // console.log(intents[i][j].sla)
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

    var currIter = 1;
    var intentID = 0;
    var utterID = 0;    

    this.isOn = false;

    this.start = function(){
        
        if(!this.on){

            var intentName = intents[intentID][utterID].name
            var utterText = intents[intentID][utterID].utterance
            var response = intents[intentID][utterID].response
            var sla = intents[intentID][utterID].sla
            var intentArrLen = intents.length
            var currUtterArrLen = intents[intentID].length
            
            test(intentName, utterText, intentArrLen, response, sla, currUtterArrLen);
              
            this.isOn = true;      
        }

        else{
            console.log('An utterance is already in progress')
        }

    }
    
    this.next = function(intentArrLen, currUtterArrLen){
        utterText = '';

        if(utterID < currUtterArrLen-1){

            thinktime(8000);
            utterID++;
            scheduler.start();            
        }

        else{
            
            //console.log("Intent '" + intentName + "' completed");
            thinktime(8000);
            
            utterID = 0;

            if(intentID < intentArrLen-1){
                intentID++;
                scheduler.start();            
            }
            
            else{

                if(currIter < iteration.value){

                    console.log("Iteration '" + currIter + "' completed");
                    thinktime(8000);

                    currIter++;
                    utterID = 0;
                    intentID = 0;

                    scheduler.start(); 
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

var test = function (intentName, utterText, intentArrLen, response, sla, currUtterArrLen) {

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

    pause(5000);
    
    window.speechSynthesis.speak(msg);

    msg.onend = function (){

        time = performance.now();
        date =  new Date(Date.now());
        
        console.log("User Utterance for '"+ msg.text + "' ended. Time: " + date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

        startRecognition(intentName, utterText, response, sla, intentArrLen, currUtterArrLen);
    }

};

var startRecognition = function (intentName, utterText, response, sla, intentArrLen, currUtterArrLen) {

    var speechRecognizer = new webkitSpeechRecognition();
    speechRecognizer.continuous = true;
    speechRecognizer.interimResults= false;
    speechRecognizer.lang = "en-US";

    var finalTranscripts = '';

    speechRecognizer.start();

    console.log("Click Allow if prompted for using Mic");

    speechRecognizer.onspeechstart = function (){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        detectduration = Math.ceil(newTime - time);

        console.log("Speech detected at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + detectduration + " ms since recognition service started");
    }

    // speechRecognizer.onaudiostart = function (){

    //     newTime = performance.now();
    //     newDate =  new Date(Date.now());
    //     detectduration = Math.ceil(newTime - time);

    //     console.log("Audio started at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + detectduration + " ms since recognition service started");
    // }

    // speechRecognizer.onaudioend = function (){

    //     newTime = performance.now();
    //     newDate =  new Date(newTime);
    //     detectduration = Math.ceil(newTime - time);

    //     console.log("Audio ended at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + detectduration + " ms since recognition service started");
    // }              

    speechRecognizer.onresult = function(event){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        completeduration = Math.ceil(newTime - time);
        
        for(var i = event.resultIndex; i < event.results.length; i++){
            var transcript = event.results[i][0].transcript;
            transcript.replace("\n", "<br>");
            if(event.results[i].isFinal){
                finalTranscripts += transcript;
            }
            else{
                interimTranscripts += transcript;
            }

            console.log("Device response as recognized: " + finalTranscripts);

            pause(10000);

            console.log("Speech completed at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })  + " which is " + completeduration + " ms since recognition service started");
            
            // speechRecognizer.continuous = false;

            speechRecognizer.abort();

            if(detectduration>sla){
                var slacompliance = 'Bad'
            }
            else{
                var slacompliance = 'Good'
            }

            var table = document.getElementById("results_table");

            var row = table.insertRow(-1);

            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);
            var cell7 = row.insertCell(6);
            // var cell8 = row.insertCell(7);

            cell1.innerHTML = intentName;
            cell2.innerHTML = utterText;
            // cell3.innerHTML = response;
            cell3.innerHTML = finalTranscripts;
            cell4.innerHTML = sla;
            cell5.innerHTML = slacompliance;
            cell6.innerHTML = detectduration ;
            cell7.innerHTML = completeduration ;

        }

        if(scheduler.isOn){

            speechRecognizer.onend();            
        }
    }

    speechRecognizer.onspeechend = function (event){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        endduration = Math.ceil(newTime - time);

        console.log("Current detection stopped at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + endduration + " ms since recognition service started");

        // if(this.isOn){

        //     speechRecognizer.abort();
        //     speechRecognizer.onend();            
        // }
    }

    speechRecognizer.onend = function (){    
        
        newDate =  new Date(Date.now());

        console.log("Recognition service stopped at " + newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) );
        
        newTime = 0;
        errorduration = 0;

        if(scheduler.isOn){

            scheduler.isOn = false;            
            
            console.log("Test for intent '" + intentName + "' - Utterance '" + utterText + "' completed");

            scheduler.next(intentArrLen, currUtterArrLen, test);
              
        }        
    }

    speechRecognizer.onnomatch = function (){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        nodetectduration = Math.ceil(newTime - time);

        console.log("No speech detected till "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })  + " which is " + nodetectduration + " ms since recognition service started");

        if(scheduler.isOn){

            speechRecognizer.abort();
            speechRecognizer.onend();            
        }
    }

    speechRecognizer.onerror = function(event){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        
        var completeError = event.error;
        errorduration = Math.ceil(newTime - time);

        console.log("Recognition Error: " + completeError + " at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })  + " which is " + errorduration + " ms since recognition service started");

        if(scheduler.isOn){

            speechRecognizer.abort();
            speechRecognizer.onend();            
        }
    }

    wait(20000, speechRecognizer.onend)

};

