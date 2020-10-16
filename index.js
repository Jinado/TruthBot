// Middleware
require('dotenv').config()
const fs = require("fs").promises;
const Discord = require('discord.js');
const Client = new Discord.Client();


// Inform me that the but has successfully logged in
Client.on("ready", () => {
    console.log(`Logged in as ${Client.user.tag}!`);
});

// Listen for messages
Client.on("message", async msg => {
    // Don't do anything if it was the bot who sent the message
    if(msg.author.id === process.env.TRUTHBOT_BOT_ID) return;

    // Reply with a mean message about Vilshärad if Grimpan wrote something
    if(msg.author.id === process.env.TRUTHBOT_GRIMPAN_ID){
        if(msg.content.toLowerCase().match(/vilshärad/g) || msg.content.toLowerCase().match(/vilshärsd/g))
        {
            const message = await fetchMessage();
            await msg.reply(message);
        }

        return;
    }

    // Check if someone who wasn't Grimpan wrote a command
    if(msg.content.toLowerCase().startsWith("!truthbot")){

        // Check if Jinado is trying to add a command
        if(msg.author.id === process.env.TRUTHBOT_JINADO_ID || msg.author.id === process.env.TRUTHBOT_FLAX_ID){
            if(msg.content.toLowerCase().match(/^!truthbot add/)){
                await addMessage(msg.content, async result => {
                    if(result) await msg.react("👍");
                    else await msg.react("👎");
                });

                return;
            }
        }

        // Listen for commands
        if(msg.content.toLowerCase().endsWith("help") || msg.content.endsWith("?")){
            await msg.channel.send("help, ?    :Displays this help dialog\nGive us the truth!, gt    :Tells the truth\nadd <SOME MESSAGE>    :Adds a message to the list of messages");
            return;
        } else if (msg.content.toLowerCase() === "!truthbot give us the truth!" || msg.content.toLowerCase().endsWith("gt")){
            const message = await fetchMessage();
            await msg.channel.send(message);
            return;
        } else if(msg.content.toLowerCase().match(/^!truthbot add/)){
            await msg.reply("Only Jinado and Flax can use this command.");
            return;
        }
    }
});

// Gets a random message from a JSON file
async function fetchMessage(){
    const data = await fs.readFile("./messages.json");
    const messages = JSON.parse(data);
    
    return messages[Math.floor(Math.random() * messages.length)];
}

// Adds a message to the file with messages
async function addMessage(message, callback){
    try{
        // Fetch data from file
        const data = await fs.readFile("./messages.json");
        let parsedData = JSON.parse(data);

        // Add new message to file
        let splitMessage = message.split(" ");
        let formattedMessage = "";
        for(let i = 2; i < splitMessage.length; i++){
            if(i !== (splitMessage.length - 1))
                formattedMessage += splitMessage[i] + " "
            else
                formattedMessage += splitMessage[i];
        }

        parsedData.push(formattedMessage);

        // Overwrite old data with new data
        await fs.writeFile("./messages.json", JSON.stringify(parsedData, null, 2));
        
        callback(true);
        return;
    } catch (error){
        console.log(error);
        callback(false);
    }

    callback(false);
}

// Login the bot
Client.login(process.env.TRUTHBOT_TOKEN);