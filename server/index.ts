import axios, { AxiosError } from "axios";
import express from "express";
import fs from "fs";
import os from "os";

require("dotenv").config();

const PORT = process.env.PORT || 3001;

const app = express();

const truelayerScopes = [
	"info",
	"accounts",
	"balance",
	"cards",
	"transactions",
	"direct_debits",
	"standing_orders",
	"offline_access",
];

enum GrantType {
	AuthorizationCode = "authorization_code",
	RefreshToken = "refresh_token",
}

// Truelayer endpoints
app.get("/api/truelayer/get_auth_url", (req, res) => {
	const { provider } = req.query;
	const scopes = truelayerScopes.join("%20");
	const providerURL = (provider as string).concat("%20uk-oauth-all");
	let authURL = `${process.env.TRUELAYER_AUTH_URL}/?response_type=code&client_id=${process.env.TRUELAYER_CLIENT_ID}&scope=${scopes}&redirect_uri=${process.env.TRUELAYER_REDIRECT_URL}&providers=${providerURL}`;
	res.json({ authURL: authURL });
});

app.get("/api/truelayer/exchange_auth_code", (req, res) => {
	const { authCode } = req.query;

	if (
		process.env.TRUELAYER_CLIENT_ID &&
		process.env.TRUELAYER_CLIENT_SECRET &&
		process.env.TRUELAYER_REDIRECT_URL
	) {
		const formData = new URLSearchParams();
		formData.set("grant_type", GrantType.AuthorizationCode);
		formData.set("client_id", process.env.TRUELAYER_CLIENT_ID);
		formData.set("client_secret", process.env.TRUELAYER_CLIENT_SECRET);
		formData.set("redirect_uri", process.env.TRUELAYER_REDIRECT_URL);
		formData.set("code", authCode as string);

		axios
			.post(
				`${process.env.TRUELAYER_AUTH_URL}/connect/token`,
				formData.toString()
			)
			.then((result) => res.json(result.data))
			.catch(printError);
	}
});

app.get("/api/truelayer/refresh_access_token", (req, res) => {
	const { providerKey } = req.query;

	const refreshToken = process.env[`${providerKey}_REFRESH_TOKEN`];
	if (
		process.env.TRUELAYER_CLIENT_ID &&
		process.env.TRUELAYER_CLIENT_SECRET &&
		refreshToken
	) {
		const formData = new URLSearchParams();
		formData.set("grant_type", GrantType.RefreshToken);
		formData.set("client_id", process.env.TRUELAYER_CLIENT_ID);
		formData.set("client_secret", process.env.TRUELAYER_CLIENT_SECRET);
		formData.set("refresh_token", refreshToken);

		axios
			.post(
				`${process.env.TRUELAYER_AUTH_URL}/connect/token`,
				formData.toString()
			)
			.then((result) => res.json(result.data))
			.catch(printError);
	}
});

app.get("/api/truelayer/connection_metadata", (req, res) => {
	const { providerKey } = req.query;

	const accessToken = process.env[`${providerKey}_ACCESS_TOKEN`];
	axios
		.get(`${process.env.TRUELAYER_API_URL}/data/v1/me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		.then((result) => res.json(result.data))
		.catch(printError);
});

app.get("/api/truelayer/get_cards", (req, res) => {
	const { providerKey } = req.query;

	const accessToken = process.env[`${providerKey}_ACCESS_TOKEN`];
	axios
		.get(`${process.env.TRUELAYER_API_URL}/data/v1/cards`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		.then((result) => res.json(result.data))
		.catch(printError);
});

app.get("/api/truelayer/get_transactions", (req, res) => {
	const { providerKey, accountID } = req.query;

	const accessToken = process.env[`${providerKey}_ACCESS_TOKEN`];
	const formData = new URLSearchParams();
	formData.set("account_id", accountID as string);

	const currentDate = new Date(Date.now());
	const currentYear = currentDate.getFullYear();
	const currentMonth = currentDate.getMonth() + 1;
	const currentDay = currentDate.getDate();
	var formattedDate = `${currentYear}-${currentMonth}-${currentDay}`;

	axios
		.get(
			`${process.env.TRUELAYER_API_URL}/data/v1/cards/${accountID}/transactions?from=2021-09-01&to=${formattedDate}`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			}
		)
		.then((result) => res.json(result.data))
		.catch(printError);
});

app.get("/api/truelayer/set_tokens", (req, res) => {
	const { accessToken, refreshToken } = req.query;
	setEnvValue("AMEX_ACCESS_TOKEN", accessToken as string);
	setEnvValue("AMEX_REFRESH_TOKEN", refreshToken as string);
	res.send();
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

const setEnvValue = (key: string, value: string) => {
	// read file from hdd & split if from a linebreak to a array
	const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

	const ENV = ENV_VARS.find((line) => line.match(new RegExp(key)));

	if (ENV) {
		// find the env we want based on the key
		const target = ENV_VARS.indexOf(ENV);

		// replace the key/value with the new value
		ENV_VARS.splice(target, 1, `${key}=${value}`);

		// write everything back to the file system
		fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));
	}
};
