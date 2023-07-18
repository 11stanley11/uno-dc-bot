const { SlashCommandBuilder, EmbedBuilder, UserSelectMenuInteraction } = require ('discord.js');
const fs = require('node:fs');

function addBracket ( input ) {
    const output = '`' + input + '`';
    return output;
}

module.exports = {
    data: new SlashCommandBuilder()
            .setName('join')
            .setDescription('Join game'),

    async execute(client, interaction) {
        console.log(interaction.user);

        const data = fs.readFileSync('players.json');
        const players = JSON.parse(data);

        let found = false;
        for (let j = 0; j < players.length; j++) {
            if (players[j].id == interaction.user.id) {
                found = true;
                const embed = new EmbedBuilder()
                    .setDescription('You are already in...');
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        if (found == false) {
            if (players.length == 4) {
                const embed = new EmbedBuilder()
                .setDescription('Already reached max players');
            }else{
                players.push({ 
                    id: interaction.user.id, 
                    username: interaction.user.username,
                    avatar: 'https://cdn.discordapp.com/avatars/' + 
                            interaction.user.id + '/' +  
                            interaction.user.avatar + '.png',
                    inGame: false,
                    cards:[],
                });
                const playerCount = addBracket(players.length + '/4');
                const embed = new EmbedBuilder()
                    .setTitle('You are in')
                    .setDescription(`Waiting ${playerCount}`);
                await interaction.reply({ embeds: [embed] });
            }
        }
        const json = JSON.stringify(players, null, '\0');
        fs.writeFileSync('players.json', json);
    }
};