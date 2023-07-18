const { SlashCommandBuilder, EmbedBuilder, UserSelectMenuInteraction } = require ('discord.js');
const fs = require('node:fs');

function addBracket ( input ) {
    const output = '`' + input + '`';
    return output;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('start game once you get 4 players'),

    async execute(client, interaction) {
        console.log(interaction.user);

        const data = fs.readFileSync('players.json');
        const players = JSON.parse(data);



        const json = JSON.stringify(players, null, '\0');
        fs.readFileSync('players.json', json);
    }    
};