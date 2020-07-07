import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class RestoreFailedException extends IapHubException {
    constructor(BaseError: Error) {
        super();
        this.name = 'RestoreFailedException';
        this.message = `Restore failed (Err: ${BaseError.message})`;
        this.code = (BaseError as any).code || EIapHubExceptionCodes.UNKNOWN;
    }
}
