const discord = require('discord.js');
const client = new discord.Client();
const fs = require('fs');
const snek = require('snekfetch');

const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
const prefix = config.prefix;

client.login(config.token);

client.on('ready', () => {
  console.log("Eval loaded");
});

client.on('message', message => {
  const mess = message.content;
  if(mess.startsWith(prefix + "eval")) {
          if(message.author.id !== '163434302758060033') return;
          var input = message.content.substring(prefix.length + 5, 1000).replace(/\```/g,'');
          try {
            let evaled = eval(input);
            message.channel.send({embed: {
              color: 2074634,
              fields: [
                {
                  name: '__Input__:',
                  value: '```' + input + '```'
                },
                {
                  name: '__Output__:',
                  value: '```' + JSON.stringify(evaled) + '```'
                }
              ],
            }});
          } catch (err) {
            message.channel.send({embed: {
              color: 15993856,
              fields: [
                {
                  name: "__Input__:",
                  value: "```" + input + "```"
                },
                {
                  name: '__Error__:',
                  value: ` \`\`\`xl\n${clean(err)}\n\`\`\``
                }
              ],
            }});
          }
      }
});
