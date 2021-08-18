const { Command } = require("../../commands");
const { Message, Button, Menu, MessageEmbed } = require("../../message");

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
			new Message()
				.setContent(
					`🏓 PONG !\nBot ping : ${resMsg.createdTimestamp - message.createdTimestamp} ms\nApi ping : ${message.client.ws.ping} ms\nMore informations about API : <https://discordstatus.com>`
				)
				.addButton(
					new Button({
						emoji: "🔄",
						async onClick(interaction) {
							resMsg = await interaction.message.edit("...");
							interaction.update(
								`🏓 PONG !\nBot ping : ${resMsg.editedTimestamp - interaction.createdTimestamp} ms\nApi ping : ${
									message.client.ws.ping
								} ms\nMore informations about API : <https://discordstatus.com>`
							);
						},
					})
				)
		);
	}
}
module.exports = Ping;
