import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class BillingIsUnavailableException extends IapHubException {
    constructor() {
        super();
        this.name = 'BillingIsUnavailableException';
        this.message = 'The billing is not available';
        this.code = EIapHubExceptionCodes.BILLING_UNAVAILABLE;
    }
}