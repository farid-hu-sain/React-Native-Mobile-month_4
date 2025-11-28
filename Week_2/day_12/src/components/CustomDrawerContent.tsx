import React from "react";
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { View, Text, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CustomDrawerContent = (props: any) => {
  const { navigation } = props;
  const user = { 
    name: 'Lil Bahlil el Goblin', 
    email: 'energyhijau@gmail.com',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZSqseAXAdIqz4ozmLCY7mGBB6q9Nkdv68UA&s'
  };

  const handleLogout = () => {
    navigation.navigate("Logout");
  };

  return (
    <SafeAreaView style={styles.container}>
      <DrawerContentScrollView {...props}>
        {/* Custom Header */}
        <View style={styles.header}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        <DrawerItemList {...props} />
        
        <View style={styles.footer}>
          <DrawerItem
            label="Logout"
            labelStyle={{ color: "red" }}
            onPress={handleLogout}
          />
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 20, 
    alignItems: "center", 
    borderBottomWidth: 1, 
    borderColor: "#ddd",
    flexDirection: 'row'
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    marginRight: 10 
  },
  userName: { 
    fontWeight: "bold", 
    fontSize: 16 
  },
  userEmail: { 
    color: "gray", 
    fontSize: 14 
  },
  footer: { 
    borderTopWidth: 1, 
    borderColor: "#ddd", 
    paddingVertical: 10 
  },
});

export default CustomDrawerContent;