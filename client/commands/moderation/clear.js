const { Command } = require("../../commands");
const { Collection } = require("discord.js");

class Clear extends Command {
	constructor() {
		super();
		this.setName("Clear command");
		this.setDescription("Delete messages");
		this.setAliases(["clear", "purge", "delete"]);
		this.setArguments([
			{
				type: ["number", "string"],
				required: true,
			},
		]);
		this.setPermissions(["MANAGE_MESSAGES"]);
		this.setBotPermissions(["MANAGE_MESSAGES"]);
		this.setShortcut([]);
	}
	async run(message, config) {
		async function fn(q, messages) {
			let _messages = await message.channel.bulkDelete(q === "*" ? 100 : q > 100 ? 100 : q, true);
			messages = messages.concat(_messages);
			if (_messages.size !== (q > 100 || q == "*" ? 100 : q) || q - 100 === 0) return messages;
			else {
				await new Promise((r) => setTimeout(r, 1000));
				return fn(q === "*" ? "*" : q - 100, messages);
			}
		}
		let messages = await fn(["all", "*"].includes(message.parsed.arguments[0].raw) ? "*" : message.parsed.arguments[0].raw, new Collection());

		message.channel
			.send(message.translate.get("clear." + (message.parsed.arguments[0].raw === "*" || messages.size !== message.parsed.arguments[0].raw ? "notAll" : "success"), { quantity: messages.size }))
			.then((msg) => {
				msg.delete({ timeout: 5000 });
			});
	}
}

module.exports = Clear;
