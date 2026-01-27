import type { MemoListItemResponse } from '@/src/api/generated/apiSchema';
import { colors } from '@/src/shared/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Portal, Surface, Text, TouchableRipple } from 'react-native-paper';

/**
 * 日時をフォーマットする
 * ISO文字列を "YYYY-MM/DD HH:mm" 形式に変換
 */
function formatDate(isoString: string) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}/${day} ${hours}:${minutes}`;
}

interface MemoCardProps {
  memo: MemoListItemResponse;
  onPress: (memoId: string) => void;
  onDeleteRequest?: (memo: MemoListItemResponse) => void;
}

export function MemoCard({ memo, onPress, onDeleteRequest }: MemoCardProps) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const isMenuEnabled = Boolean(onDeleteRequest);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const cardRef = useRef<View>(null);
  const anchorRef = useRef<View>(null);
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const menuWidth = 112;
  const menuHeight = 36;
  const menuPadding = 8;
  const menuOffsetX = 8;
  const menuOffsetY = -10;

  useEffect(() => {
    if (isMenuVisible) {
      menuAnimation.setValue(0);
      Animated.spring(menuAnimation, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }).start();
    } else {
      menuAnimation.setValue(0);
    }
  }, [isMenuVisible, menuAnimation]);

  const handleOpenMenu = () => {
    if (!isMenuEnabled) return;
    if (!anchorRef.current) return;

    anchorRef.current.measureInWindow((anchorX, anchorY, anchorWidth, anchorHeight) => {
      if (!cardRef.current) {
        setMenuPosition({
          left: anchorX + anchorWidth - menuWidth - menuOffsetX,
          top: anchorY + anchorHeight + menuOffsetY,
        });
        setIsMenuVisible(true);
        return;
      }

      cardRef.current.measureInWindow((cardX, cardY, cardWidth, cardHeight) => {
        const desiredLeft = anchorX + anchorWidth - menuWidth - menuOffsetX;
        const desiredTop = anchorY + anchorHeight + menuOffsetY;
        const minLeft = cardX + menuPadding;
        const maxLeft = cardX + cardWidth - menuWidth - menuPadding;
        const minTop = cardY + menuPadding;
        const maxTop = cardY + cardHeight - menuHeight - menuPadding;
        const clampedLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft);
        const clampedTop = Math.min(Math.max(desiredTop, minTop), maxTop);

        setMenuPosition({ left: clampedLeft, top: clampedTop });
        setIsMenuVisible(true);
      });
    });
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
    setMenuPosition(null);
  };

  const handleDeletePress = () => {
    handleCloseMenu();
    onDeleteRequest?.(memo);
  };

  return (
    <>
      <Surface
        ref={cardRef}
        elevation={1}
        style={{ backgroundColor: colors.bg.primary, borderRadius: 12 }}
      >
        <View className="flex-row items-center">
          <TouchableRipple
            onPress={() => onPress(memo.memoId)}
            className="flex-1 p-3 rounded-xl"
            borderless
          >
            <View className="gap-1">
              {/* タイトル */}
              <Text
                variant="titleSmall"
                className="text-t-text-primary font-medium"
                numberOfLines={1}
              >
                {memo.title || '無題のメモ'}
              </Text>

              {/* タグ */}
              {memo.tags.length > 0 && (
                <View className="flex-row flex-wrap gap-1">
                  {memo.tags.map((tag) => (
                    <View
                      key={`${memo.memoId}-${tag}`}
                      className="flex-row items-center gap-1 px-2 py-0.5 rounded-md bg-t-bg-tertiary border border-t-border-primary"
                    >
                      <MaterialCommunityIcons
                        name="tag-outline"
                        size={12}
                        color={colors.text.secondary}
                      />
                      <Text variant="labelSmall" className="text-t-text-secondary">
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 日時 */}
              <View className="flex-row items-center gap-2">
                <View className="w-1 h-1 rounded-full bg-t-text-tertiary" />
                <Text variant="bodySmall" className="text-t-text-secondary">
                  {formatDate(memo.updatedAt)}
                </Text>
              </View>
            </View>
          </TouchableRipple>

          {/* メニューボタン */}
          <View
            ref={anchorRef}
            className="mr-1"
            style={{
              width: 28,
              alignSelf: 'stretch',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TouchableRipple onPress={handleOpenMenu} disabled={!isMenuEnabled} borderless>
              <MaterialCommunityIcons name="dots-vertical" size={16} color={colors.text.tertiary} />
            </TouchableRipple>
          </View>
        </View>
      </Surface>

      {isMenuVisible && menuPosition && (
        <Portal>
          <Pressable
            onPress={handleCloseMenu}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <Animated.View
            style={{
              position: 'absolute',
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuWidth,
              opacity: menuAnimation,
              transform: [
                {
                  scale: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1],
                  }),
                },
              ],
            }}
          >
            <Surface
              elevation={2}
              style={{
                backgroundColor: colors.bg.primary,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border.primary,
              }}
            >
              <TouchableRipple onPress={handleDeletePress} borderless>
                <View
                  style={{ paddingVertical: 10, paddingHorizontal: 14, alignItems: 'flex-start' }}
                >
                  <Text style={{ color: colors.danger[600], fontSize: 14, textAlign: 'left' }}>
                    削除
                  </Text>
                </View>
              </TouchableRipple>
            </Surface>
          </Animated.View>
        </Portal>
      )}
    </>
  );
}
