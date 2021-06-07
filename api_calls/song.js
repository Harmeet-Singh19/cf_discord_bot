const {getInfo,getURLVideoID,getVideoID}=require('ytdl-core')
const ytdl = require("ytdl-core");

let songs={
    ["happy"]:['https://www.youtube.com/watch?v=zIC6tWwNyhk']
}


const play=(guild,song,queue)=>{
    //guild for which VC's queue to play song in

    const serverQueue=queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
      }
      const dispatcher = serverQueue.connection
      .play(ytdl(song.url),{ quality: 'highestaudio' })
      .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Now playing: **${song.title}**`);  
}

const execute=async(msg,ServerQueue,queue)=>{
    const words=msg.content.split(",");
    console.log(words)
    const currVC=msg.member.voice.channel;
    //member is a different guild object, where voice is also one(VOICESTATE), channel inside voice indicated voice cahnnel not text channel
    if(!currVC){
        return "You need to be in a voice channel to play the playlist! (stupid)";
    }
    //now use ytdl library to get information of every song in our playlist
    let msgg="";
    let idx=1;
    for(s in songs[words[1]]){
        const fullSongInfo=await getInfo(s);
        const song={
            title: fullSongInfo.videoDetails.title,
            url: fullSongInfo.videoDetails.video_url,}
        //if original channels queue is empty, no songs playing

        if(!ServerQueue){
            const NewQueueForCurrVC={
                textChannel: msg.channel,
                voiceChannel: currVC,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };
            //setting this newquue, in our map for this VC
            queue.set(msg.guild.id,ServerQueue);

            NewQueueForCurrVC.songs.push(song);
            //as no song is currently playong, we will try to connect it to VC
            try{
                var connection = await currVC.join();
                NewQueueForCurrVC.connection = connection;
                play(msg.guild, NewQueueForCurrVC.songs[0],queue);//play is another function to add the song to playlist
            }catch (err) {
                console.log(err);
                queue.delete(msg.guild.id);
                return err;
              }

        }
        else{
            ServerQueue.songs.push(song);
        }
        msgg+=`${idx} : ${song.title} `;
    }
    return msgg;
} 


module.exports={
    execute,
    play
}