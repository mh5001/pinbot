const discord = require('discord.js');
const client = new discord.Client();
const fs = require('fs');
const snek = require('snekfetch');

const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
const prefix = config.prefix;
const picture = JSON.parse(fs.readFileSync('./pictures.json'));

client.login(config.token);

var chatListen = false;
var word;
var output;
var out;
var progress = 0;
var wordGuess = [];

client.on('ready', () => {
  console.log("Hangman loaded");
});

client.on('message', message => {
  if (message.author.id == client.user.id) return;
  function sendMes(mess){
    message.channel.send(mess);
  }

  var input = message.content;
  const lowInp = input.toLowerCase();

  if(lowInp.startsWith(prefix + "hangman")) {
    const arg = input.split(' ').slice(1);
    if (!arg[0]) {
      sendMes('`Invalid form of command structure!`');
    } else {
      if (arg[0] == 'start') {
        snek.get('http://setgetgo.com/randomword/get.php').then(res => {
          word = res.text.toUpperCase();
        })
        .then(() => {
          output = word.replace(/\D/g,"-");
          chatListen = true;
          sendMes({embed: {
            title: "The word is: " + word.length + " characters long!",
            description: output,
            footer: {
              text: client.user.username + " will now listen to chat until the game end!"
            },
            thumbnail: {
              url: hangman(0)
            }
          }});
        });
      } else if (arg[0] == 'end') {
        sendMes({embed: {
          color: 16700000,
          description: `Ending everything!`
        }});
        chatListen = false;
        progress = 0;
        out = [];
        return
      }
    }
  }
    if (chatListen && word) {
      if (!out) {
        out = output.split('')
      }
      if (input.length == 1) {
        if (wordGuess.includes(input.toUpperCase())) {
          sendMes("You already have guessed this character!");
          return;
        }
        wordGuess.push(input.toUpperCase());
        input = input.toUpperCase();
        if (word.includes(input)){
          word = word.split('');
          for (i = 0; i < word.length; i++) {
            if (out[i] == "-" && word[i] == input) {
              out[i] = input;
            }
          }
          word = word.join('');
          sendMes({embed: {
            title: "There are " + input.toUpperCase(),
            description: out.join(''),
            color: 4359924,
            thumbnail: {
              url: hangman(progress)
            },
            fields: [
              {
                name: "Word Guessed:",
                value: wordGuess.join(', ')
              }
            ]
          }});
        } else {
          progress++;
          if (progress == 10) {
            sendMes({embed: {
              title: "YOU LOST!",
              description: `The word was: **${word}**`,
              color: 16000000,
              thumbnail: {
                url: hangman(progress)
              },
              footer: {
                text: `${client.user.username} will now stop listening to chat!`
              },
              fields: [
                {
                  name: "Word Guessed:",
                  value: wordGuess.join(', ')
                }
              ]
            }});
            chatListen = false;
            progress = 0;
            out = [];
            return;
          }
          sendMes({embed: {
            title: "There are no " + input.toUpperCase(),
            description: out.join(''),
            color: 16000000,
            thumbnail: {
              url: hangman(progress)
            },
            fields: [
              {
                name: "Word Guessed:",
                value: wordGuess.join(', ')
              }
            ]
          }});
        }
      } else if (message.author !== client.user) {
        sendMes("`Please be wary that the game is still on!`");
      }
    }
    if (out !== undefined) {
      console.log(out);
      if (!out.includes('-')) {
        sendMes({embed: {
          color: 8947499,
          title: "👑 THE WORD WAS GUESSED! 👑",
          description: `**${wordGuess.length}** attempts have been tried!`,
          footer: {
            text: `${client.user.username} will now stop reading chat!`
          },
          thumbnail: {
            url: hangman(progress)
          }
        }});
        chatListen = false;
        progress = 0;
        out = [];
        return;
      }
    }
});

function hangman(live){
  if (live == 0){
    return picture.none;
  } else if (live == 1){
    return picture.a
  } else if (live == 2){
    return picture.b
  } else if (live == 3){
    return picture.c
  } else if (live == 4){
    return picture.d
  } else if (live == 5){
    return picture.e
  } else if (live == 6){
    return picture.f
  } else if (live == 7){
    return picture.g
  } else if (live == 8){
    return picture.h
  } else if (live == 9){
    return picture.i
  } else if (live == 10){
    return picture.j
  }
}
