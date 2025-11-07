import React, { useState } from "react";
import { StyleSheet, View, Button, Text } from "react-native";

export const FlexboxPlayground = () => {
  const [direction, setDirection] = useState<
    "row" | "column" | "row-reverse" | "column-reverse"
  >("row");

  const [justify, setJustify] = useState<
    "flex-start" | "center" | "space-between"
  >("flex-start");

  const [align, setAlign] = useState<
    "flex-start" | "center" | "stretch"
  >("center");

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>
        flexDirection: {direction} | justifyContent: {justify} | alignItems: {align}
      </Text>

      <View
        style={[
          styles.container,
          {
            flexDirection: direction,
            justifyContent: justify,
            alignItems: align,
          },
        ]}
      >
        <View style={styles.boxRed} />
        <View style={styles.boxBlue} />
        <View style={styles.boxGreen} />
      </View>

      <View style={styles.buttons}>
        <Button title="Row" onPress={() => setDirection("row")} />
        <Button title="Column" onPress={() => setDirection("column")} />
        <Button title="Row-Reverse" onPress={() => setDirection("row-reverse")} />
      </View>

      <View style={styles.buttons}>
        <Button title="Start" onPress={() => setJustify("flex-start")} />
        <Button title="Center" onPress={() => setJustify("center")} />
        <Button title="Space-Between" onPress={() => setJustify("space-between")} />
      </View>


      <View style={styles.buttons}>
        <Button title="Align Start" onPress={() => setAlign("flex-start")} />
        <Button title="Align Center" onPress={() => setAlign("center")} />
        <Button title="Stretch" onPress={() => setAlign("stretch")} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f2f2f2",
  },
  boxRed: { width: 80, height: 80, backgroundColor: "red" },
  boxBlue: { width: 80, height: 80, backgroundColor: "blue" },
  boxGreen: { width: 80, height: 80, backgroundColor: "green" },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 8,
  },
});
