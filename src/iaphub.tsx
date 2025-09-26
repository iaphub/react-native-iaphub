import {NativeEventEmitter, EmitterSubscription, Platform} from 'react-native';

import config from './config';
import IaphubError from './models/iaphub-error';
import type {
  ActiveProduct,
  BillingStatus,
  BuyOptions,
  EventName,
  Product,
  GetProductsOptions,
  Products,
  RestoreResponse,
  Transaction,
  ShowManageSubscriptionsOptions,
  StartOptions,
} from './types';

import {NativeIaphub} from './nativeModules';

export default class Iaphub {

  nativeEventEmitter;
  errorListener?: EmitterSubscription;
  listeners: EmitterSubscription[] = [];

  constructor() {
    this.nativeEventEmitter = new NativeEventEmitter(NativeIaphub as any);
    this.listeners = [];
  }

  /**
   * Add event listener
   * @param name Native event emitted by the SDK.
   * @param callback Handler invoked with the event payload.
   */
  public addEventListener(name: EventName, callback: (data: any) => void): EmitterSubscription {
    const subscription = this.nativeEventEmitter.addListener(name, (data: any) => {
      if (name == "onError") {
        data = new IaphubError(data);
      }
      callback(data);
    });

    this.listeners.push(subscription);
    return subscription;
  }

  /**
   * Remove event listener
   * @param listener Subscription returned by `addEventListener`.
   */
  public removeEventListener(listener: EmitterSubscription): boolean {
    var index = this.listeners.indexOf(listener);

    if (index === -1) return false;
    this.listeners[index].remove();
    this.listeners.splice(index, 1);

    return true;
  }

  /**
   * Remove all listeners
   */
  public removeAllListeners(): void {
    this.listeners.forEach((listener) => listener.remove());
    this.listeners = [];
  }

  /**
   * Start Iaphub
   * @param opts Overall configuration object.
   * @param opts.appId IAPHUB app ID from the IAPHUB dashboard.
   * @param opts.apiKey IAPHUB Client API key from the IAPHUB dashboard.
   * @param opts.userId Optional user ID associated with the authenticated account.
   * @param opts.allowAnonymousPurchase Whether anonymous purchases are permitted; defaults to `false`.
   * @param opts.enableDeferredPurchaseListener Toggles the deferred purchase listener; defaults to `true`.
   * @param opts.enableStorekitV2 Enables StoreKit V2 when available (iOS 15+); defaults to `false` but enabling it is recommended.
   * @param opts.lang Locale code to localize product titles and descriptions defined on the IAPHUB dashboard (defaults to `en`).
   * @param opts.environment Target Iaphub environment; defaults to `production`.
   * @returns {Promise<void>}
   */
  public async start(opts: StartOptions): Promise<void> {
    try {
      // Build sdk version (we dot not define it in StartOptions on purpose, it is private)
      const internalOpts = opts as StartOptions & {sdkVersion?: string};
      let sdkVersion = config.version;
      if (internalOpts.sdkVersion) {
        sdkVersion += `/${internalOpts.sdkVersion}`;
      }
      // Clear listeners
      this.removeAllListeners();
      // Start IAPHUB
      const nativeOptions = {
        ...opts,
        sdkVersion,
      };
      await NativeIaphub.start(nativeOptions);
      // Display product missing error
      this.errorListener = this.nativeEventEmitter.addListener("onError", (err) => {
        if (err.code == "unexpected" && err.subcode == "product_missing_from_store") {
          console.error(err.message);
        }
      });
      // Check SDK version
      var nativeSDKVersion = NativeIaphub.getSDKVersion ? await NativeIaphub.getSDKVersion() : null;
      if (Platform.OS == "ios" && nativeSDKVersion != config.iosSDKVersion) {
        console.error(`The "react-native-iaphub" plugin requires the native IAPHUB iOS SDK version ${config.iosSDKVersion}.\n\nTo fix this issue:\nRun \`pod update Iaphub\` in the ios folder of your project to update the IAPHUB iOS SDK to the required version.`);
      }
      else if (Platform.OS == "android" && nativeSDKVersion != config.androidSDKVersion) {
        console.error(`The "react-native-iaphub" plugin requires the native IAPHUB Android SDK version ${config.androidSDKVersion}.\n\nTo fix this issue:\nRebuild your Android project to update the dependencies with the correct SDK version.`);
      }
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Stop Iaphub
   * @returns {Promise<void>}
   */
  public async stop(): Promise<void> {
    try {
      // Clear listeners
      this.removeAllListeners();
      // Stop IAPHUB
      await NativeIaphub.stop();
      // Remove error listener
      if (this.errorListener) {
        this.errorListener.remove();
      }
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Set lang
   * @param {String} lang Locale code (for example `en` or `fr`).
   * @returns {Promise<boolean>}
   */
  public async setLang(lang: string): Promise<boolean> {
    try {
      var result = await NativeIaphub.setLang(lang);
      return result;
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Log in user
   * @param {String} userId Unique identifier of the user.
   * @returns {Promise<void>}
   */
  public async login(userId: string): Promise<void> {
    try {
      await NativeIaphub.login(userId);
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Get user id
   * @returns {Promise<string>}
   */
   public async getUserId(): Promise<string> {
    try {
      var userId = await NativeIaphub.getUserId();
      return userId;
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Log out user
   * @returns {Promise<void>}
   */
  public async logout(): Promise<void> {
    try {
      await NativeIaphub.logout();
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Set device params
   * @param {Dict} params Key/value pairs with additional device metadata.
   * @returns {Promise<void>}
   */
  public async setDeviceParams(params: { [key: string]: any }): Promise<void> {
    try {
      await NativeIaphub.setDeviceParams(params);
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Set user tags
   * @param {Dict} tags Key/value pairs describing the user.
   * @returns {Promise<void>}
   */
  public async setUserTags(tags: { [key: string]: any }): Promise<void> {
    try {
      await NativeIaphub.setUserTags(tags);
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Buy product
   * @param {String} sku Store identifier to purchase.
   * @param opts Purchase configuration (`crossPlatformConflict` defaults to `true`).
   * @param opts.crossPlatformConflict Throws an error if the user already has a subscription on a different platform; defaults to `true`.
   * @param opts.prorationMode Optional Google Play proration mode to apply when upgrading or downgrading.
   * @returns {Promise<Transaction>}
   */
  public async buy(sku: string, opts: BuyOptions = {crossPlatformConflict: true}): Promise<Transaction> {
    try {
      var transaction = await NativeIaphub.buy(sku, opts);
      return transaction
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Restore purchases
   * @returns {Promise<RestoreResponse>}
   */
  public async restore(): Promise<RestoreResponse> {
    try {
      var response = await NativeIaphub.restore();
      return response;
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Get active products
   * @param opts Optional filters (default `includeSubscriptionStates` is an empty array, meaning only active and grace period subscriptions are returned).
   * @returns {Promise<ActiveProduct[]>}
   */
  public async getActiveProducts(opts: GetProductsOptions = {includeSubscriptionStates: []}): Promise<ActiveProduct[]> {
    try {
      var products = await NativeIaphub.getActiveProducts(opts);
      return products;
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Get products for sale
   * @returns {Promise<Product[]>}
   */
  public async getProductsForSale(): Promise<Product[]> {
    try {
      var products = await NativeIaphub.getProductsForSale();
      return products;
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Get products (active and for sale)
   * @param opts Optional filters (default `includeSubscriptionStates` is an empty array).
   * @param opts.includeSubscriptionStates List of subscription states to include in addition to `active` and `grace_period`.
   * @returns {Promise<Products>}
   */
  public async getProducts(opts: GetProductsOptions = {includeSubscriptionStates: []}): Promise<Products> {
    try {
      var products = await NativeIaphub.getProducts(opts);
      return products;
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Get billing status
   * @returns {Promise<BillingStatus>}
   */
   public async getBillingStatus(): Promise<BillingStatus> {
    try {
      var status = await NativeIaphub.getBillingStatus();
      return status;
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Present code redemption (iOS only)
   * @returns {Promise<void>}
   */
  public async presentCodeRedemptionSheet(): Promise<void> {
    try {
      await NativeIaphub.presentCodeRedemptionSheet();
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Show manage subscriptions page
   * @param opts Optional parameters such as the SKU to highlight.
   * @param opts.sku SKU to highlight when opening the native page.
   * @returns {Promise<void>}
   */
   public async showManageSubscriptions(opts: ShowManageSubscriptionsOptions = {sku: undefined}): Promise<void> {
    try {
      await NativeIaphub.showManageSubscriptions(opts);
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

}
