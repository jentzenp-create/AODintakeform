import type { Metadata } from 'next';
import { Bebas_Neue, Outfit } from 'next/font/google';
import SquaresClient from './SquaresClient';
import styles from './squares.module.css';
import type { GridData } from './GridDisplay';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'March Madness Squares | Acres of Diamonds',
  description: 'Find your square in the March Madness grid. Search your name to see which grid you\'re on and follow along during the games.',
};

interface SquaresJSON {
  meta: { totalContacts: number; totalGrids: number; generatedAt: string };
  grids: GridData[];
}

export default async function MarchMadnessSquaresPage() {
  // Import JSON at build time — server only, no client bundle impact
  const squaresRaw = (await import('@/data/squares.json')).default;
  const squaresData = squaresRaw as unknown as SquaresJSON;

  const previewGrids = squaresData.grids.slice(0, 2) as GridData[];
  const { totalGrids, totalContacts } = squaresData.meta;

  return (
    <div
      className={`${styles.page} ${bebasNeue.variable} ${outfit.variable}`}
    >
      {/* Animated background */}
      <div className={styles.bgLayer}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
        <div className={styles.gridLines} />
      </div>

      <SquaresClient
        previewGrids={previewGrids}
        totalGrids={totalGrids}
        totalContacts={totalContacts}
      />
    </div>
  );
}
