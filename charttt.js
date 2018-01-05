$(document).ready(function() {
    var gammaArray = [];
    var tArray = [];
    var sessionArray = [];
    var currGamma = '';

    var dataRef = new Firebase('https://jsbase-5d117.firebaseio.com/temperature');
    dataRef.on('value', function(snapshot) {
        var t = snapshot.val();
        var count = 0;

        for (var key in t) {
          if (t.hasOwnProperty(key)) {          
            var dt = [];        
            dt[0] = count;
            dt[1] = parseFloat(t[key]);
            gammaArray = [];
            gammaArray.push(dt);
            tArray = [];
            tArray.push(dt[1]);
            count++;
          }
        }
        sessionArray.push(gammaArray[0])
        //console.log(gammaArray)
        $.plot($("#chart1"), [ sessionArray ]);
        currGamma = gammaArray[0][1].toString();
        $('#gammaMsg').show();
        $("#currGamma").text(currGamma);
    });         
});