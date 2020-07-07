import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class UserIdInvalidException extends IapHubException {
    constructor() {
        super();
        this.name = 'UserIdInvalidException';
        this.message = 'Invalid userId, it must be a string';
        this.code = EIapHubExceptionCodes.USER_ID_INVALID;
    }
}
