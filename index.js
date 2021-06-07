require("dotenv").config();
const Discord=require("discord.js");
const client=new Discord.Client()
const {getInfo,getURLVideoID,getVideoID}=require('ytdl-core')
const ytdl = require("ytdl-core");
const quickchart= require('quickchart-js')
const {getRating, getUpcoming,getRatingGraph,getInformation}=require('./api_calls/basic')
const {UnixToDate}=require('./api_calls/util')
const {execute,skip,destroy}=require('./api_calls/song')
client.login(process.env.BOT_ID)

client.on("ready",()=>{
    console.log(`Logged in as ${client.user.tag}`);
})
client.once("reconnecting", () => {
    console.log("Reconnecting!");
  });
  
client.once("disconnect", () => {
    console.log("Disconnect!");
});

const queue=new Map();


client.on("message",(msg)=>{
    if (msg.author.bot) return;
    if (!msg.content.startsWith('$')) return;
    if(msg.content.startsWith('$rGraph')){
        let words=msg.content.split(',');
        getRatingGraph(words[1]).then(async(val)=>{
            let msgg="";
            //console.log(val.datasets)
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
            //console.log(chartUrl)
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
    else if(msg.content.startsWith('$rating')){
        let words=msg.content.split(',');
        getRating(words[1]).then((val)=>{
            let msgg="";
            let arr=val.result;
            let latest=arr[arr.length-1];
            msgg=latest.handle + "-" + latest.newRating;
            msg.channel.send(msgg)
        }).catch((err)=>{
            msg.channel.send('Send valid username!')
        })
    }

    else if(msg.content.startsWith('$upcoming')){
        getUpcoming().then((arr)=>{
         //   console.log(arr)
         arr.reverse();
            let msgg="";
            arr.forEach(val => {
                msgg+='Name: '+ val.name + '\n';
                msgg += 'Date: '+UnixToDate(val.startTimeSeconds) + '\n';    
            });
            msg.channel.send(msgg)
        })
    }
    else if(msg.content.startsWith('$info')){
        let words=msg.content.split(',');
        console.log(words);
        getInformation(words[1]).then((val)=>{
            let msgg="";
            
            
            msgg='Name: ' + val.firstName + ' ' + val.lastName + '\n';
            msgg+='Country: ' + val.country +'\n';
            msgg+='Rank: ' + val.rank + '\n';

            msg.channel.send(msgg)
            msg.channel.send('Profile Pic: ',{files: [val.titlePhoto]});
        }).catch((err)=>{
            console.log(err)
            msg.channel.send('Send valid username!')
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


