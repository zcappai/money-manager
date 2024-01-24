import { IconSettings } from "@salesforce/design-system-react/";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import BankAccounts from "./Components/BankAccounts";
import Callback from "./Components/Callback";
import logo from "./logo.svg";

type RouteType = {
	path: string;
	element: JSX.Element;
};

const App = () => {
	const routes: Array<RouteType> = [
		{
			path: "/",
			element: <BankAccounts />,
		},
		{
			path: "/oauth/truelayer_callback",
			element: <Callback />,
		},
	];

	return (
		<IconSettings iconPath="/icons">
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<BrowserRouter>
						<Routes>
							{routes.map((x, i) => (
								<Route key={i} path={x.path} element={x.element} />
							))}
						</Routes>
					</BrowserRouter>
				</header>
			</div>
		</IconSettings>
	);
};

export default App;
