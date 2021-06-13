const http = require("http");
const fetch= require('node-fetch')
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("ok");
});
server.listen(3000);
require("dotenv").config();
const Discord = require("discord.js");
const EasyEmbedPages = require('easy-embed-pages');
const client = new Discord.Client();
const quickchart = require("quickchart-js");
const fs= require("fs")
const {
  getRating,
  getUpcoming,
  getRatingGraph,
  getInformation,
  googleQues,
  getVirtualList,
  getPredProblemSet,
  getAC,
  getVirtualQues,
  getStatus,
  getPoints,
  getLastRatingChange,
} = require("./api_calls/basic");
const { UnixToDate } = require("./api_calls/util");
const { execute, skip, destroy } = require("./api_calls/song");
const { pred } = require("./api_calls/chatbot1");
client.login(process.env.BOT_ID).then().catch((err)=>
console.log(err));
client.on('debug', console.log);
//const Database = require("@replit/database")
const store= require('data-store')({  path: '/locadb.json' })
// const lastRating = new Map();
 const queue = new Map();
// const ids = new Map();
//const Keyv = new Database()
const Keyv= store
let serverId, channelId;

let chatnow = false;
let userId = undefined;
// let users = new Map();
// let friends = [];
let questions = [];
var startTime;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  setInterval(()=>{
    client.user.setActivity(" $help ", {
        type: "LISTENING",
      });
  },5000)
  setTimeout(async () => {
    //sendMessage(); // send the message once

    var dayMillseconds = 1000 * 60 * 10 * 1;
    setInterval(async function () {
      // repeat this every 24 hours
      //  sendMessage();
      //console.log(serverId)
      if (serverId) {
        if(!await Keyv.get(serverId+"friends") ){
        //  console.log("why")
          await Keyv.set(serverId+"friends",[]);
        }
        let list = client.guilds.cache.get(serverId);
        let channel = client.channels.cache.get(`${channelId}`);
        var traverse = await list.members.cache.map(async (member) => {
          let info = await Keyv.get(member.user.id+"userinfo");
          //console.log(info)
          if (info) {
            await getLastRatingChange(info.handle)
              .then(async (val) => {
                // console.log(channel,"dd")
                //console.log(lastRating.get(member.user.id),val)
                if (
                  await Keyv.get(member.user.id+"lastRating").ratingUpdateTimeSeconds !=
                  val.ratingUpdateTimeSeconds
                ) {
                  //console.log(val,"val")
                  //client.channels.cache.get(`${channelId}`).send(`<@${member.user.id}>`);
                  let rank;
                  if (val.rating >= 2300) {
                    rank = "international master";
                  } else if (val.newRating >= 2100) {
                    rank = "master";
                  } else if (val.newRating >= 1900) {
                    rank = "candidate master";
                  } else if (val.newRating >= 1600) {
                    rank = "expert";
                  } else if (val.newRating >= 1400) {
                    rank = "specialist";
                  } else if (val.newRating >= 1200) {
                    rank = "pupil";
                  } else {
                    rank = "newbie";
                  }
                  //console.log(rank)
                  let list = client.guilds.cache.get(serverId);
                  let role = list.roles.cache.find((r) => r.name === rank);
                  var color;

                  let rankarr = [
                    "newbie",
                    "pupil",
                    "specialist",
                    "expert",
                    "candidate master",
                    "master",
                    "international master",
                  ];
                  if (rank === "pupil") {
                    color = "GREEN";
                  } else if (rank === "specialist") {
                    color = "AQUA";
                  } else if (rank === "expert") {
                    color = "BLUE";
                  } else if (rank === "candidate master") {
                    color = "PURPLE";
                  } else if (rank === "master") {
                    color = "YELLOW";
                  } else if (rank === "international master") {
                    color = "ORANGE";
                  } else if (rank === "newbie") {
                    color = "GREY";
                  } else {
                    color = "RED";
                  }
                  if (!role) {
                    list.roles
                      .create({
                        data: {
                          name: rank,
                          setHoist: true,
                          color: color,
                        },
                        reason: "mdskcmasdfasdjfkjasdfkjsda",
                      })
                      .then(() => {
                        let roles = list.roles.cache.find(
                          (r) => r.name === info.rank
                        );
                        roles.setHoist(true).catch(console.error);
                        rankarr.forEach((element) => {
                          let role1 = list.roles.cache.find(
                            (r) => r.name === element
                          );
                          if (role1) {
                            member.roles.remove(role1);
                          }
                        });

                        member.roles.add(roles).catch(console.error);
                      })
                      .catch(console.error);
                    let url = "https://codeforces.com/profile/" + info.handle;
                    let cf = info.handle;
                    let myEmbed = new Discord.MessageEmbed()
                      .setColor("#0099ff")
                      .setURL(url)
                      .setDescription(
                        `Rating for <@${member.user.id}> got updated. [${cf}](${url})`
                      )
                      .addField("Old Rating: ", info.rating)
                      .addField("New Rating: ", val.newRating)
                      .addField("Updated Rank: ", rank);

                    client.channels.cache.get(`${channelId}`).send(myEmbed);
                    client.users.cache.get(`${member.user.id}`).send(myEmbed);
                    lastRating.set(member.user.id, val);
                    return;
                  }
                  let roles = list.roles.cache.find((r) => r.name === rank);

                  member.roles.add(roles).catch(console.error);
                  rankarr.forEach((element) => {
                    let role1 = list.roles.cache.find(
                      (r) => r.name === element
                    );
                    if (role1) {
                      member.roles.remove(role1);
                    }
                  });
                  let url = "https://codeforces.com/profile/" + info.handle;
                  let cf = info.handle;
                  let myEmbed = new Discord.MessageEmbed()
                    .setColor("#0099ff")
                    .setURL(url)
                    .setDescription(
                      `Rating for <@${member.user.id}> got updated. [${cf}](${url})`
                    )
                    .addField("Old Rating: ", info.rating)
                    .addField("New Rating: ", val.newRating)
                    .addField("Updated Rank: ", rank);
                  lastRating.set(member.user.id, val);
                  client.channels.cache.get(`${channelId}`).send(myEmbed);
                  client.users.cache.get(`${member.user.id}`).send(myEmbed);
                }
              })
              .catch((err) => {
                console.log(err);
              });
          }
        });
      }
    }, dayMillseconds);
  }, 0);
});
client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

//set handle
client.on("message", async (msg) => {
  if (!msg.guild) return;
  // console.log(serverId)
  serverId = msg.guild.id;
  channelId = msg.channel.id;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  if(msg.content.trim()=="$set"){
    return;
  }
  else if (msg.content.startsWith("$set")) {
    let words = msg.content.split(",");
    if(words.length!=2){
      msg.channel.send("Send valid username");
      return;
    }
    words[1]=words[1].trim();
    if(words[1]==""){
      msg.channel.send("Send valid username");
      return;
    }
    
    let arr = [];
    //friends.set(msg.author.id,arr);
    await getInformation(words[1]).then(async(info) => {
      await Keyv.set(msg.author.id+"ids", words[1]);
      await getLastRatingChange(words[1]).then(async(val) => {
        await Keyv.set(msg.author.id+"lastRating", val);
      }).catch((err)=>{
        msg.channel.send("Send valid username");
        return;
      });
      await Keyv.set(msg.author.id+"userInfo", info);
      let url = "https://codeforces.com/profile/" + words[1];
      let cf = words[1];
      let list = client.guilds.cache.get(serverId);
      let role = list.roles.cache.find((r) => r.name === info.rank);
      var color;

      let rank = [
        "newbie",
        "pupil",
        "specialist",
        "expert",
        "candidate master",
        "master",
        "international master",
      ];
      if (info.rank === "pupil") {
        color = "GREEN";
      } else if (info.rank === "specialist") {
        color = "AQUA";
      } else if (info.rank === "expert") {
        color = "BLUE";
      } else if (info.rank === "candidate master") {
        color = "PURPLE";
      } else if (info.rank === "master") {
        color = "YELLOW";
      } else if (info.rank === "international master") {
        color = "ORANGE";
      } else if (info.rank === "newbie") {
        color = "GREY";
      } else {
        color = "RED";
      }

      if (!role) {
        list.roles
          .create({
            data: {
              name: info.rank,
              setHoist: true,
              color: color,
            },
            reason: "mdskcmasdfasdjfkjasdfkjsda",
          })
          .then(() => {
            let roles = list.roles.cache.find((r) => r.name === info.rank);
            roles
              .setHoist(true)
              .then((updated) => console.log(`Role hoisted: ${updated.hoist}`))
              .catch(console.error);
            rank.forEach((element) => {
              let role1 = list.roles.cache.find((r) => r.name === element);
              if (role1) {
                msg.member.roles.remove(role1);
              }
            });

            msg.member.roles.add(roles).catch(console.error);

            let myEmbed = new Discord.MessageEmbed()
              .setColor("#0099ff")
              .setDescription(
                `CF handle for <@${msg.author.id}> registered.    [${cf}](${url})`
              )
              .addField("MaxRating: ", info.maxRating)
              .addField("Last Online: ", UnixToDate(info.lastOnlineTimeSeconds+5*60*60+30*60))
              .addField("Role added: ", info.rank);
            msg.channel.send(myEmbed);
          })
          .catch(console.error);

        return;
      }
      rank.forEach((element) => {
        let role1 = list.roles.cache.find((r) => r.name === element);
        if (role1) {
          msg.member.roles.remove(role1);
        }
      });
      let roles = list.roles.cache.find((r) => r.name === info.rank);

      msg.member.roles.add(roles).catch(console.error);

      let myEmbed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setDescription(
          `CF handle for <@${msg.author.id}> registered. [${cf}](${url})`
        )
        .addField("MaxRating: ", info.maxRating)
        .addField("Last Online: ", UnixToDate(info.lastOnlineTimeSeconds))
        .addField("Role added: ", info.rank);
      msg.channel.send(myEmbed);
    })
    .catch((err)=>{
      msg.channel.send("Send valid username");
      return;
    });
  }
});

//messaging,chat bot,Predicted Probles/Virtual helper

client.on("message", async (msg) => {
  if (!msg.guild) return;
  if (msg.author.bot) return;
  if (msg.content.startsWith("$bye") && userId != undefined) {
    if (msg.author.id != userId) {
      msg.react(`🇩`);
      msg.react(`🇺`);
      msg.react(`🇲`);
      msg.react(`🇧`);
      msg.react("😡");
      msg.reply("Are you blind? Cant you see I am having a conversation");
      return;
    }
    chatnow = false;
    userId = undefined;
    msg.channel.send("Ok bye dont talk to me loser!");
    return;
  }
  if (chatnow && msg.author.id === userId) {
    let mood = await pred(msg.content);
    if (mood == "good") {
      //chat.push("2a");
      msg.channel.send(
        "If you are interested in giving virtual contest, please reply with '$Yes' else with $bye"
      );
      chatnow = false;
    } else {
      msg.channel.send(
        "Do you want help with any topic?, If yes, reply '$TYes,{topic_name}' else with $bye"
      );
      chatnow = false;
    }
    return;
  } else if (chatnow) {
    msg.react(`🇩`);
    msg.react(`🇺`);
    msg.react(`🇲`);
    msg.react(`🇧`);
    msg.react("😡");
    msg.reply("Are you blind? Cant you see I am having a conversation");
    return;
  }
  if (!msg.content.startsWith("$")) return;
  if (msg.content.startsWith("$hi")) {
    if (chatnow && msg.author.id != userId) {
      msg.react(`🇩`);
      msg.react(`🇺`);
      msg.react(`🇲`);
      msg.react(`🇧`);
      msg.react("😡");
      msg.reply("Are you blind? Cant you see I am having a conversation");
      return;
    }
    if (!ids.get(msg.author.id)) {
      msg.channel.send(
        'Please set your cf handle using "$set,{your_id} before using this command again!.\n '
      );
      chatnow = false;
      userId = undefined;
      return;
    }
    chatnow = true;
    userId = msg.author.id;
    msg.channel.send("Hi, how are you doing today? (coding-wise) 😜");
  } else if (msg.content.startsWith("$Yes")) {
    if (msg.author.id != userId) {
      msg.react(`🇩`);
      msg.react(`🇺`);
      msg.react(`🇲`);
      msg.react(`🇧`);
      msg.react("😡");
      msg.reply("Are you blind? Cant you see I am having a conversation");
      return;
    }
    let words = msg.content.split(",");
    let cf_username = words[1];
    if (cf_username == "") {
      if (!await Keyv.get(msg.author.id+"ids")) {
        msg.channel.send(
          'Please set your cf handle using "$set,{your_id} and then try again.\n '
        );
        chatnow = false;
        userId = undefined;
        return;
      }
      cf_username = await Keyv.get(msg.author.id+"ids");
    }
    getVirtualList(cf_username, msg).then((res) => {});
    chatnow = false;
    userId = undefined;
  } else if (msg.content.startsWith("$TYes")) {
    if (msg.author.id != userId) {
      msg.react(`🇩`);
      msg.react(`🇺`);
      msg.react(`🇲`);
      msg.react(`🇧`);
      msg.react("😡");
      msg.reply("Are you blind? Can't you see I am having a conversation");
      return;
    }
    let info = await Keyv.get(msg.author.id+"userInfo");
    let url1 =
      "https://codepred.herokuapp.com/api/prediction/data?handle=" +
      info.handle;

    let words = msg.content.split(",");
    // let rating = users.get(msg.author.id).rating,
    topic = words[1].trim();
    let rating;
    await fetch(url1)
      .then((val) => val.json())
      .then((val) => {
        //console.log(val);
        rating = val.data[topic];
      }).catch(()=>{
        msg.channel.send("Send valid topic");
        chatnow = false;
        userId = undefined;
      })

    await getPredProblemSet(rating, msg, topic).then(async (res) => {
      if(!res.high.length){
        msg.channel.send("Send valid topic");
        chatnow = false;
        userId = undefined;
        return;
      }
      msg.channel.send(
        "Here are some recommended question to strengthen " + topic
      );
      res.high.length = 6;
      let temp = [];
      res.high.map(async (p) => {
        let link =
          "https://codeforces.com/problemset/problem/" +
          p.contestId +
          "/" +
          p.index;
        temp.push({
          name: p.name,
          value: "Submission Count: " + p.scnt + "  |  " + ` [Link](${link})  `,
          inline: false,
        });
        return p;
      });
      rating /= 100;
      rating = Math.round(rating);
      rating *= 100;
      let msgg = {
        color: 0x0099ff,
        title: "Rating " + (rating + 100) + " :",
        fields: temp,
      };
      msg.channel.send({ embed: msgg });
      res.same.length = 6;
      temp = [];
      res.same.map(async (p) => {
        let link =
          "https://codeforces.com/problemset/problem/" +
          p.contestId +
          "/" +
          p.index;
        temp.push({
          name: p.name,
          value: "Submission Count: " + p.scnt + "  |  " + ` [Link](${link})  `,
          inline: false,
        });
        return p;
      });
      msgg = {
        color: 0x0099ff,
        title: "Rating " + rating + " :",
        fields: temp,
      };
      msg.channel.send({ embed: msgg });
      res.low.length = 6;
      temp = [];
      res.low.map(async (p) => {
        let link =
          "https://codeforces.com/problemset/problem/" +
          p.contestId +
          "/" +
          p.index;
        temp.push({
          name: p.name,
          value: "Submission Count: " + p.scnt + "  |  " + ` [Link](${link})  `,
          inline: false,
        });
        return p;
      });
      msgg = {
        color: 0x0099ff,
        title: "Rating " + (rating - 100) + " :",
        fields: temp,
      };
      msg.channel.send({ embed: msgg });
      msg.channel.send("Good-Bye, hope I could be of help!");
      chatnow = false;
        userId = undefined;
    });
  }
});

//Rating, Rating graph, Pie Chart, info, google search basic funcs,
client.on("message", async(msg) => {
  if (!msg.guild) return;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  //to get the rating graph
  if(msg.content=="rGraph" || msg.content=="rating" || msg.content=="info" || msg.content=="status" || msg.content=="search" ){
    return;
  }
  else if (msg.content.startsWith("$rGraph")) {
    let words = msg.content.split(",");
    if(words.length!=2){
      msg.channel.send("Send valid username");
      return;
    }
     words[1]=words[1].trim();
    let cf_username = words[1].trim();
    if (cf_username == "") {
      if (!await Keyv.get(msg.author.id+"ids")) {
        msg.channel.send(
          'Please set your cf handle using "$set,{your_id} and then try again.\n '
        );
        chatnow = false;
        userId = undefined;
        return;
      }
      cf_username = await Keyv.get(msg.author.id+"ids");
    }
    await getRatingGraph(cf_username)
      .then(async (val) => {
        let msgg = "";

        const chart = new quickchart();
        chart
          .setConfig({
            type: "line",
            data: {
              labels: val.labels,
              datasets: val.datasets,
            },
            options: {
              scales: {
                yAxes: [
                  {
                    scaleLabel: {
                      display: true,
                      labelString: "Rating",
                    },
                  },
                ],
                xAxes: [
                  {
                    scaleLabel: {
                      display: true,
                      labelString: "Rank",
                    },
                  },
                ],
              },
            },
          })
          .setWidth(800)
          .setHeight(400);
        //making chart according to chart.js

        //convertint to json so that quickchart which uses this json to convert chart into pic
        const chartUrl = await chart.getShortUrl();
        const chartEmbed = {
          title: words[1],
          description: "Rating Graph",
          image: {
            url: chartUrl,
          },
        };
        msg.channel.send({ embed: chartEmbed });
      })
      .catch((err) => {
        msg.channel.send("Send valid username!");
      });
  }
  //to get only rating
  else if (msg.content.startsWith("$rating")) {
    let words = msg.content.split(",");
    if(words.length!=2){
      msg.channel.send("Send valid username");
      return;
    }
     words[1]=words[1].trim();
    let cf_username = words[1].trim();
    if (cf_username == ""|| words.length!=2) {
      if (!await Keyv.get(msg.author.id +"ids")) {
        msg.channel.send(
          'Please set your cf handle using "$set,{your_id} and then try again.\n '
        );
        chatnow = false;
        userId = undefined;
        return;
      }
      cf_username = await Keyv.get(msg.author.id +"ids");
      let info = await Keyv.get(msg.author.id+"userInfo");
      let rating = info.rating;
      let myEmbed = new Discord.MessageEmbed()

        .setColor("#0099ff")
        .setDescription(`Rating for <@${msg.author.id}> is ${rating}. GG <3 `);

      msg.channel.send(myEmbed);
      return;
    }
    await getRating(cf_username)
      .then((val) => {
        let msgg = "";
        let arr = val.result;
        let latest = arr[arr.length - 1];
        var rating = latest.newRating;
        let myEmbed = new Discord.MessageEmbed()

          .setColor("#0099ff")
          .setDescription(
            `Rating for <@${msg.author.id}> is ${rating}. GG <3 `
          );

        msg.channel.send(myEmbed);
        return;
      })
      .catch((err) => {
        msg.channel.send("Send valid username!");
      });
  }
  //to get upcoming scheduled cf contests
  else if (msg.content=="$upcoming") {
    channelId = msg.channel.id;
    getUpcoming().then((arr) => {
      arr.reverse();
      let temp = [];
      arr.forEach((val) => {
        let link = "<https://codeforces.com/contestRegistrants/" + val.id + ">";
        temp.push({
          name: val.name,
          value:
            "Date: " +
            UnixToDate(val.startTimeSeconds+5*60*60+1*30*60) +
            "  |  " +
            `[Link](${link})`,
          inline: false,
        });
        // msgg+='Name: '+ val.name + '\n';
        // msgg += 'Date: '+UnixToDate(val.startTimeSeconds) + '\n';
        // msgg+="Link: " + link +'\n';
      });
      let msgg = {
        color: 0x0099ff,
        title: "Upcoming Contests",
        fields: temp,
      };
      msg.channel.send({ embed: msgg });
    })
    .catch((err)=>{
      msg.channel.send(err);
    });
  }
  //toget info, profile pic rank rating country
  else if (msg.content.startsWith("$info")) {
    let words = msg.content.split(",");
    if(words.length!=2){
      msg.channel.send("Send valid username");
      return;
    }
     words[1]=words[1].trim();
    let cf_username = words[1].trim();
    if (cf_username == ""|| words.length!=2) {
      if (!await Keyv.get(msg.author.id+"ids")) {
        msg.channel.send(
          'Please set your cf handle using "$set,{your_id} and then try again.\n '
        );
        chatnow = false;
        userId = undefined;
        return;
      }
      cf_username = await Keyv.get(msg.author.id+"ids");
      let val = await Keyv.get(msg.author.id+"userInfo");
      let myEmbed = new Discord.MessageEmbed()

        .setColor("#0099ff")
        .setDescription(
          `Codeforces name for<@${msg.author.id}> is ${val.firstName} ${val.lastName} `
        )
        .addField("Country: ", val.country)
        .addField("Rank: ", val.rank)
        .setImage(val.titlePhoto);
      msg.channel.send(myEmbed);

      return;
    }
    getInformation(cf_username)
      .then((val) => {
        let myEmbed = new Discord.MessageEmbed()

          .setColor("#0099ff")
          .setDescription(
            `Codeforces name for @${val.handle} is ${val.firstName} ${val.lastName} `
          )
          .addField("Country: ", val.country)
          .addField("Organisation: ", val.organization)
          .addField("Rank: ", val.rank)
          .setImage(val.titlePhoto);
        msg.channel.send(myEmbed);

        return;
      })
      .catch((err) => {
        console.log(err);
        msg.channel.send("Send valid username!");
      });
  }
  //google search
  else if (msg.content.startsWith("$search")) {
    googleQues(msg.content.substr(8) + " solution")
      .then((val) => {
        //console.log(val)

        val = val.slice(0, 3);
        let temp = [];
        val.forEach((result, idx) => {
          temp.push({
            name: idx + 1 + ": " + result.title,
            value: `[Link](${result.link})`,
          });
        });
        let msgg = {
          color: 0x0099ff,
          title: "Top Google searches: ",
          fields: temp,
        };
        msg.channel.send({ embed: msgg });
      })
      .catch((err) => {
        console.log(err);
        msg.channel.send("Error");
      });
  } else if (
    msg.content.startsWith("$status")
  ) {
    let words = msg.content.split(",");
    if(words.length!=2){
      msg.channel.send("Send valid username");
      return;
    }
     words[1]=words[1].trim();
    let cf_username = words[1].trim();
    if (cf_username == ""|| words.length!=2) {
      if (!await Keyv.get(msg.author.id+"ids")) {
        msg.channel.send(
          'Please set your cf handle using "$set,{your_id} and then try again.\n '
        );
        chatnow = false;
        userId = undefined;
        return;
      }
      cf_username = await Keyv.get(msg.author.id+"ids");
      // let val=users.get(msg.author.id);

      getStatus(cf_username)
        .then(async (val) => {
          const chart = new quickchart();
          //console.log(val);
          chart
            .setConfig({
              type: "doughnut",
              data: {
                labels: ["AC", "WA", "TLE", "Others"],
                datasets: [
                  {
                    label: "Submissions Statistics",
                    data: val,

                    backgroundColor: [
                      "rgba(75, 192, 192, 1)",
                      "rgba(255, 99, 132, 1)",
                      "rgba(54, 162, 235, 1)",
                      "rgba(255, 206, 86, 1)",
                    ],
                  },
                ],
              },
              options: {
                legend: {
                  position: "bottom",
                },
                weight: 4,
              },
            })
            .setWidth(800)
            .setHeight(400);
          //making chart according to chart.js

          //convertint to json so that quickchart which uses this json to convert chart into pic
          const chartUrl = await chart.getShortUrl();
          //console.log(chartUrl)
          const chartEmbed = {
            title: words[1],
            description: `Submission Stats for ${cf_username}`,
            image: {
              url: chartUrl,
            },
          };
          msg.channel.send({ embed: chartEmbed });
        })
        .catch((err) => {
          msg.channel.send("An unknown error occured");
        });

      return;
    }

    getStatus(words[1])
      .then(async (val) => {
        let msgg = "";
        //console.log(val.datasets)
        const chart = new quickchart();
        // console.log(val);
        chart
          .setConfig({
            type: "doughnut",
            data: {
              labels: ["AC", "WA", "TLE", "Others"],
              datasets: [
                {
                  label: "Submissions Statistics",
                  data: val,

                  backgroundColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                  ],
                },
              ],
            },
            options: {
              legend: {
                position: "bottom",
              },
              weight: 4,
            },
          })
          .setWidth(800)
          .setHeight(400);
        //making chart according to chart.js

        //convertint to json so that quickchart which uses this json to convert chart into pic
        const chartUrl = await chart.getShortUrl();
        //console.log(chartUrl)
        const chartEmbed = {
          title: words[1],
          description: "Submission Stats",
          image: {
            url: chartUrl,
          },
        };
        msg.channel.send({ embed: chartEmbed });
      })
      .catch((err) => {
        msg.channel.send("An unknown error occured");
      });
  }
});

//leaderboard of two types, one by no of problem solved in the last month, other by current rating

client.on("message", async (msg) => {
  if (!msg.guild) return;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  if (msg.content==("$boardR")) {
   // let words = msg.content.split(",");
    let temp = [];
      let list = client.guilds.cache.get(serverId);
      let arr = [];
      let traverse2=await list.members.cache.map(async(member) => {
        // console.log(member.user.id,member.user.username)
        if (await Keyv.get(member.user.id+"userInfo")) {
          let info = await Keyv.get(member.user.id+"userInfo");
          arr.push({
            username: member.user.tag,
            id: member.user.id,
            rating: info.rating,
            info: info,
          });
          //  console.log(info)
        }
      });
      Promise.all(traverse2).then(async(nm)=>{
        let arr2 = [];
        if(!await Keyv.get(msg.guild.id+"friends") ){
        //  console.log("why god why")
          await Keyv.set(msg.guild.id+"friends",[]);
        }
        let friends=await Keyv.get(msg.guild.id+"friends");
        let traverse = await friends.map(async (friend) => {
          let info = await getInformation(friend.handle);
          arr.push({
            username: "NULL",
            rating: info.rating,
            info: info,
            friendOf: friend.friend,
          });
          return friend;
        });
        //console.log(traverse)
        Promise.all(traverse).then((nm) => {
          arr.sort((a, b) => b.rating - a.rating);
          arr.forEach((me, idx) => {
            let link = "https://codeforces.com/profile/" + me.info.handle;
            //console.log(me.info)
            if (me.username == "NULL") {
              temp.push({
                name: idx + 1 + `: ${me.info.handle}`,
                value:
                  "Curr Rating: " +
                  me.rating +
                  "    |   MaxRating: " +
                  me.info.maxRating +
                  `    |    Friend of <@${me.friendOf}>`,
              });
              return;
            }
            temp.push({
              name: idx + 1 + `: ${me.username}`,
              value:
                "Curr Rating: " +
                me.rating +
                "    |   MaxRating: " +
                me.info.maxRating +
                `    |    [${me.info.handle}](${link})`,
            });
          });
          let msgg = {
            color: 0x0099ff,
            title: "Leaderboard :",
            fields: temp,
          };
          msg.channel.send({ embed: msgg });
        });
      })
      
  }
  else if(msg.content=="$boardP"){
    let temp = [];
      let list = client.guilds.cache.get(serverId);
      let x = false;
      var arr = [];
      //let cnt=0;
      //use .map on to traverse on , Map.map() return an array of promises of every item , use Promise.all() to implement further
      var traverse = await list.members.cache.map(async (member) => {
        // console.log(member.user.id,member.user.username)
        if (await Keyv.get(member.user.id+"userInfo")) {
          let info = await Keyv.get(member.user.id+"userInfo");
          val = await getAC(info.handle);
          arr.push({
            username: member.user.tag,
            id: member.user.id,
            prob: val[0],
            avgRating: Math.round(val[1]),
            info: info,
          });
        }
        return member;
        // console.log(i)
      });
      //console.log(traverse)
      Promise.all(traverse).then(async (nm) => {
        if(!await Keyv.get(msg.guild.id+"friends") ){
        //  console.log("why god why")
          await Keyv.set(msg.guild.id+"friends",[]);
        }
        let friends=await Keyv.get(msg.guild.id+"friends");
        let traverse2 = await friends.map(async (friend) => {
          let info = await getInformation(friend.handle);
          val = await getAC(friend.handle);
          arr.push({
            username: "NULL",
            prob: val[0],
            avgRating: Math.round(val[1]),
            info: info,
            friendOf: friend.friend,
          });
          return friend;
        });
        Promise.all(traverse2).then((nm) => {
          arr.sort((a, b) => b.prob - a.prob);
          arr.forEach((me, idx) => {
            if (me.username == "NULL") {
              temp.push({
                name: idx + 1 + `: ${me.info.handle}`,
                value:
                  "Prob Solved: " +
                  me.prob +
                  "    |   AvgRatingofProblem: " +
                  me.avgRating +
                  `    |    Friend of <@${me.friendOf}>`,
              });
              return;
            }
            let link = "https://codeforces.com/profile/" + me.info.handle;
            temp.push({
              name: idx + 1 + `: ${me.username}`,
              value:
                "Prob Solved: " +
                me.prob +
                "    |   AvgRatingofProblem: " +
                me.avgRating +
                `    |    [${me.info.handle}](${link})`,
            });
          });
          let msgg = {
            color: 0x0099ff,
            title: "Leaderboard :",
            fields: temp,
          };
          msg.channel.send({ embed: msgg });
        });
      });
      //console.log(arr)
      //console.log("outside")
  }
});

//Virtual Contest of 30 minutes
client.on("message", async (msg) => {
  if (!msg.guild) return;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  if (msg.content==("$virtual")) {
    if (!await Keyv.get(msg.author.id+"ids")) {
      msg.channel.send(
        'Please set your cf handle using "$set,{your_id} before using this command again!.\n '
      );
      chatnow = false;
      userId = undefined;
      return;
    }
    let val = "";
    let list = client.guilds.cache.get(serverId);
    let t2=await list.members.cache.map(async(mem) => {
      if (await Keyv.get(mem.user.id+"ids")) {
        val += `<@${mem.user.id}> |`;
      }
    });
    Promise.all(t2).then(async(nm)=>{
      let msgg = {
        color: 0x0099ff,
        title: "Virtual Contest (60mins), (4 questions)",
        description:
          "The contest would begin in 5 minutes, the problem list along with link would provided at the start of the contest.",
        fields: [
          {
            name: "The bot would only consider submissions of registered users only:",
            value: val,
          },
        ],
      };
      msg.channel.send({ embed: msgg });
      msgg = {
        color: 0x0099ff,
        title: "Rules/Info",
        fields: [
          {
            name: "1. The problems are calculated according to the average rating of the users participating.",
            value: ":)",
          },
          {
            name: "2. The problems provided would be in the increasing order of rating and thus, each one having more points weightage than its previous.",
            value: " :)",
          },
          {
            name: "3. Please do not submit solution of any other question in between the contest.",
            value: ":) ",
          },
          {
            name: "4. A reminder would be provided 10 minutes before the Ending time of Contest.",
            value: ":) ",
          },
          {
            name: "5. Late submission carries equal penalty for all problems.",
            value: ":)",
          },
        ],
      };
      msg.channel.send({ embed: msgg });
      questions.length = 0;
  
      await setTimeout(async () => {
        let sum = 0,
          cnt = 0;
        let traverse=await list.members.cache.map(async(mem) => {
          if (await Keyv.get(mem.user.id+"userInfo")) {
            let info = await Keyv.get(mem.user.id+"userInfo");
            sum += info.rating;
            cnt++;
          }
        });
        Promise.all(traverse).then(async(nm)=>{
          let avgR = sum / cnt;
        avgR /= 100;
        avgR = Math.round(avgR);
        avgR *= 100;
        await getVirtualQues(avgR, msg).then((res) => {
          let temp = [];
          let len = res.loww.length;
          let idx = Math.floor(Math.random() * len) - 1;
          let p = res.loww[idx];
  
          let link =
            "https://codeforces.com/problemset/problem/" +
            p.contestId +
            "/" +
            p.index;
          temp.push({
            name: p.name,
            value: ` [Link](${link})   |  ` + "Points: " + 100,
            inline: false,
          });
          questions.push({ ques: p.contestId + p.index, points: 100 });
  
          len = res.low.length;
          idx = Math.floor(Math.random() * len) - 1;
          p = res.low[idx];
  
          link =
            "https://codeforces.com/problemset/problem/" +
            p.contestId +
            "/" +
            p.index;
          temp.push({
            name: p.name,
            value: ` [Link](${link})   |  ` + "Points: " + 200,
            inline: false,
          });
          questions.push({ ques: p.contestId + p.index, points: 200 });
  
          len = res.same.length;
          idx = Math.floor(Math.random() * len) - 1;
          p = res.same[idx];
  
          link =
            "https://codeforces.com/problemset/problem/" +
            p.contestId +
            "/" +
            p.index;
          temp.push({
            name: p.name,
            value: ` [Link](${link})   |  ` + "Points: " + 300,
            inline: false,
          });
          questions.push({ ques: p.contestId + p.index, points: 300 });
  
          len = res.high.length;
          idx = Math.floor(Math.random() * len) - 1;
          p = res.high[idx];
  
          link =
            "https://codeforces.com/problemset/problem/" +
            p.contestId +
            "/" +
            p.index;
          temp.push({
            name: p.name,
            value: ` [Link](${link})   |  ` + "Points: " + 400,
            inline: false,
          });
          questions.push({ ques: p.contestId + p.index, points: 400 });
          startTime = new Date().getTime();
          let msgg = {
            color: 0x0099ff,
            title: "1 hour to Go, All the Best ",
            fields: temp,
          };
          msg.channel.send({ embed: msgg });
        });
  
        await setTimeout(async () => {
          msg.channel.send("10 minutes to go!");
  
          await setTimeout(async () => {
            let arr = [];
            let list = client.guilds.cache.get(serverId);
            var trav = [];
            //use .map on to traverse on , Map.map() return an array of promises of every item , use Promise.all() to implement further
            trav = await list.members.cache.map(async (mem) => {
              if (await Keyv.get(mem.user.id+"userInfo")) {
                let info = await Keyv.get(mem.user.id+"userInfo");
                let pts = await getPoints(info.handle, questions, startTime);
                // console.log(trav)
                let time =
                  "Minutes: " +
                  (Math.round(pts[1] / 60) % 60) +
                  ", Seconds: " +
                  (pts[1] % 60);
                arr.push({
                  point: pts[0],
                  lastTime: time,
                  info: info,
                  username: mem.user.tag,
                  id: mem.user.id,
                });
              }
              return mem;
            });
            //console.log(trav)
            let temp = [];
            await Promise.all(trav)
              .then((nm) => {
                arr.sort((a, b) => b.pts - a.pts);
                arr.forEach((me, idx) => {
                  let link = "https://codeforces.com/profile/" + me.info.handle;
                  temp.push({
                    name: idx + 1 + `: ${me.username}`,
                    value:
                      "Points Scored: " +
                      me.point +
                      "    |   Time Taken(counted last correct submission): " +
                      me.lastTime +
                      `    |    [**${me.info.handle}**](${link})`,
                  });
                });
                let msgg = {
                  color: 0x0099ff,
                  title: "Final Standings :",
                  fields: temp,
                };
                msg.channel.send({ embed: msgg });
                questions.length = 0;
              })
              .catch((err) => {
                console.log(err);
              });
          }, 1000 * 60 * 9);
        }, 1000 * 60 * 50);
        })
      }, 1000 * 60 * 4);
    })
  }
  if (msg.content.startsWith("$standings")) {
    if (questions.length === 0) {
      let msgg = {
        color: 0x0099ff,
        title:
          "This command is only available during the virtual contest.\n Use $boardR/$boardP for leaderboard",
      };
      msg.channel.send({ embed: msgg });
      return;
    }
    let arr = [];
    let list = client.guilds.cache.get(serverId);
    var trav = [];
    //use .map on to traverse on , Map.map() return an array of promises of every item , use Promise.all() to implement further
    trav = await list.members.cache.map(async (mem) => {
      if (await Keyv.get(mem.user.id+"userInfo")) {
        let info = await Keyv.get(mem.user.id+"userInfo");
        let pts = await getPoints(info.handle, questions, startTime);
        // console.log(trav)
        let time =
          "Minutes: " +
          (Math.round(pts[1] / 60) % 60) +
          ", Seconds: " +
          (pts[1] % 60);
        arr.push({
          point: pts[0],
          lastTime: time,
          info: info,
          username: mem.user.tag,
          id: mem.user.id,
        });
      }
      return mem;
    });
    //console.log(trav)
    let temp = [];
    await Promise.all(trav)
      .then((nm) => {
        arr.sort((a, b) => a.pts - b.pts);
        arr.forEach((me, idx) => {
          let link = "https://codeforces.com/profile/" + me.info.handle;
          temp.push({
            name: idx + 1 + `: ${me.username}`,
            value:
              "Points Scored: " +
              me.point +
              "    |   Time Taken(counted last correct submission): " +
              me.lastTime +
              `    |    [${me.info.handle}](${link})`,
          });
        });
        let msgg = {
          color: 0x0099ff,
          title: " Current Standings :",
          fields: temp,
        };
        msg.channel.send({ embed: msgg });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

//help
client.on("message", async (msg) => {
  if (!msg.guild) return;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  if (msg.content.startsWith("$help")) {
    let words = msg.content.split(",");
    if (msg.content==("$help")) {
      let page1 = new Discord.MessageEmbed()
        .addField(
          `1: $set, - Used to link your cf_handle with your discord ID.`,
          `Use "$help,set" for more info regarding this. `
        )
        .addField(
          `2: $hi - Used to start a casual conversation with the bot!`,
          `Use "$help,hi" for more info regarding this. `
        )
        .addField(
          `3: $bye - Can only be used mid-conversation with the bot ($hi) `,
          `If you dont get it by now, you wont. `
        )
        .addField(
          `4: $rGraph, - Used to get Line graph of Rating Changes of any user on CF.`,
          `Use "$help,rGraph" for more info regarding this. `
        ).addField(
          `5: $virtual - Used to start a virtual contest for all registered users on the server.`,
          `Use "$help,virtual" for more info regarding this. `
        );
        let page2= new Discord.MessageEmbed()
        .addField(
          `6: $rating, - Used to get Current Rating of any user on CF.`,
          `Use "$help,rating" for more info regarding this. `
        )
        .addField(
          `7: $upcoming - Used to get a list of upcoming contest on CF`,
          `If you dont get it by now, you wont. `
        )
        .addField(
          `8: $info, - Used to get public information of any user on CF.`,
          `Use "$help,info" for more info regarding this. `
        )
        .addField(
          `9: $search - Used to get top google searches for any question's solution or any search in general.`,
          `Use "$help,search" for more info regarding this. `
        )
        .addField(
          `10: $status, - Used to get information regarding submissions of past 30 days of any user on CF`,
          `Use "$help,status" for more info regarding this. `
        );
        let page3=new Discord.MessageEmbed()
        .addField(
          `11: $boardR- Used to get the leaderboard containing all registered users on the server. (based on CF rating)`,
          `If you dont get it by now, you wont. `
        )
        .addField(
          `12: $boardP - Used to get the leaderboard containing all registered users on the server. (based on no of problems solved successfully in last 30 days.)`,
          `If you dont get it by now, you wont. `
        )
        .addField(
          `13: $play, - Used to play songs on the server according to mood.`,
          `Use "$help,play" for more info regarding this. `
        )
        .addField(
          `14: $skip - Used to skip the currently playing song.`,
          `If you dont get it by now, you wont. `
        )
        .addField(
          `15: $destroy - Used to destroy the currently playing queue for songs(skip all).`,
          `If you dont get it by now, you wont. `
        );
        let page4= new Discord.MessageEmbed()
        .addField(
          `16: $invite, - Used to get invite link of the bot.`,
          `If you dont get it by now, you wont. `
        )
        .addField(
          `17: $friend, - Used to add any cf user to your friend list .`,
          `The friend is added to the leaderboard. Format:$friend,username `
        )
        .addField(
          `18: $remove, - Used to remove any cf user from your friend list .`,
          `You can only remove your friend. Format:$remove,username `
        )
        ;
      const embed= new EasyEmbedPages(msg.channel,{
        pages:[
            page1.toJSON(),
            page2.toJSON(),
            page3.toJSON(),
            page4.toJSON()
        ],
        color:"RANDOM",
        title:"Help Desk | Command-Info",
        description:`The bot recognises only the following commands and all of them starts with "$".`,
        allowStop: false, // enable if you want the stop button to appear used to stop the interactive process
      time: 600000, // the idle time after which you want to stop the interactive process
      ratelimit: 1600 
      })
      embed.start();
    } else if (words[1] == "set") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(`Normal Format: $se, {cf_username}-$set,mafailure`);
      msg.channel.send(msgg);
    } else if (words[1] == "hi") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
                    `The chat bot replies and helps you according to your mood. Possible Fields in $TYes are dp, binary search, graphs, greedy, math, trees, strings, brute force, two pointers. \n For example: $TYes,dp`
        );
      msg.channel.send(msgg);
    } else if (words[1] == "rGraph") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `Normal Format: $` +
            words[1] +
            `,{cf_username}-$`+words[1]`,mafailure. \n "$` +
            words[1] +
            `," can be used if user wants to get the rating Graph of some user on CF. `
        );
      msg.channel.send(msgg);
    } else if (words[1] == "rating") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `Normal Format: $` +
            words[1] +
            `,{cf_username}-$`+words[1]`,mafailure. \n "$` +
            words[1] +
            `," can be used if user wants to get the rating  of some user on CF. `
        );
      msg.channel.send(msgg);
    } else if (words[1] == "info") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `Normal Format: $` +
            words[1] +
            `,{cf_username}-$`+words[1]`,mafailure. \n "$` +
            words[1] +
            `," can be used if user wants to get their info. `
        );
      msg.channel.send(msgg);
    } else if (words[1] == "status") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `Normal Format: $` +
            words[1] +
            `,{cf_username}-$`+words[1]`,mafailure. \n "$` +
            words[1] +
            `," can be used if user wants to get the distribution of submissions of some user on CF. `
        );
      msg.channel.send(msgg);
    } else if (words[1] == "search") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `Normal Format: $` + words[1] + ` {ques}-$set what is codeforces?.`
        );
      msg.channel.send(msgg);
    }  else if (words[1] == "play") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `Normal Format: $` +
            words[1] +
            `,{mood}. Ex: $play,happy \n 
            We have playlist for 5 possible moods - "happy","indie","rock","lofi","regular".`
        );
      msg.channel.send(msgg);
    } else if (words[1] == "virtual") {
      let msgg = {
        color: 0x0099ff,
        title: "Rules/Info",
        description:
          "The bot would only consider submissions of registered users only.",
        fields: [
          {
            name: "1. The problems are calculated according to the average rating of the users participating.",
            value: " ^.^",
          },
          {
            name: "2. The problems provided would be in the increasing order of rating and thus, each one having more points weightage than its previous.",
            value: "^.^ ",
          },
          {
            name: "3. Please do not submit solution of any other question in between the contest.",
            value: "^.^ ",
          },
          {
            name: "4. A reminder would be provided 10 minutes before the Ending time of Contest.",
            value: " ^.^",
          },
          {
            name: "5. Late submission carries equal penalty for all problems.",
            value: " ^.^",
          },
          {
            name: '6. Use "$standings," to get current standings of all users . ',
            value: " ^.^",
          },
        ],
      };
      msg.channel.send({ embed: msgg });
    }
  }
});
//invite link
client.on("message", async (msg) => {
  if (!msg.guild) return;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  if (msg.content==("$invite")) {
    let msgg = new Discord.MessageEmbed().setColor("#0099ff").setDescription(
      `Use this link to invite bot to any server.
          https://tiny.one/De-Codeforces`
    );
    msg.channel.send(msgg);
  }
});

//friends

client.on("message", async (msg) => {
  if (!msg.guild) return;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  if(msg.content=="$friend"){
    return;
  }
  else if (msg.content.startsWith("$friend")) {
    if(!await Keyv.get(msg.guild.id+"friends") ){
    //  console.log("why god why")
      await Keyv.set(msg.guild.id+"friends",[]);
    }
    let words = msg.content.split(",");
    let userId = msg.author.id;
    let list = client.guilds.cache.get(msg.guild.id);
    let present = false,
      friendOf;
      if(words.length!=2){
       msg.channel.send("Please enter a valid username");
        return;
    }
       words[1]=words[1].trim();
      
      if(words[1]=="" || words.length!=2){
        msg.channel.send("Please enter a valid username");
        return;
      }
      let friends=await Keyv.get(msg.guild.id+"friends")
     // console.log(msg.guild.id)
     // console.log(friends)
    await friends.forEach((f) => {
      if (f.handle == words[1]) {
        present = true;
        friendOf = f.friend;
      }
    });
    if (present) {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setDescription(
          `This user is already added as a friend of <@${friendOf}>. Get new friends , loser`
        );
      msg.channel.send(msgg);
      return;
    } else {
      await getInformation(words[1]).then(async(res)=>{
        friends.push({ friend: msg.author.id, handle: words[1] });
        await Keyv.set(msg.guild.id+"friends",friends)
      let url = "https://codeforces.com/profile/" + words[1];
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setDescription(
          `[${words[1]}](${url}) added as a friend of <@${userId}>`
        );
      msg.channel.send(msgg);
      })
      .catch((err)=>{
        msg.channel.send("Send valid username");
      return;
      })
    }
  }
});

//remove friends

client.on("message", async (msg) => {
  if (!msg.guild) return;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  if(msg.content=="$remove"){
    return;
  }
  else if (msg.content.startsWith("$remove")) {
    let words = msg.content.split(",");
    if(words.length!=2){
       msg.channel.send("Please enter a valid username");
        return;
    }
     words[1]=words[1].trim();
    if(words[1]=="" || words.length!=2){
      msg.channel.send("Please enter a valid username");
        return;
    }
    let ff,
      present = false;
    let newarr = [];
    let friends=await Keyv.get(msg.guild.id+"friends");
    friends.forEach((f) => {
      if (f.handle == words[1]) {
        ff = f;
        present = true;
      } else {
        newarr.push(f);
      }
    });
    if (!present) {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setDescription(
          `This cf_handle isnt friend of any user. Are you dreaming your imaginary friend again?`
        );
      msg.channel.send(msgg);
      return;
    }
    if (ff.friend != msg.author.id) {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setDescription(
          `Please don't try to remove someone else's friends, you loner!`
        );
      msg.channel.send(msgg);
      return;
    }
    friends = newarr;
    let msgg = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setDescription(
        `${words[1]} successfully removed from your friend's list `
      );
    msg.channel.send(msgg);
     Keyv.set(msg.guild.id+"friends",friends)
    return;
  }
});

//for songs

client.on("message", async (msg) => {
  if (!msg.guild) return;
  const ServerQueue = queue.get(msg.guild.id);
  //for multiple servers, different song queues for them
  //console.log(ServerQueue,msg.guild.id)
  if (msg.content.startsWith("$play")) {
    let msgg = "";
    await execute(msg, ServerQueue, queue);
    //msg.channel.send(msgg);
    return;
  } else if (msg.content==(`$skip`)) {
    await skip(msg, ServerQueue, queue);
    return;
  } else if (msg.content==(`$destroy`)) {
    await destroy(msg, ServerQueue, queue);
    return;
  }
});
