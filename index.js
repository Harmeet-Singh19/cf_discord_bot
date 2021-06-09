require("dotenv").config();
const Discord=require("discord.js");
const client=new Discord.Client()
const quickchart= require('quickchart-js')
const {getRating, getUpcoming,getRatingGraph,getInformation,googleQues,getVirtualList,getPredProblemSet}=require('./api_calls/basic')
const {UnixToDate}=require('./api_calls/util')
const {execute,skip,destroy}=require('./api_calls/song')
const {pred}=require('./api_calls/chatbot1')
client.login(process.env.BOT_ID)

client.on("ready",()=>{
    console.log(`Logged in as ${client.user.tag}`);
   client.user.setActivity("You grow as a beautiful human-being", { type: 'WATCHING' })
})
client.once("reconnecting", () => {
    console.log("Reconnecting!");
  });
  
client.once("disconnect", () => {
    console.log("Disconnect!");
});

const queue=new Map();
const ids=new Map();

let chatnow=false;
let userId=undefined;
let users=new Map();
//set handle
client.on("message",async(msg)=>{
    if (msg.author.bot) return;
    if (!msg.content.startsWith('$')) return;
    if(msg.content.startsWith('$set')){
        let words=msg.content.split(',');
        ids.set(msg.author.id,words[1]);
        await getInformation(words[1]).then((info)=>{
            users.set(msg.author.id,info);
            let url="https://codeforces.com/profile/"+words[1];
            let cf=(words[1]);
            let myEmbed= new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setURL(url)
            .setDescription(`CF handle for <@${msg.author.id}> registered. [${cf}](${url})`)
            .addField('MaxRating: ',info.maxRating,)
            .addField('Last Online: ',UnixToDate(info.lastOnlineTimeSeconds))
            msg.channel.send(myEmbed)
        })
    }
})

client.on("message",async(msg)=>{
    if (msg.author.bot) return;
    if(msg.content.startsWith('$bye') &&userId!=undefined){
        if(msg.author.id!=userId){
            msg.react('D');
            msg.react('U');
            msg.react('M');
            msg.react('B');
            msg.react('😡')
            msg.reply("Are you blind? Cant you see I am having a conversation")
            return
        }
        chatnow=false;
        userId=undefined
        msg.channel.send('Ok bye dont talk to me loser!');
        return;
    }
    if(chatnow &&  msg.author.id===userId){
            let mood=await pred(msg.content);
            if(mood=="good"){
                //chat.push("2a");
                msg.channel.send("If you are interested in giving virtual contest, please reply with '$Yes,");
                chatnow=false;
            }else{
                
                msg.channel.send("Do you want help with any topic?, If yes, reply $TYes,");
                chatnow=false;
            }
            return;    
    }
    else if(chatnow ){
        msg.react(`🇩`);
        msg.react(`🇺`);
        msg.react(`🇲`);
        msg.react(`🇧`);
        msg.react('😡')
        msg.reply("Are you blind? Cant you see I am having a conversation")
    }
    if (!msg.content.startsWith('$')) return;
     if(msg.content.startsWith('$hi')){
         if(!ids.get(msg.author.id)){
            msg.channel.send('Please set your cf handle using "$set,{your_id} before using this command again!.\n ');
            chatnow=false;
            userId=undefined;
            return;
         }
        chatnow=true;
        userId=msg.author.id;
        msg.channel.send("Hi, how are you doing today? (coding-wise) 😜");
    }
    else if(msg.content.startsWith('$Yes') ){
        if(msg.author.id!=userId){
            msg.react(`🇩`);
            msg.react(`🇺`);
            msg.react(`🇲`);
            msg.react(`🇧`);
            msg.react('😡')
            msg.reply("Are you blind? Cant you see I am having a conversation")
            return
        }
        let words=msg.content.split(',');
        let cf_username=words[1];
        if(cf_username==""){
            if(!ids.get(msg.author.id)){
                msg.channel.send('Please set your cf handle using "$set,{your_id} and then try again.\n ');
                chatnow=false;
                userId=undefined;
                return;
            }
            cf_username=ids.get(msg.author.id);
        }
        getVirtualList(cf_username,msg).then((res)=>{

        })
        chatnow=false;
        userId=undefined;
    }
    else if(msg.content.startsWith('$TYes') ){
        if(msg.author.id!=userId) {
            msg.react(`🇩`);
            msg.react(`🇺`);
            msg.react(`🇲`);
            msg.react(`🇧`);
            msg.react('😡')
            msg.reply("Are you blind? Can't you see I am having a conversation")
            return
        }
        let words=msg.content.split(',');
        let  rating=users.get(msg.author.id).rating,topic=words[1];
        
        getPredProblemSet(rating,msg,topic).then((res)=>{
            
           msg.channel.send('Here are some recommended question to strengthen '+ topic);
            res.high.length=6;
            let msgg="Rating "+ (res.rating+100) + ": \n\n";
            res.high.forEach((p)=>{
                msgg+=p.name +" \n No of Submissions: "+ p.scnt+  '\n';
                msgg+="Link: "+p.link +"\n"
            })
            msgg+='\n\n'
            res.same.length=6;
             msgg+="Rating "+ (res.rating) + ": \n\n";
            res.same.forEach((p)=>{
                msgg+=p.name +" \n No of Submissions: "+ p.scnt+ '\n';
                msgg+="Link: "+p.link +"\n"
            })
            msgg+='\n\n'
            res.low.length=6;
             msgg+="Rating "+ (res.rating-100) + ": \n\n";
            res.low.forEach((p)=>{
                msgg+=p.name +" \n No of Submissions: "+ p.scnt+  '\n';
                msgg+="Link: "+p.link +"\n"
            })
            msg.channel.send(msgg);
            msg.channel.send("Good-Bye, hope I could be of help!")
            chatnow=false;
            userId=undefined;
        })
    }
})

client.on("message",(msg)=>{
    if (msg.author.bot) return;
    if (!msg.content.startsWith('$')) return;
    //to get the rating graph
    if(msg.content.startsWith('$rGraph')){
        
        let words=msg.content.split(',');
        let cf_username=words[1];
        if(cf_username==""){
            if(!ids.get(msg.author.id)){
                msg.channel.send('Please set your cf handle using "$set,{your_id} and then try again.\n ');
                chatnow=false;
                userId=undefined;
                return;
            }
            cf_username=ids.get(msg.author.id);
        }
        getRatingGraph(cf_username).then(async(val)=>{
            let msgg="";

            const chart= new quickchart();
            chart.setConfig({
                type:'line',
                data:{
                    labels:val.labels,
                    datasets:val.datasets
                },
                options : {
                    scales: {
                      yAxes: [{
                        scaleLabel: {
                          display: true,
                          labelString: 'Rating'
                        }
                      }],
                      xAxes:[{
                          scaleLabel:{
                              display:true,
                              labelString:'Rank'
                          }
                      }]
                    }     
                  }
            })
            .setWidth(800)
            .setHeight(400);
            //making chart according to chart.js
            
            //convertint to json so that quickchart which uses this json to convert chart into pic
            const chartUrl = await chart.getShortUrl();
            const chartEmbed = {
                title: words[1],
                description: 'Rating Graph',
                image: {
                  url: chartUrl,
                },
              };
               msg.channel.send({ embed: chartEmbed });
        }).catch((err)=>{
            msg.channel.send('Send valid username!')
         })
    }
    //to get only rating
    else if(msg.content.startsWith('$rating')){
        let words=msg.content.split(',');
        let cf_username=words[1];
        if(cf_username==""){
            if(!ids.get(msg.author.id)){
                msg.channel.send('Please set your cf handle using "$set,{your_id} and then try again.\n ');
                chatnow=false;
                userId=undefined;
                return;
            }
            cf_username=ids.get(msg.author.id);
            let info=users.get(msg.author.id);
            msg.channel.send(info.handle+ " - " + info.rating);
            return;
        }
        getRating(cf_username).then((val)=>{
            let msgg="";
            let arr=val.result;
            let latest=arr[arr.length-1];
            msgg=latest.handle + "-" + latest.newRating;
            msg.channel.send(msgg)
        }).catch((err)=>{
            msg.channel.send('Send valid username!')
        })
    }
    //to get upcoming scheduled cf contests
    else if(msg.content.startsWith('$upcoming')){
        getUpcoming().then((arr)=>{
         arr.reverse();
            let temp=[]
            arr.forEach(val => {
                let link="<https://codeforces.com/contestRegistrants/"+val.id +">";
                temp.push({name:val.name,value:'Date: '+UnixToDate(val.startTimeSeconds)  +"  |  "+`[Link: ](${link})` ,inline:false})
                // msgg+='Name: '+ val.name + '\n';
                // msgg += 'Date: '+UnixToDate(val.startTimeSeconds) + '\n';
                // msgg+="Link: " + link +'\n';    
            });
            let msgg={
                color: 0x0099ff,
	            title: 'Upcoming Contests',
                fields:temp,

            }
            msg.channel.send({embed:msgg});
        })
    }
    //toget info, profile pic rank rating country
    else if(msg.content.startsWith('$info')){
        let words=msg.content.split(',');
        let cf_username=words[1];
        if(cf_username==""){
            if(!ids.get(msg.author.id)){
                msg.channel.send('Please set your cf handle using "$set,{your_id} and then try again.\n ');
                chatnow=false;
                userId=undefined;
                return;
            }
            cf_username=ids.get(msg.author.id);
            let val=users.get(msg.author.id);
            let msgg=``;   
            msgg='Name: ' + val.firstName + ' ' + val.lastName + '\n';
            msgg+='Country: ' + val.country +'\n';
            msgg+='Rank: ' + val.rank + '\n';
            msg.channel.send(msgg)
            msg.channel.send(`Profile Pic: `,{files: [val.titlePhoto]});
            return;
        }
        getInformation(cf_username).then((val)=>{
            let msgg=``;   
            msgg='Name: ' + val.firstName + ' ' + val.lastName + '\n';
            msgg+='Country: ' + val.country +'\n';
            msgg+='Rank: ' + val.rank + '\n';
            msg.channel.send(msgg)
            msg.channel.send(`Profile Pic: `,{files: [val.titlePhoto]});
        }).catch((err)=>{
            console.log(err)
            msg.channel.send('Send valid username!')
        })
    
    }
    //google search
    else if(msg.content.startsWith('$search')){
        googleQues(msg.content.substr(8) + " solution").then((val)=>{
            //console.log(val)
           let msgg="";
           val=val.slice(0,3);
           val.forEach((result,idx)=>{
               msgg+=(idx +1) +": "+ "Title: "+ result.title + " \n Link: <" +result.link +"> \n";
           })
            msg.channel.send(msgg);
        }).catch((err)=>{
            console.log(err)
            msg.channel.send("Error")
        })
    }

})

//for songs

client.on("message",async(msg)=>{
    const ServerQueue=queue.get(msg.guild.id);
    //for multiple servers, different song queues for them
    //console.log(ServerQueue,msg.guild.id)
    if(msg.content.startsWith('$play')){
        let msgg="";
        await execute(msg,ServerQueue,queue);
        //msg.channel.send(msgg);
        return;
    } else if (msg.content.startsWith(`$skip`)) {
        await skip(msg,ServerQueue,queue);
        return;
      } else if (msg.content.startsWith(`$destroy`)) {
        await destroy(msg,ServerQueue,queue);
        return;
      }
})


