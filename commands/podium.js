const { SlashCommandBuilder, EmbedBuilder, UserSelectMenuInteraction } = require("discord.js");
const fs = require('node:fs');

function addBracket(input) {
    const output = '`' + input + '`';
    return output;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('podium')
        .setDescription('see who is on the podium'),
    async execute (client, interaction) {
        const scoredata = fs.readFileSync('data/score.json');
        const score = JSON.parse(scoredata);

        if (score.length == 0) {
            const nodataEmbed = new EmbedBuilder ()
                .setColor('Red')
                .setTitle('No data available')

            await interaction.reply({ embeds: [nodataEmbed]})
        }else{
            const podiumEmbed = new EmbedBuilder ()
                .setTitle('Podium:')
                .addFields( // no use <@id> because this bot can cross server (changable)
                    { 
                        name: `1st: ${score[0].username}`,
                        value: `Games played: ${addBracket(score[0].gamesPlayed)}
                                Average cards Left: ${addBracket(score[0].cardsLeft.avg)}`,
                        inline: false,
                    },
                    { 
                        name: `2nd: ${score[1].username}`,
                        value: `Games played: ${addBracket(score[1].gamesPlayed)}
                              Average cards Left: ${addBracket(score[1].cardsLeft.avg)}`,
                        inline: false,
                    },
                    { 
                        name: `3rd: ${score[2].username}`,
                        value: `Games played: ${addBracket(score[2].gamesPlayed)}
                                Average cards Left: ${addBracket(score[2].cardsLeft.avg)}`,
                        inline: false,
                    },
                )

            await interaction.reply ({ embeds: [podiumEmbed] });
        }
    }
};