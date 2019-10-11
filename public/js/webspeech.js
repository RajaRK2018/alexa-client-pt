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
var fileUpload = document.getElementById('fileUpload');
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
        option.setAttribute('id', 'option')
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

                console.log(intents[i][j].name)
                console.log(intents[i][j].utterance)
                console.log(intents[i][j].response)
                console.log(intents[i][j].sla)
            }
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

                iteration = document.getElementById('iteration');

                console.log('Testing started...')
                console.log('Iteration Count: ' + iteration.value)
    
                scheduler.start(test);
                
            }            
        }              
    }
})

function Scheduler(){

    var currIter = 1;
    var intentID = 0;
    var utterID = 0;    

    this.isOn = false;

    this.start = function(callback){
        
        if(!this.on){

            var intentName = intents[intentID][utterID].name
            var utterText = intents[intentID][utterID].utterance
            var response = intents[intentID][utterID].response
            var sla = intents[intentID][utterID].sla
            var intentArrLen = intents.length
            var currUtterArrLen = intents[intentID].length

            console.log(intentArrLen);
            console.log(currUtterArrLen);
            
            callback(intentName, utterText, intentArrLen, response, sla, currUtterArrLen, startRecognition);
              
            this.isOn = true;      
        }

        else{
            console.log('Current utterance is still in progress')
        }

    }
    
    this.next = function(intentArrLen, currUtterArrLen, nextIter){

        console.log('Current Utterance completed');
        this.isOn = false;
        utterText = '';

        if(utterID < currUtterArrLen-1){
            utterID++;
            scheduler.start(nextIter);            
        }

        else{
            
            console.log('Current Intent completed');
            utterID = 0;

            if(intentID < intentArrLen-1){
                intentID++;
                scheduler.start(nextIter);            
            }
            
            else{

                if(currIter < iteration.value){

                    console.log('Current Iteration completed');

                    currIter++;
                    utterID = 0;
                    intentID = 0;

                    scheduler.start(nextIter); 
                }

                else{

                    testBtn.classList.remove("btn-secondary");
                    testBtn.classList.add("btn-primary");
                    testBtn.disabled = false;

                    console.log('Test completed for All Iterations');

                }                

            }
        }
    }    
}

var test = function (intentName, utterText, intentArrLen, response, sla, currUtterArrLen, callback) {

    var msg = new SpeechSynthesisUtterance();
    msg.voice = voiceMap[voiceOptions.value]; 
    msg.volume = 1;
    msg.rate = 1;
    msg.pitch = 0.8;
    msg.text = utterText;   

    console.log("Listen to the speech now");
    
    time = performance.now();
    date =  new Date(Date.now());
    window.speechSynthesis.speak(msg);

    console.log('Intent ' + intentName + ', Utterance Text ' + msg.text +' - Start Time: ' + date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    msg.onend = function (event){

        time = performance.now();
        date =  new Date(Date.now());
        
        console.log("User Utterance ended / Speech Recognition started at "+ date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

        callback(intentName, utterText, response, sla, intentArrLen, currUtterArrLen);
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

    speechRecognizer.onspeechstart = function (event){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        detectduration = Math.ceil(newTime - time);

        console.log("The Alexa/User speech detected at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + detectduration + " ms since recognition service started");
    }

    // speechRecognizer.onaudiostart = function (event){

    //     newTime = performance.now();
    //     newDate =  new Date(Date.now());
    //     detectduration = Math.ceil(newTime - time);

    //     console.log("The Alexa/User audio started at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + detectduration + " ms since recognition service started");
    // }

    // speechRecognizer.onaudioend = function (event){

    //     newTime = performance.now();
    //     newDate =  new Date(newTime);
    //     detectduration = Math.ceil(newTime - time);

    //     console.log("The Alexa/User audio ended at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + detectduration + " ms since recognition service started");
    // }


    speechRecognizer.onspeechend = function (event){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        endduration = Math.ceil(newTime - time);

        console.log("No more detection as of "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + " which is " + endduration + " ms since recognition service started");

        speechRecognizer.abort();
        console.log("Speech Recognition intentionally aborted");

        if(!speechRecognizer.onend){
            speechRecognizer.onend();
        }
    }                  

    speechRecognizer.onresult = function(event){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        completeduration = Math.ceil(newTime - time);

        console.log("The Alexa/User response completed at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })  + " which is " + completeduration + " ms since recognition service started");
        
        for(var i = event.resultIndex; i < event.results.length; i++){
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

            if(detectduration>sla){
                var slacompliance = 'Bad'
            }
            else{
                var slacompliance = 'Good'
            }

            var table = document.getElementById("results_table");

            var row = table.insertRow(-1);

            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);
            var cell7 = row.insertCell(6);
            var cell8 = row.insertCell(7);

            cell1.innerHTML = intentName;
            cell2.innerHTML = utterText;
            cell3.innerHTML = response;
            cell4.innerHTML = finalTranscripts;
            cell5.innerHTML = sla;
            cell6.innerHTML = slacompliance;
            cell7.innerHTML = detectduration ;
            cell8.innerHTML = completeduration ;

        }

        if(!speechRecognizer.onend){
            speechRecognizer.onend();
        }

    }

    speechRecognizer.onend = function (event){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        console.log("Recognition service stopped at " + newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) );

        if(scheduler.isOn){

            scheduler.next(intentArrLen, currUtterArrLen, test);
              
        }
        
    }

    speechRecognizer.onnomatch = function (event){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        nodetectduration = Math.ceil(newTime - time);

         console.log("No speech detected till "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })  + " which is " + nodetectduration + " ms since recognition service started");

        speechRecognizer.abort();

        console.log("Speech Recognition intentionally aborted");

        if(!speechRecognizer.onend){
            speechRecognizer.onend();
        }

    }

    speechRecognizer.onerror = function(event){

        newTime = performance.now();
        newDate =  new Date(Date.now());
        
        var completeError = event.error;
        errorduration = Math.ceil(newTime - time);

        console.log("Recognition Error: " + completeError + " at "+ newDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })  + " which is " + errorduration + " ms since recognition service started");

        speechRecognizer.abort();

        console.log("Speech Recognition intentionally aborted");

        newTime = 0;
        errorduration = 0; 

    }
};

