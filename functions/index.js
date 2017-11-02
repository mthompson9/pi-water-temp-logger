const functions = require('firebase-functions');
var gmail = require('gmail');
var nodemailer = require('nodemailer');
var outOfRange = false;
var gCurrTemp;
var objectpi;
var gStatus = 'OK';
var newFlag = 0;
var logdate
var logtime;
var pidata = {};


const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


const inRangeString = 'Your temperatures are now back in range at ' ;
const outOfRangeString = 'Your temperatures are out of range right now, please do something. The current temperature is ';
const lowBound = 28;
const upBound = 32;
const downloadText = 'You can download a CSV log of the data captured by clicking on the link below: '
const downloadLink = 'https://jsbase-5d117.firebaseapp.com/'
const piEmail = 'templogger9@gmail.com';
const sendToEmail = 'pg705765@gmail.com';
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
   subject: 'Seed Spa Temperature',
   text:  outOfRangeString + gCurrTemp  + '\n' + downloadText + '\n' + downloadLink , // plaintext body
};

function OutOfRangeEmail () {
 mailOptions = {
   from: piEmail,
   to: sendToEmail,
   subject: 'Seed Spa Temperature',
   text:  outOfRangeString + gCurrTemp  + '\n' + downloadText + '\n' + downloadLink} // plaintext body
   sendTheEmail()
};

function InRangeEmail () {
    mailOptions = {
       from: piEmail,
       to: sendToEmail,
       subject: 'Seed Spa Temperature',
       text: inRangeString + gCurrTemp  + '\n' + downloadText + '\n' + downloadLink ,} // plaintext body

       sendTheEmail()
   };

//some error handling. This is the code that actually sends the message.
//info.response if returned by the SMTP transporter with info about the sent item.

function sendTheEmail (){
transporter.sendMail(mailOptions, function(error, info){
  return console.log("sending email") })
    if(error){
        return console.log(error);
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
        // var pidata = {
        //     date:logdate,
        //     temp:gCurrTemp,
        //     status:gStatus, 
        //     time: logtime
        // };

        // var csv = 'Name,Title\n';

        // var textdate = logdate;
        // // data.forEach(function(row) {
        // //         csv += row.join(',');
        // //         csv += "\n";
        // // });
     
        // console.log(logdate);
        // var hiddenElement = document.createElement('a');
        // hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(logdate);
        // hiddenElement.target = '_blank';
        // hiddenElement.download = 'temperature-log.csv';
        // hiddenElement.click();
        // console.log(hiddenElement.href)
    
        //getobj()
        entry.temp = inrange()

    })








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
      newFlag = snapshot.val()
      admin.database().ref('/Flag').set({
        value: (newFlag.value + 1)
      })
    })
  }


  //call our tricky function when you are out of range
  //outOfRange boolean is for our flag trigger to stop multiple emails for the same temperature event.
  //perhaps later we can use this as an indicator to duplicate the snapshot to a separate tble for event log
  function inrange(){
    if (gCurrTemp < lowBound) {
      setFlag()
      exports.checkVal = functions.database
        .ref('/WarningSent/').once('value').then(function(snapshot){console.log(snapshot)})
        const flag = data.val()
        console.log(flag)

        OutOfRangeEmail()
        outOfRange = true;
        gStatus = 'Temps are too high'

        return console.log("Temperature too low");
       } else if (gCurrTemp > upBound) {
        setFlag()
        OutOfRangeEmail()
        outOfRange = true
        gStatus = 'Temps are too low'
        return console.log("Temperature too high") }
     else {
        outOfRange = false
        gStatus = 'OK'
        setFlag()
        InRangeEmail()
        return console.log('temp in range')
    }}

    function getobj() {
        var pidata = {
            date:logdate,
            temp:gCurrTemp,
            status:gStatus, 
            time: logtime
        };
    }



