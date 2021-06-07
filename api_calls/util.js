const UnixToDate=(UNIX_timestamp)=>{
    var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  if(min.size==1){
    min='0'+min;
  }
  var sec = a.getSeconds();
  if(sec.size==1){
    sec='0'+sec;
  }
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
module.exports={
    UnixToDate
}