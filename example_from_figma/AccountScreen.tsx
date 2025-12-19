import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, LogOut } from 'lucide-react-native';
import type { User } from '../App';

type AccountScreenProps = {
  user: User;
  onBack: () => void;
  onUpdateUser: (updates: Partial<User>) => void;
  onLogout: () => void;
};

export function AccountScreen({ user, onBack, onUpdateUser, onLogout }: AccountScreenProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user.name);

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdateUser({ name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '確認',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'ログアウト', style: 'destructive', onPress: onLogout }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1" stickyHeaderIndices={[0]}>
        {/* ヘッダー */}
        <View className="bg-white border-b border-gray-100 px-4 py-4 flex-row items-center gap-3 shadow-sm z-10">
          <TouchableOpacity
            onPress={onBack}
            className="w-9 h-9 items-center justify-center rounded-xl bg-gray-50"
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">アカウント設定</Text>
        </View>

        {/* アカウント情報 */}
        <View className="px-4 py-6">
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* 名前 */}
            <View className="p-4 border-b border-gray-100">
              <Text className="text-sm text-gray-600 mb-2">名前</Text>
              {isEditingName ? (
                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={editedName}
                    onChangeText={setEditedName}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white"
                    autoFocus
                    onSubmitEditing={handleSaveName}
                  />
                  <TouchableOpacity
                    onPress={handleSaveName}
                    className="px-3 py-2 bg-blue-600 rounded-lg"
                  >
                    <Text className="text-xs text-white font-medium">保存</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setEditedName(user.name);
                      setIsEditingName(false);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <Text className="text-xs text-gray-700">キャンセル</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-900 text-base">{user.name}</Text>
                  <TouchableOpacity
                    onPress={() => setIsEditingName(true)}
                    className="px-3 py-1.5"
                  >
                    <Text className="text-sm text-blue-600 font-medium">編集</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* メールアドレス */}
            <View className="p-4">
              <Text className="text-sm text-gray-600 mb-2">メールアドレス</Text>
              <Text className="text-gray-900 text-base">{user.email}</Text>
            </View>
          </View>
        </View>

        {/* 設定オプション */}
        <View className="px-4 pb-6">
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <TouchableOpacity className="w-full p-4 border-b border-gray-100">
              <Text className="text-gray-900 mb-1 text-base font-medium">通知設定</Text>
              <Text className="text-sm text-gray-500">プッシュ通知とメール通知</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-full p-4 border-b border-gray-100">
              <Text className="text-gray-900 mb-1 text-base font-medium">ストレージ</Text>
              <Text className="text-sm text-gray-500">データの使用状況を確認</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-full p-4">
              <Text className="text-gray-900 mb-1 text-base font-medium">プライバシーとセキュリティ</Text>
              <Text className="text-sm text-gray-500">データ保護とセキュリティ設定</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* アプリ情報 */}
        <View className="px-4 pb-6">
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <TouchableOpacity className="w-full p-4 border-b border-gray-100">
              <Text className="text-gray-900 mb-1 text-base font-medium">利用規約</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-full p-4 border-b border-gray-100">
              <Text className="text-gray-900 mb-1 text-base font-medium">プライバシーポリシー</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-full p-4">
              <Text className="text-gray-900 mb-1 text-base font-medium">バージョン</Text>
              <Text className="text-sm text-gray-500">1.0.0</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ログアウトボタン */}
        <View className="px-4 pb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full flex-row items-center justify-center px-6 py-4 bg-white rounded-2xl shadow-sm border border-red-200"
          >
            <View className="mr-2">
              <LogOut size={20} color="#DC2626" />
            </View>
            <Text className="text-red-600 font-bold text-base leading-none">ログアウト</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}