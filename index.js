const Client = require("./client/client");
const Web = require("./web/web");
const Db = require("./modules/db/db");
const Logger = require("./modules/logger");
const config = require("./config.json");
const Translate = require("./modules/translate/translate");

class Bot {
	constructor() {
		(async () => {
			this.config = config
			this.logger = new Logger("main", config.debugLog);
			this.Logger = Logger
			this.translate = await Translate.init();
			this.Translate = Translate

			this.db = await Db.init(this);
			this.logger.ok("DB loaded !");

			await this.loadClient()
			await this.loadWeb()

			await this.startClient()
			await this.startWeb()
		})();
	}
	async startWeb() {
		if(!this.web) await this.loadWeb();
		return await this.web.start().then(() => {
			this.logger.ok("Web Started !")
			return this.web
		})
		
	}
	async loadWeb() {
		this.web = await Web.init(this).then((web) => {
			this.logger.ok("Web loaded !");
			return web
		})
		return this.web
	}
	async stopWeb() {
		if(!this.web) return null
		return await this.web.stop().then(() => {
			this.logger.ok("Web stoped !")
			return null
		})
	}
	async restartWeb() {
		if(this.web) await this.stopWeb()
		return await this.startWeb()
	}
	async startClient() {
		if(!this.client) await this.loadClient();
		return await this.client.start().then(() => {
			this.logger.ok("Client Started !")
			return this.client
		})
		
	}
	async loadClient() {
		this.client = await Client.init(this).then((client) => {
			this.logger.ok("Client loaded !");
			return client
		})
		return this.client
	}
	async stopClient() {
		if(!this.client) return null
		return await this.client.stop().then(() => {
			this.logger.ok("Client stoped !")
			return null
		})
	}
	async restartClient() {
		if(this.client) await this.stopClient()
		return await this.startClient()
	}
}

new Bot();