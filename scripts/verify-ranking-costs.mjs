#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const appRoot = join(repoRoot, '..', 'app', 'frontend');
const outDir = mkdtempSync(join(tmpdir(), 'ranking-costs-'));
const require = createRequire(import.meta.url);

try {
  execFileSync(
    'pnpm',
    [
      'exec',
      'tsc',
      'utils/fundRanking.ts',
      'utils/fundAttributes.ts',
      '--module',
      'CommonJS',
      '--target',
      'ES2022',
      '--outDir',
      outDir,
      '--skipLibCheck',
      '--moduleResolution',
      'node',
    ],
    { cwd: appRoot, stdio: 'pipe' }
  );

  const { getRankedFunds, parseRankingCostForTest, RANKING_METRICS } = require(join(outDir, 'utils', 'fundRanking.js'));

  assert.equal(parseRankingCostForTest('50 euro', 'EUR'), 50);
  assert.equal(parseRankingCostForTest('100,00 EUR', 'EUR'), 100);
  assert.equal(parseRankingCostForTest('€ 70', 'EUR'), 70);
  assert.equal(parseRankingCostForTest('Non previste', 'EUR'), 0);
  assert.equal(parseRankingCostForTest("Non previste per l'anno 2026", 'EUR'), 0);
  assert.equal(parseRankingCostForTest('a carico del datore', 'EUR'), null);
  assert.equal(parseRankingCostForTest('2026', 'EUR'), null);
  assert.equal(parseRankingCostForTest('1,30% trattenuto dal rendimento annuo', '%'), 1.3);
  assert.equal(parseRankingCostForTest('30 Euro (fissa) + 0,150% (variabile sul patrimonio)', 'EUR'), 30);
  assert.equal(parseRankingCostForTest('30 Euro (fissa) + 0,150% (variabile sul patrimonio)', '%'), 0.15);
  assert.equal(
    parseRankingCostForTest(
      '€ 20,00 per RITA, € 2,00 su ciascuna rata di rendita. Caricamento per spese pagamento rendita 1,25%.',
      '%',
      'erogazione'
    ),
    1.25
  );
  assert.equal(
    parseRankingCostForTest(
      '1,90% mensile, 1,60% bimestrale, 1,40% semestrale, 1,35% annuale della rendita',
      '%',
      'erogazione'
    ),
    1.35
  );

  const returnMetric = RANKING_METRICS.find((metric) => metric.id === 'return-1y');
  assert.ok(returnMetric);
  const sampleFunds = [
    {
      type: 'FPN',
      categoria: 'AZN',
      chiusoNuoviAderenti: false,
      linea: 'Fondo negoziale',
      rendimenti: { ultimoAnno: 5 },
      isc: {},
      costiDettaglio: {},
    },
    {
      type: 'FPA',
      categoria: 'AZN',
      chiusoNuoviAderenti: false,
      linea: 'Fondo aperto',
      rendimenti: { ultimoAnno: 9 },
      isc: {},
      costiDettaglio: {},
    },
  ];
  assert.deepEqual(
    getRankedFunds(sampleFunds, returnMetric, {
      fundType: 'FPN',
      onlyEsg: false,
      capitalGuarantee: 'all',
      category: 'all',
      includeClosedFunds: false,
    }).map((rankedFund) => rankedFund.fund.type),
    ['FPN']
  );

  console.log('Ranking cost parser regression checks passed.');
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
