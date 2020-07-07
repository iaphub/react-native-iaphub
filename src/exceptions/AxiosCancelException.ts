import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class AxiosCancelException extends IapHubException {
  constructor() {
    super();
    this.name = 'AxiosCancelException';
    this.message = `Request cancelled.`;
    this.code = EIapHubExceptionCodes.AXIOS_CANCELLED;
  }
}
