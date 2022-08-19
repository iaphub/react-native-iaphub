import Foundation
import Iaphub

@objc(RNIaphub)
class RNIaphub: RCTEventEmitter, IaphubDelegate {
   
   private var hasListeners = false
   
   
   override static func requiresMainQueueSetup() -> Bool {
      return true
   }
   
   override func startObserving() {
      hasListeners = true
   }

   override func stopObserving() {
      hasListeners = false
   }
   
   override func supportedEvents() -> [String]! {
       return ["onUserUpdate", "onError", "onBuyRequest", "onReceipt"]
   }
   
   /***************************** EVENTS ******************************/
   
   /**
    Listen for user update event
    */
   func didReceiveUserUpdate() {
      if (!self.hasListeners) {
         return
      }
      self.sendEvent(withName: "onUserUpdate", body: nil)
   }
   
   /**
    Listen for error event
    */
   func didReceiveError(err: IHError) {
      if (!self.hasListeners) {
         return
      }
      self.sendEvent(withName: "onError", body: err.getDictionary())
   }
   
   /**
    Listen for buy request event
    */
   func didReceiveBuyRequest(sku: String) {
      if (!self.hasListeners) {
         return
      }
      self.sendEvent(withName: "onBuyRequest", body: ["sku": sku])
   }
   
   /**
    Listen for receipt event
    */
   func didProcessReceipt(err: IHError?, receipt: IHReceipt?) {
      if (!self.hasListeners) {
         return
      }
      self.sendEvent(withName: "onReceipt", body: [
         "err": err?.getDictionary(),
         "receipt": receipt?.getDictionary()
      ])
   }
   
   /***************************** PUBLIC ******************************/

   /**
    Start IAPHUB
    */
    @objc
    func start(_ options: NSDictionary) -> Void {
      let appId = options.value(forKey: "appId") as? String ?? ""
      let apiKey = options.value(forKey: "apiKey") as? String ?? ""
      let userId = options.value(forKey: "userId") as? String
      let allowAnonymousPurchase = options.value(forKey: "allowAnonymousPurchase") as? Bool ?? false
      let environment = options.value(forKey: "environment") as? String ?? "production"
      let sdkVersion = options.value(forKey: "sdkVersion") as? String ?? ""

      Iaphub.delegate = self
      Iaphub.start(
         appId: appId,
         apiKey: apiKey,
         userId: userId,
         allowAnonymousPurchase: allowAnonymousPurchase,
         environment: environment,
         sdk: "react_native",
         sdkVersion: sdkVersion
      )
    }
   
   /**
    Stop IAPHUB
    */
    @objc
    func stop() -> Void {
       Iaphub.stop()
    }
   
   /**
    Login
    */
   @objc
   func login(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      Iaphub.login(userId: userId, { (err) in
         if let err = err {
            return reject("iaphub_error", self.createError(err), nil)
         }
         resolve(nil)
      })
   }
   
   /**
    Logout
    */
   @objc
   func logout() {
      Iaphub.logout()
   }
   
   /**
    Set device params
    */
   @objc
   func setDeviceParams(_ params: Dictionary<String, String>) {
      Iaphub.setDeviceParams(params: params)
   }
   
   /**
    Set user tags
    */
   @objc
   func setUserTags(_ tags: Dictionary<String, String>, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      Iaphub.setUserTags(tags: tags, { (err) in
         if let err = err {
            return reject("iaphub_error", self.createError(err), nil)
         }
         resolve(nil)
      })
   }
   
   /**
    Buy
    */
   @objc
   func buy(_ sku: String, options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      let crossPlatformConflict = options.value(forKey: "crossPlatformConflict") as? Bool ?? true
      
      Iaphub.buy(sku: sku, crossPlatformConflict: crossPlatformConflict, { (err, transaction) in
         if let err = err {
            return reject("iaphub_error", self.createError(err), nil)
         }
         resolve(transaction?.getDictionary())
      })
   }
   
   /**
    Restore
    */
   @objc
   func restore(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      Iaphub.restore({ (err) in
         if let err = err {
            return reject("iaphub_error", self.createError(err), nil)
         }
         resolve(nil)
      })
   }
   
   /**
    Get active products
    */
   @objc
   func getActiveProducts(_ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      let includeSubscriptionStates = options.value(forKey: "includeSubscriptionStates") as? [String] ?? []
      
      Iaphub.getActiveProducts(includeSubscriptionStates: includeSubscriptionStates, { (err, products) in
         if let err = err {
            return reject("iaphub_error", self.createError(err), nil)
         }
         resolve(products?.map({ (product) in product.getDictionary()}))
      })
   }
   
   /**
    Get products for sale
    */
   @objc
   func getProductsForSale(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      Iaphub.getProductsForSale({ (err, products) in
         if let err = err {
            return reject("iaphub_error", self.createError(err), nil)
         }
         resolve(products?.map({ (product) in product.getDictionary()}))
      })
   }
   
   /**
    Get products (active and for sale)
    */
   @objc
   func getProducts(_ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      let includeSubscriptionStates = options.value(forKey: "includeSubscriptionStates") as? [String] ?? []
      
      Iaphub.getProducts(includeSubscriptionStates: includeSubscriptionStates, { (err, productsForSale, activeProducts) in
         if let err = err {
            return reject("iaphub_error", self.createError(err), nil)
         }
         resolve([
            "productsForSale": productsForSale?.map({ (product) in product.getDictionary()}),
            "activeProducts": activeProducts?.map({ (product) in product.getDictionary()})
         ])
      })
   }
   
   /**
    Present code redemption
    */
   @objc
   func presentCodeRedemptionSheet(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      Iaphub.presentCodeRedemptionSheet({ (err) in
         if let err = err {
            return reject("iaphub_error", self.createError(err), nil)
         }
         resolve(nil)
      })
   }
   
   /***************************** PRIVATE ******************************/
   
   /**
    Create error
    */
   func createError(_ err: IHError) -> String? {
      if let json = try? JSONSerialization.data(withJSONObject: err.getDictionary()) {
         return String(data: json, encoding: .utf8)
      }
      return nil
   }
}
