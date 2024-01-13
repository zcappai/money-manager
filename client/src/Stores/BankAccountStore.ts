import moment from "moment";
import { Dispatch, SetStateAction } from "react";
import { Provider } from "../Enums/BankAccountEnums";
import { enumToProviderID } from "../Helpers/BankAccountHelper";
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
			.then((val) => window.open(val.authURL ? val.authURL : "", "_blank"));
	};

	static checkAuthorisationStatus = (
		accessToken: string,
		setData: Dispatch<Partial<AuthenticationStatusType>>
	) => {
		fetch(`/api/truelayer/connection_metadata?accessToken=${accessToken}`)
			.then((res) => res.json())
			.then((val) =>
				setData({
					authenticated: val.results[0].consent_status === "AUTHORISED",
					clientID: val.results[0].client_id,
				})
			);
	};

	static getAccountList = (
		accessToken: string,
		setData: Dispatch<SetStateAction<Array<Account>>>
	) => {
		fetch(`/api/truelayer/get_cards?accessToken=${accessToken}`)
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
		accessToken: string,
		accountID: string,
		setData: Dispatch<SetStateAction<Array<Transaction>>>
	) => {
		fetch(
			`/api/truelayer/get_transactions?accessToken=${accessToken}&accountID=${accountID}`
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
