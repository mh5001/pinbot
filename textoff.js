const discord = require('discord.js');
const client = new discord.Client();
const fs = require('fs');
const snek = require('snekfetch');

const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
const prefix = config.prefix;

client.login(config.token);

client.on('ready', () => {
  console.log("Type off loaded!");
});

var chatListen;
var word;

client.on('message', message => {
  const input = message.content;
  if (input.toLowerCase() == prefix + "type-off"){
    message.channel.send({embed: {
      title: "Welcome to type off by Tik!",
      description: "Get ready for your word!"
    }});
    setTimeout(() => {
      snek.get('http://setgetgo.com/randomword/get.php').then(res => {
        word = res.text.toLowerCase();
      }).then(() => {
        message.channel.send({embed: {
          title: "THE WORD IS:",
          description: "**" + word + "**"
        }}).then(() => {
          chatListen = true;
        })
      });
    },Math.round(Math.random() * 5000));
  }
  setTimeout(() => {
    if (chatListen && message.content == word) {
      message.channel.send({embed: {
        title: "👑We have a winner!👑",
        description: "Player: **" + message.author.username + "** has won!"
      }})
      .then(() => {
        chatListen = false;
      })
    }
  },1000)
});
