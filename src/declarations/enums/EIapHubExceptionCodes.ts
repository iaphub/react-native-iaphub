export enum EIapHubExceptionCodes {
    // User exceptions
    UNKNOWN = 'unknown',
    APP_ID_EMPTY = 'app_id_empty',
    API_KEY_EMPTY = 'api_key_empty',
    BILLING_UNAVAILABLE = 'billing_unavailable',
    BILLING_ERROR = 'billing_error',
    USER_ID_EMPTY = 'user_id_empty',
    INIT_MISSING = 'init_missing',
    USER_ID_INVALID = 'user_id_invalid',
    SKU_NOT_FOR_SALE = 'sku_not_for_sale',
    LOGIN_REQUIRED = 'login_required',
    PRODUCT_TYPE_REQUIRED = 'product_type_required',
    UNEXPECTED_RESPONSE = 'unexpected_response',
    RECEIPT_REQUEST_FAILED = 'receipt_request_failed',
    RECEIPT_VALIDATION_FAILED = 'receipt_validation_failed',

    E_UNKNOWN = 'unknown',
    E_SERVICE_ERROR = 'billing_unavailable',
    E_USER_CANCELLED = 'user_cancelled',
    E_ITEM_UNAVAILABLE = 'item_unavailable',
    E_REMOTE_ERROR = 'remote_error',
    E_NETWORK_ERROR = 'network_error',
    E_RECEIPT_FAILED = 'receipt_failed',
    E_RECEIPT_FINISHED_FAILED = 'receipt_finish_failed',
    E_ALREADY_OWNED = 'product_already_owned',
    E_DEVELOPER_ERROR = 'developer_error',


    // Business Exceptions
    USER_MUST_BE_ASSIGNED = 'user_must_be_assigned',
    AXIOS_CANCELLED = 'axios_cancelled',
    INTERNAL_AXIOS_CLIENT_ERROR = 'internal_axios_client_error',
    TRANSACTION_NOT_FOUND = 'transaction_not_found',
    RECEIPT_PROCESSED_CALLBACK_NOT_FOUND = 'receipt_processed_callback_not_found',
    METHOD_PARAMETERS_REQUIRED = 'method_parameters_required'
}