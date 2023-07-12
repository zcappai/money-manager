import express from "express";
import axios from "axios";

const PORT = process.env.PORT || 3001;
const monzoAuthUrl = "https://auth.monzo.com";
const monzoApiUrl = "https://api.monzo.com";

const app = express();

const oauthDetails = {
	client_id: "oauth2client_0000AXYfpUynUsrUvkqM2E",
	client_secret: "[your client secret]",
	redirect_uri: `http://localhost:${PORT}/oauth/callback`,
};

let tempAuthCode: string;

app.get("/api", (req, res) => {
	const { client_id, redirect_uri } = oauthDetails;

	res.type("html");
	res.send(
		`${monzoAuthUrl}?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`
	);
});

app.get("/oauth/callback", (req, res) => {
	const { code } = req.query;
	if (code && typeof code === "string") {
		tempAuthCode = code;
		res.redirect(`/api?code=${code}`);
	}
});

app.get("/api/exchange_auth_code", (req, res) => {
	axios.post(`${monzoApiUrl}/oauth2/token`, {
		grant_type: tempAuthCode,
		client_id: "client_id",
		client_secret: "client_secret",
		redirect_uri: "redirect_uri",
		code: "authorization_code",
	});
});

app.get("/api/ping_monzo", (req, res) =>
	axios
		.options("https://api.monzo.com/ping/whoami")
		.then((result) => res.json(result))
		.catch((error) => console.log(error))
		.finally(() => {})
);

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
