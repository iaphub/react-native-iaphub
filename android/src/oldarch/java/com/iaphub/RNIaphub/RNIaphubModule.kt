package com.iaphub.RNIaphub

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RNIaphubModule.NAME)
class RNIaphubModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private val delegate = RNIaphubModuleImpl(reactContext)

  override fun getName() = NAME

  @ReactMethod
  fun addListener(eventName: String?) {
    delegate.addListener(eventName)
  }

  @ReactMethod
  fun removeListeners(count: Int?) {
    delegate.removeListeners(count)
  }

  @ReactMethod
  fun start(options: ReadableMap, promise: Promise) {
    delegate.start(options, promise)
  }

  @ReactMethod
  fun stop(promise: Promise) {
    delegate.stop(promise)
  }

  @ReactMethod
  fun getSDKVersion(promise: Promise) {
    delegate.getSDKVersion(promise)
  }

  @ReactMethod
  fun setLang(lang: String, promise: Promise) {
    delegate.setLang(lang, promise)
  }

  @ReactMethod
  fun login(userId: String, promise: Promise) {
    delegate.login(userId, promise)
  }

  @ReactMethod
  fun getUserId(promise: Promise) {
    delegate.getUserId(promise)
  }

  @ReactMethod
  fun logout(promise: Promise) {
    delegate.logout(promise)
  }

  @ReactMethod
  fun setDeviceParams(params: ReadableMap, promise: Promise) {
    delegate.setDeviceParams(params, promise)
  }

  @ReactMethod
  fun setUserTags(tags: ReadableMap, promise: Promise) {
    delegate.setUserTags(tags, promise)
  }

  @ReactMethod
  fun buy(sku: String, options: ReadableMap, promise: Promise) {
    delegate.buy(sku, options, promise)
  }

  @ReactMethod
  fun restore(promise: Promise) {
    delegate.restore(promise)
  }

  @ReactMethod
  fun getActiveProducts(options: ReadableMap, promise: Promise) {
    delegate.getActiveProducts(options, promise)
  }

  @ReactMethod
  fun getProductsForSale(promise: Promise) {
    delegate.getProductsForSale(promise)
  }

  @ReactMethod
  fun getProducts(options: ReadableMap, promise: Promise) {
    delegate.getProducts(options, promise)
  }

  @ReactMethod
  fun getBillingStatus(promise: Promise) {
    delegate.getBillingStatus(promise)
  }

  @ReactMethod
  fun presentCodeRedemptionSheet(promise: Promise) {
    delegate.presentCodeRedemptionSheet(promise)
  }

  @ReactMethod
  fun showManageSubscriptions(options: ReadableMap, promise: Promise) {
    delegate.showManageSubscriptions(options, promise)
  }

  companion object {
    const val NAME = "NativeIaphub"
  }
}
