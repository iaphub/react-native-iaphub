import {decorate, observable} from 'mobx';
import {Alert} from 'react-native';
import Iaphub from 'react-native-iaphub';
import pkg from '../../package.json';

class IAPStore {

	isInitialized = false;
	skuProcessing = null;
	productsForSale = null;
	activeProducts = null;

	// Init IAPHUB
	async init() {
		try {
			// Init iaphub
			await Iaphub.init({
				// The app id is available on the settings page of your app
				appId: "5e4890f6c61fc971cf46db4d",
				// The (client) api key is available on the settings page of your app
				apiKey: "SDp7aY220RtzZrsvRpp4BGFm6qZqNkNf",
				// The environment is used to determine the webhooks configuration ('production', 'staging', 'development')
				environment: "production"
			});
			// Add device params
			Iaphub.setDeviceParams({appVersion: pkg.version});
			// Iaphub is now initialized and ready to use
			this.isInitialized = true;
			// Listen to user updates and refresh productsForSale/activeProducts
			Iaphub.addEventListener('onUserUpdate', async () => {
				await this.refreshProducts();
			});
		} catch (err) {
			console.error(err);
			// The init has failed (the error code is available in the 'err.code' property)
			// You probably forgot to specify an option (appId, apiKey...)
			// Or the user is not allowed to make payments, IOS only (Error code: 'billing_disabled')
			// Or the billing system is unavailable, it may be a problem with the device or Itunes/Play Store is down (Error code: 'billing_unavailable')
			// Or it is an unknown error, probably the native library of react-native-iap that is not installed properly (Error code: 'billing_error')
		}
	}

	// Set user id
	async setUserId(userId) {
		Iaphub.setUserId(userId);
	}

	// Refresh products
	async refreshProducts() {
		try {
			this.activeProducts = await Iaphub.getActiveProducts();
			this.productsForSale = await Iaphub.getProductsForSale();
		} catch (err) {
			console.error(err);
		}
	}

	// Call this method when an user click on one of your products
	async buy(productSku) {
		try {
			this.skuProcessing = productSku;
			var transaction = await Iaphub.buy(productSku, {onReceiptProcess: () => console.log('-> Processing receipt')});
			this.skuProcessing = null;
			// The webhook could not been sent to my server
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
			this.skuProcessing = null;
			// Purchase popup cancelled by the user (ios only)
			if (err.code == "user_cancelled") return
			// Couldn't buy product because it has been bought in the past but hasn't been consumed (restore needed)
			else if (err.code == "product_already_owned") {
				Alert.alert(
					"Product already owned",
					"Please restore your purchases in order to fix that issue",
					[
						{text: 'Cancel', style: 'cancel'},
						{text: 'Restore', onPress: () => Iaphub.restore()}
					]
				);
			}
			// The payment has been deferred (its final status is pending external action such as 'Ask to Buy')
			else if (err.code == "deferred_payment") {
				Alert.alert(
					"Purchase awaiting approval",
					"Your purchase has been processed but is awaiting approval"
				);
			}
			// The receipt has been processed on IAPHUB but something went wrong
			else if (err.code == "receipt_validation_failed") {
				Alert.alert(
					"We're having trouble validating your transaction",
					"Give us some time, we'll retry to validate your transaction ASAP!"
				);
			}
			// The receipt hasn't been validated on IAPHUB (Could be an issue like a network error...)
			else if (err.code == "receipt_request_failed") {
				Alert.alert(
					"We're having trouble validating your transaction",
					"Please try to restore your purchases later (Button in the settings) or contact the support (support@myapp.com)"
				);
			}
			// The user has already an active subscription on a different platform (android or ios)
			else if (err.code == "cross_platform_conflict") {
				Alert.alert(
					`Seems like you already have a subscription on ${err.params.platform}`,
					`Please use the same platform to change your subscription or wait for your current subscription to expire`
				);
			}
			// Couldn't buy product for many other reasons (the user shouldn't be charged)
			else {
				Alert.alert(
					"Purchase error",
					"We were not able to process your purchase, please try again later or contact the support (support@myapp.com)"
				);
			}
		}
	}

	// Call this method to restore the user purchases (you should have a button, it is usually displayed on the settings page)
	async restore() {
		await Iaphub.restore();
		Alert.alert("Restore", "Purchases restored");
	}

}

decorate(IAPStore, {
	isInitialized: observable,
	skuProcessing: observable,
	productsForSale: observable,
	activeProducts: observable
})
export default new IAPStore();