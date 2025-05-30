import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TagsInputProps {
  tags: string[];
  onChangeTags: (newTags: string[]) => void;
}

const TagsInput: React.FC<TagsInputProps> = ({ tags, onChangeTags }) => {
  const [input, setInput] = useState<string>('');

  const addTag = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) {
      onChangeTags([...tags, t]);
    }
    setInput('');
  };

  const removeTag = (tagToRemove: string) => {
    onChangeTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <View>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Add a tag"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addTag}
        />
        <TouchableOpacity onPress={addTag} style={styles.button}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.chipContainer}>
        {tags.map(t => (
          <View key={t} style={styles.chip}>
            <Text style={styles.chipText}>#{t}</Text>
            <TouchableOpacity onPress={() => removeTag(t)}>
              <Ionicons name="close-circle" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  button: {
    marginLeft: 8,
    backgroundColor: '#172251',
    padding: 8,
    borderRadius: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 16,
    margin: 4,
  },
  chipText: {
    marginRight: 4,
    color: '#333',
  },
});

export default TagsInput;
