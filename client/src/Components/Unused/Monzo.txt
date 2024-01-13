import {
	Badge,
	Button,
	DataTable,
	DataTableColumn,
} from "@salesforce/design-system-react";
import moment from "moment";
import React, { useEffect, useReducer, useState } from "react";

type AuthorisationType = {
	accessToken: string | null | null;
	clientID: string | null;
	expiresIn: number | null;
	scope: string | null;
	tokenType: string | null;
	userID: string | null;
};

type AuthenticationStatusType = {
	authenticated: boolean;
	clientID: string | null;
	clientIP: string | null;
	userID: string | null;
};

type Account = {
	// Also includes "owners", "payment_details"
	ID: string;
	accountNumber: string;
	closed: boolean;
	countryCode: string;
	created: string;
	currency: string;
	description: string;
	sortCode: string;
	type: string;
};

type Transaction = {
	ID: number;
	accountID: string;
	amount: number;
	amountWithPrefix: string;
	amountIsPending: boolean;
	category: string;
	counterpartyName: string;
	created: string;
	currency: string;
	description: string;
	notes: string;
};

/** This file contains the basics of the implementation for fetching transactions from Monzo
 * using the Monzo API. I switched from using solely the Monzo API to using TrueLayer as that
 * integrated multiple banks into 1 API, which is more convenient. The NodeJS endpoints have
 * been added to the end of this file and commented out. They should be in the index.ts file.
 * I have also added the env variables that I used in the .env file for the Monzo endpoints.*/

const Monzo = () => {
	const [monzoAuthURL, setMonzoAuthURL] = useState<string | null>(null);

	const [monzoCode, setMonzoCode] = useState<string | null>(null);
	const [monzoAccounts, setMonzoAccounts] = useState<Array<Account>>([]);
	const [monzoTransactions, setMonzoTransactions] = useState<
		Array<Transaction>
	>([]);
	const [monzoAuthorisationData, setMonzoAuthorisationData] = useReducer(
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
	const [monzoAuthenticationStatus, setMonzoAuthenticationStatus] = useReducer(
		(
			curData: AuthenticationStatusType,
			newData: Partial<AuthenticationStatusType>
		) => ({
			...curData,
			...newData,
		}),
		{
			authenticated: false,
			clientID: null,
			clientIP: null,
			userID: null,
		}
	);

	useEffect(() => {
		fetch("/api/monzo/get_auth_url")
			.then((res) => res.json())
			.then((val) => setMonzoAuthURL(val.authURL));
	}, []);

	useEffect(() => {
		if (window.location.pathname.includes("monzo_callback")) {
			const params = new URLSearchParams(window.location.search);
			const code = params.get("code");
			setMonzoCode(code);
		}
	}, []);

	useEffect(() => {
		if (monzoCode && !monzoAuthorisationData.accessToken) {
			fetch(`/api/monzo/exchange_auth_code?authCode=${monzoCode}`)
				.then((res) => res.json())
				.then((val) =>
					setMonzoAuthorisationData({
						accessToken: val.access_token,
						clientID: val.client_id,
						expiresIn: val.expires_in,
						scope: val.scope,
						tokenType: val.token_type,
						userID: val.user_id,
					})
				);
		}
	}, [monzoAuthorisationData.accessToken, monzoCode]);

	const checkMonzoAuthorisationStatus = () => {
		fetch(
			`/api/monzo/ping_monzo?accessToken=${monzoAuthorisationData.accessToken}`
		)
			.then((res) => res.json())
			.then((val) =>
				setMonzoAuthenticationStatus({
					authenticated: val.authenticated,
					clientID: val.client_id,
					clientIP: val.client_ip,
					userID: val.user_id,
				})
			);
	};

	const getMonzoAccountList = () => {
		fetch(
			`/api/monzo/get_accounts?accessToken=${monzoAuthorisationData.accessToken}`
		)
			.then((res) => res.json())
			.then((val) =>
				setMonzoAccounts(
					val.accounts.map((x: any) => {
						const account: Account = {
							ID: x.id,
							accountNumber: x.account_number,
							closed: x.closed,
							countryCode: x.country_code,
							created: x.created,
							currency: x.currency,
							description: x.description,
							sortCode: x.sort_code,
							type: x.type,
						};
						return account;
					})
				)
			);
	};

	const getMonzoTransactionsList = () => {
		fetch(
			`/api/monzo/get_transactions?accessToken=${monzoAuthorisationData.accessToken}&accountID=${monzoAccounts[0].ID}`
		)
			.then((res) => res.json())
			.then((val) => {
				const monzoTransactions: Array<Transaction> = val.transactions
					.filter((x: any) => x.decline_reason === undefined)
					.map((x: any, index: number) => {
						const transaction: Transaction = {
							ID: index + 1,
							accountID: x.account_id,
							amount: x.amount / 100,
							amountWithPrefix: `${x.amount < 0 ? "-" : ""}£${
								Math.abs(x.amount.toFixed(2)) / 100
							}`,
							amountIsPending: x.amount_is_pending,
							category: x.category,
							counterpartyName: x.counterparty.name,
							created: moment(x.created).format("H:MMA DD/MM/YYYY"),
							currency: x.currency,
							description: x.description,
							notes: x.notes,
						};
						return transaction;
					});
				setMonzoTransactions(monzoTransactions.reverse());
			});
	};

	const columns = [
		<DataTableColumn
			key="amountWithPrefix"
			label="Amount"
			property="amountWithPrefix"
		/>,
		<DataTableColumn key="category" label="Category" property="category" />,
		<DataTableColumn
			key="counterparty"
			label="Counterparty"
			property="counterpartyName"
		/>,
		<DataTableColumn key="created" label="Created" property="created" />,
		<DataTableColumn
			key="description"
			label="Description"
			property="description"
		/>,
	];

	return (
		<div className="App">
			<header className="App-header">
				<div className="slds-grid slds-gutters">
					<div className="slds-col">
						<Badge
							id={`badge-base-example-${
								monzoAuthenticationStatus.authenticated ? "success" : "error"
							}`}
							color={
								monzoAuthenticationStatus.authenticated ? "success" : "error"
							}
							content={`Monzo authentication status: ${
								monzoAuthenticationStatus.authenticated
									? "Authenticated"
									: "Not Authenticated"
							}`}
						/>
					</div>
					<div className="slds-col">
						<Button
							label="Authorise Monzo"
							onClick={() =>
								window.open(monzoAuthURL ? monzoAuthURL : "", "_blank")
							}
							className="slds-text-body_regular"
						/>
					</div>
					<div className="slds-col">
						<Button
							label="Check Monzo authorisation status"
							onClick={checkMonzoAuthorisationStatus}
							className="slds-text-body_regular"
						/>
					</div>
					<div className="slds-col">
						<Button
							label="Get list of accounts"
							onClick={getMonzoAccountList}
							className="slds-text-body_regular"
							disabled={!monzoAuthenticationStatus.authenticated}
						/>
					</div>
					<div className="slds-col">
						<Button
							label="Get list of transactions"
							onClick={getMonzoTransactionsList}
							className="slds-text-body_regular"
							disabled={!monzoAuthenticationStatus.authenticated}
						/>
					</div>
					<div className="slds-col">
						{`Monzo Account Balance: £${monzoTransactions
							.map((x) => x.amount)
							.reduce((a, b) => a + b, 0)
							.toFixed(2)}`}
					</div>
					<div
						className="slds-col"
						style={{ height: "500px", overflow: "scroll" }}
					>
						<DataTable
							items={monzoTransactions}
							className="slds-text-body_regular slds-text-color_default"
						>
							{columns}
						</DataTable>
					</div>
				</div>
			</header>
		</div>
	);
};

export default Monzo;

// ENV variables
// MONZO_CLIENT_ID=<monzo-client-ID>
// MONZO_CLIENT_SECRET=<monzo-client-secret>
// MONZO_AUTH_URL=https://auth.monzo.com
// MONZO_API_URL=https://api.monzo.com
// MONZO_REDIRECT_URL=http://localhost:3000/oauth/monzo_callback

// Monzo endpoints
// app.get("/api/monzo/get_auth_url", (req, res) => {
// 	let authURL = `${process.env.MONZO_AUTH_URL}?client_id=${process.env.MONZO_CLIENT_ID}&redirect_uri=${process.env.MONZO_REDIRECT_URL}&response_type=code`;
// 	res.json({ authURL: authURL });
// });

// app.get("/api/monzo/exchange_auth_code", (req, res) => {
// 	const { authCode } = req.query;

// 	if (
// 		process.env.MONZO_CLIENT_ID &&
// 		process.env.MONZO_CLIENT_SECRET &&
// 		process.env.MONZO_REDIRECT_URL
// 	) {
// 		const formData = new URLSearchParams();
// 		formData.set("grant_type", "authorization_code");
// 		formData.set("client_id", process.env.MONZO_CLIENT_ID);
// 		formData.set("client_secret", process.env.MONZO_CLIENT_SECRET);
// 		formData.set("redirect_uri", process.env.MONZO_REDIRECT_URL);
// 		formData.set("code", authCode as string);

// 		axios
// 			.post(`${process.env.MONZO_API_URL}/oauth2/token`, formData.toString())
// 			.then((result) => res.json(result.data))
// 			.catch(printError);
// 	}
// });

// app.get("/api/monzo/ping_monzo", (req, res) => {
// 	const { accessToken } = req.query;

// 	axios
// 		.get(`${process.env.MONZO_API_URL}/ping/whoami`, {
// 			headers: { Authorization: `Bearer ${accessToken}` },
// 		})
// 		.then((result) => res.json(result.data))
// 		.catch(printError);
// });

// app.get("/api/monzo/get_accounts", (req, res) => {
// 	const { accessToken } = req.query;

// 	axios
// 		.get(`${process.env.MONZO_API_URL}/accounts`, {
// 			headers: { Authorization: `Bearer ${accessToken}` },
// 		})
// 		.then((result) => res.json(result.data))
// 		.catch(printError);
// });

// app.get("/api/monzo/get_transactions", (req, res) => {
// 	const { accessToken, accountID } = req.query;

// 	const formData = new URLSearchParams();
// 	formData.set("account_id", accountID as string);

// 	axios
// 		.get(`${process.env.MONZO_API_URL}/transactions?account_id=${accountID}`, {
// 			headers: { Authorization: `Bearer ${accessToken}` },
// 		})
// 		.then((result) => res.json(result.data))
// 		.catch(printError);
// });
