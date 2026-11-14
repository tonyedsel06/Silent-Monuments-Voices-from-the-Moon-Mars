export interface InSightMissionTelemetry {
  nssdcaId: '2018-042A';
  launchDateIso: string;
  landingDateIso: string;
  finalContactDateIso: string;
  missionConcludedDateIso: string;
  cruiseDistanceKm: number;
  entrySpeedKmh: number;
  activeSols: number;
  activeEarthYears: number;
  activeEarthDaysRemainder: number;
  totalMarsquakesDetected: number;
  daysOnMarsTotal: number;
  daysSilentSinceFinalContact: number;
  coordinates: {
    lat: string;
    lon: string;
    elevationMola: string;
    region: string;
  };
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

export interface SeismicWaveSimulationState {
  progress: number; // 0 to 1
  pWaveRadiusKm: number;
  sWaveRadiusKm: number;
  pWaveVelocityKms: number;
  sWaveVelocityKms: number;
  sWaveBlockedByLiquidCore: boolean;
  coreRadiusKm: number;
  phaseLabelEn: string;
  phaseLabelVi: string;
}

/**
 * Computes verified NASA/NSSDCA InSight (2018-042A) mission metrics anchored to
 * the reference epoch (default 14 November 2026).
 */
export function calculateInSightTelemetry(
  referenceDateIso: string = '2026-11-14T00:00:00Z'
): InSightMissionTelemetry {
  const refMs = new Date(referenceDateIso).getTime();
  const msPerDay = 86_400_000;

  const landingMs = new Date('2018-11-26T19:52:59Z').getTime();
  const finalContactMs = new Date('2022-12-15T00:00:00Z').getTime();

  const daysOnMarsTotal = Math.max(2910, Math.round((refMs - landingMs) / msPerDay));
  const daysSilentSinceFinalContact = Math.max(1430, Math.round((refMs - finalContactMs) / msPerDay));

  return {
    nssdcaId: '2018-042A',
    launchDateIso: '2018-05-05',
    landingDateIso: '2018-11-26',
    finalContactDateIso: '2022-12-15',
    missionConcludedDateIso: '2022-12-21',
    cruiseDistanceKm: 485_000_000,
    entrySpeedKmh: 19_800,
    activeSols: 1440,
    activeEarthYears: 4,
    activeEarthDaysRemainder: 25,
    totalMarsquakesDetected: 1319,
    daysOnMarsTotal,
    daysSilentSinceFinalContact,
    coordinates: {
      lat: '4.502°N',
      lon: '135.623°E',
      elevationMola: '-2,655 m',
      region: 'Elysium Planitia',
    },
  };
}

/**
 * Computes available daily energy in Watt-hours per Martian sol based on dust cover percentage (0 to 90%).
 * Clean panels (0% dust, Dec 2018) = 5,000 Wh/sol.
 * Heavy dust (90% dust, Spring–Dec 2022) = 500 Wh/sol.
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
  const wattHoursPerSol = Math.round(5000 - dustClamped * 50);
  const percentOfInitial = Math.round((wattHoursPerSol / 5000) * 100);
  const solEstimate = Math.round(10 + (dustClamped / 90) * 1430);

  let dateLabelEn = 'Dec 2018 · Sol 10 (Clean Arrays · ~5,000 Wh/sol)';
  let dateLabelVi = 'Tháng 12/2018 · Sol 10 (Pin sạch bụi · ~5.000 Wh/sol)';

  if (dustClamped >= 80) {
    dateLabelEn = 'Apr–Dec 2022 · Sol 1211–1440 (Final Months · ~500 Wh/sol)';
    dateLabelVi = 'Tháng 4–12/2022 · Sol 1211–1440 (Những tháng cuối · ~500 Wh/sol)';
  } else if (dustClamped >= 50) {
    dateLabelEn = 'Mid 2021 · Sol 900 (Thickening Dust Coating)';
    dateLabelVi = 'Giữa 2021 · Sol 900 (Lớp bụi sắt dày dần)';
  } else if (dustClamped >= 20) {
    dateLabelEn = 'Late 2019 · Sol 380 (Regional Dust Settling)';
    dateLabelVi = 'Cuối 2019 · Sol 380 (Bụi mịn lắng đọng)';
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
 * Evaluates classroom energy allocation trade-off for InSight's scarce power budget.
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
 * Simulates Primary (P) compressional waves vs Secondary (S) shear waves
 * traveling through Mars' crust, lumpy mantle, and molten liquid iron-alloy core (radius 1,830 km).
 */
export function simulateSeismicWaves(progress: number): SeismicWaveSimulationState {
  const clamped = Math.min(1, Math.max(0, progress));
  const marsDiameterKm = 6779;
  const coreRadiusKm = 1830;
  const pWaveVelocityKms = 7.8; // Primary compressional wave (~7.8 km/s in mantle)
  const sWaveVelocityKms = 4.4; // Secondary shear wave (~4.4 km/s in mantle, 0 in liquid core)

  const pWaveRadiusKm = Math.round(clamped * marsDiameterKm);
  const sWaveRawRadius = Math.round(clamped * marsDiameterKm * (sWaveVelocityKms / pWaveVelocityKms));
  // S-waves are blocked upon reaching the liquid core boundary (~1,560 km depth)
  const coreBoundaryDepthKm = 1560;
  const sWaveBlockedByLiquidCore = sWaveRawRadius >= coreBoundaryDepthKm;
  const sWaveRadiusKm = sWaveRadiusKmClamped(sWaveRawRadius);

  let phaseLabelEn = 'Ready to trigger marsquake wavefronts';
  let phaseLabelVi = 'Sẵn sàng kích hoạt sóng địa chấn Sao Hỏa';

  if (clamped > 0 && clamped < 0.38) {
    phaseLabelEn = 'P & S waves racing through Crust (24–72 km) and Upper Mantle';
    phaseLabelVi = 'Sóng P và sóng S truyền qua Lớp Vỏ (24–72 km) và Lớp Phủ trên';
  } else if (clamped >= 0.38 && clamped < 0.85) {
    phaseLabelEn = 'P-waves refract through Liquid Core (1,830 km); S-waves blocked (Shadow Zone!)';
    phaseLabelVi = 'Sóng P khúc xạ qua Lõi Lỏng (1.830 km); Sóng S bị chặn lại (Vùng tối địa chấn!)';
  } else if (clamped >= 0.85) {
    phaseLabelEn = 'SEIS records P-wave & S-wave arrival gap on Elysium Planitia';
    phaseLabelVi = 'SEIS ghi nhận độ trễ giữa sóng P và sóng S tại Elysium Planitia';
  }

  return {
    progress: clamped,
    pWaveRadiusKm,
    sWaveRadiusKm,
    pWaveVelocityKms,
    sWaveVelocityKms,
    sWaveBlockedByLiquidCore,
    coreRadiusKm,
    phaseLabelEn,
    phaseLabelVi,
  };
}

function sWaveRadiusKmClamped(raw: number): number {
  return Math.min(3800, raw);
}

/**
 * Grades the 3-question InSight Knowledge Check on Page 10.
 */
export function gradeInSightQuiz(
  selectedAnswers: (number | null)[],
  correctAnswers: number[] = [1, 2, 0]
): {
  complete: boolean;
  score: number;
  total: number;
  resultsPerQuestion: boolean[];
} {
  const total = correctAnswers.length;
  const complete =
    selectedAnswers.length === total &&
    selectedAnswers.every((ans) => ans !== null && ans !== undefined);

  const resultsPerQuestion = correctAnswers.map((correct, idx) => selectedAnswers[idx] === correct);
  const score = resultsPerQuestion.filter(Boolean).length;

  return {
    complete,
    score,
    total,
    resultsPerQuestion,
  };
}
