import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class UnexceptedIapHubResponseException extends IapHubException {
    constructor() {
        super();
        this.name = 'UnexceptedIapHubResponseException';
        this.message = 'Unexcepted iap hub response.';
        this.code = EIapHubExceptionCodes.UNEXPECTED_RESPONSE;
    }
}