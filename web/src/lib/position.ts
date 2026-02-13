const POSITION_GAP = 65536

export function getInitialPosition(index: number): number {
  return (index + 1) * POSITION_GAP
}

export function getPositionBetween(
  before: number | null,
  after: number | null
): number {
  if (before === null && after === null) return POSITION_GAP
  if (before === null) return after! / 2
  if (after === null) return before + POSITION_GAP
  return (before + after) / 2
}

export function getPositionAtEnd(lastPosition: number | null): number {
  if (lastPosition === null) return POSITION_GAP
  return lastPosition + POSITION_GAP
}

export function needsRebalance(positions: number[]): boolean {
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] - positions[i - 1] < 1) return true
  }
  return false
}

export function rebalancePositions(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * POSITION_GAP)
}
