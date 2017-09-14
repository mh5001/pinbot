const discord = require("discord.js");
const fs = require("fs");
const moment = require("moment");
const embed = new discord.RichEmbed();
const ytdl = require('ytdl-core');
const ytSearch = require('youtube-search');

const client = new discord.Client();
const config = JSON.parse(fs.readFileSync("./settings.json", "utf-8"));
const token = config.token;
const spamChannelID = JSON.parse(fs.readFileSync("./settings.json")).spamChannel;
const prefix = config.prefix;
const ytApi = config.ytApi;

var ytSearchOpt = {
  maxResults: 1,
  key: ytApi
}
var mess;
const queue = [];
var isPlaying = false;

client.login(token);

client.on("ready", function(){
  console.log("NOOT NOOT!");
  client.user.setPresence({game: {name: "Tik is bae", type: 0}});
});

client.on("messageReactionAdd", function(messageReaction){
  var emoji = messageReaction.emoji.name;
  var message = messageReaction.message;
  var spamChannel = message.guild.channels.get(spamChannelID);
  var content = message.content;
  var img;
  if (message.content.indexOf(".jpeg") > -1) {
    img = content.substring(content.indexOf("http"), content.indexOf(".jpeg") + 5);
    content = content.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
  } else if (message.content.indexOf(".jpg") > -1) {
    img = content.substring(content.indexOf("http"), content.indexOf(".jpg") + 4);
    content = content.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
  } else if (message.content.indexOf(".png") > -1) {
    img = content.substring(content.indexOf("http"), content.indexOf(".png") + 5);
    content = content.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
  } else if (message.content.indexOf(".gif") > -1) {
    img = content.substring(content.indexOf("http"), content.indexOf(".gif") + 5);
    content = content.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
  }
  if (message.attachments.first() !== undefined){
   img = message.attachments.first().url;
 }
  if (content.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') == '') {
    content = "No content provided 😞"
  }
  if (emoji == "🔶") {
    if (messageReaction.count > 1) {
      return;
    }
    spamChannel.send({embed: {
      color: 13369344,
      title: "In channel: `#" + message.guild.channels.get(message.channel.id).name + "`",
      footer: {
        text: "Author's time: " + moment(message.createdAt).format('h:mm:ss A dd, MM, YY')
      },
      author: {
        name: message.guild.members.get(message.author.id).displayName,
        icon_url: message.author.avatarURL
      },
      image: {
        url: img
      },
      fields: [
        {
          name: "__Content:__",
          value: "` " + content + " `"
        }
      ],
    }}).catch(err => {
      message.channel.send("`ERROR, unknown file attatched`")
    });
  }
});

client.on('message', function(message) {
  mess = message;
  const input = message.content;
  const args = input.split(" ").slice(1).join(" ")
  if (message.author.id !== client.user.id) {
    if (input.startsWith(prefix + 'play')) {
      var description;
      if (message.member.voiceChannel == null) {
        sendMes('`Join a channel, cunt`');
        return;
      }
      ytSearch(args, ytSearchOpt, function(err, res) {
        if(err) return console.log(err);
        console.log(res);
        if (res[0].kind == 'youtube#playlist') {
          sendMes("`Does not support playlist at the moment!`");
          return;
        }
        if (res[0].description == '') {
          description = 'No description provided!'
        } else {
          description = res[0].description;
        }
        sendMes({embed: {
          title: res[0].title,
          url: res[0].link,
          description: "Added by: **" + message.author.username + "**",
          thumbnail: {
            url: res[0].thumbnails.medium.url
          },
          fields: [
            {
              name: '__Description:__',
              value: description
            }
          ],
          footer: {
            text: "Posted by: " + res[0].channelTitle
          }
        }})
        if (isPlaying) {
          toQueue(res[0].id,res[0].title);
        } else {
          toQueue(res[0].id,res[0].title);
          playStream(queue[0].id);
          isPlaying = true;
        }
      });
    } else if (input == prefix + 'queue') {
      if (queue.length == 0) {
        sendMes('`Queue is empty!`');
        return;
      }
      var list = [];
      var x = 1;
      queue.map(elements => {
        list.push("**" + x++ + " : **" + elements.name);
      });
      list = JSON.stringify(list).replace('[','').replace(']','').replace(/\,/g,'\n').replace(/\"/g,'');
      console.log(list);
      sendMes({embed: {
        title: "Playing queue:",
        description: list
      }});
    }
  }
});

function sendMes(string) {
  mess.channel.send(string)
}

function toQueue(id, name) {
  queue.push({"id": id, "name": name});
  console.log(queue);
}

function playStream(id) {
  console.log("Playing");
  mess.member.voiceChannel.join().then(function(connection) {
    isPlaying = true;
    const dispatcher = connection.playStream(ytdl('https://www.youtube.com/watch?v=' + id, {filter: 'audioonly'}))
    dispatcher.on('end', () => {
      isPlaying = false;
      console.log("Ended");
      if (queue.length > 0) {
        queue.splice(0,1);
        setTimeout(playStream(queue[0].id),2000);
      } else if (queue.lenght == 0) {
        sendMes({embed: {
          description: "Nothing left in queue",
          color: 10
        }})
      }
    });
  });
}
