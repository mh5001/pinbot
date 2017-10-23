const discord = require('discord.js');
const client = new discord.Client();
const fs = require('fs');
const snek = require('snekfetch');

const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
const prefix = config.prefix;

client.login(config.token);

client.on('ready', () => {
  console.log("Wot Statistics loaded");
});

client.on('message', message => {
  const input = message.content.split(' ').slice(1);
  if(message.content.startsWith(prefix + 'wot')) {
    snek.get(`https://api.worldoftanks.eu/wot/account/list/?application_id=8ab2cbedfd6f945dd031f4c5cb82bd96&search=${input}&fields=account_id%2Cnickname`)
    .then(res => {
      var output = JSON.parse(res.text);
      if (output.data[0] == null){
        message.channel.send("`Err 404 Player not found!`");
        return;
      }
      if (output.status == 'ok') {
        snek.get(`http://www.wotinfo.net/en/efficiency?server=EU&playername=${output.data[0].nickname}`)
        .then(res => {
          var result = res.text.substring(res.text.indexOf('<div class="tab-pane fade in" id="random">'),res.text.indexOf('<a href="/en/wn8scale"'));
          result = result.replace(/\<(.*?)\>/g,'').replace(/\ /g, '').split("\n").filter(elements => {
            return elements !== "\t";
          }).filter(elements => {
            return elements !== "";
          });
          if (result.length < 110) {
            return message.channel.send({embed: {
              color: wn8Color(parseInt(result[103].replace(',',''))),
              title: `Statistics For User: __${output.data[0].nickname}__ on The EU Server:`,
              description: `\n**Nickname:**\t${output.data[0].nickname}\n**User ID:**\t${output.data[0].account_id}\n**Battles on Random:**${result[0]}\n\n**Win Rate:**${result[2]}\n**Hit Percentage:** ${result[4]}\n**Survived:** ${result[6]}\n\n**Average XP per Battle:** ${result[8]}\n**Damage Dealt over Received:** ${result[10]}\n**Average Damage:** ${result[12]}\n**Average Tank Destroyed per Battle:**${result[14]}\n**Average Tank Spotted per Battle:**${result[16]}\n**Average Base Reset:**${result[18]}\n**Average Base Captured:**${result[20]}\n**Kill to Death Ratio:**${result[22]}\n\n**Efficiency:**\t${result[95]} (${result[96]})\n**WN8:**\t${result[103]} (${result[104]})\n**WN7:**\t${result[99]} (${result[100]})`
            }})
          }
          message.channel.send({embed: {
            color: wn8Color(parseInt(result[109].replace(',',''))),
            title: `Statistics For User: __${output.data[0].nickname}__ on The EU Server:`,
            description: `\n**Nickname:**\t${output.data[0].nickname}\n**User ID:**\t${output.data[0].account_id}\n**Battles on Random:**${result[0]}\n\n**Clan:**\t${result[89].replace(/\:/g,'')}\n**Date joined:**\t${result[91].replace(/\:/g,'')}\n**Role in clan:**\t${result[93].replace(/\:/g,'')}\n\n**Win Rate:**${result[2]}\n**Hit Percentage:** ${result[4]}\n**Survived:** ${result[6]}\n\n**Average XP per Battle:** ${result[8]}\n**Damage Dealt over Received:** ${result[10]}\n**Average Damage:** ${result[12]}\n**Average Tank Destroyed per Battle:**${result[14]}\n**Average Tank Spotted per Battle:**${result[16]}\n**Average Base Reset:**${result[18]}\n**Average Base Captured:**${result[20]}\n**Kill to Death Ratio:**${result[22]}\n\n**Efficiency:**\t${result[101]} (${result[102]})\n**WN8:**\t${result[109]} (${result[110]})\n**WN7:**\t${result[105]} (${result[106]})`
          }});
        });
      } else if (output.status == 'error') {
        message.channel.send("Error Occured! Either the user doesn't exist or something went wrong! Contact <@163434302758060033> for more info!");
      }
    });
  }
});

function wn8Color (wn8) {
  if (wn8 < 300) {
    return 14356992;
  } else if (wn8 < 449) {
    return 15222842;
  } else if (wn8 < 694) {
    return 14180636;
  } else if (wn8 < 899) {
    return 14867215;
  } else if (wn8 < 1199) {
    return 4902404;
  } else if (wn8 < 1599) {
    return 1339907;
  } else if (wn8 < 1999) {
    return 578481;
  } else if (wn8 < 2449) {
    return 234938;
  } else if (wn8 < 2899) {
    return 90290;
  } else {
    return 268494;
  }
}
