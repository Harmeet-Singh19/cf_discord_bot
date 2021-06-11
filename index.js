const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('ok');
});
server.listen(3000);
require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const quickchart = require("quickchart-js");
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
client.login(process.env.BOT_ID);

const lastRating = new Map();
const queue = new Map();
const ids = new Map();
let serverId, channelId;

let chatnow = false;
let userId = undefined;
let users = new Map();
let friends= new Map();
let questions = [];
var startTime;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity(" $help, ", {
    type: "LISTENING",
  });
  setTimeout(async () => {
    //sendMessage(); // send the message once

    var dayMillseconds = 1000 * 60 * 10 * 1;
    setInterval(async function () {
      // repeat this every 24 hours
      //  sendMessage();
      //console.log(serverId)
      if (serverId) {
        let list = client.guilds.cache.get(serverId);
        let channel = client.channels.cache.get(`${channelId}`);
        var traverse = await list.members.cache.map(async (member) => {
          let info = users.get(member.user.id);
          //console.log(info)
          if (info) {
            await getLastRatingChange(info.handle)
              .then(async (val) => {
                // console.log(channel,"dd")
                //console.log(lastRating.get(member.user.id),val)
                if (
                  lastRating.get(member.user.id).ratingUpdateTimeSeconds !=
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
                  } else {
                    rank = "pupil";
                  }
                  //console.log(rank)
                  let list = client.guilds.cache.get(serverId);
                  let role = list.roles.cache.find(
                    (r) => r.name === "international master"
                  );
                  var color;

                  let rankarr = [
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
                        roles
                          .setHoist(true)
                          .catch(console.error);
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
  if (msg.content.startsWith("$set")) {
    let words = msg.content.split(",");
    ids.set(msg.author.id, words[1]);
    await getLastRatingChange(words[1]).then((val) => {
      lastRating.set(msg.author.id, val);
    });
    await getInformation(words[1]).then((info) => {
      users.set(msg.author.id, info);
      let url = "https://codeforces.com/profile/" + words[1];
      let cf = words[1];
      let list = client.guilds.cache.get(serverId);
      let role = list.roles.cache.find((r) => r.name === info.rank);
      var color;
      let rank = [
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
              .addField("Last Online: ", UnixToDate(info.lastOnlineTimeSeconds))
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
        "If you are interested in giving virtual contest, please reply with '$Yes, else with $bye"
      );
      chatnow = false;
    } else {
      msg.channel.send(
        "Do you want help with any topic?, If yes, reply $TYes,{topic_name} else with $bye"
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
    if(chatnow && msg.author.id!=userId){
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
      if (!ids.get(msg.author.id)) {
        msg.channel.send(
          'Please set your cf handle using "$set,{your_id} and then try again.\n '
        );
        chatnow = false;
        userId = undefined;
        return;
      }
      cf_username = ids.get(msg.author.id);
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
    let words = msg.content.split(",");
    let rating = users.get(msg.author.id).rating,
      topic = words[1];
      let info=users.get(msg.author.id)
      let url="https://codepred.herokuapp.com/api/prediction/data?handle="+info.handle;
      await fetch(url).then((res)=>res.json()).then((data)=>{

      })

    getPredProblemSet(rating, msg, topic).then(async (res) => {
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
          value:
            "Submission Count: " + p.scnt + "  |  " + ` [Link](${link})  `,
          inline: false,
        });
        return p;
      });
      rating/=100;
      rating=Math.round(rating);
      rating*=100;
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
          value:
            "Submission Count: " + p.scnt + "  |  " + ` [Link](${link})  `,
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
          value:
            "Submission Count: " + p.scnt + "  |  " + ` [Link](${link})  `,
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
      msg.channel.send("Good-Bye, hope I could be of help!")
    });
  }
});

//Rating, Rating graph, Pie Chart, info, google search basic funcs,
client.on("message", (msg) => {
  if (!msg.guild) return;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  //to get the rating graph
  if (msg.content.startsWith("$rGraph")) {
    let words = msg.content.split(",");
    let cf_username = words[1];
    if (cf_username == "") {
      if (!ids.get(msg.author.id)) {
        msg.channel.send(
          'Please set your cf handle using "$set,{your_id} and then try again.\n '
        );
        chatnow = false;
        userId = undefined;
        return;
      }
      cf_username = ids.get(msg.author.id);
    }
    getRatingGraph(cf_username)
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
    let cf_username = words[1];
    if (cf_username == "") {
      if (!ids.get(msg.author.id)) {
        msg.channel.send(
          'Please set your cf handle using "$set,{your_id} and then try again.\n '
        );
        chatnow = false;
        userId = undefined;
        return;
      }
      cf_username = ids.get(msg.author.id);
      let info = users.get(msg.author.id);
      let rating=info.rating;
            let myEmbed= new Discord.MessageEmbed()
            
            .setColor('#0099ff')
            .setDescription(`Rating for <@${msg.author.id}> is ${rating}. GG <3 `)
            
            msg.channel.send(myEmbed)
            return;
    }
    getRating(cf_username)
      .then((val) => {
        let msgg = "";
        let arr = val.result;
        let latest = arr[arr.length - 1];
       var rating = latest.newRating;
            let myEmbed= new Discord.MessageEmbed()
            
            .setColor('#0099ff')
            .setDescription(`Rating for <@${msg.author.id}> is ${rating}. GG <3 `)
            
            msg.channel.send(myEmbed)
            return;
      })
      .catch((err) => {
        msg.channel.send("Send valid username!");
      });
  }
  //to get upcoming scheduled cf contests
  else if (msg.content.startsWith("$upcoming")) {
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
            UnixToDate(val.startTimeSeconds) +
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
    });
  }
  //toget info, profile pic rank rating country
  else if (msg.content.startsWith("$info")) {
    let words = msg.content.split(",");
    let cf_username = words[1];
    if (cf_username == "") {
      if (!ids.get(msg.author.id)) {
        msg.channel.send(
          'Please set your cf handle using "$set,{your_id} and then try again.\n '
        );
        chatnow = false;
        userId = undefined;
        return;
      }
      cf_username = ids.get(msg.author.id);
      let val = users.get(msg.author.id);
      let myEmbed= new Discord.MessageEmbed()
            
            .setColor('#0099ff')
            .setDescription(`Codeforces name for<@${msg.author.id}> is ${val.firstName} ${val.lastName} `)
            .addField('Country: ',val.country,)
            .addField('Rank: ',val.rank,)
            .setImage(val.titlePhoto)
            msg.channel.send(myEmbed)
            
            return;
    }
    getInformation(cf_username)
      .then((val) => {
       let myEmbed= new Discord.MessageEmbed()
            
            .setColor('#0099ff')
            .setDescription(`Codeforces name for @${val.handle} is ${val.firstName} ${val.lastName} `)
            .addField('Country: ',val.country,)
            .addField('Organisation: ',val.organization)
            .addField('Rank: ',val.rank,)
            .setImage(val.titlePhoto)
            msg.channel.send(myEmbed)
            
            
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
        let temp=[]
        val.forEach((result, idx) => {
          temp.push({name:(idx+1)+": " + result.title,value:`[Link](${result.link})`})
          
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
    msg.content.startsWith("$Status") ||
    msg.content.startsWith("$status")
  ) {
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
           // let val=users.get(msg.author.id);
            

            getStatus(cf_username).then(async(val)=>{
                
                const chart= new quickchart();
                console.log(val);
                chart.setConfig({
                    type:'doughnut',
                    data:{
                        labels:["AC","WA","TLE","Others"],
                        datasets:[
                            {
                                label:"Submissions Statistics",
                                data: val,
                                
                                backgroundColor:[
                                    "rgba(75, 192, 192, 1)",
                                    "rgba(255, 99, 132, 1)",
                                    "rgba(54, 162, 235, 1)",
                                    "rgba(255, 206, 86, 1)"
                                ]
                            }
                        ]
                    },
                    options : {
                        legend:{
                            position: "bottom"
                        },
                        weight: 4
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
                    description: `Submission Stats for ${cf_username}`,
                    image: {
                      url: chartUrl,
                    },
                  };
                   msg.channel.send({ embed: chartEmbed });
            }).catch((err)=>{
                msg.channel.send('Send valid username!')
             })
            
            return;
        }

        getStatus(words[1]).then(async(val)=>{
            let msgg="";
            //console.log(val.datasets)
            const chart= new quickchart();
           // console.log(val);
            chart.setConfig({
                type:'doughnut',
                data:{
                    labels:["AC","WA","TLE","Others"],
                    datasets:[
                        {
                            label:"Submissions Statistics",
                            data: val,
                            
                            backgroundColor:[
                                "rgba(75, 192, 192, 1)",
                                "rgba(255, 99, 132, 1)",
                                "rgba(54, 162, 235, 1)",
                                "rgba(255, 206, 86, 1)"
                            ]
                        }
                    ]
                },
                options : {
                    legend:{
                        position: "bottom"
                    },
                    weight: 4
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
                description: 'Submission Stats',
                image: {
                  url: chartUrl,
                },
              };
               msg.channel.send({ embed: chartEmbed });
        }).catch((err)=>{
            msg.channel.send('Send valid username!')
         })
  }
});

//leaderboard of two types, one by no of problem solved in the last month, other by current rating

client.on("message", async (msg) => {
  if (!msg.guild) return;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  if (msg.content.startsWith("$lboard")) {
    let words = msg.content.split(",");
    if (words[1] == "R") {
      let temp = [];
      let list = client.guilds.cache.get(serverId);
      let arr = [];
      list.members.cache.forEach((member) => {
        // console.log(member.user.id,member.user.username)
        if (users.get(member.user.id)) {
          let info = users.get(member.user.id);
          arr.push({
            username: member.user.tag,
            id: member.user.id,
            rating: info.rating,
            info: info,
          });
        }
      });
      arr.sort((a, b) => b.rating - a.rating);
      arr.forEach((me, idx) => {
        let link = "https://codeforces.com/profile/" + me.info.handle;
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
    } else if (words[1] == "P") {
      let temp = [];
      let list = client.guilds.cache.get(serverId);
      let x = false;
      var arr = [];
      //let cnt=0;
      //use .map on to traverse on , Map.map() return an array of promises of every item , use Promise.all() to implement further
      var traverse = await list.members.cache.map(async (member) => {
        // console.log(member.user.id,member.user.username)
        if (users.get(member.user.id)) {
          let info = users.get(member.user.id);
          val = await getAC(info.handle);
          arr.push({
            username: member.user.tag,
            id: member.user.id,
            prob: val[0],
            avgRating: val[1],
            info: info,
          });
        }
        return member;
        // console.log(i)
      });
      //console.log(traverse)
      Promise.all(traverse).then((nm) => {
        arr.sort((a, b) => b.prob - a.prob);
        arr.forEach((me, idx) => {
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
      //console.log(arr)
      //console.log("outside")
    }
  }
});

//Virtual Contest of 30 minutes
client.on("message", async (msg) => {
  if (!msg.guild) return;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  if (msg.content.startsWith("$virtual")) {
    if (!ids.get(msg.author.id)) {
      msg.channel.send(
        'Please set your cf handle using "$set,{your_id} before using this command again!.\n '
      );
      chatnow = false;
      userId = undefined;
      return;
    }
    let val = "";
    let list = client.guilds.cache.get(serverId);
    list.members.cache.forEach((mem) => {
      if (users.get(mem.user.id)) {
        val += `<@${mem.user.id}> |`;
      }
    });
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
      list.members.cache.forEach((mem) => {
        if (users.get(mem.user.id)) {
          let info = users.get(mem.user.id);
          sum += info.rating;
          cnt++;
        }
      });
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
            if (users.get(mem.user.id)) {
              let info = users.get(mem.user.id);
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
    }, 1000 * 60 * 4);
  }
  if (msg.content.startsWith("$standings")) {
    if (questions.length === 0) {
      let msgg = {
        color: 0x0099ff,
        title:
          "This command is only available during the virtual contest.\n Use $lboard,R/P for leaderboard",
      };
      msg.channel.send({ embed: msgg });
      return;
    }
    let arr = [];
    let list = client.guilds.cache.get(serverId);
    var trav = [];
    //use .map on to traverse on , Map.map() return an array of promises of every item , use Promise.all() to implement further
    trav = await list.members.cache.map(async (mem) => {
      if (users.get(mem.user.id)) {
        let info = users.get(mem.user.id);
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
    if (words[1] === "") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help Desk | Command-Info")
        .setDescription(
          `The bot recognises only the following commands and all of them starts with "$".`
        )
        .addField(
          `$set, - Used to link your cf_handle with your discord ID.`,
          `Use "$help,set" for more info regarding this. `
        )
        .addField(
          `$hi, - Used to start a casual conversation with the bot!`,
          `Use "$help,hi" for more info regarding this. `
        )
        .addField(
          `$bye, - Can only be used mid-conversation with the bot ($hi,) `,
          `If you dont get it by now, you wont. `
        )
        .addField(
          `$rGraph, - Used to get Line graph of Rating Changes of any user on CF.`,
          `Use "$help,rGraph" for more info regarding this. `
        )
        .addField(
          `$rating, - Used to get Current Rating of any user on CF.`,
          `Use "$help,rating" for more info regarding this. `
        )
        .addField(
          `$upcoming, - Used to get a list of upcoming contest on CF`,
          `If you dont get it by now, you wont. `
        )
        .addField(
          `$info, - Used to get public information of any user on CF.`,
          `Use "$help,info" for more info regarding this. `
        )
        .addField(
          `$search, - Used to get top google searches for any question's solution or any search in general.`,
          `Use "$help,search" for more info regarding this. `
        )
        .addField(
          `$status, - Used to get information regarding submissions of past 30 days of any user on CF`,
          `Use "$help,status" for more info regarding this. `
        )
        .addField(
          `$lboard, - Used to get the leaderboard containing all registered users on the server. (based on CF stats)`,
          `Use "$help,lboard" for more info regarding this. `
        )
        .addField(
          `$virtual, - Used to start a virtual contest for all registered users on the server.`,
          `Use "$help,virtual" for more info regarding this. `
        )
        .addField(
          `$play, - Used to play songs on the server according to mood.`,
          `Use "$help,play" for more info regarding this. `
        )
        .addField(
          `$skip, - Used to skip the currently playing song.`,
          `If you dont get it by now, you wont. `
        )
        .addField(
          `$destroy, - Used to destroy the currently playing queue for songs(skip all).`,
          `If you dont get it by now, you wont. `
        )
        .addField(
          `$invite, - Used to destroy the currently playing queue for songs(skip all).`,
          `If you dont get it by now, you wont. `
        );
      msg.channel.send(msgg);
    } else if (words[1] == "set") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(`Normal Format: $set,{cf_username}-$set,mafailure`);
      msg.channel.send(msgg);
    } else if (words[1] == "hi") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `The chat bot replies and helps you according to your mood.`
        );
      msg.channel.send(msgg);
    } else if (words[1] == "rGraph") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `Normal Format: $` +
            words[1] +
            `,{cf_username}-$set,mafailure. \n "$` +
            words[1] +
            `," can be used if user wants to get their info. `
        );
      msg.channel.send(msgg);
    } else if (words[1] == "rating") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `Normal Format: $` +
            words[1] +
            `,{cf_username}-$set,mafailure. \n "$` +
            words[1] +
            `," can be used if user wants to get their info. `
        );
      msg.channel.send(msgg);
    } else if (words[1] == "info") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `Normal Format: $` +
            words[1] +
            `,{cf_username}-$set,mafailure. \n "$` +
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
            `,{cf_username}-$set,mafailure. \n "$` +
            words[1] +
            `," can be used if user wants to get their info. `
        );
      msg.channel.send(msgg);
    } else if (words[1] == "search") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `Normal Format: $` + words[1] + `,{ques}-$set,what is codeforces?.`
        );
      msg.channel.send(msgg);
    } else if (words[1] == "lboard") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `Normal Format: $` +
            words[1] +
            `,{R/P}. \n 
            Use $lboard,R to get leaderboard according to rating, $lboard,P to get leaderboard according to number of problems solved successfully in the past month.`
        );
      msg.channel.send(msgg);
    } else if (words[1] == "play") {
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Help :" + words[1])
        .setDescription(
          `Normal Format: $` +
            words[1] +
            `,{mood}. Ex: $play,happy \n 
            We have playlist for 4 possible moods - "happy","indie","rock","lofi".`
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
client.on("message",async(msg)=>{
  if(!msg.guild) return;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  if(msg.content.startsWith("$invite")){
    let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setDescription(
          `Use this link to invite bot to any server.
          "https://tiny.one/De-Codeforces"`
        );
      msg.channel.send(msgg);
  }
})

//friends

client.on("message",async(msg)=>{
  if(!msg.guild) return;
  if (msg.author.bot) return;
  if (!msg.content.startsWith("$")) return;
  if(msg.content.startsWith("$friend")){
    let words=msg.content.split(",");
    let userId=msg.author.id;
    let list=msg.guilds.cache.get(serverId);
    let present=false,friendOf;
    list.members.cache.forEach((member)=>{
      let allFriends=friends.get(member.user.id);
      allFriends.forEach((ele)=>{
        if(ele==words[1]){
          present=true;
          friendOf=member.user.id
        }
      })
    })
    if(present){
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setDescription(
          `This user is already added as a friend of <@${friendOf}>. Get new friends , loser`
        );
      msg.channel.send(msgg);
      return;
    }
    else{
      let arr=friends.get(userId);
      arr.push(words[1])
      friends.set(userId,arr);
      let url=""
      let msgg = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setDescription(
          `[${words[1]}]`
        );
      msg.channel.send(msgg);
    }
  }

})

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
  } else if (msg.content.startsWith(`$skip`)) {
    await skip(msg, ServerQueue, queue);
    return;
  } else if (msg.content.startsWith(`$destroy`)) {
    await destroy(msg, ServerQueue, queue);
    return;
  }
});
