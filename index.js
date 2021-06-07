require("dotenv").config();
const Discord=require("discord.js");
const client=new Discord.Client()
const {getRating}=require('./api_calls/basic')
client.login(process.env.BOT_ID)

client.on("ready",()=>{
    console.log(`Logged in as ${client.user.tag}`);
})

client.on("message",(msg)=>{
    if(msg.author.id!='851159370984062986' && msg.content[0]=='$'){
       // console.log(`This is input message ${msg.content}`);
        //console.log(msg.author);
        // if(msg.content=="Hi"){
        //     msg.reply("Fuck you Pulkit")
        // }
        let words=msg.content.split(',');
        //console.log(words)
        if(words[0].substr(1)=='rating'){
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
    }
})
