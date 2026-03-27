'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar, { type SearchEntry } from './SearchBar';
import GridDisplay, { type GridData } from './GridDisplay';
import styles from './squares.module.css';

interface Props {
  previewGrids: GridData[];
  totalGrids: number;
  totalContacts: number;
}

export default function SquaresClient({ previewGrids, totalGrids, totalContacts }: Props) {
  const [activeGrid, setActiveGrid] = useState<GridData | null>(null);
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  const [isLoadingGrid, setIsLoadingGrid] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleContactSelected = async (entry: SearchEntry) => {
    setIsLoadingGrid(true);
    try {
      const res = await fetch(`/api/squares/grid/${entry.gridIndex}`);
      const grid: GridData = await res.json();
      setActiveGrid(grid);
      setHighlightedCell(entry.cellIndex);
    } finally {
      setIsLoadingGrid(false);
    }
  };

  // Scroll to result after grid loads
  useEffect(() => {
    if (activeGrid && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [activeGrid]);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.visible);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.07 }
    );
    document.querySelectorAll(`.${styles.reveal}`).forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [activeGrid]);

  return (
    <div className={styles.container}>

      {/* ─── HERO ─── */}
      <section style={{ marginBottom: '4rem' }}>
        <p className={styles.heroEyebrow}>March Madness 2026</p>
        <h1 className={styles.heroH1}>Find Your<br />Square</h1>
        <span className={styles.h1Sub}>{totalGrids} Grids &middot; {totalContacts.toLocaleString()} Players</span>
        <p className={styles.heroTagline}>
          You&rsquo;ve been assigned a cell in a 10&times;10 squares grid.
          Each grid has <strong>random numbers 0&ndash;9</strong> along the top and left side.
          When a game score is announced, the <strong>last digit of each team&rsquo;s score</strong> determines the winning square.
          Search your name below to find your grid.
        </p>

        <div className={styles.stepFlow}>
          <div className={styles.step}>
            <span className={styles.stepIcon}>🔍</span>
            <span className={styles.stepLabel}>Search Your Name</span>
          </div>
          <span className={styles.stepArrow}>&#8594;</span>
          <div className={styles.step}>
            <span className={styles.stepIcon}>📋</span>
            <span className={styles.stepLabel}>Find Your Grid</span>
          </div>
          <span className={styles.stepArrow}>&#8594;</span>
          <div className={styles.step}>
            <span className={styles.stepIcon}>🏀</span>
            <span className={styles.stepLabel}>Watch the Games</span>
          </div>
        </div>
      </section>

      {/* ─── SEARCH ─── */}
      <section className={styles.searchSection}>
        <SearchBar onSelect={handleContactSelected} />
        {isLoadingGrid && (
          <div className={styles.searchSpinner}>
            <div className={styles.spinner} />
          </div>
        )}
      </section>

      {/* ─── RESULT GRID ─── */}
      <AnimatePresence>
        {activeGrid && highlightedCell !== null && (
          <motion.section
            ref={resultRef}
            key={activeGrid.gridIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={styles.resultSection}
          >
            <p className={styles.sectionLabel}>Your Square</p>
            <h2 className={styles.sectionHeading}>Grid #{activeGrid.gridIndex + 1}</h2>
            <hr className={styles.rule} />
            <GridDisplay grid={activeGrid} highlightedCell={highlightedCell} />
            <p className={styles.resultMeta}>
              Group: {activeGrid.primaryGroup}
              {activeGrid.isMixed ? ' (mixed grid)' : ''}
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── HOW IT WORKS ─── */}
      <section className={`${styles.sectionBlock} ${styles.reveal}`}>
        <p className={styles.sectionLabel}>The Rules</p>
        <h2 className={styles.sectionHeading}>How It Works</h2>
        <hr className={styles.rule} />

        <div className={styles.mechanicGrid}>
          <div className={styles.mechanicBox}>
            Just like Super Bowl squares&mdash;each cell is assigned two digits.
            After every round, look at the <strong>highest-scoring game</strong>.
            If the <strong>last digit of each team&rsquo;s final score</strong> matches
            your row and column numbers, you win!
          </div>
          <div className={styles.mechanicNote}>
            <span className={styles.mechanicNoteIcon}>🎲</span>
            <p>No basketball knowledge required. Every square has an equal shot at winning&mdash;it&rsquo;s pure luck of the draw. {totalContacts.toLocaleString()} people across {totalGrids} grids.</p>
          </div>
        </div>

        <div className={styles.roundsRow}>
          <div className={styles.roundCard}>
            <span className={styles.roundEmoji}>🍪</span>
            <div className={styles.roundName}>Sweet 16</div>
          </div>
          <div className={styles.roundCard}>
            <span className={styles.roundEmoji}>🍪</span>
            <div className={styles.roundName}>Elite 8</div>
          </div>
          <div className={styles.roundCard}>
            <span className={styles.roundEmoji}>🍪</span>
            <div className={styles.roundName}>Final Four</div>
          </div>
          <div className={styles.roundCard}>
            <span className={styles.roundEmoji}>🍪</span>
            <div className={styles.roundName}>Championship</div>
          </div>
        </div>
      </section>

      {/* ─── SAMPLE GRIDS ─── */}
      <section className={`${styles.sectionBlock} ${styles.reveal}`}>
        <p className={styles.sectionLabel}>Sample Grids</p>
        <h2 className={styles.sectionHeading}>What It Looks Like</h2>
        <hr className={styles.rule} />

        <div className={styles.sampleGridsStack}>
          {previewGrids.map((grid) => (
            <div key={grid.gridIndex}>
              <p className={styles.sampleGridLabel}>
                Grid #{grid.gridIndex + 1} &mdash; {grid.primaryGroup}
              </p>
              <GridDisplay grid={grid} highlightedCell={null} />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
