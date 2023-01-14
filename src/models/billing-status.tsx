import type IaphubError from './iaphub-error';

export default interface BillingStatus {

  /**
   * Product id
   */
  readonly error: IaphubError | null;
  /**
   * Filtered products ids
   */
  readonly filteredProductIds: [string]

}