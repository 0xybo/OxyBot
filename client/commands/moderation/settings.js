const { Command } = require("../../commands");
const settings = require("../../../config.json").guildSettings;
const { Message, Button, Menu, MessageEmbed } = require("../../message");

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
				type: ["string", "boolean"],
				required: false,
			},
		]);
		this.setPermissions(["MANAGE_GUILD"]);
		this.setBotPermissions(["SEND_MESSAGES"]);
		this.setShortcut([
			{
				trigger: "prefix",
				message: {
					arguments: [{ raw: "prefix", original: "prefix", type: "string" }],
					params: { noButtons: true },
				},
			},
		]);
	}
	async run(message, config) {
		if (message.parsed.params.interaction && message.author.id != message.client.user.id) message.parsed.params.interaction = false;
		if (message.parsed.arguments.length === 1) {
			message.parsed.arguments[0].raw = message.parsed.arguments[0].raw.replace(/\s/gim, "_");
			let setting = settings[message.parsed.arguments[0]?.raw.toLowerCase()];
			if (!setting) {
				message.parsed.parameters.error = message.translate.get("settings.invalidSetting");
				return message.channel.send(generateMessage("home", message, config, {}));
			}
			let name = message.parsed.arguments[0].raw.toLowerCase();
			return message.channel.send(
				generateMessage("setting", message, config, {
					setting,
					name,
				})
			);
		} else if (message.parsed.arguments.length === 2) {
			message.parsed.arguments[0].raw = message.parsed.arguments[0].raw.replace(/\s/gim, "_");
			let setting = settings[message.parsed.arguments[0]?.raw.toLowerCase()];
			if (!setting) {
				message.parameters.error = message.translate.get("settings.invalidSetting");
				return message.channel.send(generateMessage("home", message, config, {}));
			}
			let name = message.parsed.arguments[0].raw.toLowerCase();
			if (setting.possibleValues) {
				if (setting.possibleValues.includes(message.parsed.arguments[1].raw)) {
					await message.client.db.setGuildSetting(message.guild.id, name, message.parsed.arguments[1].raw);
					config[name] = message.parsed.arguments[1].raw;
					return message.channel.send(
						generateMessage("setting", message, config, {
							setting,
							name,
						})
					);
				} else {
					message.parsed.parameters.error = message.translate.get("settings.invalidValue");
					return message.channel.send(
						generateMessage("setting", message, config, {
							setting,
							name,
						})
					);
				}
			} else if (setting.type === message.parsed.arguments[1].type) {
				await message.client.db.setGuildSetting(message.guild.id, name, message.parsed.arguments[1].raw);
				config[name] = message.parsed.arguments[1].raw;
				return message.channel.send(
					generateMessage("setting", message, config, {
						setting,
						name,
					})
				);
			} else {
				message.parsed.parameters.error = message.translate.get("settings.invalidValue");
				return message.channel.send(
					generateMessage("setting", message, config, {
						setting,
						name,
					})
				);
			}
		} else {
			let msg = generateMessage("home", message, config, {});
			if (message.parsed.params.interaction) return message.edit(msg);
			else return message.channel.send(msg);
		}
	}
}

module.exports = Settings;

function generateMessage(type, message, config, options) {
	let msg = new Message();
	if (message.parsed.parameters.error) msg.setContent(`⚠ **${message.parsed.parameters.error}**`);
	let embed = new MessageEmbed().setColor(Math.floor(Math.random() * 16777215));
	switch (type) {
		default:
		case "home": {
			embed.setTitle(message.translate.get("settings.title")).setDescription(message.translate.get("settings.description")).setFooter("OxyBot | settings");
			let menu = new Menu({
				options: [],
				placeholder: message.translate.get("settings.homePlaceholder"),
				onUpdate(interaction) {
					interaction.update(
						generateMessage("setting", message, config, {
							setting: settings[interaction.values[0]],
							name: interaction.values[0],
						})
					);
				},
			});
			Object.entries(settings).forEach(([key, value]) => {
				embed.addField(message.translate.get(["guildSettings", key, "name"]), message.translate.get(["guildSettings", key, "description"]));
				menu.addOptions({
					label: message.translate.get(["guildSettings", key, "name"]),
					value: key,
				});
			});
			msg.addMenu(menu);
			break;
		}
		case "setting": {
			embed
				.setTitle(message.translate.get(["guildSettings", options.name, "name"]))
				.setDescription(message.translate.get(["guildSettings", options.name, "description"]))
				.setFooter("OxyBot | settings | " + options.name)
				.addField(message.translate.get("settings.currentValue"), config[options.name]);
			let button = new Button({
				style: 1,
				emoji: "⬅️",
				label: message.translate.get("settings.back"),
				onClick(interaction) {
					interaction.update(generateMessage("home", message, config, {}));
				},
			});
			if (options.setting.possibleValues) {
				let menu = new Menu({
					options: [],
					placeholder: message.translate.get("settings.commandPlaceholder"),
					async onUpdate(interaction) {
						await message.client.db.setGuildSetting(message.guild.id, options.name, interaction.values[0]);
						if (options.name === "language") message.translate = new message.client.Translate({ messages: message.client.translate.getAllWithLanguage(interaction.values[0]) });
						config[options.name] = interaction.values[0];
						interaction.update(
							generateMessage("setting", message, config, {
								setting: settings[options.name],
								name: options.name,
							})
						);
					},
				});
				options.setting.possibleValues.forEach((e) => {
					if (config[options.name] != e) menu.addOptions({ label: message.translate.get(["guildSettings", options.name, "possibleValues", e]), value: e });
				});
				msg.addMenu(menu);
			}
			msg.addButton(button);
			break;
		}
	}
	msg.addEmbed(embed);
	return msg;
}
