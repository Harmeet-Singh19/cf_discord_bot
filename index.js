require("dotenv").config();
const Discord=require("discord.js");
const client=new Discord.Client()
const {getRating, getUpcoming}=require('./api_calls/basic')
const {UnixToDate}=require('./api_calls/util')
const {execute}=require('./api_calls/song')
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

    if(msg.content.startsWith('$rating')){
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


    if(msg.content.startsWith('$upcoming')){
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
})

//for songs

client.on("message",async(msg)=>{
    const ServerQueue=queue.get(msg.guild.id);
    //for multiple servers, different song queues for them

    if(msg.content.startsWith('$play')){
        let final= execute(msg,ServerQueue,queue);

        return msg.channel.send(final);
    } else if (msg.content.startsWith(`$skip`)) {
        await skip(msg, serverQueue);
        return;
      } else if (msg.content.startsWith(`$stop`)) {
        await stop(msg, serverQueue);
        return;
      }
})
