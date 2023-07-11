const { SlashCommandBuilder, UserSelectMenuInteraction } = require ('discord.js');
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

            //如果有就修改該玩家的 money 並回覆結果
            if (players[j].id == collected.user.id) {
                found = true;
                const embed = new EmbedBuilder()
                    .serColo
            }
        }

        if (found == false) {
            players.push({ id: interaction.user.id, money: 500 });
            const resultEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('剪刀石頭布！')
                .setDescription(`結果：${earnings}元\n你現在有 ${500 + earnings} 元!`);
            collected.update({ embeds: [resultEmbed], components: [] });
        }
    }
};