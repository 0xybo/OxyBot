const Discord = require("discord.js");
const message = require("./events/message");
const { Message, registerClient, Button, Menu, MessageEmbed } = require("./message");

class Client extends Discord.Client {
	constructor(Bot) {
		super({
			intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_INTEGRATIONS, Discord.Intents.FLAGS.GUILD_MESSAGES],
		});
		Object.assign(this, Bot);
		this.logger = new this.Logger("client", this.config.debugLog);
		registerClient(this);
		let discordLogger = new this.Logger("Discord", this.config.debugLog);
		this.on("debug", (msg) => discordLogger.debug(msg));
		this.owner = {
			id: "381412820409122816",
		};
		this.once("ready", () => {
			this.logger.ok("Bot ready !");
			this.user.setPresence({
				activities: [{
					name: "be programmed !",
				}],
				status: "idle",
			});
			this.logger.info(`Presence: desc: "be programmed", statut: "idle"`);
		});
		this.on("messageCreate", async (msg) => {
			if (!msg.guild) return;
			if (msg.author.bot) return;
			let config = await this.db.getGuild(msg.guild.id);
			message(this, msg, config).catch((e) => this.logger.error(e));
		});
	}
	static async init(Bot) {
		return new Client({ commands }, Bot);
	}
	async start() {
		return await this.login(process.env.token);
	}
	async stop() {
		this.destroy();
		return true;
	}
}

module.exports = Client;
