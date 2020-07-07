import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class ReceiptRequestFailedException extends IapHubException {
    constructor() {
        super();
        this.name = 'ReceiptRequestFailedException';
        this.message = `Receipt request to IAPHUB failed`;
        this.code = EIapHubExceptionCodes.RECEIPT_REQUEST_FAILED;
    }
}