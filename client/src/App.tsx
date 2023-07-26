import React, { useEffect, useReducer, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import {
	Badge,
	Button,
	DataTable,
	DataTableColumn,
	IconSettings,
} from "@salesforce/design-system-react/";
import moment from "moment";

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

function App() {
	const [monzoAuthURL, setMonzoAuthURL] = useState<string | null>(null);
	const [trueLayerAuthURL, setTrueLayerAuthURL] = useState<string | null>(null);
	const [monzoCode, setMonzoCode] = useState<string | null>(null);
	const [trueLayerCode, setTrueLayerCode] = useState<string | null>(null);
	const [monzoAccounts, setMonzoAccounts] = useState<Array<Account>>([]);
	const [trueLayerAccounts, setTrueLayerAccounts] = useState<Array<Account>>(
		[]
	);
	const [monzoTransactions, setMonzoTransactions] = useState<
		Array<Transaction>
	>([]);
	const [trueLayerTransactions, setTrueLayerTransactions] = useState<
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
	const [trueLayerAuthorisationData, setTrueLayerAuthorisationData] =
		useReducer(
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

	const [trueLayerAuthenticationStatus, setTrueLayerAuthenticationStatus] =
		useReducer(
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
		} else if (window.location.pathname.includes("truelayer_callback")) {
			const params = new URLSearchParams(window.location.search);
			const code = params.get("code");
			setTrueLayerCode(code);
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

	useEffect(() => {
		if (trueLayerCode && !monzoAuthorisationData.accessToken) {
			fetch(`/api/truelayer/exchange_auth_code?authCode=${trueLayerCode}`)
				.then((res) => res.json())
				.then((val) =>
					setTrueLayerAuthorisationData({
						accessToken: val.access_token,
						expiresIn: val.expires_in,
						scope: val.scope,
						tokenType: val.token_type,
						userID: val.user_id,
					})
				);
		}
	}, [monzoAuthorisationData.accessToken, trueLayerCode]);

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

	const checkTrueLayerAuthorisationStatus = () => {
		fetch(
			`/api/truelayer/connection_metadata?accessToken=${trueLayerAuthorisationData.accessToken}`
		)
			.then((res) => res.json())
			.then((val) =>
				setTrueLayerAuthenticationStatus({
					authenticated: val.results[0].consent_status === "AUTHORISED",
					clientID: val.results[0].client_id,
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

	const getTrueLayerAccountList = () => {
		fetch(
			`/api/truelayer/get_cards?accessToken=${trueLayerAuthorisationData.accessToken}`
		)
			.then((res) => res.json())
			.then((val) =>
				setTrueLayerAccounts(
					val.results.map((x: any) => {
						const account: Account = {
							ID: x.account_id,
							accountNumber: "",
							closed: false,
							countryCode: "",
							created: "",
							currency: x.currency,
							description: x.display_name,
							sortCode: "",
							type: "",
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

	const getTrueLayerTransactionsList = () => {
		fetch(
			`/api/truelayer/get_transactions?accessToken=${trueLayerAuthorisationData.accessToken}&accountID=${trueLayerAccounts[0].ID}`
		)
			.then((res) => res.json())
			.then((val) => {
				const transactions: Array<Transaction> = val.results.map(
					(x: any, index: number) => {
						const transaction: Transaction = {
							ID: index + 1,
							accountID: "",
							amount: x.amount,
							amountWithPrefix: `${x.amount < 0 ? "-" : ""}£${Math.abs(
								x.amount.toFixed(2)
							)}`,
							amountIsPending: false,
							category: x.transaction_category,
							counterpartyName: "",
							created: moment(x.timestamp).format("H:MMA DD/MM/YYYY"),
							currency: x.currency,
							description: x.description,
							notes: "",
						};
						return transaction;
					}
				);
				setTrueLayerTransactions(transactions);
			});
	};

	useEffect(() => {
		fetch("/api/truelayer/get_auth_url")
			.then((res) => res.json())
			.then((val) => setTrueLayerAuthURL(val.authURL));
	}, []);

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
		<IconSettings iconPath="/icons">
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<div className="slds-grid slds-gutters">
						<div className="slds-col slds-size_1-of-2">
							<div className="slds-col">
								<Badge
									id={`badge-base-example-${
										monzoAuthenticationStatus.authenticated
											? "success"
											: "error"
									}`}
									color={
										monzoAuthenticationStatus.authenticated
											? "success"
											: "error"
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
								{`Monzo account balance: £${monzoTransactions
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
						<div className="slds-col slds-size_1-of-2">
							<div className="slds-col">
								<Badge
									id={`badge-base-example-${
										trueLayerAuthenticationStatus.authenticated
											? "success"
											: "error"
									}`}
									color={
										trueLayerAuthenticationStatus.authenticated
											? "success"
											: "error"
									}
									content={`TrueLayer authentication status: ${
										trueLayerAuthenticationStatus.authenticated
											? "Authenticated"
											: "Not Authenticated"
									}`}
								/>
							</div>
							<div className="slds-col">
								<Button
									label="Authorise TrueLayer"
									onClick={() =>
										window.open(
											trueLayerAuthURL ? trueLayerAuthURL : "",
											"_blank"
										)
									}
									className="slds-text-body_regular"
								/>
							</div>
							<div className="slds-col">
								<Button
									label="Check TrueLayer authorisation status"
									onClick={checkTrueLayerAuthorisationStatus}
									className="slds-text-body_regular"
								/>
							</div>
							<div className="slds-col">
								<Button
									label="Get list of accounts"
									onClick={getTrueLayerAccountList}
									className="slds-text-body_regular"
									disabled={!trueLayerAuthenticationStatus.authenticated}
								/>
							</div>
							<div className="slds-col">
								<Button
									label="Get list of transactions"
									onClick={getTrueLayerTransactionsList}
									className="slds-text-body_regular"
									disabled={!trueLayerAuthenticationStatus.authenticated}
								/>
							</div>
							<div className="slds-col">
								{`American Express account balance: £${trueLayerTransactions
									.map((x) => x.amount)
									.reduce((a, b) => a + b, 0)
									.toFixed(2)}`}
							</div>
							<div
								className="slds-col"
								style={{ height: "500px", overflow: "scroll" }}
							>
								<DataTable
									items={trueLayerTransactions}
									className="slds-text-body_regular slds-text-color_default"
								>
									{columns}
								</DataTable>
							</div>
						</div>
					</div>
				</header>
			</div>
		</IconSettings>
	);
}

export default App;
