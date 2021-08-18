const { MessageSelectMenu, MessageButton, MessageActionRow, MessageEmbed } = require("discord.js");

const listeners = {
};
let id = 0,
	msgId = 0;

function registerClient(client) {
	if (client._registered) return false;
	client._registered = true;
	client.on("interactionCreate", (interaction) => {
		let listener = listeners[interaction.component.customId];
		if (!listener) return false;
		listener.callback(interaction);
		if (listener.once) listener.destroy();
		if (listener.destroyWhenOtherButtonClicked) 
			Object.entries(listeners).forEach(([key, value]) => {
				if (value._message._id === listener._message._id) value.destroy();
			});
	});
	return true;
}

class Message {
	constructor() {
		this.components = [];
		this._components = [];
		this._id = ++msgId;
	}
	addMenu(menu, once = false, destroyWhenOtherButtonClicked = false) {
		if (this.components.length === 5) throw new Error("You connot add a new component");
		let actionRow = new MessageActionRow();
		actionRow.addComponents(menu);
		menu.once = once;
		menu.destroyWhenOtherButtonClicked = destroyWhenOtherButtonClicked;
		menu.destroy = function () {
			delete listeners[menu.customId];
		};
		menu._message = this;
		this._components.push(menu);
		listeners[menu.customId] = menu;
		this.components.push(actionRow);
		return this;
	}
	addButton(button, once = false, destroyWhenOtherButtonClicked = false) {
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
		button.once = once;
		button.destroyWhenOtherButtonClicked = destroyWhenOtherButtonClicked;
		button.destroy = function () {
			delete listeners[button.customId];
		};
		button._message = this;
		this._components.push(button);
		listeners[button.customId] = button;
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
