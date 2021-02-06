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
This module implements the IAPHUB API on top of the [react-native-iap](https://github.com/dooboolab/react-native-iap) module 👏

1. Create an account on [IAPHUB](https://www.iaphub.com)

2. Install the package
```js
// Install react-native-iap which is a required peer dependency (Be sure you install version 5.1.1)
npm install react-native-iap@5.1.1 --save-exact
// Install react-native-iaphub
npm install react-native-iaphub --save
// Update dependency on xcode (in the ios folder)
pod install
```

## Init
Call the `init` method at the start of your app to initialize your configuration<br/><br/>
ℹ️ It should be called as soon as possible when starting your app.

```js
  await Iaphub.init({
    // The app id is available on the settings page of your app
    appId: "5e4890f6c61fc971cf46db4d",
    // The (client) api key is available on the settings page of your app
    apiKey: "SDp7aY220RtzZrsvRpp4BGFm6qZqNkNf",
    // App environment (production by default, other environments must be created on the IAPHUB dashboard)
    environment: "production"
  });
```

## Set user id
Call the `setUserId` method to authenticate an user.<br/>

If you have an authentication system, provide the `user id` of the user right after the user log in.<br/>
If you don't and want to handle IAP on the client side, you can provide the `device id` when the app start instead by using a module such as [react-native-device-info](https://github.com/react-native-community/react-native-device-info#getuniqueid) to get a device unique ID.<br/>

⚠ You should provide an id that is non-guessable and isn't public. (Email not allowed)
```js
await Iaphub.setUserId("1e5494930c48ed07aa275fd2");
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

#### Product properties
| Prop  | Type | Description |
| :------------ |:---------------:| :-----|
| id | `string` | Product id (From IAPHUB) |
| type | `string` | Product type (Possible values: 'consumable', 'non_consumable', 'subscription', 'renewable_subscription') |
| sku | `string` | Product sku (Ex: "membership_tier1") |
| price | `string` | Localized price (Ex: "$12.99") |
| priceCurrency | `string` | Price currency code (Ex: "USD") |
| priceAmount | `number` | Price amount (Ex: 12.99) |
| title | `string` | Product title (Ex: "Membership") |
| description | `string` | Product description (Ex: "Join the community with a membership") |
| group | `string` | ⚠ Only available if the product as a group<br>Group id (From IAPHUB) |
| groupName | `string` | ⚠ Only available if the product as a group<br>Name of the product group created on IAPHUB (Ex: "premium") |
| purchase | `string` | ⚠ Only available for an active product<br> Purchase id (From IAPHUB) |
| purchaseDate | `string` | ⚠ Only available for an active product<br> Purchase date |
| subscriptionDuration | `string` | ⚠ Only available for a subscription<br> Duration of the subscription cycle specified in the ISO 8601 format (Possible values: 'P1W', 'P1M', 'P3M', 'P6M', 'P1Y') |
| expirationDate | `string` | ⚠ Only available for an active subscription<br> Subscription expiration date |
| autoResumeDate | `string` | ⚠ Only available for an android active subscription currently paused<br> Subscription resume date |
| isSubscriptionRenewable | `boolean` | ⚠ Only available for an active subscription<br> If the subscription can be renewed |
| subscriptionState | `string` | ⚠ Only available for an active subscription<br> State of the subscription<br>(Possible values: 'active', 'grace_period', 'retry_period', 'paused') |
| subscriptionPeriodType | `string` | ⚠ Only available for a subscription<br>Subscription period type (Possible values: 'normal', 'trial', 'intro')<br>If the subscription is active it is the current period otherwise it is the period if the user purchase the subscription |
| subscriptionIntroPrice | `string` | ⚠ Only available for a subscription with an introductory price<br>Localized introductory price (Ex: "$2.99") |
| subscriptionIntroPriceAmount | `number` | ⚠ Only available for a subscription with an introductory price<br>Introductory price amount (Ex: 2.99) |
| subscriptionIntroPayment | `string` | ⚠ Only available for a subscription with an introductory price<br>Payment type of the introductory offer (Possible values: 'as_you_go', 'upfront') |
| subscriptionIntroDuration | `string` | ⚠ Only available for a subscription with an introductory price<br>Duration of an introductory cycle specified in the ISO 8601 format (Possible values: 'P1W', 'P1M', 'P3M', 'P6M', 'P1Y') |
| subscriptionIntroCycles | `number` | ⚠ Only available for a subscription with an introductory price<br>Number of cycles in the introductory offer |
| subscriptionTrialDuration | `string` | ⚠ Only available for a subscription with a trial<br>Duration of the trial specified in the ISO 8601 format |

## Get active products
If you're relying on IAPHUB on the client side (instead of using your server with webhooks) to detect if the user has active products (renewable subscriptions or non-consumables), you should use the `getActiveProducts` method when the app is brought to the foreground.<br/>

⚠ If the request fails because of a network issue, the method returns the latest request in cache (if available with no expired subscription, otherwise an error is thrown).

⚠ If an active product is returned by the API but the sku cannot be loaded, the product will be returned but only with the properties coming from the [API](https://www.iaphub.com/docs/api/get-user/) (The price, title, description.... properties won't be returned).

```js
class App extends Component {

  state = {
    appState: AppState.currentState
  };

  componentDidMount() {
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this.handleAppStateChange);
  }

  handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      var products = await Iaphub.getActiveProducts();
      
      console.log(products);
      [{
        id: "5e5198930c48ed07aa275fd9",
        type: "renewable_subscription",
        sku: "membership1_tier5",
        purchase: "5e5198930c48ed07aa275fe8",
        purchaseDate: "2020-03-11T00:42:28.000Z",
        expirationDate: "2021-03-11T00:42:28.000Z",
        isSubscriptionRenewable: true,
        group: "3e5198930c48ed07aa275fd8",
        groupName: "subscription_group_1",
        title: "Membership",
        description: "Become a member of the community",
        price: "$4.99",
        priceAmount: 4.99,
        priceCurrency: "USD",
        subscriptionState: 'active',
        subscriptionDuration: "P1M",
        subscriptionPeriodType: "intro",
        subscriptionIntroPrice: "$1.99",
        subscriptionIntroPriceAmount: 1.99,
        subscriptionIntroPayment: "as_you_go",
        subscriptionIntroDuration: "P1M",
        subscriptionIntroCycles: 3
      }]
    }
    this.setState({ appState: nextAppState });
  };

  render() {
    return (
      <View>
        <Text>My app</Text>
      </View>
    );
  }
}
```

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
  var allActiveProducts = await iaphub.getActiveProducts({
    includeSubscriptionStates: ['retry_period', 'paused']
  });
```

## Buy a product
Call the ``buy`` method to buy a product<br/><br/>
ℹ️ The method needs the product sku that you would get from one of the products of `getProductsForSale()`.<br/>
ℹ️ The method will process a purchase as a subscription replace if you currently have an active subscription and you buy a subscription of the same group (product group created on IAPHUB).<br/>

```js
try {
  var transaction = await Iaphub.buy("pack10_tier15", {
    // Optional property to override the default proration mode on Android (https://developer.android.com/reference/com/android/billingclient/api/BillingFlowParams.ProrationMode)
    androidProrationMode: 1,
    // Optional callback triggered before the receipt is processed
    onReceiptProcess: (receipt) => {
      console.log('Purchase success, processing receipt...');
    }
  });
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
} catch (err) {
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
  /*
   * The receipt has been processed on IAPHUB but something went wrong
   * It is probably because of an issue with the configuration of your app or a call to the Itunes/GooglePlay API that failed
   * IAPHUB will send you an email notification when a receipt fails, by checking the receipt on the dashboard you'll find a detailed report of the error
   * After fixing the issue (if there's any), just click on the 'New report' button in order to process the receipt again
   * If it is an error contacting the Itunes/GooglePlay API, IAPHUB will retry to process the receipt automatically as well
   */
  else if (err.code == "receipt_validation_failed") {
    Alert.alert(
      "We're having trouble validating your transaction",
      "Give us some time, we'll retry to validate your transaction ASAP!"
    );
  }
  /*
   * The receipt has been processed on IAPHUB but is invalid
   * It could be a fraud attempt, using apps such as Freedom or Lucky Patcher on an Android rooted device
   */
  else if (err.code == "receipt_invalid") {
    Alert.alert(
      "Purchase error",
      "We were not able to process your purchase, if you've been charged please contact the support (support@myapp.com)"
    );
  }
  /*
   * The receipt hasn't been validated on IAPHUB (Could be an issue like a network error...)
   * The user will have to restore its purchases in order to validate the transaction
   * An automatic restore should be triggered on every relaunch of your app since the transaction hasn't been 'finished'
   * Android should automatically refund transactions that are not 'finished' after 3 days
   */
  else if (err.code == "receipt_request_failed") {
    Alert.alert(
      "We're having trouble validating your transaction",
      "Please try to restore your purchases later (Button in the settings) or contact the support (support@myapp.com)"
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
```

## Restore user purchases
Call the ``restore`` method to restore the user purchases<br/><br/>
ℹ️ You should display a restore button somewhere in your app (usually on the settings page).<br/>
ℹ️ If you logged in using the `device id`, an user using a new device will have to restore its purchases since the `device id` will be different.

```js
await Iaphub.restore();
```

## Full example

You should check out the [Example app](https://github.com/iaphub/react-native-iaphub/tree/master/Example).
<br/>

## FAQ

### I'm already validating receipts on my server, can I run receipt validation on both my server and IAPHUB?
Yes! It can be pretty handy if you want to:
- Slowly migrate over IAPHUB
- Give IAPHUB a try without shutting down your current receipt validation system
- Implement a fallback system to validate receipts when an error occurs
- Run both systems in parallel

It's easy to implement by using the `onReceiptProcessed` event that is triggered after IAPHUB processed a receipt
```js
  await Iaphub.init({
    appId: "5e4890f6c61fc971cf46db4d",
    apiKey: "SDp7aY220RtzZrsvRpp4BGFm6qZqNkNf",
    environment: "production"
    /*
     * Event triggered after IAPHUB processed a receipt
     * @param {Object} err Error object if the receipt processing failed (otherwise null)
     * @param {Object} receipt - Receipt object
     * @param {String} receipt.sku - Product sku
     * @param {String} receipt.token - Receipt token
     * @param {Boolean} receipt.isRestore - If the event is triggered from a restore
     */
    onReceiptProcessed: async (err, receipt) => {
      console.log(receipt);
      {
        sku: "pack10_tier15",
        token: "dzw4d....sd",
        isRestore: false
      }
      /*
       * Send the receipt to yout server
       * If you want to override the transaction returned by the buy method, your server must return the new transactions of the receipt
       * Warning: Do not return the old transactions already processed!
       */
      var newTransactions = await fetch("https://api.myapp.com/receipt", {
        method: "POST",
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify(receipt)
      });
      console.log(newTransactions);
      [{
        sku: "pack10_tier15"
      }]
      /*
       * If an array is returned by this function it'll override the receipt transactions returned by IAPHUB
       * For instance, below we only override the transactions if the receipt processing failed with an error
       * A transaction must contain at least the property 'sku' in order to identify the transaction that will be returned from the buy method
       */
      if (err) {
        return newTransactions;
      }
    }
  });
```
