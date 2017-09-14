const discord = require("discord.js");
const fs = require("fs");
const moment = require("moment");
const embed = new discord.RichEmbed();
const ytdl = require('ytdl-core');
const ytSearch = require('youtube-search');
const ytPlaylist = require('youtube-playlist-info');

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
var dispatcher;
var queueMax = 30;

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
        if (res[0].kind == 'youtube#playlist') {
          ytPlaylist.playlistInfo(config.ytApi,res[0].id, function(res) {
            var limitRes;
            if (res.length > queueMax) {
              limitRes = res.slice(0,queueMax);
            }
            limitRes.map(elements => {
              toQueue(elements.resourceId.videoId,elements.title);
            });
            playStream(queue[0].id);
            message.channel.send({embed: {
              title: 'Fetching: __' + args + '__ playlist',
              description: 'Play list is limited to maximum of: ' + queueMax,
              color: 4359924
            }});
          });
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
      sendMes({embed: {
        title: "Playing queue:",
        description: list
      }});
    } else if (input == prefix + 'skip') {
      message.channel.send({embed: {
        title: 'Attempting to skip!',
        description: 'Skipping: **' + queue[0].name + '**'
      }});
        dispatcher.end();
    } else if (input.startsWith(prefix + 'queuemax')) {
      if (message.author.id == '163434302758060033') {
        queueMax = args;
        message.channel.send('`Set Queue Max to: ' + queueMax + '`')
      }
    }
  }
});

function sendMes(string) {
  mess.channel.send(string)
}

function toQueue(id, name) {
  queue.push({"id": id, "name": name});
}

function playStream(id) {
  mess.member.voiceChannel.join().then(function(connection) {
    isPlaying = true;
    dispatcher = connection.playStream(ytdl('https://www.youtube.com/watch?v=' + id, {filter: 'audioonly'}))
    dispatcher.on('end', () => {
      isPlaying = false;
      if (queue.length > 0) {
        queue.splice(0,1);
        playStream(queue[0].id)
      } else if (queue.lenght == 0) {
        sendMes({embed: {
          description: "Nothing left in queue",
          color: 10
        }})
      }
    });
  });
}
