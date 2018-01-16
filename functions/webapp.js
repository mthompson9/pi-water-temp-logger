var buttonclick = document.getElementById("exportCSV");
var btnclick = document.getElementById("textit");

function clicker(startDate, startTime, endDate, endTime) {

    var userInputStart = startDate + " " + startTime;
    var userInputEnd = endDate + " " + endTime;

    var userUnixStart = Math.round(new Date(userInputStart).getTime()/1000);
    var userUnixEnd = Math.round(new Date(userInputEnd).getTime()/1000);

    var startPoint = String(userUnixStart);
    var endPoint = String(userUnixEnd);

    // window.alert("Linked");
    var firebaseRef = firebase.database().ref();

    var ref = firebase.database().ref('/temperature')
    ref.orderByChild('unixstamp')
    .startAt(startPoint)
    .endAt(endPoint)
    .once('value', function(snapshot) {

    var getData = [];
    
    snapshot.forEach(function(childSnapshot) {
        
        logmin = childSnapshot.val().time;
        logtemp = childSnapshot.val().temp;
        logstatus = childSnapshot.val().averagestatus;
        logup = childSnapshot.val().upperprobe;
        logupst = childSnapshot.val().upperprobestatus;
        loglow = childSnapshot.val().lowerprobe;
        loglowst = childSnapshot.val().lowerprobestatus;
        logdate = childSnapshot.val().date;

        
        //....    
        var item = ('\n' + logdate + ',' + logmin + ',' + logtemp + ',' + logstatus + ',' + logup + ',' + logupst + ',' + loglow + ',' + loglowst);
        // push each new item to array
        getData.push(item);
   });

   console.log(getData)

   let csvContent = "data:text/csv;charset=utf-8,";
//    getData.forEach(function(rowArray){
      let row = getData.join(",");
      csvContent += row + "\r\n"; // add carriage return
//    });    

   var encodedUri = encodeURI(csvContent);
   var link = document.createElement("a");
   link.setAttribute("href", encodedUri);
   link.setAttribute("download", "my_data.csv");
   document.body.appendChild(link); // Required for FF
   
   link.click();

});


}

function alldata() {
    
        // var userInputStart = startDate + " " + startTime;
        // var userInputEnd = endDate + " " + endTime;
    
        // var userUnixStart = Math.round(new Date(userInputStart).getTime()/1000);
        // var userUnixEnd = Math.round(new Date(userInputEnd).getTime()/1000);
    
        // var startPoint = String(userUnixStart);
        // var endPoint = String(userUnixEnd);
    
        // window.alert("Linked");
        var firebaseRef = firebase.database().ref();
    
        var ref = firebase.database().ref('/temperature')
        ref.orderByChild('unixstamp')
        // .startAt(startPoint)
        // .endAt(endPoint)
        .once('value', function(snapshot) {
    
        var getData = [];
        
        snapshot.forEach(function(childSnapshot) {
            
            logmin = childSnapshot.val().time;
            logtemp = childSnapshot.val().temp;
            logstatus = childSnapshot.val().averagestatus;
            logup = childSnapshot.val().upperprobe;
            logupst = childSnapshot.val().upperprobestatus;
            loglow = childSnapshot.val().lowerprobe;
            loglowst = childSnapshot.val().lowerprobestatus;
            logdate = childSnapshot.val().date;
    
            
            //....    
            var item = ('\n' + logdate + ',' + logmin + ',' + logtemp + ',' + logstatus + ',' + logup + ',' + logupst + ',' + loglow + ',' + loglowst);
            // push each new item to array
            getData.push(item);
       });
    
       console.log(getData)
    
       let csvContent = "data:text/csv;charset=utf-8,";
    //    getData.forEach(function(rowArray){
          let row = getData.join(",");
          csvContent += row + "\r\n"; // add carriage return
    //    });    
    
       var encodedUri = encodeURI(csvContent);
       var link = document.createElement("a");
       link.setAttribute("href", encodedUri);
       link.setAttribute("download", "my_data.csv");
       document.body.appendChild(link); // Required for FF
       
       link.click();
    
    });
    
    
    }

function texter() {
    var db = firebase.database();
    var ref = db.ref('Text Number');
    ref.once('value', function(snapshot) {

        ref.child('Number').set ({
            textthis : (document.getElementById("txter").value)
        })

    })
}
