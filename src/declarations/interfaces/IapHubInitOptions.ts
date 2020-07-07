import {EIapHubEnvironment} from "../enums/EIapHubEnvironment";
import {OnReceiptProcessedCallback} from "../types/OnReceiptProcessedCallback";

interface IapHubInitOptions {
    /**
     * The app id is available on the settings page of your app
     */
    appId: string;

    /**
     * The (client) api key is available on the settings page of your app
     */
    apiKey: string;

    /**
     * App environment (production by default, other environments must be created on the IAPHUB dashboard)
     */
    environment: EIapHubEnvironment;

    /**
     * Event triggered after IAPHUB processed a receipt
     * @param err It will be undefined when there is no errors. If there any error it returns Error object.
     * @param receipt Receipt returning from purchase process
     */
    onReceiptProcessed?: OnReceiptProcessedCallback;
}

export type {IapHubInitOptions};