import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BankAccountStore from "../Stores/BankAccountStore";

const Callback = () => {
	const codeFetched = useRef<boolean>(false);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		try {
			if (
				location.pathname.includes("truelayer_callback") &&
				!codeFetched.current
			) {
				codeFetched.current = true;
				const params = new URLSearchParams(location.search);
				const code = params.get("code");
				if (code) {
					BankAccountStore.exchangeAuthCode(code, () => navigate("/"));
				}
			} else return;
		} catch (err) {
			console.error(err);
			navigate("/");
		}
	}, [location.pathname, location.search, navigate]);
	return <></>;
};

export default Callback;
