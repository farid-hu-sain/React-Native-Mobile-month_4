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
  NearbyStores: undefined; // ✅ NEW
  CourierTracking: undefined; // ✅ NEW
};

export type DrawerParamList = {
  MainTabs: { userID?: string };
  Settings: undefined;
  Logout: undefined;
  UserStats: undefined;
  Wishlist: undefined;
  NearbyStores: undefined; // ✅ NEW
  CourierTracking: undefined; // ✅ NEW
};

export type BottomTabsParamList = {
  HomeStack: undefined;
  ProductCategory: undefined;
  UserStats: undefined;
  Profile: { userID?: string; userId?: string };
  Wishlist: undefined;
  NearbyStores: undefined; // ✅ NEW
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
  NearbyStores: undefined; // ✅ NEW
  CourierTracking: undefined; // ✅ NEW
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

// Deep Linking Route Types - UPDATE: TAMBAH LOCATION FEATURES
export type DeepLinkRoutes = {
  'ecommerceapp://home': undefined;
  'ecommerceapp://produk/:id': { id: string };
  'ecommerceapp://keranjang': undefined;
  'ecommerceapp://profil/:userId': { userId: string };
  'ecommerceapp://statistik': undefined;
  'ecommerceapp://katalog': undefined;
  'ecommerceapp://wishlist': undefined;
  'ecommerceapp://add-to-cart/:id': { id: string };
  'miniecom://add-to-cart/:id': { id: string };
  'ecommerceapp://toko-terdekat': undefined; // ✅ NEW
  'ecommerceapp://tracking-kurir': undefined; // ✅ NEW
  'ecommerceapp://hitung-ongkir': undefined; // ✅ NEW
  'https://ecommerceapp.com/home': undefined;
  'https://ecommerceapp.com/produk/:id': { id: string };
  'https://ecommerceapp.com/wishlist': undefined;
  'https://ecommerceapp.com/add-to-cart/:id': { id: string };
  'https://ecommerceapp.com/toko-terdekat': undefined; // ✅ NEW
  'https://ecommerceapp.com/tracking-kurir': undefined; // ✅ NEW
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}