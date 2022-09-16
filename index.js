const Discord = require('discord.js');
const config = require('./config.json');
const bot = new Discord.Client();
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');

var connection = null;
var player = null;

bot.on('ready', () => {
    console.log('bot is ready');
    bot.user.setPresence({
        activity: {
            name: 'BÔNG LAN CHUỐI MỨNG',
            type: 'LISTENING',
        },
        status: 'online'
    });
});

// reply common command
bot.on('message', async message => {
    if (message.author.bot || !message.content.startsWith(config.prefix)) return;
    var command = message.content.substring(config.prefix.length, message.content.length);
    var user = message.author;

    switch (command) {
        case 'bot':
            message.channel.send(`Commands:
            ${config.prefix}ping
            ${config.prefix}role
            ${config.prefix}join
            ${config.prefix}play \`a-youtube-link\`
            ${config.prefix}stop
            ${config.prefix}weather \`city\`
            `);
            break;
        case 'ping':
            message.channel.send(`pong! The ping is ${bot.ws.ping}ms!`);
            break;
        case 'role':
            var role = message.member.roles.cache
                .filter((roles) => roles.id !== message.guild.id)
                .map((role) => role.toString());
            message.channel.send(`Chào ${user}, bạn là một ${role} trong server này!`);
            break;
        case 'join':
            connection = await message.member.voice.channel.join();
            break;
        default:
            break;
    }
});

// play music
bot.on('message', message => {
    if (connection === null || !message.content.startsWith(config.prefix))
        return;
    var msg = message.content.split(' ');
    var command = msg[0].substring(config.prefix.length, msg[0].length);

    switch (command) {
        case 'play':
            if (msg[1] === null) return;
            player = connection.play(ytdl(msg[1], { filter: 'audioonly' }));
            break;
        case 'stop':
            if (player === null) return;
            player.destroy();
            player = null;
            message.channel.send(`stopped!`);
            break;
        case 'playbgm':
            player = connection.play('/resources/InaBGM.mp3');
            break;
        default:
            break;
    }
});

// weather
bot.on('message', message => {
    if (!message.content.startsWith(config.prefix)) return;
    var msg = message.content.split(' ');
    var command = msg[0].substring(config.prefix.length, msg[0].length);
    if (msg.length > 2) {
        for (let i = 2; i < msg.length; i++) {
            msg[1] += " " + msg[i];
        }
    }

    if (command !== 'weather') return;

    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${msg[1]} city&limit=1&appid=${config.weatherAPIkey}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            var lat = json.at(0).lat;
            var lon = json.at(0).lon;

            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=vi&appid=${config.weatherAPIkey}`)
                .then(function (response) {
                    return response.json();
                })
                .then(function (json) {
                    message.channel.send(`
${msg[1]} ,${json.sys.country}, ${new Date(json.dt * 1000)}
Thời tiết: ${json.weather.at(0).description}
Nhiệt độ: ${(json.main.temp - 273.15).toFixed(2)}°C
Nhiệt độ cao nhất ${(json.main.temp_max - 273.15).toFixed(2)}°C
Nhiệt độ thấp nhất ${(json.main.temp_min - 273.15).toFixed(2)}°C
Cảm giác như: ${(json.main.feels_like - 273.15).toFixed(2)}°C
Áp suất: ${json.main.pressure}hPa
Độ ẩm ${json.main.humidity}%
Tầm nhìn: ${json.visibility}m
Tốc độ gió: ${json.wind.speed}m/s
Gió giật: ${json.wind.gust}m/s
                                        `
                    );
                })
                .catch(function (ex) {
                    console.log('ex: ' + ex);
                });
        })
        .catch(function (ex) {
            console.log("ex: " + ex);
        })
})

bot.login(config.token);
