import {IapHubException} from "./IapHubException";
import {EIapHubExceptionCodes} from "../declarations/enums/EIapHubExceptionCodes";

export class SKUNotForSaleException extends IapHubException {
    constructor() {
        super();
        this.name = 'SKUNotForSaleException';
        this.message = 'Buy failed, product sku not in the products for sale';
        this.code = EIapHubExceptionCodes.SKU_NOT_FOR_SALE;
    }
}
