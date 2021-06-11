const googleIt = require('google-it');



const UnixToDate = (UNIX_timestamp) => {
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  if (min.size == 1) {
    min = '0' + min;
  }
  var sec = a.getSeconds();
  if (sec.size == 1) {
    sec = '0' + sec;
  }
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  return time;
}


const getDatasets = (data) => {
  const dataGraph = {};
  let arr = [];
  data.sort((a,b)=>{
    if(a.ratingUpdateTimeSeconds<b.ratingUpdateTimeSeconds){
      return true;
    }
    else{
      return false;
    }
  })
  data.forEach((val) => {
    arr.push(val.rank)
    //console.log(val.contestName + ":" + val.rank)
  })
  //console.log(arr,"labels")
  dataGraph.labels = arr
  let ratings = [];
  data.forEach((val) => {
    ratings.push(val.newRating);
  })
  //console.log(ratings,"ratings")
  var datasets = [];
  datasets.push({
    label: 'Rating changes', data: ratings,
    borderColor: '#000080',

  })
  dataGraph.datasets = datasets;
  //console.log(dataGraph.datasets)
  return dataGraph
}
const getMonthName = monthIndex => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  return months[monthIndex];
};
const countSubmissions = async (submissions, verdict, startTime, endTime) => {
  var count;
  var arr;
  //console.log(submissions,verdict)
  if (verdict === "ALL") {
    count = submissions.length
    arr = submissions;
  }
  else {

    arr = submissions.filter((submission) => { return submission.verdict == verdict })

  }
  //console.log(arr,verdict);
  arr = arr.filter((ele) => { return ele.creationTimeSeconds >= startTime });
  // console.log(arr,verdict);
  return arr.length;


}
const countAvg = async (submissions, verdict, startTime, endTime) => {
  var count;
  var arr;
  //console.log(submissions,verdict)
  if (verdict === "ALL") {
    count = submissions.length
    arr = submissions;
  }
  else {

    arr = submissions.filter((submission) => { return submission.verdict == verdict })

  }
  //console.log(arr,verdict);
  arr = arr.filter((ele) => { return ele.creationTimeSeconds >= startTime });
  let sum = 0, cnt = 0;
  arr.forEach((ele) => {
    if (ele.problem.rating) {
      sum += ele.problem.rating;
      cnt++;
    }
  })
  //console.log(sum,arr.length)

  // console.log(arr,verdict);
  return Math.round(sum / cnt);


}
const getFinalPoints = async (submissions, questions, startTime, endTime) => {
  let ok = []
  //console.log(submissions)
  ok = submissions.filter((ele) => ele.verdict === "OK");
  ok = ok.filter((ele) => ele.creationTimeSeconds >= startTime && ele.creationTimeSeconds <= endTime);
  let sum = 0, lastTime = startTime;
  ok.forEach((sub) => {
    //console.log(sub)
    questions.forEach((ques) => {
      if (ques.ques == (sub.problem.contestId + sub.problem.index)) {
        sum += ques.points;
        sum -= Math.round((sub.creationTimeSeconds - startTime) / 40);
      }
    })
    lastTime = Math.max(lastTime, sub.creationTimeSeconds);
  })
  sum = Math.round(sum);
  //lastTime=Math.max(ok.map(o=>o.creationTimeSeconds),startTime);
  //return [0,0];
  //console.log(sum,lastTime)
  return [sum, lastTime - startTime];
}



const getSub = async (submissions, startTime, endTime) => {
  const all = await countSubmissions(submissions, "ALL", startTime, endTime);
  const ac = await countSubmissions(submissions, "OK", startTime, endTime);
  const wa = await countSubmissions(submissions, "WRONG_ANSWER", startTime, endTime);
  const tle = await countSubmissions(submissions, "TIME_LIMIT_EXCEEDED", startTime, endTime);
  const others = all - (ac + wa + tle);
  return [ac, wa, tle, others];
};

const getCorrect = async (submissions, startTime, endTime) => {
  //const all = await countSubmissions(submissions, "ALL",startTime,endTime);
  const ac = await countSubmissions(submissions, "OK", startTime, endTime);
  //const wa = await countSubmissions(submissions, "WRONG_ANSWER",startTime,endTime);
  //const tle = await countSubmissions(submissions, "TIME_LIMIT_EXCEEDED",startTime,endTime);
  //const others = all - (ac + wa + tle);
  const getR = await countAvg(submissions, "OK", startTime, endTime)
  return [ac, getR];
};



module.exports = {
  UnixToDate,
  getDatasets,
  getMonthName,
  getSub,
  getCorrect,
  getFinalPoints
}