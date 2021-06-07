const {getInfo,getURLVideoID,getVideoID}=require('ytdl-core')
const ytdl = require("ytdl-core");

let songs={
    ["happy"]:['https://www.youtube.com/watch?v=zIC6tWwNyhk']
}


const play=(guild,song,queue)=>{
    //guild for which VC's queue to play song in

    const serverQueue=queue.get(guild.id);
   // console.log(serverQueue)
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
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
}

const execute=async(msg,ServerQueue,queue)=>{
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
    let msgg="";
    let idx=1;
    //console.log(songs[words[1]])
    await songs[words[1]].forEach(async(s,index)=>{
       // console.log(s)
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
                await play(msg.guild, NewQueueForCurrVC.songs[0],queue);//play is another function to add the song to playlist
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
        if(index==songs[words[1]].length-1){
            msg.channel.send(msgg)
        }
    })
    console.log(msgg,"msg");
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