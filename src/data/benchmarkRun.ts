/**
 * @license
 * CycloCast NWP - Demonstration Benchmark Simulation Run
 *
 * SCIENTIFIC HONESTY NOTICE:
 * This dataset represents a calibrated synthetic meteorological benchmark run
 * (Simulating a Western Ghats Heavy Monsoon Orographic Surge and Peninsular Convergence Event).
 * Used for operational interface demonstration, visual calibration, and postprocessing verification pipelines.
 * It is NOT claimed as a real-time cluster execution output.
 */

import { ForecastRunRecord } from '../types/nwp';

export const BENCHMARK_RUN_META: ForecastRunRecord = {
  runId: 'CYCLOCAST-EXP-20261101-12Z-WG3KM',
  initTime: '2026-11-01T12:00:00Z',
  domainId: 'd03_western_ghats',
  physicsSuiteId: 'cyclocast_tropical_convection_v1',
  boundarySource: 'NOAA GFS 0.25° (Cycle: 2026-11-01 12Z)',
  forecastLengthHours: 72,
  timestepSeconds: 18, // CFL rule: dt <= 6 * dx_km (18s for 3km)
  coresAllocated: 64,
  executionStatus: 'simulated_benchmark',
  isRealExecution: false,
  notes: 'Calibrated synthetic benchmark for Western Ghats high-res orographic rainfall and Arabian Sea low-level jet advection.',
  outputFileSizeGB: 18.4,
  runDurationMinutes: 142,
};

export const PREVIOUS_RUNS: ForecastRunRecord[] = [
  {
    ...BENCHMARK_RUN_META,
  },
  {
    runId: 'CYCLOCAST-EXP-20261101-00Z-INDIA27',
    initTime: '2026-11-01T00:00:00Z',
    domainId: 'd01_india',
    physicsSuiteId: 'cyclocast_tropical_convection_v1',
    boundarySource: 'NOAA GFS 0.25° (Cycle: 2026-11-01 00Z)',
    forecastLengthHours: 72,
    timestepSeconds: 150,
    coresAllocated: 32,
    executionStatus: 'simulated_benchmark',
    isRealExecution: false,
    notes: 'Subcontinental synoptic mother domain benchmark with Grell-Freitas cumulus parameterization.',
    outputFileSizeGB: 6.8,
    runDurationMinutes: 48,
  },
  {
    runId: 'CYCLOCAST-EXP-20261031-12Z-MK3KM',
    initTime: '2026-10-31T12:00:00Z',
    domainId: 'd03_maharashtra_konkan',
    physicsSuiteId: 'cyclocast_orographic_extreme_v1',
    boundarySource: 'ECMWF IFS OpenData (Cycle: 2026-10-31 12Z)',
    forecastLengthHours: 48,
    timestepSeconds: 18,
    coresAllocated: 64,
    executionStatus: 'simulated_benchmark',
    isRealExecution: false,
    notes: 'High-resolution Konkan coastal convergence trial with Morrison 2-moment microphysics.',
    outputFileSizeGB: 12.2,
    runDurationMinutes: 110,
  },
  {
    runId: 'CYCLOCAST-EXP-20261030-00Z-BOB9KM',
    initTime: '2026-10-30T00:00:00Z',
    domainId: 'd02_bay_of_bengal',
    physicsSuiteId: 'cyclocast_cyclogenesis_marine_v1',
    boundarySource: 'NOAA GFS 0.25°',
    forecastLengthHours: 96,
    timestepSeconds: 54,
    coresAllocated: 48,
    executionStatus: 'simulated_benchmark',
    isRealExecution: false,
    notes: 'Bay of Bengal tropical low-pressure disturbance tracking trial.',
    outputFileSizeGB: 15.6,
    runDurationMinutes: 135,
  },
];

export interface GridPointValue {
  lat: number;
  lon: number;
  name?: string;
  rainAccumMm: number;
  rainRateMmh: number;
  temp2mC: number;
  tmaxC: number;
  tminC: number;
  windSpeedKt: number;
  windDirDeg: number;
  u10Ms: number;
  v10Ms: number;
  mslpHpa: number;
  psfcHpa: number;
  rh2mPct: number;
  dewPointC: number;
  cloudCoverPct: number;
  capeJkg: number;
  rainConvectiveMm: number;
  gh500Gpm: number;
  w850Pas: number;
}

// Generate realistic spatial grid points for South India and Western Ghats / Konkan
export function generateForecastGrid(leadTimeHours: number, variableId: string): GridPointValue[] {
  // Bounding box: 8°N - 22°N, 71°E - 85°E
  const lats = [8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5, 15.5, 16.5, 17.5, 18.5, 19.5, 20.5, 21.5];
  const lons = [71.5, 72.5, 73.5, 74.5, 75.5, 76.5, 77.5, 78.5, 79.5, 80.5, 81.5, 82.5, 83.5, 84.5];

  const grid: GridPointValue[] = [];
  const timeFactor = (leadTimeHours / 24);

  for (const lat of lats) {
    for (const lon of lons) {
      // Is coastal/Ghats region?
      const isWesternCoast = lon >= 72.8 && lon <= 74.2 && lat >= 9.0 && lat <= 19.5;
      const isWesternGhatsRidge = lon >= 74.3 && lon <= 75.5 && lat >= 9.5 && lat <= 18.5;
      const isDeccanRainshadow = lon >= 76.0 && lon <= 78.5 && lat >= 12.0 && lat <= 19.0;
      const isBayCoast = lon >= 79.5 && lon <= 83.5 && lat >= 10.0 && lat <= 17.5;
      const isOceanArabian = lon < 73.0;

      // Realistic meteorological physics calculations:
      // Orographic precipitation enhancement on windward crest
      let baseRainRate = 1.2;
      if (isWesternGhatsRidge) {
        baseRainRate = 8.5 + Math.sin(lat * 0.8) * 3.5;
      } else if (isWesternCoast) {
        baseRainRate = 5.0 + Math.cos(lat * 0.5) * 2.0;
      } else if (isDeccanRainshadow) {
        baseRainRate = 0.4;
      } else if (isBayCoast) {
        baseRainRate = 2.1 + (leadTimeHours > 36 ? 3.0 : 0);
      }

      // Add diurnal oscillation (monsoon convection peaks afternoon/evening over land, early morning offshore)
      const diurnalHour = (leadTimeHours + 17) % 24; // 12Z init is 17:30 IST
      const diurnalPeak = Math.max(0, Math.sin((diurnalHour - 14) * (Math.PI / 12)));
      const rainRate = Math.max(0, Number((baseRainRate * (0.6 + 0.8 * diurnalPeak)).toFixed(1)));

      // Accumulated rainfall grows over lead time
      const rainAccum = Math.round(rainRate * Math.min(leadTimeHours, 6) + (timeFactor * baseRainRate * 22));
      const rainConvective = Math.round(rainAccum * (isWesternGhatsRidge ? 0.35 : 0.65));

      // 2m Temperature: cooler over Ghats & coast due to cloud/rain, warmer inland Deccan
      let baseTemp = 28.5;
      if (isWesternGhatsRidge) baseTemp = 21.0;
      else if (isDeccanRainshadow) baseTemp = 32.5;
      else if (isWesternCoast) baseTemp = 27.2;
      const tempDiurnal = Math.sin((diurnalHour - 9) * (Math.PI / 12)) * 4.5;
      const temp2m = Number((baseTemp + tempDiurnal - (rainRate > 5 ? 2.5 : 0)).toFixed(1));
      const tmax = Number((baseTemp + 4.5).toFixed(1));
      const tmin = Number((baseTemp - 3.8).toFixed(1));

      // Wind: Strong Arabian Sea southwesterly LLJ (low level jet)
      let windSpeed = 16.0;
      let windDir = 245; // Southwesterly 245°
      if (isOceanArabian) {
        windSpeed = 28.0 + Math.sin(lat * 0.4) * 6;
        windDir = 250;
      } else if (isWesternGhatsRidge) {
        windSpeed = 22.0;
        windDir = 260;
      } else if (isDeccanRainshadow) {
        windSpeed = 12.0;
        windDir = 270;
      }

      const windRad = (windDir * Math.PI) / 180;
      const u10 = Number((-windSpeed * 0.5144 * Math.sin(windRad)).toFixed(1));
      const v10 = Number((-windSpeed * 0.5144 * Math.cos(windRad)).toFixed(1));

      // MSLP: Monsoon gradient from South (1010 hPa) to North (998 hPa monsoon depression)
      const latGradient = (lat - 8.0) * -0.85;
      const mslp = Number((1010.5 + latGradient - (timeFactor * 1.5)).toFixed(1));
      const elevation = isWesternGhatsRidge ? 950 : (isDeccanRainshadow ? 600 : 25);
      const psfc = Number((mslp * Math.exp(-elevation / 8400)).toFixed(1));

      // Humidity & Dewpoint
      const rh2m = isWesternCoast || isWesternGhatsRidge ? Math.min(98, Math.round(88 + rainRate * 1.5)) : Math.round(62 + diurnalPeak * 15);
      const dewPoint = Number((temp2m - ((100 - rh2m) / 5)).toFixed(1));
      const cloudCover = Math.min(100, Math.round(rh2m * 0.95 + (rainRate > 2 ? 20 : 0)));

      // CAPE & Instability
      const cape = Math.round(Math.max(200, (3000 - (isWesternGhatsRidge ? 1200 : 0)) * (rh2m / 100) * (diurnalPeak + 0.3)));
      const gh500 = Math.round(5840 + (lat - 12) * 5);
      const w850 = Number((-(rainRate * 0.12) - (isWesternGhatsRidge ? 0.8 : 0.05)).toFixed(2));

      grid.push({
        lat,
        lon,
        rainAccumMm: rainAccum,
        rainRateMmh: rainRate,
        temp2mC: temp2m,
        tmaxC: tmax,
        tminC: tmin,
        windSpeedKt: Math.round(windSpeed),
        windDirDeg: windDir,
        u10Ms: u10,
        v10Ms: v10,
        mslpHpa: mslp,
        psfcHpa: psfc,
        rh2mPct: rh2m,
        dewPointC: dewPoint,
        cloudCoverPct: cloudCover,
        capeJkg: cape,
        rainConvectiveMm: rainConvective,
        gh500Gpm: gh500,
        w850Pas: w850,
      });
    }
  }

  return grid;
}

// Major station landmark coordinates for spatial overlay
export const INDIAN_CITIES_LANDMARKS = [
  { name: 'Mumbai', lat: 18.93, lon: 72.83, type: 'coastal_metro' },
  { name: 'Pune', lat: 18.52, lon: 73.85, type: 'leeward_ghats' },
  { name: 'Mahabaleshwar', lat: 17.92, lon: 73.66, type: 'orographic_crest' },
  { name: 'Goa (Panaji)', lat: 15.49, lon: 73.82, type: 'coastal' },
  { name: 'Mangaluru', lat: 12.91, lon: 74.85, type: 'coastal' },
  { name: 'Agumbe', lat: 13.50, lon: 75.09, type: 'high_rain_orography' },
  { name: 'Bengaluru', lat: 12.97, lon: 77.59, type: 'plateau' },
  { name: 'Kochi', lat: 9.93, lon: 76.26, type: 'coastal' },
  { name: 'Thiruvananthapuram', lat: 8.52, lon: 76.93, type: 'coastal_south' },
  { name: 'Chennai', lat: 13.08, lon: 80.27, type: 'east_coast_metro' },
  { name: 'Hyderabad', lat: 17.38, lon: 78.48, type: 'deccan_interior' },
  { name: 'Visakhapatnam', lat: 17.68, lon: 83.21, type: 'bay_coast' },
];
