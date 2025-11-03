import { useState } from "react"
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"

const SampleList = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [data, setData] = useState(['item 1', "item 2", "item 3", "item 4", "item 5"])

    const onRefresh = () => {
        setRefreshing(true)
        setTimeout(() => {
            setData([...data, `new item ${data.length + 1}`])
        }, 1000);
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={styles.content}
            >
            {data.map ((item, index) => (
                <View key={index} style={styles.item}>
                    <Text>{item}</Text>
                </View>
            ))}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  item: { padding: 16, borderBottomWidth: 1, borderColor: '#ccc' },
});

export default SampleList