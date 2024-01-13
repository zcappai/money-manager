import {
	Badge,
	Button,
	DataTable,
	DataTableColumn,
} from "@salesforce/design-system-react";
import React, { useEffect, useReducer, useState } from "react";
import { Provider } from "../Enums/BankAccountEnums";
import { enumToProviderName } from "../Helpers/BankAccountHelper";
import BankAccountStore from "../Stores/BankAccountStore";
import {
	Account,
	AuthenticationStatusType,
	AuthorisationType,
	Transaction,
} from "../Types/BankAccountTypes";

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

type Props = {
	provider: Provider;
};

const BankAccount = (props: Props) => {
	const [authCode, setAuthCode] = useState<string | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [accountsList, setAccountsList] = useState<Array<Account>>([]);
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
		if (window.location.pathname.includes("truelayer_callback")) {
			const params = new URLSearchParams(window.location.search);
			const code = params.get("code");
			setAuthCode(code);
		}
	}, []);

	useEffect(() => {
		if (authCode && !authorisationData.accessToken) {
			fetch(`/api/truelayer/exchange_auth_code?authCode=${authCode}`)
				.then((res) => res.json())
				.then((val) => {
					setAuthorisationData({
						accessToken: val.access_token,
						expiresIn: val.expires_in,
						scope: val.scope,
						tokenType: val.token_type,
						userID: val.user_id,
					});
					setAccessToken(val.access_token);
				});
		}
	}, [authorisationData.accessToken, authCode]);

	const getAndOpenAuthURL = () =>
		BankAccountStore.getAndOpenAuthURL(props.provider);

	const checkAuthStatus = () => {
		if (accessToken) {
			BankAccountStore.checkAuthorisationStatus(
				accessToken,
				setAuthenticationStatus
			);
		}
	};

	const getAccountsList = () => {
		if (accessToken) {
			BankAccountStore.getAccountList(accessToken, setAccountsList);
		}
	};

	const getTransactionsList = () => {
		let accountID: string = accountsList[0].ID;
		if (accessToken && accountsList[0].ID) {
			BankAccountStore.getTrueLayerTransactionsList(
				accessToken,
				accountID,
				setTransactions
			);
		}
	};

	return (
		<React.Fragment>
			<Badge
				id={`badge-base-example-${
					authenticationStatus.authenticated ? "success" : "error"
				}`}
				color={authenticationStatus.authenticated ? "success" : "error"}
				content={`${enumToProviderName(
					props.provider
				)} authentication status: ${
					authenticationStatus.authenticated
						? "Authenticated"
						: "Not Authenticated"
				}`}
			/>
			<Button
				label="Authorise TrueLayer"
				onClick={getAndOpenAuthURL}
				className="slds-text-body_regular"
			/>
			<Button
				label="Check TrueLayer authorisation status"
				onClick={checkAuthStatus}
				className="slds-text-body_regular"
			/>
			<Button
				label="Get list of accounts"
				onClick={getAccountsList}
				className="slds-text-body_regular"
				disabled={!authenticationStatus.authenticated}
			/>
			<Button
				label="Get list of transactions"
				onClick={getTransactionsList}
				className="slds-text-body_regular"
				disabled={!authenticationStatus.authenticated}
			/>
			{`AMEX Account Balance: £${transactions
				.map((x) => x.amount)
				.reduce((a, b) => a + b, 0)
				.toFixed(2)}`}
			<div className="slds-col" style={{ height: "500px", overflow: "scroll" }}>
				<DataTable
					items={transactions}
					className="slds-text-body_regular slds-text-color_default"
				>
					{columns}
				</DataTable>
			</div>
		</React.Fragment>
	);
};

export default BankAccount;
