import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class UserMustBeAssignedException extends IapHubException {
    constructor() {
        super();
        this.name = 'UserMustBeAssignedException';
        this.message = 'User must be assigned.';
        this.code = EIapHubExceptionCodes.USER_MUST_BE_ASSIGNED;
    }
}
