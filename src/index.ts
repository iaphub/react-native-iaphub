import {Platform, PlatformOSType} from "react-native";
import {IapHubUtils} from "./utils";
import RNIap, {
    IAPErrorCode,
    InAppPurchase,
    Product,
    ProrationModesAndroid,
    Purchase,
    PurchaseError,
    Subscription,
    SubscriptionPurchase
} from "react-native-iap";
import {RestService} from "./services/RestService";
import {
    ActiveProductModel,
    EEnvironment,
    EProductType,
    ESubscriptionPeriodType,
    EUserPlatform,
    PostRequestUserReceipt,
    PricingModel,
    ProductModel,
    StatusEnum,
    TransactionModel
} from "iaphub_api/types";

import {ApiKeyMustBeAssignedException} from "./exceptions/ApiKeyMustBeAssignedException";
import {AppIdMustBeAssignedException} from "./exceptions/AppIdMustBeAssignedException";
import {BillingIsUnavailableException} from "./exceptions/BillingIsUnavailableException";
import {UnknownBillingException} from "./exceptions/UnknownBillingException";
import {UserIdParameterMustBeAssignedException} from "./exceptions/UserIdParameterMustBeAssignedException";
import {IapHubNotInitializedException} from "./exceptions/IapHubNotInitializedException";
import {UserIdInvalidException} from "./exceptions/UserIdInvalidException";
import {SKUNotForSaleException} from "./exceptions/SKUNotForSaleException";
import {LoginRequiredException} from "./exceptions/LoginRequiredException";
import {UserMustBeAssignedException} from "./exceptions/UserMustBeAssignedException";
import {SetUserTagsCommandFailedException} from "./exceptions/SetUserTagsCommandFailedException";
import {RestoreFailedException} from "./exceptions/RestoreFailedException";
import {SetPricingCommandFailedException} from "./exceptions/SetPricingCommandFailedException";
import {ProductTypeMustBeAssignedException} from "./exceptions/ProductTypeMustBeAssignedException";
import {TransactionNotFoundException} from "./exceptions/TransactionNotFoundException";
import {ReceiptProcessedCallbackNotFoundException} from "./exceptions/ReceiptProcessedCallbackNotFoundException";
import {UnexceptedIapHubResponseException} from "./exceptions/UnexceptedIapHubResponseException";
import {ReceiptValidationFailedException} from "./exceptions/ReceiptValidationFailedException";
import {ReceiptRequestFailedException} from "./exceptions/ReceiptRequestFailedException";
import {IapHubException} from "./exceptions/IapHubException";
import {CustomException} from "./exceptions/CustomException";

import type {IapHubInitOptions} from "./declarations/interfaces/IapHubInitOptions";
import type {OnReceiptProcessedCallback} from "./declarations/types/OnReceiptProcessedCallback";
import type {IapHubUserInformation} from "./declarations/interfaces/IapHubUserInformation";
import type {IapHubBuyOptions} from "./declarations/interfaces/IapHubBuyOptions";
import type {IapHubProductInformation} from "./declarations/interfaces/IapHubProductInformation";
import type {IapHubReceipt} from "./declarations/interfaces/IapHubReceipt";
import type {RequestData} from "./declarations/interfaces/RequestData";

import {EIapHubEnvironment} from "./declarations/enums/EIapHubEnvironment";
import {EIapHubProductTypes} from "./declarations/enums/EIapHubProductTypes";
import {EIapHubSubscriptionPeriod} from "./declarations/enums/EIapHubSubscriptionPeriod";
import {EIapHubIntroductoryPaymentType} from "./declarations/enums/EIapHubIntroductoryPaymentType";
import {EIapHubExceptionCodes} from "./declarations/enums/EIapHubExceptionCodes";

class Iaphub {
    readonly #apiUrl: string;
    readonly #platform: PlatformOSType;
    #environment: EIapHubEnvironment;
    #appId: null | string;
    #apiKey: null | string;
    #userId: null | string;
    #user: null | IapHubUserInformation;
    #isInitialized: boolean;
    #isLogged: boolean;
    #canMakePayments: boolean;
    #onReceiptProcessed: OnReceiptProcessedCallback | null;
    #buyRequest: null | RequestData;
    #purchaseUpdatedEvents: any[];
    #purchaseErrorEvents: any[];

    constructor() {
        this.#apiUrl = "https://api.iaphub.com/v1";
        this.#platform = Platform.OS;
        this.#appId = null;
        this.#apiKey = null;
        this.#userId = null;
        this.#user = null;
        this.#isInitialized = false;
        this.#isLogged = false;
        this.#canMakePayments = true;
        this.#onReceiptProcessed = null;
        this.#buyRequest = null;
        this.#purchaseUpdatedEvents = [];
        this.#purchaseErrorEvents = [];
        this.#environment = EIapHubEnvironment.PRODUCTION;
    }

    //#region GETTERS

    get User(): IapHubUserInformation {
        if (IapHubUtils.IsNull(this.#user)) {
            throw new UserMustBeAssignedException();
        }

        return this.#user;
    }

    get ApiKey(): string {
        if (IapHubUtils.IsNull(this.#apiKey)) {
            throw new ApiKeyMustBeAssignedException();
        }

        return this.#apiKey;
    }

    get AppId(): string {
        if (IapHubUtils.IsNull(this.#appId)) {
            throw new AppIdMustBeAssignedException();
        }

        return this.#appId;
    }

    get UserId(): string {
        if (IapHubUtils.IsNull(this.#userId)) {
            throw new UserIdInvalidException();
        }

        return this.#userId;
    }

    get Environment(): EIapHubEnvironment {
        return this.#environment;
    }

    get Platform(): PlatformOSType {
        return this.#platform;
    }

    get OnReceiptProcessed(): OnReceiptProcessedCallback {
        if (!IapHubUtils.IsFunction(this.#onReceiptProcessed)) {
            throw new ReceiptProcessedCallbackNotFoundException();
        }

        return this.#onReceiptProcessed;
    }

    //#endregion GETTERS

    //#region PUBLIC

    /**
     * Call the init method at the start of your app to initialize your configuration
     *
     * ℹ️ It should be called as soon as possible when starting your app.
     * @param Options Initialization options.
     * @exception AppIdMustBeAssignedException
     * @exception ApiKeyMustBeAssignedException
     */
    async init(Options: IapHubInitOptions): Promise<void> {
        if (IapHubUtils.IsUndefined(Options.appId)) {
            throw new AppIdMustBeAssignedException();
        }

        if (IapHubUtils.IsUndefined(Options.apiKey)) {
            throw new ApiKeyMustBeAssignedException();
        }

        if (IapHubUtils.IsValueExistsInEnum(EIapHubEnvironment, Options.environment)) {
            this.#environment = Options.environment;
        }

        if (IapHubUtils.IsFunction(Options.onReceiptProcessed)) {
            this.#onReceiptProcessed = Options.onReceiptProcessed;
        }

        this.#appId = Options.appId;
        this.#apiKey = Options.apiKey;
        this.#isInitialized = true;

        await this.InitIap();
    };

    /**
     * Login user
     * @param UserId User id
     * @exception UserIdParameterMustBeAssignedException
     * @exception UserIdInvalidException
     * @exception IapHubNotInitializedException
     */
    async login(UserId: string): Promise<void> {
        await this.Login(UserId);
    }

    /**
     * Logout user
     */
    logout() {
        this.Logout();
    }

    /**
     * Buys a product.
     *
     * ℹ️ The method needs the product sku that you would get from one of the products of the user productsForSale array.
     * @param ProductSKU The product SKU user wants to buy
     * @param Options Buy options
     */
    async buy(ProductSKU: string, Options?: IapHubBuyOptions): Promise<void> {
        await this.Buy(ProductSKU, Options);
    }

    /**
     * Sets tags of the user.
     * @param Tags Tags as object
     */
    async setUserTags(Tags: object) {
        await this.SetUserTags(Tags);
    }

    /**
     * Restore purchases
     */
    async restore() {
        await this.Restore();
    }

    /**
     * Set pricing
     * @param Products Array of products
     */
    async setPricing(Products: IapHubProductInformation[]) {
        await this.SetPricing(Products);
    }

    /**
     * Gets the user informations.
     */
    async getUser() {
        await this.GetUser();
    }

    //#endregion PUBLIC


    //#region PRIVATE

    /**
     * Inits react-native-iap
     * @exception BillingIsUnavailableException
     * @exception UnknownBillingException
     */
    private async InitIap() {
        try {
            const status = await RNIap.initConnection();

            // On ios initConnection will return the result of canMakePayments
            if (this.#platform === 'ios' && !status) {
                this.#canMakePayments = false;
            }
        } catch (err) {
            // Check init connection errors
            if (err.code === IAPErrorCode.E_IAP_NOT_AVAILABLE) {
                throw new BillingIsUnavailableException();
            }

            throw new UnknownBillingException(err);
        }
        // Init listeners
        RNIap.purchaseUpdatedListener(this.OnRNIapPurchaseUpdatedHandler);
        RNIap.purchaseErrorListener(this.OnRNIAPPurchaseErrorHandler);
    }

    /**
     * Success handler of RNIAP Purchase command
     * @param purchase Purchase data
     */
    private async OnRNIapPurchaseUpdatedHandler(purchase: Purchase) {
        if (!this.#isLogged) {
            this.#purchaseUpdatedEvents.push(purchase);
        }
        // Otherwise we process the receipt
        else {
            await this.ProcessReceipt(purchase);
        }
    }

    /**
     * Error handler of RNIAP Purchase command
     * @param error Error details
     */
    private async OnRNIAPPurchaseErrorHandler(error: PurchaseError) {
        if (!this.#isLogged) {
            // If the user isn't logged we save the event in a queue (that will be executed when the user login)
            this.#purchaseErrorEvents.push(error);
        } else {
            // Otherwise process the error
            this.ProcessError(new LoginRequiredException());
        }
    }

    /**
     * Login
     * @param UserId Id of a user
     * @exception UserIdParameterMustBeAssignedException
     * @exception UserIdInvalidException
     * @exception IapHubNotInitializedException
     */
    private async Login(UserId: string) {
        if (IapHubUtils.IsUndefined(UserId)) {
            throw new UserIdParameterMustBeAssignedException();
        }
        if (!IapHubUtils.IsString(UserId)) {
            throw new UserIdInvalidException();
        }
        if (!this.#isInitialized) {
            throw new IapHubNotInitializedException();
        }
        this.#userId = UserId;
        this.#isLogged = true;
        // Execute purchase updated events received prior to initialize
        await this.#purchaseUpdatedEvents.reduce(async (promise, purchase) => {
            await promise;
            await this.ProcessReceipt(purchase);
        }, Promise.resolve());

        this.#purchaseUpdatedEvents = [];
        // Execute purchase error events received prior to initialize
        await this.#purchaseErrorEvents.reduce(async (promise, err) => {
            await promise;
            this.ProcessError(err);
        }, Promise.resolve());
        this.#purchaseErrorEvents = [];
    }

    /**
     * Subscribes a subscription or buys a product
     * @param SKU Product SKU
     * @param Options Options
     * @exception LoginRequiredException
     * @exception SKUNotForSaleException
     */
    private async Buy(SKU: string, Options?: IapHubBuyOptions) {
        // The user has to be logged in
        this.CheckLogin();

        // Get product of the sku
        const product = this.FindProductInProductForSale(SKU);

        // Create promise than will be resolved (or rejected) after process of the receipt is complete
        const buyPromise = new Promise((resolve, reject) => {
            this.#buyRequest = {
                resolve,
                reject,
                sku: SKU
            };
        });

        // Request purchase
        if (product.type === EIapHubProductTypes.RENEWABLE_SUBSCRIPTION || product.type === EIapHubProductTypes.SUBSCRIPTION) {
            await this.BuySubscription(product, Options);
        } else {
            await this.BuyProduct(product);
        }
        // Return promise
        return buyPromise;
    }

    /**
     * Subscribes to a subscription
     * @param subscription A subscription product user wants to subscribe
     * @param Options Buy Options
     */
    private async BuySubscription(subscription: IapHubProductInformation, Options?: IapHubBuyOptions) {
        let IsUpdated = false;

        if (this.#platform == 'android') {
            const activeSubscription = this.FindActiveRenewableSubscription(subscription.group);

            if (!IapHubUtils.IsUndefined(activeSubscription)) {
                await RNIap.requestSubscription(
                    subscription.sku,
                    false,
                    activeSubscription.sku,
                    Options?.androidProrationMode || ProrationModesAndroid.IMMEDIATE_WITH_TIME_PRORATION
                );

                IsUpdated = true;
            }
        }

        if (!IsUpdated) {
            // Otherwise request subscription normally
            await RNIap.requestSubscription(subscription.sku, false);
        }
    }

    /**
     * Buy command
     * @param product A product user wants to buy
     */
    private async BuyProduct(product: IapHubProductInformation) {
        try {
            await RNIap.requestPurchase(product.sku, false);
        } catch (error) {
            this.ProcessError(error);
        }
    }

    /**
     * Sets user tags
     * @param Tags An user tags
     * @exception LoginRequiredException
     * @exception SetUserTagsCommandFailedException
     * @exception AxiosCancelException
     * @exception InternalClientErrorException
     */
    private async SetUserTags(Tags: object) {
        this.CheckLogin();

        const AxiosInstance = this.GetAxiosInstance();

        try {
            await AxiosInstance.postUser(this.UserId, this.AppId, {
                environment: this.Environment as unknown as EEnvironment,
                tags: Tags
            });
        } catch (error) {
            throw new SetUserTagsCommandFailedException(error);
        }
    }

    /**
     * Gets the informations of user
     */
    private async GetUser() {
        this.CheckLogin();

        let GetUserResponse;

        try {
            GetUserResponse = await this.GetAxiosInstance().getUser(this.UserId, this.AppId, this.Platform as EUserPlatform, this.Environment);
        } catch (error) {
            throw new UnexceptedIapHubResponseException();
        }

        const {productsForSale, activeProducts} = GetUserResponse.data;

        const AllProducts = [...productsForSale, ...activeProducts];

        const ProductIds = AllProducts.filter(item => item.type !== EProductType.RENEWABLE_SUBSCRIPTION).map(item => item.sku);
        const SubscriptionIds = AllProducts.filter(item => item.type === EProductType.RENEWABLE_SUBSCRIPTION).map(item => item.sku);

        const AllProductInfos = await Iaphub.GetAllProductInfosFromIAP(ProductIds, SubscriptionIds);

        const ParsedProductsForSale: IapHubProductInformation[] = productsForSale
            .map(this.FormatProduct.bind(this, AllProductInfos))
            .filter(item => item !== null) as IapHubProductInformation[];

        const ParsedActiveProducts: IapHubProductInformation[] = activeProducts
            .map(this.FormatProduct.bind(this, AllProductInfos))
            .filter(item => item !== null) as IapHubProductInformation[];

        this.#user = {
            productsForSale: ParsedProductsForSale,
            activeProducts: ParsedActiveProducts
        };

        try {
            await this.SetPricing([...ParsedProductsForSale, ...ParsedActiveProducts]);
        } catch (err) {
            console.error(err);
        }

        return this.User;
    }

    /**
     * Restores user products
     * @exception RestoreFailedException
     * @exception LoginRequiredException
     */
    private async Restore() {
        this.CheckLogin();

        try {
            const AvailablePurchases = await RNIap.getAvailablePurchases();
            const RestoredPurchases: TransactionModel[] = [];
            const Purchases: (InAppPurchase | SubscriptionPurchase)[] = [];

            // Filter duplicate receipts
            AvailablePurchases.forEach((purchase) => {
                const hasDuplicate = Purchases.find((item) => {
                    return this.GetReceiptToken(item) === this.GetReceiptToken(purchase)
                });

                if (IapHubUtils.IsUndefined(hasDuplicate)) {
                    Purchases.push(purchase);
                }
            });

            // Process receipts
            await Purchases.reduce(async (promise, purchase) => {
                await promise;
                const NewTransactions = await this.ProcessReceipt(purchase, true);
                RestoredPurchases.push(...NewTransactions);
            }, Promise.resolve());

            return RestoredPurchases;
        } catch (error) {
            throw new RestoreFailedException(error);
        }
    }

    /**
     * Sets pricing
     * @param Products Array of products
     * @exception SetPricingCommandFailedException
     * @exception AxiosCancelException
     * @exception InternalClientErrorException
     */
    private async SetPricing(Products: IapHubProductInformation[]) {
        const EditedProducts = Products.map<PricingModel>((product) => {
            let item: PricingModel = {
                id: product.id,
                price: product.priceAmount,
                currency: product.priceCurrency
            };

            if (product.subscriptionIntroPriceAmount) {
                item.introPrice = product.subscriptionIntroPriceAmount;
            }

            return item;
        });

        const AxiosInstance = this.GetAxiosInstance();

        try {
            await AxiosInstance.postUserPricing(this.AppId, this.UserId, {
                environment: this.Environment as unknown as EEnvironment,
                platform: this.Platform as EUserPlatform,
                products: EditedProducts
            });
        } catch (error) {
            throw new SetPricingCommandFailedException(error);
        }
    }

    /**
     * Finish a receipt
     * @param Purchase Purchase Data
     * @param ProductType Product Type
     */
    private async FinishReceipt(Purchase: Purchase, ProductType: EIapHubProductTypes) {
        if (this.Platform === "android") {
            await Iaphub.FinishAndroidTransaction(Purchase, ProductType);
        } else {
            await Iaphub.FinishIosTransaction(Purchase);
        }
    }

    /**
     * Emit receipt processed event
     */
    private async EmitReceiptProcessed(Error: Error | IapHubException | null, Receipt: IapHubReceipt) {
        try {
            return await this.OnReceiptProcessed(Error, Receipt);
        } catch (error) {
            if (!(error instanceof ReceiptProcessedCallbackNotFoundException)) {
                console.error(error);
            }
        }
    }

    /**
     * Process a receipt
     * @param Purchase Purchase
     * @param IsRestore Restore
     */
    private async ProcessReceipt(Purchase: Purchase, IsRestore: boolean = false) {
        const Receipt: PostRequestUserReceipt = {
            platform: this.Platform as EUserPlatform,
            token: this.GetReceiptToken(Purchase),
            sku: Purchase.productId,
            isRestore: IsRestore
        };

        let NewTransactions: TransactionModel[] = [];
        let OldTransactions: TransactionModel[] = [];
        let ShouldFinishReceipt: boolean = false;
        let Error: Error | IapHubException | null = null;

        // Process receipt with IAPHUB
        try {
            const Response = await this.GetAxiosInstance().postUserReceipt(this.AppId, this.UserId, Receipt);

            const {status, oldTransactions, newTransactions} = Response.data;

            if (status === StatusEnum.SUCCESS) {
                NewTransactions = newTransactions;
                OldTransactions = oldTransactions;
                ShouldFinishReceipt = true;
            } else if (status === StatusEnum.FAILED) {
                ShouldFinishReceipt = true;
                Error = new ReceiptValidationFailedException();
            }
        } catch (error) {
            // If it fails we won't finish the receipt
            Error = new ReceiptRequestFailedException();
        }

        // Finish receipt
        if (ShouldFinishReceipt) {
            const ProductType = await this.DetectProductType(
                Receipt.sku as string,
                NewTransactions,
                OldTransactions
            );

            if (!IapHubUtils.IsNull(ProductType)) {
                await this.FinishReceipt(Purchase, ProductType);
            }
        }

        // Emit receipt processed event
        try {
            const newTransactionsOverride = await this.EmitReceiptProcessed(Error, {
                isRestore: Receipt.isRestore!,
                sku: Receipt.sku as string,
                token: Receipt.token
            });

            if (Array.isArray(newTransactionsOverride)) {
                NewTransactions = newTransactionsOverride;
            }
        } catch (error) {
            Error = error;
        }


        // Resolve buy request if active
        if (this.#buyRequest) {
            const request = this.#buyRequest;
            // Delete saved request
            this.#buyRequest = null;

            // Search transaction by sku
            let transaction = NewTransactions.find((item) => item.sku === request.sku);

            // If not found, look if it is a product change
            if (IapHubUtils.IsUndefined(transaction)) {
                transaction = NewTransactions.find((item) => item.subscriptionRenewalProductSku === request.sku);
            }
            // Reject the request if there is no transaction
            if (IapHubUtils.IsUndefined(transaction)) {
                Error = new TransactionNotFoundException();
            }

            if (Error) {
                // If there was an error, reject the request
                request.reject(Error);
            } else if (!IapHubUtils.IsUndefined(transaction)) {
                // Otherwise resolve with the transaction
                const product = this.User.productsForSale.find((product) => product.sku === transaction!.sku);
                request.resolve({...product, ...transaction});
            }
        }

        return NewTransactions || [];
    }


    /**
     * Checks user login
     * @exception
     */
    private CheckLogin() {
        if (!this.#isLogged) {
            throw new LoginRequiredException();
        }
    }

    /**
     * Logout method
     */
    private Logout(): void {
        this.#user = null;
        this.#userId = null;
        this.#isLogged = false;
    }

    /**
     * Finds the product.
     * @param SKU The SKU of the product
     * @exception SKUNotForSaleException
     */
    private FindProductInProductForSale(SKU: string): IapHubProductInformation {
        const product = this.User.productsForSale.find((product) => product.sku == SKU);

        // Prevent buying a product that isn't in the products for sale list
        if (IapHubUtils.IsUndefined(product)) {
            throw new SKUNotForSaleException();
        }

        return product;
    }

    /**
     * Find a transaction in transactions with SKU.
     * @param SKU
     * @param Transactions
     * @exception TransactionNotFoundException
     */
    private FindSKUInTransactions(SKU: string, Transactions: TransactionModel[]) {
        const transaction = Transactions.find((transaction) => transaction.sku == SKU);

        if (IapHubUtils.IsUndefined(transaction)) {
            throw new TransactionNotFoundException();
        }

        return transaction;
    }

    /**
     * Finds active subscription inside a group.
     * @exception UserMustBeAssignedException
     */
    private FindActiveRenewableSubscription(Group: string | undefined): IapHubProductInformation | undefined {
        return this.User.activeProducts.find((item) => {
            return item.type == EIapHubProductTypes.RENEWABLE_SUBSCRIPTION && item.group === Group;
        });
    }

    /**
     * Gets an axios instance
     */
    private GetAxiosInstance() {
        return RestService.Get(this.#apiUrl, this.ApiKey);
    }

    /**
     * Get receipt token of purchase
     * @param Purchase Purchase
     */
    private GetReceiptToken(Purchase: InAppPurchase): string {
        if (this.Platform === 'android') {
            return Purchase.purchaseToken as string;
        } else {
            return Purchase.transactionReceipt;
        }
    }

    /**
     * Detect product type
     * @param SKU Product sku
     * @param NewTransactions Array of new transactions
     * @param OldTransactions Array of old transactions
     */
    private DetectProductType(SKU: string, NewTransactions: TransactionModel[], OldTransactions: TransactionModel[]): EIapHubProductTypes | null {
        this.CheckLogin();

        let ProductType = null;

        try {
            const product = this.FindProductInProductForSale(SKU);
            ProductType = product.type;
        } catch (error) {
        }

        try {
            const transaction = this.FindSKUInTransactions(SKU, NewTransactions);
            ProductType = transaction.type;
        } catch (error) {
        }

        try {
            const transaction = this.FindSKUInTransactions(SKU, OldTransactions);
            ProductType = transaction.type;
        } catch (error) {
        }

        return ProductType as EIapHubProductTypes | null;
    }

    /**
     * Finds product in product info result
     * @param ProductInfos All product informations.
     * @param SKU SKU of a product
     */
    private FindProductInApiProductInfoResult(ProductInfos: (Product | Subscription)[], SKU: string) {
        return ProductInfos.find(info => info.productId === SKU);
    }

    /**
     * Product mapper handler. Builds structured IapHubProductInformation objects
     * @param ProductInfos Product informations
     * @param Product Product metadata
     */
    private FormatProduct(ProductInfos: (Product | Subscription)[], Product: ProductModel): IapHubProductInformation | null {
        const FoundInfo = this.FindProductInApiProductInfoResult(ProductInfos, Product.sku);

        if (IapHubUtils.IsUndefined(FoundInfo)) {
            return null;
        }

        let Result: IapHubProductInformation = {
            sku: Product.sku,
            type: Product.type as unknown as EIapHubProductTypes,
            id: Product.id,
            title: FoundInfo.title,
            description: FoundInfo.description,
            price: FoundInfo.localizedPrice,
            priceCurrency: FoundInfo.currency,
            priceAmount: parseFloat(FoundInfo.price)
        }

        if (FoundInfo.type === "subs" || FoundInfo.type === "sub") {
            Result = {
                ...Result,
                ...this.GetFormattedSubscriptionObject(FoundInfo, Product)
            };
        }

        return Result;
    }

    /**
     * Formats the subscriptions for both of Android and IOS
     * @param ProductInfo
     * @param Product
     */
    private GetFormattedSubscriptionObject(ProductInfo: Subscription, Product: ProductModel | ActiveProductModel) {
        if (this.Platform === "ios") {
            return Iaphub.GetFormattedSubscriptionObjectForIos(ProductInfo, Product);
        } else if (this.Platform === "android") {
            return Iaphub.GetFormattedSubscriptionObjectForAndroid(ProductInfo, Product);
        }
    }

    /**
     * Process an error
     * @param Error Error
     */
    private ProcessError(Error: { code: string, message: string }) {
        let code = EIapHubExceptionCodes.E_UNKNOWN;

        switch(Error.code) {
            case "E_SERVICE_ERROR": code = EIapHubExceptionCodes.E_SERVICE_ERROR; break;
            case "E_USER_CANCELLED": code = EIapHubExceptionCodes.E_USER_CANCELLED; break;
            case "E_ITEM_UNAVAILABLE": code = EIapHubExceptionCodes.E_ITEM_UNAVAILABLE; break;
            case "E_REMOTE_ERROR": code = EIapHubExceptionCodes.E_REMOTE_ERROR; break;
            case "E_NETWORK_ERROR": code = EIapHubExceptionCodes.E_NETWORK_ERROR; break;
            case "E_RECEIPT_FAILED": code = EIapHubExceptionCodes.E_RECEIPT_FAILED; break;
            case "E_RECEIPT_FINISHED_FAILED": code = EIapHubExceptionCodes.E_RECEIPT_FINISHED_FAILED; break;
            case "E_ALREADY_OWNED": code = EIapHubExceptionCodes.E_ALREADY_OWNED; break;
            case "E_DEVELOPER_ERROR": code = EIapHubExceptionCodes.E_DEVELOPER_ERROR; break;
        }

        // Transform error
        const error = new CustomException(Error.message, code);

        // Reject buy request if active
        if (this.#buyRequest) {
            const request = this.#buyRequest;
            this.#buyRequest = null;
            request.reject(error);
        }
    }


    /**
     * Fetches RNIAP and returns all products including subscriptions.
     * @param ProductIds Ids of products
     * @param SubscriptionIds Ids of subscriptions
     */
    private static async GetAllProductInfosFromIAP(ProductIds: string[], SubscriptionIds: string[]) {
        let ProductInfos: Product[] = [];
        let SubscriptionInfos: Subscription[] = [];

        if (ProductIds.length > 0) {
            ProductInfos = await RNIap.getProducts(ProductIds);
        }

        if (SubscriptionIds.length > 0) {
            SubscriptionInfos = await RNIap.getSubscriptions(SubscriptionIds);
        }

        return [...ProductInfos, ...SubscriptionInfos];
    }

    /**
     * Finishes android transaction
     * @param Purchase Purchase Data
     * @param ProductType Product Type
     * @exception ProductTypeMustBeAssignedException
     */
    private static async FinishAndroidTransaction(Purchase: Purchase, ProductType: EIapHubProductTypes) {
        if (IapHubUtils.IsUndefined(ProductType)) {
            throw new ProductTypeMustBeAssignedException();
        }
        // We have to consume 'consumable' and 'subscription' types (The subscription because it is a managed product on android that an user should be able to buy again in the future)
        const shouldBeConsumed = (ProductType === EIapHubProductTypes.CONSUMABLE || ProductType === EIapHubProductTypes.SUBSCRIPTION);

        // If the purchase has already been ackknowledged, no need to finish the transaction (otherwise react-native-iap will throw an error)
        if (!shouldBeConsumed && Purchase.isAcknowledgedAndroid) {
            return;
        }

        await RNIap.finishTransaction(Purchase, shouldBeConsumed);
    }

    /**
     * Finishes IOS transaction
     * @param Purchase Purchase Data
     */
    private static async FinishIosTransaction(Purchase: Purchase) {
        await RNIap.finishTransaction(Purchase);
    }

    /**
     * Converts remote subscription data to a IapHubProductInformation object for Android
     * @param ProductInfo Product information
     * @param Product Product metadata
     */
    private static GetFormattedSubscriptionObjectForAndroid(ProductInfo: Subscription, Product: ProductModel | ActiveProductModel): Partial<IapHubProductInformation> {
        let Result: Partial<IapHubProductInformation> = {};

        Result.subscriptionDuration = ProductInfo.subscriptionPeriodAndroid as EIapHubSubscriptionPeriod;

        if (Product.subscriptionPeriodType === ESubscriptionPeriodType.INTRO) {
            Result.subscriptionIntroPrice = ProductInfo.introductoryPrice;
            Result.subscriptionIntroPriceAmount = IapHubUtils.ConvertIntroductoryPriceToFloat(ProductInfo.introductoryPrice);
            Result.subscriptionIntroPayment = EIapHubIntroductoryPaymentType.AS_YOU_GO;
            Result.subscriptionIntroDuration = ProductInfo.introductoryPricePeriodAndroid as EIapHubSubscriptionPeriod;
            Result.subscriptionIntroCycles = parseInt(ProductInfo.introductoryPriceCyclesAndroid!, 10);
            Result.subscriptionTrialDuration = ProductInfo.freeTrialPeriodAndroid;
        }

        return Result;
    }

    /**
     * Converts remote subscription data to a IapHubProductInformation object for IOS
     * @param ProductInfo Product information
     * @param Product Product metadata
     */
    private static GetFormattedSubscriptionObjectForIos(ProductInfo: Subscription, Product: ProductModel | ActiveProductModel): Partial<IapHubProductInformation> {
        let Result: Partial<IapHubProductInformation> = {};

        Result.subscriptionDuration = IapHubUtils.GetSubscriptionDurationForIos(ProductInfo);

        if (Product.subscriptionPeriodType === ESubscriptionPeriodType.INTRO && !IapHubUtils.IsUndefined(ProductInfo.introductoryPricePaymentModeIOS)) {
            Result.subscriptionIntroPrice = ProductInfo.introductoryPrice;
            Result.subscriptionIntroPriceAmount = IapHubUtils.ConvertIntroductoryPriceToFloat(ProductInfo.introductoryPrice);

            if (ProductInfo.introductoryPricePaymentModeIOS === 'PAYUPFRONT') {
                Result.subscriptionIntroPayment = EIapHubIntroductoryPaymentType.UPFRONT;
                Result.subscriptionIntroDuration = IapHubUtils.GetSubscriptionIntroDurationForIos(EIapHubIntroductoryPaymentType.UPFRONT, ProductInfo);
                Result.subscriptionIntroCycles = 1;
            } else {
                Result.subscriptionIntroPayment = EIapHubIntroductoryPaymentType.AS_YOU_GO;
                Result.subscriptionIntroDuration = IapHubUtils.GetSubscriptionIntroDurationForIos(EIapHubIntroductoryPaymentType.AS_YOU_GO, ProductInfo);
                Result.subscriptionIntroCycles = parseInt(ProductInfo.introductoryPriceNumberOfPeriodsIOS!, 10);
            }
        }

        if (Product.subscriptionPeriodType === ESubscriptionPeriodType.TRIAL) {
            Result.subscriptionTrialDuration = IapHubUtils.GetSubscriptionTrialDurationForIos(ProductInfo);
        }

        return Result;
    }

    //#endregion PRIVATE
}
