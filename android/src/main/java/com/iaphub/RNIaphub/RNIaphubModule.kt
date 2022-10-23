package com.iaphub.RNIaphub

import com.google.gson.Gson
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

import com.iaphub.Iaphub
import com.iaphub.IaphubError
import com.facebook.react.bridge.ReactMethod
import java.math.BigDecimal

class RNIaphubModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
      return "RNIaphub"
  }

  /**
   * Required for the EventEmitter to work properly without a warning
   */
  @ReactMethod
  @Suppress("UNUSED_PARAMETER")
  fun addListener(eventName: String?) {

  }

  /**
   * Required for the EventEmitter to work properly without a warning
   */
  @ReactMethod
  @Suppress("UNUSED_PARAMETER")
  fun removeListeners(count: Int?) {

  }

  /**
   * Start IAPHUB
   */
  @ReactMethod
  fun start(options: ReadableMap, promise: Promise) {
    val appId = this.getString(options, "appId", "")
    val apiKey = this.getString(options, "apiKey", "")
    val userId = this.getStringOrNull(options, "userId")
    val allowAnonymousPurchase = this.getBoolean(options, "getBoolean", false)
    val environment = this.getString(options, "environment", "production")
    val sdkVersion = this.getString(options, "sdkVersion", "")
    val extraSdk = this.getStringOrNull(options, "sdk")
    var sdk = "react_native"

    if (extraSdk != null) {
      sdk = "${sdk}/${extraSdk}"
    }
    // Start SDK
    Iaphub.start(
      context=this.reactApplicationContext,
      appId=appId,
      apiKey=apiKey,
      userId=userId,
      allowAnonymousPurchase=allowAnonymousPurchase,
      environment=environment,
      sdk=sdk,
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
    // Resolve promise
    promise.resolve(null)
  }

  /**
   * Stop IAPHUB
   */
  @ReactMethod
  fun stop(promise: Promise) {
    // Stop IAPHUB
    Iaphub.stop()
    // Resolve promise
    promise.resolve(null)
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
   * Get user id
   */
  @ReactMethod
  fun getUserId(promise: Promise) {
    val userId = Iaphub.getUserId()

    if (userId == null) {
      this.rejectWithUnexpectedError("start_missing", "iaphub not started", promise)
    }
    else {
      promise.resolve(userId)
    }
  }

  /**
   * Logout
   */
  @ReactMethod
  fun logout(promise: Promise) {
    // Logout 
    Iaphub.logout()
    // Resolve promise
    promise.resolve(null)
  }

  /**
   * Set device params
   */
  @ReactMethod
  fun setDeviceParams(params: ReadableMap, promise: Promise) {
    // Set device params
    Iaphub.setDeviceParams(this.mapOf(params))
    // Resolve promise
    promise.resolve(null)
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
    val prorationMode = this.getStringOrNull(options, "prorationMode")
    val crossPlatformConflict = this.getBoolean(options, "crossPlatformConflict", true)

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
    val includeSubscriptionStatesValue = options.getArray("includeSubscriptionStates")
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
    val includeSubscriptionStatesValue = options.getArray("includeSubscriptionStates")
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
   * Show manage subscriptions
   */
  @ReactMethod
  fun showManageSubscriptions(options: ReadableMap, promise: Promise) {
    val sku = this.getStringOrNull(options, "sku")

    Iaphub.showManageSubscriptions(sku) { err ->
      if (err != null) {
        this.rejectWithError(err, promise)
      }
      else {
        promise.resolve(null)
      }
    }
  }

  /**
   * Get readable map boolean
   */
  private fun getBoolean(options: ReadableMap, key: String, default: Boolean = false): Boolean {
    return if (options.hasKey(key)) options.getBoolean(key) else default
  }

  /**
   * Get readable map string
   */
  private fun getString(options: ReadableMap, key: String, default: String): String {
    return if (options.hasKey(key)) options.getString(key) ?: default else default
  }

  /**
   * Get readable map string or null
   */
  private fun getStringOrNull(options: ReadableMap, key: String): String? {
    return if (options.hasKey(key)) options.getString(key) else null
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
  @Suppress("UNCHECKED_CAST")
  private fun writableMapOf(data: Map<String, Any?>?): WritableMap {
    val map = WritableNativeMap()

    if (data == null) {
      return map
    }

    for ((key, value) in data) {
      when (value) {
        null -> map.putNull(key)
        is Boolean -> map.putBoolean(key, value)
        is Double -> map.putDouble(key, value)
        is BigDecimal -> map.putDouble(key, value.toDouble())
        is Int -> map.putInt(key, value)
        is String -> map.putString(key, value)
        is Map<*, *> -> map.putMap(key, this.writableMapOf(value as? Map<String, *>))
        is Array<*> -> map.putArray(key, this.writableArrayOf(value as? List<Any?>))
        is List<*> -> map.putArray(key, this.writableArrayOf(value.toTypedArray().toList()))
      }
    }
    return map
  }

  /**
   * Method to create a writable array
   */
  @Suppress("UNCHECKED_CAST")
  private fun writableArrayOf(data: List<Any?>?): WritableArray {
    val arr = WritableNativeArray()

    if (data == null) {
      return arr
    }
    for (item in data) {
      when (item) {
        null -> arr.pushNull()
        is Boolean -> arr.pushBoolean(item)
        is Int -> arr.pushInt(item)
        is Double -> arr.pushDouble(item)
        is String -> arr.pushString(item)
        is Map<*, *> -> arr.pushMap(this.writableMapOf(item as? Map<String, Any?>))
        is Array<*> -> arr.pushArray(this.writableArrayOf(item as? List<Any>))
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
        ReadableType.String -> list.add(data.getString(index) ?: "")
        else -> throw IllegalArgumentException("Unsupported value, must be a string")
      }
    }

    return list.toList()
  }

}
