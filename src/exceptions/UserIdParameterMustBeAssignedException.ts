import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class UserIdParameterMustBeAssignedException extends IapHubException {
    constructor() {
        super();
        this.name = 'UserIdParameterMustBeAssignedException';
        this.message = 'Missing userId';
        this.code = EIapHubExceptionCodes.USER_ID_EMPTY;
    }
}
