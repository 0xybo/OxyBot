// window.addEventListener("resize", resized);
// function resized() {
// 	let html = $("html");
// 	if (window.innerWidth < 400) html.attr("size", "very small")
// 	else if (window.innerWidth < 700) html.attr("size", "small")
// 	else if (window.innerWidth < 1000) html.attr("size", "medium")
// 	else if (window.innerWidth < 1300) html.attr("size", "large")
// 	else html.attr("size", "very large");
// }
// resized();

window.onload = function () {
	$("header .buttons .theme-changer").on("click", () => {
		let html = $("html");
		if (html.attr("theme") === "dark") html.attr("theme", "light");
		else html.attr("theme", "dark");
	});
};
