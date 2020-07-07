import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class LoginRequiredException extends IapHubException {
    constructor() {
        super();
        this.name = 'LoginRequiredException';
        this.message = 'Login required';
        this.code = EIapHubExceptionCodes.LOGIN_REQUIRED;
    }
}