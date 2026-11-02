/**
 * @license
 * CycloCast NWP - Forecast Verification Suite
 * Statistical evaluation metrics matching forecast outputs against ground-truth observational networks
 */

import { ContingencyMetrics, ContinuousMetrics } from '../types/nwp';

export const RAINFALL_CONTINGENCY_METRICS: ContingencyMetrics[] = [
  {
    thresholdLabel: 'Rain / No Rain (≥ 0.1 mm)',
    thresholdMm: 0.1,
    hits: 1420,
    misses: 98,
    falseAlarms: 145,
    correctNegatives: 820,
    pod: 0.935, // 1420 / (1420 + 98)
    far: 0.093, // 145 / (1420 + 145)
    csi: 0.854, // 1420 / (1420 + 98 + 145)
    frequencyBias: 1.030, // (1420 + 145) / (1420 + 98)
  },
  {
    thresholdLabel: 'Light Rain (≥ 2.5 mm)',
    thresholdMm: 2.5,
    hits: 980,
    misses: 112,
    falseAlarms: 130,
    correctNegatives: 1261,
    pod: 0.897,
    far: 0.117,
    csi: 0.802,
    frequencyBias: 1.016,
  },
  {
    thresholdLabel: 'Moderate Rain (≥ 15.6 mm)',
    thresholdMm: 15.6,
    hits: 412,
    misses: 68,
    falseAlarms: 74,
    correctNegatives: 1929,
    pod: 0.858,
    far: 0.152,
    csi: 0.744,
    frequencyBias: 1.013,
  },
  {
    thresholdLabel: 'Heavy Rain (≥ 64.5 mm - IMD Warning)',
    thresholdMm: 64.5,
    hits: 128,
    misses: 32,
    falseAlarms: 38,
    correctNegatives: 2285,
    pod: 0.800,
    far: 0.229,
    csi: 0.646,
    frequencyBias: 1.038,
  },
  {
    thresholdLabel: 'Very Heavy Rain (≥ 115.5 mm)',
    thresholdMm: 115.5,
    hits: 42,
    misses: 14,
    falseAlarms: 18,
    correctNegatives: 2409,
    pod: 0.750,
    far: 0.300,
    csi: 0.568,
    frequencyBias: 1.071,
  },
];

export const CONTINUOUS_LEADTIME_METRICS: ContinuousMetrics[] = [
  { leadTimeHours: 6, temp2mMAE: 1.12, temp2mRMSE: 1.48, temp2mBias: -0.22, wind10mRMSE: 1.84, mslpMAE: 0.62, rh2mRMSE: 5.8, sampleCount: 2483 },
  { leadTimeHours: 12, temp2mMAE: 1.25, temp2mRMSE: 1.62, temp2mBias: -0.28, wind10mRMSE: 2.10, mslpMAE: 0.75, rh2mRMSE: 6.4, sampleCount: 2483 },
  { leadTimeHours: 18, temp2mMAE: 1.38, temp2mRMSE: 1.78, temp2mBias: -0.34, wind10mRMSE: 2.35, mslpMAE: 0.88, rh2mRMSE: 7.1, sampleCount: 2483 },
  { leadTimeHours: 24, temp2mMAE: 1.49, temp2mRMSE: 1.94, temp2mBias: -0.41, wind10mRMSE: 2.52, mslpMAE: 1.02, rh2mRMSE: 7.8, sampleCount: 2483 },
  { leadTimeHours: 36, temp2mMAE: 1.72, temp2mRMSE: 2.24, temp2mBias: -0.52, wind10mRMSE: 2.88, mslpMAE: 1.24, rh2mRMSE: 8.9, sampleCount: 2483 },
  { leadTimeHours: 48, temp2mMAE: 1.95, temp2mRMSE: 2.56, temp2mBias: -0.64, wind10mRMSE: 3.22, mslpMAE: 1.51, rh2mRMSE: 10.2, sampleCount: 2483 },
  { leadTimeHours: 60, temp2mMAE: 2.22, temp2mRMSE: 2.89, temp2mBias: -0.78, wind10mRMSE: 3.58, mslpMAE: 1.82, rh2mRMSE: 11.6, sampleCount: 2483 },
  { leadTimeHours: 72, temp2mMAE: 2.48, temp2mRMSE: 3.21, temp2mBias: -0.92, wind10mRMSE: 3.94, mslpMAE: 2.14, rh2mRMSE: 12.9, sampleCount: 2483 },
];

export interface StationVerificationRecord {
  stationName: string;
  state: string;
  lat: number;
  lon: number;
  observedRain24hMm: number;
  forecastRain24hMm: number;
  rainErrorMm: number;
  observedTempC: number;
  forecastTempC: number;
  tempErrorC: number;
  observedWindKt: number;
  forecastWindKt: number;
}

export const STATION_VERIFICATION_RECORDS: StationVerificationRecord[] = [
  { stationName: 'Mahabaleshwar (IMD)', state: 'Maharashtra', lat: 17.92, lon: 73.66, observedRain24hMm: 218.4, forecastRain24hMm: 226.0, rainErrorMm: 7.6, observedTempC: 18.2, forecastTempC: 18.0, tempErrorC: -0.2, observedWindKt: 24, forecastWindKt: 26 },
  { stationName: 'Agumbe (AWS)', state: 'Karnataka', lat: 13.50, lon: 75.09, observedRain24hMm: 184.2, forecastRain24hMm: 176.5, rainErrorMm: -7.7, observedTempC: 20.4, forecastTempC: 21.0, tempErrorC: 0.6, observedWindKt: 22, forecastWindKt: 23 },
  { stationName: 'Santacruz (Mumbai)', state: 'Maharashtra', lat: 19.11, lon: 72.85, observedRain24hMm: 112.6, forecastRain24hMm: 118.2, rainErrorMm: 5.6, observedTempC: 27.8, forecastTempC: 27.2, tempErrorC: -0.6, observedWindKt: 20, forecastWindKt: 21 },
  { stationName: 'Panaji (Goa)', state: 'Goa', lat: 15.49, lon: 73.82, observedRain24hMm: 94.0, forecastRain24hMm: 89.5, rainErrorMm: -4.5, observedTempC: 28.1, forecastTempC: 27.6, tempErrorC: -0.5, observedWindKt: 18, forecastWindKt: 19 },
  { stationName: 'Mangaluru Airport', state: 'Karnataka', lat: 12.96, lon: 74.89, observedRain24hMm: 86.5, forecastRain24hMm: 92.0, rainErrorMm: 5.5, observedTempC: 27.4, forecastTempC: 26.9, tempErrorC: -0.5, observedWindKt: 19, forecastWindKt: 20 },
  { stationName: 'Kochi (Cial)', state: 'Kerala', lat: 10.15, lon: 76.40, observedRain24hMm: 74.8, forecastRain24hMm: 71.2, rainErrorMm: -3.6, observedTempC: 28.5, forecastTempC: 28.2, tempErrorC: -0.3, observedWindKt: 16, forecastWindKt: 17 },
  { stationName: 'Pune (Shivajinagar)', state: 'Maharashtra', lat: 18.53, lon: 73.85, observedRain24hMm: 14.2, forecastRain24hMm: 16.5, rainErrorMm: 2.3, observedTempC: 29.4, forecastTempC: 28.8, tempErrorC: -0.6, observedWindKt: 12, forecastWindKt: 13 },
  { stationName: 'Bengaluru (City)', state: 'Karnataka', lat: 12.97, lon: 77.59, observedRain24hMm: 8.6, forecastRain24hMm: 6.4, rainErrorMm: -2.2, observedTempC: 28.6, forecastTempC: 29.1, tempErrorC: 0.5, observedWindKt: 11, forecastWindKt: 12 },
  { stationName: 'Hyderabad (Begumpet)', state: 'Telangana', lat: 17.45, lon: 78.47, observedRain24hMm: 4.2, forecastRain24hMm: 5.0, rainErrorMm: 0.8, observedTempC: 31.8, forecastTempC: 32.2, tempErrorC: 0.4, observedWindKt: 10, forecastWindKt: 11 },
  { stationName: 'Chennai (Meenambakkam)', state: 'Tamil Nadu', lat: 12.99, lon: 80.18, observedRain24hMm: 2.0, forecastRain24hMm: 3.2, rainErrorMm: 1.2, observedTempC: 33.2, forecastTempC: 33.6, tempErrorC: 0.4, observedWindKt: 9, forecastWindKt: 9 },
];
