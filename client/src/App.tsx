import {
	IconSettings,
	Tabs,
	TabsPanel,
} from "@salesforce/design-system-react/";
import React from "react";
import "./App.css";
import BankAccount from "./Components/BankAccount";
import { Provider } from "./Enums/BankAccountEnums";
import { enumToProviderName } from "./Helpers/BankAccountHelper";
import logo from "./logo.svg";

const App = () => {
	// const [trueLayerAuthURL, setTrueLayerAuthURL] = useState<string | null>(null);

	// const [trueLayerCode, setTrueLayerCode] = useState<string | null>(null);

	// const [trueLayerAccounts, setTrueLayerAccounts] = useState<Array<Account>>(
	// 	[]
	// );
	// const [trueLayerTransactions, setTrueLayerTransactions] = useState<
	// 	Array<Transaction>
	// >([]);
	// const [trueLayerAuthorisationData, setTrueLayerAuthorisationData] =
	// 	useReducer(
	// 		(curData: AuthorisationType, newData: Partial<AuthorisationType>) => ({
	// 			...curData,
	// 			...newData,
	// 		}),
	// 		{
	// 			accessToken: null,
	// 			clientID: null,
	// 			expiresIn: null,
	// 			scope: null,
	// 			tokenType: null,
	// 			userID: null,
	// 		}
	// 	);

	// const [trueLayerAuthenticationStatus, setTrueLayerAuthenticationStatus] =
	// 	useReducer(
	// 		(
	// 			curData: AuthenticationStatusType,
	// 			newData: Partial<AuthenticationStatusType>
	// 		) => ({
	// 			...curData,
	// 			...newData,
	// 		}),
	// 		{
	// 			authenticated: false,
	// 			clientID: null,
	// 			clientIP: null,
	// 			userID: null,
	// 		}
	// 	);

	// useEffect(() => {
	// 	if (window.location.pathname.includes("truelayer_callback")) {
	// 		const params = new URLSearchParams(window.location.search);
	// 		const code = params.get("code");
	// 		setTrueLayerCode(code);
	// 	}
	// }, []);

	// useEffect(() => {
	// 	if (trueLayerCode && !trueLayerAuthorisationData.accessToken) {
	// 		fetch(`/api/truelayer/exchange_auth_code?authCode=${trueLayerCode}`)
	// 			.then((res) => res.json())
	// 			.then((val) =>
	// 				setTrueLayerAuthorisationData({
	// 					accessToken: val.access_token,
	// 					expiresIn: val.expires_in,
	// 					scope: val.scope,
	// 					tokenType: val.token_type,
	// 					userID: val.user_id,
	// 				})
	// 			);
	// 	}
	// }, [trueLayerAuthorisationData.accessToken, trueLayerCode]);

	// const checkTrueLayerAuthorisationStatus = () => {
	// 	fetch(
	// 		`/api/truelayer/connection_metadata?accessToken=${trueLayerAuthorisationData.accessToken}`
	// 	)
	// 		.then((res) => res.json())
	// 		.then((val) =>
	// 			setTrueLayerAuthenticationStatus({
	// 				authenticated: val.results[0].consent_status === "AUTHORISED",
	// 				clientID: val.results[0].client_id,
	// 			})
	// 		);
	// };

	// const getTrueLayerAccountList = () => {
	// 	fetch(
	// 		`/api/truelayer/get_cards?accessToken=${trueLayerAuthorisationData.accessToken}`
	// 	)
	// 		.then((res) => res.json())
	// 		.then((val) =>
	// 			setTrueLayerAccounts(
	// 				val.results.map((x: any) => {
	// 					const account: Account = {
	// 						ID: x.account_id,
	// 						accountNumber: "",
	// 						closed: false,
	// 						countryCode: "",
	// 						created: "",
	// 						currency: x.currency,
	// 						description: x.display_name,
	// 						sortCode: "",
	// 						type: "",
	// 					};
	// 					return account;
	// 				})
	// 			)
	// 		);
	// };

	// const getTrueLayerTransactionsList = () => {
	// 	fetch(
	// 		`/api/truelayer/get_transactions?accessToken=${trueLayerAuthorisationData.accessToken}&accountID=${trueLayerAccounts[0].ID}`
	// 	)
	// 		.then((res) => res.json())
	// 		.then((val) => {
	// 			const transactions: Array<Transaction> = val.results.map(
	// 				(x: any, index: number) => {
	// 					const transaction: Transaction = {
	// 						ID: index + 1,
	// 						accountID: "",
	// 						amount: x.amount,
	// 						amountWithPrefix: `${x.amount < 0 ? "-" : ""}£${Math.abs(
	// 							x.amount.toFixed(2)
	// 						)}`,
	// 						amountIsPending: false,
	// 						category: x.transaction_category,
	// 						counterpartyName: "",
	// 						created: moment(x.timestamp).format("H:MMA DD/MM/YYYY"),
	// 						currency: x.currency,
	// 						description: x.description,
	// 						notes: "",
	// 					};
	// 					return transaction;
	// 				}
	// 			);
	// 			setTrueLayerTransactions(transactions);
	// 		});
	// };

	// useEffect(() => {
	// 	fetch("/api/truelayer/get_auth_url")
	// 		.then((res) => res.json())
	// 		.then((val) => setTrueLayerAuthURL(val.authURL));
	// }, []);

	// const columns = [
	// 	<DataTableColumn
	// 		key="amountWithPrefix"
	// 		label="Amount"
	// 		property="amountWithPrefix"
	// 	/>,
	// 	<DataTableColumn key="category" label="Category" property="category" />,
	// 	<DataTableColumn
	// 		key="counterparty"
	// 		label="Counterparty"
	// 		property="counterpartyName"
	// 	/>,
	// 	<DataTableColumn key="created" label="Created" property="created" />,
	// 	<DataTableColumn
	// 		key="description"
	// 		label="Description"
	// 		property="description"
	// 	/>,
	// ];

	return (
		<IconSettings iconPath="/icons">
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<Tabs id="tabs-example-default">
						<TabsPanel label={enumToProviderName(Provider.AmericanExpress)}>
							<BankAccount provider={Provider.AmericanExpress} />
						</TabsPanel>
						<TabsPanel label={enumToProviderName(Provider.HSBC)}>
							<BankAccount provider={Provider.HSBC} />
						</TabsPanel>
						<TabsPanel label={enumToProviderName(Provider.Monzo)}>
							<BankAccount provider={Provider.Monzo} />
						</TabsPanel>
						<TabsPanel label={enumToProviderName(Provider.Revolut)}>
							<BankAccount provider={Provider.Revolut} />
						</TabsPanel>
						<TabsPanel label={enumToProviderName(Provider.Starling)}>
							<BankAccount provider={Provider.Starling} />
						</TabsPanel>
					</Tabs>
					{/* <Badge
						id={`badge-base-example-${
							trueLayerAuthenticationStatus.authenticated ? "success" : "error"
						}`}
						color={
							trueLayerAuthenticationStatus.authenticated ? "success" : "error"
						}
						content={`TrueLayer authentication status: ${
							trueLayerAuthenticationStatus.authenticated
								? "Authenticated"
								: "Not Authenticated"
						}`}
					/> */}
					{/* <Button
						label="Authorise TrueLayer"
						onClick={() =>
							window.open(trueLayerAuthURL ? trueLayerAuthURL : "", "_blank")
						}
						className="slds-text-body_regular"
					/> */}
					{/* <Button
						label="Check TrueLayer authorisation status"
						onClick={checkTrueLayerAuthorisationStatus}
						className="slds-text-body_regular"
					/>
					<Button
						label="Get list of accounts"
						onClick={getTrueLayerAccountList}
						className="slds-text-body_regular"
						disabled={!trueLayerAuthenticationStatus.authenticated}
					/> */}
					{/* <Button
						label="Get list of transactions"
						onClick={getTrueLayerTransactionsList}
						className="slds-text-body_regular"
						disabled={!trueLayerAuthenticationStatus.authenticated}
					/> */}
					{/* {`AMEX Account Balance: £${trueLayerTransactions
						.map((x) => x.amount)
						.reduce((a, b) => a + b, 0)
						.toFixed(2)}`}
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
					</div> */}
				</header>
			</div>
		</IconSettings>
	);
};

export default App;
