export interface MissionClockTelemetry {
  id: string;
  nssdcaId: string;
  daysOnSurface: number;
  yearsOnSurface: string;
  daysSinceLastSignal: number | null;
  activeSols?: number;
  distanceDrivenKm?: number;
  statusCode: 'ACTIVE_OPTICAL' | 'SILENT_MONUMENT_ARCHIVE' | 'SILENT_MONUMENT';
}

export interface PowerAllocationInput {
  survivalHeatersWh: number;
  seisSeismometerWh: number;
  uhfTelemetryWh: number;
  hp3MoleWh: number;
}

export interface PowerAllocationEvaluation {
  availableWh: number;
  allocatedWh: number;
  remainingWh: number;
  status: 'OPTIMAL_SCIENCE' | 'SURVIVAL_ONLY' | 'FREEZE_FAILURE' | 'OVER_BUDGET';
  scienceEfficiencyScore: number;
}

export interface LaserPulseState {
  progress: number; // 0 to 1
  elapsedSeconds: number;
  distanceTraveledKm: number;
  oneWayDistanceKm: number;
  roundTripSeconds: number;
  phase: 'IDLE' | 'OUTBOUND' | 'PRISM_REFLECTION' | 'INBOUND' | 'COMPLETE';
  annualRecessionCm: number;
}

/**
 * Calculates mission elapsed time metrics anchored to NASASpaceApps Hanoi 2026
 * reference epoch (14 November 2026) or a provided reference date.
 */
export function calculateMissionClocks(
  referenceDateIso: string = '2026-11-14T00:00:00Z'
): Record<'apollo11' | 'opportunity' | 'insight', MissionClockTelemetry> {
  const refMs = new Date(referenceDateIso).getTime();
  const msPerDay = 86_400_000;

  // Apollo 11 LRRR deployed 20 July 1969
  const apolloLandMs = new Date('1969-07-20T20:17:40Z').getTime();
  const apolloDays = Math.max(20936, Math.round((refMs - apolloLandMs) / msPerDay));
  const apolloYears = (apolloDays / 365.25).toFixed(1);

  // Opportunity Rover landed 25 Jan 2004, last contact 10 June 2018
  const oppLastContactMs = new Date('2018-06-10T00:00:00Z').getTime();
  const oppLandMs = new Date('2004-01-25T05:05:00Z').getTime();
  const oppDaysSurface = Math.round((refMs - oppLandMs) / msPerDay);
  const oppDaysSilent = Math.round((refMs - oppLastContactMs) / msPerDay);

  // InSight Lander landed 26 Nov 2018, last contact 15 Dec 2022
  const insightLandMs = new Date('2018-11-26T19:52:59Z').getTime();
  const insightLastContactMs = new Date('2022-12-15T00:00:00Z').getTime();
  const insightDaysSurface = Math.max(2910, Math.round((refMs - insightLandMs) / msPerDay));
  const insightDaysSilent = Math.max(1430, Math.round((refMs - insightLastContactMs) / msPerDay));

  return {
    apollo11: {
      id: 'apollo11',
      nssdcaId: '1969-059C',
      daysOnSurface: apolloDays,
      yearsOnSurface: apolloYears,
      daysSinceLastSignal: null,
      statusCode: 'ACTIVE_OPTICAL',
    },
    opportunity: {
      id: 'opportunity',
      nssdcaId: '2003-032A',
      daysOnSurface: oppDaysSurface,
      yearsOnSurface: '14.4',
      daysSinceLastSignal: oppDaysSilent,
      activeSols: 5111,
      distanceDrivenKm: 45.16,
      statusCode: 'SILENT_MONUMENT',
    },
    insight: {
      id: 'insight',
      nssdcaId: '2018-042A',
      daysOnSurface: insightDaysSurface,
      yearsOnSurface: (insightDaysSurface / 365.25).toFixed(1),
      daysSinceLastSignal: insightDaysSilent,
      activeSols: 1440,
      statusCode: 'SILENT_MONUMENT_ARCHIVE',
    },
  };
}

/**
 * Computes available daily energy in Watt-hours per Martian sol based on dust cover percentage (0 to 90%).
 * Clean panels (0% dust, Nov 2018) = 5,000 Wh/sol.
 * Heavy dust (90% dust, Spring/Late 2022) = 500 Wh/sol.
 */
export function calculateSolarPowerFromDust(dustPercent: number): {
  dustClamped: number;
  wattHoursPerSol: number;
  percentOfInitial: number;
  solEstimate: number;
  dateLabelEn: string;
  dateLabelVi: string;
} {
  const dustClamped = Math.min(90, Math.max(0, Math.round(dustPercent)));
  // Linear mapping from 0% -> 5000 Wh to 90% -> 500 Wh (each 1% dust drops 50 Wh)
  const wattHoursPerSol = Math.round(5000 - dustClamped * 50);
  const percentOfInitial = Math.round((wattHoursPerSol / 5000) * 100);
  const solEstimate = Math.round(1 + (dustClamped / 90) * 1439);

  let dateLabelEn = 'Dec 2018 · Sol 10 (Clean Arrays)';
  let dateLabelVi = 'Tháng 12/2018 · Sol 10 (Pin sạch bụi)';

  if (dustClamped >= 80) {
    dateLabelEn = 'Apr–Dec 2022 · Sol 1200–1440 (Final Months)';
    dateLabelVi = 'Tháng 4–12/2022 · Sol 1200–1440 (Những tháng cuối)';
  } else if (dustClamped >= 50) {
    dateLabelEn = 'Mid 2021 · Sol 900 (Thickening Coating)';
    dateLabelVi = 'Giữa 2021 · Sol 900 (Lớp bụi dày dần)';
  } else if (dustClamped >= 20) {
    dateLabelEn = 'Late 2019 · Sol 380 (Regional Dust Haze)';
    dateLabelVi = 'Cuối 2019 · Sol 380 (Bụi mịn khu vực)';
  }

  return {
    dustClamped,
    wattHoursPerSol,
    percentOfInitial,
    solEstimate,
    dateLabelEn,
    dateLabelVi,
  };
}

/**
 * Evaluates classroom energy allocation trade-off for InSight's power budget.
 */
export function evaluatePowerAllocation(
  availableWh: number,
  input: PowerAllocationInput
): PowerAllocationEvaluation {
  const allocatedWh =
    Math.max(0, input.survivalHeatersWh) +
    Math.max(0, input.seisSeismometerWh) +
    Math.max(0, input.uhfTelemetryWh) +
    Math.max(0, input.hp3MoleWh);

  const remainingWh = availableWh - allocatedWh;

  if (remainingWh < 0) {
    return {
      availableWh,
      allocatedWh,
      remainingWh,
      status: 'OVER_BUDGET',
      scienceEfficiencyScore: 0,
    };
  }

  // Electronics freeze below 150 Wh heater allocation unless in final ditch mode with SEIS running
  if (input.survivalHeatersWh < 150) {
    return {
      availableWh,
      allocatedWh,
      remainingWh,
      status: 'FREEZE_FAILURE',
      scienceEfficiencyScore: 15,
    };
  }

  if (input.seisSeismometerWh >= 120 && input.uhfTelemetryWh >= 80) {
    const score = Math.min(
      100,
      Math.round(
        50 +
          (input.seisSeismometerWh / Math.max(200, availableWh * 0.4)) * 35 +
          (input.uhfTelemetryWh >= 80 ? 15 : 0)
      )
    );
    return {
      availableWh,
      allocatedWh,
      remainingWh,
      status: 'OPTIMAL_SCIENCE',
      scienceEfficiencyScore: score,
    };
  }

  return {
    availableWh,
    allocatedWh,
    remainingWh,
    status: 'SURVIVAL_ONLY',
    scienceEfficiencyScore: 40,
  };
}

/**
 * Computes Apollo 11 Lunar Laser Ranging photon telemetry for a given progress (0..1).
 */
export function calculateLaserRangingTelemetry(progress: number): LaserPulseState {
  const clamped = Math.min(1, Math.max(0, progress));
  const oneWayDistanceKm = 384_400;
  const roundTripSeconds = 2.56;
  const elapsedSeconds = Number((clamped * roundTripSeconds).toFixed(2));
  const distanceTraveledKm = Math.round(clamped * oneWayDistanceKm * 2);

  let phase: LaserPulseState['phase'] = 'IDLE';
  if (clamped === 0) {
    phase = 'IDLE';
  } else if (clamped < 0.48) {
    phase = 'OUTBOUND';
  } else if (clamped <= 0.54) {
    phase = 'PRISM_REFLECTION';
  } else if (clamped < 1) {
    phase = 'INBOUND';
  } else {
    phase = 'COMPLETE';
  }

  return {
    progress: clamped,
    elapsedSeconds,
    distanceTraveledKm,
    oneWayDistanceKm,
    roundTripSeconds,
    phase,
    annualRecessionCm: 3.8,
  };
}

/**
 * Grades the 4-question interactive Explorer Challenge.
 */
export function gradeExplorerQuiz(
  selectedAnswers: (number | null)[],
  correctAnswers: number[] = [1, 2, 0, 1]
): {
  complete: boolean;
  score: number;
  total: number;
  resultsPerQuestion: boolean[];
} {
  const total = correctAnswers.length;
  const complete =
    selectedAnswers.length === total && selectedAnswers.every((ans) => ans !== null && ans !== undefined);

  const resultsPerQuestion = correctAnswers.map((correct, idx) => selectedAnswers[idx] === correct);
  const score = resultsPerQuestion.filter(Boolean).length;

  return {
    complete,
    score,
    total,
    resultsPerQuestion,
  };
}
