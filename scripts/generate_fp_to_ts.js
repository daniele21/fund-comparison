#!/usr/bin/env node
/*
  Script: generate_fp_to_ts.js
  Reads FP_data_rendimenti (1).csv and FP_costi (1).csv from data/ folder,
  merges them with website data from fondi_info.csv and category data from 
  Fondi di Categoria.csv, then generates app/frontend/data/funds.ts.

  Data sources:
  - fondi_info.csv: Website URLs for all fund types (FPN, FPA, PIP) indexed by TYPE and N.ALBO
  - Fondi di Categoria.csv: Category contract info for FPN funds only
  
  Usage:
    node scripts/generate_fp_to_ts.js
*/

const fs = require('fs');
const path = require('path');

// Detect delimiter by counting occurrences in the first line
function detectDelimiter(firstLine) {
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  return semicolonCount > commaCount ? ';' : ',';
}

// Parse a CSV line with proper handling of quoted fields and escaped quotes
function parseCsvLine(line, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Parse CSV file into array of string arrays
function parseCsvRows(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i], delimiter);
    if (row.length === headers.length) {
      rows.push(row);
    }
  }
  return rows;
}

// Normalize decimal separator: comma to dot
function normalizeDecimal(value) {
  if (!value || value.trim() === '') return '';
  return value.replace(',', '.');
}

// Read and parse fondi_info.csv for website data indexed by TYPE and N.ALBO
function readFondiInfo() {
  const dataDir = path.join(__dirname, '..', 'data');
  const fondiInfoPath = path.join(dataDir, 'fondi_info.csv');
  
  if (!fs.existsSync(fondiInfoPath)) {
    console.warn('Warning: fondi_info.csv not found, skipping website data');
    return new Map();
  }

  let content = fs.readFileSync(fondiInfoPath, 'utf8');
  // Remove BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  
  const rows = parseCsvRows(content);
  
  const fondiInfoMap = new Map();
  // rows already has header removed by parseCsvRows
  // Parse rows with TYPE;N. ALBO;FONDO;Sito
  rows.forEach((row, index) => {
    if (row.length >= 4) {
      const type = row[0].trim();
      const nAlbo = row[1].trim();
      const website = row[3].trim();
      
      // Create key as TYPE|N.ALBO for exact matching
      const key = `${type}|${nAlbo}`;
      fondiInfoMap.set(key, website);
    }
  });
  
  console.log(`Loaded ${fondiInfoMap.size} website entries from fondi_info.csv`);
  
  return fondiInfoMap;
}

// Read and parse Fondi di Categoria CSV for FPN fund metadata
function readCategoryData() {
  const dataDir = path.join(__dirname, '..', 'data');
  const categoryPath = path.join(dataDir, 'Fondi di Categoria.csv');
  
  if (!fs.existsSync(categoryPath)) {
    console.warn('Warning: Fondi di Categoria.csv not found, skipping category data');
    return new Map();
  }

  const content = fs.readFileSync(categoryPath, 'utf8');
  const rows = parseCsvRows(content);
  
  const categoryMap = new Map();
  // Skip header row
  rows.slice(1).forEach(row => {
    if (row.length >= 3) {
      const fondoName = row[0].trim();
      const categoria = row[1].trim();
      
      // Create multiple keys for matching variations
      const keys = [
        fondoName.toUpperCase(),
        fondoName.replace(/\s+/g, '').toUpperCase(),
        // Also try without "FONDO PENSIONE" prefix
        fondoName.replace(/^FONDO\s+PENSIONE\s+/i, '').toUpperCase()
      ];
      
      keys.forEach(key => {
        categoryMap.set(key, categoria);
      });
    }
  });
  
  return categoryMap;
}

// Match fund name to category data (fuzzy matching)
function matchCategoryData(fundName, categoryMap) {
  if (!fundName) return null;
  
  const cleanName = fundName.toUpperCase().trim();
  
  // Try exact match
  if (categoryMap.has(cleanName)) {
    return categoryMap.get(cleanName);
  }
  
  // Try without spaces
  const noSpaces = cleanName.replace(/\s+/g, '');
  if (categoryMap.has(noSpaces)) {
    return categoryMap.get(noSpaces);
  }
  
  // Try without "FONDO PENSIONE" prefix
  const withoutPrefix = cleanName.replace(/^FONDO\s+PENSIONE\s+/, '');
  if (categoryMap.has(withoutPrefix)) {
    return categoryMap.get(withoutPrefix);
  }
  
  // Try partial match - check if any key is contained in the fund name
  for (const [key, value] of categoryMap.entries()) {
    if (cleanName.includes(key) || key.includes(withoutPrefix)) {
      return value;
    }
  }
  
  return null;
}

// Read and map files
function readAndMap() {
  const dataDir = path.join(__dirname, '..', 'data');
  const rendimentiPath = path.join(dataDir, 'FP_data_rendimenti (1).csv');
  const costiPath = path.join(dataDir, 'FP_costi (1).csv');
  
  // Read website data from fondi_info.csv for all fund types
  const fondiInfoMap = readFondiInfo();
  // Read category data for FPN funds
  const categoryMap = readCategoryData();

  const rendimentiContent = fs.readFileSync(rendimentiPath, 'utf8');
  const costiContent = fs.readFileSync(costiPath, 'utf8');

  const rendimentiRows = parseCsvRows(rendimentiContent);
  const costiRows = parseCsvRows(costiContent);

  // Create a map keyed by first 5 columns (TYPE;N. ALBO;FONDO;SOCIETA;COMPARTO)
  // Note: CATEGORIA can differ between rendimenti and costi files
  const rendimentiMap = new Map();
  rendimentiRows.forEach(row => {
    const key = row.slice(0, 5).join('|');
    rendimentiMap.set(key, row);
  });

  const costiMap = new Map();
  costiRows.forEach(row => {
    const key = row.slice(0, 5).join('|');
    costiMap.set(key, row);
  });

  // Merge: for each key that exists in both maps
  const allKeys = new Set([...rendimentiMap.keys()]);
  const allRows = [];

  allKeys.forEach(key => {
    const rendRow = rendimentiMap.get(key);
    const costiRow = costiMap.get(key);

    if (rendRow && costiRow) {
      // Use CATEGORIA from rendimenti file (column 5), merge rest
      // Expected structure: TYPE, N.ALBO, FONDO, SOCIETA, COMPARTO, CATEGORIA,
      //                     ultimo_anno, ultimi_3_anni, ultimi_5_anni, ultimi_10_anni, ultimi_20_anni,
      //                     isc_2a, isc_5a, isc_10a, isc_35a, categoria_contratto, sito_web
      const merged = [
        ...rendRow.slice(0, 6).map(v => v.trim()),     // Use CATEGORIA from rendimenti
        ...rendRow.slice(6, 11).map(normalizeDecimal),  // rendimenti columns
        ...costiRow.slice(6, 10).map(normalizeDecimal)  // costi columns (ISC 2a, 5a, 10a, 35a)
      ];
      
      const type = rendRow[0];
      const nAlbo = rendRow[1];
      
      // Get website from fondi_info.csv using TYPE|N.ALBO key
      const fondiInfoKey = `${type.trim()}|${nAlbo.trim()}`;
      const website = fondiInfoMap.get(fondiInfoKey) || '';
      
      // Add category contratto for FPN funds only (from Fondi di Categoria.csv)
      if (type === 'FPN') {
        const fundName = rendRow[2]; // FONDO column
        const categoria = matchCategoryData(fundName, categoryMap);
        merged.push(categoria || '');
      } else {
        // For FPA and PIP, add empty string for categoria_contratto
        merged.push('');
      }
      
      // Add website for all fund types
      merged.push(website);
      
      allRows.push(merged);
    }
  });

  // Sort by TYPE (FPN, FPA, PIP), then by N.ALBO (numeric)
  // Within same fund, preserve order from CSV (don't sort by COMPARTO)
  const typeOrder = { 'FPN': 1, 'FPA': 2, 'PIP': 3 };
  allRows.sort((a, b) => {
    const typeA = typeOrder[a[0]] || 999;
    const typeB = typeOrder[b[0]] || 999;
    if (typeA !== typeB) return typeA - typeB;        // TYPE order
    const alboA = parseInt(a[1], 10);
    const alboB = parseInt(b[1], 10);
    return alboA - alboB;                              // N.ALBO only
  });

  return allRows;
}

// Build the TypeScript file content matching backup format
function buildBackupTsContent(allRows) {
  const tsLines = [
    `import { PensionFund, FundCategory } from '../types';`,
    ``,
    `const parseFloatOrNull = (val: string): number | null => {`,
    `  if (val === null || val.trim() === '') return null;`,
    `  const num = parseFloat(val.replace(',', '.'));`,
    `  return isNaN(num) ? null : num;`,
    `};`,
    ``,
    `const generateId = (albo: string, comparto: string, suffix?: number): string => {`,
    `  const sanitizedComparto = String(comparto || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');`,
    `  return suffix ? \`\${albo}-\${sanitizedComparto}-\${suffix}\` : \`\${albo}-\${sanitizedComparto}\`;`,
    `}`,
    ``,
    `const allRows: string[][] = [`,
  ];

  // Add each row
  allRows.forEach(row => {
    const jsonRow = JSON.stringify(row);
    tsLines.push(`${jsonRow},`);
  });

  tsLines.push(`];`);
  tsLines.push(``);
  tsLines.push(`export const pensionFundsData: PensionFund[] = (() => {`);
  tsLines.push(`  // Ensure generated IDs are unique by tracking base id occurrences`);
  tsLines.push(`  const seen: Record<string, number> = {};`);
  tsLines.push(`  return allRows.map((row): PensionFund => {`);
  tsLines.push(`  const [`);
  tsLines.push(`    type, n_albo, fondo, societa, comparto, categoria,`);
  tsLines.push(`    ultimo_anno, ultimi_3_anni, ultimi_5_anni, ultimi_10_anni, ultimi_20_anni,`);
  tsLines.push(`    isc_2a, isc_5a, isc_10a, isc_35a, categoria_contratto, sito_web`);
  tsLines.push(`  ] = row;`);
  tsLines.push(``);
  tsLines.push(`    const isc5aValue = parseFloatOrNull(isc_5a);`);
  tsLines.push(``);
  tsLines.push(`    const baseId = generateId(n_albo, comparto);`);
  tsLines.push(`    const count = (seen[baseId] || 0) + 1;`);
  tsLines.push(`    seen[baseId] = count;`);
  tsLines.push(`    const id = count === 1 ? baseId : generateId(n_albo, comparto, count);`);
  tsLines.push(``);
  tsLines.push(`    return {`);
  tsLines.push(`      id,`);
  tsLines.push(`    type: type as 'FPN' | 'FPA' | 'PIP',`);
  tsLines.push(`    nAlbo: parseInt(n_albo, 10),`);
  tsLines.push(`    pip: fondo,`);
  tsLines.push(`    societa: societa || null,`);
  tsLines.push(`    linea: comparto,`);
  tsLines.push(`    categoria: categoria as FundCategory,`);
  tsLines.push(`    ramo: null, // Not available in new data`);
  tsLines.push(`    rendimenti: {`);
  tsLines.push(`      ultimoAnno: parseFloatOrNull(ultimo_anno),`);
  tsLines.push(`      ultimi3Anni: parseFloatOrNull(ultimi_3_anni),`);
  tsLines.push(`      ultimi5Anni: parseFloatOrNull(ultimi_5_anni),`);
  tsLines.push(`      ultimi10Anni: parseFloatOrNull(ultimi_10_anni),`);
  tsLines.push(`      ultimi20Anni: parseFloatOrNull(ultimi_20_anni),`);
  tsLines.push(`    },`);
  tsLines.push(`    isc: {`);
  tsLines.push(`      isc2a: parseFloatOrNull(isc_2a),`);
  tsLines.push(`      isc5a: isc5aValue,`);
  tsLines.push(`      isc10a: parseFloatOrNull(isc_10a),`);
  tsLines.push(`      isc35a: parseFloatOrNull(isc_35a),`);
  tsLines.push(`    },`);
  tsLines.push(`    costoAnnuo: isc5aValue,`);
  tsLines.push(`    categoriaContratto: categoria_contratto || null,`);
  tsLines.push(`    sitoWeb: sito_web || null,`);
  tsLines.push(`    };`);
  tsLines.push(`  }).filter(fund => fund.linea); // Filter out any potentially invalid rows`);
  tsLines.push(`})();`);

  return tsLines.join('\n');
}

// Main execution
const allRows = readAndMap();
const tsContent = buildBackupTsContent(allRows);
const outputPath = path.join(__dirname, '..', 'app', 'frontend', 'data', 'funds.ts');

fs.writeFileSync(outputPath, tsContent, 'utf8');
console.log(`Generated ${outputPath} with ${allRows.length} rows.`);
