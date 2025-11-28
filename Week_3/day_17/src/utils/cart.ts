// src/utils/cart.ts (UPDATED)
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, CART_QUOTA_LIMIT } from '../constants/config';

export type CartItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

class CartManager {
  private items: CartItem[] = [];

  // Tambahkan method untuk set items dari storage
  setCartItems(items: CartItem[]): void {
    this.items = items;
  }

  async addToCart(product: any, quantity: number = 1): Promise<void> {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      // Check quota before adding new item
      if (this.items.length >= CART_QUOTA_LIMIT) {
        throw new Error(`QUOTA_EXCEEDED: Cart cannot exceed ${CART_QUOTA_LIMIT} items`);
      }
      
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

  removeFromCart(productId: number): void {
    this.items = this.items.filter(item => item.id !== productId);
  }

  updateQuantity(productId: number, quantity: number): void {
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
    return [...this.items]; // Return copy to prevent direct mutation
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  clearCart(): void {
    this.items = [];
  }

  // Utility methods for quota management
  getCartSize(): number {
    return JSON.stringify(this.items).length;
  }

  isNearQuotaLimit(): boolean {
    return this.items.length >= CART_QUOTA_LIMIT * 0.8; // 80% of limit
  }

  // Auto-cleanup untuk handle quota
  autoCleanup(): CartItem[] {
    if (this.items.length > CART_QUOTA_LIMIT) {
      const cleanedItems = this.items.slice(0, CART_QUOTA_LIMIT);
      this.items = cleanedItems;
      Alert.alert(
        "Pembersihan Otomatis", 
        `Keranjang dibatasi hingga ${CART_QUOTA_LIMIT} item. Item lama telah dihapus.`
      );
      return cleanedItems;
    }
    return this.items;
  }
}

export const cartManager = new CartManager();