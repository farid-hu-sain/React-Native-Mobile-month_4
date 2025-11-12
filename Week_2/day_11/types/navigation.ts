export type RootStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  MainDrawer: undefined;
  ProductDetail: { productId: number; product?: any };
  AddProduct: undefined;
};

export type DrawerParamList = {
  MainTabs: undefined;
  Settings: undefined;
  Logout: undefined;
};

export type BottomTabsParamList = {
  HomeStack: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  ProductDetail: { productId: number; product?: any };
  AddProduct: undefined;
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

// TAMBAHKAN INI
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}