import Discord = require('discord.js');

class MessageList {

    // Class properties
    private orange = 0xFFA500;
    private embed = new Discord.MessageEmbed();
    private pages = 0;
    private currentPage = 1;
    private messages: Array<string> = [];

    /**
     * 
     * @param data The data to show in the list
     */
    constructor(data: Array<string>) {
        this.messages = data;       
        this.embed = this.createEmbed();
    }

    /**
     * Creates and embed, this method is only called by the constructor
     */
    private createEmbed(){
        // Figure out how many pages there are
        const _numOf10s = Math.floor(this.messages.length / 10);
        const _rest = this.messages.length % 10;
        if(_rest !== 0)
            this.pages = _numOf10s + 1;
        else
            this.pages = _numOf10s;
    
        // Combine all messages into the description
        let _desc = "";
        let _maxItems = 10;
        for(let i = 0; i < _maxItems; i++){
            if(i == this.messages.length) break;

            if(i !== (_maxItems - 1))
                _desc += `**${i+1}.** ${this.messages[i]}\n`
            else
                _desc += `**${i+1}.** ${this.messages[i]}`
        }
    
        _desc += `\n\n**Page ${this.currentPage}/${this.pages}**`
    
        let _embed = new Discord.MessageEmbed()
                    .setColor(this.orange)
                    .setTitle("Messages")
                    .setDescription(_desc)
                    .setFooter("Created by Johannes Emmoth @ [jinado.se](http://jinado.se)")
        _embed.type = "rich";

        return _embed;
    }

    /**
     * Updates the embed based off of the current page
     */
    private updateEmbed(): void{
        // Create a new dataset
        const _oldPage = this.currentPage - 1;
        let _reversedTempMsgs: Array<string> = [];
        for(let i = (this.messages.length - 1); i > (_oldPage * 10); i--){
            _reversedTempMsgs.push(this.messages[i]);
        }

        // Create the new description
        const _tempMsgs = _reversedTempMsgs.reverse();
        let _desc: string = "";
        let _maxItems = 10;
        for(let i = 0; i < _maxItems; i++){
            if(i == _tempMsgs.length) break;

            let _itemNum = i + (_oldPage * 10) + 1;
            if(i !== (_maxItems - 1))
                _desc += `**${_itemNum}.** ${_tempMsgs[i]}\n`
            else
                _desc += `**${_itemNum}.** ${_tempMsgs[i]}`
        }

        _desc += `\n\n**Page ${this.currentPage}/${this.pages}**`;

        // Overwrite the old description with the new description
        this.embed.setDescription(_desc);
    }

    /**
     * Changes the page
     * @param forward If true, shifts the page forwards
     * @param fast If true, shifts as far as possible in the specified direction
     */
    public shiftPage(forward: boolean, fast: boolean = false): void{
        if(forward){
            if(fast){
                this.currentPage = this.pages;
                this.updateEmbed();
                return;
            }

            if(this.currentPage < this.pages){
                this.currentPage++;
                this.updateEmbed();
            }
        } else {
            if(fast){
                this.currentPage = 1;
                this.updateEmbed();
                return;
            }

            if(this.currentPage > 1){
                this.currentPage--;
                this.updateEmbed();
            }
        }
    }

    // Getters
    get Embed() {
        return this.embed;
    }

    get TotalPages() {
        return this.pages;
    }

    get CurrentPage() {
        return this.currentPage;
    }
}

export default MessageList;