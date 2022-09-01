#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(RNIaphub, RCTEventEmitter)

RCT_EXTERN_METHOD(
   start:                  (NSDictionary)options
)

RCT_EXTERN_METHOD(stop)

RCT_EXTERN_METHOD(
   login:                  (NSString)userId
   resolver:               (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(logout)

RCT_EXTERN_METHOD(
   setDeviceParams:        (NSDictionary)params
)

RCT_EXTERN_METHOD(
   setUserTags:            (NSDictionary)tags
   resolver:               (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   buy:                    (NSString)sku
   options:                (NSDictionary)options
   resolver:               (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   restore:                (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   getActiveProducts:      (NSDictionary)options
   resolver:               (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   getProductsForSale:     (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   getActiveProducts:      (NSDictionary)options
   resolver:               (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   getProducts:            (NSDictionary)options
   resolver:               (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   presentCodeRedemptionSheet:   (RCTPromiseResolveBlock)resolve
   rejecter:                     (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   showManageSubscriptions:      (NSDictionary)options
   resolver:                     (RCTPromiseResolveBlock)resolve
   rejecter:                     (RCTPromiseRejectBlock)reject
)

@end
