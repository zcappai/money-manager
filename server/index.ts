import express from "express";
import axios, { AxiosError } from "axios";

const PORT = process.env.PORT || 3001;
const monzoAuthUrl = "https://auth.monzo.com";
const monzoApiUrl = "https://api.monzo.com";
const redirectURL = "http://localhost:3000";

const app = express();

const oauthDetails = {
	client_id: "oauth2client_0000AXYfpUynUsrUvkqM2E",
	client_secret:
		"mnzpub.54oESFAw5DsTzw3TYnxLF4iQwNqn9mJlMP3GcruHLIO6lbLHYkQ0fgh65/Ng3haFtAvArWqrcXEbwgMCKd6AuA==",
	redirect_uri: `http://localhost:${PORT}/oauth/callback`,
};

let tempAuthCode: string;

app.get("/api/get_auth_url", (req, res) => {
	const { client_id, redirect_uri } = oauthDetails;
	let authURL = `${monzoAuthUrl}?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`;
	res.json({ authURL: authURL });
});

app.get("/oauth/callback", (req, res) => {
	const { code } = req.query;
	if (code && typeof code === "string") {
		tempAuthCode = code;
		res.redirect(`${redirectURL}?code=${code}`);
	}
});

app.get("/api/exchange_auth_code", (req, res) => {
	const { authCode } = req.query;
	const { client_id, client_secret, redirect_uri } = oauthDetails;

	const formData = new URLSearchParams();
	formData.set("grant_type", "authorization_code");
	formData.set("client_id", client_id);
	formData.set("client_secret", client_secret);
	formData.set("redirect_uri", redirect_uri);
	formData.set("code", authCode as string);

	axios
		.post(`${monzoApiUrl}/oauth2/token`, formData.toString())
		.then((result) => res.json(result.data))
		.catch(printError);
});

app.get("/api/ping_monzo", (req, res) => {
	const { accessToken } = req.query;

	axios
		.get(`${monzoApiUrl}/ping/whoami`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		.then((result) => res.json(result.data))
		.catch(printError);
});

app.get("/api/get_accounts", (req, res) => {
	const { accessToken } = req.query;

	axios
		.get(`${monzoApiUrl}/accounts`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		.then((result) => res.json(result.data))
		.catch(printError);
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

const printError = (error: AxiosError) => {
	if (error.response) {
		// The request was made and the server responded with a status code
		// that falls out of the range of 2xx
		console.log(error.response.data);
		console.log(error.response.status);
		console.log(error.response.headers);
	} else if (error.request) {
		// The request was made but no response was received
		// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
		// http.ClientRequest in node.js
		console.log(error.request);
	} else {
		// Something happened in setting up the request that triggered an Error
		console.log("Error", error.message);
	}
	console.log(error.config);
};
