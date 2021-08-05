const { Command } = require("../../commands");
const {MessageEmbed} = require('discord.js')

class Infos extends Command {
	constructor() {
		super();
		this.setName("Command Infos");
		this.setDescription("Display informations about server, user, channel, ...");
		this.setAliases(["infos", "info"]);
		this.setArguments([
            {
                type: ["string", "user", "channel"],
                require: false
            }
        ]);
		this.setBotPermissions([]);
	}
	async run(message, config) {
        if(message.parsed.arguments.length === 0) {
            let msg = {
                embed: new MessageEmbed()
            }
        }
	}
}
module.exports = Infos;
