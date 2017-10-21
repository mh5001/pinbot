const discord = require('discord.js');
const client = new discord.Client();

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));

const prefix = config.prefix;

client.login(config.token);

client.on('ready', function(){
  console.log('Anti Spam is ready');
});

var user = {};
var warn = {};

client.on('message', function(message) {
  if (message.author.id == client.user.id) return;
  if(JSON.stringify(user).indexOf(message.author.id) == -1) {
    user[message.author.id] = message.createdTimestamp;
    return;
  } else {
    if (Date.now() - user[message.author.id] < 1000){
      if (JSON.stringify(warn).indexOf(message.author.id) == -1) {
        warn[message.author.id] = 1;
      } else {
        warn[message.author.id]++;
      }
      if (warn[message.author.id] < 3) {
        message.channel.send(`<@${message.author.id}> please stop spamming, **${warn[message.author.id]}** warning!`);
      }
      delete user[message.author.id];
    } else {
      delete user[message.author.id];
    }
  }
  if (warn[message.author.id] == 3) {
    message.guild.members.get(message.author.id).addRole(message.guild.roles.get("368814929983307797"));
    delete user[message.author.id];
    message.channel.send({embed: {
      title: "Muted a user:",
      description: `<@${message.author.id}> was spamming and exceeded the spam warning!`,
      color: 16000000
    }});
  }
});
