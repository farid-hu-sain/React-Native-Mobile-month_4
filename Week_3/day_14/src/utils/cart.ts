import { Alert } from 'react-native';

export type CartItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

class CartManager {
  private items: CartItem[] = [];

  addToCart(product: any, quantity: number = 1) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
    
    Alert.alert("Success", `Produk ${product.title} ditambahkan ke keranjang!`);
  }

  removeFromCart(productId: number) {
    this.items = this.items.filter(item => item.id !== productId);
  }

  updateQuantity(productId: number, quantity: number) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
      }
    }
  }

  getCartItems(): CartItem[] {
    return this.items;
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  clearCart() {
    this.items = [];
  }
}

export const cartManager = new CartManager();