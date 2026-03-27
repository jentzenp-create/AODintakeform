'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './squares.module.css';

export interface SearchEntry {
  name: string;
  gridIndex: number;
  cellIndex: number;
}

interface Props {
  onSelect: (entry: SearchEntry) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const res = await fetch(`/api/squares/search?q=${encodeURIComponent(q)}`);
    const data: SearchEntry[] = await res.json();
    setResults(data);
    setIsOpen(data.length > 0);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const handleSelect = (entry: SearchEntry) => {
    setQuery(entry.name);
    setIsOpen(false);
    setResults([]);
    onSelect(entry);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.searchWrapper}>
      {/* Search icon */}
      <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>

      <input
        ref={inputRef}
        type="text"
        className={styles.searchInput}
        placeholder="Type your first or last name..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        autoComplete="off"
        spellCheck={false}
      />

      {query && (
        <button
          className={styles.searchClear}
          onMouseDown={e => {
            e.preventDefault();
            setQuery('');
            setResults([]);
            setIsOpen(false);
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          tabIndex={-1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
          </svg>
        </button>
      )}

      {isOpen && results.length > 0 && (
        <div className={styles.searchDropdown}>
          {results.map((entry, idx) => (
            <div
              key={`${entry.gridIndex}-${entry.cellIndex}`}
              className={`${styles.searchItem} ${idx === activeIndex ? styles.searchItemActive : ''}`}
              onMouseDown={() => handleSelect(entry)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <span className={styles.searchItemName}>{entry.name}</span>
              <span className={styles.searchItemGrid}>Grid #{entry.gridIndex + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
