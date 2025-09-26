#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(NativeIaphub, RCTEventEmitter)

RCT_EXTERN_METHOD(
   start:                  (NSDictionary)options
   resolver:               (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   stop:                   (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   getSDKVersion:          (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   setLang:                (NSString)lang
   resolver:               (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   login:                  (NSString)userId
   resolver:               (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   getUserId:              (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   logout:                 (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
   setDeviceParams:        (NSDictionary)params
   resolver:               (RCTPromiseResolveBlock)resolve
   rejecter:               (RCTPromiseRejectBlock)reject
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
   getBillingStatus:       (RCTPromiseResolveBlock)resolve
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