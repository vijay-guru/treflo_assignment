const express =require('express');
const mongoose =require('mongoose');
const dotenv=require('dotenv')
dotenv.config();

const Discord = require('discord.js');
const client = new Discord.Client({ intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages
  ]})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', (message) => {
  if (message.content=='!send_message') {
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

client.login(process.env.DISCORD_TOKEN);

// Create a MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the user schema
const userSchema = new mongoose.Schema({
  username: String,
  serverName: String,
});
const User = mongoose.model('User', userSchema);

// Create an Express server
const app = express();
app.use(express.json());

// Store a user who used the send_message command
app.post('/users', (req, res) => {
  const { username, serverName } = req.body;
  const user = new User({ username, serverName });
  user.save((err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(201);
    }
  });
});

// API to send a message externally
app.post('/send_message', (req, res) => {
  const { serverId, channelId, text, imageUrl, buttonText } = req.body;

  const channel = client.channels.cache.get(channelId);
  if (channel) {
    const embed = new Discord.MessageEmbed()
      .setTitle('New Post')
      .setDescription(text)
      .setImage(imageUrl)
      .setColor('#0099ff')
      .setFooter(buttonText)
      .setTimestamp();

    channel.send({ embeds: [embed] }).then((sentMessage) => {
      sentMessage.react('👍');
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(404);
  }
});

// Get all users who interacted with the bot
app.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.json(users);
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});