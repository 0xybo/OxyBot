const recursive_readdir = require("recursive-readdir");
const path = require("path");
const config = require("./commands/__config.json");
const { Message } = require("discord.js");

class Commands {
	constructor(_this) {
		if (_this) Object.assign(this, _this);
	}
	static async register(Bot) {
		let logger = new Bot.Logger("client:commands", Bot.config.debugLog);
		let _commands = await recursive_readdir("client/commands").then((files) => {
			let cmds = [];
			files.forEach((file) => {
				if (!file.includes("__")) {
					let id = file.match(/(?<=commands(\\|\/)[a-z]*(\\|\/))[a-z\.]*(?=\.js)/gim)[0];
					let category = file.match(/(?<=commands(\\|\/))[a-z]*(?=(\\|\/)[a-z\.]*\.js)/gim)[0];
					try {
						cmds.push(
							Object.assign(new (require(path.join(process.cwd(), file)))(), {
								path: path.join(process.cwd(), file),
								id: id,
								category: category,
								name: Bot.translate.get(["commands", id, "name"]),
								description: Bot.translate.get(["commands", id, "name"]),
							})
						);
					} catch (e) {
						logger.error(`${id} command not loaded !`);
						logger.error(e);
					}
					logger.info(`${id} command loaded !`);
				}
			});
			return cmds;
		});
		let _categories = {};
		_commands.forEach((e) => {
			if (!_categories[e.category]) {
				_categories[e.category] = { commands: [] };
				Object.assign(_categories[e.category], config.categories[e.category]);
			}
			_categories[e.category].commands.push(e.id);
		});
		return new Commands({ commands: _commands, categories: _categories, logger });
	}
	/**
	 * @param {Message} message
	 * */
	async run(cmd, message, config) {
		message.translate = new message.client.Translate({ messages: message.client.translate.getAllWithLanguage(config.language) });
		let args = cmd.arguments;
		if (config.disabledCommands.includes(cmd.id)) return message.channel.send(message.translate.get("main.disabledCommand"));
		for (let i in args) {
			if (args[i].required && !message.parsed.arguments[i])
				return this.runCommand(message, "help", config, {
					arguments: [{ raw: message.parsed.command.toLowerCase(), original: message.parsed.command.toLowerCase(), type: "string" }],
					params: { noButtons: true, error: message.translate.get("error.argumentRequired", { argumentIndex: Number(i) + 1 }) },
				});
			if (message.parsed.arguments[i]) {
				if (!args[i].type.includes(message.parsed.arguments[i].type))
					return this.runCommand(message, "help", config, {
						arguments: [{ raw: message.parsed.command.toLowerCase(), original: message.parsed.command.toLowerCase(), type: "string" }],
						params: { noButtons: true, error: message.translate.get("error.invalidArgument", { argumentIndex: Number(i) + 1 }) },
					});
				if (!args[i].possibleValues?.includes(message.parsed.arguments[i].raw))
					return this.runCommand(message, "help", config, {
						arguments: [{ raw: message.parsed.command.toLowerCase(), original: message.parsed.command.toLowerCase(), type: "string" }],
						params: { noButtons: true, error: message.translate.get("error.invalidArgument", { argumentIndex: Number(i) + 1 }) },
					});
			} else if (args[i].default) message.parsed.arguments[i] = args[i].default;
		}
		if (!cmd.permissions.includes("dev") ? !message.member.hasPermission(cmd.permissions) : true)
			return this.runCommand(message, "help", config, {
				arguments: [{ raw: message.parsed.command.toLowerCase(), original: message.parsed.command.toLowerCase(), type: "string" }],
				params: { noButtons: true, error: message.translate.get("error.invalidPermissions") },
			});
		let permissions = message.channel.permissionsFor(message.client.user);
		if (!permissions.has(cmd.botPermissions))
			return this.runCommand(message, "help", config, {
				arguments: [{ raw: message.parsed.command.toLowerCase(), original: message.parsed.command.toLowerCase(), type: "string" }],
				params: { noButtons: true, error: message.translate.get("error.invalidBotPermissions") },
			});
		return cmd
			.run(message, config)
			.then(() => this.logger.info(`Command success : ${cmd.id}`))
			.catch((e) => {
				this.logger.error(`Command failed : ${cmd.id}`);
				this.logger.error(e);
				message.channel.send(message.translate.get("error.commandFailed"));
			});
	}
	exist(cmd) {
		return this.commands.find((e) => e.aliases.includes(cmd));
	}
	get(cmd) {
		return this.commands.find((e) => e.aliases.includes(cmd));
	}
	getShortcut(sc) {
		let cmd = this.commands.find((e) => e.shortcut.find((e1) => e1.trigger === sc));
		if (cmd) return { shortcut: cmd.shortcut.find((e) => e.trigger === sc), command: cmd };
		else return undefined;
	}
	getCategory(cat) {
		let result = this.categories[cat];
		if (result) result.name = cat;
		return result;
	}
	async runCommand(message, command, config, options) {
		let args = options.arguments || [];
		let _args =
			args
				.map((e) => {
					return e.original;
				})
				.join(" ") || "";
		let params = Object.assign(message.parsed?.params || message.parsed?.parameters || {}, options.params || options.parameters || {});
		let _params = Object.entries(params)
			.map(([key, value]) => {
				return `--${key}:${value}`;
			})
			.join(" ");
		let body = `${config.prefix}${command} ${_params} ${_args}`;
		message.parsed = {
			arguments: args,
			params: params,
			parameters: params,
			command,
			body,
			prefix: config.prefix,
			success: true,
		};
		message.translate = new message.client.Translate({ messages: message.client.translate.getAllWithLanguage(config.language) });
		let cmd = this.get(command);
		if (cmd) return cmd.run(message, config);
	}
}

class Command {
	constructor() {
		this.name;
		this.description;
		this.aliases = [];
		this.arguments = [];
		this.permissions = [];
		this.shortcut = [];
	}
	setName(_name) {
		this.name = _name;
	}
	setDescription(_description) {
		this.description = _description;
	}
	setAliases(aliases) {
		if (!(aliases instanceof Array)) throw new Error("Invalid argument: 'aliases' must be an array");
		this.aliases = aliases;
	}
	setArguments(args) {
		this.arguments = args;
	}
	setPermissions(permissions) {
		this.permissions = permissions;
	}
	setBotPermissions(permissions) {
		this.botPermissions = permissions;
	}
	setShortcut(options) {
		this.shortcut = options;
	}
	run() {}
}

module.exports = { Commands, Command };
