import {EIapHubProductTypes} from "../enums/EIapHubProductTypes";
import {EIapHubSubscriptionPeriod} from "../enums/EIapHubSubscriptionPeriod";
import {EIapHubSubscriptionPeriodType} from "../enums/EIapHubSubscriptionPeriodType";
import {EIapHubIntroductoryPaymentType} from "../enums/EIapHubIntroductoryPaymentType";

interface IapHubProductInformation {
    /**
     * Product id (From IAPHUB)
     */
    id: string;

    /**
     * Product type
     */
    type: EIapHubProductTypes;

    /**
     * Product sku (Ex: "membership_tier1")
     */
    sku: string;

    /**
     * Localized price (Ex: "$12.99")
     */
    price: string;

    /**
     * Price currency code (Ex: "USD")
     */
    priceCurrency: string;

    /**
     * Price amount (Ex: 12.99)
     */
    priceAmount: number;

    /**
     * Product title (Ex: "Membership")
     */
    title: string;

    /**
     * Product description (Ex: "Join the community with a membership")
     */
    description: string;

    /**
     * Group id - ⚠ Only available if the product as a group
     */
    group?: string;

    /**
     * Name of the product group created on IAPHUB (Ex: "premium") - ⚠ Only available if the product as a group
     */
    groupName?: string;

    /**
     * Purchase id (From IAPHUB) - ⚠ Only available for an active product
     */
    purchase?: string;

    /**
     * Purchase date - ⚠ Only available for an active product
     */
    purchaseDate?: string;

    /**
     * Duration of the subscription cycle specified in the ISO 8601 format (Possible values: 'P1W', 'P1M', 'P3M', 'P6M', 'P1Y') - ⚠ Only available for a subscription
     */
    subscriptionDuration?: EIapHubSubscriptionPeriod;

    /**
     * Subscription expiration date - ⚠ Only available for an active subscription
     */
    expirationDate?: string;

    /**
     * If the subscription can be renewed - ⚠ Only available for an active subscription
     */
    isSubscriptionRenewable?: boolean;

    /**
     * If the subscription is currently in a retry period - ⚠ Only available for an active subscription
     */
    isSubscriptionRetryPeriod?: boolean;

    /**
     * If the subscription is currently in a grace period - ⚠ Only available for an active subscription
     */
    isSubscriptionGracePeriod?: boolean;

    /**
     * If the subscription is active it is the current period otherwise it is the period if the user purchase the subscription - ⚠ Only available for a subscription
     */
    subscriptionPeriodType?: EIapHubSubscriptionPeriodType;

    /**
     * Localized introductory price (Ex: "$2.99") - ⚠ Only available for a subscription with an introductory price
     */
    subscriptionIntroPrice?: string;

    /**
     * Introductory price amount (Ex: 2.99) - ⚠ Only available for a subscription with an introductory price
     */
    subscriptionIntroPriceAmount?: number;


    /**
     * Payment type of the introductory offer - ⚠ Only available for a subscription with an introductory price
     */
    subscriptionIntroPayment?: EIapHubIntroductoryPaymentType;

    /**
     * Duration of an introductory cycle specified in the ISO 8601 format - ⚠ Only available for a subscription with an introductory price
     */
    subscriptionIntroDuration?: EIapHubSubscriptionPeriod;

    /**
     * Number of cycles in the introductory offer - ⚠ Only available for a subscription with an introductory price
     */
    subscriptionIntroCycles?: number;

    /**
     * Duration of the trial specified in the ISO 8601 format - ⚠ Only available for a subscription with a trial
     */
    subscriptionTrialDuration?: string;
}

export type {IapHubProductInformation};