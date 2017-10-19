const functions = require('firebase-functions');
var gmail = require('gmail');
var nodemailer = require('nodemailer');


//lol we were stuck on this for a while - it got frustrating
//This line in a key one. We use SMTP as its very widely used by different protocols. 
//transport is just a MTA for the SMTP MHS. 
// setting the attributes of the email
function PleaseWork () {
var transporter = nodemailer.createTransport('smtps://templogger9@gmail.com:ThinkBig@smtp.gmail.com');
var mailOptions = {
    from: 'templogger9@gmail.com', 
    to: 'miahgt@gmail.com', 
    subject: 'Seed Spa Temperature', 
    text: 'Your temperatures are out of range right now. Please do something.', // plaintext body
    html: '<b>Your temperatures are out of range right now. Please do something.</b>' // html body
};

//some error handling. This is the code that actually sends the message. 
//info.response if returned by the SMTP transporter with info about the sent item. 
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
}

// explains what we're going to be doing. Using functions, in the DB and calling the C.F. CheckVal
//What we take from the DB. 
//event trigger to call our function
//take the val from the snapshot that we get. 
//drop the temp section from it into our range comparison
exports.checkVal = functions.database
    .ref('/temperature/{pushID}')
    .onCreate(event =>{
        const entry = event.data.val()
        entry.temp = inrange(entry.temp)
    })


    //call our tricky function when you are out of range 
    //outOfRange boolean is for our flag trigger to stop multiple emails for the same temperature event. 
    //perhaps later we can use this as an indicator to duplicate the snapshot to a separate tble for event log
    function inrange(s){
        if (s < 20) { 
            outOfRange = true
            
            PleaseWork()
            console.log("Temperature too low");
            }
            
         else if (s > 26) {
            outOfRange = true
            PleaseWork()
            console.log("Temperature too high");
        } else {
            return;
        }

    }
 

