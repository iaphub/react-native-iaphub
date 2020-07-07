import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class TransactionNotFoundException extends IapHubException {
    constructor() {
        super();
        this.name = 'TransactionNotFoundException';
        this.message = 'Transaction not found.';
        this.code = EIapHubExceptionCodes.TRANSACTION_NOT_FOUND;
    }
}