import { colors } from '@/src/shared/constants';
import type { Note } from '@/src/shared/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import type { CategoryItem } from '../sample-data';

// 型定義
interface FolderListProps {
  folderStructure: CategoryItem[];
  notes: Note[];
  onFolderClick: (folderName: string) => void;
}

// コンポーネント
export function FolderList({ folderStructure, notes, onFolderClick }: FolderListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Work: true,
    Personal: true,
    Archive: false,
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getFolderCount = (folderName: string) => {
    return notes.filter((note) => note.folder === folderName).length;
  };

  return (
    <View className="px-4 mb-6">
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-1 h-5 rounded-sm bg-t-success-500" />
        <Text variant="titleMedium" className="font-bold text-t-text-primary">
          フォルダ
        </Text>
      </View>
      <View>
        {folderStructure.map((category) => (
          <View key={category.category}>
            <TouchableRipple
              onPress={() => toggleCategory(category.category)}
              className="px-3 py-3 rounded-lg"
            >
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name={expandedCategories[category.category] ? 'chevron-down' : 'chevron-right'}
                  size={18}
                  color={colors.text.secondary}
                />
                <MaterialCommunityIcons name="folder" size={20} color={colors.text.secondary} />
                <Text variant="bodyMedium" className="text-t-text-primary font-medium">
                  {category.category}
                </Text>
              </View>
            </TouchableRipple>

            {expandedCategories[category.category] &&
              category.folders.map((folder) => (
                <TouchableRipple
                  key={folder.name}
                  onPress={() => onFolderClick(folder.name)}
                  className="ml-6 px-3 py-3 rounded-lg"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2 flex-1">
                      <MaterialCommunityIcons
                        name="file-document-outline"
                        size={18}
                        color={colors.text.tertiary}
                      />
                      <Text
                        variant="bodyMedium"
                        className="text-t-text-secondary"
                        numberOfLines={1}
                      >
                        {folder.name}
                      </Text>
                    </View>
                    <Text variant="bodySmall" className="text-t-text-tertiary">
                      {getFolderCount(folder.name)}
                    </Text>
                  </View>
                </TouchableRipple>
              ))}
          </View>
        ))}
      </View>
    </View>
  );
}
