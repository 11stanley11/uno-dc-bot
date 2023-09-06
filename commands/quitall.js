const { SlashCommandBuilder, EmbedBuilder, UserSelectMenuInteraction, ButtonBuilder, ActionRowBuilder } = require ('discord.js');
const fs = require('node:fs');

const adminId = '611134266109198366'
function addBracket ( input ) {
    const output = '`' + input + '`';
    return output;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quitall')
        .setDescription('This command needs admin permission'),

    async execute(client, interaction) {
        if(interaction.user.id === adminId) {
            const playerdata = fs.readFileSync('data/players.json');
            let players = JSON.parse(playerdata);

            if(players.length != 4) {
                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle(`Admin deleted ${addBracket(players.length)} joined players data.`)
                await interaction.reply({ embeds: [embed]});
                players = [];

                const json = JSON.stringify(players, null, 2);
                fs.writeFileSync('data/players.json', json);
            }else{
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Game is on going.')
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }else{
            const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('You do not have the permission.')
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }    
    }
};