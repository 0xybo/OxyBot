const { MessageSelectMenu, MessageButton, MessageActionRow, MessageEmbed } = require("discord.js");

const listeners = {
	clickButton: {},
	clickMenu: {},
};
var id = 0;

function registerClient(client) {
	if (client._registered) return false;
	client._registered = true;
	client.on("interactionCreate", (interaction) => {
		listeners[interaction.isButton() ? "clickButton" : interaction.isSelectMenu() ? "clickMenu" : "null"]?.[interaction.component.customId]?.callback(interaction);
	});
	return true;
}

class Message {
	constructor() {
		this.components = [];
	}
	addMenu(menu) {
		if (this.components.length === 5) throw new Error("You connot add a new component");
		let actionRow = new MessageActionRow();
		listeners.clickMenu[menu.customId] = menu;
		actionRow.addComponents(menu);
		this.components.push(actionRow);
		return this;
	}
	addButton(button) {
		if (this.components.length == 0) {
			let actionRow = new MessageActionRow();
			actionRow.addComponents(button);
			this.components.push(actionRow);
		} else if (this.components[this.components.length - 1].components?.length === 5 || this.components[this.components.length - 1].components[0].type == "SELECT_MENU") {
			if (this.components.length === 5) throw new Error("You connot add a new component");
			let actionRow = new MessageActionRow();
			actionRow.addComponents(button);
			this.components.push(actionRow);
		} else {
			this.components[this.components.length - 1].addComponents(button);
		}
		listeners.clickButton[button.customId] = button;
		return this;
	}
	setContent(content) {
		this.content = content;
		return this;
	}
	addEmbed(embed) {
		if (!this.embeds) this.embeds = [];
		this.embeds.push(embed);
		return this;
	}
}

class Menu extends MessageSelectMenu {
	constructor(options = {}) {
		super(options);
		this.customId = options.id || "menu-" + ++id;
		if (options.onUpdate) this.onUpdate(options.onUpdate);
	}
	onUpdate(cb) {
		this.callback = cb;
		return this;
	}
}

class Button extends MessageButton {
	constructor(options = {}) {
		super(options);
		this.customId = options.id || "button-" + ++id;
		this.style = options.style || 1;
		if (options.onClick) this.onClick(options.onClick);
	}
	onClick(cb) {
		this.callback = cb;
		return this;
	}
}

module.exports = { Message, registerClient, Button, Menu, MessageEmbed };
