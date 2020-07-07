import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class ReceiptProcessedCallbackNotFoundException extends IapHubException {
    constructor() {
        super();
        this.name = 'ReceiptProcessedCallbackNotFoundException';
        this.message = 'Receipt processed callback not found.';
        this.code = EIapHubExceptionCodes.RECEIPT_PROCESSED_CALLBACK_NOT_FOUND;
    }
}
