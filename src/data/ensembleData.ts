/**
 * @license
 * CycloCast NWP - Phase 5: Next-Gen Dynamical Core & Ensemble Prediction System (CycloCast-EPS)
 * Unstructured Voronoi mesh parameters, 10-member ensemble perturbation matrix,
 * probabilistic threshold fields, and spread-skill diagnostics.
 */

export interface EnsembleMember {
  memberId: string;
  name: string;
  type: 'control' | 'initial_perturbation' | 'physics_perturbation' | 'boundary_perturbation';
  perturbationMethod: string;
  microphysics: string;
  pblScheme: string;
  boundarySource: string;
  weight: number;
}

export const ENSEMBLE_MEMBERS: EnsembleMember[] = [
  { memberId: 'm00_ctl', name: 'Member 00 (Control)', type: 'control', perturbationMethod: 'Unperturbed 3D-Var Analysis', microphysics: 'WSM6', pblScheme: 'YSU', boundarySource: 'NOAA GFS 0.25° (12Z)', weight: 0.15 },
  { memberId: 'm01_ic1', name: 'Member 01 (IC+)', type: 'initial_perturbation', perturbationMethod: 'EnKF Leading Lyapunov Vector +1σ (Arabian Sea)', microphysics: 'WSM6', pblScheme: 'YSU', boundarySource: 'NOAA GFS 0.25°', weight: 0.10 },
  { memberId: 'm02_ic2', name: 'Member 02 (IC-)', type: 'initial_perturbation', perturbationMethod: 'EnKF Leading Lyapunov Vector -1σ (Arabian Sea)', microphysics: 'WSM6', pblScheme: 'YSU', boundarySource: 'NOAA GFS 0.25°', weight: 0.10 },
  { memberId: 'm03_ic3', name: 'Member 03 (IC-BoB)', type: 'initial_perturbation', perturbationMethod: 'Singular Vector moisture perturbation in Bay of Bengal', microphysics: 'Thompson', pblScheme: 'YSU', boundarySource: 'NOAA GFS 0.25°', weight: 0.10 },
  { memberId: 'm04_phy1', name: 'Member 04 (Multi-Phys)', type: 'physics_perturbation', perturbationMethod: 'Thompson double-moment + MYNN2.5 prognostic TKE', microphysics: 'Thompson', pblScheme: 'MYNN 2.5', boundarySource: 'NOAA GFS 0.25°', weight: 0.10 },
  { memberId: 'm05_phy2', name: 'Member 05 (Multi-Phys)', type: 'physics_perturbation', perturbationMethod: 'Morrison 2-moment + Shin-Hong scale-aware PBL', microphysics: 'Morrison', pblScheme: 'Shin-Hong', boundarySource: 'NOAA GFS 0.25°', weight: 0.10 },
  { memberId: 'm06_stoch1', name: 'Member 06 (SKEBS)', type: 'physics_perturbation', perturbationMethod: 'Stochastic Kinetic Energy Backscatter Scheme (SKEBS)', microphysics: 'WSM6', pblScheme: 'YSU + Stoch', boundarySource: 'NOAA GFS 0.25°', weight: 0.09 },
  { memberId: 'm07_stoch2', name: 'Member 07 (SPPT)', type: 'physics_perturbation', perturbationMethod: 'Stochastically Perturbed Parameterization Tendencies (SPPT)', microphysics: 'WSM6', pblScheme: 'YSU + SPPT', boundarySource: 'NOAA GFS 0.25°', weight: 0.09 },
  { memberId: 'm08_lbc1', name: 'Member 08 (ECMWF LBC)', type: 'boundary_perturbation', perturbationMethod: 'ECMWF IFS OpenData lateral boundary forcing', microphysics: 'WSM6', pblScheme: 'YSU', boundarySource: 'ECMWF IFS OpenData', weight: 0.09 },
  { memberId: 'm09_lbc2', name: 'Member 09 (Shifted LBC)', type: 'boundary_perturbation', perturbationMethod: 'GFS 06Z lagged cycle with temporal offset', microphysics: 'Thompson', pblScheme: 'MYNN 2.5', boundarySource: 'NOAA GFS (06Z Lagged)', weight: 0.08 },
];

export interface ProbabilisticGridPoint {
  lat: number;
  lon: number;
  name: string;
  probRain25mm: number;  // Probability >= 25mm in 24h (%)
  probRain64mm: number;  // Probability >= 64.5mm (Heavy Rain Warning) (%)
  probRain115mm: number; // Probability >= 115.5mm (Very Heavy Rain) (%)
  probGaleWind: number;  // Probability >= 35 kt wind (%)
  ensMeanRainMm: number;
  ensSpreadRainMm: number;
}

export const PROBABILISTIC_GRID: ProbabilisticGridPoint[] = [
  { lat: 17.9, lon: 73.7, name: 'Mahabaleshwar Crest', probRain25mm: 100, probRain64mm: 98, probRain115mm: 88, probGaleWind: 65, ensMeanRainMm: 221.4, ensSpreadRainMm: 18.5 },
  { lat: 13.5, lon: 75.1, name: 'Agumbe Escarpment', probRain25mm: 100, probRain64mm: 95, probRain115mm: 78, probGaleWind: 55, ensMeanRainMm: 181.2, ensSpreadRainMm: 15.2 },
  { lat: 19.1, lon: 72.8, name: 'Mumbai Coast', probRain25mm: 96, probRain64mm: 82, probRain115mm: 42, probGaleWind: 45, ensMeanRainMm: 115.0, ensSpreadRainMm: 14.8 },
  { lat: 15.5, lon: 73.8, name: 'Goa Coast', probRain25mm: 95, probRain64mm: 74, probRain115mm: 34, probGaleWind: 38, ensMeanRainMm: 91.8, ensSpreadRainMm: 11.4 },
  { lat: 12.9, lon: 74.8, name: 'Mangaluru Coastal', probRain25mm: 94, probRain64mm: 70, probRain115mm: 28, probGaleWind: 35, ensMeanRainMm: 88.5, ensSpreadRainMm: 10.9 },
  { lat: 10.0, lon: 76.3, name: 'Kochi (Kerala)', probRain25mm: 88, probRain64mm: 58, probRain115mm: 18, probGaleWind: 24, ensMeanRainMm: 73.2, ensSpreadRainMm: 9.8 },
  { lat: 18.5, lon: 73.9, name: 'Pune (Rainshadow)', probRain25mm: 24, probRain64mm: 8, probRain115mm: 2, probGaleWind: 10, ensMeanRainMm: 14.8, ensSpreadRainMm: 4.2 },
  { lat: 13.0, lon: 77.6, name: 'Bengaluru HAL', probRain25mm: 16, probRain64mm: 4, probRain115mm: 0, probGaleWind: 8, ensMeanRainMm: 8.1, ensSpreadRainMm: 2.8 },
  { lat: 17.4, lon: 78.5, name: 'Hyderabad Begumpet', probRain25mm: 10, probRain64mm: 2, probRain115mm: 0, probGaleWind: 6, ensMeanRainMm: 4.6, ensSpreadRainMm: 1.9 },
  { lat: 13.1, lon: 80.3, name: 'Chennai Coastal', probRain25mm: 8, probRain64mm: 2, probRain115mm: 0, probGaleWind: 5, ensMeanRainMm: 2.6, ensSpreadRainMm: 1.4 },
  { lat: 15.0, lon: 84.0, name: 'Central Bay of Bengal', probRain25mm: 82, probRain64mm: 64, probRain115mm: 30, probGaleWind: 72, ensMeanRainMm: 84.2, ensSpreadRainMm: 16.4 },
];

export interface EnsemblePlumeTimeStep {
  leadTime: string;
  leadHours: number;
  m00: number;
  m01: number;
  m02: number;
  m03: number;
  m04: number;
  m05: number;
  m06: number;
  m07: number;
  m08: number;
  m09: number;
  ensMean: number;
  p10: number;
  p90: number;
}

export const MAHABALESHWAR_PLUME_DATA: EnsemblePlumeTimeStep[] = [
  { leadTime: 'T+00h', leadHours: 0, m00: 0, m01: 0, m02: 0, m03: 0, m04: 0, m05: 0, m06: 0, m07: 0, m08: 0, m09: 0, ensMean: 0, p10: 0, p90: 0 },
  { leadTime: 'T+06h', leadHours: 6, m00: 24, m01: 26, m02: 21, m03: 25, m04: 28, m05: 30, m06: 23, m07: 24, m08: 22, m09: 25, ensMean: 24.8, p10: 21.5, p90: 29.5 },
  { leadTime: 'T+12h', leadHours: 12, m00: 62, m01: 68, m02: 56, m03: 64, m04: 72, m05: 78, m06: 59, m07: 63, m08: 58, m09: 65, ensMean: 64.5, p10: 56.5, p90: 76.5 },
  { leadTime: 'T+18h', leadHours: 18, m00: 118, m01: 126, m02: 106, m03: 122, m04: 134, m05: 144, m06: 114, m07: 120, m08: 112, m09: 124, ensMean: 122.0, p10: 108.0, p90: 141.0 },
  { leadTime: 'T+24h', leadHours: 24, m00: 226, m01: 238, m02: 204, m03: 230, m04: 248, m05: 262, m06: 218, m07: 224, m08: 214, m09: 232, ensMean: 229.6, p10: 206.0, p90: 258.0 },
  { leadTime: 'T+36h', leadHours: 36, m00: 310, m01: 328, m02: 284, m03: 318, m04: 342, m05: 360, m06: 302, m07: 312, m08: 298, m09: 322, ensMean: 317.6, p10: 288.0, p90: 355.0 },
  { leadTime: 'T+48h', leadHours: 48, m00: 385, m01: 410, m02: 352, m03: 395, m04: 425, m05: 450, m06: 374, m07: 388, m08: 370, m09: 402, ensMean: 395.1, p10: 358.0, p90: 442.0 },
  { leadTime: 'T+60h', leadHours: 60, m00: 442, m01: 472, m02: 405, m03: 456, m04: 490, m05: 520, m06: 430, m07: 448, m08: 426, m09: 462, ensMean: 455.1, p10: 412.0, p90: 510.0 },
  { leadTime: 'T+72h', leadHours: 72, m00: 495, m01: 532, m02: 450, m03: 510, m04: 550, m05: 585, m06: 480, m07: 502, m08: 476, m09: 518, ensMean: 509.8, p10: 460.0, p90: 575.0 },
];

export interface SpreadSkillItem {
  leadHours: number;
  ensMeanRMSE: number;
  ensSpread: number;
  spreadSkillRatio: number; // Ideal = 1.00
}

export const SPREAD_SKILL_DATA: SpreadSkillItem[] = [
  { leadHours: 6, ensMeanRMSE: 1.12, ensSpread: 1.08, spreadSkillRatio: 0.96 },
  { leadHours: 12, ensMeanRMSE: 1.25, ensSpread: 1.21, spreadSkillRatio: 0.97 },
  { leadHours: 18, ensMeanRMSE: 1.38, ensSpread: 1.35, spreadSkillRatio: 0.98 },
  { leadHours: 24, ensMeanRMSE: 1.49, ensSpread: 1.47, spreadSkillRatio: 0.99 },
  { leadHours: 36, ensMeanRMSE: 1.72, ensSpread: 1.68, spreadSkillRatio: 0.98 },
  { leadHours: 48, ensMeanRMSE: 1.95, ensSpread: 1.92, spreadSkillRatio: 0.98 },
  { leadHours: 60, ensMeanRMSE: 2.22, ensSpread: 2.16, spreadSkillRatio: 0.97 },
  { leadHours: 72, ensMeanRMSE: 2.48, ensSpread: 2.40, spreadSkillRatio: 0.97 },
];
