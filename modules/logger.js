const safe = require("colors/safe");
const fs = require("fs");

class Logger {
	constructor(name, debugLog) {
		if (debugLog) this.debugLog = true;
		else this.debugLog = false;
		this.name = name;
	}
	/**
	 * Used to log Errors to the console.
	 * @param {string} message The Error Message to Log.
	 * @returns {Void}
	 */
	error(message) {
		if (message.stack) {
			console.log(safe.red(safe.bold(message.stack || message)));
			fs.appendFile(logFilePath, (message.stack || message) + "\n", () => {});
		} else {
			console.log(safe.red(safe.bold(`[${this.name}][Error]: ${message}`)));
			let msg = `[${format("DD-MM-YYYY hh:mm:ss")}][${this.name}][Error] : ${message}`;
			fs.appendFile(logFilePath, msg + "\n", () => {});
		}
		return;
	}
	/**
	 * Used to log Warnings to the console.
	 * @param {string} message The Warning Message to Log.
	 * @returns {Void}
	 */
	warn(message) {
		console.log(safe.yellow(safe.bold(`[${this.name}][Warning]: ${message}`)));
		let msg = `[${format("DD-MM-YYYY hh:mm:ss")}][${this.name}][Warning] : ${message}`;
		fs.appendFile(logFilePath, msg + "\n", () => {});
		return;
	}
	/**
	 * Used to log Info Messages to the console.
	 * @param {string} message The Information Message to Log.
	 * @returns {Void}
	 */
	info(message) {
		console.log(safe.gray(safe.bold(`[${this.name}][INFO]: ${message}`)));
		let msg = `[${format("DD-MM-YYYY hh:mm:ss")}][${this.name}][INFO] : ${message}`;
		fs.appendFile(logFilePath, msg + "\n", () => {});
		return;
	}
	/**
	 * Used to log Success Messages to the console.
	 * @param {string} message The Success Message to Log.
	 * @returns {Void}
	 */
	ok(message) {
		console.log(safe.cyan(safe.bold(`[${this.name}][OK]: ${message}`)));
		let msg = `[${format("DD-MM-YYYY hh:mm:ss")}][${this.name}][OK] : ${message}`;
		fs.appendFile(logFilePath, msg + "\n", () => {});
		return;
	}
	/**
	 * Used to log Progress Related Messages to the console.
	 * @param {string} message The Progress Message to Log.
	 * @returns {Void}
	 */
	progress(message) {
		console.log(safe.blue(safe.bold(`[${this.name}][Progress]: ${message}`)));
		let msg = `[${format("DD-MM-YYYY hh:mm:ss")}][${this.name}][Progress] : ${message}`;
		fs.appendFile(logFilePath, msg + "\n", () => {});
		return;
	}
	/**
	 * Used to log Progress Related Messages to the console.
	 * @param {string} message A Debug Message to Log.
	 * @returns {Void}
	 */
	debug(message) {
		if (this.debugLog) console.log(safe.gray(`[${this.name}][Debug]: ${message}`));
		let msg = `[${format("DD-MM-YYYY hh:mm:ss")}][${this.name}][Debug] : ${message}`;
		fs.appendFile(logFilePath, msg + "\n", () => {});
		return;
	}
}

function format(format) {
	let date = new Date();
	return format
		.replace(/YYYY/g, date.getFullYear())
		.replace(/YY/g, date.getFullYear().toString().slice(2))
		.replace(/MM/g, (date.getMonth().toString().length == 1 ? "0" : "") + (date.getMonth() + 1))
		.replace(/DD/g, (date.getDate().toString().length == 1 ? "0" : "") + date.getDate())
		.replace(/ss/g, (date.getSeconds().toString().length == 1 ? "0" : "") + date.getSeconds())
		.replace(/mm/g, (date.getMinutes().toString().length == 1 ? "0" : "") + date.getMinutes())
		.replace(/hh/g, (date.getHours().toString().length == 1 ? "0" : "") + date.getHours());
}

let logFilePath = `./log/${format("DD-MM-YYYY_hh-mm-ss")}.log`;
if (!fs.existsSync(logFilePath)) fs.appendFileSync(logFilePath, "");

module.exports = Logger;
