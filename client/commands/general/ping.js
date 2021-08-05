const { Command } = require("../../commands");

class Ping extends Command {
	constructor() {
		super();
		this.setName("Command Ping");
		this.setDescription("PONG !");
		this.setAliases(["ping"]);
		this.setArguments([]);
		this.setBotPermissions(["SEND_MESSAGES"]);
	}
	async run(message, config) {
		var resMsg = await message.channel.send("...");
		resMsg.edit(
			`🏓 PONG !\nBot ping : ${resMsg.createdTimestamp - message.createdTimestamp} ms\nApi ping : ${message.client.ws.ping} ms\nMore informations about API : <https://discordstatus.com>`
		);
		Promise.resolve();
	}
}
module.exports = Ping;
