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
	const [monzoCode, setMonzoCode] = useState<string | null>(null);
	const [accounts, setAccounts] = useState<Array<Account>>([]);
	const [transactions, setTransactions] = useState<Array<Transaction>>([]);
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
	const [authenticationStatus, setAuthenticationStatus] = useReducer(
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

	const checkAuthorisationStatus = () => {
		fetch(`/api/ping_monzo?accessToken=${authorisationData.accessToken}`)
			.then((res) => res.json())
			.then((val) =>
				setAuthenticationStatus({
					authenticated: val.authenticated,
					clientID: val.client_id,
					clientIP: val.client_ip,
					userID: val.user_id,
				})
			);
	};

	const getAccountList = () => {
		fetch(`/api/get_accounts?accessToken=${authorisationData.accessToken}`)
			.then((res) => res.json())
			.then((val) =>
				setAccounts(
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

	const getTransactionsList = () => {
		fetch(
			`/api/get_transactions?accessToken=${authorisationData.accessToken}&accountID=${accounts[0].ID}`
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
				setTransactions(monzoTransactions.reverse());
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
		<IconSettings iconPath="/icons">
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<Badge
						id={`badge-base-example-${
							authenticationStatus.authenticated ? "success" : "error"
						}`}
						color={authenticationStatus.authenticated ? "success" : "error"}
						content={`Monzo authentication status: ${
							authenticationStatus.authenticated
								? "Authenticated"
								: "Not Authenticated"
						}`}
					/>
					<Button
						label="Authorise Monzo"
						onClick={() =>
							window.open(monzoAuthURL ? monzoAuthURL : "", "_blank")
						}
						className="slds-text-body_regular"
					/>
					<Button
						label="Check Monzo authorisation status"
						onClick={checkAuthorisationStatus}
						className="slds-text-body_regular"
					/>
					<Button
						label="Get list of accounts"
						onClick={getAccountList}
						className="slds-text-body_regular"
						disabled={!authenticationStatus.authenticated}
					/>
					<Button
						label="Get list of transactions"
						onClick={getTransactionsList}
						className="slds-text-body_regular"
						disabled={!authenticationStatus.authenticated}
					/>
					{`Monzo account balance: £${transactions
						.map((x) => x.amount)
						.reduce((a, b) => a + b, 0)
						.toFixed(2)}`}
					<div style={{ height: "500px", overflow: "scroll" }}>
						<DataTable
							items={transactions}
							className="slds-text-body_regular slds-text-color_default"
						>
							{columns}
						</DataTable>
					</div>
				</header>
			</div>
		</IconSettings>
	);
}

export default App;
