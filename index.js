
var gmail = require('gmail');
var nodemailer = require('nodemailer');
var mailingList = 'miahgt@gmail.com' ; 'yatawo7@gmail.com'
var outOfRange = false;
var dontSend = true;
var gCurrTemp;
var objectpi; 
var newFlag = 0;
var flagVal = 0;
var logdate
var logtime;
var pidata = {};
var sendCheck = false;
var minutes = Math.floor(time / 60);
var seconds = time - minutes * 60;
var hours = Math.floor(time / 3600);
var time = time - hours * 3600;
var timeractive = false;
var tijd = 0;
var Firebase = require('firebase');
var config = {
  apiKey: "AIzaSyAIIV5RilYCz3Egtxd0ps-M_6iN2JgfEcU",
  authDomain: "temperature-monitor-pi.firebaseapp.com",
  databaseURL: 'https://temperature-monitor-pi.firebaseio.com/',
  storageBucket: "<BUCKET>.appspot.com",
};
Firebase.initializeApp(config);
var Counter = 10;
var test;
var currentCount;
var firstRun = true;

const functions = require('firebase-functions');
const admin = require('firebase-admin');
    admin.initializeApp(functions.config().firebase);
const inRangeString = 'Your temperatures are now back in range at ' ;
const outOfRangeString = 'Your temperatures are out of range right now, please do something. The current temperature is ';
const nullTempString = "No temperature was received in the cloud storage. Please check the pi and your network connectivity";
const lowBound = 28;
const upBound = 32;
const downloadText = 'You can download a CSV log of the data captured by clicking on the link below: '
//const downloadLink = 'https://jsbase-5d117.firebaseapp.com/'
const piEmail = 'templogger9@gmail.com';
var sendToEmail = 'pg705765@gmail.com';
const emailPassword = 'ThinkBig';
const transporter = nodemailer.createTransport('smtps://' + piEmail + ':' + emailPassword + '@smtp.gmail.com');
const snapshotToArray = snapshot => {
    let returnArr = [];

    snapshot.forEach(childSnapshot => {
        let item = childSnapshot.val(); 
 item.key = childSnapshot.key;
        returnArr.push(item);
    });

    return returnArr;
};


var  mailOptions = {
   from: piEmail,
   to: sendToEmail,
   subject: 'Temperature at ' + gCurrTemp + '°C',
   text:  outOfRangeString + gCurrTemp , // plaintext body
};


console.log('This is the start of Miah')
//lol we were stuck on this for a while - it got frustrating
//This line in a key one. We use SMTP as its very widely used by different protocols.
//transport is just a MTA for the SMTP MHS.
// setting the attributes of the email

exports.checkVal = functions.database
    .ref('/temperature/{pushID}')
    .onCreate(event =>{
        console.log('checkVal has started')
        const entry = event.data.val()
        //console.log(JSON.stringify(entry.temp))
        gCurrTemp = entry.temp
        gStatus = entry.status
        logdate = entry.date
        logtime = entry.time

        = inrange()
        
    })


    function setFlag(status) { 
        console.log(status)
        console.log('start of setcount') //debug line
        console.log('line 91 - ' + Counter);
        
        if (status == true) { 
            plusOne()
            console.log('line 98')
            count = admin.database().ref('/Counter/KyQFZiBw-F_NF1NdstD/')
            count.once('value', function(snapshot){
                test = snapshot.val()
                console.log('line 101 - ' + test + ' + ' + test.value)
                if (test.value == 5) { 
                    return dontSend = false; 
                } else if (test.value > 5) {
                    console.log('line 106') 
                    return count.update({
                        value: (5) })
                } else { 
                    return;
                }
            })
            
            
        }else if (status == false) {
            minusOne()
            count = admin.database().ref('/Counter/KyQFZiBw-F_NF1NdstD/')
            count.once('value', function(snapshot){
                test = snapshot.val()
                console.log('line 118 - ' + test + test.value)
                if (test.value == 0) { 
                    return dontSend = false;
                } else if (test.value < 0) { 
                    return count.update({
                        value: (0) })
                } else { 
                    return;
                }
            })
            }    
            return ;
                        }
                    
               

    function plusOne (){ 
        var count = admin.database().ref('/Counter/KyQFZiBw-F_NF1NdstD/value/')
        count.transaction(function(currentCount) {
                    return currentCount + 1; })
    }

    function minusOne(){ 
        var count = admin.database().ref('/Counter/KyQFZiBw-F_NF1NdstD/value/')
        count.transaction(function(currentCount) {
                    return currentCount - 1; })
    }
    
        // function setFlag(status) { 
        //     console.log(status)
        //     console.log('start of setcount') //debug line
        //     var count = admin.database().ref('/').child('Counter').child('KyGXkz0uimfCX39ZLCW').child('value')
        //     console.log('line 91 - ' + Counter);
        //     if (status == true) { 
        //         count.transaction(function(currentCount) {
        //              return currentCount + 1; })
        //             if (countVal == 5) { 
        //                 return dontSend = false; 
        //             } else if (countVal > 5){ 
        //                 admin.database().ref('/Counter/').update({
        //                     value: (5)
        //                     })
        //                     dontSend == true;
        //             }
        //         } else if (status == false) {
        //             count.transaction(function(currentCount){
        //                 return currentCount - 1;})
        //          if (countVal == 0){
        //              return dontSend = true;
        //          } else {
        //              console.log('line 111')
        //                  if (countVal == 0) { 
        //                      return dontSend = false;
        //                  } else if (countVal < 0) { 
        //                     return admin.database().ref('/Counter/').set({
        //                         value: (0)
        //                         })
        //                      } else { 
        //                          return ;
        //                      }
        //                  }
        //          } else { 
        //              return console.log('there is an error setting the status');
        //          }
    
        //     }

    //     count.set({
    //         value: (test.getValue() + 1) })
    // count.once('value', function(snapshot){ 
    //     test = snapshot.val()})
    //     console.log('line 102 - ' + test.value)
        
        
    //     if (test.value == 5) {
    //         dontSend = false;
    //     } else if (test.value > 5){
    //         count.set({
    //             value: (5)})
            
    //           } else {
    //               return; } } 
              


function inrange(){
    
    if (gCurrTemp < lowBound || gCurrTemp > upBound) {
        outOfRange = true
        setFlag(outOfRange)  
        console.log('back to inrange')  
        if (dontSend == false) {
            OutOfRangeEmail()
            return console.log('sent')
        } else {
             } }   
        else if (gCurrTemp > lowBound && gCurrTemp < upBound) { 
        outOfRange = false
        setFlag(outOfRange)
        if (dontSend == false){
            return InRangeEmail()
        } else if (dontSend == true) { 
                return;
        } else { 
            return }
        } else { 
        console.log('There was an error reading the temperature')
        nullTemperature()
        }
    }


    function tempCheck() {
        if (gCurrTemp == null) {
            nullTemperature()
        }
        else {
            return
        }
    }




function OutOfRangeEmail () {
 mailOptions = {
   from: piEmail,
   to: mailingList,
   subject: 'Temperature at ' + gCurrTemp  + '°C' ,
   text:  outOfRangeString + gCurrTemp + '°C'} // plaintext body
   sendTheEmail()
};


function InRangeEmail () {
    var arrayLength = mailingList.length;
    for (i = 1; i < arrayLength; i++) {
        var pos = i-1;
    mailOptions = {
       from: piEmail,
       to: mailingList[pos],
       subject: 'Temperature at ' + gCurrTemp  + '°C' ,
       text: inRangeString + gCurrTemp + '°C'} // plaintext body
       sendTheEmail()
    }
    
   };


   function nullTemperature() {
    mailOptions = {
        from: piEmail,
        to: mailingList,
        subject: 'System Down: Temperature not received',
        text:  nullTempString} // plaintext body
        sendTheEmail()    
   }

//some error handling. This is the code that actually sends the message.
//info.response if returned by the SMTP transporter with info about the sent item.
  //call our tricky function when you are out of range
  //outOfRange boolean is for our flag trigger to stop multiple emails for the same temperature event.
  //perhaps later we can use this as an indicator to duplicate the snapshot to a separate tble for event log

function sendTheEmail (){
transporter.sendMail(mailOptions, function(err, info){
 })
    if(err){
        return console.log(err);
    } else {
    return console.log('Message sent: ' + info.response)}

};




    // exports.responseTimer= functions.database
    // .ref('/temperature/{pushID}')
    // .on('temp', function(snapshot) {
    // //startTimer()
    
    
    // })   

