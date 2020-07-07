import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class UnknownBillingException extends IapHubException {
    constructor(BaseError: Error) {
        super();
        this.name = 'UnknownBillingException';
        this.message = `Unknown billing error, did you install react-native-iap properly? (Err: ${BaseError.message})`;
        this.code = EIapHubExceptionCodes.BILLING_ERROR;
    }
}