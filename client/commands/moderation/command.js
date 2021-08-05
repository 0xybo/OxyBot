const { MessageEmbed } = require("discord.js");
const { Command: _Command } = require("../../commands");

class Command extends _Command {
	constructor() {
		super();
		this.setName("Command command");
		this.setDescription("Enable/disable command on a server.");
		this.setAliases(["command"]);
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
			return home(message, config);
		} else {
			if (message.client.commands.get(message.parsed.arguments[0].raw.toLowerCase())) {
				let id = message.parsed.arguments[0].raw.toLowerCase();
				let state;
				let disabled = JSON.parse(config.disabledCommands);
				if (disabled.includes(id)) {
					state = message.translate.get("command.enabled");
					await message.client.db.setGuildSetting(message.guild.id, "disabledCommands", JSON.stringify(disabled.slice(disabled.indexOf(id), 1)));
				} else {
					state = message.translate.get("command.disabled");
					disabled.push(id);
					await message.client.db.setGuildSetting(message.guild.id, "disabledCommands", JSON.stringify(disabled));
				}
				config = await message.client.db.getGuild(message.guild.id);
				message.parsed.parameters.info = message.translate.get("command.success", { command: id, state });
				return home(message, config);
			}
		}
	}
}

module.exports = Command;

function home(message, config) {
	let msg = {
		embed: new MessageEmbed().setTitle(message.translate.get("command.title")).setDescription(message.translate.get("command.description", { prefix: config.prefix })),
	};
	let disabled = JSON.parse(config.disabledCommands).join(", ");
	let enabled = [];
	message.client.commands.commands.forEach((cmd) => {
		if (!disabled.includes(cmd.id)) enabled.push(cmd.id);
	});
	msg.embed.addField(message.translate.get("command.commandsEnabled"), enabled.join(", ") || "/");
	msg.embed.addField(message.translate.get("command.commandsDisabled"), disabled || "/");
	if (message.parsed.parameters.info) msg.content = message.parsed.parameters.info;
	return message.channel.send(msg);
}
