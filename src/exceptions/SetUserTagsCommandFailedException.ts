import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class SetUserTagsCommandFailedException extends IapHubException {
    constructor(BaseError: Error) {
        super();
        this.name = 'SetUserTagsCommandFailedException';
        this.message = `Set user tags failed (Message: ${BaseError.message})`;
        this.code = (BaseError as any).code || EIapHubExceptionCodes.UNKNOWN;
    }
}