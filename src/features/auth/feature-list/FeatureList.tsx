import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

// 型定義
type FeatureItem = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  color: string;
  backgroundColor: string;
};

// データ
const features: FeatureItem[] = [
  {
    icon: 'microphone',
    title: '簡単な音声入力',
    description: 'ボタン一つで録音開始',
    color: colors.brand[600],
    backgroundColor: colors.brand[100],
  },
  {
    icon: 'auto-fix',
    title: '自動文字起こし',
    description: 'AIが音声をテキスト化',
    color: colors.accent[600],
    backgroundColor: colors.accent[100],
  },
  {
    icon: 'note-text',
    title: 'スマートな整理',
    description: 'AIがタグとフォルダを作成',
    color: colors.success[600],
    backgroundColor: colors.success[100],
  },
];

// コンポーネント
export function FeatureList() {
  return (
    <View className="w-full max-w-xs mb-12 gap-4">
      {features.map((feature, index) => (
        <View key={index} className="flex-row items-start gap-3">
          <View
            className="w-8 h-8 rounded-lg justify-center items-center mt-0.5"
            style={{ backgroundColor: feature.backgroundColor }}
          >
            <MaterialCommunityIcons name={feature.icon} size={20} color={feature.color} />
          </View>
          <View className="flex-1">
            <Text variant="titleMedium" className="font-bold text-t-text-primary mb-0.5">
              {feature.title}
            </Text>
            <Text variant="bodyMedium" className="text-t-text-secondary">
              {feature.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
