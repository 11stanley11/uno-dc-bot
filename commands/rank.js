const { SlashCommandBuilder, EmbedBuilder, UserSelectMenuInteraction } = require("discord.js");
const fs = require('node:fs');

function addBracket(input) {
    const output = '`' + input + '`';
    return output;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('search for your rank'),
    async execute(client, interaction) {
        const scoredata = fs.readFileSync('data/score.json');
        const score = JSON.parse(scoredata);

        let found = false;
        for (let player of score) {
            if (player.id === interaction.user.id) {
                found = true;
                const dataEmbed = new EmbedBuilder ()
                    .setTitle('Your data')
                    .setDescription(`<@${player.id}>`)
                    .addFields(
                        { name: 'Rank:', value: `${addBracket(score.indexOf(player))}`, inline: true },
                        { name: 'Games played:', value: `${addBracket(player.gamesPlayed)}`, inline: true },
                        { name: 'Average Cards Left:', value: `${addBracket(player.cardsLeft.avg)}`, inline: true },
                    )

                await interaction.reply ({ embeds: [dataEmbed] });
            }
        }

        if (!found) {
            const notFoundEmbed = new EmbedBuilder ()
                .setColor('Red')
                .setTitle('Data not found')
            
            await interaction.reply({ embeds: [notFoundEmbed] })
        }
    }
};