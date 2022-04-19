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
   * Product group id
   */
  readonly group: string | null;
  /**
   * Product group name
   */
  readonly groupName: string | null;
  /**
   * Subscription period type ("normal", "trial", "intro")
   */
  readonly subscriptionPeriodType: string | null;
  /**
   * Duration of the subscription cycle specified in the ISO 8601 format
   */
  readonly subscriptionDuration: string | null;
  /**
   * Introductory price amount
   */
  readonly subscriptionIntroPrice: number | null;
  /**
   * Localized introductory price
   */
  readonly subscriptionIntroLocalizedPrice: string | null;
  /**
   * Payment type of the introductory offer ("as_you_go", "upfront")
   */
  readonly subscriptionIntroPayment: string | null;
  /**
   * Duration of an introductory cycle specified in the ISO 8601 format
   */
  readonly subscriptionIntroDuration: string | null;
  /**
   * Number of cycles in the introductory offer
   */
  readonly subscriptionIntroCycles: number | 0;
  /**
   * Duration of the trial specified in the ISO 8601 format
   */
  readonly subscriptionTrialDuration: string | null;

}