const Discord = require('discord.js'); //discord 모듈 호출
const voice = require('@discordjs/voice'); //discord 음성 채널 모듈 호출
const DisTube = require('distube'); //discord music 모듈 호출

const client = new Discord.Client({ //discord bot 권한 설정
    intents: [
        'GUILDS', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
})

const distube = new DisTube.default(client, { //distube 설정
    searchSongs: 1,
    searchCooldown: 30,
    leaveOnEmpty: true,
    emptyCooldown: 1000,
    leaveOnFinish: false,
    leaveOnStop: false
})

const {token} = require('./info.json');
const e = require('express');
require('discord-reply');
const prefix = '++';

client.on('ready', async () => { // 이벤트 리스너 (ready 이벤트)
    client
        .user
        //.setActivity('Terry\'s Bot | 점검', {type: 'PLAYING'})
        .setActivity('Terry\'s Bot | ++help', {type: 'PLAYING'});

    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (message) => { // 이벤트 리스너 (message 이벤트)

    if (message.author.bot) 
        return;
    if (!message.content.startsWith(prefix)) 
        return;
    const args = message
        .content
        .slice(prefix.length)
        .trim()
        .split(/ +/g);
    const command = args.shift();

    if (["help", "h"].includes(command)) {
        message
            .channel
            .send(
                '[p,play] - 테리님. 노래 틀어줘요.\n'+
                '[l ,leave] - 잘가요. 테-리-님.\n' +
                '[s,stop] - 리혐 ㅁ... 아니 노래 멈춰!.\n' +
                '[pause] - 노래 다시 틀어주세요.\n'+
                '[skip] - 다음 노래로 넘어갑니다.\n'+
                '[list] - 다음 노래 몰?루\n' +
                '[auto] - 지금 노래와 연관된 노래를 추가합니다\n' +
                '[파티모집,파티] - ++파티모집 으로 같이 게임할 사람들을 모집해보세요!'
            )
    }

    if (["p", "play"].includes(command)) {
        try{
        if (!message.member.voice.channel) 
            return message
                .channel
                .send('음성채널에 들어와주세요.');
        if (!args[0]) 
            return message
                .channel
                .send('예약된 노래가 없어요')
        distube.play(message, args.join(" "));
        }catch{
            return message
            .channel
            .send('오류! 검색 형태를 재확인해주세요!');
        }
    }

    if (["l", "leave"].includes(command)) {
        const bot = message
            .guild
            .members
            .cache
            .get(client.user.id);
        if (!message.member.voice.channel) 
            return message
                .channel
                .send('음성채널에 들어와주세요.');
        if (bot.voice.channel !== message.member.voice.channel) 
            return message
                .channel
                .send('봇과 같은 채널에 없습니다');
        distube.stop(message);
        message
            .channel
            .send('노래 캇')
    }
    if (["s", "stop"].includes(command)) {
        try {
            distube.pause(message);
        } catch  {}
    }
    
    
    if (command == 'resume') {
        try {
            distube.resume(message);
        } catch  {}
    }

    if (command == 'skip') 
        try {
            distube.skip(message);
        } catch  {}
    
    if (["list", "q", "queue"].includes(command)) {
        const queue = distube.getQueue(message);
        if (queue) {
            message
                .channel
                .send(
                    '🎶현재 노래🎶\n' + queue.songs.map((song, id) => `**${id + 1}**. [${song.name}] - \`${song.formattedDuration}\``).join("\n")
                );
        } else {
            message
                .channel
                .send('예약된 노래가 없습니다.');
        }

    }

    if (["auto"].includes(command)) {
        try {
            const queue = distube.addRelatedSong(message);

            message
            .channel
            .send(
                '🎶추천 노래가 추가되었습니다!🎶\n' + `[${song.name}] - \`${song.formattedDuration}\``).join("\n");
        } catch  {
            message
            .channel
            .send('노래가 안틀어져 있어요 :(');
        }
        
    }

    if (["파티모집", "파티"].includes(command)) {
        console.log(
            `${message.author.username}님이 파티모집을 시작했습니다.\n` + + '⚔' + args.join(" ") + '⚔'
        );
        message
            .channel
            .send(
                message.author.username + '님이 파티모집을 시작하였습니다! \n🏹 ' + args.join(" ") + ' 🏹\n\n' +
                '반응을 추가해서 참여해보세요!\n⚔ : 파티참여    🔍 : 인원확인    🎺 : 인원호출     ❌ : 삭제'
            )
            .then(function (message) {
                message.react('⚔');
                message.react('🔍');
                message.react('🎺');
                message.react('❌')
            })
            .catch(function () {});

    }

});

client.on(
    'messageReactionAdd', async (reaction, user) => { //discord 반응하기 Listener

    if (user.bot) {
        //반응한 user가 bot이면 종료
            return;
        }
        if (!user.bot) {
            if ('⚔' === (reaction.emoji.name)) { //반응하기(파티모집 참여하기)
                if(reaction.partial){
                    await reaction.fetch().then();
                }
            }
            if ('❌' === (reaction.emoji.name)) { //파티모집 삭제하기
                reaction
                    .message
                    .delete();
            }

            if (reaction.emoji.name === "🔍") { //반응한 인원 확인
                const message = reaction.message;
                let maps = [];

                if (message.partial) {
                    await message
                        .fetch()
                        .then(fullMessage => {
                            maps = Array
                                .from(fullMessage.reactions.cache)[0][1]
                                .users
                                .cache;
                        })
                        .catch(error => {
                            console.log('Something went wrong when fetching the message: ', error);
                        });

                } else {
                    maps = Array
                        .from(reaction.message.reactions.cache)[0][1]
                        .users
                        .cache;
                }
                var resultNameList = [];

                for (var i = 0; i < maps.size; i++) {
                    if (Array.from(maps)[i][1].bot == false) {
                        resultNameList.push((Array.from(maps)[i][1].tag));
                    }
                }
                reaction.users.remove(user.id);
                if (resultNameList.length > 0) {
                    reaction
                        .message
                        .channel
                        .send(`현재 이 파티에 지원하신 분입니다.\n` + resultNameList.join(" "));
                } else {
                    reaction
                        .message
                        .channel
                        .send('파티에 지원해주신 분이 없습니다 \:sob\: ');
                }
            }

            if ('🎺' === (reaction.emoji.name)) { //반응한 인원 호출
                const message = reaction.message;
                let maps = [];
                if (message.partial) {
                    message
                        .fetch()
                        .then(fullMessage => {
                            maps = Array
                                .from(fullMessage.reactions.cache)[0][1]
                                .users
                                .cache;
                        })
                        .catch(error => {
                            console.log('Something went wrong when fetching the message: ', error);
                        });
                } else {
                    maps = Array
                        .from(reaction.message.reactions.cache)[0][1]
                        .users
                        .cache;
                }
                var resultNameList = [];

                for (var i = 0; i < maps.size; i++) {
                    if (Array.from(maps)[i][1].bot == false) {
                        resultNameList.push('<@' + Array.from(maps)[i][1].id + '>');
                    }
                }
                reaction
                    .users
                    .remove(user.id);
                if (resultNameList.length > 0) {
                    reaction
                        .message
                        .lineReply(`파티가 시작됩니다!  집결하세요!\n` + resultNameList.join(" "));
                } else {
                    reaction
                        .message
                        .channel
                        .send('파티에 지원해주신 분이 없습니다 \:sob\: ');
                }
            }

        }
        return;

    }
);

const getAuthorDisplayName = async (msg) => {
    const member = await msg
        .guild
        .member(msg.author);
    return member
        ? member.nickname
        : msg.author.username;
}

// Queue status template
const status = queue => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.join(
    ', '
) || 'Off'}\` | Loop: \`${queue.repeatMode
    ? queue.repeatMode === 2
        ? 'All Queue'
        : 'This Song'
    : 'Off'}\` | Autoplay: \`${queue.autoplay
        ? 'On'
        : 'Off'}\``

        // DisTube event listeners, more in the documentation page
        distube.on(
            'playSong',
            (queue, song) => queue.textChannel.send(`🎶 Playing \`${song.name}\` - \`${song.formattedDuration}\` 🎶`,)
        ).on(
            'addSong',
            (queue, song) => queue.textChannel.send(` ${song.name} - \`${song.formattedDuration}\` 노래가 추가 되었어요!`,)
        ).on('addList', (queue, playlist) => queue.textChannel.send(
            ` \`${playlist.name}\` 플레이리스트가 추가 되었어요!\n (${playlist.songs.length}의 곡이 추가됩니다.`,
        ))
        // DisTubeOptions.searchSongs = true
            .on('searchResult', (message, result) => {
            let i = 0
            message
                .channel
                .send(
                    `**Choose an option from below**\n${result.map(song => `**${++ i}**. ${song.name} - \`${song.formattedDuration}\``,).join('\n',)}\n*Enter anything else or wait 30 seconds to cancel*`,
                )
        })
        // DisTubeOptions.searchSongs = true
            .on('searchCancel', message => message.channel.send(`검색이 취소됐어요😢`)).on(
                'searchInvalidAnswer',
                message => message.channel.send(`searchInvalidAnswer`)
            ).on('searchNoResult', message => message.channel.send(`찾는 결과가 없어요😂`)).on(
            'error',
            (textChannel, e) => {
                console.error(e)
                textChannel.send(`An error encountered: ${e.slice(0, 2000)}`)
            }
        ).on('finish', queue => queue.textChannel.send('모든 노래가 끝났어요😎'))
        // .on('finishSong', queue => queue.textChannel.send('Finish song!'))
        // .on('disconnect', queue => queue.textChannel.send('Disconnected!'))
        // .on('empty', queue => queue.textChannel.send('Empty!'))

        client.login(token); // token으로 discord API에 Identify 전송