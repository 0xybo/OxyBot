const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

class Db {
	constructor(_this) {
		Object.assign(this, _this);
		/**@type {sqlite.Database} */
		this.db;
	}
	static async init(bot) {
		let db = await sqlite.open({ filename: "modules/db/database.db", driver: sqlite3.Database }).then((db) => {
			if (!db) client.logger.error("Can't open Sqlite database !");
			return db;
		});
		return new Db({ db });
	}
	async getGuild(id) {
		return (await this.db.get(`SELECT * FROM guilds WHERE id = '${id}'`)) || (
			await this.newGuild(id),
			await this.db.get(`SELECT * FROM guilds WHERE id = '${id}'`)
		);
	}
	async newGuild(id) {
		return await this.db.run(`INSERT INTO guilds (id) VALUES ('${id}')`)
	}
	async setGuildSetting(id, key, value) {
		return this.db.run(`UPDATE guilds SET ${key} = '${value}' WHERE id=${id}`)
	}
	// async get(table, key, guild) {
	// 	if (guild) return await this.db.get(`SELECT ${key} FROM ${table} WHERE guild = '${guild}'`);
	// 	else return await this.db.all(`SELECT ${key} FROM ${table}`);
	// }
	// async set(table, key, value, where) {
	// 	if (where) {
	// 		await this.db.run(`UPDATE ${table} SET ${key} = '${value}' WHERE ${where}`);
	// 	} else {
	// 		await this.db.run(`UPDATE ${table} SET ${key} = '${value}'`);
	// 	}
	// 	return await this.get(table, "*");
	// }
	// async insert(table, values) {
	// 	if (values) {
	// 		let itinerable = Object.entries(settings.db[table]);
	// 		let sqlColumn = itinerable
	// 			.map(([key, value]) => {
	// 				return key;
	// 			})
	// 			.join(", ");
	// 		let sqlValues = itinerable
	// 			.map(([key, value]) => {
	// 				return `'${values[key] || value.default}'`;
	// 			})
	// 			.join(", ");
	// 		await this.db.run(`INSERT INTO ${table} (${sqlColumn}) VALUES (${sqlValues})`);
	// 	} else await this.db.run(`INSERT INTO ${table} DEFAULT VALUES`);
	// 	return await this.get(table, "*", values.guild || null);
	// }
}

module.exports = Db;
