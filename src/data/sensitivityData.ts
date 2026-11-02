/**
 * @license
 * CycloCast NWP - Phase 2: Regional Physics Sensitivity Benchmarking
 * Multi-suite comparative experiments for the Western Ghats Heavy Monsoon Orographic Case Study
 */

export interface SensitivityExperiment {
  id: string;
  name: string;
  shortLabel: string;
  microphysics: string;
  pblScheme: string;
  cumulusScheme: string;
  landSurface: string;
  radiation: string;
  peakRainMm: number;
  meanGhatsRainMm: number;
  podHeavyRain: number; // >=64.5mm
  farHeavyRain: number;
  csiHeavyRain: number;
  tempRMSE: number;
  windRMSE: number;
  computationalCostFactor: number; // 1.0 = baseline
  physicalMechanism: string;
  gridPrecipSummary: {
    crestAccumMm: number;
    coastalAccumMm: number;
    rainshadowAccumMm: number;
  };
}

export const SENSITIVITY_EXPERIMENTS: SensitivityExperiment[] = [
  {
    id: 'exp_wsm6_ysu',
    name: 'Experiment 1: WSM6 + YSU (Operational Baseline)',
    shortLabel: 'WSM6 / YSU',
    microphysics: 'WSM6 (Single-Moment 6-Class: water vapor, cloud water, rain, cloud ice, snow, graupel)',
    pblScheme: 'YSU (Yonsei University non-local parabolic K-profile scheme)',
    cumulusScheme: 'Explicit Resolved (cu_physics = 0 at dx=3km)',
    landSurface: 'Noah-MP with dynamic vegetation',
    radiation: 'RRTMG LW/SW',
    peakRainMm: 226.0,
    meanGhatsRainMm: 148.5,
    podHeavyRain: 0.800,
    farHeavyRain: 0.229,
    csiHeavyRain: 0.646,
    tempRMSE: 1.94,
    windRMSE: 2.52,
    computationalCostFactor: 1.0,
    physicalMechanism: 'Single-moment scheme predicts bulk hydrometeor mass mixing ratios. Efficient and stable, but tends to cause slight downstream leeward advection of precipitation particles before fallout.',
    gridPrecipSummary: {
      crestAccumMm: 226,
      coastalAccumMm: 118,
      rainshadowAccumMm: 16,
    },
  },
  {
    id: 'exp_thompson_mynn',
    name: 'Experiment 2: Thompson + MYNN2.5 (Aerosol-Aware & Local TKE)',
    shortLabel: 'Thompson / MYNN',
    microphysics: 'Thompson Scheme (Double-moment for rain and ice, predictive number concentrations)',
    pblScheme: 'MYNN 2.5 (Mellor-Yamada-Nakanishi-Niino local closure using prognostic TKE)',
    cumulusScheme: 'Explicit Resolved (cu_physics = 0 at dx=3km)',
    landSurface: 'Noah-MP with slope solar radiation correction (topo_wind=1)',
    radiation: 'RRTMG LW/SW',
    peakRainMm: 248.5,
    meanGhatsRainMm: 162.0,
    podHeavyRain: 0.865,
    farHeavyRain: 0.178,
    csiHeavyRain: 0.732,
    tempRMSE: 1.68,
    windRMSE: 2.18,
    computationalCostFactor: 1.35,
    physicalMechanism: 'Predicts both hydrometeor mass and number concentration for ice and rain. Superior handling of maritime Arabian Sea cloud droplet spectra, reducing premature rainout over the coastal plain and enhancing windward orographic dumping.',
    gridPrecipSummary: {
      crestAccumMm: 248,
      coastalAccumMm: 124,
      rainshadowAccumMm: 12,
    },
  },
  {
    id: 'exp_morrison_shinhong',
    name: 'Experiment 3: Morrison 2-Moment + Shin-Hong (Extreme Orography)',
    shortLabel: 'Morrison / Shin-Hong',
    microphysics: 'Morrison 2-Moment (Full double-moment for rain, ice, snow, and graupel)',
    pblScheme: 'Shin-Hong Scale-Aware Diagnostic PBL (designed for sub-kilometer & convective scales)',
    cumulusScheme: 'Explicit Resolved (cu_physics = 0 at dx=3km)',
    landSurface: 'Noah-MP Multi-Physics with groundwater recharge',
    radiation: 'RRTMG LW/SW',
    peakRainMm: 262.0,
    meanGhatsRainMm: 174.2,
    podHeavyRain: 0.892,
    farHeavyRain: 0.162,
    csiHeavyRain: 0.764,
    tempRMSE: 1.59,
    windRMSE: 2.05,
    computationalCostFactor: 1.68,
    physicalMechanism: 'Fully resolves graupel and heavy rimed ice particle fall velocities. Essential for steep 1,500m+ Ghats escarpments (e.g. Mahabaleshwar, Agumbe) where orographic lift causes rapid collision-coalescence.',
    gridPrecipSummary: {
      crestAccumMm: 262,
      coastalAccumMm: 132,
      rainshadowAccumMm: 11,
    },
  },
];

export interface SensitivityComparisonPoint {
  station: string;
  elevationM: number;
  observedRainMm: number;
  wsm6RainMm: number;
  thompsonRainMm: number;
  morrisonRainMm: number;
}

export const SENSITIVITY_STATION_COMPARISONS: SensitivityComparisonPoint[] = [
  { station: 'Mahabaleshwar (Crest)', elevationM: 1382, observedRainMm: 218.4, wsm6RainMm: 226.0, thompsonRainMm: 221.5, morrisonRainMm: 219.8 },
  { station: 'Agumbe (Malnad Crest)', elevationM: 645, observedRainMm: 184.2, wsm6RainMm: 176.5, thompsonRainMm: 182.0, morrisonRainMm: 185.1 },
  { station: 'Santacruz (Mumbai Coast)', elevationM: 14, observedRainMm: 112.6, wsm6RainMm: 118.2, thompsonRainMm: 114.0, morrisonRainMm: 113.2 },
  { station: 'Panaji (Goa Coast)', elevationM: 19, observedRainMm: 94.0, wsm6RainMm: 89.5, thompsonRainMm: 92.4, morrisonRainMm: 93.8 },
  { station: 'Mangaluru Airport', elevationM: 102, observedRainMm: 86.5, wsm6RainMm: 92.0, thompsonRainMm: 88.2, morrisonRainMm: 87.0 },
  { station: 'Pune (Rainshadow Plateau)', elevationM: 560, observedRainMm: 14.2, wsm6RainMm: 16.5, thompsonRainMm: 13.8, morrisonRainMm: 14.0 },
  { station: 'Bengaluru (Deccan)', elevationM: 888, observedRainMm: 8.6, wsm6RainMm: 6.4, thompsonRainMm: 7.9, morrisonRainMm: 8.2 },
];
