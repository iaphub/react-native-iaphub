declare module 'react-native-iaphub' {
  export type IapHubEnvironment = 'production' | 'staging' | 'development';

  export type IapHubProductTypes = 'consumable' | 'non_consumable' | 'subscription' | 'renewable_subscription';

  /***
   * PER_1_WEEK = 'P1W',
   * PER_1_MONTH = 'P1M',
   * PER_3_MONTHS = 'P3M',
   * PER_6_MONTHS = 'P6M',
   * PER_1_YEAR = 'P1Y'
   **/
  export type IapHubSubscriptionPeriod = 'P1W' | 'P1M' | 'P3M' | 'P6M' | 'P1Y';

  export type IapHubSubscriptionPeriodType = 'normal' | 'trial' | 'intro';

  export type IapHubIntroductoryPaymentType = 'as_you_go' | 'upfront';

  export type IapHubWebhookStatus = 'failed' | 'success';

  export type IapHubPurchaseErrorCodes =
    'user_cancelled'
    | 'product_already_owned'
    | 'receipt_validation_failed'
    | 'receipt_request_failed'
    | 'billing_unavailable'
    | 'item_unavailable'
    | 'remote_error'
    | 'network_error'
    | 'receipt_failed'
    | 'receipt_finish_failed'
    | 'developer_error'
    | 'deferred_payment'
    | 'unknown';

//#region Interfaces
  interface IapHubInitOptions {
    /**
     * The app id is available on the settings page of your app
     */
    appId: string;

    /**
     * The (client) api key is available on the settings page of your app
     */
    apiKey: string;

    /**
     * App environment (production by default, other environments must be created on the IAPHUB dashboard)
     */
    environment: IapHubEnvironment;

    /**
     * Event triggered after IAPHUB processed a receipt
     * @param err It will be undefined when there is no errors. If there any error it returns Error object.
     * @param receipt Receipt returning from purchase process
     */
    onReceiptProcessed?: (err: Error, receipt: IapHubReceipt) => Promise<void>;
  }

  interface IapHubProductInformation {
    /**
     * Product id (From IAPHUB)
     */
    id: string;

    /**
     * Product type
     */
    type: IapHubProductTypes;

    /**
     * Product sku (Ex: "membership_tier1")
     */
    sku: string;

    /**
     * Localized price (Ex: "$12.99")
     */
    price: string;

    /**
     * Price currency code (Ex: "USD")
     */
    priceCurrency: string;

    /**
     * Price amount (Ex: 12.99)
     */
    priceAmount: number;

    /**
     * Product title (Ex: "Membership")
     */
    title: string;

    /**
     * Product description (Ex: "Join the community with a membership")
     */
    description: string;

    /**
     * Group id - ⚠ Only available if the product as a group
     */
    group?: string;

    /**
     * Name of the product group created on IAPHUB (Ex: "premium") - ⚠ Only available if the product as a group
     */
    groupName?: string;

    /**
     * Purchase id (From IAPHUB) - ⚠ Only available for an active product
     */
    purchase?: string;

    /**
     * Purchase date - ⚠ Only available for an active product
     */
    purchaseDate?: string;

    /**
     * Duration of the subscription cycle specified in the ISO 8601 format (Possible values: 'P1W', 'P1M', 'P3M', 'P6M', 'P1Y') - ⚠ Only available for a subscription
     */
    subscriptionDuration?: IapHubSubscriptionPeriod;

    /**
     * Subscription expiration date - ⚠ Only available for an active subscription
     */
    expirationDate?: string;

    /**
     * If the subscription can be renewed - ⚠ Only available for an active subscription
     */
    isSubscriptionRenewable?: boolean;

    /**
     * If the subscription is currently in a retry period - ⚠ Only available for an active subscription
     */
    isSubscriptionRetryPeriod?: boolean;

     /**
     * If the subscription is currently in a grace period - ⚠ Only available for an active subscription
     */
    isSubscriptionGracePeriod?: boolean;

    /**
     * If the subscription is active it is the current period otherwise it is the period if the user purchase the subscription - ⚠ Only available for a subscription
     */
    subscriptionPeriodType?: IapHubSubscriptionPeriodType;

    /**
     * Localized introductory price (Ex: "$2.99") - ⚠ Only available for a subscription with an introductory price
     */
    subscriptionIntroPrice?: string;

    /**
     * Introductory price amount (Ex: 2.99) - ⚠ Only available for a subscription with an introductory price
     */
    subscriptionIntroPriceAmount?: string;


    /**
     * Payment type of the introductory offer - ⚠ Only available for a subscription with an introductory price
     */
    subscriptionIntroPayment?: IapHubIntroductoryPaymentType;

    /**
     * Duration of an introductory cycle specified in the ISO 8601 format - ⚠ Only available for a subscription with an introductory price
     */
    subscriptionIntroDuration?: IapHubSubscriptionPeriod;

    /**
     * Number of cycles in the introductory offer - ⚠ Only available for a subscription with an introductory price
     */
    subscriptionIntroCycles?: number;

    /**
     * Duration of the trial specified in the ISO 8601 format - ⚠ Only available for a subscription with a trial
     */
    subscriptionTrialDuration?: string;
  }

  interface IapHubProductInformationWithWebhook extends IapHubProductInformation {
    /**
     * webhookStatus The purchase has been successful but we need to check that the webhook to our server was successful as well
     * If the webhook request failed, IAPHUB will send you an alert and retry again in 1 minute, 10 minutes, 1 hour and 24 hours.
     * You can retry the webhook directly from the dashboard as well
     */
    webhookStatus: IapHubWebhookStatus;
  }

  interface IapHubUserTags {
    /**
     * Tags you want to assign to user.
     */
    [TagKey: string]: any;
  }

  interface IapHubReceipt {
    /**
     * Product sku
     */
    sku: string;

    /**
     * Receipt token
     */
    token: string;

    /**
     * If the event is triggered from a restore
     */
    isRestore: string;
  }

//#endregion

//#region Methods
  /**
   * Call the init method at the start of your app to initialize your configuration
   *
   * ℹ️ It should be called as soon as possible when starting your app.
   * @param Options Initialization options.
   */
  export function init(Options: IapHubInitOptions): Promise<void>;

  /***
   * Call the `setUserId` method to authenticate an user.
   *
   * If you have an authentication system, provide the `user id` of the user right after the user log in.
   * If you don't and want to handle IAP on the client side, you can provide the `device id` when the app start instead by using a module such as [react-native-device-info](https://github.com/react-native-community/react-native-device-info#getuniqueid) to get a device unique ID.
   *
   * ⚠ You should provide an id that is non-guessable and isn't public. (Email not allowed)
   * @param UniqueUserId Non-guessable unique identifier of user.
   */
  export function setUserId(UniqueUserId: string | null): Promise<void>;

  /***
   * Call the ``getProductsForSale`` method to get the products for sale.
   *
   * You should use this method when displaying the page with the list of your products for sale.
   * ⚠ If the request fails because of a network issue, the method returns the latest request in cache (if available, otherwise an error is thrown).
   */
  export function getProductsForSale(): Promise<IapHubProductInformation[]>;

  /***
   * If you're relying on IAPHUB on the client side (instead of using your server with webhooks) to detect if the user has active products (renewable subscriptions or non-consumables), you should use the `getActiveProducts` method when the app is brought to the foreground.
   *
   * ⚠ If the request fails because of a network issue, the method returns the latest request in cache (if available, otherwise an error is thrown).
   */
  export function getActiveProducts(): Promise<IapHubProductInformation[]>;

  /***
   * Call the setUserTags method to update the user tags
   *
   * Tags are a powerful tool that allows you to offer to your users different products depending on custom properties.
   * ⚠ This method will throw an error if the tag name hasn't been created on the IAPHUB dashboard
   * @param Tags Tags you want to assign to the user.
   */
  export function setUserTags(Tags: IapHubUserTags): Promise<void>;

  /***
   * Call the buy method to buy a product
   *
   * ℹ️ The method needs the product sku that you would get from one of the products of the user productsForSale array.
   * @param ProductSKU SKU of product. - ⚠ Buying a product that isn't in the productsForSale array will throw an error.
   */
  export function buy(ProductSKU: string): Promise<IapHubProductInformationWithWebhook>;

  /***
   * Call the restore method to restore the user purchases
   *
   * This method will return the transactions that were not already saved on IAPHUB.
   * ℹ️ You should display a restore button somewhere in your app (usually on the settings page).
   * ℹ️ If you logged in using the device id, an user using a new device will have to restore its purchases since the device id will be different.
   */
  export function restore(): Promise<IapHubProductInformation[]>;

//#endregion

  export type {
    IapHubInitOptions,
    IapHubUserTags,
    IapHubProductInformation,
    IapHubProductInformationWithWebhook,
    IapHubReceipt
  };
}
