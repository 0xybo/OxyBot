const { Message, Button, Menu, MessageEmbed } = require("../../message");
const { Command: _Command } = require("../../commands");

class Command extends _Command {
	constructor() {
		super();
		this.setName("Command command");
		this.setDescription("Enable/disable command on a server.");
		this.setAliases(["command", "commands", "cmd"]);
		this.setArguments([
			{
				type: ["string"],
				required: false,
			},
		]);
		this.setPermissions(["MANAGE_GUILD"]);
		this.setBotPermissions([]);
		this.setShortcut([]);
	} /** @param {require('../../client')} message[client]*/
	async run(message, config) {
		if (message.parsed.arguments.length === 0) {
			return message.channel.send(home(message, config));
		} else {
			if (message.client.commands.get(message.parsed.arguments[0].raw.toLowerCase())) {
				let id = message.parsed.arguments[0].raw.toLowerCase();
				if (id === "command") return message.translate.get("command.isCommand");
				let state;
				let disabled = JSON.parse(config.disabled_commands);
				if (disabled.includes(id)) {
					state = message.translate.get("command.enabled");
					disabled.splice(disabled.indexOf(id), 1);
					await message.client.db.setGuildSetting(message.guild.id, "disabled_commands", JSON.stringify(disabled));
				} else {
					state = message.translate.get("command.disabled");
					disabled.push(id);
					await message.client.db.setGuildSetting(message.guild.id, "disabled_commands", JSON.stringify(disabled));
				}
				config = await message.client.db.getGuild(message.guild.id);
				message.parsed.parameters.info = message.translate.get("command.success", { command: id, state });
				return message.channel.send(home(message, config));
			}
		}
	}
}

module.exports = Command;

function home(message, config) {
	let msg = new Message();
	let embed = new MessageEmbed().setTitle(message.translate.get("command.title")).setDescription(message.translate.get("command.description", { prefix: config.prefix }));
	let disabled = JSON.parse(config.disabled_commands).join(", ");
	let enabled = [];
	message.client.commands.commands.forEach((cmd) => {
		if (!disabled.includes(cmd.id)) enabled.push(cmd.id);
	});
	embed.addField(message.translate.get("command.commandsEnabled"), enabled.join(", ") || "/");
	embed.addField(message.translate.get("command.commandsDisabled"), disabled || "/");
	if (message.parsed.parameters.info) msg.setContent(message.parsed.parameters.info);
	msg.addEmbed(embed)
	return msg;
}
