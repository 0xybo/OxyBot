const { Command } = require("../../commands");
const { MessageEmbed } = require("discord.js");
const settings = require("../../../config.json").guildSettings;

class Settings extends Command {
	constructor() {
		super();
		this.setName("Settings command");
		this.setDescription("Change settings");
		this.setAliases(["settings", "st"]);
		this.setArguments([
			{
				type: "string",
				required: false,
			},
			{
				type: "string",
				required: false,
			},
		]);
		this.setPermissions(["MANAGE_GUILD"]);
		this.setBotPermissions(["SEND_MESSAGES"]);
		this.setShortcut([
			{
				trigger: "prefix",
				message: {
					arguments: [{raw: "prefix", original: "prefix", type: "string"}],
					params: {noButtons: true}
				}
			}
		])
	}
	async run(message, config) {
		if (message.parsed.params.interaction && message.author.id != message.client.user.id) message.parsed.params.interaction = false;
		if (message.parsed.arguments.length === 1) {
			let setting = settings[message.parsed.arguments[0]?.raw.toLowerCase()];
			if (!setting) return message.client.commands.runCommand(message, "settings", config, { params: { error: message.translate.get("settings.invalidSetting") } });
			let name = message.parsed.arguments[0].raw.toLowerCase();
			let msg = {
				embed: new MessageEmbed()
					.setTitle(message.translate.get(["guildSettings", name, "name"]))
					.setDescription(message.translate.get(["guildSettings", name, "description"]))
					.setFooter("OxyBot | settings | " + name)
					.addField(message.translate.get("settings.currentValue"), config[name])
					.setColor(Math.floor(Math.random() * 16777215)),
			};
			if (!message.parsed.params.noButtons)
				msg.buttons = [
					new message.client.DInteractions.MessageButton({
						style: 1,
						emoji: "⬅️",
						label: message.translate.get("settings.back"),
						onClick(component, button) {
							component.reply.defer();
							message.client.commands.runCommand(component.message, "settings", config, {
								params: { interaction: true },
							});
						},
					}),
				];
			if (setting.possibleValues) {
				let menu = {
					options: [],
					placeholder: message.translate.get("settings.commandPlaceholder"),
					async onUpdate(component, dropDown) {
						component.reply.defer();
						await message.client.db.setGuildSetting(message.guild.id, name, component.values[0]);
						config[name] = component.values[0];
						return message.client.commands.runCommand(component.message, "settings", config, {
							params: { interaction: true },
							arguments: [{ raw: name, original: name, type: "string" }],
						});
					},
				};
				setting.possibleValues.forEach((e) => {
					if (config[name] != e) menu.options.push({ label: message.translate.get(["guildSettings", name, "possibleValues", e]), value: e });
				});
				if (!message.parsed.params.noButtons) msg.menus = [new message.client.DInteractions.MessageDropDown(menu)];
			}
			if (message.parsed.params.error) msg.content = message.parsed.params.error;
			if (message.parsed.params.interaction) return message.edit(msg);
			else return message.channel.send(msg);
		} else if (message.parsed.arguments.length === 2) {
			let setting = settings[message.parsed.arguments[0]?.raw.toLowerCase()];
			if (!setting) return message.client.commands.runCommand(message, "settings", config, { params: { error: message.translate.get("settings.invalidSetting") } });
			let name = message.parsed.arguments[0].raw.toLowerCase();
			if (setting.possibleValues) {
				if (settings.possibleValues.includes(message.parsed.arguments[1].raw)) {
					await message.client.db.setGuildSetting(message.guild.id, name, message.parsed.arguments[1].raw);
					config[name] = message.parsed.arguments[1].raw;
					return message.client.commands.runCommand(message, "settings", config, {
						arguments: [{ raw: message.parsed.arguments[0].raw.toLowerCase(), original: message.parsed.arguments[0]?.raw.toLowerCase(), type: "string" }],
						params: { noButtons: true },
					});
				} else {
					return message.client.commands.runCommand(message, "settings", config, {
						arguments: [{ raw: message.parsed.arguments[0].raw.toLowerCase(), original: message.parsed.arguments[0]?.raw.toLowerCase(), type: "string" }],
						params: { error: message.translate.get("settings.invalidValue") },
					});
				}
			} else if (setting.type === message.parsed.arguments[1].type) {
				await message.client.db.setGuildSetting(message.guild.id, name, message.parsed.arguments[1].raw);
				config[name] = message.parsed.arguments[1].raw;
				return message.client.commands.runCommand(message, "settings", config, {
					arguments: [{ raw: message.parsed.arguments[0].raw.toLowerCase(), original: message.parsed.arguments[0]?.raw.toLowerCase(), type: "string" }],
					params: { noButtons: true },
				});
			} else {
				return message.client.commands.runCommand(message, "settings", config, {
					arguments: [{ raw: message.parsed.arguments[0].raw.toLowerCase(), original: message.parsed.arguments[0]?.raw.toLowerCase(), type: "string" }],
					params: { error: message.translate.get("settings.invalidValue") },
				});
			}
		} else {
			let msg = {
				embed: new MessageEmbed()
					.setTitle(message.translate.get("settings.title"))
					.setDescription(message.translate.get("settings.description"))
					.setFooter("OxyBot | settings")
					.setColor(Math.floor(Math.random() * 16777215)),
			};
			let menuOptions = {
				options: [],
				placeholder: message.translate.get("settings.homePlaceholder"),
				onUpdate(component, dropDown) {
					component.reply.defer();
					message.client.commands.runCommand(component.message, "settings", config, {
						params: { interaction: true },
						arguments: [{ raw: component.values[0], original: component.values[0], type: "string" }],
					});
				},
			};
			Object.entries(settings).forEach(([key, value]) => {
				msg.embed.addField(message.translate.get(["guildSettings", key, "name"]), message.translate.get(["guildSettings", key, "description"]));
				menuOptions.options.push({
					label: message.translate.get(["guildSettings", key, "name"]),
					value: key,
				});
			});
			if (!message.parsed.params.noButtons) msg.menus = [new message.client.DInteractions.MessageDropDown(menuOptions)];
			if (message.parsed.params.error) msg.content = message.parsed.params.error;
			if (message.parsed.params.interaction) return message.edit(msg);
			else return message.channel.send(msg);
		}
	}
}

module.exports = Settings;
