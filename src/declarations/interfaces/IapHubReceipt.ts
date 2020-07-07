interface IapHubReceipt {
    /**
     * Product sku
     */
    sku: string;

    /**
     * Receipt token
     */
    token: string;

    /**
     * If the event is triggered from a restore
     */
    isRestore: boolean;
}

export type {IapHubReceipt};