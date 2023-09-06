const { SlashCommandBuilder, EmbedBuilder, UserSelectMenuInteraction, ButtonBuilder, ActionRowBuilder } = require ('discord.js');
const fs = require('node:fs');

function addBracket ( input ) {
    const output = '`' + input + '`';
    return output;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quit')
        .setDescription('quit game'),

    async execute(client, interaction) {
        console.log(interaction.user);

        const playerdata = fs.readFileSync('data/players.json');
        const players = JSON.parse(playerdata);

        const gameInfodata = fs.readFileSync('data/gameInfo.json');
        const gameInfo = JSON.parse(gameInfodata);

        let found = false;
        for (let i = 0; i < players.length; i++) {
            if(players[i].id == interaction.user.id) {
                found = true;
                if(players.length != 4) {
                    players.splice(i, 1); //delete
                    const playerCount = addBracket(players.length + '/4');
                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('You successfully quit')
                        .setDescription(`waiting ${playerCount} to join`);
                    await interaction.reply({ embeds: [embed]});
                }else{
                    const yesButton = new ButtonBuilder()
                        .setCustomId('yes')
                        .setLabel('Yes')
                        .setStyle('Success')
                    const noButton = new ButtonBuilder()
                        .setCustomId('no')
                        .setLabel('No')
                        .setStyle('Danger')
                    const row = new ActionRowBuilder()
                        .addComponents(
                            yesButton, noButton
                        ) 

                    let text = '﹍ ﹍ ﹍ ﹍';
                    let ffEmbed = new EmbedBuilder()
                            .setTitle('End this game?')
                            .setDescription(text) 

                    await interaction.reply ({ embeds: [ffEmbed], components: [row] });
                    
                    let yes = 0;
                    let index = 0;
                    let answered_arr = [];
                    const collector = interaction.channel.createMessageComponentCollector({ time: 15000 });
                    collector.on('collect', async collected => {
                        let found1 = false;
                        let accessed = false;
                        for (let player of players){
                            if (player.id === collected.user.id) {
                                found1 = true;
                                for (let answered of answered_arr) {
                                    if (answered === collected.user.id) accessed = true;
                                }
                            }
                        }

                        if (found1 && !accessed) {
                            answered_arr.push(collected.user.id);

                            console.log(index);
                            if (collected.customId === 'yes') {
                                yes++;
                                text = text.slice(0, index) + '✅' + text.slice(index + 1);
                            }else{
                                text = text.slice(0, index) + '❌' + text.slice(index + 1);
                            }
                            index += 2;
                            ffEmbed.setDescription(text);
                            await interaction.editReply({ embeds: [ffEmbed], components: [row] });
                        }

                        if (yes >= 3) {
                            gameInfo.quit = true;
                            const gamejson = JSON.stringify(gameInfo, null, 2);
                            fs.writeFileSync('data/gameInfo.json', gamejson);
                        }
                    });
                }  
            }
        }

        if (found == false) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('You are not even joined');
            await interaction.reply({ embeds: [embed], ephemeral: true});
        }

        const json = JSON.stringify(players, null, 2);
        fs.writeFileSync('data/players.json', json);
    }
};