package com.iaphub.RNIaphub

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.iaphub.RNIaphub.NativeIaphubSpec

class RNIaphubModule(reactContext: ReactApplicationContext) : NativeIaphubSpec(reactContext) {

  private val delegate = RNIaphubModuleImpl(reactContext)

  override fun getName() = NAME

  override fun addListener(eventName: String?) {
    delegate.addListener(eventName)
  }

  override fun removeListeners(count: Double) {
    delegate.removeListeners(count.toInt())
  }

  override fun start(options: ReadableMap, promise: Promise) {
    delegate.start(options, promise)
  }

  override fun stop(promise: Promise) {
    delegate.stop(promise)
  }

  override fun getSDKVersion(promise: Promise) {
    delegate.getSDKVersion(promise)
  }

  override fun setLang(lang: String, promise: Promise) {
    delegate.setLang(lang, promise)
  }

  override fun login(userId: String, promise: Promise) {
    delegate.login(userId, promise)
  }

  override fun getUserId(promise: Promise) {
    delegate.getUserId(promise)
  }

  override fun logout(promise: Promise) {
    delegate.logout(promise)
  }

  override fun setDeviceParams(params: ReadableMap, promise: Promise) {
    delegate.setDeviceParams(params, promise)
  }

  override fun setUserTags(tags: ReadableMap, promise: Promise) {
    delegate.setUserTags(tags, promise)
  }

  override fun buy(sku: String, options: ReadableMap, promise: Promise) {
    delegate.buy(sku, options, promise)
  }

  override fun restore(promise: Promise) {
    delegate.restore(promise)
  }

  override fun getActiveProducts(options: ReadableMap, promise: Promise) {
    delegate.getActiveProducts(options, promise)
  }

  override fun getProductsForSale(promise: Promise) {
    delegate.getProductsForSale(promise)
  }

  override fun getProducts(options: ReadableMap, promise: Promise) {
    delegate.getProducts(options, promise)
  }

  override fun getBillingStatus(promise: Promise) {
    delegate.getBillingStatus(promise)
  }

  override fun presentCodeRedemptionSheet(promise: Promise) {
    delegate.presentCodeRedemptionSheet(promise)
  }

  override fun showManageSubscriptions(options: ReadableMap, promise: Promise) {
    delegate.showManageSubscriptions(options, promise)
  }

  companion object {
    const val NAME = "NativeIaphub"
  }
}
