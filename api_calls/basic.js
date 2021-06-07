const fetch= require('node-fetch')


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

module.exports={
    getRating
}