import React, { useState } from 'react';
import { SectionList, RefreshControl, Text, View, StyleSheet } from 'react-native';

const SECTIONS = [
  { title: 'A', data: ['Apple', 'Apricot'] },
  { title: 'B', data: ['Banana', 'Blueberry'] },
  { title: 'C', data: ['Cherry', 'Coconut'] },
];

const SectionListExample = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState(SECTIONS);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setSections([{ title: 'New', data: ['New Item'] }, ...sections]);
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => item + index}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text>{item}</Text>
        </View>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.header}>
          <Text style={styles.headerText}>{title}</Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      stickySectionHeadersEnabled={true}
      ListEmptyComponent={<Text style={styles.empty}>No Data</Text>}
    />
  );
};

const styles = StyleSheet.create({
  header: { backgroundColor: '#f0f0f0', padding: 8 },
  headerText: { fontWeight: 'bold' },
  item: { padding: 16 },
  separator: { height: 1, backgroundColor: '#ccc' },
  sectionSeparator: { height: 10, backgroundColor: 'transparent' },
  empty: { padding: 20, textAlign: 'center' },
});

export default SectionListExample;