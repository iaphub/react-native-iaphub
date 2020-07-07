import {EIapHubWebhookStatus} from "../enums/EIapHubWebhookStatus";
import type {IapHubProductInformation} from "./IapHubProductInformation";

interface IapHubProductInformationWithWebhook extends IapHubProductInformation {
    /**
     * webhookStatus The purchase has been successful but we need to check that the webhook to our server was successful as well
     * If the webhook request failed, IAPHUB will send you an alert and retry again in 1 minute, 10 minutes, 1 hour and 24 hours.
     * You can retry the webhook directly from the dashboard as well
     */
    webhookStatus: EIapHubWebhookStatus;
}

export type {IapHubProductInformationWithWebhook};
