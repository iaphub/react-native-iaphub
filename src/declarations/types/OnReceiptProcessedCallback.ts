import type {IapHubReceipt} from "../interfaces/IapHubReceipt";
import {IapHubException} from "../../exceptions/IapHubException";
import {TransactionModel} from "iaphub_api/types";

export type OnReceiptProcessedCallback = (err: Error | IapHubException | null, receipt: IapHubReceipt) => Promise<TransactionModel[]>;
