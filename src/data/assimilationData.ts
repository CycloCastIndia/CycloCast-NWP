/**
 * @license
 * CycloCast NWP - Phase 3: Cyclo-DA Data Assimilation System
 * 3D-Var / Hybrid En3D-Var assimilation data structures, background error covariances,
 * observational quality control, and analysis increments (xa - xb)
 */

export interface AssimilationSourceStats {
  id: string;
  name: string;
  type: 'satellite_radiance' | 'satellite_amv' | 'surface_aws' | 'upper_air_rsrw';
  platform: string;
  totalObs: number;
  passedQc: number;
  rejectedGrossError: number;
  rejectedCloudContaminated: number;
  thinned: number;
  meanInnovationOB: number; // Observation minus Background (O-B)
  meanResidualOA: number;   // Observation minus Analysis (O-A)
  stdInnovationOB: number;
  stdResidualOA: number;
}

export const ASSIMILATION_SOURCES: AssimilationSourceStats[] = [
  {
    id: 'insat_3d_amv',
    name: 'INSAT-3D Atmospheric Motion Vectors (AMVs)',
    type: 'satellite_amv',
    platform: 'ISRO MOSDAC INSAT-3D (74°E geostationary slot)',
    totalObs: 8420,
    passedQc: 7350,
    rejectedGrossError: 180,
    rejectedCloudContaminated: 520,
    thinned: 370,
    meanInnovationOB: 1.42, // m/s
    meanResidualOA: 0.38,   // m/s
    stdInnovationOB: 3.85,
    stdResidualOA: 1.72,
  },
  {
    id: 'insat_3dr_sounder',
    name: 'INSAT-3DR Sounder Thermal IR Radiances',
    type: 'satellite_radiance',
    platform: 'ISRO MOSDAC INSAT-3DR (82°E geostationary slot)',
    totalObs: 12600,
    passedQc: 9840,
    rejectedGrossError: 340,
    rejectedCloudContaminated: 1820,
    thinned: 600,
    meanInnovationOB: -0.84, // Kelvin (Brightness Temp)
    meanResidualOA: -0.12,  // Kelvin
    stdInnovationOB: 2.14,
    stdResidualOA: 0.88,
  },
  {
    id: 'imd_aws_mesonet',
    name: 'IMD AWS Surface Meteorological Mesonet',
    type: 'surface_aws',
    platform: 'IMD National Data Centre Surface Network (~1,200 stations)',
    totalObs: 3640,
    passedQc: 3410,
    rejectedGrossError: 120,
    rejectedCloudContaminated: 0,
    thinned: 110,
    meanInnovationOB: -0.62, // hPa surface pressure
    meanResidualOA: -0.08,  // hPa
    stdInnovationOB: 1.48,
    stdResidualOA: 0.45,
  },
  {
    id: 'imd_rsrw_soundings',
    name: 'IMD Upper-Air Radiosonde / Rawinsonde (RS/RW)',
    type: 'upper_air_rsrw',
    platform: 'IMD Synoptic Balloon Ascents (39 operational stations at 00Z/12Z)',
    totalObs: 1420,
    passedQc: 1380,
    rejectedGrossError: 25,
    rejectedCloudContaminated: 0,
    thinned: 15,
    meanInnovationOB: 0.35, // °C Temperature
    meanResidualOA: 0.05,  // °C
    stdInnovationOB: 1.25,
    stdResidualOA: 0.42,
  },
];

export interface CostFunctionIteration {
  iter: number;
  costJ: number;
  costJb: number; // Background term
  costJo: number; // Observation term
  gradNorm: number;
}

export const COST_FUNCTION_CONVERGENCE: CostFunctionIteration[] = [
  { iter: 0, costJ: 48200, costJb: 0, costJo: 48200, gradNorm: 1.000 },
  { iter: 5, costJ: 28400, costJb: 2100, costJo: 26300, gradNorm: 0.485 },
  { iter: 10, costJ: 18600, costJb: 3400, costJo: 15200, gradNorm: 0.242 },
  { iter: 15, costJ: 13400, costJb: 4200, costJo: 9200, gradNorm: 0.118 },
  { iter: 20, costJ: 10800, costJb: 4800, costJo: 6000, gradNorm: 0.056 },
  { iter: 25, costJ: 9400, costJb: 5100, costJo: 4300, gradNorm: 0.028 },
  { iter: 30, costJ: 8650, costJb: 5300, costJo: 3350, gradNorm: 0.014 },
  { iter: 35, costJ: 8250, costJb: 5420, costJo: 2830, gradNorm: 0.007 },
  { iter: 40, costJ: 8050, costJb: 5480, costJo: 2570, gradNorm: 0.003 },
  { iter: 45, costJ: 7980, costJb: 5510, costJo: 2470, gradNorm: 0.001 },
];

export interface AnalysisIncrementPoint {
  lat: number;
  lon: number;
  name: string;
  deltaQGkg: number;      // Moisture increment (g/kg)
  deltaTC: number;         // Temperature increment (°C)
  deltaWindMs: number;     // Horizontal wind magnitude increment (m/s)
  deltaWindDirDeg: number;
  deltaPsfcHpa: number;    // Surface pressure increment (hPa)
  primarySource: string;
}

export const ANALYSIS_INCREMENT_GRID: AnalysisIncrementPoint[] = [
  // Arabian Sea Low-Level Jet (Moisture & wind adjustments from INSAT-3D AMVs)
  { lat: 12.0, lon: 71.5, name: 'Central Arabian Sea', deltaQGkg: 2.4, deltaTC: -0.4, deltaWindMs: 3.8, deltaWindDirDeg: 245, deltaPsfcHpa: -1.2, primarySource: 'INSAT-3D AMV & Sounder' },
  { lat: 14.5, lon: 72.0, name: 'Off Konkan Coast', deltaQGkg: 1.8, deltaTC: -0.3, deltaWindMs: 2.9, deltaWindDirDeg: 250, deltaPsfcHpa: -0.9, primarySource: 'INSAT-3D AMV' },
  { lat: 10.0, lon: 73.0, name: 'Lakshadweep Waters', deltaQGkg: 2.1, deltaTC: -0.2, deltaWindMs: 3.2, deltaWindDirDeg: 240, deltaPsfcHpa: -0.8, primarySource: 'INSAT-3D Sounder' },
  
  // Western Ghats & Coastal Mesonet (IMD AWS adjustments)
  { lat: 19.1, lon: 72.8, name: 'Mumbai Coast', deltaQGkg: 0.8, deltaTC: -0.6, deltaWindMs: -1.2, deltaWindDirDeg: 230, deltaPsfcHpa: -0.5, primarySource: 'IMD AWS + RS/RW' },
  { lat: 17.9, lon: 73.7, name: 'Mahabaleshwar Crest', deltaQGkg: 1.4, deltaTC: -0.8, deltaWindMs: 1.8, deltaWindDirDeg: 260, deltaPsfcHpa: -1.4, primarySource: 'IMD AWS Station' },
  { lat: 15.5, lon: 73.8, name: 'Goa Coast', deltaQGkg: 1.1, deltaTC: -0.5, deltaWindMs: 0.9, deltaWindDirDeg: 255, deltaPsfcHpa: -0.6, primarySource: 'IMD AWS Station' },
  { lat: 13.5, lon: 75.1, name: 'Agumbe Escarpment', deltaQGkg: 1.6, deltaTC: -0.7, deltaWindMs: 2.1, deltaWindDirDeg: 260, deltaPsfcHpa: -1.1, primarySource: 'IMD AWS Station' },
  { lat: 9.9, lon: 76.3, name: 'Kochi Harbour', deltaQGkg: 0.9, deltaTC: -0.3, deltaWindMs: 0.4, deltaWindDirDeg: 240, deltaPsfcHpa: -0.4, primarySource: 'IMD AWS + RS/RW' },
  
  // Deccan Interior & Plateau (Radiosonde & AWS corrections)
  { lat: 18.5, lon: 73.9, name: 'Pune Plateau', deltaQGkg: -0.4, deltaTC: 0.5, deltaWindMs: -0.8, deltaWindDirDeg: 270, deltaPsfcHpa: 0.2, primarySource: 'IMD AWS Station' },
  { lat: 13.0, lon: 77.6, name: 'Bengaluru HAL', deltaQGkg: -0.3, deltaTC: 0.4, deltaWindMs: -0.5, deltaWindDirDeg: 260, deltaPsfcHpa: 0.3, primarySource: 'IMD RS/RW Sounding' },
  { lat: 17.4, lon: 78.5, name: 'Hyderabad Begumpet', deltaQGkg: -0.2, deltaTC: 0.6, deltaWindMs: -0.6, deltaWindDirDeg: 275, deltaPsfcHpa: 0.4, primarySource: 'IMD RS/RW Sounding' },
  
  // Bay of Bengal & East Coast (INSAT-3DR & Coastal AWS)
  { lat: 13.1, lon: 80.3, name: 'Chennai Coastal', deltaQGkg: -0.5, deltaTC: 0.8, deltaWindMs: -1.1, deltaWindDirDeg: 120, deltaPsfcHpa: 0.5, primarySource: 'IMD AWS + RS/RW' },
  { lat: 15.0, lon: 84.0, name: 'Central Bay of Bengal', deltaQGkg: 1.5, deltaTC: -0.5, deltaWindMs: 2.4, deltaWindDirDeg: 210, deltaPsfcHpa: -1.8, primarySource: 'INSAT-3DR Sounder' },
  { lat: 17.7, lon: 83.2, name: 'Visakhapatnam Bay', deltaQGkg: 0.6, deltaTC: 0.2, deltaWindMs: 1.2, deltaWindDirDeg: 190, deltaPsfcHpa: -0.7, primarySource: 'IMD AWS Station' },
];
