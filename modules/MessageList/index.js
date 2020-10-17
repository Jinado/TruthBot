"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Discord = require("discord.js");
var MessageList = (function () {
    function MessageList(data) {
        this.orange = 0xFFA500;
        this.embed = new Discord.MessageEmbed();
        this.pages = 0;
        this.currentPage = 1;
        this.messages = [];
        this.messages = data;
        this.embed = this.createEmbed();
    }
    MessageList.prototype.createEmbed = function () {
        var _numOf10s = Math.floor(this.messages.length / 10);
        var _rest = this.messages.length % 10;
        if (_rest !== 0)
            this.pages = _numOf10s + 1;
        else
            this.pages = _numOf10s;
        var _desc = "";
        var _maxItems = 10;
        for (var i = 0; i < _maxItems; i++) {
            if (i == this.messages.length)
                break;
            if (i !== (_maxItems - 1))
                _desc += "**" + (i + 1) + ".** " + this.messages[i] + "\n";
            else
                _desc += "**" + (i + 1) + ".** " + this.messages[i];
        }
        _desc += "\n\n**Page " + this.currentPage + "/" + this.pages + "**";
        var _embed = new Discord.MessageEmbed()
            .setColor(this.orange)
            .setTitle("Messages")
            .setDescription(_desc);
        _embed.type = "rich";
        return _embed;
    };
    MessageList.prototype.updateEmbed = function () {
        var _oldPage = this.currentPage - 1;
        var _reversedTempMsgs = [];
        for (var i = (this.messages.length - 1); i > (_oldPage * 10); i--) {
            _reversedTempMsgs.push(this.messages[i]);
        }
        var _tempMsgs = _reversedTempMsgs.reverse();
        var _desc = "";
        var _maxItems = 10;
        for (var i = 0; i < _maxItems; i++) {
            if (i == _tempMsgs.length)
                break;
            var _itemNum = i + (_oldPage * 10) + 1;
            if (i !== (_maxItems - 1))
                _desc += "**" + _itemNum + ".** " + _tempMsgs[i] + "\n";
            else
                _desc += "**" + _itemNum + ".** " + _tempMsgs[i];
        }
        _desc += "\n\n**Page " + this.currentPage + "/" + this.pages + "**";
        this.embed.setDescription(_desc);
    };
    MessageList.prototype.shiftPage = function (forward, fast) {
        if (fast === void 0) { fast = false; }
        if (forward) {
            if (fast) {
                this.currentPage = this.pages;
                this.updateEmbed();
                return;
            }
            if (this.currentPage < this.pages) {
                this.currentPage++;
                this.updateEmbed();
            }
        }
        else {
            if (fast) {
                this.currentPage = 1;
                this.updateEmbed();
                return;
            }
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updateEmbed();
            }
        }
    };
    Object.defineProperty(MessageList.prototype, "Embed", {
        get: function () {
            return this.embed;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MessageList.prototype, "TotalPages", {
        get: function () {
            return this.pages;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MessageList.prototype, "CurrentPage", {
        get: function () {
            return this.currentPage;
        },
        enumerable: false,
        configurable: true
    });
    return MessageList;
}());
exports.default = MessageList;
