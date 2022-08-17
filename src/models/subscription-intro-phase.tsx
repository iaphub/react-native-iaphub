export default interface SubscriptionIntroPhase {
  
  /**
   * Phase type
   */
  readonly type: string;
  /**
   * Phase price
   */
  readonly price: number;
  /**
   * Phase currency
   */
  readonly currency: string;
  /**
   * Phase localized price
   */
  readonly localizedPrice: string;
  /**
   * Phase duration cycle specified in the ISO 8601 format
   */
  readonly cycleDuration: string;
  /**
   * Phase cycle count
   */
  readonly cycleCount: number;
  /**
   * Phase payment type (Possible values: 'as_you_go', 'upfront')
   */
  readonly payment: string;
}