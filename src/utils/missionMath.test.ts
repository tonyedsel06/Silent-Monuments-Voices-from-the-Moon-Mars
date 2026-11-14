import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateInSightTelemetry,
  calculateSolarPowerFromDust,
  evaluatePowerAllocation,
  simulateSeismicWaves,
  gradeInSightQuiz,
} from './missionMath';

test('calculateInSightTelemetry computes verified NSSDCA 2018-042A metrics', () => {
  const telemetry = calculateInSightTelemetry('2026-11-14T00:00:00Z');
  assert.equal(telemetry.nssdcaId, '2018-042A');
  assert.equal(telemetry.cruiseDistanceKm, 485_000_000);
  assert.equal(telemetry.entrySpeedKmh, 19_800);
  assert.equal(telemetry.activeEarthYears, 4);
  assert.equal(telemetry.activeEarthDaysRemainder, 25);
  assert.equal(telemetry.totalMarsquakesDetected, 1319);
  assert.equal(telemetry.daysOnMarsTotal, 2910);
  assert.equal(telemetry.daysSilentSinceFinalContact, 1430);
});

test('calculateSolarPowerFromDust scales linearly from 5,000 Wh (0%) to 500 Wh (90%)', () => {
  const clean = calculateSolarPowerFromDust(0);
  assert.equal(clean.wattHoursPerSol, 5000);
  assert.equal(clean.percentOfInitial, 100);

  const dusty = calculateSolarPowerFromDust(90);
  assert.equal(dusty.wattHoursPerSol, 500);
  assert.equal(dusty.percentOfInitial, 10);

  const mid = calculateSolarPowerFromDust(45);
  assert.equal(mid.wattHoursPerSol, 2750);
});

test('evaluatePowerAllocation detects over-budget, freeze failure, and optimal science', () => {
  const over = evaluatePowerAllocation(500, {
    survivalHeatersWh: 300,
    seisSeismometerWh: 200,
    uhfTelemetryWh: 100,
    hp3MoleWh: 50,
  });
  assert.equal(over.status, 'OVER_BUDGET');

  const freeze = evaluatePowerAllocation(500, {
    survivalHeatersWh: 100,
    seisSeismometerWh: 200,
    uhfTelemetryWh: 100,
    hp3MoleWh: 0,
  });
  assert.equal(freeze.status, 'FREEZE_FAILURE');

  const optimal = evaluatePowerAllocation(500, {
    survivalHeatersWh: 200,
    seisSeismometerWh: 180,
    uhfTelemetryWh: 100,
    hp3MoleWh: 0,
  });
  assert.equal(optimal.status, 'OPTIMAL_SCIENCE');
  assert.ok(optimal.scienceEfficiencyScore >= 80);
});

test('simulateSeismicWaves models P-wave refraction and S-wave shadow zone at liquid core', () => {
  const start = simulateSeismicWaves(0);
  assert.equal(start.pWaveRadiusKm, 0);
  assert.equal(start.sWaveBlockedByLiquidCore, false);

  const coreHit = simulateSeismicWaves(0.55);
  assert.ok(coreHit.pWaveRadiusKm > 3000);
  assert.equal(coreHit.sWaveBlockedByLiquidCore, true);
  assert.equal(coreHit.coreRadiusKm, 1830);
});

test('gradeInSightQuiz validates completeness and scores 3-question review accurately', () => {
  const incomplete = gradeInSightQuiz([1, null, 0]);
  assert.equal(incomplete.complete, false);

  const perfect = gradeInSightQuiz([1, 2, 0]);
  assert.equal(perfect.complete, true);
  assert.equal(perfect.score, 3);
  assert.equal(perfect.total, 3);

  const partial = gradeInSightQuiz([1, 0, 0]);
  assert.equal(partial.complete, true);
  assert.equal(partial.score, 2);
});
