const Discord = require("discord.js");
const Commands = require("./commands").Commands;
const message = require("./events/message");
const DInteractions = require('discord-easy-interactions')

class Client extends Discord.Client {
	constructor(_this, Bot) {
		super();
		Object.assign(this, _this, Bot);
		this.logger = new this.Logger("client", this.config.debugLog);
		this.Message = message
		DInteractions.registerClient(this)
		this.DInteractions = DInteractions
		this.on("debug", (msg) => this.logger.debug(msg));
		this.owner = {
			id: "381412820409122816",
		};
		this.once("ready", () => {
			this.logger.ok("Bot ready !");
			this.user
				.setPresence({
					activity: {
						name: "be programmed !",
					},
					status: "idle",
				})
				.then((r) => {
					this.logger.info(`Presence: desc: "${r.activities}", statut: "${r.status}"`);
				});
		});
		this.on("message", async (msg) => {
			if (!msg.guild) return;
			if (msg.author.bot) return;
			let config = await this.db.getGuild(msg.guild.id);
			message(this, msg, config).catch(e => this.logger.error(e))
		});
	}
	static async init(Bot) {
		let commands = await Commands.register(Bot);
		return new Client({ commands }, Bot);
	}
	async start() {
		return await this.login(process.env.token)
	}
	async stop() {
		this.destroy();
		return true;
	}
}

module.exports = Client;

