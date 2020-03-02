import React from 'react';
import {StyleSheet, View, Text, Button, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Observer} from 'mobx-react/custom';
import app from '../stores/app';
import iap from '../stores/iap';

export default class IAPPage extends React.Component {

	renderProduct = (product, onPress) => {
    var {skuProcessing} = iap;

    return (
      <TouchableOpacity key={product.id} onPress={onPress}>
        <View style={styles.product}>
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.productPrice}>{product.localizedPrice}</Text>
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
    var productsForSale = user.productsForSale || [];

    return (
      <View>
        <Text style={styles.title}>Products for sale</Text>
        {!productsForSale.length && this.renderEmpty("No products for sale")}
				{productsForSale.map((product) => this.renderProduct(product, () => iap.buy(product.sku)))}
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
			<View style={styles.root}>
        {this.renderProductsForSale()}
        {this.renderActiveProducts()}
        {this.renderRestore()}
        {this.renderLogout()}
			</View>
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