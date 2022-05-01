<a href="https://www.iaphub.com" title="IAPHUB">
  <img width=882px src="https://www.iaphub.com/img/github/github-rn-ad.png" alt="IAPHUB">
</a>
<br/>
<br/>

![npm](https://img.shields.io/npm/dt/react-native-iaphub)
![npm](https://img.shields.io/npm/dm/react-native-iaphub)
<a href="https://shoutem.com" target="_blank">
  <img height="48px" src="https://iaphub.com/img/github/github-shoutem.png?v=4" alt="Shoutem">
</a>

Implementing and developping all the tools to manage your In-App purchases properly can be very complex and time consuming.
You should spend this precious time building your app!
<br/>
<br/>

[IAPHUB](https://www.iaphub.com) has all the features you need to increase your sales 🚀

|   | Features |
| --- | --- |
📜 | Receipt validation - Send the receipt, we'll take care of the rest.
📨 | Webhooks - Receive webhooks directly to your server to be notified of any event such as a purchase or a subscription cancellation.    
📊 | Realtime Analytics - Out of the box insights of on all your sales, subscriptions, customers and everything you need to improve your revenues.
🧪 | A/B Testing - Test different pricings and get analytics of which one performs the best.
🌎 | Product Segmentation - Offer different product or pricings to your customers depending on defined criterias such as the country.
👤 | Customer Management - Access easily the details of a customer, everything you need to know such as the past transactions and the active subscriptions on one page.

## Getting started

Implementing In-app purchases in your app should be a piece of cake!<br/>

1. Create an account on [IAPHUB](https://www.iaphub.com)

2. Install the package
```js
// Install react-native-iaphub
npm install react-native-iaphub --save
// Update dependency on xcode (in the ios folder)
pod install
```

3. Make sure the **In-App purchases capability** of your ios project is enabled on XCode

4. Setup your sandbox environment ([ios](https://www.iaphub.com/docs/set-up-ios/configure-sandbox-testing) / [android](https://www.iaphub.com/docs/set-up-android/configure-sandbox-testing))

<br>

⚠ If you're migrating from v6.X.X to v7.X.X, read [this](https://github.com/iaphub/react-native-iaphub/tree/master/guides/migrate-v6-to-v7.md).

## Start
Call the `start` method in order to initialize IAPHUB.<br/><br/>
ℹ️ It should be called as soon as possible when starting your app.

```js
  await Iaphub.start({
    // The app id is available on the settings page of your app
    appId: "5e4890f6c61fc971cf46db4d",
    // The (client) api key is available on the settings page of your app
    apiKey: "SDp7aY220RtzZrsvRpp4BGFm6qZqNkNf",
    // Optional app environment (production by default, other environments must be created on the IAPHUB dashboard)
    environment: "production",
    // Optional, ff you want to allow purchases when the user has an anonymous user id
    // If you're listenning to IAPHUB webhooks your implementation must support users with anonymous user ids
    // This option is disabled by default, when disabled the buy method will return an error when the user isn't logged in
    allowAnonymousPurchase: true
  });
```

## Events
Call the `addEventListener` method to listen to an event and `removeEventListener` to stop listening to an event.<br/>

#### onUserUpdate - Event triggered when the user products have been updated
```js
  // Listen to the user update event in order to know when the activeProducts/productsForSale are updated
  var listener = Iaphub.addEventListener('onUserUpdate', async () => {
    // TODO here: Refresh the state of your products in order to refresh the screen
    // You can use the getActiveProducts/getProductsForSale methods to get the updated products
  });
  // You can also unlisten the event
  Iaphub.removeEventListener(listener);
```

#### onBuyRequest - Event triggered when a purchase intent is made from outside the app (like a promoted In-App purchase)
```js
  // Add listener
  var listener = Iaphub.addEventListener('onBuyRequest', async (sku) => {
    // If you want to allow/disallow a purchase intent (to wait until the user is logged in for example) you can implement this method
    // You'll have to call the buy method whenever you're ready
    // Also note you'll have a callback to know when the transaction is done (you woudn't otherwise)
    var transaction = await Iaphub.buy(sku);
    console.log("Purchase done: ", transaction);
  });
  // Remove listener
  Iaphub.removeEventListener(listener);
```

#### onError - Event triggered when IAPHUB has detected an error
```js
  // Add listener
  var listener = Iaphub.addEventListener('onError', async (err) => {
    // You'll catch any error here (even errors thrown by IAPHUB methods)
    console.log("Error: ", err.message);
  });
  // Remove listener
  Iaphub.removeEventListener(listener);
```

#### onReceipt - Event triggered after a receipt has been processed
```js
  // Add listener
  var listener = Iaphub.addEventListener('onReceipt', async (data) => {
    console.log("Receipt err: ", data.err);
    console.log("Receipt data: ", err.receipt);
  });
  // Remove listener
  Iaphub.removeEventListener(listener);
```

ℹ️ You can also remove all the listeners by using the method `removeAllListeners()`

## Login
Call the `login` method to authenticate a user.<br/>

⚠ When a user isn't logged he's considered *anonymous*, we'll generate automatically a anonymous user id (prefixed with 'a:')

⚠ You should provide an id that is non-guessable and isn't public. (Email not allowed)

⚠ The user will be reset, `setOnUserUpdateListener` will only be called until after the user has been loaded first (using getProductsForSale/getActiveProducts).<br/>

```js
await Iaphub.login("1e5494930c48ed07aa275fd2");
```

## Logout
Call the `logout` method to log the user out.<br/>
The user will switch back to his anonymous user id (prefixed with 'a:').<br/>

⚠ The user will be reset, `setOnUserUpdateListener` will only be called until after the user has been loaded first (using getProductsForSale/getActiveProducts).<br/>

```js
Iaphub.logout()
```

## Set user tags
Call the `setUserTags` method to update the user tags.<br/>
User tags will appear on the user page of the IAPHUB dashboard.<br/>
When using IAPHUB's smart listings, you'll be able to return different products depending on the user tags.

```js
// To set a tag
await Iaphub.setUserTags({status: 'vip'});
// To clear the user tags
await Iaphub.setUserTags({status: null});
```

A few details:
  - A tag must be created on the IAPHUB dashboard (otherwise the method will throw an error)
  - When creating a tag on the IAPHUB dashboard you must check the option to allow editing the tag from the client (otherwise you'll only be able to edit the tag using the [IAPHUB API](https://www.iaphub.com/docs/api/post-user) from your server)
  - A tag key is limited to 32 characters
  - A tag value is limited to 64 characters

## Set device params
Call the `setDeviceParams` method to set parameters for the device<br/>
When using IAPHUB's smart listings, you'll be able to return different products depending on the device params.

```js
// For instance you can provide the app version on app launch
// Useful to return a product only supported in a new version
Iaphub.setDeviceParams({appVersion: '1.2.0'});
// To clear the device params
Iaphub.setDeviceParams({});
```

A few details:
  - The params are not saved on the device, they won't persist if the app is restarted
  - The params are not saved on IAPHUB, they are just provided to the API when fetching the products for sale
  - A param key limited to 32 characters and must be a valid key (``^[a-zA-Z_]*$``)
  - A param value limited to 32 characters
  - You can provide up to 5 params

## Get products for sale
Call the ``getProductsForSale`` method to get the user's products for sale<br/>
You should use this method when displaying the page with the list of your products for sale.

⚠ If the request fails because of a network issue, the method returns the latest request in cache (if available, otherwise an error is thrown).

⚠ If a product is returned by the [API](https://www.iaphub.com/docs/api/get-user/) but the sku cannot be loaded, it'll be filtered from the list and an error message will be displayed in the console

```js
var products = await Iaphub.getProductsForSale();

console.log(products);
[
  {
    id: "5e5198930c48ed07aa275fd9",
    type: "renewable_subscription",
    sku: "membership2_tier10",
    group: "3e5198930c48ed07aa275fd8",
    groupName: "subscription_group_1",
    title: "Membership",
    description: "Become a member of the community",
    price: "$9.99",
    priceAmount: 9.99,
    priceCurrency: "USD",
    subscriptionPeriodType: "normal",
    subscriptionDuration: "P1M"
  },
  {
    id: "5e5198930c48ed07aa275fd9",
    type: "consumable",
    sku: "pack10_tier15",
    title: "Pack 10",
    description: "Pack of 10 coins",
    price: "$14.99",
    priceAmount: 14.99,
    priceCurrency: "USD"
  }
]
```

## Get active products
If you're relying on IAPHUB on the client side (instead of using your server with webhooks) to detect if the user has active products (auto-renewable subscriptions, non-renewing subscriptions or non-consumables), you should use the `getActiveProducts` method.<br/>

⚠ If the request fails because of a network issue, the method returns the latest request in cache (if available with no expired subscription, otherwise an error is thrown).

⚠ If an active product is returned by the API but the sku cannot be loaded, the product will be returned but only with the properties coming from the [API](https://www.iaphub.com/docs/api/get-user/) (The price, title, description.... properties won't be returned).

#### Subscription state

Value | Description |
| :------------ |:---------------
| active | The subscription is active
| grace_period | The subscription is in the grace period, the user should still access the features offered by your subscription
| retry_period | The subscription is in the retry period, you must restrict the access to the features offered by your subscription and display a message asking for the user to update its payment informations.
| paused | The subscription is paused (Android only) and will automatically resume at a later date (`autoResumeDate` property), you must restrict the access to the features offered by your subscription.

By default only subscriptions with an `active` or `grace_period` state are returned by the `getActiveProducts()` method because you must restrict the access to the features offered by your subscription on a `retry_period` or `paused` state.<br/>
<br/>
If you're looking to display a message when a user has a subscription on a `retry_period` or `paused` state, you can use the `includeSubscriptionStates` option.
```js
  var allActiveProducts = await Iaphub.getActiveProducts({
    includeSubscriptionStates: ['retry_period', 'paused']
  });
```

## Get all products
You can also get the products for sale and active products using one method `getProducts()`

```js
  var data = await Iaphub.getProducts();
  console.log("Products for sale: ", data.productsForSale);
  console.log("Active products: ", data.activeProducts);
```

## Buy a product
Call the ``buy`` method to buy a product<br/><br/>
ℹ️ The method needs the product sku that you would get from one of the products of `getProductsForSale()`.<br/>
ℹ️ The method will process a purchase as a subscription replace if you currently have an active subscription and you buy a subscription of the same group (product group created on IAPHUB).<br/>

```js
try {
  var transaction = await Iaphub.buy("pack10_tier15");
  console.log(transaction);
  {
    id: "2e5198930c48ed07aa275fd3",
    type: "consumable",
    sku: "pack10_tier15",
    purchase: "4e5198930c48ed07aa275fd2",
    purchaseDate: "2020-03-11T00:42:27.000Z",
    webhookStatus: "success",
    group: "3e5198930c48ed07aa275fd8",
    groupName: "pack",
    title: "Pack 10",
    description: "Pack of 10 coins",
    price: "$14.99",
    priceAmount: 14.99,
    priceCurrency: "USD"
  }

  /*
   * The purchase has been successful but we need to check that the webhook to our server was successful as well
   * If the webhook request failed, IAPHUB will send you an alert and retry again in 1 minute, 10 minutes, 1 hour and 24 hours.
   * You can retry the webhook directly from the dashboard as well
   */
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
}
catch (err) {
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
    // The receipt has been processed on IAPHUB but is invalid, it could be a fraud attempt, using apps such as Freedom or Lucky Patcher on an Android rooted device
    "receipt_invalid": "We were not able to process your purchase, if you've been charged please contact the support (support@myapp.com)",
    /*
     * The user has already an active subscription on a different platform (android or ios)
     * This security has been implemented to prevent a user from ending up with two subscriptions of different platforms
     * You can disable the security by providing the 'crossPlatformConflict' parameter to the buy method (Iaphub.buy(sku, {crossPlatformConflict: false}))
     */
    "cross_platform_conflict": "It seems like you already have a subscription on a different platform, please use the same platform to change your subscription or wait for your current subscription to expire",
    /*
     * The transaction is successful but the product belongs to a different user
     * You should ask the user to use the account with which he originally bought the product or ask him to restore its purchases in order to transfer the previous purchases to the new account
     */
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
```

#### Proration mode (Android only)

You can specify the proration mode when replacing a subscription.

```js
var transaction = await Iaphub.buy("membership_tier1", {
  prorationMode: 'immediate_and_charge_prorated_price'
});
```

Value | Description |
| :------------ |:---------------
| immediate_with_time_proration | The replacement takes effect immediately, the remaining time will be prorated for the new subscription. **(default)**
| immediate_and_charge_prorated_price | The replacement takes effect immediately, the price of the previous subscription will be prorated (partial refund).
| immediate_without_proration | The replacement takes effect immediately with no extra charge, the new price will be charged on next recurrence time.
| deferred | The replacement takes effect when the current subscription expires

## Restore user purchases
Call the ``restore`` method to restore the user purchases<br/><br/>
ℹ️ You must display a button somewhere in your app in order to allow the user to restore its purchases.<br/>

```js
await Iaphub.restore();
```

## Present code redemption sheet (iOS only)
Call the ``presentCodeRedemptionSheet`` to display a sheet that enable users to redeem subscription offer codes that you configure in App Store Connect<br/><br/>

```js
await Iaphub.presentCodeRedemptionSheet();
```

## Properties

### Product
| Prop  | Type | Description |
| :------------ |:---------------:| :-----|
| id | `string` | Product id (From IAPHUB) |
| type | `string` | Product type (Possible values: 'consumable', 'non_consumable', 'subscription', 'renewable_subscription') |
| sku | `string` | Product sku (Ex: "membership_tier1") |
| price | `number` | Price amount (Ex: 12.99) |
| currency | `string` | Price currency code (Ex: "USD") |
| localizedPrice | `string` | Localized price (Ex: "$12.99") |
| localizedTitle | `string` | Product title (Ex: "Membership") |
| localizedDescription | `string` | Product description (Ex: "Join the community with a membership") |
| group | `string` | ⚠ Only available if the product as a group<br>Group id (From IAPHUB) |
| groupName | `string` | ⚠ Only available if the product as a group<br>Name of the product group created on IAPHUB (Ex: "premium") |
| subscriptionPeriodType | `string` | ⚠ Only available for a subscription<br>Subscription period type (Possible values: 'normal', 'trial', 'intro')<br>If the subscription is active it is the current period otherwise it is the period if the user purchase the subscription |
| subscriptionDuration | `string` | ⚠ Only available for a subscription<br> Duration of the subscription cycle specified in the ISO 8601 format (Possible values: 'P1W', 'P1M', 'P3M', 'P6M', 'P1Y') |
| subscriptionIntroPrice | `number` | ⚠ Only available for a subscription with an introductory price<br>Introductory price amount (Ex: 2.99) |
| subscriptionIntroLocalizedPrice | `string` | ⚠ Only available for a subscription with an introductory price<br>Localized introductory price (Ex: "$2.99") |
| subscriptionIntroPayment | `string` | ⚠ Only available for a subscription with an introductory price<br>Payment type of the introductory offer (Possible values: 'as_you_go', 'upfront') |
| subscriptionIntroDuration | `string` | ⚠ Only available for a subscription with an introductory price<br>Duration of an introductory cycle specified in the ISO 8601 format (Possible values: 'P1W', 'P1M', 'P3M', 'P6M', 'P1Y') |
| subscriptionIntroCycles | `number` | ⚠ Only available for a subscription with an introductory price<br>Number of cycles in the introductory offer |
| subscriptionTrialDuration | `string` | ⚠ Only available for a subscription with a trial<br>Duration of the trial specified in the ISO 8601 format |

### ActiveProduct (inherit from Product)
| Prop  | Type | Description |
| :------------ |:---------------:| :-----|
| purchase | `string` | Purchase id (From IAPHUB) |
| purchaseDate | `string` | Purchase date |
| platform | `string` | Platform of the purchase (Possible values: 'ios', 'android') |
| expirationDate | `string` | Subscription expiration date |
| isSubscriptionRenewable | `boolean` | True if the auto-renewal is enabled |
| subscriptionRenewalProduct | `string` | Subscription product id of the next renewal (only defined if different than the current product) |
| subscriptionRenewalProductSku | `string` | Subscription product sku of the next renewal |
| subscriptionState | `string` | State of the subscription<br>(Possible values: 'active', 'grace_period', 'retry_period', 'paused') |
| androidToken | `string` | ⚠ Only available for an android purchase<br>Android purchase token of the transaction |

### ReceiptTransaction (inherit from ActiveProduct)
| Prop  | Type | Description |
| :------------ |:---------------:| :-----|
| webhookStatus | `string` | Webhook status (Possible values: 'success', 'failed', 'disabled') |
| user | `string` | User id (From IAPHUB) |

### Error
| Prop  | Type | Description |
| :------------ |:---------------:| :-----|
| message | `string` | Error message |
| code | `string` | Error code |
| subcode | `string` | Error code |
| params | `object` | Error params |

## Full example

You should check out the [Example app](https://github.com/iaphub/react-native-iaphub/tree/master/Example).
<br/>