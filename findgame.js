const discord = require('discord.js');
const client = new discord.Client();

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));

const prefix = config.prefix;
const igdb = require('igdb-api-node').default;
var igdbClient = igdb('9c9dd311948970a68d56ff415184ec11');

client.login(config.token);

client.on('ready', function(){
  console.log('Find game rating ready');
});

client.on('message', function(message) {
  if(message.content.startsWith(prefix + "game")) {
            var game;
            if (message.content.indexOf("|") == -1) {
              game = message.content.substring(prefix.length + 5,999);
            } else {
              game = message.content.substring(prefix.length + 5, message.content.indexOf("|"));
            }
            var query = message.content.substring(message.content.indexOf("|") + 1, message.content.indexOf("|") + 10) - 1;
            igdbClient.games({
              search: game,
              limit: 5,
              offset: 0,
            }, [
                'name',
                'esrb.synopsis',
                'pegi.synopsis',
                'game.summary',
                'game.created_at',
                'game.summary',
                'cover',
                'rating',
                'hypes',
                'publishers.name,themes.name&expand=publishers,themes'
              ]).then(res => {
                  if (res.lenght !== null && message.content.indexOf("|") == -1) {
                    message.channel.send({"embed": {
                      "title": "Displaying: " + "5" + " top results.",
                      "color": 16067347,
                      "fields": [{
                        "name": "__self-game " + game + "  |  [1-5]__ to choose game.",
                        "value": "1: **" + res.body[0].name + "** \n2: **" + res.body[1].name + "** \n3: **" + res.body[2].name + "** \n4: **" + res.body[3].name + "** \n5: **" + res.body[4].name + "**"
                      }],
                    }});
                  } else if (res.length !== null && query < 6) {
                    var publ = [];
                    var theme = [];
                    var rate;
                    var pegi;
                    var esrb;
                    var picture;
                    if (JSON.stringify(res.body[query]).indexOf("publishers") == -1) {
                      publ = "Unknown Publisher, perhaps this game is too unpopular?"
                    } else {
                      res.body[query].publishers.map(elements => {
                        publ.push(elements.name);
                      });
                    }
                    if (res.body[query].themes == undefined) {
                      theme = "Unknown theme, perhaps this game is too unpopular?"
                    } else {
                      res.body[query].themes.map(elements => {
                        theme.push(elements.name);
                      });
                    }
                    if (res.body[query].rating == null) {
                      rate = 'No rating available.'
                    } else {
                      rate ="**" + Math.floor(res.body[query].rating) + "** / 100"
                    }
                    if (res.body[query].pegi == null) {
                      pegi = "No PEGI description available."
                    } else {
                      if (res.body[query].pegi.synopsis.length < 1000) {
                        pegi = res.body[query].pegi.synopsis
                      } else {
                        pegi = res.body[query].pegi.synopsis.substring(0,res.body[query].pegi.synopsis.indexOf(".",950) + 1)
                      }
                    }
                    if (res.body[query].esrb == null) {
                      esrb = "No ESRB description available,"
                    } else {
                      if (res.body[query].esrb.synopsis.length < 1024) {
                        esrb = res.body[query].esrb.synopsis
                      } else {
                        esrb = res.body[query].esrb.synopsis.substring(0, res.body[query].esrb.synopsis.indexOf(".", 800) + 1)
                      }

                    }
                    if (res.body[query].cover == undefined) {
                      picture = "http://www.51allout.co.uk/wp-content/uploads/2012/02/Image-not-found.gif"
                    } else {
                      picture = "https:" + res.body[query].cover.url;
                    }
                    message.channel.send({"embed": {
                      "color": 16067347,
                      "image": {
                        "url": picture
                      },
                      "fields": [{
                        "name": "Game: __" + res.body[query].name + "'s__ results.",
                        "value": "**" + res.body[query].name + "**"
                        },
                        {
                          "name": "Rating:",
                          "value": rate
                        },
                        {
                          "name": "Publisher:",
                          "value": JSON.stringify(publ).replace(/\[/g,'').replace(/\]/g,'').replace(/\"/g,'').replace(/\,/g,', ')
                        },
                        {
                          "name": "Description from PEGI:",
                          "value": pegi
                        },
                        {
                          "name": "Description from ESRB:",
                          "value": esrb
                        },
                        {
                          "name": "Theme/Genre:",
                          "value": JSON.stringify(theme).replace(/\[/g,'').replace(/\]/g,'').replace(/\"/g,'').replace(/\,/g,', ')
                        }
                    ],
                    }});
                  }
            });
        }
});
