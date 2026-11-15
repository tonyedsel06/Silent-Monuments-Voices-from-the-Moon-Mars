import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateInSightTelemetry,
  calculateSolarPowerFromDust,
  evaluatePowerAllocation,
  simulateSeismicWaves,
  gradeInSightQuiz,
  computeIglooIntroChoreography,
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

test('computeIglooIntroChoreography transitions cleanly across 4 stages (0.0s to 3.4s)', () => {
  const s0 = computeIglooIntroChoreography(0);
  assert.equal(s0.stage, 1);
  assert.equal(s0.telemetryFormatted, '00.0%');
  assert.equal(s0.completed, false);

  const s1End = computeIglooIntroChoreography(1.1);
  assert.equal(s1End.stage, 2);
  assert.equal(s1End.uStage1, 1);
  assert.equal(s1End.uStage2, 0);

  const s2Mid = computeIglooIntroChoreography(1.65);
  assert.equal(s2Mid.stage, 2);
  assert.ok(s2Mid.shockwaveProgress > 0.5);
  assert.ok(s2Mid.uStage2 > 0.4 && s2Mid.uStage2 < 0.6);

  const s3Mid = computeIglooIntroChoreography(2.7);
  assert.equal(s3Mid.stage, 3);
  assert.ok(s3Mid.uStage3 > 0.3);
  assert.ok(s3Mid.uiRevealProgress > 0.5);
  assert.equal(s3Mid.overlayOpacity, 1);

  const s4Done = computeIglooIntroChoreography(3.4);
  assert.equal(s4Done.stage, 4);
  assert.equal(s4Done.uStage3, 1);
  assert.equal(s4Done.overlayOpacity, 0);
  assert.equal(s4Done.telemetryFormatted, '100.0%');
  assert.equal(s4Done.completed, true);
});

