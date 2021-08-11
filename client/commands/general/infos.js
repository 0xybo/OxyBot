const { Command } = require("../../commands");
const { Message, registerClient, Button, Menu, MessageEmbed } = require("../../message");
const { relativeFormat } = require("../../../utils/date");
const emojis = require("../../../emojis.json");

class Infos extends Command {
	constructor() {
		super();
		this.setName("Command Infos");
		this.setDescription("Display informations about server, user, channel, ...");
		this.setAliases(["infos", "info"]);
		this.setArguments([
			{
				type: ["string", "user", "channel"],
				require: false,
			},
		]);
		this.setBotPermissions([]);
	}
	async run(message, config) {
		if (message.parsed.arguments.length === 0) {
			let msg = new Message()
				.addEmbed(new MessageEmbed().setTitle(message.translate.get("infos.homeTitle")).setDescription(message.translate.get("infos.homeDescription", { prefix: config.prefix })))
				.addButton(
					new Button({
						style: 1,
						label: message.translate.get("infos.you"),
						async onClick(interaction) {
							console.log(generateMessage("user", message, config, interaction.user));
							interaction.update(await generateMessage("user", message, config, interaction.user));
						},
					})
				)
				.addButton(
					new Button({
						style: 1,
						label: message.translate.get("infos.channel"),
						async onClick(interaction) {
							interaction.update(await generateMessage("channel", message, config, interaction.channel));
						},
					})
				)
				.addButton(
					new Button({
						style: 1,
						label: message.translate.get("infos.server"),
						async onClick(interaction) {
							interaction.update(await generateMessage("guild", message, config, interaction.guild));
						},
					})
				)
				.addButton(
					new Button({
						style: 1,
						label: message.translate.get("infos.bot"),
						async onClick(interaction) {
							interaction.update(await generateMessage("bot", message, config, null));
						},
					})
				);
			message.channel.send(msg);
		} else if (message.parsed.arguments.length > 0) {
			let arg = message.parsed.arguments[0];
			let type = "";
			let data = null;
			let error;
			if (arg.raw === "bot") type = "bot";
			else if (arg.raw === "channel") (type = "channel"), (data = message.channel);
			else if (arg.raw === "guild") (type = "guild"), (data = message.guild);
			else if (arg.raw === "me") (type = "user"), (data = message.author);
			else if (arg.raw === "category") {
				if (message.channel.parent) (type = "category"), (data = message.channel.parent);
				else type = "notFound";
			} else if (arg.type === "channel") (type = "channel"), (data = arg.channel);
			else if (arg.type === "user") (type = "user"), (data = arg.user);
			else {
				let channel = message.guild.channels.cache.find((e) => e.id == arg.raw);
				if (channel && channel?.type === "category") (type = "category"), (data = channel);
				else if (channel) (type = "channel"), (data = channel);
				else
					await message.client.users
						.fetch(arg.raw, false, true)
						.then(async (user) => {
							type = "user";
							data = user;
						})
						.catch(async () => {
							await message.client.guilds
								.fetch(arg.raw, true, true)
								.then((guild) => {
									type = "guild";
									data = guild;
								})
								.catch(async () => {
									await message.client
										.fetchGuildPreview(arg.raw)
										.then((guild) => {
											type = "guild";
											data = guild;
										})
										.catch((e) => (error = message.translate.get("infos.notFound", { arg0: arg.raw })));
								});
						});
			}
			if (error) return message.channel.send(error);
			return message.channel.send(await generateMessage(type, message, config, data));
		}
	}
}
module.exports = Infos;

async function generateMessage(type, message, config, data) {
	let msg = new Message();
	switch (type) {
		case "user": {
			// ANCHOR user
			let embed = new MessageEmbed()
				.setColor(Math.floor(Math.random() * 16777215))
				.setTitle(data.tag)
				.setThumbnail(data.avatarURL({ dynamic: true }))
				.addField(message.translate.get("infos.id"), data.id, true)
				.addField(message.translate.get("infos.avatarLink"), `[${message.translate.get("infos.link")}](${data.avatarURL({ dynamic: true, size: 4096 })})`, true)
				.addField(message.translate.get("infos.createdDate"), data.createdAt.toLocaleString(config.language))
				.addField(message.translate.get("infos.accountAge"), relativeFormat(message.translate.get("infos.accountAgeFormat"), data.createdAt).format);
			await message.guild.members
				.fetch(data.id)
				.then((member) =>
					embed
						.addField(message.translate.get("infos.joinedAt"), member.joinedAt.toLocaleString(config.language))
						.addField(message.translate.get("infos.joinAge"), relativeFormat(message.translate.get("infos.joinAgeFormat"), member.joinedAt).format)
				)
				.catch((e) => {});
			msg.addEmbed(embed);
			break;
		}
		case "channel": {
			// ANCHOR channel
			// TODO permissions x2
			let emoji = data.type === "voice" ? "🔊" : data.type === "news" ? "📰" : data.type === "store" ? "💵" : "#️⃣";
			let embed = new MessageEmbed()
				.setColor(Math.floor(Math.random() * 16777215))
				.setTitle(data.name)
				.setThumbnail(emojis.find((e) => e.key === emoji).url)
				.addField(message.translate.get("infos.id"), data.id)
				.addField(message.translate.get("infos.createdDate"), data.createdAt.toLocaleString(config.language))
				.addField(message.translate.get("infos.channelAge"), relativeFormat(message.translate.get("infos.channelAgeFormat"), data.createdAt).format)
				.addField(message.translate.get("infos.channelMemberCount"), String(data.members.size));
			if (data.nsfw) embed.addField(message.translate.get("infos.nsfw"), message.translate.get("infos." + data.nsfw));
			if (data.parent) {
				embed.addField(message.translate.get("infos.parentCategory"), `${data.parent.name}`);
				msg.addButton(
					new Button({
						label: message.translate.get("infos.categoryInfos"),
						style: 1,
						async onClick(interaction) {
							interaction.update(await generateMessage("category", message, config, data.parent));
						},
					})
				);
			}
			if (data.rateLimitPerUser ? data.rateLimitPerUser != 0 : false)
				embed.addField(message.translate.get("infos.rateLimitPerUser"), relativeFormat(message.translate.get("infos.rateLimitPerUserFormat"), data.rateLimitPerUser * 1000).format);
			if (data.topic) embed.setDescription(data.topic);
			if (data.lastMessageID && !message.channel.equals(data))
				await data.messages
					.fetch(data.lastMessageID)
					.then((m) => {
						embed.addField(message.translate.get("infos.lastMessage"), relativeFormat(message.translate.get("infos.lastMessageFormat"), m.createdAt).format);
					})
					.catch((e) => {});
			if (data.permissionsFor(message.guild.me).has("CREATE_INSTANT_INVITE") && config.allow_invite_creation === "true") {
				msg.addButton(
					new Button({
						style: 1,
						label: message.translate.get("infos.createInvite"),
						async onClick(interaction) {
							interaction.channel.send((await message.channel.createInvite({ reason: "interaction command info" })).url);
						},
					})
				);
			}
			msg.addEmbed(embed);
			break;
		}
		case "guild": {
			// ANCHOR guild
			let embed = new MessageEmbed()
				.setColor(Math.floor(Math.random() * 16777215))
				.setTitle(data.verified ? "☑️ " : "" + data.name)
				.setThumbnail(data.iconURL({ dynamic: true, size: 512 }))
				.setImage(data.bannerURL ? data.bannerURL({ size: 2048 }) : data.splashURL({ size: 2048 }))
				.addField(message.translate.get("infos.id"), data.id)
				.addField(message.translate.get("infos.memberCount"), String(data.memberCount || data.approximateMemberCount), true)
				.addField(message.translate.get("infos.iconURL"), `[${message.translate.get("infos.link")}](${data.iconURL({ dynamic: true, size: 4096 })})`, true);
			if (data.createdAt)
				embed
					.addField(message.translate.get("infos.createdDate"), data.createdAt.toLocaleString(config.language))
					.addField(message.translate.get("infos.serverAge"), relativeFormat(message.translate.get("infos.serverAgeFormat"), data.createdAt).format);
			if (data.description) embed.setDescription(data.description);
			if (data.emojis)
				if (data.stickers) embed.addField(message.translate.get("infos.stickersAndEmojisQuantity"), `${data.stickers.cache.size} / ${data.emojis.size || data.emojis.cache.size}`, true);
				else embed.addField(message.translate.get("infos.emojisQuantity"), String(data.emojis.size || data.emojis.cache.size), true);
			if (data.owner) embed.addField(message.translate.get("infos.owner"), `<@${data.owner.id}>`, true);
			if (config.allow_invite_creation && message.guild.equals(data)) {
				msg.addButton(
					new Button({
						style: 1,
						label: message.translate.get("infos.createInvite"),
						async onClick(interaction) {
							interaction.channel.send((await message.channel.createInvite({ reason: "interaction command info" })).url);
						},
					})
				);
			}
			msg.addEmbed(embed);
			break;
		}
		case "bot": {
			// ANCHOR bot
			let embed = new MessageEmbed()
				.setColor(Math.floor(Math.random() * 16777215))
				.setTitle(message.client.user.tag)
				.setThumbnail(message.client.user.avatarURL())
				.addField(message.translate.get("infos.id"), message.client.user.id, true)
				.addField(message.translate.get("infos.avatarLink"), `[${message.translate.get("infos.link")}](${message.client.user.avatarURL({ dynamic: true, size: 4096 })})`, true)
				.addField(message.translate.get("infos.createdDate"), message.client.user.createdAt.toLocaleString(config.language))
				.addField(message.translate.get("infos.accountAge"), relativeFormat(message.translate.get("infos.accountAgeFormat"), message.client.user.createdAt).format);
			await message.guild.members
				.fetch(message.client.user.id)
				.then((member) => {
					embed
						.addField(message.translate.get("infos.joinedAt"), member.joinedAt.toLocaleString(config.language))
						.addField(message.translate.get("infos.joinAge"), relativeFormat(message.translate.get("infos.joinAgeFormat"), member.joinedAt).format);
				})
				.catch((e) => {});
			embed.addField(message.translate.get("infos.owner"), `<@381412820409122816>`).addField(message.translate.get("infos.version"), message.client.config.package.version, true);
			msg.addEmbed(embed);
			break;
		}
		case "category": {
			// ANCHOR category
			// TODO permissions x2
			let embed = new MessageEmbed()
				.setColor(Math.floor(Math.random() * 16777215))
				.setTitle(data.name)
				.addField(message.translate.get("infos.id"), data.id)
				.addField(message.translate.get("infos.createdDate"), data.createdAt.toLocaleString(config.language))
				.addField(message.translate.get("infos.categoryAge"), relativeFormat(message.translate.get("infos.categoryAgeFormat"), data.createdAt).format)
				.addField(message.translate.get("infos.channelQuantity"), String(data.children.size));
			msg.addEmbed(embed);
			break;
		}
		default: {
			msg.setContent(message.translate.get("infos.notFound", { arg0: arg.raw }));
			break;
		}
	}
	return msg;
}
