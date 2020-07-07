import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class ApiKeyMustBeAssignedException extends IapHubException {
    constructor() {
        super();
        this.name = 'ApiKeyMustBeAssignedException';
        this.message = 'Missing apiKey option';
        this.code = EIapHubExceptionCodes.API_KEY_EMPTY;
    }
}