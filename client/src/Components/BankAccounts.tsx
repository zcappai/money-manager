import { Tabs, TabsPanel } from "@salesforce/design-system-react";
import React from "react";
import { Provider } from "../Enums/BankAccountEnums";
import { enumToProviderName } from "../Helpers/BankAccountHelper";
import BankAccount from "./BankAccount";

const BankAccounts = () => {
	return (
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
	);
};

export default BankAccounts;
