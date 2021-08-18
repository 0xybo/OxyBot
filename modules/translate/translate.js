const recursive_readdir = require("recursive-readdir");
const path = require("path");

class Translate {
	constructor(_this) {
		Object.assign(this, _this);
	}
	static async init() {
		let messages = await recursive_readdir("./modules/translate").then((files) => {
			let msgs = {};
			files.forEach((file) => {
				if (!file.includes("translate.js")) {
					let id = file.match(/(?<=translate(\\|\/))[a-z]{2}-[A-Z]{2}(?=\.json)/gm);
					if (!id) throw new Error("Invalid File !");
					id = id[0];
					msgs[id] = require(path.join(process.cwd(), file));
				}
			});
			return msgs;
		});
		return new Translate({ messages });
	}
	get(path, replace, locale) {
		let messages = this.messages;
		if (!locale && this.messages["en-GB"]) messages = this.messages["en-GB"];
		if (locale)
			if (this.messages[locale]) messages = this.messages[locale];
			else messages = this.messages["en-GB"];
		if (typeof path === "string") path = path.split(".");
		function fn(index, _messages) {
			if (!path[index + 1]) return _messages[path[index]];
			if (!_messages[path[index]]) return null;
			return fn(index + 1, _messages[path[index]]);
		}
		let result = fn(0, messages);
		if (Boolean(replace) && typeof result === "string") {
			Object.entries(replace).forEach(([key, value]) => {
				var regex = new RegExp(`{{${key}}}`, "gmi");
				result = result.replace(regex, value);
			});
		}
		return result
	}
	getAllWithLanguage(language) {
		return this.messages[language] || this.messages["en-GB"];
	}
}

module.exports = Translate;
