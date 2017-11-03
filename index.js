const functions = require('firebase-functions');
var gmail = require('gmail');
var nodemailer = require('nodemailer');
var mailingList = 'miahgt@gmail.com'
var outOfRange = false;
var gCurrTemp;
var objectpi;
var gStatus = 'OK';
var newFlag = 0;
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


        //console.log("something on top")

//lol we were stuck on this for a while - it got frustrating
//This line in a key one. We use SMTP as its very widely used by different protocols.
//transport is just a MTA for the SMTP MHS.
// setting the attributes of the email
var  mailOptions = {
   from: piEmail,
   to: sendToEmail,
   subject: 'Temperature at ' + gCurrTemp + '°C',
   text:  outOfRangeString + gCurrTemp , // plaintext body
};

function OutOfRangeEmail () {
 mailOptions = {
   from: piEmail,
   to: mailingList,
   subject: 'Temperature at ' + gCurrTemp  + '°C' ,
   text:  outOfRangeString + gCurrTemp} // plaintext body
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
       text: inRangeString + gCurrTemp} // plaintext body
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

function sendTheEmail (){
transporter.sendMail(mailOptions, function(err, info){
 })
    if(err){
        return console.log(err);
    } else {
    return console.log('Message sent: ' + info.response)}

};

const snapshotToArray = snapshot => {
    let returnArr = [];

    snapshot.forEach(childSnapshot => {
        let item = childSnapshot.val(); 
        item.key = childSnapshot.key;
        returnArr.push(item);
    });

    return returnArr;
};

function startTimer() {
    console.log("Timer printing");
    timeractive = true;
    if (timeractive == true) {
        var ticker = setInterval(function(){tijdTimer()},1000);
        
    }
    resetTimer()
}

function stopTimer() {
    timeractive = false;
}

function resetTimer(ticker) {
    if (timeractive == true) {
        console.log("Line 56");
    } else {
        console.log("Line 58");
    }
    tijdTimer()
}

function tijdTimer(ticker) {
    tijd = tijd + 1;
    //var tijdstring = tijd.toString();
    console.log(tijd.toString());
    if (tijd.toString() == 300) {
        timeoutEmail()
    } else {
        return;
        }
    }

    exports.responseTimer= functions.database
    .ref('/temperature/{pushID}')
    .on('temp', function(snapshot) {
    //startTimer()
    
    
    })    


// explains what we're going to be doing. Using functions, in the DB and calling the C.F. CheckVal
//What we take from the DB.
//event trigger to call our function
//take the val from the snapshot that we get.
//drop the temp section from it into our range comparison
exports.checkVal = functions.database
    .ref('/temperature/{pushID}')
    .onCreate(event =>{
        const entry = event.data.val()
        //console.log(JSON.stringify(entry.temp))
        gCurrTemp = entry.temp
        gStatus = entry.status
        logdate = entry.date
        logtime = entry.time

        entry.temp = inrange()

    })

    function tempCheck() {
        if (gCurrTemp == null) {
            nullTemperature()
        }
        else {
            return
        }
    }








    // firebase.database().ref('/Flag').on('value', function(snapshot) {
    //   console.log(snapshot);
    // });;

//     admin.database().ref(`/Flag`).on('value', function(snapshot) {
//
//       // Object.keys(results).forEach(function(item){ console.log(item)});
//
//
//       console.log('This is the flag functions working ' + snapshot)
//        newFlag = snapshot.val()
//       console.log(newFlag)
//
// console.log(JSON.stringify({
//   value: (newFlag.value + 1)
// }))




    function setFlag() {
      admin.database().ref(`/Flag`).on('value', function(snapshot) {
      console.log('setting flag')
      //console.log(snapshot.value.val())

      newFlag = (snapshot.val())
      flagVal = newFlag.valueOf
      console.log('line 188 ' + newFlag + ' & ' + flagVal)
      if (flagVal == 5) { 
          console.log('im about to give up')
          sendCheck = true
        //   admin.database().ref('/Flag').set({
        //       value: (0)
        //   })
      } else {
          console.log('were on line 195')
          sendCheck = false
          flagVal = flagVal + 1
          console.log(parseInt(flagVal) + ' @ line 199')
          admin.database().ref('/Flag').set({
            value: (flagVal)
          })
      }
    })
  }


  //call our tricky function when you are out of range
  //outOfRange boolean is for our flag trigger to stop multiple emails for the same temperature event.
  //perhaps later we can use this as an indicator to duplicate the snapshot to a separate tble for event log
  function inrange(){
    if (gCurrTemp < lowBound) {
      setFlag()
        if (sendCheck = true) {
            OutOfRangeEmail()
        }
        outOfRange = true;
        gStatus = 'Temps are too high'

        return console.log("Temperature too low"); }
    else if (gCurrTemp > upBound) {
        setFlag()
        if (sendCheck = true) { 
            OutOfRangeEmail() }
        else {
            outOfRange = true
            gStatus = 'Temps are too high'
            return console.log("Temperature too high") }
        }
    else { 
        outOfRange = false
        gStatus = 'OK'
        if (flagVal != 0){ 
            admin.database().ref('/Flag').set({
            value: (newflag - 1)}) 
            }
        else if (newFlag == 0) {
            InRangeEmail() }
            return console.log('temp in range')
            }
        }
 
    function getobj() {
        var pidata = {
            date:logdate,
            temp:gCurrTemp,
            status:gStatus, 
            time: logtime
        };





























    }



