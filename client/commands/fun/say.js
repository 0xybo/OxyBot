const Command = require("../../commands").Command;

class Say extends Command {
	constructor() {
		super();
		this.setName("Say Command");
		this.setDescription("Send your message");
		this.setAliases(["say"]);
		this.setArguments([
			{
				type: ["string", "emoji", "custom_emoji", "user", "channel", "array", "code", "boolean", "time"],
				required: true,
			},
			{
				type: ["boolean"],
				default: {
					type: "boolean",
					value: false,
					raw: "false",
				},
				required: false,
			},
		]);
		this.setBotPermissions(["MANAGE_MESSAGES", "SEND_MESSAGES"]);
	}
	async run(message, config) {
		let args = message.parsed.arguments;
		// if (args.length == 1 && (args.length === 2 ? args[1] !== "true" : true)) {
		// 	message.channel.send(args[0]).then(() => Promise.resolve());
		// } else if (args.length === 2 ? args[1] === "true" : false) {
		// 	message.channel.send(args[0]).then((msg) => {
		// 		message.delete().then(() => Promise.resolve());
		// 	});
		// }
		if (args.length === 2 ? args[1]?.raw == "true" : false) {
			message.channel
				.send(args[0].raw)
				.then(() =>
					message
						.delete()
						.then(() => Promise.resolve())
						.catch(() => Promise.reject())
				)
				.catch((e) => Promise.reject(e));
		} else {
			message.channel
				.send(args[0].raw)
				.then(() => Promise.resolve())
				.catch((e) => Promise.reject(e));
		}
	}
}

module.exports = Say;
