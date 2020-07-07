import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class AppIdMustBeAssignedException extends IapHubException {
    constructor() {
        super();
        this.name = 'AppIdMustBeAssignedException';
        this.message = 'Missing appId option';
        this.code = EIapHubExceptionCodes.APP_ID_EMPTY;
    }
}