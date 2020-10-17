// Middleware
require('dotenv').config()
const fs = require("fs").promises;
const Discord = require('discord.js');
const Client = new Discord.Client();
const MessageList = require("./modules/MessageList").default;

// Important constants
const orange = 0xFFA500;
const prefix = "!truthbot";
const rewind = '⏪'
const back = '◀️';
const forward = '▶️';
const fastForward = '⏩';
const maxTime = 600000; // The max time a list message should be saved (10 minutes)

// List of lists
let messageLists = {}; // Store the MessageList object
let messageListsMsgs = {} // Store the actual Discord Message object

// Delete old lists from the list of lists
function deleteOldLists(){
    if(messageLists.length > 0){ 
        for (const key in messageLists) {
            // Check to see if the message has been alive for 10 minutes
            let msg = messageListsMsgs[key];
            if((new Date().getTime()) - msg.createdTimestamp >= maxTime){
                delete messageLists[key];
                delete messageListsMsgs[key];
            }
        }
    }

    // Make sure to recursively run this function every minute
    setTimeout(deleteOldLists, 60000);
}

// Inform me that the bot has successfully logged in
Client.on("ready", () => {
    console.log(`Successfully logged in as ${Client.user.tag}!`);
    setTimeout(deleteOldLists, 60000); // Timer is set on one minute
});

// Listen for messages
Client.on("message", async msg => {
    // Don't do anything if it was the bot who sent the message
    if(msg.author.bot) return;

    msg.createdTimestamp

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
    if(msg.content.toLowerCase().startsWith(prefix)){

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
            let helpEmbed = new Discord.MessageEmbed()
                            .setTitle("Help")
                            .setColor(orange)
                            .addFields(
                                {
                                    name: "help, ?",
                                    value: "Displays this help message"
                                },
                                {
                                    name: "Give us the truth!, gt",
                                    value: "Tells the truth"
                                },
                                {
                                    name: "list",
                                    value: "Lists all currently available messages"
                                },
                                {
                                    name: "add <message>",
                                    value: "Adds the specified message to the bot. Usuable only by Jinado and Flax"
                                },
                            )
                            .setFooter("Created by Johannes Emmoth @ http://jinado.se");
            helpEmbed.type = "rich";
            await msg.channel.send(helpEmbed);
            return;
        } else if (msg.content.toLowerCase() === "!truthbot give us the truth!" || msg.content.toLowerCase().endsWith("gt")){
            const message = await fetchMessage();
            await msg.channel.send(message);
            return;
        } else if (msg.content.toLowerCase().endsWith("list")) {
            // Create and send the list of messages
            const list = new MessageList(require("./messages.json"));
            const listMsg = await msg.channel.send(list.Embed);

            // Save the list
            messageLists[listMsg.id] = list;
            messageListsMsgs[listMsg.id] = listMsg;

            // Add reactions
            await listMsg.react(rewind);
            await listMsg.react(back);
            await listMsg.react(forward);
            await listMsg.react(fastForward);
            return;
        } else if(msg.content.toLowerCase().match(/^!truthbot add/)){
            await msg.reply("Only Jinado and Flax can use this command.");
            return;
        }
    }
});

Client.on("messageReactionAdd", (reaction, user) => {
    if(user.bot) return;

    // Get the message the reaction happened on
    const msg = reaction.message;

    // See if the message is one of the list messages
    if(messageLists.hasOwnProperty(msg.id))
    {
        let list = messageLists[msg.id];
        // Identify what reaction was used
        switch(reaction.emoji.name){
            case rewind:
                list.shiftPage(false, true);
                msg.edit(list.Embed);
                break;
            case back:
                list.shiftPage(false, false);
                msg.edit(list.Embed);
                break;
            case forward:
                list.shiftPage(true, false);
                msg.edit(list.Embed);
                break;
            case fastForward:
                list.shiftPage(true, true)
                msg.edit(list.Embed);
                break;
            default:
                break;
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