// src/types/navigation.ts
export type RootStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  MainDrawer: { userID?: string };
  ProductDetail: { id?: string; productId?: number; product?: any };
  AddProduct: undefined;
  Checkout: { product?: any };
  Cart: undefined;
  AddressForm: undefined;
  Payment: { orderData?: any };
  UserStats: undefined;
  ProductList: undefined;
  Profile: { userId?: string };
  Wishlist: undefined;
};

export type DrawerParamList = {
  MainTabs: { userID?: string };
  Settings: undefined;
  Logout: undefined;
  UserStats: undefined;
  Wishlist: undefined;
};

export type BottomTabsParamList = {
  HomeStack: undefined;
  ProductCategory: undefined;
  UserStats: undefined;
  Profile: { userID?: string; userId?: string };
  Wishlist: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  ProductDetail: { productId: number; product?: any };
  AddProduct: undefined;
  Checkout: { product: any };
  Cart: undefined;
  AddressForm: undefined;
  Payment: { orderData: any };
  ProductList: undefined;
  Wishlist: undefined;
};

export type TopTabsParamList = {
  Popular: undefined;
  New: undefined;
  Discount: undefined;
  Electronics: undefined;
  Clothing: undefined;
  Food: undefined;
  Automotive: undefined;
  Entertainment: undefined;
  Baby: undefined;
};

// Deep Linking Route Types - UPDATE: TAMBAH ADD-TO-CART
export type DeepLinkRoutes = {
  'ecommerceapp://home': undefined;
  'ecommerceapp://produk/:id': { id: string };
  'ecommerceapp://keranjang': undefined;
  'ecommerceapp://profil/:userId': { userId: string };
  'ecommerceapp://statistik': undefined;
  'ecommerceapp://katalog': undefined;
  'ecommerceapp://wishlist': undefined;
  'ecommerceapp://add-to-cart/:id': { id: string }; // TAMBAH: ADD-TO-CART ACTION
  'miniecom://add-to-cart/:id': { id: string }; // TAMBAH: ALTERNATIVE SCHEME
  'https://ecommerceapp.com/home': undefined;
  'https://ecommerceapp.com/produk/:id': { id: string };
  'https://ecommerceapp.com/wishlist': undefined;
  'https://ecommerceapp.com/add-to-cart/:id': { id: string }; // TAMBAH: UNIVERSAL LINK
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}