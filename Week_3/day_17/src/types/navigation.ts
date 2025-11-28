// src/types/navigation.ts
export type RootStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  MainDrawer: { userID?: string };
  ProductDetail: { id?: string; productId?: number; product?: any }; // Support both id (string from deep link) and productId (number)
  AddProduct: undefined;
  Checkout: { product?: any };
  Cart: undefined;
  AddressForm: undefined;
  Payment: { orderData?: any };
  UserStats: undefined;
  ProductList: undefined;
  Profile: { userId?: string }; // Untuk deep linking profile
};

export type DrawerParamList = {
  MainTabs: { userID?: string };
  Settings: undefined;
  Logout: undefined;
  UserStats: undefined;
};

export type BottomTabsParamList = {
  HomeStack: undefined;
  ProductCategory: undefined;
  UserStats: undefined;
  Profile: { userID?: string; userId?: string }; // Support both userID & userId
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

// Deep Linking Route Types
export type DeepLinkRoutes = {
  'ecommerceapp://home': undefined;
  'ecommerceapp://produk/:id': { id: string };
  'ecommerceapp://keranjang': undefined;
  'ecommerceapp://profil/:userId': { userId: string };
  'ecommerceapp://statistik': undefined;
  'ecommerceapp://katalog': undefined;
  'https://ecommerceapp.com/home': undefined;
  'https://ecommerceapp.com/produk/:id': { id: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}