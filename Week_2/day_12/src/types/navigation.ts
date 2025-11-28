export type RootStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  MainDrawer: { userID?: string };
  ProductDetail: { productId: number; product?: any };
  AddProduct: undefined;
  Checkout: { product: any };
  Cart: undefined;
  AddressForm: undefined;
  Payment: { orderData: any };
  UserStats: undefined;
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
  Profile: { userID?: string };
};

export type MainStackParamList = {
  Home: undefined;
  ProductDetail: { productId: number; product?: any };
  AddProduct: undefined;
  Checkout: { product: any };
  Cart: undefined;
  AddressForm: undefined;
  Payment: { orderData: any };
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

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}