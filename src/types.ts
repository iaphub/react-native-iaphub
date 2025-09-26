import type ActiveProduct from './models/active-product';
import type Product from './models/product';
import type Transaction from './models/transaction';

export type EventName =
  | 'onUserUpdate'
  | 'onDeferredPurchase'
  | 'onError'
  | 'onBuyRequest'
  | 'onReceipt';

export interface StartOptions {
  appId: string;
  apiKey: string;
  userId?: string;
  allowAnonymousPurchase?: boolean;
  enableDeferredPurchaseListener?: boolean;
  enableStorekitV2?: boolean;
  lang?: string;
  environment?: string;
}

export interface BuyOptions {
  crossPlatformConflict: boolean;
  prorationMode?: string;
}

export interface GetProductsOptions {
  includeSubscriptionStates: string[];
}

export interface ShowManageSubscriptionsOptions {
  sku?: string;
}

export type Products = {
  productsForSale: Product[];
  activeProducts: ActiveProduct[];
};

export type RestoreResponse = {
  newPurchases: Transaction[];
  transferredActiveProducts: ActiveProduct[];
};

export type DeviceParams = Record<string, string>;
export type UserTags = Record<string, string>;

export type { default as ActiveProduct } from './models/active-product';
export type { default as Product } from './models/product';
export type { default as Transaction } from './models/transaction';
export type { default as BillingStatus } from './models/billing-status';