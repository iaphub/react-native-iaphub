import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

type NativeStartOptions = {
  appId: string;
  apiKey: string;
  userId?: string;
  allowAnonymousPurchase?: boolean;
  enableDeferredPurchaseListener?: boolean;
  enableStorekitV2?: boolean;
  lang?: string;
  environment?: string;
  sdkVersion?: string;
  sdk?: string;
};

type NativeDeviceParams = {[key: string]: string};
type NativeUserTags = {[key: string]: string};
type NativeBuyOptions = {
  crossPlatformConflict: boolean;
  prorationMode?: string;
};
type NativeGetProductsOptions = {
  includeSubscriptionStates: string[];
};
type NativeShowManageSubscriptionsOptions = {
  sku?: string;
};
type NativeSubscriptionIntroPhase = {
  period: string | null;
  price: number | null;
  localizedPrice: string | null;
  type: string | null;
};

type NativeProduct = {
  id: string;
  type: string;
  sku: string;
  price: number;
  currency: string | null;
  localizedPrice: string | null;
  localizedTitle: string | null;
  localizedDescription: string | null;
  alias: string | null;
  group: string | null;
  groupName: string | null;
  subscriptionDuration: string | null;
  subscriptionIntroPhases: NativeSubscriptionIntroPhase[] | null;
  metadata: {[key: string]: string};
};

type NativeActiveProduct = NativeProduct & {
  purchase: string | null;
  purchaseDate: string | null;
  platform: string | null;
  isSandbox: boolean;
  isPromo: boolean;
  promoCode: string | null;
  originalPurchase: string | null;
  expirationDate: string | null;
  isSubscriptionRenewable: boolean;
  isFamilyShare: boolean;
  subscriptionRenewalProduct: string | null;
  subscriptionRenewalProductSku: string | null;
  subscriptionState: string | null;
  subscriptionPeriodType: string | null;
};

type NativeTransaction = NativeActiveProduct & {
  webhookStatus: string | null;
  user: string | null;
};

type NativeProducts = {
  productsForSale: NativeProduct[];
  activeProducts: NativeActiveProduct[];
};

type NativeRestoreResponse = {
  newPurchases: NativeTransaction[];
  transferredActiveProducts: NativeActiveProduct[];
};

type NativeError = {
  code: string;
  message: string;
  subcode?: string;
  params?: {[key: string]: string};
};

type NativeBillingStatus = {
  error: NativeError | null;
  filteredProductIds: string[];
};

type NativeEventName =
  | 'onUserUpdate'
  | 'onDeferredPurchase'
  | 'onError'
  | 'onBuyRequest'
  | 'onReceipt';

export interface Spec extends TurboModule {
  start(options: NativeStartOptions): Promise<void>;
  stop(): Promise<void>;
  getSDKVersion?(): Promise<string | null>;
  setLang(lang: string): Promise<boolean>;
  login(userId: string): Promise<void>;
  getUserId(): Promise<string>;
  logout(): Promise<void>;
  setDeviceParams(params: NativeDeviceParams): Promise<void>;
  setUserTags(tags: NativeUserTags): Promise<void>;
  buy(sku: string, options: NativeBuyOptions): Promise<NativeTransaction>;
  restore(): Promise<NativeRestoreResponse>;
  getActiveProducts(options: NativeGetProductsOptions): Promise<NativeActiveProduct[]>;
  getProductsForSale(): Promise<NativeProduct[]>;
  getProducts(options: NativeGetProductsOptions): Promise<NativeProducts>;
  getBillingStatus(): Promise<NativeBillingStatus>;
  presentCodeRedemptionSheet(): Promise<void>;
  showManageSubscriptions(options: NativeShowManageSubscriptionsOptions): Promise<void>;
  addListener(eventName: NativeEventName): void;
  removeListeners(count: number): void;
}
export default TurboModuleRegistry.getEnforcing<Spec>('NativeIaphub');