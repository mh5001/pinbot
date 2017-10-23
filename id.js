const discord = require('discord.js');
const client = new discord.Client();

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));

const prefix = config.prefix;

client.login(config.token);

client.on('ready', function(){
  console.log('Find ID');
});

client.on('message', function(message) {
  if (message.content.startsWith(prefix + 'id')) {
    const input = message.content.split(' ').slice(1).join(' ');
    message.channel.send(input.match(/\d/g).join(''));
  }
});
