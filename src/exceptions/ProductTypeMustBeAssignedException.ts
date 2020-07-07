import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class ProductTypeMustBeAssignedException extends IapHubException {
    constructor() {
        super();
        this.name = 'ProductTypeMustBeAssignedException';
        this.message = 'Product type must be assigned.';
        this.code = EIapHubExceptionCodes.PRODUCT_TYPE_REQUIRED;
    }
}
