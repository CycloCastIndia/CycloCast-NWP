/**
 * @license
 * CycloCast NWP - Independent Numerical Weather Prediction System
 * Scientific Architecture & Operations Platform
 */

export type ProjectionType = 'lambert' | 'mercator' | 'polar';

export interface RegionalDomain {
  id: string;
  name: string;
  parentDomainId?: string;
  nestLevel: 1 | 2 | 3;
  resolutionKm: number;
  gridPointsX: number;
  gridPointsY: number;
  centerLat: number;
  centerLon: number;
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  projection: ProjectionType;
  trueLat1: number;
  trueLat2: number;
  standLon: number;
  targetFocus: string;
  estimatedMemoryGB: number;
  estimatedCoreHoursPer24h: number;
  status: 'operational_ready' | 'experimental' | 'planned';
}

export interface PhysicsSuiteConfig {
  id: string;
  name: string;
  description: string;
  microphysics: string; // mp_physics (e.g. WSM6, Thompson, Morrison)
  cumulus: string; // cu_physics (e.g. Kain-Fritsch, Grell-Freitas, None for dx < 4km)
  pbl: string; // bl_pbl_physics (e.g. YSU, MYNN2.5)
  radiationLongwave: string; // ra_lw_physics (e.g. RRTMG)
  radiationShortwave: string; // ra_sw_physics (e.g. RRTMG)
  surfaceLayer: string; // sf_sfclay_physics (e.g. Revised MM5, Monin-Obukhov)
  landSurface: string; // sf_surface_physics (e.g. Noah-MP, Unified Noah)
  recommendedDx: string;
  monsoonSuitability: 'High' | 'Moderate' | 'Experimental';
}

export type VariableCategory = 'surface' | 'pressure_level' | 'derived';

export interface MeteorologicalVariable {
  id: string;
  name: string;
  shortName: string;
  unit: string;
  category: VariableCategory;
  description: string;
  pressureLevel?: number; // in hPa if applicable
  range: [number, number];
  colorPalette: string;
}

export interface IngestionDataset {
  id: string;
  name: string;
  sourceOrg: string;
  datasetType: 'initial_boundary' | 'satellite' | 'surface_obs' | 'upper_air' | 'reanalysis';
  format: 'GRIB2' | 'HDF5' | 'BUFR' | 'NetCDF4' | 'CSV';
  spatialResolution: string;
  temporalFrequency: string;
  latencyMinutes: number;
  licensing: string;
  status: 'online' | 'delayed' | 'offline';
  lastFileTimestamp: string;
  checksumStatus: 'verified' | 'pending' | 'corrupt';
  spatialCoverage: string;
  variablesProvided: string[];
}

export interface ForecastRunRecord {
  runId: string;
  initTime: string; // UTC ISO
  domainId: string;
  physicsSuiteId: string;
  boundarySource: string;
  forecastLengthHours: number;
  timestepSeconds: number;
  coresAllocated: number;
  executionStatus: 'completed' | 'running' | 'queued' | 'failed' | 'simulated_benchmark';
  isRealExecution: boolean;
  notes: string;
  outputFileSizeGB: number;
  runDurationMinutes: number;
}

export interface SoundingLevel {
  pressureHpa: number;
  heightMeters: number;
  temperatureC: number;
  dewPointC: number;
  windSpeedKt: number;
  windDirectionDeg: number;
  verticalVelocityPaS: number;
  relativeHumidityPct: number;
}

export interface RadiosondeStation {
  id: string;
  wmoId: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  elevationM: number;
  sounding: SoundingLevel[];
  indices: {
    capeJkg: number;
    cinJkg: number;
    lclMeters: number;
    lfcMeters: number;
    kIndex: number;
    totalTotals: number;
    precipitableWaterMm: number;
  };
}

export interface ContingencyMetrics {
  thresholdLabel: string;
  thresholdMm: number;
  hits: number;
  misses: number;
  falseAlarms: number;
  correctNegatives: number;
  pod: number; // Probability of Detection
  far: number; // False Alarm Ratio
  csi: number; // Critical Success Index (Threat Score)
  frequencyBias: number; // Bias
}

export interface ContinuousMetrics {
  leadTimeHours: number;
  temp2mMAE: number;
  temp2mRMSE: number;
  temp2mBias: number;
  wind10mRMSE: number;
  mslpMAE: number;
  rh2mRMSE: number;
  sampleCount: number;
}
