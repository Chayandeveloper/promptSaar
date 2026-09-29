import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';

interface SearchBarProps {
  value?: string;
  onSearch: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onSearch,
  placeholder = 'Search AI prompts by keywords, tools...',
}) => {
  const [text, setText] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(text);
    }, 350); // 350ms debounce

    return () => clearTimeout(handler);
  }, [text]);

  const handleClear = () => {
    setText('');
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={17} color={Theme.colors.primary} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={Theme.colors.textMuted}
        returnKeyType="search"
      />
      {text.length > 0 && (
        <TouchableOpacity activeOpacity={0.7} onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={16} color={Theme.colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: Theme.colors.text,
    fontSize: 13,
  },
  clearButton: {
    padding: 4,
  },
});
