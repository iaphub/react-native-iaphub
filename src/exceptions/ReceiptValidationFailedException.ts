import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class ReceiptValidationFailedException extends IapHubException {
    constructor() {
        super();
        this.name = 'ReceiptValidationFailedException';
        this.message = `Receipt validation on IAPHUB failed`;
        this.code = EIapHubExceptionCodes.RECEIPT_VALIDATION_FAILED;
    }
}
