import ExtendableError from "ts-error";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class IapHubException extends ExtendableError {
    code: EIapHubExceptionCodes;

    constructor() {
        super();
        this.code = EIapHubExceptionCodes.UNKNOWN;
    }
}