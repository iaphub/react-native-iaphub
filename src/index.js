import { Platform } from "react-native";
import * as RNIap from "react-native-iap";

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

    this.onReceiptSuccess = null;
    this.onReceiptError = null;
    this.onPurchaseSuccess = null;
    this.onPurchaseError = null;

    this.purchaseUpdatedEvents = [];
    this.purchaseErrorEvents = [];
  }

  /**************************************************** PUBLIC ********************************************************/

  /*
   * Init service
   * @param {Object} opts Options
   * @param {String} opts.appId - The app id is available on the settings page of your app
   * @param {String} opts.apiKey - The (client) api key is available on the settings page of your app
   * @param {Function} opts.onReceiptSuccess - Event called when a receipt validation has been successful
   * @param {Function} opts.onReceiptError - Event called when a receipt validation has failed
   * @param {Function} opts.onPurchaseSuccess - Event called when a purchase has been processed successfully
   * @param {Function} opts.onPurchaseError - Event called when a purchase has failed
   */
  async init(opts = {}) {
    if (!opts.appId) {
      throw this.error("Missing appId option", "app_id_empty");
    }
    if (!opts.apiKey) {
      throw this.error("Missing apiKey option", "api_key_empty");
    }
    if (!opts.onPurchaseSuccess) {
      throw this.error(
        "Missing onPurchaseSuccess option",
        "on_purchase_success_empty"
      );
    }
    if (!opts.onPurchaseError) {
      throw this.error(
        "Missing onPurchaseError option",
        "on_purchase_error_empty"
      );
    }
    this.appId = opts.appId;
    this.apiKey = opts.apiKey;
    this.isInitialized = true;

    this.onReceiptSuccess = opts.onReceiptSuccess;
    this.onReceiptError = opts.onReceiptError;
    this.onPurchaseSuccess = opts.onPurchaseSuccess;
    this.onPurchaseError = opts.onPurchaseError;

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
      // Otherwise we trigger the error
      else {
        this.emitPurchaseError(err);
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
      await this.emitPurchaseError(err);
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
   * @param {String} productSku Product sku
   */
  async buy(productSku) {
    if (!this.isLogged) {
      throw this.error("Login required", "login_required");
    }
    try {
      var product = this.user.productsForSale.find((product) => product.sku == productSku);

      if (!product) {
        throw this.error(
          `Buy failed, product sku not in the products for sale`,
          "sku_not_found"
        );
      }
      if (product.type.indexOf("subscription") != -1) {
        await RNIap.requestSubscription(product.sku, false);
      } else {
        await RNIap.requestPurchase(product.sku, false);
      }
    } catch (err) {
      throw this.error(
        `Buy failed (Err: ${err.message})`,
        err.code || "unknown"
      );
    }
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

    var formatProduct = (product) => {
      var infos = productsInfos.find(info => info.productId == product.sku);

      if (!infos) {
        console.error(`Product sku '${product.sku} not found'`);
        return null;
      }
      return {
        id: product.id,
        type: product.type,
        sku: product.sku,
        title: infos.title,
        description: infos.description,
        price: infos.price,
        currency: infos.currency,
        localizedPrice: infos.localizedPrice,
        introductoryPrice: infos.introductoryPrice
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
        price: product.price,
        currency: product.currency
      };

      if (product.introductoryPrice) {
        item.introPrice = product.introductoryPrice.match(/\b\d+(?:.\d+)?/)[0];
      }
      return item;
    });

    await this.request("post", "/pricing", {products: products});
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
        // Emit receipt success event
        await this.emitReceiptSuccess(receipt);
      }
      // Otherwise emit receipt error event (A restore won't be needed, IAPHUB will retry processing the receipt)
      else if (response.status == "failed") {
        shouldFinishReceipt = true;
        newTransactions = await this.emitReceiptError(
          this.error("Receipt validation failed", "receipt_validation_error"),
          receipt
        );
        // Finish the receipt if the function returns undefined or an array of transactions
        if (newTransactions != false) {
          shouldFinishReceipt = true;
        }
      }
    } catch (err) {
      // If any error, emit the receipt error and stop the processing, the receipt won't be finished (A restore will be needed)
      newTransactions = await this.emitReceiptError(err, receipt);
      // Finish the receipt if the function returns an array of transactions
      if (Array.isArray(newTransactions)) {
        shouldFinishReceipt = true;
      }
    }
    // Emit purchase success event
    if (Array.isArray(newTransactions) && newTransactions.length) {
      newTransactions.reduce(async (promise, transaction) => {
        await promise;
        await this.emitPurchaseSuccess(transaction);
      }, Promise.resolve());
    }
    // Finish receipt (We finish the receipt even if the status is failed since IAPHUB will automatically retry the receipt)
    if (shouldFinishReceipt) {
      var productType = await this.detectProductType(
        receipt.sku,
        newTransactions,
        oldTransactions
      );

      await this.finishReceipt(purchase, productType);
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
   * Emit receipt success
   */
  async emitReceiptSuccess(...params) {
    if (!this.onReceiptSuccess) return;
    try {
      await this.onReceiptSuccess(...params);
    } catch (err) {
      console.error(err);
    }
  }

  /*
   * Emit receipt error
   */
  async emitReceiptError(...params) {
    if (!this.emitReceiptError) return;
    try {
      await this.onReceiptError(...params);
    } catch (err) {
      console.error(err);
    }
  }

  /*
   * Emit purchase success
   */
  async emitPurchaseSuccess(...params) {
    if (!this.onPurchaseSuccess) return;
    try {
      await this.onPurchaseSuccess(...params);
    } catch (err) {
      console.error(err);
    }
  }

  /*
   * Emit purchase error
   */
  async emitPurchaseError(...params) {
    if (!this.onPurchaseError) return;
    try {
      await this.onPurchaseError(...params);
    } catch (err) {
      console.error(err);
    }
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
