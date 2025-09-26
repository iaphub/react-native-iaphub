import React from 'react';
import {StyleSheet, View, ScrollView, Text, Button, TouchableOpacity, ActivityIndicator, Platform} from 'react-native';
import { useApp } from '../context/AppContext';

export default function IAPPage() {
  const app = useApp();
  const { logout } = app;
  const {
    isInitialized,
    skuProcessing,
    productsForSale,
    activeProducts,
    billingStatus,
    buy,
    restore,
    showManageSubscriptions,
    presentCodeRedemptionSheet
  } = app.iap;


  const renderPrice = (product) => {
    // Convert iso duration to human
    var isoToHuman = (isoDuration) => {
      if (!isoDuration) return;
      if (isoDuration == "P7D") isoDuration = "P1W";
      var number = isoDuration.match(/\d+/g);
      var periods = {"D": "day", "W": "week", "M": "month", "Y": "year"};
      var period = isoDuration[isoDuration.length - 1];

      return `${number > 1 ? `${number} ` : ''}${periods[period]}${number > 1 ? 's' : ''}`;
    };

    // Renewable subscriptions
    if (product.type == "renewable_subscription") {
      // Trial
      if (product.subscriptionPeriodType == "trial") {
        return `Enjoy a free trial during ${isoToHuman(product.subscriptionTrialDuration)} (then ${product.price} every ${isoToHuman(product.subscriptionDuration)})`;
      }
      // As you go introductory offer
      else if (product.subscriptionPeriodType == "intro" && product.subscriptionIntroPayment == "as_you_go") {
        return `Enjoy an introductory offer of ${product.subscriptionIntroPrice} every ${isoToHuman(product.subscriptionIntroDuration)} (then ${product.price} every ${isoToHuman(product.subscriptionDuration)})`;
      }
      // Upfront introductory offer
      else if (product.subscriptionPeriodType == "intro" && product.subscriptionIntroPayment == "upfront") {
        return `Enjoy an introductory offer of ${product.subscriptionIntroPrice} for ${isoToHuman(product.subscriptionIntroDuration)} (then ${product.price} every ${isoToHuman(product.subscriptionDuration)})`;
      }
      else {
        return `${product.localizedPrice} / ${isoToHuman(product.subscriptionDuration)}`;
      }
    }
    // Non-renewable subscriptions
    if (product.type == "subscription") {
      return `${product.localizedPrice} / ${isoToHuman(product.subscriptionDuration)}`;
    }
    // Everything else
    else {
      return product.localizedPrice || 'Price not available';
    }
  }

  const renderProduct = (product, onPress) => {
    return (
      <TouchableOpacity key={product.id} onPress={onPress}>
        <View style={styles.product}>
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>{product.localizedTitle || 'Title not available'}</Text>
            <Text style={styles.productPrice}>{renderPrice(product)}</Text>
          </View>
          {(product.sku && skuProcessing == product.sku) && <ActivityIndicator/>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = (label) => {
    return (
      <View>
        <Text style={styles.empty}>{label}</Text>
      </View>
    );
  };

  const renderBillingError = (error) => {
    var description = "Billing not available, please try again later";

    if (error.subcode == "play_store_outdated") {
      description = "Billing not available, you must update your Play Store App";
    }

    return renderEmpty(description);
  };

  const renderProductsForSale = () => {
    var groups = {};

    if (productsForSale) {
      productsForSale.forEach((product) => {
        var groupName = product.groupName || "default";

        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(product);
      });
    }
    return (
      <View>
        <Text style={styles.title}>Products for sale</Text>
        {!productsForSale &&
          <View style={styles.loader}>
            <ActivityIndicator size="small"/>
          </View>
        }
        {productsForSale && !productsForSale.length && (!billingStatus || !billingStatus.error) && renderEmpty("No products for sale")}
        {productsForSale && !productsForSale.length && billingStatus && billingStatus.error && renderBillingError(billingStatus.error)}
        {Object.keys(groups).map((groupName) => (
          <View key={groupName}>
            <Text style={styles.groupTitle}>{groupName}</Text>
            {groups[groupName].map((product) => renderProduct(product, () => buy(product.sku)))}
          </View>
        ))}
      </View>
    );
  };

  const renderActiveProducts = () => {
    return (
      <View>
        <Text style={styles.title}>Active products</Text>
        {!activeProducts &&
          <View style={styles.loader}>
            <ActivityIndicator size="small"/>
          </View>
        }
        {activeProducts && !activeProducts.length && renderEmpty("No active products (Subscriptions, non-consumables)")}
        {activeProducts && activeProducts.map((product) => renderProduct(product, () => buy(product.sku)))}
      </View>
    );
  };

  const renderRestore = () => {
    return (
      <View>
        <Text style={styles.title}>Restore</Text>
        <Button title="Restore purchases" onPress={restore}/>
      </View>
    );
  };

  const renderShowManageSubscriptions = () => {
    return (
      <View>
        <Text style={styles.title}>Manage subscriptions</Text>
        <Button title="Manage subscriptions" onPress={showManageSubscriptions}/>
      </View>
    );
  };

  const renderPromoCode = () => {
    return (
      <View>
        <Text style={styles.title}>Promo code</Text>
        <Button title="Redeem promo code" onPress={presentCodeRedemptionSheet}/>
      </View>
    );
  };

  const renderLogout = () => {
    return (
      <View>
        <Text style={styles.title}>Logout</Text>
        <Button title="Logout" onPress={logout}/>
      </View>
    );
  };

  const renderContent = () => {
    if (!isInitialized) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large"/>
        </View>
      );
    }
    return (
      <ScrollView>
        <View style={styles.root}>
          {renderProductsForSale()}
          {renderActiveProducts()}
          {renderRestore()}
          {Platform.OS == 'ios' && renderPromoCode()}
          {renderShowManageSubscriptions()}
          {renderLogout()}
        </View>
      </ScrollView>
    );
  };

  return renderContent();
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 20,
    paddingRight: 20
  },
  title: {
    color: '#111566',
    fontWeight: 'bold',
    fontSize: 24,
    marginTop: 20,
    marginBottom: 20
  },
  // Loader
  loader: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center'
  },
  // Empty
  empty: {
    textAlign: 'center',
    color: 'black'
  },
  // Group
  groupTitle: {
    color: '#111566',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10
  },
  // Product
  product: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowOpacity: 1,
        shadowRadius: 2,
        shadowOffset: {height: 1, width: 1},
        shadowColor: '#979797'
      },
      android: {
        elevation: 2
      }
    })
  },
  productDetails: {
    flex: 1
  },
  productTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black'
  },
  productPrice: {
    fontSize: 14,
    color: '#818181'
  }
});
