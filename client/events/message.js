const Discord = require("discord.js");
const emojis = require("../../emojis.json");

/** @param {Discord.Message} message*/
function parseSync(message, prefix, options = {}) {
	function fail(error) {
		return { success: false, error };
	}
	if (message.author.bot && !options.allowBot) return fail("Message send by a bot");
	if (!message.content) return fail("Message body empty");
	prefix = Array.isArray(prefix) ? prefix : [prefix];
	let content = message.content;
	let parsed = {
		arguments: [],
		params: {},
		parameters: {},
		command: "",
		prefix: "",
		body: "",
		success: true,
	};
	prefix.forEach((e) => {
		if (options.PrefixCaseSensitive ? content.startsWith(e) : content.toLowerCase().startsWith(e.toLowerCase())) parsed.prefix = e;
	});
	if (!parsed.prefix) return fail("Message does not start with prefix");
	content = content.slice(parsed.prefix.length);
	if (!content) return fail("No body after prefix");
	if (!options.allowSpaceBeforeCommand && /^\s/.test(content)) return fail("Space before command name");
	content = content.trim();
	parsed.command = content.match(/^[^\s]+/i)?.[0];
	if (!parsed.command) return fail("Could not match a command");
	content = content.slice(parsed.command.length).trim();
	parsed.body = content;
	let params = content.match(/(?<=^|\s)(--[a-z0-9]+)((:(((?<!\\)"((?<=\\)"|[^"])+(?<!\\)")|((?<!\\)'((?<=\\)'|[^'])+')|(?<!\\)```((\\`){3}|([^`]))+```))|(:[a-z0-9]+)|)/gim);
	if (params)
		params.forEach((param) => {
			content = content.replace(param, "");
			let key = param.match(/(?<=--)([a-z0-9]+)(?=((:(((```|"|').+(```|"|'))|([a-z]+)))|))/gim)[0];
			let value = (param.match(/(?<=--[a-z0-9]+:)(((```|"|').+(```|"|'))|([a-z]+))/gim) || [true])[0];
			if (typeof value === "string") value = value.replace(/(```|"|')/gim, "");
			parsed.params[key] = value;
			parsed.parameters[key] = value;
		});
	let args = content.match(
		/(?:(?<=^|\s)(?:(?:(?<!\\)```(?:(?:\\`){1,3}|\\`{1,3}|(?<!`)`{1,2}(?!`)|(?:[^`]))+```)|(?:(?<!\\)"(?:(?<=\\)"|[^"])+(?<!\\)")|(?:(?<!\\)'(?:(?<=\\)'|[^'])+')|(?:(?<!\\)`(?!``)(?:(?<=\\)(?<!``)`|[^`])+`))(?=$|\s))|(?:)(?<=\s|^)(?:(?:\p{L}|[^\s])+)(?=\s|$)/gimu
	);
	if (args) {
		for (let arg in args) {
			args[arg] = {
				raw: args[arg].replace(/^(?:["']|`(?!``))|(?:["']|(?<!``)`)$/gim, ""),
				orginal: args[arg],
				type: "string",
			};
			if (/^<@!\d+>$/gim.test(args[arg].raw)) {
				args[arg].id = args[arg].raw.match(/(?<=<@!)\d+(?=>)/gim, "")[0];
				args[arg].type = "user";
			} else if (/^<#\d+>$/gim.test(args[arg].raw)) {
				args[arg].id = args[arg].raw.match(/(?<=<#)\d+(?=>)/gim)[0];
				args[arg].type = "channel";
			} else if (/<:[a-z0-9]+:\d+>/gim.test(args[arg].raw)) {
				args[arg].id = args[arg].raw.match(/(?<=<:[a-z0-9]+:)\d+(?=>)/gim)[0];
				args[arg].name = args[arg].raw.match(/(?<=<:)[a-z0-9]+(?=:\d+>)/gim)[0];
				args[arg].type = "custom_emoji";
			} else if (/\[(['"][^'"]+['"](,|))+\]/gim.test(args[arg].raw)) {
				args[arg].values = args[arg].raw.replace(/[\[\]"']/gim, "").split(",");
				args[arg].type = "array";
			} else if (/(?<!\\)```(?:(?:\\`){1,3}|\\`{1,3}|(?<!`)`{1,2}(?!`)|[^`])+```/gim.test(args[arg].raw)) {
				args[arg].code = args[arg].raw.match(/(?<=```)(?:(?:\\`){1,3}|\\`{1,3}|(?<!`)`{1,2}(?!`)|[^`])+(?=```)/gim)[0];
				args[arg].language = args[arg].raw.match(
					/(?<=```)(js|1c|abnf|accesslog|actionscript|ada|angelscript|apache|applescript|arcade|arduino|armasm|xml|asciidoc|aspectj|autohotkey|autoit|avrasm|awk|axapta|bash|basic|bnf|brainfuck|cal|capnproto|ceylon|clean|clojure|clojure-repl|cmake|coffeescript|coq|cos|cpp|crmsh|crystal|csharp|csp|css|d|markdown|dart|delphi|diff|django|dns|dockerfile|dos|dsconfig|dts|dust|ebnf|elixir|elm|ruby|erb|erlang-repl|erlang|excel|fix|flix|fortran|fsharp|gams|gauss|gcode|gherkin|glsl|gml|go|golo|gradle|groovy|haml|handlebars|haskell|haxe|hsp|http|hy|inform7|ini|irpf90|isbl|java|javascript|jboss-cli|json|julia|julia-repl|kotlin|lasso|latex|ldif|leaf|less|lisp|livecodeserver|livescript|llvm|lsl|lua|makefile|mathematica|matlab|maxima|mel|mercury|mipsasm|mizar|perl|mojolicious|monkey|moonscript|n1ql|nestedtext|nginx|nim|nix|node-repl|nsis|objectivec|ocaml|openscad|oxygene|parser3|pf|pgsql|php|php-template|pony|powershell|processing|profile|prolog|properties|protobuf|puppet|purebasic|python|python-repl|q|qml|r|reasonml|rib|roboconf|routeros|rsl|ruleslanguage|rust|sas|scala|scheme|scilab|scss|shell|smali|smalltalk|sml|sqf|sql|stan|stata|step21|stylus|subunit|swift|taggerscript|yaml|tap|tcl|thrift|tp|twig|typescript|vala|vbnet|vbscript|vbscript-html|verilog|vhdl|vim|wasm|wren|x86asm|xl|xquery|zephir|html|py)(?=\n([^`]|(?<=\\)`{1,2}```)|((?<=```)[^`\n]+(?=```)))/gim
				)?.[0];
				if (args[arg].language) args[arg].code = args[arg].code.replace(args[arg].language, "").trim();
				args[arg].type = "code";
			} else if (args[arg].raw === "true") {
				args[arg].value = true;
				args[arg].type = "boolean";
			} else if (args[arg].raw === "false") {
				args[arg].value = false;
				args[arg].type = "boolean";
			} else if (/<t:[0-9]+(?:|:(?:f|F|d|D|t|T|R))>/gm.test(args[arg].raw)) {
				args[arg].type = "time";
				args[arg].timeType = args[arg].raw.match(/(?<=<t:[0-9]+(|:))(f|F|d|D|t|T|R)(?=>)/gm)?.[0] || "f";
				args[arg].date = new Date(args[arg].raw.match(/(?<=<t:)[0-9]+(?=(|(:(f|F|d|D|t|T|R)))>)/gm)?.[0]);
			} else {
				let emoji = emojis.find((e) => e.key === args[arg].raw);
				if (emoji) {
					args[arg].id = emoji.key;
					args[arg].desc = emoji.desc;
					args[arg].url = emoji.url;
					args[arg].type = "emoji";
				}
			}
		}
		parsed.arguments = args;
	}
	return parsed;
}
/** @param {Discord.Message} message*/
async function parse(message, prefix, options = {}) {
	let parsed = parseSync(message, prefix, options);
	parsed.arguments = await fetchDataFromArgs(message, parsed);
	return parsed;
}
/**@param {Discord.Message} message*/
async function fetchDataFromArgs(message, parsed) {
	let args = parsed.arguments;
	for (let i in args) {
		switch (args[i].type) {
			case "user":
				args[i].user = (await message.client.users.fetch(args[i].id, true, true)) || undefined;
				break;
			case "channel":
				args[i].channel = (await message.client.channels.fetch(args[i].id, true, true)) || undefined;
				break;
			case "custom_emoji":
				args[i].emoji = message.client.emojis.cache.find((e) => e.id === args[i].id);
		}
	}
	return args;
}

/**@param {Discord.Message} msg*/
async function _message(Bot, msg, config) {
	const message = Object.create(msg);
	Object.assign(message, { parse, parseSync, fetchDataFromArgs, config });
	message.lowerCaseContent = message.content.toLowerCase();
	message.parsed = await parse(message, [message.config.prefix, `<@!${message.client.user.id}> `]);
	if (message.lowerCaseContent === `<@!${message.client.user.id}>`) {
		message.reply(Bot.translate.get(["main", "prefix"], { prefix: config.prefix }, config.language));
		return message;
	}
	if (message.parsed.success) {
		let cmd = message.client.commands.get(message.parsed.command);
		if (cmd) return message.client.commands.run(cmd, message, config);
		else {
			let _sc = message.client.commands.getShortcut(message.parsed.command);
			if (!_sc) return false;
			let { command: cmd, shortcut: sc } = _sc;
			Object.assign(message.parsed.params, sc.message.params || {});
			message.parsed.arguments = sc.message.arguments.concat(message.parsed.arguments || []);
			message.parsed.command = cmd.id;
			return message.client.commands.run(cmd, message, config);
		}
	}
}

module.exports = _message;

// <t:1624855717> 		short date time: 	June 27, 2021 9:48 PM
// <t:1624855717:f> 	short date time 	June 27, 2021 9:48 PM
// <t:1624855717:F> 	long date time: 	Sunday, June 27, 2021 9:48 PM
// <t:1624855717:d> 	short date: 		06/27/2021
// <t:1624855717:D> 	long date: 		June 27, 2021
// <t:1624855717:t> 	short time: 		9:48 PM
// <t:1624855717:T> 	long time: 		9:48:37 PM
// <t:1624855717:R> 	relative time: 		2 days ago
