// Middleware
require('dotenv').config()
const Discord = require('discord.js');
const Client = new Discord.Client();


// Inform me that the but has successfully logged in
Client.on("ready", () => {
    console.log(`Logged in as ${Client.user.tag}!`);
});

// Listen for messages
Client.on("message", async msg => {
    
});

// Login the bot
Client.login(process.env.TRUTHBOT_TOKEN);