const { SlashCommandBuilder, EmbedBuilder, UserSelectMenuInteraction } = require ('discord.js');
const fs = require('node:fs');

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
                    .setColor('Red')
                    .setDescription('You are already in...');
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        if (found == false) {
            players.push({ 
                id: interaction.user.id, 
                name: interaction.user.name,
                avatar: interaction.user.avatar,
                quit: false,
                cards:[],
            });
            const playerCount = players.length;
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('You are in!')
                .setDescription(`Waiting ${playerCount} / 4`);
            await interaction.reply({ embeds: [embed] });
        }

        const json = JSON.stringify(players, null, '\0');
        fs.writeFileSync('players.json', json);
    }
};