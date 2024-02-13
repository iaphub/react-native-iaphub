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
   * If it is a sandbox transaction
   */
  readonly isSandbox: boolean | false;
  /**
   * If it has been purchased using a promo code
   */
  readonly isPromo: boolean | false;
  /**
   * Promo code used for the purchase
   * (Android: only available for subscriptions vanity codes, not available for one time codes) (iOS: the value is the offer reference name)
   */
  readonly promoCode: string | null;
  /**
   * Subscription original purchase id
   */
  readonly originalPurchase: string | null;
  /**
   * Subscription expiration date
   */
  readonly expirationDate: string | null;
  /**
   * Returns if the subscription will auto renew
   */
  readonly isSubscriptionRenewable: boolean | false;
  /**
   * True if the subscription is shared by a family member (iOS subscriptions only)
   */
   readonly isFamilyShare: boolean | false;
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
  /**
   * Subscription period type ("normal", "trial", "intro")
   */
  readonly subscriptionPeriodType: string | null;

}