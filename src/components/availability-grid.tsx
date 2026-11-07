import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DAY_START_MIN, BLOCK_MINUTES, intervalToBlocks, toHHMM } from '@/lib/time';
import type { HHMM } from '@/lib/types';

export type AvailabilityDraft = { start: HHMM; end: HHMM };

export function blocksToDrafts(blocks: Set<number>): AvailabilityDraft[] {
  const sorted = [...blocks].sort((a, b) => a - b);
  const drafts: AvailabilityDraft[] = [];

  for (const block of sorted) {
    const start = toHHMM(block * BLOCK_MINUTES + DAY_START_MIN);
    const end = toHHMM((block + 1) * BLOCK_MINUTES + DAY_START_MIN);
    const previous = drafts[drafts.length - 1];
    if (previous && previous.end === start) {
      drafts[drafts.length - 1] = { start: previous.start, end };
    } else {
      drafts.push({ start, end });
    }
  }
  return drafts;
}

export function draftsToBlocks(drafts: AvailabilityDraft[]): Set<number> {
  const blocks = new Set<number>();
  for (const draft of drafts) {
    for (const block of intervalToBlocks(draft.start, draft.end)) blocks.add(block);
  }
  return blocks;
}

export function AvailabilityGrid({
  value,
  onChange,
}: {
  value: AvailabilityDraft[];
  onChange: (next: AvailabilityDraft[]) => void;
}) {
  const theme = useTheme();
  const [selectionAnchor, setSelectionAnchor] = useState<number | null>(null);
  const selectedBlocks = useMemo(() => draftsToBlocks(value), [value]);

  function toggleBlock(block: number) {
    const next = new Set(selectedBlocks);
    if (next.has(block)) next.delete(block);
    else next.add(block);
    onChange(blocksToDrafts(next));
  }

  function extendSelection(block: number) {
    if (selectionAnchor === null || Platform.OS !== 'web') return;
    const start = Math.min(selectionAnchor, block);
    const end = Math.max(selectionAnchor, block);
    const next = new Set(selectedBlocks);
    for (let item = start; item <= end; item += 1) next.add(item);
    onChange(blocksToDrafts(next));
  }

  return (
    <ThemedView type="backgroundElement" style={styles.grid}>
      {Array.from({ length: 48 }, (_, block) => {
        const selected = selectedBlocks.has(block);
        return (
          <Pressable
            key={block}
            onPress={() => toggleBlock(block)}
            onPressIn={() => setSelectionAnchor(block)}
            onPointerEnter={Platform.OS === 'web' ? () => extendSelection(block) : undefined}
            style={({ pressed }) => [
              styles.cell,
              {
                backgroundColor: selected ? theme.coverage3 : theme.background,
                borderColor: theme.backgroundSelected,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          />
        );
      })}
      <ThemedText type="small" themeColor="textSecondary">
        08:00 – 20:00 · Tippen zum Markieren, auf dem Webclient ziehen für einen Bereich
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  grid: {
    borderRadius: 18,
    padding: Spacing.two,
    gap: Spacing.one,
  },
  cell: {
    minHeight: 22,
    borderWidth: 1,
    borderRadius: 6,
  },
});
