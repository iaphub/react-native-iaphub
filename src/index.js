import { Platform } from "react-native";
import * as RNIap from "react-native-iap";
import pkg from '../package.json';

class Iaphub {

  constructor() {
    this.apiUrl = "https://api.iaphub.com/v1";
    this.platform = Platform.OS;
    this.products = [];
    this.appId = null;
    this.apiKey = null;
    this.userId = null;
    this.user = null;
    this.isInitialized = false;
    this.isLogged = false;
    this.canMakePayments = true;
    this.onReceiptProcessed = null;
    this.buyRequest = null;
    this.purchaseUpdatedEvents = [];
    this.purchaseErrorEvents = [];
  }

  /**************************************************** PUBLIC ********************************************************/

  /*
   * Init service
   * @param {Object} opts Options
   * @param {String} opts.appId - The app id is available on the settings page of your app
   * @param {String} opts.apiKey - The (client) api key is available on the settings page of your app
   * @param {String} opts.environment - Environment used to determine the webhook configuration
   * @param {Function} opts.onReceiptProcessed - Event triggered after IAPHUB processed a receipt
   */
  async init(opts = {}) {
    if (!opts.appId) {
      throw this.error("Missing appId option", "app_id_empty");
    }
    if (!opts.apiKey) {
      throw this.error("Missing apiKey option", "api_key_empty");
    }
    this.appId = opts.appId;
    this.apiKey = opts.apiKey;
    this.environment = opts.environment || "production";
    this.isInitialized = true;
    this.onReceiptProcessed = opts.onReceiptProcessed;

    // Init connection
    try {
      var status = await RNIap.initConnection();
      // On ios initConnection will return the result of canMakePayments
      if (this.platform == "ios" && status == "false") {
        this.canMakePayments = false;
      }
    } catch (err) {
      // Check init connection errors
      if (err.message.indexOf("Billing is unavailable") != -1) {
        throw this.error(`The billing is not available`, "billing_unavailable");
      } else {
        throw this.error(
          `Unknown billing error, did you install react-native-iap properly? (Err: ${err.message})`,
          "billing_error"
        );
      }
    }
    // Init listeners
    RNIap.purchaseUpdatedListener(async (purchase) => {
      // If the user isn't logged we save the event in a queue (that will be executed when the user login)
      if (!this.isLogged) {
        this.purchaseUpdatedEvents.push(purchase);
      }
      // Otherwise we process the receipt
      else {
        await this.processReceipt(purchase);
      }
    });
    RNIap.purchaseErrorListener((err) => {
      // If the user isn't logged we save the event in a queue (that will be executed when the user login)
      if (!this.isLogged) {
        this.purchaseErrorEvents.push(err);
      }
      // Otherwise process the error
      else {
        this.processError(err);
      }
    });
  }

  /*
   * Login user
   * @param {String} userId User id
   */
  async login(userId) {
    if (!userId) {
      throw this.error("Missing userId", "user_id_empty");
    }
    if (typeof userId != "string") {
      throw this.error("Invalid userId, it must be a string", "user_id_invalid");
    }
    if (!this.isInitialized) {
      throw this.error("IAPHUB hasn't been initialized", "init_missing");
    }
    this.userId = userId;
    this.isLogged = true;
    // Execute purchase updated events received prior to initialize
    await this.purchaseUpdatedEvents.reduce(async (promise, purchase) => {
      await promise;
      await this.processReceipt(purchase);
    }, Promise.resolve());
    this.purchaseUpdatedEvents = [];
    // Execute purchase error events received prior to initialize
    await this.purchaseErrorEvents.reduce(async (promise, err) => {
      await promise;
      this.processError(err);
    }, Promise.resolve());
    this.purchaseErrorEvents = [];
  }

  /*
   * Logout user
   */
  async logout() {
    this.user = null;
    this.userId = null;
    this.isLogged = false;
  }

  /*
   * Buy product
   * @param {String} sku Product sku
   */
  async buy(sku) {
    // The user has to be logged in
    if (!this.isLogged) {
      throw this.error("Login required", "login_required");
    }
    // Get product of the sku
    var product = this.user.productsForSale.find((product) => product.sku == sku);
    // Prevent buying a product that isn't in the products for sale list
    if (!product) {
      throw this.error(
        `Buy failed, product sku not in the products for sale`,
        "sku_not_for_sale"
      );
    }
    // Create promise than will be resolved (or rejected) after process of the receipt is complete
    var buyPromise = new Promise((resolve, reject) => {
      this.buyRequest = {resolve, reject, sku};
    });
    // Request purchase
    try {
      if (product.type.indexOf("subscription") != -1) {
        await RNIap.requestSubscription(product.sku, false);
      } else {
        await RNIap.requestPurchase(product.sku, false);
      }
    }
    // Transform request purchase/subscription errors
    catch (err) {
      this.processError(err);
    }
    // Return promise
    return buyPromise;
  }

  /*
   * Get user
   */
  async getUser(params = {}) {
    if (!this.isLogged) {
      throw this.error("Login required", "login_required");
    }
    var data = await this.request("get", "", params);

    if (!data || !data.productsForSale) {
      throw this.error(
        "The Iaphub API returned an unexpected response",
        "unexpected_response"
      );
    }
    var products = [].concat(data.productsForSale).concat(data.activeProducts);
    var productIds = products
      .filter(item => item.type.indexOf("renewable_subscription") == -1)
      .map(item => item.sku);
    var subscriptionIds = products
      .filter(item => item.type.indexOf("renewable_subscription") != -1)
      .map(item => item.sku);
    var productsInfos = [];

    if (productIds.length) {
      productsInfos = await RNIap.getProducts(productIds);
    }
    if (subscriptionIds.length) {
      productsInfos = productsInfos.concat(
        await RNIap.getSubscriptions(subscriptionIds)
      );
    }

    var convertToISO8601 = (numberOfPeriods, periodType) => {
      if (!numberOfPeriods || !periodType) {
        return undefined;
      }
      var periodTypes = {
        "DAY": `P${numberOfPeriods}D`,
        "WEEK": `P${numberOfPeriods}W`,
        "MONTH": `P${numberOfPeriods}M`,
        "YEAR": `P${numberOfPeriods}Y`
      };

      return periodTypes[periodType];
    }

    var formatProduct = (product) => {
      var infos = productsInfos.find(info => info.productId == product.sku);

      if (!infos) {
        console.error(`Product sku '${product.sku} not found'`);
        return null;
      }
      return {
        ...product,
        // Product title
        title: infos.title,
        // Product description
        description: infos.description,
        // Localized price
        price: infos.localizedPrice,
        // Price currency
        priceCurrency: infos.currency,
        // Price amount
        priceAmount: parseFloat(infos.price),
        // Only for a renewable subscription
        ...(product.type == "renewable_subscription" ? {
          // Duration of the subscription cycle specified in the ISO 8601 format
          subscriptionDuration: (() => {
            // Ios
            if (this.platform == "ios") {
              return convertToISO8601(infos.subscriptionPeriodNumberIOS, infos.subscriptionPeriodUnitIOS);
            }
            // Android
            else if (this.platform == "android") {
              return infos.subscriptionPeriodAndroid;
            }
          })()
        } : {}),
        // Only for a renewable subscription with an intro mode
        ...((product.type == "renewable_subscription" && product.subscriptionPeriodType == 'intro') ? {
          // Localized introductory price
          subscriptionIntroPrice: infos.introductoryPrice,
          // Introductory price amount
          subscriptionIntroPriceAmount: infos.introductoryPrice ? parseFloat(infos.introductoryPrice.match(/\b\d+(?:.\d+)?/)[0]) : undefined,
          // Payment type of the introductory offer
          subscriptionIntroPayment: (() => {
            // Ios
            if (this.platform == "ios") {
              return {
                "PAYASYOUGO": "as_you_go",
                "PAYUPFRONT": "upfront"
              }[infos.introductoryPricePaymentModeIOS];
            }
            // Android
            else if (this.platform == "android") {
              return "as_you_go";
            }
          })(),
          // Duration of an introductory cycle specified in the ISO 8601 format
          subscriptionIntroDuration: (() => {
            // Ios
            if (this.platform == "ios") {
              // The user pays directly a price for a number of weeks, months...
              if (infos.introductoryPricePaymentModeIOS == "PAYUPFRONT") {
                return convertToISO8601(infos.introductoryPriceNumberOfPeriodsIOS, infos.introductoryPriceSubscriptionPeriodIOS);
              }
              // The introductory subscription duration is the same as a regular subscription (Only the number of cycles can change)
              else if (infos.introductoryPricePaymentModeIOS == "PAYASYOUGO") {
                return convertToISO8601(infos.subscriptionPeriodNumberIOS, infos.subscriptionPeriodUnitIOS);
              }
            }
            // Android
            else if (this.platform == "android") {
              return infos.introductoryPricePeriodAndroid;
            }
          })(),
          // Number of cycles in the introductory offer
          subscriptionIntroCycles: (() => {
            // Ios
            if (this.platform == "ios") {
              if (infos.introductoryPricePaymentModeIOS == "PAYUPFRONT") {
                return 1;
              }
              else if (infos.introductoryPricePaymentModeIOS == "PAYASYOUGO") {
                return parseInt(infos.introductoryPriceNumberOfPeriodsIOS, 10);
              }
            }
            // Android
            else if (this.platform == "android") {
              return parseInt(infos.introductoryPriceCyclesAndroid, 10);
            }
          })(),
        } : {}),
        // Only for a renewable subscription with a trial mode
        ...((product.type == "renewable_subscription" && product.subscriptionPeriodType == 'trial') ? {
          subscriptionTrialDuration: (() => {
            // Ios
            if (this.platform == "ios") {
              return convertToISO8601(infos.introductoryPriceNumberOfPeriodsIOS, infos.introductoryPriceSubscriptionPeriodIOS);
            }
            // Android
            else if (this.platform == "android") {
              return infos.freeTrialPeriodAndroid;
            }
          })()
        } : {})
      };
    };

    this.user = {
      productsForSale: data.productsForSale.map(formatProduct).filter(product => product),
      activeProducts: data.activeProducts.map(formatProduct).filter(product => product)
    };

    try {
      await this.setPricing(
        [].concat(this.user.productsForSale).concat(this.user.activeProducts)
      );
    } catch (err) {
      console.error(err);
    }
    return this.user;
  }

  /*
   * Set user tags
   */
  async setUserTags(tags) {
    if (!this.isLogged) {
      throw this.error("Login required", "login_required");
    }
    try {
      await this.request("post", "", {tags: tags});
    } catch (err) {
      throw this.error(
        `Set user tags failed (Err: ${err.message})`,
        err.code || "unknown"
      );
    }
  }

  /*
   * Restore purchases
   */
  async restore() {
    if (!this.isLogged) {
      throw this.error("Login required", "login_required");
    }
    try {
      var availablePurchases = await RNIap.getAvailablePurchases();
      var restoredPurchases = [];
      var purchases = [];

      // Filter duplicate receipts
      availablePurchases.forEach((purchase) => {
        var hasDuplicate = purchases.find(
          (item) => this.getReceiptToken(item) == this.getReceiptToken(purchase)
        );
        if (!hasDuplicate) purchases.push(purchase);
      });
      // Process receipts
      await purchases.reduce(async (promise, purchase) => {
        await promise;
        var newTransactions = await this.processReceipt(purchase, true);
        restoredPurchases.push(...newTransactions);
      }, Promise.resolve());

      return restoredPurchases;
    } catch (err) {
      throw this.error(
        `Restore failed (Err: ${err.message})`,
        err.code || "unknown"
      );
    }
  }

  /**************************************************** PRIVATE ********************************************************/

  /*
   * Get receipt token of purchase
   * @param {Object} purchase Purchase
   */
  getReceiptToken(purchase) {
    return this.platform == "android" ? purchase.purchaseToken : purchase.transactionReceipt;
  }

  /*
   * Set pricing
   * @param {Array} products Array of products
   */
  async setPricing(products) {
    products = products.map((product) => {
      var item = {
        id: product.id,
        price: product.priceAmount,
        currency: product.priceCurrency
      };

      if (product.subscriptionIntroPriceAmount) {
        item.introPrice = product.subscriptionIntroPriceAmount;
      }
      return item;
    });

    await this.request("post", "/pricing", {products: products});
  }

  /*
   * Process an error
   * @param {Object} err Error
   */
  processError(err) {
    var errors = {
      // Unknown error
      "E_UNKNOWN": "unknown",
      // Billing is unavailable
      "E_SERVICE_ERROR": "billing_unavailable",
      // Purchase popup closed by the user
      "E_USER_CANCELLED": "user_cancelled",
      // Item not available for purchase
      "E_ITEM_UNAVAILABLE": "item_unavailable",
      // Remote error
      "E_REMOTE_ERROR": "remote_error",
      // Network error
      "E_NETWORK_ERROR": "network_error",
      // Receipt failed
      "E_RECEIPT_FAILED": "receipt_failed",
      // Receipt finish failed
      "E_RECEIPT_FINISHED_FAILED": "receipt_finish_failed",
      // Product already owned, it must be consumed before being bought again
      "E_ALREADY_OWNED": "product_already_owned",
      // Developer error, the product sku is probably invalid
      "E_DEVELOPER_ERROR": "developer_error"
    };
    // Transform error
    var error = this.error(err.message, errors[err.code] || "unknown");
    // Reject buy request if active
    if (this.buyRequest) {
      var request = this.buyRequest;

      this.buyRequest = null;
      request.reject(error);
    }
  }

  /*
   * Process a receipt
   * @param {Object} purchase Purchase
   */
  async processReceipt(purchase, isRestore = false) {
    var receipt = {
      token: this.getReceiptToken(purchase),
      sku: purchase.productId,
      isRestore: isRestore
    };
    var newTransactions = [];
    var oldTransactions = [];
    var shouldFinishReceipt = false;
    var error = null;

    // Process receipt with IAPHUB
    try {
      var response = await this.request("post", "/receipt", {
        token: receipt.token,
        sku: receipt.sku
      });
      // If the receipt validation is a success
      if (response.status == "success") {
        newTransactions = response.newTransactions;
        oldTransactions = response.oldTransactions;
        shouldFinishReceipt = true;
      }
      // Otherwise emit receipt error event (A restore won't be needed, IAPHUB will retry processing the receipt)
      else if (response.status == "failed") {
        shouldFinishReceipt = true;
        error = this.error("Receipt validation on IAPHUB failed", "receipt_validation_failed");
      }
    }
    // If it fails we won't finish the receipt
    catch (err) {
      error = this.error("Receipt request to IAPHUB failed", "receipt_request_failed");
    }
    // Finish receipt
    if (shouldFinishReceipt) {
      var productType = await this.detectProductType(
        receipt.sku,
        newTransactions,
        oldTransactions
      );
      await this.finishReceipt(purchase, productType);
    }
    // Emit receipt processed event
    try {
      var newTransactionsOverride = await this.emitReceiptProcessed(error, receipt);
      if (Array.isArray(newTransactionsOverride)) {
        newTransactions = newTransactionsOverride;
      }
    } catch (err) {
      error = err;
    }
    // Resolve buy request if active
    if (this.buyRequest) {
      var request = this.buyRequest;
      // Delete saved request
      this.buyRequest = null;
      // Get transaction
      var transaction = newTransactions.find((item) => item.sku == request.sku);
      // Reject the request if there is no transaction
      if (!transaction) {
        this.error("Transaction not found", "transaction_not_found");
      }
      // If there was an error, reject the request
      if (error) {
        request.reject(error);
      }
      // Otherwise resolve with the transaction
      else {
        var product = this.user.productsForSale.find((product) => product.sku == transaction.sku);
        request.resolve({...product, ...transaction});
      }
    }
    return newTransactions || [];
  }

  /*
   * Detect product type
   * @param {String} sku Product sku
   * @param {Array} newTransactions Array of new transactions
   * @param {Array} oldTransactions Array of old transactions
   */
  async detectProductType(sku, newTransactions, oldTransactions) {
    var productType = null;

    // Try to get the product type from the user productsForSale
    if (!this.user) {
      try {
        await this.getUser();
      } catch (err) {}
    }
    if (this.user && this.user.productsForSale) {
      var product = this.user.productsForSale.find((product) => product.sku == sku);
      if (product) productType = product.type;
    }
    // Otherwise, try to get the product type in the new transactions
    if (productType == null && Array.isArray(newTransactions)) {
      var transaction = newTransactions.find((transaction) => transaction.sku == sku);
      if (transaction) {
        productType = transaction.type;
      }
    }
    // Otherwise, try to get the product type in the response old transactions
    if (productType == null && Array.isArray(oldTransactions)) {
      var transaction = oldTransactions.find((transaction) => transaction.sku == sku);
      if (transaction) {
        productType = transaction.type;
      }
    }

    return productType;
  }

  /*
   * Finish a receipt
   * @param {Object} purchase Purchase
   * @param {String} productType Product type
   */
  async finishReceipt(purchase, productType) {
    // Finish android transaction
    if (this.platform == "android") {
      // If we didn't find the product type we cannot finish the transaction properly
      if (!productType) {
        throw this.error(
          "Cannot finish android receipt, product type required",
          "product_type_required"
        );
      }
      // We have to consume 'consumable' and 'subscription' types (The subscription because it is a managed product on android that an user should be able to buy again in the future)
      var shouldBeConsumed = (["consumable", "subscription"].indexOf(productType) != -1) ? true : false;
      await RNIap.finishTransaction(purchase, shouldBeConsumed);
    }
    // Finish ios transaction
    else {
      await RNIap.finishTransaction(purchase);
    }
  }

  /*
   * Api request to IAPHUB
   */
  async request(type, url = "", params = {}) {
    var opts = {method: type, headers: {}};

    // Check appId and userId
    if (!this.appId) throw "app_id_empty";
    if (!this.apiKey) throw "api_key_empty";
    if (!this.userId) throw "user_id_empty";
    // Default params
    params.platform = this.platform;
    params.environment = this.environment;
    params.libraryName = 'react_native';
    params.libraryVersion = pkg.version;
    // Handle get request
    if (type == "get") {
      var query = "";

      for (var param in params) {
        var value = params[param];
        query += !query.length ? "?" : "&";
        query += `${param}=${value}`;
      }
      url += query;
    }
    // Handle post request
    else if (type == "post") {
      opts.body = JSON.stringify(params);
    }
    // Add headers
    Object.assign(opts.headers, {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `ApiKey ${this.apiKey}`
    });

    var json = {};

    try {
      var response = await fetch(
        `${this.apiUrl}/app/${this.appId}/user/${this.userId}${url}`,
        opts
      );
      json = await response.json();
    } catch (err) {
      throw this.error(
        `Network error, request to the Iaphub API failed (${err.message})`,
        "network_error"
      );
    }

    if (json.error) {
      throw this.error(
        `The ${url} api request returned an error (${json.error})`,
        json.error
      );
    }
    return json;
  }

  /*
   * Emit receipt processed event
   */
  async emitReceiptProcessed(...params) {
    if (!this.onReceiptProcessed) return;
    var transactions = null

    try {
      transactions = await this.onReceiptProcessed(...params);
    } catch (err) {
      console.error(err);
    }
    return transactions;
  }

  /*
   * Create error
   */
  error(message, code) {
    var err = new Error(message);

    err.code = code;
    return err;
  }

}

export default new Iaphub();

export var EIapHubEnvironment;
(function (EIapHubEnvironment) {
    EIapHubEnvironment["PRODUCTION"] = "production";
    EIapHubEnvironment["STAGING"] = "staging";
    EIapHubEnvironment["DEVELOPMENT"] = "development";
})(EIapHubEnvironment || (EIapHubEnvironment = {}));
export var EIapHubProductTypes;
(function (EIapHubProductTypes) {
    EIapHubProductTypes["CONSUMABLE"] = "consumable";
    EIapHubProductTypes["NON_CONSUMABLE"] = "non_consumable";
    EIapHubProductTypes["SUBSCRIPTION"] = "subscription";
    EIapHubProductTypes["RENEWABLE_SUBSCRIPTION"] = "renewable_subscription";
})(EIapHubProductTypes || (EIapHubProductTypes = {}));
export var EIapHubSubscriptionPeriod;
(function (EIapHubSubscriptionPeriod) {
    EIapHubSubscriptionPeriod["PER_1_WEEK"] = "P1W";
    EIapHubSubscriptionPeriod["PER_1_MONTH"] = "P1M";
    EIapHubSubscriptionPeriod["PER_3_MONTHS"] = "P3M";
    EIapHubSubscriptionPeriod["PER_6_MONTHS"] = "P6M";
    EIapHubSubscriptionPeriod["PER_1_YEAR"] = "P1Y";
})(EIapHubSubscriptionPeriod || (EIapHubSubscriptionPeriod = {}));
export var EIapHubSubscriptionPeriodType;
(function (EIapHubSubscriptionPeriodType) {
    EIapHubSubscriptionPeriodType["NORMAL"] = "normal";
    EIapHubSubscriptionPeriodType["TRIAL"] = "trial";
    EIapHubSubscriptionPeriodType["INTRO"] = "intro";
})(EIapHubSubscriptionPeriodType || (EIapHubSubscriptionPeriodType = {}));
export var EIapHubIntroductoryPaymentType;
(function (EIapHubIntroductoryPaymentType) {
    EIapHubIntroductoryPaymentType["AS_YOU_GO"] = "as_you_go";
    EIapHubIntroductoryPaymentType["UPFRONT"] = "upfront";
})(EIapHubIntroductoryPaymentType || (EIapHubIntroductoryPaymentType = {}));
export var EIapHubWebhookStatus;
(function (EIapHubWebhookStatus) {
    EIapHubWebhookStatus["FAILED"] = "failed";
    EIapHubWebhookStatus["SUCCESS"] = "success";
})(EIapHubWebhookStatus || (EIapHubWebhookStatus = {}));
export var EIapHubPurchaseErrorCodes;
(function (EIapHubPurchaseErrorCodes) {
    EIapHubPurchaseErrorCodes["USER_CANCELLED"] = "user_cancelled";
    EIapHubPurchaseErrorCodes["PRODUCT_ALREADY_OWNED"] = "product_already_owned";
    EIapHubPurchaseErrorCodes["RECEIPT_VALIDATION_FAILED"] = "receipt_validation_failed";
    EIapHubPurchaseErrorCodes["RECEIPT_REQUEST_FAILED"] = "receipt_request_failed";
})(EIapHubPurchaseErrorCodes || (EIapHubPurchaseErrorCodes = {}));
