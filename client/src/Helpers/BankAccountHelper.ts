import { Provider } from "../Enums/BankAccountEnums";

export const enumToProviderID = (provider: Provider) => {
	switch (provider) {
		case Provider.AmericanExpress:
			return "uk-ob-amex";
		case Provider.HSBC:
			return "uk-ob-hsbc";
		case Provider.Monzo:
			return "uk-ob-monzo";
		case Provider.Revolut:
			return "uk-ob-revolut";
		case Provider.Starling:
			return "uk-ob-starling";
		default:
			throw new Error(`Unknown provider: ${provider}`);
	}
};

export const enumToProviderName = (provider: Provider) => {
	switch (provider) {
		case Provider.AmericanExpress:
			return "American Express";
		case Provider.HSBC:
			return "HSBC";
		case Provider.Monzo:
			return "Monzo";
		case Provider.Revolut:
			return "Revolut";
		case Provider.Starling:
			return "Starling";
		default:
			throw new Error(`Unknown provider: ${provider}`);
	}
};

export const enumToAuthStatus = (provider: Provider) => {
	switch (provider) {
		case Provider.AmericanExpress:
			return "AUTHORISED";
		case Provider.HSBC:
			return "Authorised";
		case Provider.Monzo:
			return "Monzo";
		case Provider.Revolut:
			return "Revolut";
		case Provider.Starling:
			return "Starling";
		default:
			throw new Error(`Unknown provider: ${provider}`);
	}
};

export const enumToProviderKeyPrefix = (provider: Provider) => {
	switch (provider) {
		case Provider.AmericanExpress:
			return "AMEX";
		case Provider.HSBC:
			return "HSBC";
		case Provider.Monzo:
			return "MONZO";
		case Provider.Revolut:
			return "REVOLUT";
		case Provider.Starling:
			return "STARLING";
		default:
			throw new Error(`Unknown provider: ${provider}`);
	}
};
