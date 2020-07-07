import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class RemoteException extends IapHubException {
    constructor() {
        super();
        this.name = 'RemoteException';
        this.message = `Receipt validation on IAPHUB failed`;
        this.code = EIapHubExceptionCodes.RECEIPT_VALIDATION_FAILED;
    }
}
