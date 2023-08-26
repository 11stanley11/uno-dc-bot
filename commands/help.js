const { SlashCommandBuilder, EmbedBuilder, UserSelectMenuInteraction } = require("discord.js");
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('see all commands'),
    async execute (client, interaction) {
        const embed = new EmbedBuilder ()
            .setTitle('All commands')
            .addFields(
                { name: '/join', value: 'Join game. Once reach 4 players, the game will start. Make sure you get 4 players to play with', inline: false },
                { name: '/quit', value: 'If you have joined, using /quit to quit. If you are in a game already, using /quit to end midgame. However, you will need 3 accept votes to end the game. Otherwise, the game will continue.', inline: false },
                { name: '/rank', value: 'Check your rank. Data includes games played and average cards left.', inline: false },
                { name: '/podium', value: 'Check who is on the podium', inline: false },
                { name: '/help', value: 'See all commands available on this uno bot.', inline: false},
            )
        
        await interaction.reply ({ embeds: [embed] });
    }
};