import type ActiveProduct from './active-product';

export default interface Transaction extends ActiveProduct {
  
  /**
   * Webhook status of the transction
   */
  readonly webhookStatus: string | null;
  /**
   * Internal IAPHUB user id
   */
  readonly user: string | null;

}