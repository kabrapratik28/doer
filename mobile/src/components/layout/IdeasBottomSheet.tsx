import { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { Task } from '../../types/task';
import { IdeaItem } from '../tasks/IdeaItem';

interface IdeasBottomSheetProps {
  ideas: Task[];
  onPromote: (id: string) => void;
  onDelete: (id: string) => void;
}

export const IdeasBottomSheet = forwardRef<BottomSheet, IdeasBottomSheetProps>(
  ({ ideas, onPromote, onDelete }, ref) => {
    const snapPoints = useMemo(() => ['10%', '50%', '90%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={0}
          appearsOnIndex={1}
          opacity={0.5}
        />
      ),
      []
    );

    const yesterdayTasks = ideas.filter((t) => t.is_from_yesterday);
    const regularTasks = ideas.filter((t) => !t.is_from_yesterday);
    const sortedIdeas = [...regularTasks, ...yesterdayTasks];

    return (
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#1A1A1A' }}
        handleIndicatorStyle={{ backgroundColor: '#666666', width: 40 }}
        enablePanDownToClose={false}
      >
        <BottomSheetView className="flex-1 px-4">
          {/* Header */}
          <View className="flex-row items-center justify-between py-4 border-b border-border-subtle">
            <Text className="text-lg font-bold text-text-primary">IDEAS</Text>
            <TouchableOpacity accessibilityRole="button">
              <Text className="text-text-muted">Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Ideas List */}
          {sortedIdeas.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-text-muted text-center">
                No ideas yet. Add tasks and they'll appear here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={sortedIdeas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <IdeaItem
                  task={item}
                  onPromote={() => onPromote(item.id)}
                  onDelete={() => onDelete(item.id)}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

IdeasBottomSheet.displayName = 'IdeasBottomSheet';
