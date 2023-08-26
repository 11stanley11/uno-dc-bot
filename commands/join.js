const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, UserSelectMenuInteraction } = require('discord.js');
const fs = require('node:fs');
const { Z_FIXED } = require('node:zlib');

const emojis = ['🔄', '🚫', '🎨'];
const c_types = ['0','1','2','3','4','5','6','7','8','9','reverse','skip','+2','+4','plate'];
const c_colors = ['Blue', 'Grey', 'Green', 'Red', 'None'];

function addBracket(input) {
    const output = '`' + input + '`';
    return output;
}

function checkPlayers(players) {
    let count = players.length;
    return count + '/4';
}

function pushRanCards(players, playerIndex, num) {
    for (let j = 0; j < num; j++) {
        const result = Math.floor(Math.random() * 27) //26
        const typeIndex = result < 25 ? Math.floor(Math.random() * 13) : Math.floor(Math.random() * 2) + 13;
        const colorIndex = typeIndex <= 12 ? Math.floor(Math.random() * 4) : 4;
        players[playerIndex].cards.push({
            color: c_colors[colorIndex],
            type: c_types[typeIndex],
        });
    }
}

function sortCards(players, playerIndex){
    let newCards = [];
    for (let color of c_colors) { //priority ['Blue', 'Grey', 'Green', 'Red', 'None']
        for (let type of c_types) { //priority [0,1,2,3,4,5,6,7,8,9,'reverse','ban','+2','+4','plate']
            for (let card of players[playerIndex].cards) {
                if (card.color === color && card.type === type) newCards.push(card);
            }
        }
    }
    players[playerIndex].cards = newCards;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('join game'),

    async execute(client, interaction) {
        console.log(interaction.user);

        const playersdata = fs.readFileSync('players.json');
        const players = JSON.parse(playersdata);

        const gamedata = fs.readFileSync('players.json');
        let gameInfo = JSON.parse(gamedata);

        let pi = -1; //playerIndex
        for (let j = 0; j < players.length; j++) {
            if (players[j].id == interaction.user.id) {
                pi = j;
            }
        }

        if (pi != -1) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('You already joined')
                .setDescription(`waiting ${addBracket(checkPlayers(players))} to join`);
            await interaction.reply({ embeds: [embed], ephemeral: true });

            pi = -1
        }else{
            if (players.length == 4) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Already reached max players');
                await interaction.reply({ embeds: [embed], ephemreal: true });

            }else{
                players.push({ 
                    id: interaction.user.id, 
                    username: interaction.user.username,
                    avatar: 'https://cdn.discordapp.com/avatars/' + 
                            interaction.user.id + '/' +  
                            interaction.user.avatar + '.png',
                    cards:[],
                });
                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('You successfully join')
                    .setDescription(`Waiting ${addBracket(checkPlayers(players))} to join`);
                await interaction.reply({ embeds: [embed] });

                pi = players.length - 1;
                console.log(pi);
            }
        }

        const playersjson = JSON.stringify(players, null, 2);
        fs.writeFileSync('players.json', playersjson);

        if (pi != -1) {
            const checkInterval1 = setInterval(async () => {
                
                const playersdata = fs.readFileSync('players.json');
                const players = JSON.parse(playersdata);

                console.log(`${interaction.user.id} in loop`);

                let playerQuit = true;
                for(let i = 0; i < players.length; i++) {
                    if(players[i].id === interaction.user.id) playerQuit = false;
                } 
                if(playerQuit) clearInterval(checkInterval1);

                if(players.length == 4) {
                    clearInterval(checkInterval1);

                    //give cards
                    for(let i = 0; i < players.length; i++) {
                        pushRanCards(players, i, 8);
                        sortCards(players, i);
                    }

                    if (pi == 3) {
                        gameInfo = { 
                            players_arr: [
                                players[0].id,
                                players[1].id,
                                players[2].id,
                                players[3].id,
                            ],
                            players_order: [],
                            round: 0,
                            turn: 0, // 3 --> 0
                            order_clockwise: true,
                            quit: false,
                            card:{
                                color: c_colors[Math.floor(Math.random() * 4)], //decide first card
                                type: c_types[Math.floor(Math.random() * 10)],
                            },
                        };
 
                        //set players_order
                        if (gameInfo.order_clockwise) {
                            for (let i = 0; i < 5; i++) {
                                gameInfo.players_order.push(gameInfo.players_arr[Math.abs(gameInfo.turn+i)%4]);
                            }
                        }else{
                            for (let i = 0; i < 5; i++) {
                                gameInfo.players_order.push(gameInfo.players_arr[Math.abs(gameInfo.turn-i)%4]);
                            }
                        }
                        

                        const startEmbed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle('Game Start')
                            .setDescription('player order:')
                            .setFields(
                                { name: '1st', value: `<@${gameInfo.players_arr[0]}>`, inline: true },
                                { name: '2nd', value: `<@${gameInfo.players_arr[1]}>`, inline: true },
                                { name: '\n', value: '\n'}, //endl
                                { name: '3rd', value: `<@${gameInfo.players_arr[2]}>`, inline: true },
                                { name: '4th', value: `<@${gameInfo.players_arr[3]}>`, inline: true },
                        )
                        await interaction.followUp({ embeds: [startEmbed]});

                        const playersjson = JSON.stringify(players, null, 2);
                        fs.writeFileSync('players.json', playersjson); 

                        const gamejson = JSON.stringify(gameInfo, null, 2);
                        fs.writeFileSync('gameInfo.json', gamejson);
                    }
 
                    let roundTemp;
                    const checkInterval2 = setInterval(async () => { 

                        const playersdata = fs.readFileSync('players.json');
                        let players = JSON.parse(playersdata);

                        const gamedata = fs.readFileSync('gameInfo.json');
                        let gameInfo = JSON.parse(gamedata);
                        
                        if (gameInfo.round != roundTemp) {
                            roundTemp = gameInfo.round;
                            if(pi == 3){
                                //clearInterval(checkInterval2); //tempararily
    
                                const playersdata = fs.readFileSync('players.json');
                                const players = JSON.parse(playersdata);
    
                                order_arrow = '►';
            
                                const UIEmbed = new EmbedBuilder()
                                    .setColor(gameInfo.card.color) 
                                    .setTitle(`${gameInfo.card.color} ${gameInfo.card.type}`)
                                    .addFields(
                                        { 
                                            name: 'Info:',
                                            value: `<@${gameInfo.players_order[0]}>'s turn
                                                    ${addBracket(gameInfo.round)} rounds played
                                                    next player: <@${gameInfo.players_order[1]}>`,
                                            inline: true 
                                        },
                                        { 
                                            name: `Cards Left:`,
                                            value: `<@${gameInfo.players_arr[0]}>: ${addBracket('x'+players[0].cards.length)}
                                                    <@${gameInfo.players_arr[1]}>: ${addBracket('x'+players[1].cards.length)}
                                                    <@${gameInfo.players_arr[2]}>: ${addBracket('x'+players[2].cards.length)}
                                                    <@${gameInfo.players_arr[3]}>: ${addBracket('x'+players[3].cards.length)}`,
                                            inline: true 
                                        },
                                        { name: '\n', value: '\n'}, //endl
                                        {
                                            name: 'Order:',
                                            value: `<@${gameInfo.players_order[0]}>►<@${gameInfo.players_order[1]}>►<@${gameInfo.players_order[2]}>►<@${gameInfo.players_order[3]}>►<@${gameInfo.players_order[4]}>`,
                                            inline: true,
                                        },
                                    );
                                await interaction.followUp({ embeds: [UIEmbed] });
                            }else{
                                console.log('sleep');
                                let sleep = async (ms) => await new Promise(r => setTimeout(r,ms));
                                await sleep(1000);
                                console.log('sleep end');
                            }
    
                            if(gameInfo.players_order[0] === interaction.user.id) { //your turn
                                const buttons = [];
                                
                                buttons.push(new ButtonBuilder()
                                    .setCustomId('draw')
                                    .setLabel('Draw')
                                    .setStyle(2)
                                    .setDisabled(false));
    
                                buttons.push(new ButtonBuilder() //add space between draw button and card buttons
                                    .setCustomId('space1')
                                    .setLabel('\u200B')
                                    .setStyle(2)
                                    .setDisabled(true));
    
                                let idCounter = 0;
                                let accessed = false;
                                for (let card of players[pi].cards) {
                                    let label, style;
                                    let disable = true;
                                    switch (card.type) {
                                        case 'reverse':
                                            label = emojis[0];
                                            break;
                                        case 'skip':
                                            label = emojis[1];
                                            break;
                                        case 'plate':
                                            label = emojis[2];
                                            break;
                                        default:
                                            label = card.type;
                                            break;
                                    }
                                    for (let i = 0; i < c_colors.length; i++) {
                                        if (card.color == c_colors[i]) style = i != 4 ? i+1 : 2; // if color is none then color set to grey
                                    }
                                    switch (gameInfo.card.type) {
                                        case '+2':
                                            if (card.type === '+2' || card.type === '+4' || card.color === gameInfo.card.color) disable = false;
                                            break;
                                        case '+4':
                                            if (card.color === gameInfo.card.color || card.color === "None") disable = false;
                                            break;
                                        case 'plate': 
                                            if (card.color === gameInfo.card.color) disable = false;
                                            break;
                                        default: 
                                            if (card.type === gameInfo.card.type || card.color === gameInfo.card.color ||
                                                card.type === '+4' || card.type === 'plate') disable = false;
                                            break;
                                    }
                                    
                                    if (card.color === "None" && !accessed) { //add space between color buttons and none color buttons
                                        buttons.push(new ButtonBuilder() 
                                            .setCustomId('space2')
                                            .setLabel('\u200B')
                                            .setStyle(2)
                                            .setDisabled(true));
                                        accessed = true;
                                    } 
                                    
                                    buttons.push(new ButtonBuilder()
                                                    .setCustomId(`${idCounter}`)
                                                    .setLabel(label)
                                                    .setStyle(style)
                                                    .setDisabled(disable));
                                    idCounter++;
                                }
    
                                const rows =[];
                                let rowIndex = 0;
                                while (rowIndex < buttons.length) {
                                    const row = new ActionRowBuilder();
                                    for (let i = 0; i < 5 && rowIndex < buttons.length; i++) {
                                        row.addComponents(buttons[rowIndex]);
                                        rowIndex++;
                                    }
                                    rows.push(row);
                                }
    
                                const CardEmbed = new EmbedBuilder().setTitle('Your deck:');
    
                                interaction.followUp({embeds: [CardEmbed], components: rows, ephemeral:true});
    
                                const collector = interaction.channel.createMessageComponentCollector();
                                collector.on('collect', async collected => {
    
                                    const pressed = collected.customId;
                                    console.log(pressed);
    
                                    const answerEmbed = new EmbedBuilder().setTitle('Choice:');
                                    let answerRow = new ActionRowBuilder();
                                    for (let button of buttons) { 
                                        if (button.data.custom_id === pressed) answerRow.addComponents(button);
                                    }
    
                                    collected.update({ embeds: [answerEmbed], components: [answerRow] });
                                    collector.stop();

                                    let nextCardColor = pressed === 'draw' ? gameInfo.card.color : players[pi].cards[pressed].color;
                                    let nextCardType = pressed === 'draw' ? gameInfo.card.type : players[pi].cards[pressed].type;
                                
                                    if (pressed === 'draw') {
                                        pushRanCards(players, pi, 1);
                                        const drawCardEmbed = new EmbedBuilder().setTitle('You get:');
                                        let label1, style1;
                                        let index = players[pi].cards.length - 1;
                                        switch (players[pi].cards[index].type) {
                                            case 'reverse':
                                                label1 = emojis[0];
                                                break;
                                            case 'skip':
                                                label1 = emojis[1];
                                                break;
                                            case 'plate':
                                                label1 = emojis[2];
                                                break;
                                            default:
                                                label1 = players[pi].cards[index].type;
                                                break;
                                        }
                                        for (let i = 0; i < c_colors.length; i++) {
                                            if (players[pi].cards[index].color == c_colors[i]) style1 = i != 4 ? i+1 : 2; // if color is none then color set to grey
                                        }
                                        const button = new ButtonBuilder()
                                            .setCustomId(`drawcard`)
                                            .setLabel(label1)
                                            .setStyle(style1)
                                            .setDisabled(false);
                                        
                                        const row = new ActionRowBuilder().addComponents(button);
                                        await interaction.followUp({ embeds: [drawCardEmbed], components: [row], ephemeral: true});
                                    }else{
                                        switch (players[pi].cards[pressed].type) {
                                            case 'reverse':
                                                gameInfo.order_clockwise = !gameInfo.order_clockwise;
                                                break;
                                            case 'skip':
                                                gameInfo.turn = gameInfo.order_clockwise ? gameInfo.turn+1 : gameInfo.turn-1; 
                                                break;
                                            case '+2':
                                                gameInfo.turn = gameInfo.order_clockwise ? gameInfo.turn+1 : gameInfo.turn-1;
                                                for (let i = 0; i < players.length; i++) {
                                                    if (players[i].id === gameInfo.players_order[1]) {
                                                        pushRanCards(players, i, 2);
                                                        sortCards(players, i);
                                                    }
                                                }
                                                break;
                                            case '+4':
                                                gameInfo.turn = gameInfo.order_clockwise ? gameInfo.turn+1 : gameInfo.turn-1; 
                                                for (let i = 0; i < players.length; i++) {
                                                    if (players[i].id === gameInfo.players_order[1]) {
                                                        pushRanCards(players, i, 4);
                                                        sortCards(players, i);
                                                    }
                                                }
                                            case 'plate':
                                                const colorChooseEmbed = new EmbedBuilder().setTitle("Choose a color:");

                                                const buttons = [];
                                                const row = new ActionRowBuilder();
                                                for (let i = 0; i < 4; i++) {
                                                    buttons.push(new ButtonBuilder()
                                                        .setCustomId(c_colors[i])
                                                        .setLabel(c_colors[i])
                                                        .setStyle(i+1)
                                                        .setDisabled(false));
                                                    row.addComponents(buttons[i]);
                                                }

                                                await interaction.followUp({ embeds: [colorChooseEmbed], components: [row], ephemeral: true });

                                                const collector = interaction.channel.createMessageComponentCollector();
                                                collector.on('collect', async collected => {
                                                    nextCardColor = collected.customId;

                                                    let answerRow = new ActionRowBuilder();
                                                    for (let button of buttons) { 
                                                        if (button.data.custom_id === collected.customId) answerRow.addComponents(button);
                                                    }
                                                    const answerEmbed = new EmbedBuilder().setTitle(`Color:`);
                                                    collected.update({ embeds: [answerEmbed], components: [answerRow] });
                                                    collector.stop();

                                                    gameInfo.turn = gameInfo.order_clockwise ? gameInfo.turn+1 : gameInfo.turn-1; 

                                                    console.log(`${nextCardColor}${nextCardType}`);

                                                    sortCards(players, pi);

                                                    gameInfo.card.color = nextCardColor; //set current card
                                                    gameInfo.card.type = nextCardType;

                                                    gameInfo.round ++;
                                                    if (gameInfo.order_clockwise) {
                                                        for (let i = 0; i < 5; i++) {
                                                            gameInfo.players_order[i] = (gameInfo.players_arr[Math.abs(gameInfo.turn+i)%4]);
                                                            // console.log(Math.abs(gameInfo.turn+i)%4);
                                                        }
                                                    }else{
                                                        for (let i = 0; i < 5; i++) {
                                                            gameInfo.players_order[i] = (gameInfo.players_arr[Math.abs(gameInfo.turn-i)%4]);
                                                            // console.log(Math.abs(gameInfo.turn-i)%4);
                                                        }
                                                    }

                                                    console.log('collector end');
                                                    const playersjson = JSON.stringify(players, null, 2);
                                                    fs.writeFileSync('players.json', playersjson); 
                            
                                                    const gamejson = JSON.stringify(gameInfo, null, 2);
                                                    fs.writeFileSync('gameInfo.json', gamejson);
                                                });
                                                
                                                
                                                break;
                                            default:
                                                // console.log("0~9");
                                                break;
                                        }
                                        players[pi].cards.splice(pressed, 1);
                                    }
                                    if(nextCardColor != "None") {
                                        gameInfo.turn = gameInfo.order_clockwise ? gameInfo.turn+1 : gameInfo.turn-1; 

                                        console.log(`${nextCardColor}${nextCardType}`);

                                        sortCards(players, pi);

                                        gameInfo.card.color = nextCardColor; //set current card
                                        gameInfo.card.type = nextCardType;

                                        gameInfo.round ++;
                                        if (gameInfo.order_clockwise) {
                                            for (let i = 0; i < 5; i++) {
                                                gameInfo.players_order[i] = (gameInfo.players_arr[Math.abs(gameInfo.turn+i)%4]);
                                                // console.log(Math.abs(gameInfo.turn+i)%4);
                                            }
                                        }else{
                                            for (let i = 0; i < 5; i++) {
                                                gameInfo.players_order[i] = (gameInfo.players_arr[Math.abs(gameInfo.turn-i)%4]);
                                                // console.log(Math.abs(gameInfo.turn-i)%4);
                                            }
                                        }

                                        console.log('collector end');
                                        const playersjson = JSON.stringify(players, null, 2);
                                        fs.writeFileSync('players.json', playersjson); 
                
                                        const gamejson = JSON.stringify(gameInfo, null, 2);
                                        fs.writeFileSync('gameInfo.json', gamejson);
                                    }
                                });
                            }else{ //not your turn
                                const buttons = [];
    
                                buttons.push(new ButtonBuilder()
                                    .setCustomId('draw')
                                    .setLabel('Draw')
                                    .setStyle(2)
                                    .setDisabled(true));
    
                                buttons.push(new ButtonBuilder() //add space between draw button and card buttons
                                    .setCustomId('space1')
                                    .setLabel('\u200B')
                                    .setStyle(2)
                                    .setDisabled(true));

                                let idCounter = 0;
                                let accessed = false;
                                for (let card of players[pi].cards) {
                                    let label, style;
                                    let disable = true;
                                    switch (card.type) {
                                        case 'reverse':
                                            label = emojis[0];
                                            break;
                                        case 'skip':
                                            label = emojis[1];
                                            break;
                                        case 'plate':
                                            label = emojis[2];
                                            break;
                                        default:
                                            label = card.type;
                                            break;
                                    }
                                    for (let i = 0; i < c_colors.length; i++) {
                                        if (card.color == c_colors[i]) style = i != 4 ? i+1 : 2; // if color is none then color set to grey
                                    }
                                    
                                    if (card.color === "None" && !accessed) { //add space between color buttons and none color buttons
                                        buttons.push(new ButtonBuilder() 
                                            .setCustomId('space2')
                                            .setLabel('\u200B')
                                            .setStyle(2)
                                            .setDisabled(true));
                                        accessed = true;
                                    } 
                                    
                                    buttons.push(new ButtonBuilder()
                                                    .setCustomId(`${idCounter}`)
                                                    .setLabel(label)
                                                    .setStyle(style)
                                                    .setDisabled(disable));
                                    console.log(idCounter);
                                    idCounter++;
                                }
    
                                const rows =[];
                                let rowIndex = 0;
                                while (rowIndex < buttons.length) {
                                    const row = new ActionRowBuilder();
                                    for (let i = 0; i < 5 && rowIndex < buttons.length; i++) {
                                        row.addComponents(buttons[rowIndex]);
                                        rowIndex++;
                                    }
                                    rows.push(row);
                                }
    
                                const CardEmbed = new EmbedBuilder().setTitle('Your deck:');
    
                                interaction.followUp({ embeds: [CardEmbed], components: rows, ephemeral:true});
                            } 
                        }

                        if (pi == 3){
                            for (let player of players) {
                                if (player.cards.length === 0) {
                                    clearInterval(checkInterval2);
                                    console.log("game finsihed")

                                    let index, min;
                                    let rankplayers = [];
                                    for(let i = 0; i < 4; i++) {
                                        min = 1000;
                                        for(let j = 0; j < players.length; j++) {
                                            if (players[j].cards.length <= min) {
                                                index = j;
                                                min = players[j].cards.length;
                                            }
                                        }
                                        console.log(index);
                                        rankplayers.push(players[index]);
                                        players.splice(index, 1);
                                    }

                                    players = [];
                                    gameInfo = {};

                                    const endEmbed = new EmbedBuilder()
                                        .setColor(0x0099FF)
                                        .setTitle('Game Over')
                                        .setFields(
                                            { name: '1st', value: `<@${rankplayers[0].id}> \n ${addBracket(rankplayers[0].cards.length)} cards left`, inline: true },
                                            { name: '2nd', value: `<@${rankplayers[1].id}> \n ${addBracket(rankplayers[1].cards.length)} cards left`, inline: true },
                                            { name: '\n', value: '\n'}, //endl
                                            { name: '3rd', value: `<@${rankplayers[2].id}> \n ${addBracket(rankplayers[2].cards.length)} cards left`, inline: true },
                                            { name: '4th', value: `<@${rankplayers[3].id}> \n ${addBracket(rankplayers[3].cards.length)} cards left`, inline: true },
                                        )
    
                                    await interaction.followUp({ embeds: [endEmbed] })

                                    const scoredata = fs.readFileSync('score.json');
                                    let score = JSON.parse(scoredata);
                                    
                                    for (let rankplayer of rankplayers) {
                                        let found = false;
                                        for (let scoreplayer of score) {
                                            if (scoreplayer.id === rankplayer.id) {
                                                found = true;
                                                scoreplayer.gamesPlayed++;
                                                scoreplayer.cardsLeft.total += rankplayer.cards.length;
                                                scoreplayer.cardsLeft.avg = scoreplayer.cardsLeft.total / scoreplayer.gamesPlayed;
                                            }
                                        }
                                        if (!found) {
                                            score.push({
                                                id: rankplayer.id,
                                                username: rankplayer.username,
                                                gamesPlayed: 1,
                                                cardsLeft:{
                                                    total: rankplayer.cards.length,
                                                    avg: rankplayer.cards.length / 1,
                                                }
                                            })
                                        }
                                    }

                                    //sort rank
                                    let index1, min1;
                                    let new_score = [];
                                    for(let i = 0; i < score.length; i++) {
                                        min1 = 1000;
                                        for(let j = 0; j < score.length; j++) {
                                            if (score[j].cardsLeft.avg <= min) {
                                                index1 = j;
                                                min1 = score[j].cardsLeft.avg;
                                            }
                                        }
                                        console.log(index1);
                                        new_score.push(score[index]);
                                        score.splice(index1, 1);
                                    }
                                    score = new_score;
                                    
                                    const playersjson = JSON.stringify(players, null, 2);
                                    fs.writeFileSync('players.json', playersjson); 
            
                                    const gamejson = JSON.stringify(gameInfo, null, 2);
                                    fs.writeFileSync('gameInfo.json', gamejson);

                                    const scorejson = JSON.stringify(score, null, 2);
                                    fs.writeFileSync('score.json', scorejson);

                                    process.exit(0);
                                }
                            }
                        }

                        if (gameInfo.quit == true) {
                            clearInterval(checkInterval2);
                            const quitEmbed = new EmbedBuilder ()
                                .setColor('Red')
                                .setTitle('Game end')

                            await interaction.followUp({ embeds: [quitEmbed] });

                            players = [];
                            gameInfo = {};

                            const playersjson = JSON.stringify(players, null, 2);
                            fs.writeFileSync('players.json', playersjson); 
    
                            const gamejson = JSON.stringify(gameInfo, null, 2);
                            fs.writeFileSync('gameInfo.json', gamejson);

                            c

                            process.exit(0);
                        }
                        
                    }, 1000);
                }
            }, 1000); // 每隔 1 秒檢查一次條件 
        }
    }
};