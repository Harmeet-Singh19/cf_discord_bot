const {getInfo,getURLVideoID,getVideoID}=require('ytdl-core')
const ytdl = require("ytdl-core");

var songs={
    ["happy"]:['https://youtu.be/ru0K8uYEZWw','https://www.youtube.com/watch?v=tt2k8PGm-TI','https://youtu.be/YykjpeuMNEk',
    'https://youtu.be/d_HlPboLRL8',
    'https://youtu.be/nfWlot6h_JM',
    'https://youtu.be/09R8_2nJtjg',
    'https://youtu.be/1G4isv_Fylg',
    'https://youtu.be/IcrbM1l_BoI',
    'https://youtu.be/qK_NeRZOdq4'],
    ["lofi"]:['https://youtu.be/XDpoBc8t6gE','https://youtu.be/GgVcgbtHY9k','https://youtu.be/2VMSdwRCKaU',
    'https://youtu.be/jJPMnTXl63E','https://youtu.be/rCFmLjGq3Jg','https://youtu.be/WTsmIbNku5g','https://youtu.be/qz7tCZE_3wA',
    'https://youtu.be/1WGCADztYKs'],
    ["indie"]:['https://youtu.be/2g5xkLqIElU','https://youtu.be/2SUwOgmvzK4','https://youtu.be/pFptt7Cargc','https://youtu.be/f3OQKhhKhsA','https://youtu.be/r_LFDK49I6s','https://youtu.be/Z9e7K6Hx_rY','https://youtu.be/DxvFdX2yOBI','https://youtu.be/fHBIj4BF5xc'],
    ["rock"]:['https://youtu.be/zQ3PeDGswz4','https://youtu.be/XFkzRNyygfk','https://youtu.be/fHiGbolFFGw','https://youtu.be/hTWKbfoikeg','https://youtu.be/kXYiU_JCYtU','https://youtu.be/Soa3gO7tL-c','https://youtu.be/HyHNuVaZJ-k']
}


const play=(guild,song,queue)=>{
    //guild for which VC's queue to play song in

    const serverQueue=queue.get(guild.id);
   // console.log(serverQueue)
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        serverQueue.textChannel.send(`Bbye no song left to play,now study! `);  
        return;
      }
      const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0],queue);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Now playing: **${song.title}**`);  
    return new Promise((resolve,reject)=>{
        resolve(serverQueue);
    })
}

const execute=async(msg, ServerQueue,queue)=>{
    const words=msg.content.split(",");
    //console.log(words)
    const currVC=msg.member.voice.channel;
    //member is a different guild object, where voice is also one(VOICESTATE), channel inside voice indicated voice cahnnel not text channel
    if(!currVC){
      //  console.log("gg")
        msg.channel.send("You need to be in a voice channel to play the playlist! (stupid)");
        return;
    }
    //now use ytdl library to get information of every song in our playlist
    var msgg="";
    let idx=1;
    //console.log(songs[words[1]])
    let s=songs[words[1]][0];
    //console.log(s)
    const fullSongInfo=await getInfo(s);
    const song={
        title: fullSongInfo.videoDetails.title,
        url: fullSongInfo.videoDetails.video_url,}
        msgg+= idx + " : " + song.title +"\n";
        //console.log(msgg,"beech mei");
    idx++;  
    //if original channels queue is empty, no songs playing
    //console.log(song)
    if(ServerQueue==undefined){
        //console.log("newqueue")
        const NewQueueForCurrVC={
            textChannel: msg.channel,
            voiceChannel: currVC,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };
        //setting this newquue, in our map for this VC
        queue.set(msg.guild.id,NewQueueForCurrVC);

        NewQueueForCurrVC.songs.push(song);
        //as no song is currently playong, we will try to connect it to VC
        try{
            var connection = await currVC.join();
            NewQueueForCurrVC.connection = connection;
            await play(msg.guild, NewQueueForCurrVC.songs[0],queue).then((ServerQueue)=>{

                songs[words[1]].forEach(async(s,index)=>{
                    if(index<1){
                        return;
                    }
                    //console.log(s,"inside")
                    const fullSongInfo=await getInfo(s);
                    const song={
                        title: fullSongInfo.videoDetails.title,
                        url: fullSongInfo.videoDetails.video_url,}
                        msgg+= idx + " : " + song.title +"\n";
                        //console.log(msgg,"beech mei");
                    idx++;  
                    //if original channels queue is empty, no songs playing
                   // console.log(song)
                    ServerQueue.songs.push(song);
                    //console.log(ServerQueue.songs)
                    if(index==songs[words[1]].length-1){
                        msg.channel.send(msgg)
                    }
                })
            })
               //play is another function to add the song to playlist
        }catch (err) {
            console.log(err);
            queue.delete(msg.guild.id);
            msg.channel.send('error');
            return;
          }

    }
    else{
        ServerQueue.songs.push(song);
    }
    //console.log(msgg,"msg");
    //await msg.channel.send(msgg)
    return ;
}

const skip=(msg,ServerQueue,queue)=>{
    const currVC=msg.member.voice.channel;
    //member is a different guild object, where voice is also one(VOICESTATE), channel inside voice indicated voice cahnnel not text channel
    if(!currVC){
      //  console.log("gg")
        msg.channel.send("You need to be in a voice channel to play the playlist! (stupid)");
        return;
    }
    if (!ServerQueue)
    return msg.channel.send("There is no song that I could skip!");
    //dispatcher fucntion humne play mei define kra tha,uske method on finish vala
    ServerQueue.connection.dispatcher.end();
    msg.channel.send("Skipped successfully!");
}

const destroy=(msg,ServerQueue,queue)=>{
    const currVC=msg.member.voice.channel;
    //member is a different guild object, where voice is also one(VOICESTATE), channel inside voice indicated voice cahnnel not text channel
    if(!currVC){
      //  console.log("gg")
        msg.channel.send("You need to be in a voice channel to play the playlist! (stupid)");
        return;
    }
    if (!ServerQueue)
    return msg.channel.send("There is no song that I could skip!");
    //dispatcher fucntion humne play mei define kra tha,uske method on finish vala
    ServerQueue.songs=[]
    ServerQueue.connection.dispatcher.end();
    msg.channel.send("Au Revoir! Happy Coding");
}


module.exports={
    execute,
    play,
    skip,
    destroy
}