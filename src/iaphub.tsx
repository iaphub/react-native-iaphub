import {Platform, NativeModules, NativeEventEmitter, EmitterSubscription} from 'react-native';

import config from './config';
import type Transaction from './models/transaction';
import type Product from './models/product';
import type ActiveProduct from './models/active-product';
import type BillingStatus from './models/billing-status';
import IaphubError from './models/iaphub-error';

const LINKING_ERROR =
  `The package 'react-native-iaphub' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const RNIaphub = NativeModules.RNIaphub
  ? NativeModules.RNIaphub
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

type Products = {productsForSale: Product[]; activeProducts: ActiveProduct[]};
type RestoreResponse = {newPurchases: Transaction[]; transferredActiveProducts: ActiveProduct[]};
type EventName = 'onUserUpdate' | 'onDeferredPurchase' | 'onError' | 'onBuyRequest' | 'onReceipt';

interface StartOptions {
  appId: string,
  apiKey: string,
  userId?: string,
  allowAnonymousPurchase?: boolean,
  enableDeferredPurchaseListener?: boolean,
  environment?: string
};

interface BuyOptions {
  crossPlatformConflict: boolean,
  prorationMode?: string
}

interface GetProductsOptions {
  includeSubscriptionStates: string[]
}

interface ShowManageSubscriptionsOptions {
  sku?: string
}

export default class Iaphub {

  nativeEventEmitter;
  errorListener?: EmitterSubscription;
  listeners: EmitterSubscription[] = [];

  constructor() {
    this.nativeEventEmitter = new NativeEventEmitter(NativeModules.RNIaphub);
    this.listeners = [];
  }

  /**
   * Add event listener
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
   * @param {String} appId App id that can be found on the IAPHUB dashboard
   * @param {String} apiKey Api key that can be found on the IAPHUB dashboard
   * @param {Boolean} allowAnonymousPurchase Option to allow purchases without being logged in
   * @param {Boolean} enableDeferredPurchaseListener Option to enable the onDeferredPurchase event (true by default)
   * @param {String} environment Option to specify a different environment than production
   * @returns {Promise<void>}
   */
  public async start(opts: StartOptions): Promise<void> {
    try {
      // Build sdk version (we dot not define it in StartOptions on purpose, it is private)
      var sdkVersion = config.version;
      if (opts["sdkVersion"]) {
        sdkVersion += "/" + opts["sdkVersion"];
      }
      // Clear listeners
      this.removeAllListeners();
      // Start IAPHUB
      await RNIaphub.start(Object.assign(opts, {sdkVersion: sdkVersion}));
      // Display product missing error
      this.errorListener = this.nativeEventEmitter.addListener("onError", (err) => {
        if (err.code == "unexpected" && err.subcode == "product_missing_from_store") {
          console.error(err.message);
        }
      });
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
      await RNIaphub.stop();
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
   * Log in user
   * @param {String} userId User id
   * @returns {Promise<void>}
   */
  public async login(userId: string): Promise<void> {
    try {
      await RNIaphub.login(userId);
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Ger user id
   * @returns {Promise<string>}
   */
   public async getUserId(): Promise<string> {
    try {
      var userId = await RNIaphub.getUserId();
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
      await RNIaphub.logout();
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Set device params
   * @param {Dict} params Device params
   * @returns {Promise<void>}
   */
  public async setDeviceParams(params: { [key: string]: any }): Promise<void> {
    try {
      await RNIaphub.setDeviceParams(params);
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Set user tags
   * @param {Dict} tags User tags
   * @returns {Promise<void>}
   */
  public async setUserTags(tags: { [key: string]: any }): Promise<void> {
    try {
      await RNIaphub.setUserTags(tags);
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Buy product
   * @param {String} sku Product sku
   * @param {Boolean} [crossPlatformConflict=true] Throws an error if the user has already a subscription on a different platform
   * @returns {Promise<Transaction>}
   */
  public async buy(sku: string, opts: BuyOptions = {crossPlatformConflict: true}): Promise<Transaction> {
    try {
      var transaction = await RNIaphub.buy(sku, opts);
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
      var response = await RNIaphub.restore();
      return response;
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Get active products
   * @param {String[]} [includeSubscriptionStates=[]] Include subscription states (only 'active' and 'grace_period' states are returned by default)
   * @returns {Promise<ActiveProduct[]>}
   */
  public async getActiveProducts(opts: GetProductsOptions = {includeSubscriptionStates: []}): Promise<ActiveProduct[]> {
    try {
      var products = await RNIaphub.getActiveProducts(opts);
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
      var products = await RNIaphub.getProductsForSale();
      return products;
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Get products (active and for sale)
   * @returns {Promise<Products>}
   */
  public async getProducts(opts: GetProductsOptions = {includeSubscriptionStates: []}): Promise<Products> {
    try {
      var products = await RNIaphub.getProducts(opts);
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
      var status = await RNIaphub.getBillingStatus();
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
      await RNIaphub.presentCodeRedemptionSheet();
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Show manage subscriptions page
   * @returns {Promise<void>}
   */
   public async showManageSubscriptions(opts: ShowManageSubscriptionsOptions = {sku: undefined}): Promise<void> {
    try {
      await RNIaphub.showManageSubscriptions(opts);
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

}