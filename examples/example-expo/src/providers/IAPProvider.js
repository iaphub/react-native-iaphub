import { useState, useCallback, useMemo, createContext, useContext } from 'react';
import {Alert} from 'react-native';
import Iaphub from 'react-native-iaphub';
import pkg from '../../package.json';

// Create a context for the IAP store
const IAPStoreContext = createContext();

// Provider component that manages the IAP state
export const IAPStoreProvider = ({ children }) => {
	const [isInitialized, setIsInitialized] = useState(false);
	const [skuProcessing, setSkuProcessing] = useState(null);
	const [productsForSale, setProductsForSale] = useState(null);
	const [activeProducts, setActiveProducts] = useState(null);
	const [billingStatus, setBillingStatus] = useState(null);

	// Refresh products
	const refreshProducts = useCallback(async () => {
		try {
			// Refresh products
			const products = await Iaphub.getProducts();
			setActiveProducts(products.activeProducts ? [...products.activeProducts] : []);
			setProductsForSale(products.productsForSale ? [...products.productsForSale] : []);
			console.log('activeProducts: ', products.activeProducts);
			console.log('productsForSale: ', products.productsForSale);
			// Resfresh billing status
			setBillingStatus(await Iaphub.getBillingStatus());
		}
		catch (err) {
			console.error(err);
		}
	}, []);

	// Init IAPHUB
	const init = useCallback(async () => {
		// Init iaphub2
		await Iaphub.start({
			// The app id is available on the settings page of your app
			appId: "5e4890f6c61fc971cf46db4d",
			// The (client) api key is available on the settings page of your app
			apiKey: "SDp7aY220RtzZrsvRpp4BGFm6qZqNkNf",
			// Allow anonymous purchase
			allowAnonymousPurchase: true,
			// Enable StoreKit V2 if supported by the phone (iOS 15+)
			enableStorekitV2: true,
			// Add lang
			lang: "en"
		});
		// Add device params
		await Iaphub.setDeviceParams({appVersion: pkg.version});
		// Listen to user updates and refresh productsForSale/activeProducts
		Iaphub.addEventListener('onUserUpdate', async () => {
			console.log("-> Got user update");
			await refreshProducts();
		});
		Iaphub.addEventListener('onDeferredPurchase', async (transaction) => {
			console.log("-> Got deferred purchase: ", transaction);
		});
		Iaphub.addEventListener('onError', async (err) => {
			console.log("-> Got err: ", err);
		});
		Iaphub.addEventListener('onReceipt', async (receipt) => {
			//console.log("-> Got receipt: ", receipt);
		});
		Iaphub.addEventListener('onBuyRequest', async (opts) => {
			console.log("-> Got buy request: ", opts);
		});
		// Iaphub is now initialized and ready to use
		setIsInitialized(true);
	}, [refreshProducts]);

	// Login
	const login = useCallback(async (userId) => {
		await Iaphub.login(userId);
	}, []);

	// Logout
	const logout = useCallback(async () => {
		await Iaphub.logout();
		setProductsForSale(null);
		setActiveProducts(null);
	}, []);

	// Call this method when an user click on one of your products
	const buy = useCallback(async (productSku) => {
		try {
			setSkuProcessing(productSku);
			var transaction = await Iaphub.buy(productSku);
			console.log('purchase: ', transaction);
			setSkuProcessing(null);
			// The webhook could not been sent to my server (Only needed if you're relying on webhooks)
			if (transaction.webhookStatus == "failed") {
				Alert.alert(
					"Purchase delayed",
					"Your purchase was successful but we need some more time to validate it, should arrive soon! Otherwise contact the support (support@myapp.com)"
				);
			}
			// Everything was successful! Yay!
			else {
				Alert.alert(
					"Purchase successful",
					"Your purchase has been processed successfully!"
				);
			}
		} catch (err) {
			// Stop loading
			setSkuProcessing(null);
			// Display error
			var errors = {
				// Couldn't buy product because it has been bought in the past but hasn't been consumed (restore needed)
				"product_already_owned": "Product already owned, please restore your purchases in order to fix that issue",
				// The payment has been deferred (its final status is pending external action such as 'Ask to Buy')
				"deferred_payment": "Purchase awaiting approval, your purchase has been processed but is awaiting approval",
				// The billing is unavailable (An iPhone can be restricted from accessing the Apple App Store)
				"billing_unavailable": "In-app purchase not allowed",
				// The remote server couldn't be reached properly
				"network_error": "Network error, please try to restore your purchases later (Button in the settings) or contact the support (support@myapp.com)",
				// The receipt has been processed on IAPHUB but something went wrong
				"receipt_failed": "We're having trouble validating your transaction, give us some time, we'll retry to validate your transaction ASAP",
				// The user has already an active subscription on a different platform (android or ios)
				"cross_platform_conflict": "It seems like you already have a subscription on a different platform, please use the same platform to change your subscription or wait for your current subscription to expire",
				// The transaction is successful but the product belongs to a different user
				"user_conflict": "Product owned by a different user, please use the account with which you originally bought the product or restore your purchases",
				// Unknown
				"unexpected": "We were not able to process your purchase, please try again later or contact the support (support@myapp.com)"
			};
			var errorsToIgnore = ["user_cancelled", "product_already_purchased"];
			var errorMessage = errors[err.code];

			if (!errorMessage && errorsToIgnore.indexOf(err.code) == -1) {
				errorMessage = errors["unexpected"];
			}
			if (errorMessage) {
				Alert.alert("Error", errorMessage);
			}
		}
	}, []);

	// Call this method to restore the user purchases (you should have a button, it is usually displayed on the settings page)
	const restore = useCallback(async () => {
		var response = await Iaphub.restore();
		console.log("Response response: ", response);
		Alert.alert("Restore", "Purchases restored");
	}, []);

	// Call this method to show the subscriptions page
	const showManageSubscriptions = useCallback(async () => {
		await Iaphub.showManageSubscriptions();
	}, []);

	// Call this method to present the ios code redemption sheet
	const presentCodeRedemptionSheet = useCallback(async () => {
		await Iaphub.presentCodeRedemptionSheet();
	}, []);

	const value = useMemo(() => ({
		isInitialized,
		skuProcessing,
		productsForSale,
		activeProducts,
		billingStatus,
		init,
		login,
		logout,
		refreshProducts,
		buy,
		restore,
		showManageSubscriptions,
		presentCodeRedemptionSheet
	}), [
		isInitialized,
		skuProcessing,
		productsForSale,
		activeProducts,
		billingStatus,
		init,
		login,
		logout,
		refreshProducts,
		buy,
		restore,
		showManageSubscriptions,
		presentCodeRedemptionSheet
	]);

	return (
		<IAPStoreContext.Provider value={value}>
			{children}
		</IAPStoreContext.Provider>
	);
};

// Hook to use the IAP store
export const useIAPStore = () => {
	const context = useContext(IAPStoreContext);
	if (!context) {
		throw new Error('useIAPStore must be used within an IAPStoreProvider');
	}
	return context;
};
