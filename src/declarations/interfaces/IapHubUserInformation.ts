import {IapHubProductInformation} from "./IapHubProductInformation";

interface IapHubUserInformation {
    /**
     * The products the user is able to buy
     */
    productsForSale: IapHubProductInformation[];

    /**
     * The products the user bought that are still active (subscriptions or non-consumables)
     */
    activeProducts: IapHubProductInformation[];
}

export type {IapHubUserInformation};
