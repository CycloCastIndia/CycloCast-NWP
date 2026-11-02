/**
 * @license
 * CycloCast NWP - Real-Time Live Data Ingestion Service
 * Client interface for querying live IMD ground station observations,
 * NOAA GFS 0.25° global model, and ECMWF IFS 0.25° predictions.
 */

export interface LiveImdStation {
  icao: string;
  name: string;
  lat: number;
  lon: number;
  elevationM: number;
  tempC: number | null;
  dewPointC: number | null;
  windSpeedKt: number;
  windSpeedKmH: number;
  windDirDeg: number;
  mslpHpa: number;
  visibilityKm: number | null;
  weatherCondition: string;
  cloudCover: string;
  rawMetar: string;
  observationTimeUtc: string;
  qcStatus: string;
}

export interface LiveGlobalModelComparison {
  city: string;
  lat: number;
  lon: number;
  ecmwf_ifs: {
    temp2mC: number;
    mslpHpa: number;
    windSpeedKmH: number;
    windDirDeg: number;
    rainMm: number;
  };
  noaa_gfs: {
    temp2mC: number;
    mslpHpa: number;
    windSpeedKmH: number;
    windDirDeg: number;
    rainMm: number;
  };
  consensus: {
    temp2mC: number;
    spreadC: number;
  };
}

export interface LiveFeedStatus {
  status: string;
  systemTimeUtc: string;
  feeds: {
    imd_gts_network: { name: string; status: string; cachedStations: number };
    noaa_nomads_gfs: { name: string; status: string };
    ecmwf_open_data: { name: string; status: string; resolutionKm: number };
    cyclocast_core: { name: string; resolutionKm: number; status: string };
  };
}

/**
 * Fetches real-time decoded ground observations from IMD/WMO GTS airport stations
 */
export async function fetchLiveImdStations(): Promise<{
  source: string;
  cachedAt: string;
  stations: LiveImdStation[];
}> {
  const res = await fetch('/api/live/imd-stations');
  if (!res.ok) {
    throw new Error(`IMD feed error: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Fetches real-time global numerical weather prediction models (ECMWF IFS & NOAA GFS)
 */
export async function fetchLiveGlobalModels(): Promise<{
  source: string;
  cachedAt: string;
  data: {
    timestamp: string;
    models: { ecmwf: string; gfs: string };
    comparisons: LiveGlobalModelComparison[];
  };
}> {
  const res = await fetch('/api/live/global-models');
  if (!res.ok) {
    throw new Error(`Global model feed error: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Fetches operational feed status
 */
export async function fetchLiveStatus(): Promise<LiveFeedStatus> {
  const res = await fetch('/api/live/status');
  if (!res.ok) {
    throw new Error(`Status feed error: HTTP ${res.status}`);
  }
  return res.json();
}
