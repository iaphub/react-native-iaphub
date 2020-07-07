import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class IapHubNotInitializedException extends IapHubException {
    constructor() {
        super();
        this.name = 'IapHubNotInitializedException';
        this.message = `IAPHUB hasn't been initialized`;
        this.code = EIapHubExceptionCodes.INIT_MISSING;
    }
}
