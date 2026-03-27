'use client';

import { motion } from 'framer-motion';
import styles from './squares.module.css';

export interface GridData {
  gridIndex: number;
  primaryGroup: string;
  isMixed: boolean;
  colAxis: number[];
  rowAxis: number[];
  cells: Array<{ name: string }>;
}

interface Props {
  grid: GridData;
  highlightedCell: number | null;
}

export default function GridDisplay({ grid, highlightedCell }: Props) {
  const highlightedRow = highlightedCell !== null ? Math.floor(highlightedCell / 10) : -1;
  const highlightedCol = highlightedCell !== null ? highlightedCell % 10 : -1;

  return (
    <div className={styles.gridOuter}>
      <div className={styles.gridInner}>
        {/* Top-left corner */}
        <div className={styles.gridCorner} />

        {/* Column axis numbers */}
        {grid.colAxis.map((digit, colIdx) => (
          <div
            key={`col-${colIdx}`}
            className={`${styles.gridAxisNum} ${highlightedCol === colIdx ? styles.gridAxisNumHighlight : ''}`}
          >
            {digit}
          </div>
        ))}

        {/* Rows */}
        {Array.from({ length: 10 }, (_, rowIdx) => (
          <>
            {/* Row axis number */}
            <div
              key={`rowaxis-${rowIdx}`}
              className={`${styles.gridAxisRow} ${highlightedRow === rowIdx ? styles.gridAxisRowHighlight : ''}`}
            >
              {grid.rowAxis[rowIdx]}
            </div>

            {/* 10 cells */}
            {Array.from({ length: 10 }, (_, colIdx) => {
              const cellIndex = rowIdx * 10 + colIdx;
              const cell = grid.cells[cellIndex];
              const isHighlighted = cellIndex === highlightedCell;
              const isRowHighlight = rowIdx === highlightedRow && highlightedCell !== null;
              const isColHighlight = colIdx === highlightedCol && highlightedCell !== null;
              const isEmpty = !cell?.name;

              let cellClass = styles.gridCell;
              if (isHighlighted) {
                cellClass += ` ${styles.gridCellHighlighted}`;
              } else if (isEmpty) {
                cellClass += ` ${styles.gridCellEmpty}`;
                if (isRowHighlight || isColHighlight) {
                  cellClass += ` ${styles.gridCellRowHighlight}`;
                }
              } else if (isRowHighlight || isColHighlight) {
                cellClass += ` ${styles.gridCellRowHighlight}`;
              }

              if (isHighlighted) {
                return (
                  <motion.div
                    key={cellIndex}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className={cellClass}
                  >
                    {cell?.name || ''}
                  </motion.div>
                );
              }

              return (
                <div key={cellIndex} className={cellClass}>
                  {isEmpty ? '—' : cell.name}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
