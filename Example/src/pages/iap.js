import React from 'react';
import {StyleSheet, View, ScrollView, Text, Button, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Observer} from 'mobx-react/custom';
import app from '../stores/app';
import iap from '../stores/iap';

export default class IAPPage extends React.Component {

  renderPrice = (product) => {
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
    }
    // Non-renewable subscriptions
    if (product.type == "subscription") {
      return `${product.price} for ${isoToHuman(product.subscriptionDuration)}`;
    }
    // Everything else
    else {
      return product.price;
    }
  }

	renderProduct = (product, onPress) => {
    var {skuProcessing} = iap;

    return (
      <TouchableOpacity key={product.id} onPress={onPress}>
        <View style={styles.product}>
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.productPrice}>{this.renderPrice(product)}</Text>
          </View>
          {skuProcessing == product.sku && <ActivityIndicator/>}
        </View>
      </TouchableOpacity>
    );
  }

  renderEmpty = (label) => {
    return (
      <View>
        <Text style={styles.empty}>{label}</Text>
      </View>
    )
  }

  renderProductsForSale = () => {
    var {user} = iap;
    var groups = {};

    user.productsForSale.forEach((product) => {
      var groupName = product.groupName || "default";

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(product);
    });
    return (
      <View>
        <Text style={styles.title}>Products for sale</Text>
        {!user.productsForSale.length && this.renderEmpty("No products for sale")}
        {Object.keys(groups).map((groupName) => (
          <View key={groupName}>
            <Text style={styles.groupTitle}>{groupName}</Text>
            {groups[groupName].map((product) => this.renderProduct(product, () => iap.buy(product.sku)))}
          </View>
        ))}
			</View>
    );
  }

  renderActiveProducts = () => {
    var {user} = iap;
    var activeProducts = user.activeProducts || [];

    return (
      <View>
        <Text style={styles.title}>Active products</Text>
        {!activeProducts.length && this.renderEmpty("No active products (Subscriptions, non-consumables)")}
				{activeProducts.map((product) => this.renderProduct(product))}
			</View>
    );
  }

  renderRestore = () => {
    return (
			<View>
				<Text style={styles.title}>Restore</Text>
				<Button title="Restore purchases" onPress={iap.restore}/>
			</View>
    );
  }

  renderLogout = () => {
    return (
			<View>
				<Text style={styles.title}>Logout</Text>
				<Button title="Logout" onPress={app.logout}/>
			</View>
    );
  }

  renderContent = () => {
    var {isInitialized, isProcessing, user} = iap;

    if (!isInitialized || !user || isProcessing) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large"/>
        </View>
      )
    }
    return (
      <ScrollView>
        <View style={styles.root}>
          {this.renderProductsForSale()}
          {this.renderActiveProducts()}
          {this.renderRestore()}
          {this.renderLogout()}
        </View>
      </ScrollView>
    );
	}

	render() {
		return (
			<Observer>
				{this.renderContent}
			</Observer>
		)
	}

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