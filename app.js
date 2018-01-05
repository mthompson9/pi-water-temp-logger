var buttonclick = document.getElementById("exportCSV");

function extclicker(startFrom, endWith) {
    
    var startDate = startFrom;
    var endDate = endWith;
    
    window.alert(startFrom);
    window.alert(endWith);
    var firebaseRef = firebase.database().ref();

        // var db = firebase.database();
        // var ref = db.ref('/temperature');

        // ref.orderByChild("time").startAt(startDate).endAt(endDate)
        // .on("child_added", function(snapshot){
        //   console.log("got the data!", snapshot);
        // });



    var db = firebase.database();
    var ref = db.ref('/temperature');
    ref.once('value', function(snapshot) {

    var getData = [];

    

    snapshot.forEach(function(childSnapshot) {

        logmin = childSnapshot.val().time;
        logtemp = childSnapshot.val().temp;
        logstatus = childSnapshot.val().status;
        logdate = childSnapshot.val().date;
        //....    
        var item = ('\n' + logdate + ',' + logmin + ',' + logtemp + ',' + logstatus);
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