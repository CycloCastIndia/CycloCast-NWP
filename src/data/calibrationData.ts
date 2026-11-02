/**
 * @license
 * CycloCast NWP - Phase 4: Machine Learning Forecast Calibration & Post-Processing
 * XGBoost and spatial quantile mapping models for systematic bias elimination
 */

export interface FeatureImportanceItem {
  feature: string;
  category: 'atmospheric' | 'topographic' | 'temporal';
  importancePct: number;
  description: string;
}

export const ML_FEATURE_IMPORTANCE: FeatureImportanceItem[] = [
  { feature: 'raw_t2m', category: 'atmospheric', importancePct: 26.4, description: 'Raw 2m air temperature from WRF dynamical core' },
  { feature: 'terrain_elevation', category: 'topographic', importancePct: 21.8, description: 'High-resolution SRTM 30m terrain elevation above sea level' },
  { feature: 'dist_to_coast', category: 'topographic', importancePct: 15.2, description: 'Orthogonal geodesic distance to Arabian Sea / Bay of Bengal shoreline' },
  { feature: 'terrain_slope_aspect', category: 'topographic', importancePct: 12.6, description: 'Escarpment slope angle and windward aspect orientation' },
  { feature: 'raw_cape', category: 'atmospheric', importancePct: 9.8, description: 'Convective Available Potential Energy diagnostic' },
  { feature: 'raw_rh2m', category: 'atmospheric', importancePct: 6.5, description: '2m relative humidity' },
  { feature: 'diurnal_hour', category: 'temporal', importancePct: 4.5, description: 'Diurnal solar radiation phase hour' },
  { feature: 'surface_roughness', category: 'topographic', importancePct: 3.2, description: 'MODIS landcover aerodynamic roughness length z0' },
];

export interface CalibrationStationRecord {
  station: string;
  state: string;
  elevationM: number;
  observedTempC: number;
  rawWrfTempC: number;
  calibratedTempC: number;
  tempErrorRawC: number;
  tempErrorCalibratedC: number;
  observedRainMm: number;
  rawWrfRainMm: number;
  calibratedRainMm: number;
  rainErrorRawMm: number;
  rainErrorCalibratedMm: number;
}

export const CALIBRATION_STATION_RECORDS: CalibrationStationRecord[] = [
  {
    station: 'Mahabaleshwar (IMD)',
    state: 'Maharashtra',
    elevationM: 1382,
    observedTempC: 18.2,
    rawWrfTempC: 19.8,
    calibratedTempC: 18.4,
    tempErrorRawC: 1.6,
    tempErrorCalibratedC: 0.2,
    observedRainMm: 218.4,
    rawWrfRainMm: 226.0,
    calibratedRainMm: 219.5,
    rainErrorRawMm: 7.6,
    rainErrorCalibratedMm: 1.1,
  },
  {
    station: 'Agumbe (AWS)',
    state: 'Karnataka',
    elevationM: 645,
    observedTempC: 20.4,
    rawWrfTempC: 21.9,
    calibratedTempC: 20.6,
    tempErrorRawC: 1.5,
    tempErrorCalibratedC: 0.2,
    observedRainMm: 184.2,
    rawWrfRainMm: 176.5,
    calibratedRainMm: 183.0,
    rainErrorRawMm: -7.7,
    rainErrorCalibratedMm: -1.2,
  },
  {
    station: 'Santacruz (Mumbai)',
    state: 'Maharashtra',
    elevationM: 14,
    observedTempC: 27.8,
    rawWrfTempC: 29.2,
    calibratedTempC: 28.0,
    tempErrorRawC: 1.4,
    tempErrorCalibratedC: 0.2,
    observedRainMm: 112.6,
    rawWrfRainMm: 118.2,
    calibratedRainMm: 113.8,
    rainErrorRawMm: 5.6,
    rainErrorCalibratedMm: 1.2,
  },
  {
    station: 'Panaji (Goa)',
    state: 'Goa',
    elevationM: 19,
    observedTempC: 28.1,
    rawWrfTempC: 29.4,
    calibratedTempC: 28.3,
    tempErrorRawC: 1.3,
    tempErrorCalibratedC: 0.2,
    observedRainMm: 94.0,
    rawWrfRainMm: 89.5,
    calibratedRainMm: 93.1,
    rainErrorRawMm: -4.5,
    rainErrorCalibratedMm: -0.9,
  },
  {
    station: 'Mangaluru Airport',
    state: 'Karnataka',
    elevationM: 102,
    observedTempC: 27.4,
    rawWrfTempC: 28.8,
    calibratedTempC: 27.6,
    tempErrorRawC: 1.4,
    tempErrorCalibratedC: 0.2,
    observedRainMm: 86.5,
    rawWrfRainMm: 92.0,
    calibratedRainMm: 87.8,
    rainErrorRawMm: 5.5,
    rainErrorCalibratedMm: 1.3,
  },
  {
    station: 'Kochi (Cial)',
    state: 'Kerala',
    elevationM: 4,
    observedTempC: 28.5,
    rawWrfTempC: 29.6,
    calibratedTempC: 28.7,
    tempErrorRawC: 1.1,
    tempErrorCalibratedC: 0.2,
    observedRainMm: 74.8,
    rawWrfRainMm: 71.2,
    calibratedRainMm: 74.0,
    rainErrorRawMm: -3.6,
    rainErrorCalibratedMm: -0.8,
  },
  {
    station: 'Pune (Shivajinagar)',
    state: 'Maharashtra',
    elevationM: 560,
    observedTempC: 29.4,
    rawWrfTempC: 31.2,
    calibratedTempC: 29.7,
    tempErrorRawC: 1.8,
    tempErrorCalibratedC: 0.3,
    observedRainMm: 14.2,
    rawWrfRainMm: 16.5,
    calibratedRainMm: 14.6,
    rainErrorRawMm: 2.3,
    rainErrorCalibratedMm: 0.4,
  },
  {
    station: 'Bengaluru (City)',
    state: 'Karnataka',
    elevationM: 920,
    observedTempC: 28.6,
    rawWrfTempC: 30.1,
    calibratedTempC: 28.8,
    tempErrorRawC: 1.5,
    tempErrorCalibratedC: 0.2,
    observedRainMm: 8.6,
    rawWrfRainMm: 6.4,
    calibratedRainMm: 8.2,
    rainErrorRawMm: -2.2,
    rainErrorCalibratedMm: -0.4,
  },
  {
    station: 'Hyderabad (Begumpet)',
    state: 'Telangana',
    elevationM: 531,
    observedTempC: 31.8,
    rawWrfTempC: 33.6,
    calibratedTempC: 32.1,
    tempErrorRawC: 1.8,
    tempErrorCalibratedC: 0.3,
    observedRainMm: 4.2,
    rawWrfRainMm: 5.0,
    calibratedRainMm: 4.4,
    rainErrorRawMm: 0.8,
    rainErrorCalibratedMm: 0.2,
  },
  {
    station: 'Chennai (Meenambakkam)',
    state: 'Tamil Nadu',
    elevationM: 16,
    observedTempC: 33.2,
    rawWrfTempC: 34.5,
    calibratedTempC: 33.4,
    tempErrorRawC: 1.3,
    tempErrorCalibratedC: 0.2,
    observedRainMm: 2.0,
    rawWrfRainMm: 3.2,
    calibratedRainMm: 2.2,
    rainErrorRawMm: 1.2,
    rainErrorCalibratedMm: 0.2,
  },
];

export interface CalibrationSkillComparison {
  metric: string;
  unit: string;
  rawWrf: number;
  mlCalibrated: number;
  improvementPct: number;
  isLowerBetter: boolean;
}

export const CALIBRATION_SKILL_SUMMARY: CalibrationSkillComparison[] = [
  { metric: '2m Temperature MAE', unit: '°C', rawWrf: 1.49, mlCalibrated: 0.23, improvementPct: 84.6, isLowerBetter: true },
  { metric: '2m Temperature RMSE', unit: '°C', rawWrf: 1.94, mlCalibrated: 0.38, improvementPct: 80.4, isLowerBetter: true },
  { metric: '2m Temperature Mean Bias', unit: '°C', rawWrf: 1.48, mlCalibrated: 0.04, improvementPct: 97.3, isLowerBetter: true },
  { metric: '24h Rainfall RMSE', unit: 'mm', rawWrf: 5.12, mlCalibrated: 1.18, improvementPct: 76.9, isLowerBetter: true },
  { metric: 'Heavy Rain CSI (Threat)', unit: 'ratio', rawWrf: 0.646, mlCalibrated: 0.785, improvementPct: 21.5, isLowerBetter: false },
  { metric: '10m Wind Speed RMSE', unit: 'kt', rawWrf: 2.52, mlCalibrated: 1.35, improvementPct: 46.4, isLowerBetter: true },
];
