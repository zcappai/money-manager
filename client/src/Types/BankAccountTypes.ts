export type AuthenticationStatusType = {
	authenticated: boolean;
	clientID: string | null;
	clientIP: string | null;
	userID: string | null;
};

export type Account = {
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

export type Transaction = {
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

// export type AuthorisationType = {
// 	accessToken: string | null | null;
// 	clientID: string | null;
// 	expiresIn: number | null;
// 	refreshToken: string | null;
// 	scope: string | null;
// 	tokenType: string | null;
// };
