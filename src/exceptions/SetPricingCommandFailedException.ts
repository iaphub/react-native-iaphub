import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class SetPricingCommandFailedException extends IapHubException {
    constructor(BaseError: Error) {
        super();
        this.name = 'SetPricingCommandFailedException';
        this.message = `Set pricing command failed (Message: ${BaseError.message})`;
        this.code = (BaseError as any).code || EIapHubExceptionCodes.UNKNOWN;
    }
}
