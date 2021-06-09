const fetch= require('node-fetch')
const {getDatasets,getMonthName,getSub}=require('./util')
const  googleIt = require('google-it');


const getRating=async(username)=>{
    let url=process.env.CF_BASEURL + 'user.rating?handle=' + username;
    var data;
    await fetch(url).then((res)=>res.json())

    .then((res)=>{
       
        data=res;
      //  console.log(res)
    })

    return new Promise( (resolve,reject)=>{
       
        if(data.status!='OK'){
            const errorObject = {
                msg: 'An error occured',
                error, //...some error we got back
             }
             reject(errorObject);
        }
        else{
            resolve(data);
        }
    })
}
const getUpcoming=async()=>{
    let url=process.env.CF_BASEURL + 'contest.list?gym=false';
    var data;
    var contest;
    await fetch(url).then((res)=>res.json())
    .then((res)=>{
       
        data=res;
        //console.log(res)
        let arr=res.result;
        arr=arr.filter(c=>c.phase=='BEFORE')
        contest=arr
    })

    return new Promise( (resolve,reject)=>{
       
        if(data.status!='OK'){
            const errorObject = {
                msg: 'An error occured',
                error, //...some error we got back
             }
             reject(errorObject);
        }
        else{
            resolve(contest);
        }
    })
}
const getRatingGraph=async(username)=>{
    let url=process.env.CF_BASEURL + 'user.rating?handle=' + username;
    var data,dataGraph;
    await fetch(url).then((res)=>res.json())

    .then(async(res)=>{
       
        data=res;
        //console.log(res.result)
         dataGraph= await getDatasets(data.result);
        //console.log(dataGraph)

      //  console.log(res)
    })

    return new Promise( (resolve,reject)=>{
       
        if(data.status!='OK'){
            const errorObject = {
                msg: 'An error occured',
                error, //...some error we got back
             }
             reject(errorObject);
        }
        else{
            resolve(dataGraph);
        }
    })
}


const getInformation = async(username)=>{
    let url=process.env.CF_BASEURL + 'user.info?handles=' + username + ';';
    var data;
    var info;
    await fetch(url).then((res)=>res.json())
    .then((res)=>{
       
        data=res;

        let arr=res.result;
        info=arr[0];
    })

    return new Promise( (resolve,reject)=>{
       
        if(data.status!='OK'){
         //   console.log(data.status)
            const errorObject = {
                msg: 'An error occured',
                error, //...some error we got back
             }
             console.log(errorObject.error)
             reject(errorObject);
        }
        else{
            resolve(info);
        }
    })
}
const getVirtualList=async(cf_username,msg)=>{
    let url=process.env.CF_BASEURL + 'user.status?handle=' + cf_username  ;
    var orig=[],data;
    await fetch(url).then((res)=>res.json())
    .then((res)=>{
        data=res;
        //console.log(res.status)
        res=res.result;
        res.forEach((prob)=>{
            if(orig.find(ele=> ele===prob.contestId)===undefined){
                orig.push(prob.contestId);
            }
        })
       // console.log(orig)
         getDivPart(orig).then(async(res)=>{
             let msgg="Div 1 Contest in which you havent solved a problem: \n";
             await res.div1.forEach(async(contest,idx)=>{
                 let link="<"+"https://codeforces.com/contest/"+contest.id +">";
                 msgg+=(idx+1)+": " + contest.name + "\n";
                 msgg+='Link: ' +link + "\n" ;
             })
             msg.channel.send(msgg);
              msgg="Div 2 Contest in which you havent solved a problem: \n";
              await res.div2.forEach(async(contest,idx)=>{
                let link="<"+"https://codeforces.com/contest/"+contest.id +">";
                 msgg+=(idx+1)+": " + contest.name + "\n";
                 msgg+='Link: ' +link + "\n" ;
             })
             msg.channel.send(msgg);
              msgg="Div 3 Contest in which you havent solved a problem: \n";
              await res.div3.forEach(async(contest,idx)=>{
                let link="<"+"https://codeforces.com/contest/"+contest.id +">";
                 msgg+=(idx+1)+": " + contest.name + "\n";
                 msgg+='Link: ' +link + "\n" ;
             })
             msg.channel.send(msgg);
             msg.channel.send("Good-Bye, hope I could be of help!")
         })
    })

    return new Promise((resolve,reject)=>{
        if(data.status!='OK'){
            reject("Error");
        }
        else{
            resolve(data.result);
        }
    })

}
const getDivPart=async(orig)=>{
    let url=process.env.CF_BASEURL + 'contest.list?gym=false';
    var div1=[],div2=[],div3=[];
    var obj={},data;
    await fetch(url).then((res)=>res.json())
    .then((res)=>{
        data=res;
        res=res.result;
        res.forEach((contest)=>{
            
            if(contest.name.includes("Div. 2")&& contest.phase==="FINISHED"){
                if(orig.find(ele=>ele===contest.id)===undefined){
                    div2.push({name:contest.name,id:contest.id})
                }
            }
            else if(contest.name.includes("Div. 1")&& contest.phase==="FINISHED"){
                if(orig.find(ele=>ele===contest.id)===undefined){
                    div1.push({name:contest.name,id:contest.id})
                }
            }
            else if(contest.name.includes("Div. 3")&& contest.phase==="FINISHED"){
                if(orig.find(ele=>ele===contest.id)===undefined){
                    div3.push({name:contest.name,id:contest.id})
                }
            }
        })
        div1.length=5;
        div2.length=5;
        div3.length=5;
        obj.div1=div1;
        obj.div2=div2;
        obj.div3=div3;
    })
    return new Promise((resolve,reject)=>{
        if(data.status!='OK'){
            const errorObject = {
                msg: 'An error occured',
                error, //...some error we got back
             }
             console.log(errorObject.error)
             reject(errorObject);
        }else{
            resolve(obj);
        }
    })
}
const getPredProblemSet=async(rating,msg,tc)=>{
        var rating,topic=tc,data;
        var probs={high:[],low:[],same:[]};
        rating/=100;
        rating=Math.round(rating);
        rating*=100;
        //console.log(rating,"rating")
        //console.log(topic,"topic")
        let url=process.env.CF_BASEURL+'problemset.problems?tags='+topic;
        var m=new Map();
        
        await fetch(url).then((res)=>res.json())
        .then((res)=>{
            data=res;
            let problems=res.result.problems,problemstats=res.result.problemStatistics
            //console.log(problems,"Data");
            problemstats.forEach((ps)=>{
                m.set(ps.contestId+ps.index,ps.solvedCount);
            })
            problems.forEach((p)=>{
                //console.log(p.rating,rating)
                let link="<https://codeforces.com/problemset/problem/"+p.contestId+"/"+p.index+">";
                if(p.rating==rating+100){
                    probs.high.push({name:p.name,scnt:m.get(p.contestId+p.index),link:link});
                }else if(p.rating==rating){
                    probs.same.push({name:p.name,scnt:m.get(p.contestId+p.index),link:link});
                }
                else if(p.rating==rating-100){
                    probs.low.push({name:p.name,scnt:m.get(p.contestId+p.index),link:link});
                }

            })
            probs.high.sort((a,b)=>{
                return b.scnt-a.scnt;
            })
            probs.same.sort((a,b)=>{
                return b.scnt-a.scnt;
            })
            probs.low.sort((a,b)=>{
                return b.scnt-a.scnt;
            })
            probs.rating=rating
        })
    

    return new Promise((resolve,reject)=>{
        if(data.status!='OK'){
            const errorObject = {
                msg: 'An error occured',
                error, //...some error we got back
             }
             console.log(errorObject.error)
             reject(errorObject);
        }else{
            resolve(probs);
        }
    })
}

const googleQues=async(ques)=>{
    var res;
    await googleIt({'query':ques}).then(results=>{
       // console.log(results,"results");
        res=results;
    }).catch((err)=>{
        console.log(err)
    })
    return new Promise( (resolve,reject)=>{
       
        resolve(res);
    })
}
const getStatus = async(username) =>{
    let url=process.env.CF_BASEURL + 'user.status?handle=' + username;
    var data;
    var SubGraph;
  //  console.log(url);
    await fetch(url).then((res)=>res.json())
    .then(async(res)=>{
       
        data=res;
        const currentDate = new Date();
        const day = currentDate.getDate();
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const dateString = `${day} ${getMonthName(month)} ${year}`;
        const timeStamp = new Date(dateString).getTime();
        //console.log(timeStamp);
        const prev = `${day} ${getMonthName(month-1)} ${year}`;
        const prevtimeStamp = new Date(prev).getTime();
        console.log(prevtimeStamp,timeStamp);
        //console.log(res)
        SubGraph= await (getSub(data.result,prevtimeStamp/1000,timeStamp/1000));
        console.log(SubGraph)
        
    })
    return new Promise( (resolve,reject)=>{
       
        if(data.status!='OK'){
            const errorObject = {
                msg: 'An error occured',
                error, //...some error we got back
             }
             reject(errorObject);
        }
        else{
            resolve(SubGraph);
        }
    })
}


module.exports={
    getRating,
    getUpcoming,
    getRatingGraph,
    getInformation,
    googleQues,
    getVirtualList,
    getPredProblemSet,
    getStatus
}