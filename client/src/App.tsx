import React, { useEffect, useReducer, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

type AuthorisationType = {
	accessToken: string | null | null;
	clientID: string | null;
	expiresIn: number | null;
	scope: string | null;
	tokenType: string | null;
	userID: string | null;
};

function App() {
	const [monzoAuthURL, setMonzoAuthURL] = useState<string | null>(null);
	const [monzoCode, setMonzoCode] = useState<string | null>(null);
	const [authorisationData, setAuthorisationData] = useReducer(
		(curData: AuthorisationType, newData: Partial<AuthorisationType>) => ({
			...curData,
			...newData,
		}),
		{
			accessToken: null,
			clientID: null,
			expiresIn: null,
			scope: null,
			tokenType: null,
			userID: null,
		}
	);

	useEffect(() => {
		fetch("/api/get_auth_url")
			.then((res) => res.json())
			.then((val) => setMonzoAuthURL(val.authURL));
	}, []);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		setMonzoCode(code);
	}, []);

	useEffect(() => {
		if (monzoCode && !authorisationData.accessToken) {
			fetch(`/api/exchange_auth_code?authCode=${monzoCode}`)
				.then((res) => res.json())
				.then((val) =>
					setAuthorisationData({
						accessToken: val.access_token,
						clientID: val.client_id,
						expiresIn: val.expires_in,
						scope: val.scope,
						tokenType: val.token_type,
						userID: val.user_id,
					})
				);
		}
	}, [authorisationData.accessToken, monzoCode]);

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				{monzoCode}
				<button
					onClick={() =>
						window.open(monzoAuthURL ? monzoAuthURL : "", "_blank")
					}
				>
					Authorise Monzo
				</button>
			</header>
		</div>
	);
}

export default App;
