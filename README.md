<a href="https://www.iaphub.com" title="IAPHUB link">
  <img width=882px src="https://www.iaphub.com/github-rn-ad.png" alt="IAPHUB logo">
</a>
<br/>
<br/>
Implementing and developping all the tools to manage your In-App purchases properly can be very complex and time consuming.
You should spend this precious time building your app!
<br/>
<br/>

[IAPHUB](https://www.iaphub.com) has all the features you need to increase your sales 🚀

|   | Features |
| --- | --- |
📜 | Receipt validation - Send the receipt, we'll take care of the rest.
📨 | Webhooks - Receive webhooks to your server to be notified when you have a purchase, a new subscription, a cancelled subscription, a refund...    
📊 | Analytics - Out of the box insights of on all your sales, subscriptions, customers and everything you need to improve your revenues!
🧪 | A/B Testing - Test different pricings and get analytics of which one performs the best.
🌎 | Product segmentation - Offer different product or pricings to your customers depending on defined criterias such as the country!
👤 | Customer management - Access your customer sales, active subscriptions, analytics... in one click.

## Getting started

Implementing In-app purchases in your app should be a piece of cake!<br/>
This module implements the IAPHUB API on top of the [react-native-iap](https://github.com/dooboolab/react-native-iap) module 👏

1. Create an account on [IAPHUB](https://www.iaphub.com)
<br/>

2. Install the package
``
npm install react-native-iaphub@latest --save
``
<br/>

3. Call the ``init`` method at the start of your app to initialize your configuration<br/><br/>
   *It should be called as soon as possible, no event will be triggered until you call the ``login`` method.<br/>
   (This method won't send any request to the IAPHUB API)*

  ```js
    await Iaphub.init({
      // The app id is available on the settings page of your app
      appId: "5e4890f6c61fc971cf46db4d",
      // The (client) api key is available on the settings page of your app
      apiKey: "SDp7aY220RtzZrsvRpp4BGFm6qZqNkNf",
      // The environment is used to determine the webhooks configuration ('production', 'staging', 'development')
      environment: "production",
      /*
       * Event called when a receipt validation has been successful
       * @param {Object} receipt Receipt
       * @param {String} opts.sku - Product sku
       * @param {String} opts.token - Receipt token
       * @param {Boolean} opts.isRestore - If the receipt processsing has been triggered by a restore
       */
      onReceiptSuccess: async (receipt) => {
        console.log(receipt);
        {
          sku: "pack10_tier15",
          token: "dzw4d....sd",
          isRestore: false
        }
      },
      /*
       * Event called when the validation of the receipt failed
       * @param {Object} err Error object with an extra 'code' property in order to identify the error
       * @param {Object} receipt Receipt
       * @param {String} opts.sku - Product sku
       * @param {String} opts.token - Receipt token
       * @param {Boolean} opts.isRestore - If the receipt processsing has been triggered by a restore
       */
      onReceiptError: async (err, receipt) => {
        // You probably do not want to display any alert in the case of a restore
        if (receipt.isRestore) return;
        /*
         * The receipt has been processed on IAPHUB but something went wrong
         * It is probably because of an issue with the configuration of your app or a call to the Itunes/GooglePlay API that failed
         * IAPHUB will send you an email notification when a receipt fails, by checking the receipt on the dashboard you'll find a detailed report of the error
         * After fixing the issue (if there's any), just click on the 'New report' button in order to process the receipt again
         * If it is an error contacting the Itunes/GooglePlay API, IAPHUB will retry to process the receipt automatically as well
         */
        if (err.code == "receipt_validation_error") {
          Alert.alert(
            "We're having trouble validating your transaction",
            "Give us some time, we'll retry to validate your transaction ASAP!"
          );
        }
        /*
         * The receipt hasn't been validated on IAPHUB (Could be an issue like a network error...)
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
      },
      /*
       * Event called when a purchase has been processed successfully
       * @param {Object} purchase Purchase
       * @param {String} opts.id - Id of the purchase
       * @param {String} opts.type - Product type
       * @param {String} opts.sku - Product sku
       * @param {Date} opts.purchaseDate - Date of purchase
       * @param {String} opts.webhookStatus - Status of the webhook ("success", "failed" or "disabled" if the webhooks are not enabled)
       */
      onPurchaseSuccess: async (purchase) => {
        console.log(purchase);
        {
          id: "2e5198930c48ed07aa275fd3",
          type: "consumable",
          sku: "pack10_tier15",
          purchaseDate: "2020-03-11T00:42:27.000Z",
          webhookStatus: "success"
        }
        /*
         * The purchase has been successful but we need to check that the webhook to our server was successful as well
         * If the webhook request failed, IAPHUB will send you an alert and retry again in 1 minute, 10 minutes, 1 hour and 24 hours.
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
      },
      /*
       * Event called when a purchase has failed (before getting the receipt)
       * @param {Object} err Error object with an extra 'code' property in order to identify the error
       */
      onPurchaseError: (err) => {
        // Popup cancelled by the user (ios only)
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
      }
    });
  ```
<br/>

4. Call the `login` method after an user log in<br/><br/>
   *You must provide the `user id` in order to identify the user.<br/>
   After a successful login, you'll be able to receive purchase events, and call methods such as `getUser` and `buy`.<br/>
   You can logout the user using the `logout` method.<br/>
   (This method won't send any request to the IAPHUB API)*

  ```js
  await Iaphub.login("1e5494930c48ed07aa275fd2");
  ```
<br/>

5. Call the `setUserTags` to update the user tags<br/><br/>
   *Before using this method you must create the tag on the dashboard.<br/>
   Tags are a powerful tool that allows you to offer to your users different products depending on custom properties.<br/>
   (This method will send a request to the IAPHUB API)*

  ```js
  await Iaphub.setUserTags({gender: 'male'});
  ```
<br/>

6. Call the ``getUser`` method to fetch the user profile<br/><br/>
  *The user profile contains the active products (subscriptions not expired yet or non-consumables) and the products for sale of the user (the products the user is able to buy).<br/>
  (This method will send a request to the IAPHUB API)*

  ```js
  var user = await Iaphub.getUser();
  
  console.log(user);
  {
    // The products the user bought that are still active (subscriptions or non-consumables)
    activeProducts: [{
      id: "5e5198930c48ed07aa275fd9",
      type: "renewable_subscription",
      sku: "membership1_tier5",
      purchase: "5e5198930c48ed07aa275fe8",
      purchaseDate: "2020-03-11T00:42:28.000Z",
      expirationDate: "2021-03-11T00:42:28.000Z",
      isSubscriptionRenewable: true,
      isSubscriptionRetryPeriod: false,
      groupName: "subscription_group_1",
      title: "Membership",
      description: "Become a member of the community"
      localizedPrice: "$4.99",
      introductoryPrice: "$1.99",
      price: 4.99,
      currency: "USD"
    }],
    // The products the user is able to buy
    productsForSale: [
      {
        id: "5e5198930c48ed07aa275fd9",
        type: "renewable_subscription",
        sku: "membership2_tier10",
        groupName: "subscription_group_1",
        title: "Membership",
        description: "Become a member of the community",
        localizedPrice: "$9.99",
        price: 9.99,
        currency: "USD"
      },
      {
        id: "5e5198930c48ed07aa275fd9",
        type: "consumable",
        sku: "pack10_tier15",
        title: "Pack 10",
        description: "Pack of 10 coins",
        localizedPrice: "$14.99",
        price: 14.99,
        currency: "USD"
      }
    ]
  }
  ```
<br/>

7. Call the ``buy`` method to buy a product<br/><br/>
  *This method only needs the product sku that you would get from one of the products of the user productsForSale array.<br/>
  This method will trigger the onPurchaseProcessing/onPurchaseSuccess events and onPurchaseError event (if there is any error) defined in the init options.<br/>
  (This method will send a request to the IAPHUB API)*

  ```js
  await Iaphub.buy("pack10_tier15");
  ```
<br/>

8. Call the ``restore`` method to restore the user purchases<br/><br/>
   *This method will only return the transactions that were not already on IAPHUB (pretty handy to know how many transactions have been restored).<br/>
   You should display a restore button somewhere in your app (usually on the settings page).<br/>
   (This method will only send a request to the IAPHUB API if there is a receipt to validate)*

  ```js
  var restoredPurchases = await Iaphub.restore();
  
  console.log(restoredPurchases);
  [{
    id: "5e5198930c48ed07aa275fd9",
    type: "renewable_subscription",
    sku: "membership1_tier5",
    expirationDate: "2021-03-11T00:42:28.000Z",
    isSubscriptionRenewable: true,
    isSubscriptionRetryPeriod: false,
    webhookStatus: "success"
  }]
  ```
<br/>

9. Call the `logout` method after an user log out<br/><br/>
   *Any purchase event will be saved in a queue until the user log in.<br/>
   (This method won't send any request to the IAPHUB API)*

  ```js
  await Iaphub.logout();
  ```
<br/>

## Full example

You should check out the [Example app](https://github.com/iaphub/react-native-iaphub/tree/master/Example).
<br/><br/>

## FAQ

### I'm already validating receipts on my server, can I run receipt validation on both `MY SERVER` and `IAPHUB`?
Yes! It can be pretty handy if you want to:
- Slowly migrate over IAPHUB
- Give IAPHUB a try without shutting down your current receipt validation system
- Implement a fallback system to validate receipts when an error occurs
- Run both systems in parallel

It's easy to implement by using the `onReceiptSuccess` and `onReceiptError` events.
```js
  await Iaphub.init({
    // ... Other configuration properties required (See example above)

    /*
     * This event will be called when the receipt has been successfully validated on IAPHUB
     * You can use it in order to send the receipt to your server as well
     */
    onReceiptSuccess: async (receipt) => {
      // Send the receipt to my server
      await fetch("https://api.myapp.com/receipt", {
        method: "POST",
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify(receipt)
      });
    },
    /*
     * This event will be called when the receipt validation has failed on IAPHUB
     * You can use it in order to implement a fallback to validate the receipt with your server in case of an unexpected error
     */
    onReceiptError: async (err, receipt) => {
      if (err.code == "receipt_validation_error") {
        /*
         * The receipt has been processed on IAPHUB but something went wrong
         * It is probably because of an issue with the configuration of your app or a call to the Itunes/GooglePlay API that failed
         * IAPHUB will send you an email notification when a receipt fails, by checking the receipt on the dashboard you'll find a detailed report of the error
         * After fixing the issue (if there's any), just click on the 'New report' button in order to process the receipt again
         * If it is an error contacting the Itunes/GooglePlay API, IAPHUB will retry to process the receipt automatically as well
         */
      }
      else {
        // The receipt hasn't been validated on IAPHUB (Could be an issue like a network error...)
      }
      // Send the receipt to my server
      try {
        var response = await fetch("https://api.myapp.com/receipt", {
          method: "POST",
          headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
          body: JSON.stringify(receipt)
        });
        response = await response.json();
        /*
         * If the validation with your server is successful you must return an array of the new transactions
         * Each transaction must contains the sku and the product type ('consumable', 'non_consumable', 'subscription', 'renewable_subscription')
         * The type is required in order to consume or acknowledge the purchase!
         * Each transaction will trigger the 'onPurchaseSuccess' event
         */
        if (response.status == 'success') {
          console.log(response.newTransactions);
          [{sku: 'pack10_tier15', type: 'consumable'}]

          return response.newTransactions;
        }
        // Otherwise the purchase won't be consumed/acknowledged, display an alert to the user
        else {
          Alert.alert(
            "We're having trouble validating your transaction",
            "Please try to restore your purchases later (Button in the settings) or contact the support (support@myapp.com)"
          );
        }
      }
      // If the request failed, display an alert to the user
      catch (err) {
        Alert.alert(
          "We're having trouble validating your transaction",
          "Please try to restore your purchases later (Button in the settings) or contact the support (support@myapp.com)"
        );
      }
    }
  });
```
