const fetch= require('node-fetch')
const {getLabels,getDatasets}=require('./util')


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
        //contest=arr[arr.length-1]
        //console.log(arr);
        //console.log(contest)
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

module.exports={
    getRating,
    getUpcoming,
    getRatingGraph
}