import type Product from './product';

export default interface ActiveProduct extends Product {
  
  /**
   * Purchase id
   */
  readonly purchase: string | null;
  /**
   * Purchase date (ISO format)
   */
  readonly purchaseDate: string | null;
  /**
   * Platform of the purchase
   */
  readonly platform: string | null;
  /**
   * Subscription expiration date
   */
  readonly expirationDate: string | null;
  /**
   * Returns if the subscription will auto renew
   */
  readonly isSubscriptionRenewable: boolean | false;
  /**
   * Subscription product of the next renewal (only defined if different than the current product)
   */
  readonly subscriptionRenewalProduct: string | null;
  /**
   * SubscriptionRenewalProduct sku
   */
  readonly subscriptionRenewalProductSku: string | null;
  /**
   * Subscription state ("active", "retry_period", "grace_period", "paused")
   */
  readonly subscriptionState: string | null;

}