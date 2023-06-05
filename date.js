module.exports.getDate = getDate; //only the getDate function will be exported

function getDate(){
    var today=new Date();
    var curr=today.getDay();
    var day="";
    
    var options = {
        weekday: "long",
        day: "numeric",
        month: "long",
    };
    
    var day = today.toLocaleDateString("en-US", options);

    return day;
}

module.exports.getDay = getDay;

function getDay(){
    var today=new Date();
    var curr=today.getDay();
    var day="";
    
    var options = {
        weekday: "long",
    };
    
    var day = today.toLocaleDateString("en-US", options);

    return day;
}
