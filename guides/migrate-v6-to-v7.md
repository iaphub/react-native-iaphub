## Migrate react-native-iaphub 6.X.X to 7.X.X

The version 7 of react-native-iaphub is a major update, the library is now using the latest version of our [iOS](https://github.com/iaphub/iaphub-ios-sdk) and [Android](https://github.com/iaphub/iaphub-android-sdk) SDKs.

```js
// Install react-native-iaphub
npm install react-native-iaphub@latest --save
// Update dependency on xcode (in the ios folder)
pod install
```

Here is what it'll change for you:

### The react-native-iap dependency isn't necessary anymore
The library is now using our [iOS](https://github.com/iaphub/iaphub-ios-sdk) and [Android](https://github.com/iaphub/iaphub-android-sdk) SDKs, you can uninstall the dependency.

### New methods

- The `init` method has been renamed to `start`
- The `setUserId` method has been renamed to `login`
- The `logout` method has been created

### New properties

- The property `price` has been renamed to `localizedPrice`
- The property `priceCurrency` has been renamed to `currency`
- The property `priceAmount` has been renamed to `price`
- The property `title` has been renamed to `localizedTitle`
- The property `description` has been renamed to `localizedDescription`
- The property `subscriptionIntroPrice` has been renamed to `subscriptionIntroLocalizedPrice`
- The property `subscriptionIntroPrice` is now returning the introductory price amount (number)

### Errors enhanced

The error sytem has been enhanced.<br/>
An error still has the property `code` but we added added an extra property `subcode` in order to get more details about the error.<br/>
Some errors have been renamed, you can check the updated [code example to buy a product](https://github.com/iaphub/react-native-iaphub#buy-a-product).

### New authentication system

**In the version 6** of the library it wasn't possible to display the products or purchase a product without authenticating the user.<br/>
The apps that do not have an authentication system had to call the `setUserId` method using the device ID coming from the react-native-device-info plugin.

**The new version** is now supporting anonymous users by default, you'll be able to display the products or purchase a product without authenticating the user using the `login` method. IAPHUB will automatically generate a anonymous user id (prefixed with 'a:').<br/>

We also implemented a security to prevent anonymous purchases by default (an error 'anonymous_purchase_not_allowed' will be returned), you'll just have to enable the option `allowAnonymousPurchase` (in the options of the start method).

Another amazing feature is that the products bought by an anonymous user (not logged in) will be automatically transferred to his new user id when he logs in!

You can also easily log out the user using our new `logout` method.

### ⚠ For users that were already using the device ID in production

If you are currently using the device ID to authenticate your users in production, the active subscriptions you currently have are linked to the device IDs of your users.
Which means the users that will use your brand new app update using react-native-iaphub 7.X.X won't be able to access their active subscriptions since they'll now have a different user id.

In order to prevent that, you can call the `login` method and provide the device ID of the user to the method.<br/>
You won't be able to use our new 'anonymous users' feature but it'll allow you to have a smooth migration.

If you would like to completely migrate to our new system you'll have to ask the users to restore their in-app purchases (restore() method).<br/>
It'll automatically transfer the purchases owned by the device ID to the anonymous user id.

### Need help?

If you have any questions you can of course contact us at `support@iaphub.com`.