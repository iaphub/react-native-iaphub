import {Platform, NativeModules, NativeEventEmitter, EmitterSubscription} from 'react-native';

import config from './config';
import type Transaction from './models/transaction';
import type Product from './models/product';
import type ActiveProduct from './models/active-product';
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
type EventName = 'onUserUpdate' | 'onError' | 'onBuyRequest' | 'onReceipt';

interface StartOptions {
  appId: string,
  apiKey: string,
  userId?: string,
  allowAnonymousPurchase?: boolean,
  environment?: string
};

interface BuyOptions {
  crossPlatformConflict: boolean,
  prorationMode?: string
}

interface GetProductsOptions {
  includeSubscriptionStates: string[]
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
   * @param {String} environment Option to specify a different environment than production
   */
  public start(opts: StartOptions): void {
    // Clear listeners
    this.removeAllListeners();
    // Start IAPHUB
    RNIaphub.start(Object.assign(opts, {sdkVersion: config.version}));
    // Display product missing error
    this.errorListener = this.nativeEventEmitter.addListener("onError", (err) => {
      if (err.code == "unexpected" && err.subcode == "product_missing_from_store") {
        console.error(err.message);
      }
    });
  }

  /**
   * Stop Iaphub
   */
  public stop(): void {
    // Clear listeners
    this.removeAllListeners();
    // Stop IAPHUB
    RNIaphub.stop();
    // Remove error listener
    if (this.errorListener) {
      this.errorListener.remove();
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
   * Log out user
   */
  public logout(): void {
    RNIaphub.logout();
  }

  /**
   * Set device params
   * @param {Dict} params Device params
   */
  public setDeviceParams(params: { [key: string]: any }): void {
    RNIaphub.setDeviceParams(params);
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
   * @returns {Promise<void>}
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
   * @returns {Promise<void>}
   */
  public async restore(): Promise<void> {
    try {
      await RNIaphub.restore();
    }
    catch (err) {
      throw IaphubError.parse(err);
    }
  }

  /**
   * Get active products
   * @param {String[]} [includeSubscriptionStates=[]] Include subscription states (only 'active' and 'grace_period' states are returned by default)
   * @returns {Promise<void>}
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
   * @returns {Promise<void>}
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
   * @returns {Promise<void>}
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

}