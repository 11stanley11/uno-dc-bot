const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder().setName("embed").setDescription("show an embed"),
    async execute(client, interaction) {
        const embed = new EmbedBuilder()
            .setTitle("Rickroll")
            .setColor("Red")
            .setDescription("best song ever")
            .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            .setImage('https://i.insider.com/602ee9d81a89f20019a377c6?width=1136&format=jpeg')
            .setFields([{name: "views", value: "140000000", inline: true},
                        {name: "likes", value: "16570000", inline: true}]);
        interaction.reply({ embeds: [embed] });
    },
};
/*
.setURL('放URL')
.setAuthor({ name: '', iconURL: '放URL', url: '放URL' })
.setDescription('')
.setThumbnail('放URL')
.addFields({ name: '', value: '', inline: true or false })
.setImage('放URL')
.setTimestamp()
.setFooter({ text: '', iconURL: '放URL' });
*/
