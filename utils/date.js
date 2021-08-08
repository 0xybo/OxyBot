function relativeFormat(format, date = new Date()) {
	let diffMs
	if (typeof date === "number") diffMs = date;
	else  diffMs = new Date() - date;
	let diffY = Math.trunc(diffMs / (365.24219 * 24 * 60 * 60 * 1000));
	if (/{{Y}}/gim.test(format)) diffMs = diffMs % (365.24219 * 24 * 60 * 60 * 1000);
	let diffW = Math.trunc(diffMs / (7 * 24 * 60 * 60 * 1000));
	if (/{{W}}/gim.test(format)) diffMs = diffMs % (7 * 24 * 60 * 60 * 1000);
	let diffD = Math.trunc(diffMs / (24 * 60 * 60 * 1000));
	if (/{{D}}/gim.test(format)) diffMs = diffMs % (24 * 60 * 60 * 1000);
	let diffH = Math.trunc(diffMs / (60 * 60 * 1000));
	if (/{{H}}/gim.test(format)) diffMs = diffMs % (60 * 60 * 1000);
	let diffM = Math.trunc(diffMs / (60 * 1000));
	if (/{{M}}/gim.test(format)) diffMs = diffMs % (60 * 1000);
	let diffS = Math.trunc(diffMs / 1000);
	if (/{{S}}/gim.test(format)) diffMs = diffMs % 1000;
	format = format
		.replace(/{{Y}}/gim, diffY)
		.replace(/{{W}}/gim, diffW)
		.replace(/{{D}}/gim, diffD)
		.replace(/{{H}}/gim, diffH)
		.replace(/{{M}}/gim, diffM)
		.replace(/{{S}}/gim, diffS)
		.replace(/{{Ms}}/gim, diffMs);
	return { diffY, diffW, diffD, diffH, diffM, diffS, diffMs, format };
}

function format(format, date = new Date()) {
	return format
		.replace(/YYYY/g, date.getFullYear())
		.replace(/YY/g, date.getFullYear().toString().slice(2))
		.replace(/MM/g, (date.getMonth().toString().length == 1 ? "0" : "") + (date.getMonth() + 1))
		.replace(/DD/g, (date.getDate().toString().length == 1 ? "0" : "") + date.getDate())
		.replace(/ss/g, (date.getSeconds().toString().length == 1 ? "0" : "") + date.getSeconds())
		.replace(/mm/g, (date.getMinutes().toString().length == 1 ? "0" : "") + date.getMinutes())
		.replace(/hh/g, (date.getHours().toString().length == 1 ? "0" : "") + date.getHours());
}

module.exports = { relativeFormat, format };
