const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', (message) => {
  if (message.content.startsWith('!send_message')) {
    const args = message.content.split(' ');
    const channelID = args[1];
    const text = args[2];
    const imageUrl = args[3];
    const buttonLabel = args[4];

    const channel = client.channels.cache.get(channelID);
    if (channel) {
      const embed = new Discord.MessageEmbed()
        .setTitle('New Post')
        .setDescription(text)
        .setImage(imageUrl)
        .setColor('#0099ff')
        .setFooter('Call to Action')
        .setTimestamp();

      channel.send({ embeds: [embed] }).then((sentMessage) => {
        sentMessage.react('👍');
      });
    }
  }
});

client.login('MTEyMTcxNzc5NDEwNzU2MDAxNg.Gl-CCD.l2eSM2GDA7GPOgk89bumr1YUNY4zI1Yh-2CwiI');