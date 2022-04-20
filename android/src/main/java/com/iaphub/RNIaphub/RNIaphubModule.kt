package com.iaphub.RNIaphub

import com.google.gson.Gson
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

import com.iaphub.Iaphub
import com.iaphub.IaphubError
import com.facebook.react.bridge.ReactMethod

class RNIaphubModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
      return "RNIaphub"
  }

  /**
   * Required for the EventEmitter to work properly without a warning
   */
  @ReactMethod
  fun addListener(eventName: String?) {

  }

  /**
   * Required for the EventEmitter to work properly without a warning
   */
  @ReactMethod
  fun removeListeners(count: Int?) {

  }

  /**
   * Start IAPHUB
   */
  @ReactMethod
  fun start(options: ReadableMap) {
    val appId = options.getString("appId") ?: ""
    val apiKey = options.getString("apiKey") ?: ""
    val userId = options.getString("userId")
    val allowAnonymousPurchase = if (options.hasKey("allowAnonymousPurchase")) options.getBoolean("allowAnonymousPurchase") else false
    val environment = options.getString("environment") ?: "production"
    val sdkVersion = options.getString("sdkVersion") ?: ""

    // Start SDK
    Iaphub.start(
      context=this.reactApplicationContext,
      appId=appId,
      apiKey=apiKey,
      userId=userId,
      allowAnonymousPurchase=allowAnonymousPurchase,
      environment=environment,
      sdk="react_native",
      sdkVersion=sdkVersion
    )
    // Register listeners
    Iaphub.setOnUserUpdateListener { ->
      this.reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java).emit("onUserUpdate", null)
    }
    Iaphub.setOnErrorListener { err ->
      this.reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java).emit("onError", this.writableMapOf(err.getData()))
    }
    Iaphub.setOnReceiptListener { err, receipt ->
      this.reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java).emit("onReceipt", this.writableMapOf(mapOf(
        "err" to if (err != null) this.writableMapOf(err.getData()) else null,
        "receipt" to if (receipt != null) receipt.getData() else null
      )))
    }
  }

  /**
   * Stop IAPHUB
   */
  @ReactMethod
  fun stop() {
    Iaphub.stop()
  }

  /**
   * Login
   */
  @ReactMethod
  fun login(userId: String, promise: Promise) {
    Iaphub.login(userId) { err ->
      if (err != null) {
        this.rejectWithError(err, promise)
      }
      else {
        promise.resolve(null)
      }
    }
  }

  /**
   * Logout
   */
  @ReactMethod
  fun logout() {
    Iaphub.logout()
  }

  /**
   * Set device params
   */
  @ReactMethod
  fun setDeviceParams(params: ReadableMap) {
    Iaphub.setDeviceParams(this.mapOf(params))
  }

  /**
   * Set user tags
   */
  @ReactMethod
  fun setUserTags(tags: ReadableMap, promise: Promise) {
    Iaphub.setUserTags(this.mapOf(tags)) { err ->
      if (err != null) {
        this.rejectWithError(err, promise)
      }
      else {
        promise.resolve(null)
      }
    }
  }

  /**
   * Buy
   */
  @ReactMethod
  fun buy(sku: String, options: ReadableMap, promise: Promise) {
    val activity = this.currentActivity
    val prorationMode = options.getString("prorationMode")
    val crossPlatformConflict = if (options.hasKey("crossPlatformConflict")) options.getBoolean("crossPlatformConflict") else true

    if (activity == null) {
      this.rejectWithUnexpectedError("activity_null", "activity not found", promise)
      return
    }
    Iaphub.buy(activity=activity, sku=sku, prorationMode=prorationMode, crossPlatformConflict=crossPlatformConflict, completion={ err, transaction ->
      if (err != null) {
        this.rejectWithError(err, promise)
      }
      else if (transaction == null) {
        this.rejectWithUnexpectedError("unexpected_parameter", "transaction returned by buy is null", promise)
      }
      else {
        promise.resolve(this.writableMapOf(transaction.getData()))
      }
    })
  }

  /**
   * Restore
   */
  @ReactMethod
  fun restore(promise: Promise) {
    Iaphub.restore { err ->
      if (err != null) {
        this.rejectWithError(err, promise)
      }
      else {
        promise.resolve(null)
      }
    }
  }

  /**
   * Get active products
   */
  @ReactMethod
  fun getActiveProducts(options: ReadableMap, promise: Promise) {
    var includeSubscriptionStatesValue = options.getArray("includeSubscriptionStates")
    var includeSubscriptionStates: List<String> = listOf()

    if (includeSubscriptionStatesValue != null) {
      includeSubscriptionStates = this.listOf(includeSubscriptionStatesValue)
    }
    Iaphub.getActiveProducts(includeSubscriptionStates) { err, products ->
      if (err != null) {
        this.rejectWithError(err, promise)
      }
      else if (products == null) {
        this.rejectWithUnexpectedError("unexpected_parameter", "products returned by getActiveProducts is null", promise)
      }
      else {
        promise.resolve(this.writableArrayOf(products.map { product -> product.getData() }))
      }
    }
  }

  /**
   * Get products for sale
   */
  @ReactMethod
  fun getProductsForSale(promise: Promise) {
    Iaphub.getProductsForSale { err, products ->
      if (err != null) {
        this.rejectWithError(err, promise)
      }
      else if (products == null) {
        this.rejectWithUnexpectedError("unexpected_parameter", "products returned by getProductsForSale is null", promise)
      }
      else {
        promise.resolve(this.writableArrayOf(products.map { product -> product.getData() }))
      }
    }
  }

  /**
   * Get products
   */
  @ReactMethod
  fun getProducts(options: ReadableMap, promise: Promise) {
    var includeSubscriptionStatesValue = options.getArray("includeSubscriptionStates")
    var includeSubscriptionStates: List<String> = listOf()

    if (includeSubscriptionStatesValue != null) {
      includeSubscriptionStates = this.listOf(includeSubscriptionStatesValue)
    }
    Iaphub.getProducts(includeSubscriptionStates) { err, productsForSale, activeProducts ->
      if (err != null) {
        this.rejectWithError(err, promise)
      }
      else if (productsForSale == null || activeProducts == null) {
        this.rejectWithUnexpectedError("unexpected_parameter", "products returned by getProducts is null", promise)
      }
      else {
        promise.resolve(this.writableMapOf(mapOf(
          "productsForSale" to productsForSale.map { product -> product.getData() },
          "activeProducts" to activeProducts.map { product -> product.getData() }
        )))
      }
    }
  }

  /**
   * Reject promise with error
   */
  private fun rejectWithError(err: IaphubError, promise: Promise) {
    val json = Gson().toJson(err.getData())

    promise.reject("iaphub_error", json)
  }

  /**
   * Create unexpected error
   */
  private fun rejectWithUnexpectedError(subcode: String, message: String, promise: Promise) {
    val json = Gson().toJson(mapOf(
      "code" to "unexpected",
      "subcode" to subcode,
      "message" to message
    ))

    promise.reject("iaphub_error", json)
  }

  /**
   * Method to create a writable map
   */
  private fun writableMapOf(data: Map<String, Any?>): WritableMap {
    val map = WritableNativeMap()

    for ((key, value) in data) {
      when (value) {
        null -> map.putNull(key)
        is Boolean -> map.putBoolean(key, value)
        is Double -> map.putDouble(key, value)
        is Int -> map.putInt(key, value)
        is String -> map.putString(key, value)
        is Map<*, *> -> map.putMap(key, this.writableMapOf(value as Map<String, *>))
        is Array<*> -> map.putArray(key, this.writableArrayOf(value as List<Any?>))
        is List<*> -> map.putArray(key, this.writableArrayOf(value.toTypedArray().toList()))
      }
    }
    return map
  }

  /**
   * Method to create a writable array
   */
  private fun writableArrayOf(data: List<Any?>): WritableArray {
    val arr = WritableNativeArray()

    for (item in data) {
      when (item) {
        null -> arr.pushNull()
        is Boolean -> arr.pushBoolean(item)
        is Int -> arr.pushInt(item)
        is Double -> arr.pushDouble(item)
        is String -> arr.pushString(item)
        is Map<*, *> -> arr.pushMap(this.writableMapOf(item as Map<String, Any?>))
        is Array<*> -> arr.pushArray(this.writableArrayOf(item as List<Any>))
        is List<*> -> arr.pushArray(this.writableArrayOf(item.toTypedArray().toList()))
      }
    }
    return arr
  }

  /**
   * Method to convert a readable map to a map
   */
  private fun mapOf(data: ReadableMap): Map<String, String> {
    val map: MutableMap<String, String> = mutableMapOf()
    val iterator = data.keySetIterator()

    while (iterator.hasNextKey()) {
      val key = iterator.nextKey()

      when (data.getType(key)) {
        ReadableType.Null -> map.put(key, "")
        ReadableType.String -> map.put(key, data.getString(key) ?: "")
        else -> throw IllegalArgumentException("Unsupported value type for key [$key]")
      }
    }

    return map.toMap()
  }

  /**
   * Method to convert a readable array to a list
   */
  private fun listOf(data: ReadableArray): List<String> {
    val list: MutableList<String> = mutableListOf()

    for (index in 0 until data.size()) {
      when (data.getType(index)) {
        ReadableType.String -> list.add(data.getString(index))
      }
    }

    return list.toList()
  }

}
