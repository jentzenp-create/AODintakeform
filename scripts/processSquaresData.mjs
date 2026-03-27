import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const workspaceRoot = join(projectRoot, '..');

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h.trim()] = (cols[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

function parseLine(line) {
  const fields = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuote = !inQuote; }
    } else if (c === ',' && !inQuote) {
      fields.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

// ─── Seeded Fisher-Yates shuffle ──────────────────────────────────────────────
function seededShuffle(seed) {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
  const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 9; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Clean first name ─────────────────────────────────────────────────────────
function cleanName(firstName, lastName) {
  // Strip trailing single-char middle initials like "Carol a" → "Carol"
  const cleanFirst = firstName.replace(/\s+[a-zA-Z]$/, '').trim();
  const cleanLast = lastName.trim();
  if (cleanFirst && cleanLast) return `${cleanFirst} ${cleanLast}`;
  if (cleanFirst) return cleanFirst;
  if (cleanLast) return cleanLast;
  return '';
}

// ─── Classify group ───────────────────────────────────────────────────────────
const GROUP_PRIORITY = [
  'march madness jw business summit',
  'march madness gerel',
  'march madness luma',
  'march madness unblinded',
  'military',
  'mm invite email',
  'march madness sales force list',
  'march madness',
];

function classifyContact(tagsStr) {
  const tags = tagsStr.toLowerCase();
  for (const group of GROUP_PRIORITY) {
    if (tags.includes(group)) return group;
  }
  return 'ungrouped';
}

// ─── Scatter contacts within 100 slots (leave empties distributed throughout) ─
// Uses a seeded shuffle to place contactCount contacts at random positions in 100 slots
function buildGridCells(contacts, seed) {
  const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
                     10,11,12,13,14,15,16,17,18,19,
                     20,21,22,23,24,25,26,27,28,29,
                     30,31,32,33,34,35,36,37,38,39,
                     40,41,42,43,44,45,46,47,48,49,
                     50,51,52,53,54,55,56,57,58,59,
                     60,61,62,63,64,65,66,67,68,69,
                     70,71,72,73,74,75,76,77,78,79,
                     80,81,82,83,84,85,86,87,88,89,
                     90,91,92,93,94,95,96,97,98,99];
  // Shuffle positions array with seed
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
  for (let i = 99; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  // Place contacts at the first contacts.length shuffled positions
  const cells = Array(100).fill(null).map(() => ({ name: '' }));
  for (let i = 0; i < contacts.length; i++) {
    cells[positions[i]] = { name: contacts[i].name };
  }
  return cells;
}

const GRID_CAPACITY = 90; // ~10% empty per grid

// ─── Main ─────────────────────────────────────────────────────────────────────
const csvPath = join(workspaceRoot, 'Export_Contacts_undefined_Mar_2026_4_34_PM.csv');
console.log('Reading CSV from:', csvPath);

const csvText = readFileSync(csvPath, 'utf8');
const rows = parseCSV(csvText);
console.log(`Parsed ${rows.length} contacts`);

// Build contact list (discard phone/email), dedup by Contact ID then by normalized name
const seenIds = new Set();
const seenNames = new Set();
const contacts = [];
let dupCount = 0;

for (const row of rows) {
  const contactId = row['Contact Id'] || '';
  const firstName = row['First Name'] || '';
  const lastName = row['Last Name'] || '';
  const name = cleanName(firstName, lastName);
  if (!name) continue; // skip empty names

  // Deduplicate by Contact ID first
  if (contactId && seenIds.has(contactId)) { dupCount++; continue; }
  if (contactId) seenIds.add(contactId);

  // Deduplicate by normalized full name (catches same person entered twice with different IDs)
  const normalizedName = name.toLowerCase().replace(/\s+/g, ' ').trim();
  if (seenNames.has(normalizedName)) { dupCount++; continue; }
  seenNames.add(normalizedName);

  const tagsStr = row['Tags'] || '';
  const primaryGroup = classifyContact(tagsStr);
  contacts.push({ name, primaryGroup });
}

console.log(`Valid contacts: ${contacts.length} (removed ${dupCount} duplicates)`);

// Group contacts by primaryGroup, maintaining order within each group
const groupMap = new Map();
for (const group of [...GROUP_PRIORITY, 'ungrouped']) {
  groupMap.set(group, []);
}
for (const contact of contacts) {
  const arr = groupMap.get(contact.primaryGroup) || groupMap.get('ungrouped');
  arr.push(contact);
}

// Sort each group by last name, then first name for stable ordering
for (const [, arr] of groupMap) {
  arr.sort((a, b) => {
    const aParts = a.name.split(' ');
    const bParts = b.name.split(' ');
    const aLast = aParts[aParts.length - 1].toLowerCase();
    const bLast = bParts[bParts.length - 1].toLowerCase();
    if (aLast !== bLast) return aLast < bLast ? -1 : 1;
    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
  });
}

// Log group sizes
let totalGrouped = 0;
for (const [group, arr] of groupMap) {
  if (arr.length > 0) {
    console.log(`  ${group}: ${arr.length}`);
    totalGrouped += arr.length;
  }
}
console.log(`Total grouped: ${totalGrouped}`);

// ─── Build grids greedily ─────────────────────────────────────────────────────
// Collect contacts-per-grid first, then build cells with scattered empties

const gridSlots = []; // each entry: { primaryGroup, isMixed, contacts[] }
let currentSlot = null;

function finalizeSlot() {
  if (!currentSlot) return;
  gridSlots.push(currentSlot);
  currentSlot = null;
}

function startSlot(primaryGroup, isMixed) {
  finalizeSlot();
  currentSlot = { primaryGroup, isMixed, contacts: [] };
}

for (const [group, arr] of groupMap) {
  if (arr.length === 0) continue;

  let i = 0;

  // If there's a partially-filled current slot, fill it first
  if (currentSlot && currentSlot.contacts.length < GRID_CAPACITY) {
    const slotsLeft = GRID_CAPACITY - currentSlot.contacts.length;
    const toFill = Math.min(slotsLeft, arr.length);
    for (let j = 0; j < toFill; j++) {
      currentSlot.contacts.push(arr[i++]);
    }
    currentSlot.isMixed = true;
    if (currentSlot.contacts.length === GRID_CAPACITY) {
      finalizeSlot();
    }
  }

  // Fill complete grids with this group
  while (i + GRID_CAPACITY <= arr.length) {
    startSlot(group, false);
    for (let j = 0; j < GRID_CAPACITY; j++) {
      currentSlot.contacts.push(arr[i++]);
    }
    finalizeSlot();
  }

  // Remaining contacts start a new partial slot
  if (i < arr.length) {
    startSlot(group, false);
    while (i < arr.length) {
      currentSlot.contacts.push(arr[i++]);
    }
    // Don't finalize — next group may fill remaining slots
  }
}

// Finalize last slot
finalizeSlot();

// Now build actual grid objects with cells scattered + empties distributed
const grids = gridSlots.map((slot, idx) => ({
  gridIndex: idx,
  primaryGroup: slot.primaryGroup,
  isMixed: slot.isMixed,
  colAxis: seededShuffle(idx * 2 + 1),
  rowAxis: seededShuffle(idx * 2 + 100000),
  cells: buildGridCells(slot.contacts, idx * 3 + 777777),
}));

console.log(`Generated ${grids.length} grids`);

// ─── Build search index ───────────────────────────────────────────────────────
const searchIndex = [];
for (const grid of grids) {
  for (let cellIdx = 0; cellIdx < grid.cells.length; cellIdx++) {
    const cell = grid.cells[cellIdx];
    if (cell.name) {
      searchIndex.push({
        name: cell.name,
        gridIndex: grid.gridIndex,
        cellIndex: cellIdx,
      });
    }
  }
}

// Sort alphabetically for display
searchIndex.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);

console.log(`Search index entries: ${searchIndex.length}`);

// ─── Write output ─────────────────────────────────────────────────────────────
const output = {
  meta: {
    totalContacts: searchIndex.length,
    totalGrids: grids.length,
    generatedAt: new Date().toISOString(),
  },
  grids,
  searchIndex,
};

const outPath = join(projectRoot, 'src', 'data', 'squares.json');
writeFileSync(outPath, JSON.stringify(output));
console.log(`Wrote ${outPath}`);
console.log(`File size: ${(JSON.stringify(output).length / 1024 / 1024).toFixed(2)} MB`);
