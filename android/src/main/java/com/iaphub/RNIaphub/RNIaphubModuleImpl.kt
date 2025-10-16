package com.iaphub.RNIaphub

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.google.gson.Gson
import com.iaphub.Iaphub
import com.iaphub.IaphubError

internal class RNIaphubModuleImpl(private val reactContext: ReactApplicationContext) {

  // Keys here are skipped when null so the React Native spec can treat them as optional fields rather than union types.
  private val optionalProperties = setOf("subscriptionIntroPhases")

  fun addListener(@Suppress("UNUSED_PARAMETER") eventName: String?) {
    // Required for EventEmitter parity
  }

  fun removeListeners(@Suppress("UNUSED_PARAMETER") count: Int?) {
    // Required for EventEmitter parity
  }

  fun start(options: ReadableMap, promise: Promise) {
    val appId = getString(options, "appId", "")
    val apiKey = getString(options, "apiKey", "")
    val userId = getStringOrNull(options, "userId")
    val allowAnonymousPurchase = getBoolean(options, "allowAnonymousPurchase", false)
    val enableDeferredPurchaseListener = getBoolean(options, "enableDeferredPurchaseListener", true)
    val environment = getString(options, "environment", "production")
    val lang = getString(options, "lang", "")
    val sdkVersion = getString(options, "sdkVersion", "")
    val extraSdk = getStringOrNull(options, "sdk")
    var sdk = "react_native"

    if (extraSdk != null) {
      sdk = "$sdk/$extraSdk"
    }

    Iaphub.start(
      context = reactContext,
      appId = appId,
      apiKey = apiKey,
      userId = userId,
      allowAnonymousPurchase = allowAnonymousPurchase,
      enableDeferredPurchaseListener = enableDeferredPurchaseListener,
      environment = environment,
      lang = lang,
      sdk = sdk,
      sdkVersion = sdkVersion
    )

    Iaphub.setOnUserUpdateListener {
      emitEvent("onUserUpdate", null)
    }
    Iaphub.setOnDeferredPurchaseListener { transaction ->
      emitEvent("onDeferredPurchase", writableMapOf(transaction.getData()))
    }
    Iaphub.setOnErrorListener { err ->
      emitEvent("onError", writableMapOf(err.getData()))
    }
    Iaphub.setOnReceiptListener { err, receipt ->
      emitEvent(
        "onReceipt",
        writableMapOf(
          mapOf(
            "err" to if (err != null) writableMapOf(err.getData()) else null,
            "receipt" to receipt?.getData()
          )
        )
      )
    }

    promise.resolve(null)
  }

  fun stop(promise: Promise) {
    Iaphub.stop()
    promise.resolve(null)
  }

  fun getSDKVersion(promise: Promise) {
    val version = Iaphub.getSDKVersion()
    promise.resolve(version)
  }

  fun setLang(lang: String, promise: Promise) {
    val result = Iaphub.setLang(lang)
    promise.resolve(result)
  }

  fun login(userId: String, promise: Promise) {
    Iaphub.login(userId) { err ->
      if (err != null) {
        rejectWithError(err, promise)
      } else {
        promise.resolve(null)
      }
    }
  }

  fun getUserId(promise: Promise) {
    val userId = Iaphub.getUserId()

    if (userId == null) {
      rejectWithUnexpectedError("start_missing", "iaphub not started", promise)
    } else {
      promise.resolve(userId)
    }
  }

  fun logout(promise: Promise) {
    Iaphub.logout()
    promise.resolve(null)
  }

  fun setDeviceParams(params: ReadableMap, promise: Promise) {
    Iaphub.setDeviceParams(mapOf(params))
    promise.resolve(null)
  }

  fun setUserTags(tags: ReadableMap, promise: Promise) {
    Iaphub.setUserTags(mapOf(tags)) { err ->
      if (err != null) {
        rejectWithError(err, promise)
      } else {
        promise.resolve(null)
      }
    }
  }

  fun buy(sku: String, options: ReadableMap, promise: Promise) {
    val activity = reactContext.currentActivity ?: run {
      rejectWithUnexpectedError("activity_null", "activity not found", promise)
      return
    }
    val prorationMode = getStringOrNull(options, "prorationMode")
    val crossPlatformConflict = getBoolean(options, "crossPlatformConflict", true)

    Iaphub.buy(
      activity = activity,
      sku = sku,
      prorationMode = prorationMode,
      crossPlatformConflict = crossPlatformConflict,
      completion = { err, transaction ->
        if (err != null) {
          rejectWithError(err, promise)
        } else if (transaction == null) {
          rejectWithUnexpectedError(
            "transaction_null",
            "transaction missing",
            promise
          )
        } else {
          promise.resolve(writableMapOf(transaction.getData()))
        }
      }
    )
  }

  fun restore(promise: Promise) {
    Iaphub.restore { err, response ->
      if (err != null) {
        rejectWithError(err, promise)
      } else if (response == null) {
        rejectWithUnexpectedError(
          "restore_null",
          "restore response missing",
          promise
        )
      } else {
        promise.resolve(writableMapOf(response.getData()))
      }
    }
  }

  fun getActiveProducts(options: ReadableMap, promise: Promise) {
    val statesArray = options.getArray("includeSubscriptionStates")
    val states = if (statesArray != null) listOf(statesArray) else listOf()

    Iaphub.getActiveProducts(states) { err, products ->
      if (err != null) {
        rejectWithError(err, promise)
      } else if (products == null) {
        rejectWithUnexpectedError(
          "products_null",
          "products missing",
          promise
        )
      } else {
        promise.resolve(writableArrayOf(products.map { product -> product.getData() }))
      }
    }
  }

  fun getProductsForSale(promise: Promise) {
    Iaphub.getProductsForSale { err, products ->
      if (err != null) {
        rejectWithError(err, promise)
      } else if (products == null) {
        rejectWithUnexpectedError(
          "products_null",
          "products missing",
          promise
        )
      } else {
        promise.resolve(writableArrayOf(products.map { product -> product.getData() }))
      }
    }
  }

  fun getProducts(options: ReadableMap, promise: Promise) {
    val statesArray = options.getArray("includeSubscriptionStates")
    val states = if (statesArray != null) listOf(statesArray) else listOf()

    Iaphub.getProducts(states) { err, products ->
      if (err != null) {
        rejectWithError(err, promise)
      } else if (products == null) {
        rejectWithUnexpectedError(
          "products_null",
          "products missing",
          promise
        )
      } else {
        promise.resolve(writableMapOf(products.getData()))
      }
    }
  }

  fun getBillingStatus(promise: Promise) {
    val status = Iaphub.getBillingStatus()
    promise.resolve(writableMapOf(status.getData()))
  }

  fun presentCodeRedemptionSheet(promise: Promise) {
    promise.reject("unsupported_platform", "presentCodeRedemptionSheet is only available on iOS", null)
  }

  fun showManageSubscriptions(options: ReadableMap, promise: Promise) {
    val sku = getStringOrNull(options, "sku")

    Iaphub.showManageSubscriptions(sku) { err ->
      if (err != null) {
        rejectWithError(err, promise)
      } else {
        promise.resolve(null)
      }
    }
  }

  private fun emitEvent(eventName: String, data: Any?) {
    reactContext.getJSModule(RCTDeviceEventEmitter::class.java).emit(eventName, data)
  }

  private fun getBoolean(options: ReadableMap, key: String, default: Boolean = false): Boolean {
    return if (options.hasKey(key)) options.getBoolean(key) else default
  }

  private fun getString(options: ReadableMap, key: String, default: String): String {
    return if (options.hasKey(key)) options.getString(key) ?: default else default
  }

  private fun getStringOrNull(options: ReadableMap, key: String): String? {
    return if (options.hasKey(key)) options.getString(key) else null
  }

  @Suppress("UNCHECKED_CAST")
  private fun writableMapOf(data: Map<String, Any?>?): WritableMap {
    val map = WritableNativeMap()

    if (data == null) {
      return map
    }

    for ((key, value) in data) {
      if (value == null && optionalProperties.contains(key)) {
        continue
      }
      when (value) {
        null -> map.putNull(key)
        is Boolean -> map.putBoolean(key, value)
        is Double -> map.putDouble(key, value)
        is IaphubError -> map.putMap(key, writableMapOf(value.getData()))
        is Int -> map.putInt(key, value)
        is String -> map.putString(key, value)
        is Map<*, *> -> map.putMap(key, this.writableMapOf(value as? Map<String, Any?>))
        is Array<*> -> map.putArray(key, this.writableArrayOf(value as? List<Any?>))
        is List<*> -> map.putArray(key, this.writableArrayOf(value.toTypedArray().toList()))
      }
    }
    return map
  }

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
        is Array<*> -> arr.pushArray(this.writableArrayOf(item as? List<Any?>))
        is List<*> -> arr.pushArray(this.writableArrayOf(item.toTypedArray().toList()))
      }
    }
    return arr
  }

  private fun mapOf(data: ReadableMap): Map<String, String> {
    val map: MutableMap<String, String> = mutableMapOf()
    val iterator = data.keySetIterator()

    while (iterator.hasNextKey()) {
      val key = iterator.nextKey()

      when (data.getType(key)) {
        ReadableType.Null -> map[key] = ""
        ReadableType.String -> map[key] = data.getString(key) ?: ""
        else -> throw IllegalArgumentException("Unsupported value type for key [$key]")
      }
    }

    return map.toMap()
  }

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

  private fun rejectWithError(err: IaphubError, promise: Promise) {
    val json = Gson().toJson(err.getData())

    promise.reject("iaphub_error", json)
  }

  private fun rejectWithUnexpectedError(subcode: String, message: String, promise: Promise) {
    val json = Gson().toJson(mapOf(
      "code" to "unexpected",
      "subcode" to subcode,
      "message" to message
    ))

    promise.reject("iaphub_error", json)
  }

}
