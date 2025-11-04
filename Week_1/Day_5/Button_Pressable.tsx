import { useState } from "react"
import { Alert, Pressable, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from "react-native"

const InteractiveButtons = () => {
    const [pressCount, setPressCount] = useState(0)

    const handlePress = (type : string) => {
        setPressCount(prev => prev + 1)
        Alert.alert(`${type} ditekan!`, `total ditekan: ${pressCount + 1}`)
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style= {styles.touchableOpacity}
                activeOpacity={0.6}
                onPress={() => handlePress('TouchableOpacity')}
            >
                <Text style={styles.text}>TouchableOpacity</Text>
            </TouchableOpacity>

            <TouchableHighlight
                style={styles.touchableHighlight}
                underlayColor="#005BBB"
                onPress={() => handlePress('TouchableHighlight')}
            >
                <Text style={styles.text}>TouchableHighlight</Text>
            </TouchableHighlight>

            <Pressable
                onPress={() => handlePress('Pressable')}
                style={({ pressed }) => [
                    styles.pressable,
                    pressed && { transform: [{ scale: 0.95  }], backgroundColor: '#005BBB'}
                ]}
                hitSlop={12}
            >
                <Text style={styles.text}>Pressable</Text>
            </Pressable>
            <Text style={styles.counterText}>Total ditekan: {pressCount}</Text>
        </View>
    )
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F5F5F5',
  },
  touchableOpacity: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  touchableHighlight: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  pressable: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  text: { color: 'white', fontSize: 16, fontWeight: '500' },
  counterText: { marginTop: 20, fontSize: 16, color: '#333' },
});

export default InteractiveButtons;