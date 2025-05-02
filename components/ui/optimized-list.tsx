"use client"

import React, { useMemo } from "react"
import { ErrorBoundary } from "@/components/ui/error-boundary"

interface OptimizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  emptyState?: React.ReactNode
  loadingState?: React.ReactNode
  errorState?: React.ReactNode
  isLoading?: boolean
  className?: string
}

export function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  emptyState,
  loadingState,
  errorState,
  isLoading = false,
  className,
}: OptimizedListProps<T>) {
  // Memoize the list items to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => {
    return items.map((item, index) => {
      const key = keyExtractor(item, index)
      return (
        <ErrorBoundary key={key} fallback={<div className="p-4 text-sm text-destructive">Failed to render item</div>}>
          {renderItem(item, index)}
        </ErrorBoundary>
      )
    })
  }, [items, renderItem, keyExtractor])

  if (isLoading && loadingState) {
    return <>{loadingState}</>
  }

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return <div className={className}>{memoizedItems}</div>
}

// Memoized version of the component to prevent unnecessary re-renders
export const MemoizedList = React.memo(OptimizedList) as typeof OptimizedList
