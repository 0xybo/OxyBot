class Web {
	constructor(_this, Bot) {
		Object.assign(this, _this, Bot);
		this.logger = new this.Logger("web", this.config.debugLog);
	}
	static async init(Bot) {
		return new Web({}, Bot);
	}
	async start() {
        return true
	}
}
module.exports = Web;
