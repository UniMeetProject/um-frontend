import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Copy, forest, line } from '@/components/campus';
import { DAY_START_MIN, DAY_END_MIN, BLOCK_MINUTES, intervalToBlocks, toHHMM } from '@/lib/time';
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
  const selectedBlocks = useMemo(() => draftsToBlocks(value), [value]);

  function toggleBlock(block: number) {
    const next = new Set(selectedBlocks);
    if (next.has(block)) next.delete(block);
    else next.add(block);
    onChange(blocksToDrafts(next));
  }

  const quarters = 60 / BLOCK_MINUTES;

  function toggleHour(firstBlock: number) {
    const blocks = Array.from({ length: quarters }, (_, index) => firstBlock + index);
    const clear = blocks.every((block) => selectedBlocks.has(block));
    const next = new Set(selectedBlocks);
    for (const block of blocks) {
      if (clear) next.delete(block);
      else next.add(block);
    }
    onChange(blocksToDrafts(next));
  }

  return (
    <View style={styles.grid}>
      <Copy tone="small">Tippe auf die Uhrzeit links, um eine ganze Stunde zu markieren.</Copy>
      {Array.from({ length: (DAY_END_MIN - DAY_START_MIN) / 60 }, (_, hour) => {
        const hourStart = toHHMM(hour * 60 + DAY_START_MIN);
        return (
          <View key={hour} style={styles.hourRow}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Stunde ab ${hourStart} umschalten`}
              onPress={() => toggleHour(hour * quarters)} style={styles.hourLabel}>
              <Copy tone="small" style={{ color: forest, fontWeight: '700' }}>{hourStart}</Copy>
            </Pressable>
            <View style={styles.hourCells}>
              {Array.from({ length: quarters }, (_, quarter) => {
                const block = hour * quarters + quarter;
                const start = toHHMM(block * BLOCK_MINUTES + DAY_START_MIN);
                const end = toHHMM((block + 1) * BLOCK_MINUTES + DAY_START_MIN);
                const selected = selectedBlocks.has(block);
                return (
                  <Pressable
                    key={block}
                    accessibilityRole="button"
                    accessibilityLabel={`${start}–${end}`}
                    accessibilityState={{ selected }}
                    onPress={() => toggleBlock(block)}
                    style={({ pressed }) => [
                      styles.cell,
                      {
                        backgroundColor: selected ? forest : '#F8F6F0',
                        borderColor: selected ? forest : line,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}>
                    <Copy tone="small" style={{ color: selected ? '#FFFFFF' : forest }}>:{start.slice(3)}</Copy>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 5,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hourLabel: {
    width: 49,
    minHeight: 44,
    justifyContent: 'center',
  },
  hourCells: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  cell: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
  },
});
