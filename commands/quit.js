const { SlashCommandBuilder, EmbedBuilder, UserSelectMenuInteraction } = require ('discord.js');
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

        const data = fs.readFileSync('players.json');
        const players = JSON.parse(data);

        let found = false;
        for (let i = 0; i < players.length; i++) {
            if(players[i].id == interaction.user.id) {
                found = true;
                if(players[i].inGame == false) {
                    players.splice(i, 1); //delete
                    const playerCount = addBracket(players.length + '/4');
                    const embed = new EmbedBuilder()
                        .setTitle("You successfully quit")
                        .setDescription(`waiting ${playerCount}`);
                    await interaction.reply({ embeds: [embed]});
                }else{

                }  
            }
        }

        if (found == false) {
            const embed = new EmbedBuilder()
                .setDescription('You are not even in');
            await interaction.reply({ embeds: [embed], ephemeral: true});
        }

        const json = JSON.stringify(players, null, '\0');
        fs.writeFileSync('players.json', json);
    }
};