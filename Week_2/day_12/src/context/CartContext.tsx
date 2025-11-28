import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, cartManager } from '../utils/cart';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(cartManager.getCartItems());

  const updateCart = () => {
    setCartItems([...cartManager.getCartItems()]);
  };

  const addToCart = (product: any, quantity: number = 1) => {
    cartManager.addToCart(product, quantity);
    updateCart();
  };

  const removeFromCart = (productId: number) => {
    cartManager.removeFromCart(productId);
    updateCart();
  };

  const updateQuantity = (productId: number, quantity: number) => {
    cartManager.updateQuantity(productId, quantity);
    updateCart();
  };

  const clearCart = () => {
    cartManager.clearCart();
    updateCart();
  };

  const getTotalPrice = () => cartManager.getTotalPrice();
  const getTotalItems = () => cartManager.getTotalItems();

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};