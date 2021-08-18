// const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");

class Web {
	constructor(_this, Bot) {
		Object.assign(this, _this, Bot);
		this.logger = new this.Logger("web", this.config.debugLog);
		let logger = this.logger;

		this.app = express();
		this.app.set("view engine", "pug");
		this.app.set("views", path.join(__dirname, "views"));
		this.app.use(
			express.static("web/static", {
				setHeaders: function (res, filePath) {
					logger.info(`GET: ${path.relative(__dirname, filePath).replace(/\\/gim, "/")}`);
				},
			})
		);
		this.app.use(
			session({
				secret: process.env.SECRET,
				cookie: {
					maxAge: 172800000,
				},
			})
		);
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use(function (req, res, next) {
			logger.info(`${req.method.toUpperCase()}: ${req.originalUrl}`);
			console.log(req, res);
			next();
		});

		this.config.pages.forEach((element) => {
			if (element.type === "page") {
				if (element.request.includes("get"))
					this.app.get(element.path, (req, res) => {
						res.render(element.name, { translate: this.translate.getAllWithLanguage(req.session.locale || "en-GB"), theme: req.session.theme || "dark" });
					});
			} else {
				this.app.use(element.path, require(path.join(__dirname, "routers", element.name + ".js")));
			}
		});

		this.app.get("*", (req, res) => {
			res.render("404", { location: "/404?origin=" + req.originalUrl.replace(/(\?.*)|(\#.*)/gim, ""), translate: this.translate.getAllWithLanguage(req.session.locale || "en-GB") });
			res.end();
		});
	}
	static async init(Bot) {
		return new Web({}, Bot);
	}
	start() {
		return new Promise((resolve, reject) => {
			this.app.listen(3000, () => {
				this.logger.info("Server running on http://localhost:3000");
				resolve();
			});
		});
	}
}
module.exports = Web;
