import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
	const [monzoAuthURL, setMonzoAuthURL] = useState<string | null>(null);
	const [monzoCode, setMonzoCode] = useState<string | null>(null);

	useEffect(() => {
		fetch("/api")
			.then((res) => res.text())
			.then(setMonzoAuthURL);
	}, []);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		setMonzoCode(code);
	}, []);

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				{monzoCode}
				<button
					onClick={() =>
						window.location.replace(monzoAuthURL ? monzoAuthURL : "")
					}
				>
					Authorise Monzo
				</button>
			</header>
		</div>
	);
}

export default App;
