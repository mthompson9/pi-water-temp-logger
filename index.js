var gmail = require('gmail');
var nodemailer = require('nodemailer');
var mailingList = "pg705765@gmail.com,asheesh.sangamneheri@gmail.com,cameron.connolly93@gmail.com,miahgt@gmail.com,yatawo7@gmail.com"
var math = require('mathjs');  //--Module to perform Math functions
var ping = require('ping');  //--Module to perform ping functions
var logMin;  //--Variable to log the current server time
var outOfRange = false;
var dontSend = true;
var gCurrTemp;
var logtime;
var lastDBtimestamp;  //--Variable to log the time stamp of the last database entry
var sysDown = true;  //--Boolean to determine whether or not the system is down
var sysFlag;  //--Variable to determine if the system down/ok email has already sent once
var Firebase = require('firebase');
var config = {
  apiKey: "AIzaSyAIIV5RilYCz3Egtxd0ps-M_6iN2JgfEcU",
  authDomain: "temperature-monitor-pi.firebaseapp.com",
  databaseURL: 'https://temperature-monitor-pi.firebaseio.com/',
  storageBucket: "<BUCKET>.appspot.com",
};
Firebase.initializeApp(config);
var test;
var currentCount;


const functions = require('firebase-functions');
const admin = require('firebase-admin');
    admin.initializeApp(functions.config().firebase);
const inRangeString = 'Your temperatures are now back in range at ' ;
const outOfRangeString = 'Your temperatures are out of range right now, please do something. The current temperature is ';
const nullTempString = "No temperature was received in the cloud storage. Please check the pi and your network connectivity";
const lowBound = 28;
const upBound = 32;
const piEmail = 'templogger9@gmail.com';
var sendToEmail = 'pg705765@gmail.com';
const emailPassword = 'ThinkBig';
const transporter = nodemailer.createTransport('smtps://' + piEmail + ':' + emailPassword + '@smtp.gmail.com');


var  mailOptions = {
   from: piEmail,
   to: sendToEmail,
   subject: 'Temperature at ' + gCurrTemp + '°C',
   text:  outOfRangeString + gCurrTemp , // plaintext body
};


//--SYSTEM DOWN CHECK--Check for last database entry every 5 minutes---------//
//---------------------------------------------------------------------------//

//1. Take the last entry in the database under temperature  --------
exports.systemDownCheck = functions.https.onRequest((req, res) => {
    
    var db = admin.database();
    var ref = db.ref('/temperature');
    ref.limitToLast(1).on('child_added', function(snapshot) {
            
            console.log('The last added value')
            console.log(snapshot.val().time);
            
            
            logmin = snapshot.val().time;
    
    //2. Get a current timestamp by joining getHours, getMinutes and getSeconds using Date  --------
    
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
            
            console.log(h + ':' + m + ':' + s)
    
    //3. Map variables to the timestamp and minutes values of the database entry and server time --------
    
    var DBtimestamp = logmin.substr(3, 2);
    var Servertimestamp = m       
    var fullServerStamp = h + ':' + m + ':' + s
            
    //4. Calculate absolute value difference in minutes between the two timestamps  --------
    
        if (Math.abs(Servertimestamp - DBtimestamp) >= 5) 
            {
            console.log('Down')
            sysDown = true;
            } else 
                {
                console.log('fine')
                sysDown = false;            
                }
    
    //5. Obtain reference to sysdownflag which is used to verify if system is down  --------
    
    admin.database().ref('/').child('sysdownflag').child('KyMK50EnhKUQkhRVSb0').once('value', function(snapshot){
    
                console.log('QWERTTY')
                console.log(sysDown)
                console.log(snapshot.val().flag)
                sysFlag = snapshot.val().flag
    
                var fruits = ["Banana", "Orange", "Apple", "Mango"];
                
                console.log('Array')
                console.log(fruits);
    
    //6.    Uses value of sysDown to determine if the system is down and which email to send  --------
    //      sysFlag is used to prevent duplicate emails sending, acting as an on/off gate  --------
    //      NOTE: if you reverse the update values, you will receive emails every 5 minutes  --------
    
        if (sysDown == true && sysFlag == 1) 
            {
    
            admin.database().ref('/').child('sysdownflag').child('KyMK50EnhKUQkhRVSb0').update({flag: '0'});
                    
            const sysDownEmail = 
            {
            from: piEmail,
            to: mailingList,
            subject: 'System Down at ' + fullServerStamp,
            text: 'The system last recorded an entry at ' + logmin + ', the system is currently down.'
            }
        return transporter.sendMail(sysDownEmail).then(() => 
        {
        }).catch(error => 
        {
        res.send(error)
        })
                    
        } else if (sysDown == false && sysFlag == 0) 
            {
    
            admin.database().ref('/').child('sysdownflag').child('KyMK50EnhKUQkhRVSb0').update({flag: '1'});
                    
            const sysOKEmail = 
            {
            from: piEmail,
            to: mailingList,
            subject: 'System OK. Running at ' + fullServerStamp,
            text: 'The system was previously down but is now running as expected again. The last entry was at ' + logmin
            }
        return transporter.sendMail(sysOKEmail).then(() => 
        {
        }).catch(error => 
        {
        res.send(error)
        })
        }
        });
    
    //a. Cron is used to call this function every 5 minutes, no extra code is required here
    //   It is setup at cron-job.org
    //   On successful deploy, a function URL is given in command line to verify link with Cron
    //   If this URL doesn't show, check the cron job is active and that this function was not re-named
    
    //--END--SYSTEM DOWN CHECK---------------------------------------------------//
    //---------------------------------------------------------------------------//
        });
    }); 



exports.checkVal = functions.database
    .ref('/temperature/{pushID}')
    .onCreate(event =>{
        console.log('checkVal has started')
        const entry = event.data.val()
        gCurrTemp = entry.temp
        gStatus = entry.status
        //logdate = entry.date
        logtime = entry.time
        = inrange()     
})




//changes the temp status (out of range or in range) and calls set flag, to update our DB value based on that
//then gets told wether to send the email or not (depends on dontSend[Boolean]) and which email to send (depends on status)
function inrange(){
    if (gCurrTemp < lowBound || gCurrTemp > upBound) {
        outOfRange = true
        setFlag(outOfRange)  
        //console.log('back to inrange')  //debug line
        if (dontSend == false) {
            return OutOfRangeEmail()
            //return console.log('sent') //debug line
        } 
        else { 
            return; 
        } 
    }
    else if (gCurrTemp > lowBound && gCurrTemp < upBound) { 
        outOfRange = false
        setFlag(outOfRange)
        if (dontSend == false){
            return InRangeEmail()
        } 
        else if (dontSend == true) { 
            return;
        } 
        else { 
            return 
        }
    } 
    else { 
        console.log('There was an error reading the temperature')
        nullTemperature()
    }
}




//controls the counter in the DB dependant on status of the temperature
function setFlag(status) { 
    //console.log('start of setcount') //debug line
    if (status == true) { 
        plusOne()
        console.log('line 98')
        count = admin.database().ref('/Counter/KyQFZiBw-F_NF1NdstD/')
        count.once('value', function(snapshot){
        test = snapshot.val()
        //console.log('line 101 - ' + test + ' + ' + test.value) //debug line
        if (test.value == 5) { 
            return dontSend = false; } 
        else if (test.value > 5) {
            //console.log('line 106') //debug line
            dontSend = true; 
            return count.update({
            value: (5) })} 
        else { 
            dontSend = true;
            return;
            }
        }) 
    }
    else if (status == false) {
        minusOne()
        count = admin.database().ref('/Counter/KyQFZiBw-F_NF1NdstD/')
        count.once('value', function(snapshot){
        test = snapshot.val()
        //console.log('line 118 - ' + test + test.value) //debug line
        if (test.value == 0) { 
            return dontSend = false;}
        else if (test.value < 0) { 
            dontSend = true;
            return count.update({
            value: (0) })}
            else { 
                dontSend = true;
                return;
            }
        })
    }    
    return ;
}
                    
 


//These functions control the value of the counter in the DB 
function plusOne (){ 
    var count = admin.database().ref('/Counter/KyQFZiBw-F_NF1NdstD/value/')
    count.transaction(function(currentCount) {
    return currentCount + 1; 
    })
}




function minusOne(){ 
    var count = admin.database().ref('/Counter/KyQFZiBw-F_NF1NdstD/value/')
    count.transaction(function(currentCount) {
    return currentCount - 1; 
    })
}
    
    


//Each of these email functions just change the mail options and calls sendmail()
function OutOfRangeEmail () {
    //console.log('sending the email') //debug line
    mailOptions = {
        from: piEmail,
        to: mailingList,
        subject: 'Temperature at ' + gCurrTemp  + '°C' ,
        text:  outOfRangeString + gCurrTemp + '°C @ ' + logtime
    } 
    sendTheEmail()
};




function InRangeEmail () {
    mailOptions = {
        from: piEmail,
        to: mailingList,
        subject: 'Temperature at ' + gCurrTemp  + '°C' ,
        text: inRangeString + gCurrTemp + '°C @ ' + logtime
    } 
    sendTheEmail() 
};




function nullTemperature() {
    mailOptions = {
        from: piEmail,
        to: mailingList,
        subject: 'System Down: Temperature not received',
        text:  nullTempString
    } 
    sendTheEmail()    
}




//some error handling. This is the code that actually sends the message.
//info.response if returned by the SMTP transporter with info about the sent item.
  //call our tricky function when you are out of range
  //outOfRange boolean is for our flag trigger to stop multiple emails for the same temperature event.
  //perhaps later we can use this as an indicator to duplicate the snapshot to a separate tble for event log
function sendTheEmail (){
    transporter.sendMail(mailOptions, function(err, info){
        if(err){
            return console.log(err);
        } 
        else {
            return console.log('Message sent: ' + info.response)
        }
    })
};
