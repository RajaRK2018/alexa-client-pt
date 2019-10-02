
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

var  voiceOptions = document.getElementById('voiceOptions');
var  testBtn = document.getElementById('testBtn');
//var  myText = document.getElementById('myText');
var voiceMap = [];


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

var scheduler = new Scheduler();

window.speechSynthesis.onvoiceschanged = function(e){
    loadVoices();
};

testBtn.addEventListener('click', function(){

    if(testBtn.disabled){

        console.log("test button is disabled");

    }

    else{

        if(!scheduler.isOn){

            testBtn.classList.remove("btn-primary");
            testBtn.classList.add("btn-secondary");
            testBtn.disabled = true;

            scheduler.start(test);
            
        }       
    }

})

var test = function (i, j, k, callback) {

    var msg = new SpeechSynthesisUtterance();
    msg.voice = voiceMap[voiceOptions.value]; 
    msg.volume = 1;
    msg.rate = 1;
    msg.pitch = 0.8;
    msg.text = j;   

    console.log("Listen to the speech now");
    
    time = Date.now();
    date =  new Date(time);
    window.speechSynthesis.speak(msg);

    console.log('Utterance ID ' + i + ', Utterance Text ' + msg.text +' - Start Time: ' + date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    msg.onend = function (event){

        time = Date.now();
        date =  new Date(time);
        
        console.log("User Utterance ended / Speech Recognition started at "+ date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

        callback(i, j, k);
    }

};

var startRecognition = function (p, q, r) {

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

        var interimTranscripts = '';
        
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

            cell1.innerHTML = p;
            cell2.innerHTML = q;
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

            scheduler.next(test, r);
              
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

function Scheduler(){

    var intent = 'claimAdjusterInquiry';
    var utterID = 1;    

    this.isOn = false;

    this.start = function(feedback){

        if(!this.on){

            utterFind(intent, utterID, utterID-1, function(utterID, utterText, arrayLength){
            
                feedback(utterID, utterText, arrayLength, startRecognition);          
                
            })   
              
            this.isOn = true;
      
        }

        else{
            console.log('Current utterance is still in progress')
        }

    }
    
    this.next = function(nextIter, arrayLength){

        this.isOn = false;
        utterText = '';
        console.log('The current utterance has ended');
        if(utterID < arrayLength){
            utterID++;
            scheduler.start(nextIter);            
        }

        else{
            testBtn.classList.remove("btn-secondary");
            testBtn.classList.add("btn-primary");
            testBtn.disabled = false;
            console.log('The intent ' + intent + ' is completed');
        }
        

    }

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

}