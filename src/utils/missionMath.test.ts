import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMissionClocks,
  calculateSolarPowerFromDust,
  evaluatePowerAllocation,
  calculateLaserRangingTelemetry,
  gradeExplorerQuiz,
} from './missionMath';

test('calculateMissionClocks computes verified NSSDCA durations for Nov 14, 2026', () => {
  const clocks = calculateMissionClocks('2026-11-14T00:00:00Z');
  assert.equal(clocks.apollo11.nssdcaId, '1969-059C');
  assert.equal(clocks.apollo11.daysOnSurface, 20936);
  assert.equal(clocks.apollo11.yearsOnSurface, '57.3');
  assert.equal(clocks.apollo11.statusCode, 'ACTIVE_OPTICAL');

  assert.equal(clocks.opportunity.nssdcaId, '2003-032A');
  assert.equal(clocks.opportunity.activeSols, 5111);
  assert.equal(clocks.opportunity.distanceDrivenKm, 45.16);

  assert.equal(clocks.insight.nssdcaId, '2018-042A');
  assert.equal(clocks.insight.daysOnSurface, 2910);
  assert.equal(clocks.insight.daysSinceLastSignal, 1430);
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

test('calculateLaserRangingTelemetry tracks 2.56s round trip and 384,400 km distance', () => {
  const start = calculateLaserRangingTelemetry(0);
  assert.equal(start.phase, 'IDLE');
  assert.equal(start.elapsedSeconds, 0);

  const mid = calculateLaserRangingTelemetry(0.5);
  assert.equal(mid.phase, 'PRISM_REFLECTION');
  assert.equal(mid.elapsedSeconds, 1.28);
  assert.equal(mid.distanceTraveledKm, 384400);

  const end = calculateLaserRangingTelemetry(1);
  assert.equal(end.phase, 'COMPLETE');
  assert.equal(end.elapsedSeconds, 2.56);
  assert.equal(end.distanceTraveledKm, 768800);
  assert.equal(end.annualRecessionCm, 3.8);
});

test('gradeExplorerQuiz validates completeness and scores 4-question review accurately', () => {
  const incomplete = gradeExplorerQuiz([1, null, 0, 1]);
  assert.equal(incomplete.complete, false);

  const perfect = gradeExplorerQuiz([1, 2, 0, 1]);
  assert.equal(perfect.complete, true);
  assert.equal(perfect.score, 4);

  const partial = gradeExplorerQuiz([1, 0, 0, 2]);
  assert.equal(partial.complete, true);
  assert.equal(partial.score, 2);
});
