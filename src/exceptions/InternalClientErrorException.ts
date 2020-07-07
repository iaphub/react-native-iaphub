import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class InternalClientErrorException extends IapHubException {
    constructor() {
        super();
        this.name = 'InternalClientErrorException';
        this.message = 'Communication with server broken.';
        this.code = EIapHubExceptionCodes.INTERNAL_AXIOS_CLIENT_ERROR;
    }
}
