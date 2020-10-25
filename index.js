// Middleware
require('dotenv').config()
const Discord = require('discord.js');
const { default: MessageList } = require('./modules/MessageList');
const Client = new Discord.Client();
const db = require("./modules/database");

// Important constants
const orange = 0xFFA500;
const prefix = "!truthbot";
const rewind = '⏪'
const back = '◀️';
const forward = '▶️';
const fastForward = '⏩';
const deleted = '❌';
const maxTime = 600000; // The max time a list message should be saved (10 minutes)

// List of lists
let messageLists = {}; // Store the MessageList object
let messageListsMsgs = {} // Store the actual Discord Message object

// Delete old lists from the list of lists
async function deleteOldLists(){
    if(messageLists.length > 0){ 
        for (const key in messageLists) {
            // Check to see if the message has been alive for 10 minutes
            let msg = messageListsMsgs[key];
            if((new Date().getTime()) - msg.createdTimestamp >= maxTime){
                await msg.reactions.removeAll();
                await msg.react(deleted);
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
        if(msg.content.toLowerCase().match(/(v+.{0,4}i+.{0,4}l+.{0,4}s+.{0,4}h+.{0,4}ä+.{0,4}r+.{0,4}((a+.{0,4})|(s+.{0,4}))d+)/g))
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
            .setTitle("Help").setColor(orange).addFields(
                {name: "help, ?", value: "Displays this help message"},{
                name: "Give us the truth!, gt",value: "Tells the truth"},{
                name: "list",value: "Lists all currently available messages"},{
                name: "add <message>",value: "Adds the specified message to the bot. Usuable only by Jinado and Flax"})
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
            const list = new MessageList(await getMessagesFromDatabase());
            const listMsg = await msg.channel.send(list.Embed);

            // Save the list
            messageLists[listMsg.id] = list;
            messageListsMsgs[listMsg.id] = listMsg;

            // Add reactions
            addReactionsToListMessage(listMsg, list);
            return;
        } else if(msg.content.toLowerCase().match(/^!truthbot add/)){
            await msg.reply("Only Jinado and Flax can use this command.");
            return;
        }
    }
});

Client.on("messageReactionAdd", async (reaction, user) => {
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
                await msg.reactions.removeAll();
                addReactionsToListMessage(msg, list);
                break;
            case back:
                list.shiftPage(false, false);
                msg.edit(list.Embed);
                await msg.reactions.removeAll();
                addReactionsToListMessage(msg, list);
                break;
            case forward:
                list.shiftPage(true, false);
                msg.edit(list.Embed);
                await msg.reactions.removeAll();
                addReactionsToListMessage(msg, list);
                break;
            case fastForward:
                list.shiftPage(true, true)
                msg.edit(list.Embed);
                await msg.reactions.removeAll();
                addReactionsToListMessage(msg, list);
                break;
            default:
                break;
        }
    }
});

/**
 * Adds reactions to a list message depending on what page it is on
 * @param {Discord.Message} message 
 * @param {MessageList} list
 */
async function addReactionsToListMessage(message, list){
    if(list.CurrentPage !== 1){
        if(list.CurrentPage !== 2)
            await message.react(rewind);
        await message.react(back);
    }

    if(list.CurrentPage < list.TotalPages){
        await message.react(forward);
        if(list.CurrentPage !== (list.TotalPages - 1))
            await message.react(fastForward);
    }
}

/**
 * @returns {Promise<string[]>} returns all messages from the database
 */
async function getMessagesFromDatabase(){
    const [rows, columns] = await db.query("SELECT message FROM messages", [null]);
    let messages = [];
    rows.forEach(row => {
        messages.push(row.message);
    });

    return messages;
}

/**
 * Gets a random message from a JSON file
 * @returns {Promise<string>} a message from the file
 */
async function fetchMessage(){
    messages = await getMessagesFromDatabase();  
    return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Adds a message to the file with messages
 * @param {string} message 
 * @param {Function} callback
 */
async function addMessage(message, callback){
    try{
        // Format the new message
        let splitMessage = message.split(" ");
        let formattedMessage = "";
        for(let i = 2; i < splitMessage.length; i++){
            if(i !== (splitMessage.length - 1))
                formattedMessage += splitMessage[i] + " "
            else
                formattedMessage += splitMessage[i];
        }

        formattedMessage = formattedMessage.replace(/"/g, "\"");

        // Insert new message into database
        await db.query("INSERT INTO messages (message) VALUES (?)", [formattedMessage]);
        
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