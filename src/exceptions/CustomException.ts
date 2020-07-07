import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class CustomException extends IapHubException {
    constructor(Message: string, Code: EIapHubExceptionCodes) {
        super();
        this.name = 'CustomException';
        this.message = Message;
        this.code = Code;
    }
}
