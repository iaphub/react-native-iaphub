import type SubscriptionIntroPhase from './subscription-intro-phase';

export default interface Product {
  
  /**
   * Product id
   */
  readonly id: string;
  /**
   * Product type
   */
  readonly type: string;
  /**
   * Product sku
   */
  readonly sku: string;
  /**
   * Product price
   */
  readonly price: number;
  /**
   * Product price currency
   */
  readonly currency: string | null;
  /**
   * Product localized price
   */
  readonly localizedPrice: string | null;
  /**
   * Product localized title
   */
  readonly localizedTitle: string | null;
  /**
   * Product localized description
   */
  readonly localizedDescription: string | null;
  /**
   * Product alias
   */
  readonly alias: string | null;
  /**
   * Product group id
   */
  readonly group: string | null;
  /**
   * Product group name
   */
  readonly groupName: string | null;
  /**
   * Duration of the subscription cycle specified in the ISO 8601 format
   */
  readonly subscriptionDuration: string | null;
  /**
   * Subscription intro phases
   */
  readonly subscriptionIntroPhases: [SubscriptionIntroPhase] | null;
  /**
   * Metadata for the product as key/value pairs
   */
  readonly metadata: { [key: string]: string };
}