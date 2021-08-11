const Command = require("../../commands").Command;
const { Message,Button, Menu, MessageEmbed } = require("../../message");

class Help extends Command {
	constructor() {
		super();
		this.setName("Help Command");
		this.setDescription("Help you to use me");
		this.setAliases(["help", "h"]);
		this.setArguments([
			{
				type: ["string"],
				required: false,
			},
		]);
		this.setBotPermissions(["SEND_MESSAGES"]);
	}
	async run(message, config) {
		let args = message.parsed.arguments,
			client = message.client,
			options = {};
		if (message.parsed.params.interaction && message.author.id != message.client.user.id) message.parsed.params.interaction = false;
		let cat = client.commands.getCategory(message.parsed.arguments[0]?.raw.toLowerCase());
		let cmd = client.commands.get(message.parsed.arguments[0]?.raw.toLowerCase());
		if (args.length === 1 && cat && cat?.name != "dev")
			options = generateMessage("category", message, config, {
				embed: {
					title: message.parsed.arguments[0].raw.toLowerCase(),
					thumbnail: cat.emojiURL,
					footer: "OxyBot | help | " + message.parsed.arguments[0].raw.toLowerCase(),
				},
				category: cat,
			});
		else if (args.length === 1 && cmd && cmd?.category != "dev")
			options = generateMessage("command", message, config, {
				embed: {
					title: generateSyntax(message, cmd, config.prefix),
					description: message.translate.get(["commands", cmd.id, "description"]),
					footer: `OxyBot | help | ${cmd.category} | ${cmd.id}`,
				},
				command: cmd,
			});
		else {
			options = generateMessage("home", message, config, {
				embed: {
					title: message.translate.get("help.title"),
					thumbnail: "https://i.imgur.com/aTDGUhu.png",
					footer: "OxyBot | help",
				},
			});
		}
		if (!message.parsed.params.interaction) return message.channel.send(options);
		else return message.edit(options);
	}
}

function generateMessage(type, message, config, options) {
	let msg = new Message();
	if(message.parsed.parameters.error) msg.setContent(`\`\`\`diff\n- ${message.parsed.parameters.error}\n\`\`\``)
	let embed = new MessageEmbed().setColor(Math.floor(Math.random() * 16777215));
	if (options.embed.title) embed.setTitle(options.embed.title);
	if (options.embed.thumbnail) embed.setThumbnail(options.embed.thumbnail);
	if (options.embed.footer) embed.setFooter(options.embed.footer);
	if (options.embed.description) embed.setDescription(options.embed.description);
	let menu

	switch (type) {
		default:
		case "home":
			embed.setDescription(message.translate.get("help.homeDescription"));
			menu = new Menu().setPlaceholder(message.translate.get("help.homeMenuPlaceholder")).onUpdate((interaction) => {
				let cat = message.client.commands.getCategory(interaction.values[0]);
				interaction.update(
					generateMessage("category", message, config, {
						embed: {
							title: interaction.values[0],
							thumbnail: cat.emojiURL,
							footer: "OxyBot | help | " + interaction.values[0],
						},
						category: cat,
					})
				);
			});
			Object.entries(message.client.commands.categories).forEach(([name, value]) => {
				if (name != "dev") {
					embed.addField(`${value.emoji} ${message.translate.get(["categories", name, "name"])}`, message.translate.get(["categories", name, "description"]));
					menu.addOptions({
						label: message.translate.get(["categories", name, "name"]),
						emoji: value.emoji,
						value: name,
					});
				}
			});
			if (!message.parsed.parameters.noButtons) msg.addMenu(menu);
			break;
		case "category":
			menu = new Menu().setPlaceholder(message.translate.get("help.categoryMenuPlaceholder")).onUpdate((interaction) => {
				let cmd = message.client.commands.get(interaction.values[0]);
				interaction.update(
					generateMessage("command", message, config, {
						embed: {
							title: generateSyntax(message, cmd, config.prefix),
							description: message.translate.get(["commands", cmd.id, "description"]),
							footer: `OxyBot | help | ${cmd.category} | ${cmd.id}`,
						},
						command: cmd,
					})
				);
			});
			options.category.commands.forEach((cmd) => {
				let command = message.client.commands.get(cmd);
				embed.addField(generateSyntax(message, command, config.prefix), message.translate.get(["commands", command.id, "description"]));
				menu.addOptions({ label: command.id, value: command.id });
			});
			if (!message.parsed.params.noButtons) msg.addMenu(menu);
			if (!message.parsed.params.noButtons)
				msg.addButton(
					new Button()
						.setStyle(1)
						.setEmoji("⬅️")
						.setLabel(message.translate.get("help.back"))
						.onClick((interaction) => {
							interaction.update(
								generateMessage("home", message, config, {
									embed: {
										title: message.translate.get("help.title"),
										thumbnail: "https://i.imgur.com/aTDGUhu.png",
										footer: "OxyBot | help",
									},
								})
							);
						})
				);
			break;
		case "command":
			let _translate = message.translate.get(["commands", options.command.id, "arguments"]);
			let args = options.command.arguments;
			for (let i in args) {
				if (args[i].category !== "dev") embed.addField(_translate[i].name, _translate[i].description + (args[i].required ? "\n⚠ " + message.translate.get("help.required") : ""));
			}
			if (!message.parsed.params.noButtons)
				msg.addButton(
					new Button()
						.setStyle(1)
						.setEmoji("⬅️")
						.setLabel(message.translate.get("help.back"))
						.onClick((interaction) => {
							let cat = message.client.commands.getCategory(options.command.category);
							interaction.update(
								generateMessage("category", message, config, {
									embed: {
										title: options.command.category,
										thumbnail: cat.emojiURL,
										footer: "OxyBot | help | " + options.command.category,
									},
									category: cat,
								})
							);
						})
				);
			break;
	}
	msg.addEmbed(embed)
	return msg;
}

function generateSyntax(message, cmd, prefix) {
	let syntax = prefix + cmd.id;
	let args = cmd.arguments;
	if (args) {
		let _translate = message.translate.get(["commands", cmd.id, "arguments"]);
		for (var i in args) {
			if (args[i].required) syntax += ` {${_translate[i].name}}`;
			else syntax += ` *[${_translate[i].name}]*`;
		}
	}
	let aliases = Array.from(cmd.aliases);
	if (aliases) {
		let indexCmd = aliases.findIndex((e) => e === cmd.id);
		if (indexCmd !== -1) {
			aliases.splice(indexCmd, 1);
		}
		if (aliases.length > 0) syntax += ` | ${aliases.join()}`;
	}
	return syntax;
}

module.exports = Help;
