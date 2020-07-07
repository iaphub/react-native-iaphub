import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class MethodParametersRequiredException extends IapHubException {
    constructor(MethodName: string, ParameterNames: string[]) {
        super();
        this.name = 'MethodParametersRequiredException';
        this.message = `Parameters required to use ${MethodName}: ${ParameterNames.join(', ')}`;
        this.code = EIapHubExceptionCodes.METHOD_PARAMETERS_REQUIRED;
    }
}
