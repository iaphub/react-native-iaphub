import {decorate, observable} from 'mobx';
import {Alert} from 'react-native';
import Iaphub from 'react-native-iaphub';

class IAPStore {

	isInitialized = false;
	skuProcessing = null;
	user = null;

	// Init IAPHUB
	async init() {
		try {
			// Init iaphub
			await Iaphub.init({
				// The app id is available on the settings page of your app
				appId: "5e4890f6c61fc971cf46db4d",
				// The (client) api key is available on the settings page of your app
				apiKey: "SDp7aY220RtzZrsvRpp4BGFm6qZqNkNf",
				/*
				 * Event called before a receipt is validated with the IAPHUB server
				 * @param {Object} receipt Receipt
				 * @param {String} opts.sku - Product sku
				 * @param {String} opts.token - Receipt token
				 * @param {Boolean} opts.isRestore - If the receipt processsing has been triggered by a restore
				 */
				onReceiptProcess: async (receipt) => {
					/*
					 * If you're already validating IAP receipts on your server and you would to run IAPHUB in parallel, you could send the receipt to your server right here
					 *
					 * await fetch("https://api.myapp.com/receipt", {
					 * 	method: "POST",
					 *	headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
					 *	body: JSON.stringify(receipt)
					 * });
					 */
				},
				/*
				 * Event called when the validation of the receipt failed
				 * @param {Object} err Native JS Error object with an extra 'code' property in order to identify the error
				 * @param {Object} receipt Receipt
				 * @param {String} opts.sku - Product sku
				 * @param {String} opts.token - Receipt token
				 * @param {Boolean} opts.isRestore - If the receipt processsing has been triggered by a restore
				 */
				onReceiptError: async (err, receipt) => {
					// You probably don't want to display these alerts in the case of a restore
					if (receipt.isRestore) return;
	
					/*
					 * The receipt has been saved on IAPHUB but the validation has failed
					 * It could be an error validating the receipt with Gplay/Itunes, an issue with the conf of your app like a misconfigured product...
					 * You can get more informations about the failed receipt on the IAPHUB dashboard
					 * If possible IAPHUB will retry processing the receipt at multiple intervals (You can do it manually as well from the dashboard)
					 */
					if (err.code == "receipt_validation_error") {
						Alert.alert(
							"We're having trouble validating your transaction",
							"Give us some time, we'll retry to validate your transaction ASAP!"
						);
					}
					/*
					 * The receipt hasn't been sent to IAPHUB, could be something like a network issue...
					 * The user will have to restore its purchases in order to validate the transaction
					 * An automatic restore should be triggered on every relaunch of your app since the transaction hasn't been 'finished'
					 * Android should automatically refund transactions that are not 'finished' after 3 days
					 */
					else {
						Alert.alert(
							"We're having trouble validating your transaction",
							"Please try to restore your purchases later (Button in the settings) or contact the support (support@myapp.com)"
						);
					}
					this.skuProcessing = null;
				},
				/*
				 * Event called when a purchase has been processed successfully
				 * @param {Object} purchase Purchase
				 * @param {String} opts.type - Product type
				 * @param {String} opts.sku - Product sku
				 * @param {Date} opts.purchaseDate - Date of purchase
				 */
				onPurchaseSuccess: async (purchase) => {
					/*
					 * The purchase has been successful but we need to check that we webhook to our server was successful as well
					 * IAPHUB will retry sending the webhook 3 more times after 10 minutes, 1 hour and 24 hours
					 * You can retry the webhook directly from the dashboard as well
					 */
					if (purchase.webhookStatus == "failed") {
						Alert.alert(
							"Purchase delayed",
							"Your purchase was successful but we need some more time to validate it, should be ready soon! Otherwise contact the support (support@myapp.com)"
						);
					}
					// Everything was successful! Yay!
					else {
						Alert.alert(
							"Purchase successful",
							"Your purchase has been processed successfully!"
						);
					}
					this.skuProcessing = null;
					// Refresh the user (Just to refresh the active subscriptions)
					this.user = await Iaphub.getUser();
				},
				/*
				 * Event called when a purchase has failed (before getting the receipt)
				 * @param {Object} err Native JS Error object with an extra 'code' property in order to identify the error
				 */
				onPurchaseError: (err) => {
					// Popup cancelled by the user
					if (err.code == "E_USER_CANCELLED") {
						// You probably don't need to be anything in that case
					}
					// Couldn't buy product because it has been bought in the past but hasn't been consumed (restore needed)
					else if (err.code == "E_ALREADY_OWNED") {
						Alert.alert(
							"Product already owned",
							"Please restore your purchases in order to fix that issue",
							[
								{text: 'Cancel', style: 'cancel'},
								{text: 'Restore', onPress: () => Iaphub.restore()}
							]
						);
					}
					// Couldn't buy product for many other reasons (the user shouldn't be charged)
					else {
						Alert.alert(
							"Purchase error",
							"We were not able to process your purchase, please try again later or contact the support (support@myapp.com)"
						);
					}
					this.skuProcessing = null;
				}
			});
			// Iaphub is now initialized and ready to use
			this.isInitialized = true;
		} catch (err) {
			console.error(err);
			// The init has failed (the error code is available in the 'err.code' property)
			// You probably forgot to specify an option (appId, apiKey...)
			// Or the user is not allowed to make payments, IOS only (Error code: 'billing_disabled')
			// Or the billing system is unavailable, it may be a problem with the device or Itunes/Play Store is down (Error code: 'billing_unavailable')
			// Or it is an unknown error, probably the native library of react-native-iap that is not installed properly (Error code: 'billing_error')
		}
	}

	// Login user
	async login(userId) {
		// Login with user id
		Iaphub.login(userId);
		// Get the user
		this.user = await Iaphub.getUser();
	}

	// Logout user
	logout() {
		Iaphub.logout();
	}

	// Call this method when an user click on one of your products
	async buy(productSku) {
		try {
			this.skuProcessing = productSku;
			await Iaphub.buy(productSku);
		} catch (err) {
			this.skuProcessing = null;
		}
	}

	// Call this method to restore the user purchases (you should have a button, it is usually displayed on the settings page)
	async restore() {
		var restoredPurchases = await Iaphub.restore();

		Alert.alert("Restore", `${restoredPurchases.length} purchases restored`);
	}

}

decorate(IAPStore, {
	isInitialized: observable,
	skuProcessing: observable,
	products: observable,
	user: observable
})
export default new IAPStore();