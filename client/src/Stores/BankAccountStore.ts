import moment from "moment";
import { Dispatch, SetStateAction } from "react";
import { Provider } from "../Enums/BankAccountEnums";
import {
	enumToProviderID,
	enumToProviderKeyPrefix,
} from "../Helpers/BankAccountHelper";
import {
	Account,
	AuthenticationStatusType,
	Transaction,
} from "../Types/BankAccountTypes";

class BankAccountStore {
	static getAndOpenAuthURL = (provider: Provider) => {
		let providerID = enumToProviderID(provider);
		fetch(`/api/truelayer/get_auth_url?provider=${providerID}`)
			.then((res) => res.json())
			.then((val) => window.open(val.authURL ? val.authURL : "", "_self"));
	};

	static exchangeAuthCode = (authCode: string, successFn: () => void) => {
		fetch(`/api/truelayer/exchange_auth_code?authCode=${authCode}`)
			.then((res) => res.json())
			.then((val) =>
				this.setTokens(val.access_token, val.refresh_token, successFn)
			);
	};

	static setTokens = (
		accessToken: string,
		refreshToken: string,
		successFn: () => void
	) =>
		fetch(
			`/api/truelayer/set_tokens?accessToken=${accessToken}&refreshToken=${refreshToken}`
		).then(successFn);

	static checkAuthorisationStatus = (
		provider: Provider,
		setData: Dispatch<Partial<AuthenticationStatusType>>
	) => {
		const providerKey = enumToProviderKeyPrefix(provider);
		fetch(`/api/truelayer/connection_metadata?providerKey=${providerKey}`)
			.then((res) => res.json())
			.then((val) =>
				setData({
					authenticated: val.results[0].consent_status === "AUTHORISED",
					clientID: val.results[0].client_id,
				})
			);
	};

	static getAccountList = (
		provider: Provider,
		setData: Dispatch<SetStateAction<Array<Account>>>
	) => {
		const providerKey = enumToProviderKeyPrefix(provider);
		fetch(`/api/truelayer/get_cards?providerKey=${providerKey}`)
			.then((res) => res.json())
			.then((val) =>
				setData(
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

	static getTrueLayerTransactionsList = (
		provider: Provider,
		accountID: string,
		setData: Dispatch<SetStateAction<Array<Transaction>>>
	) => {
		const providerKey = enumToProviderKeyPrefix(provider);
		fetch(
			`/api/truelayer/get_transactions?providerKey=${providerKey}&accountID=${accountID}`
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
				setData(transactions);
			});
	};
}

export default BankAccountStore;
