"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Column<T> {
  header: React.ReactNode
  accessorKey: keyof T | ((row: T) => any)
  cell?: (row: T) => React.ReactNode
  className?: string
}

interface VirtualizedTableProps<T> {
  data: T[]
  columns: Column<T>[]
  rowHeight?: number
  className?: string
  maxHeight?: number
  onRowClick?: (row: T) => void
}

export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight = 48,
  className = "",
  maxHeight = 500,
  onRowClick,
}: VirtualizedTableProps<T>) {
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [tableHeight, setTableHeight] = useState(maxHeight)

  useEffect(() => {
    if (tableContainerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Set the height to the container height or maxHeight, whichever is smaller
          const containerHeight = entry.contentRect.height
          setTableHeight(Math.min(containerHeight, maxHeight))
        }
      })

      resizeObserver.observe(tableContainerRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [maxHeight])

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  })

  const getValue = <T,>(row: T, accessorKey: keyof T | ((row: T) => any)) => {
    if (typeof accessorKey === "function") {
      return accessorKey(row)
    }
    return row[accessorKey]
  }

  return (
    <div ref={tableContainerRef} className={`overflow-auto ${className}`} style={{ height: tableHeight, maxHeight }}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = data[virtualRow.index]
            return (
              <TableRow
                key={virtualRow.key}
                data-index={virtualRow.index}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? "cursor-pointer hover:bg-muted" : ""}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {columns.map((column, columnIndex) => (
                  <TableCell key={columnIndex} className={column.className}>
                    {column.cell ? column.cell(row) : getValue(row, column.accessorKey)}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
