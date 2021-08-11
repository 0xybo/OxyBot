const Command = require("../../commands").Command;

class Eval extends Command {
	constructor() {
		super();
		this.setName("");
		this.setDescription("");
		this.setAliases(["eval"]);
		this.setArguments([
			{
				type: ["string", "code"],
				required: false,
			},
		]);
		this.setBotPermissions([]);
	}
	async run(message, config) {
		try {
			let fn = new Function(message.parsed.arguments[0].code || message.parsed.arguments[0].raw);
			message.channel.send("```" + fn(message, config).toString().replace(/`/gim, "\\`") + "```" || "No result");
		} catch (e) {
			message.channel.send("```" + e.stack + "```" || "ERROR");
		}
	}
}

module.exports = Eval;
