const { MessageEmbed } = require("discord.js");
const Command = require("../../commands").Command;

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
	let result = {};
	let buttons = [];
	let menus = [];
	let content = message.parsed.params.error ? `\`\`\`diff\n- ${message.parsed.params.error}\n\`\`\`` : "";
	let menuOptions = {};
	let buttonOptions = {};
	let embed = new MessageEmbed().setColor(Math.floor(Math.random() * 16777215));
	if (options.embed.title) embed.setTitle(options.embed.title);
	if (options.embed.thumbnail) embed.setThumbnail(options.embed.thumbnail);
	if (options.embed.footer) embed.setFooter(options.embed.footer);
	if (options.embed.description) embed.setDescription(options.embed.description);

	switch (type) {
		default:
		case "home":
			embed.setDescription(message.translate.get("help.homeDescription"));
			menuOptions = {
				onUpdate(component, dropDown) {
					component.reply.defer();
					message.client.commands.runCommand(component.message, "help", config, {
						arguments: [{ raw: component.values[0], original: component.values[0], type: "string" }],
						params: { interaction: true },
					});
				},
				options: [],
				placeholder: message.translate.get("help.homeMenuPlaceholder"),
			};
			Object.entries(message.client.commands.categories).forEach(([name, value]) => {
				embed.addField(`${value.emoji} ${message.translate.get(["categories", name, "name"])}`, message.translate.get(["categories", name, "description"]));
				menuOptions.options.push({
					label: message.translate.get(["categories", name, "name"]),
					emoji: value.emoji,
					value: name,
				});
			});
			if (!message.parsed.params.noButtons) menus.push(new message.client.DInteractions.MessageDropDown(menuOptions));
			break;
		case "category":
			menuOptions = {
				onUpdate(component, dropDown) {
					component.reply.defer();
					message.client.commands.runCommand(component.message, "help", config, {
						arguments: [{ raw: component.values[0], original: component.values[0], type: "string" }],
						params: { interaction: true },
					});
				},
				options: [],
				placeholder: message.translate.get("help.categoryMenuPlaceholder"),
			};
			options.category.commands.forEach((cmd) => {
				let command = message.client.commands.get(cmd);
				embed.addField(generateSyntax(message, command, config.prefix), message.translate.get(["commands", command.id, "description"]));
				menuOptions.options.push({
					label: command.id,
					value: command.id,
				});
			});
			if (!message.parsed.params.noButtons) menus.push(new message.client.DInteractions.MessageDropDown(menuOptions));
			buttonOptions = {
				style: 1,
				emoji: "⬅️",
				label: message.translate.get("help.back"),
				onClick(component, button) {
					component.reply.defer();
					message.client.commands.runCommand(component.message, "help", config, {
						params: { interaction: true },
					});
				},
			};
			if (!message.parsed.params.noButtons) buttons.push(new message.client.DInteractions.MessageButton(buttonOptions));
			break;
		case "command":
			let _translate = message.translate.get(["commands", options.command.id, "arguments"]);
			let args = options.command.arguments;
			for (let i in args) {
				if (args[i].category !== "dev") embed.addField(_translate[i].name, _translate[i].description + (args[i].required ? "\n⚠ " + message.translate.get("help.required") : ""));
			}
			buttonOptions = {
				style: 1,
				emoji: "⬅️",
				label: message.translate.get("help.back"),
				onClick(component, button) {
					component.reply.defer();
					message.client.commands.runCommand(component.message, "help", config, {
						params: { interaction: true },
						arguments: [{ raw: options.command.category, original: options.command.category, type: "string" }],
					});
				},
			};
			if (!message.parsed.params.noButtons) buttons.push(new message.client.DInteractions.MessageButton(buttonOptions));
			break;
	}
	result.embed = embed;
	if (menus.length > 0) result.menus = menus;
	if (buttons.length > 0) result.buttons = buttons;
	if (content) result.content = content;
	return result;
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
